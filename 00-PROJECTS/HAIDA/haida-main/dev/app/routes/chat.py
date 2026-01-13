"""AI Chat endpoints - Copilot Studio integration"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import json
import uuid
import asyncio
import os
import time
import httpx
from app.core.supabase_client import get_supabase_client
from app.core.request_context import get_tenant_id, get_user_id
from app.core.tenants import require_tenant_membership
from app.core.limiter import rate_limit

router = APIRouter()
DIRECT_LINE_DEFAULT_ENDPOINT = os.environ.get("DIRECT_LINE_ENDPOINT", "https://directline.botframework.com/v3/directline")
DIRECT_LINE_SECRET = os.environ.get("DIRECT_LINE_SECRET", "")
LOCAL_LLM_ENDPOINT = os.environ.get("LOCAL_LLM_ENDPOINT", "http://localhost:1234/v1")
LOCAL_LLM_MODEL = os.environ.get("LOCAL_LLM_MODEL", "")
LOCAL_LLM_API_KEY = os.environ.get("LOCAL_LLM_API_KEY", "")
LOCAL_LLM_TEMPERATURE = float(os.environ.get("LOCAL_LLM_TEMPERATURE", "0.2"))
LOCAL_LLM_MAX_TOKENS = int(os.environ.get("LOCAL_LLM_MAX_TOKENS", "512"))

class MessageCreate(BaseModel):
    content: str
    provider: Optional[str] = "copilot-studio"

class ThreadCreate(BaseModel):
    title: Optional[str] = "New Conversation"
    provider: Optional[str] = "copilot-studio"

class Message(BaseModel):
    id: str
    thread_id: str
    role: str  # user, assistant, system
    content: str
    provider: str
    created_at: datetime

class Thread(BaseModel):
    id: str
    title: str
    provider: str
    message_count: int
    created_at: datetime
    updated_at: datetime

class ProviderSummary(BaseModel):
    provider: str
    is_active: bool
    config: dict
    has_direct_line_secret: bool
    has_local_model: bool
    usage_limits: dict

class ProviderUpdate(BaseModel):
    is_active: Optional[bool] = None
    direct_line_secret: Optional[str] = None
    direct_line_endpoint: Optional[str] = None
    local_model: Optional[str] = None
    local_endpoint: Optional[str] = None
    local_api_key: Optional[str] = None

def _normalize_endpoint(endpoint: str) -> str:
    return endpoint.rstrip("/")

def _append_memory_entry(
    conversation_id: str,
    user_message: str,
    assistant_response: str,
    provider: str,
    tenant_id: str,
    user_id: str
) -> None:
    memory_path = os.environ.get(
        "HAIDA_MEMORY_FILE",
        os.path.expanduser("~/.codex/memory.jsonl")
    )
    entry = {
        "ts": datetime.utcnow().isoformat(),
        "type": "chat",
        "content": f"user: {user_message}\nassistant: {assistant_response}",
        "tags": [
            "haida",
            "ai",
            f"conversation:{conversation_id}",
            f"provider:{provider}",
        ],
        "meta": {
            "conversation_id": conversation_id,
            "provider": provider,
            "tenant_id": tenant_id,
            "user_id": user_id,
        },
    }
    try:
        memory_dir = os.path.dirname(memory_path) or "."
        os.makedirs(memory_dir, exist_ok=True)
        with open(memory_path, "a", encoding="utf-8") as handle:
            handle.write(json.dumps(entry, ensure_ascii=True) + "\n")
    except Exception:
        return

async def _get_copilot_config(supabase, tenant_id: str) -> tuple[str, str]:
    config = {}
    try:
        result = supabase.table("chat_providers")\
            .select("config")\
            .eq("tenant_id", tenant_id)\
            .eq("provider", "copilot-studio")\
            .limit(1)\
            .execute()
        if result.data:
            config = result.data[0].get("config") or {}
    except Exception:
        config = {}

    secret = config.get("direct_line_secret") or DIRECT_LINE_SECRET
    endpoint = config.get("direct_line_endpoint") or DIRECT_LINE_DEFAULT_ENDPOINT
    return secret, _normalize_endpoint(endpoint)

def _sanitize_provider_row(row: dict) -> dict:
    config = row.get("config") or {}
    local_endpoint = config.get("local_endpoint") or LOCAL_LLM_ENDPOINT
    local_model = config.get("local_model") or LOCAL_LLM_MODEL
    return {
        "provider": row.get("provider"),
        "is_active": row.get("is_active", True),
        "config": {
            "direct_line_endpoint": config.get("direct_line_endpoint") or DIRECT_LINE_DEFAULT_ENDPOINT,
            "local_endpoint": local_endpoint,
            "local_model": local_model,
        },
        "has_direct_line_secret": bool(config.get("direct_line_secret") or DIRECT_LINE_SECRET),
        "has_local_model": bool(local_model),
        "usage_limits": row.get("usage_limits") or {},
    }

async def _get_local_config(supabase, tenant_id: str) -> tuple[str, str, str]:
    config = {}
    try:
        result = supabase.table("chat_providers")\
            .select("config")\
            .eq("tenant_id", tenant_id)\
            .eq("provider", "lmstudio")\
            .limit(1)\
            .execute()
        if result.data:
            config = result.data[0].get("config") or {}
    except Exception:
        config = {}

    endpoint = config.get("local_endpoint") or LOCAL_LLM_ENDPOINT
    model = config.get("local_model") or LOCAL_LLM_MODEL
    api_key = config.get("local_api_key") or LOCAL_LLM_API_KEY
    return _normalize_endpoint(endpoint), model, api_key

async def _send_local_llm_message(endpoint: str, model: str, api_key: str, user_id: str, text: str) -> str:
    if not model:
        return "Local LLM not configured (LOCAL_LLM_MODEL missing)"

    headers = {"Content-Type": "application/json"}
    if api_key:
        headers["Authorization"] = f"Bearer {api_key}"
    payload = {
        "model": model,
        "messages": [
            {"role": "system", "content": "You are HAIDA AI, a QA automation assistant."},
            {"role": "user", "content": text},
        ],
        "temperature": LOCAL_LLM_TEMPERATURE,
        "max_tokens": LOCAL_LLM_MAX_TOKENS,
    }

    async with httpx.AsyncClient(timeout=30) as client:
        response = await client.post(f"{endpoint}/chat/completions", json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()
        choices = data.get("choices") or []
        if not choices:
            return "Local LLM returned no response"
        message = choices[0].get("message") or {}
        return message.get("content") or "Local LLM returned empty response"

@router.get("/providers", response_model=List[ProviderSummary])
async def list_providers(request: Request):
    tenant_id = get_tenant_id(request)
    user_id = get_user_id(request)
    require_tenant_membership(tenant_id, user_id)
    supabase = get_supabase_client()

    result = supabase.table("chat_providers")\
        .select("*")\
        .eq("tenant_id", tenant_id)\
        .execute()

    providers = [_sanitize_provider_row(row) for row in (result.data or [])]
    if not providers:
        providers = [
            {
                "provider": "copilot-studio",
                "is_active": True,
                "config": {"direct_line_endpoint": DIRECT_LINE_DEFAULT_ENDPOINT},
                "has_direct_line_secret": bool(DIRECT_LINE_SECRET),
                "has_local_model": False,
                "usage_limits": {},
            }
        ]

    if not any(p["provider"] == "lmstudio" for p in providers):
        providers.append(
            {
                "provider": "lmstudio",
                "is_active": bool(LOCAL_LLM_MODEL),
                "config": {
                    "local_endpoint": LOCAL_LLM_ENDPOINT,
                    "local_model": LOCAL_LLM_MODEL,
                },
                "has_direct_line_secret": False,
                "has_local_model": bool(LOCAL_LLM_MODEL),
                "usage_limits": {},
            }
        )
    return providers

@router.put("/providers/{provider}", response_model=ProviderSummary)
async def update_provider(request: Request, provider: str, payload: ProviderUpdate):
    tenant_id = get_tenant_id(request)
    user_id = get_user_id(request)
    require_tenant_membership(tenant_id, user_id)

    if provider not in {"copilot-studio", "openai", "anthropic", "lmstudio"}:
        raise HTTPException(status_code=400, detail="Unsupported provider")

    supabase = get_supabase_client()
    existing = supabase.table("chat_providers")\
        .select("*")\
        .eq("tenant_id", tenant_id)\
        .eq("provider", provider)\
        .limit(1)\
        .execute()

    config = {}
    is_active = True
    if existing.data:
        config = existing.data[0].get("config") or {}
        is_active = existing.data[0].get("is_active", True)

    if payload.direct_line_secret is not None:
        config["direct_line_secret"] = payload.direct_line_secret
    if payload.direct_line_endpoint is not None:
        config["direct_line_endpoint"] = payload.direct_line_endpoint
    if payload.local_model is not None:
        config["local_model"] = payload.local_model
    if payload.local_endpoint is not None:
        config["local_endpoint"] = payload.local_endpoint
    if payload.local_api_key is not None:
        config["local_api_key"] = payload.local_api_key

    row_payload = {
        "tenant_id": tenant_id,
        "provider": provider,
        "is_active": payload.is_active if payload.is_active is not None else is_active,
        "config": config,
        "created_by": user_id,
        "updated_at": datetime.utcnow().isoformat(),
    }

    if existing.data:
        result = supabase.table("chat_providers")\
            .update({
                "is_active": row_payload["is_active"],
                "config": row_payload["config"],
                "updated_at": row_payload["updated_at"],
            })\
            .eq("tenant_id", tenant_id)\
            .eq("provider", provider)\
            .execute()
    else:
        result = supabase.table("chat_providers").insert(row_payload).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Provider update failed")

    return _sanitize_provider_row(result.data[0])

async def _ensure_conversation(supabase, tenant_id: str, thread: dict) -> dict:
    secret, endpoint = await _get_copilot_config(supabase, tenant_id)
    if not secret:
        return {"configured": False, "reason": "Direct Line secret not configured"}

    metadata = thread.get("metadata") or {}
    direct_line = metadata.get("direct_line") or {}
    conversation_id = thread.get("thread_id")
    token = direct_line.get("token")
    expires_at = direct_line.get("expires_at", 0)

    if conversation_id and token and expires_at > int(time.time()) + 30:
        return {
            "configured": True,
            "endpoint": endpoint,
            "conversation_id": conversation_id,
            "token": token,
            "watermark": direct_line.get("watermark"),
        }

    headers = {"Authorization": f"Bearer {secret}"}
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(f"{endpoint}/conversations", headers=headers)
        response.raise_for_status()
        data = response.json()

    conversation_id = data.get("conversationId")
    token = data.get("token")
    expires_in = int(data.get("expires_in") or data.get("expiresIn") or 1800)
    stream_url = data.get("streamUrl")

    direct_line = {
        "token": token,
        "expires_at": int(time.time()) + expires_in - 30,
        "stream_url": stream_url,
        "watermark": direct_line.get("watermark"),
    }
    metadata["direct_line"] = direct_line
    supabase.table("chat_threads")\
        .update({"thread_id": conversation_id, "metadata": metadata})\
        .eq("id", thread["id"])\
        .execute()

    return {
        "configured": True,
        "endpoint": endpoint,
        "conversation_id": conversation_id,
        "token": token,
        "watermark": direct_line.get("watermark"),
    }

async def _send_direct_line_message(endpoint: str, token: str, conversation_id: str, user_id: str, text: str, watermark: Optional[str]):
    headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
    payload = {
        "type": "message",
        "from": {"id": str(user_id)},
        "text": text,
    }
    async with httpx.AsyncClient(timeout=20) as client:
        post_resp = await client.post(
            f"{endpoint}/conversations/{conversation_id}/activities",
            json=payload,
            headers=headers,
        )
        post_resp.raise_for_status()

        updated_watermark = watermark
        for _ in range(4):
            params = {"watermark": updated_watermark} if updated_watermark else None
            get_resp = await client.get(
                f"{endpoint}/conversations/{conversation_id}/activities",
                params=params,
                headers=headers,
            )
            get_resp.raise_for_status()
            data = get_resp.json()
            updated_watermark = data.get("watermark", updated_watermark)
            activities = data.get("activities") or []
            bot_messages = [
                activity for activity in activities
                if activity.get("type") == "message"
                and activity.get("from", {}).get("id") != str(user_id)
            ]
            if bot_messages:
                return bot_messages[-1].get("text") or "", updated_watermark
            await asyncio.sleep(0.5)

    return None, updated_watermark

@router.get("/threads", response_model=List[Thread])
async def list_threads(request: Request):
    """List chat threads"""
    tenant_id = get_tenant_id(request)
    user_id = get_user_id(request)
    require_tenant_membership(tenant_id, user_id)
    supabase = get_supabase_client()

    threads_result = supabase.table("chat_threads")\
        .select("*")\
        .eq("tenant_id", tenant_id)\
        .eq("user_id", user_id)\
        .eq("status", "active")\
        .order("updated_at", desc=True)\
        .execute()

    threads = []
    for thread in threads_result.data or []:
        count_result = supabase.table("chat_messages")\
            .select("id", count="exact")\
            .eq("thread_id", thread["id"])\
            .execute()
        message_count = count_result.count or 0
        threads.append(Thread(
            id=thread["id"],
            title=thread.get("title") or "Conversation",
            provider=thread.get("provider") or "copilot-studio",
            message_count=message_count,
            created_at=thread.get("created_at") or datetime.utcnow(),
            updated_at=thread.get("updated_at") or datetime.utcnow()
        ))

    return threads

@router.post("/threads", response_model=Thread)
async def create_thread(request: Request, payload: ThreadCreate):
    """Create chat thread"""
    tenant_id = get_tenant_id(request)
    user_id = get_user_id(request)
    require_tenant_membership(tenant_id, user_id)
    supabase = get_supabase_client()

    title = payload.title or "New Conversation"
    provider = (payload.provider or "copilot-studio").lower()
    payload = {
        "tenant_id": tenant_id,
        "user_id": user_id,
        "title": title,
        "provider": provider,
        "status": "active",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    result = supabase.table("chat_threads").insert(payload).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Thread creation failed")
    thread = result.data[0]
    return Thread(
        id=thread["id"],
        title=thread.get("title") or "Conversation",
        provider=thread.get("provider") or "copilot-studio",
        message_count=0,
        created_at=thread.get("created_at") or datetime.utcnow(),
        updated_at=thread.get("updated_at") or datetime.utcnow()
    )

@router.get("/threads/{thread_id}/messages", response_model=List[Message])
async def list_messages(request: Request, thread_id: str):
    """List thread messages"""
    tenant_id = get_tenant_id(request)
    user_id = get_user_id(request)
    require_tenant_membership(tenant_id, user_id)
    supabase = get_supabase_client()

    thread_result = supabase.table("chat_threads")\
        .select("id,provider")\
        .eq("id", thread_id)\
        .eq("tenant_id", tenant_id)\
        .eq("user_id", user_id)\
        .execute()
    if not thread_result.data:
        raise HTTPException(status_code=404, detail="Thread not found")

    messages_result = supabase.table("chat_messages")\
        .select("*")\
        .eq("thread_id", thread_id)\
        .order("created_at", desc=False)\
        .execute()

    provider = (thread_result.data[0].get("provider") or "copilot-studio") if thread_result.data else "copilot-studio"
    messages = []
    for msg in messages_result.data or []:
        messages.append(Message(
            id=msg["id"],
            thread_id=msg["thread_id"],
            role=msg["role"],
            content=msg["content"],
            provider=provider,
            created_at=msg.get("created_at") or datetime.utcnow()
        ))

    return messages

@router.post("/threads/{thread_id}/messages", response_model=Message)
async def send_message(request: Request, thread_id: str, message: MessageCreate):
    """Send message and get AI response"""
    tenant_id = get_tenant_id(request)
    user_id = get_user_id(request)
    require_tenant_membership(tenant_id, user_id)
    rate_limit(
        user_id,
        "chat_send",
        max_calls=int(os.environ.get("RATE_LIMIT_CHAT_MAX", "30")),
        window_sec=int(os.environ.get("RATE_LIMIT_CHAT_WINDOW", "60")),
    )
    supabase = get_supabase_client()

    thread_result = supabase.table("chat_threads")\
        .select("id")\
        .eq("id", thread_id)\
        .eq("tenant_id", tenant_id)\
        .eq("user_id", user_id)\
        .execute()
    if not thread_result.data:
        raise HTTPException(status_code=404, detail="Thread not found")

    user_payload = {
        "thread_id": thread_id,
        "role": "user",
        "content": message.content,
        "content_type": "text",
        "created_at": datetime.utcnow().isoformat(),
    }
    supabase.table("chat_messages").insert(user_payload).execute()

    thread = thread_result.data[0]
    provider = (message.provider or thread.get("provider") or "copilot-studio").lower()
    if provider != (thread.get("provider") or "copilot-studio"):
        supabase.table("chat_threads")\
            .update({"provider": provider})\
            .eq("id", thread_id)\
            .execute()

    assistant_content = ""
    if provider in {"copilot-studio", "copilot"}:
        conversation = await _ensure_conversation(supabase, tenant_id, thread)
        assistant_content = "Copilot integration not configured"
        if conversation.get("configured"):
            try:
                assistant_content, watermark = await _send_direct_line_message(
                    conversation["endpoint"],
                    conversation["token"],
                    conversation["conversation_id"],
                    user_id,
                    message.content,
                    conversation.get("watermark"),
                )
                metadata = thread.get("metadata") or {}
                direct_line = metadata.get("direct_line") or {}
                direct_line["watermark"] = watermark
                metadata["direct_line"] = direct_line
                supabase.table("chat_threads")\
                    .update({"metadata": metadata})\
                    .eq("id", thread_id)\
                    .execute()
            except Exception as exc:
                assistant_content = f"Copilot integration error: {exc}"
    elif provider in {"lmstudio", "local"}:
        endpoint, model, api_key = await _get_local_config(supabase, tenant_id)
        try:
            assistant_content = await _send_local_llm_message(
                endpoint,
                model,
                api_key,
                user_id,
                message.content,
            )
        except Exception as exc:
            assistant_content = f"Local LLM error: {exc}"
    else:
        assistant_content = f"Provider not supported: {provider}"
    assistant_payload = {
        "thread_id": thread_id,
        "role": "assistant",
        "content": assistant_content or "Copilot integration returned no response",
        "content_type": "error" if "error" in (assistant_content or "").lower() else "text",
        "created_at": datetime.utcnow().isoformat(),
    }
    assistant_result = supabase.table("chat_messages").insert(assistant_payload).execute()
    if not assistant_result.data:
        raise HTTPException(status_code=500, detail="Assistant response failed")
    assistant = assistant_result.data[0]

    _append_memory_entry(
        thread_id,
        message.content,
        assistant.get("content") or assistant_content,
        provider,
        tenant_id,
        user_id,
    )

    supabase.table("chat_threads")\
        .update({"updated_at": datetime.utcnow().isoformat()})\
        .eq("id", thread_id)\
        .execute()

    return Message(
        id=assistant["id"],
        thread_id=assistant["thread_id"],
        role=assistant["role"],
        content=assistant["content"],
        provider=provider,
        created_at=assistant.get("created_at") or datetime.utcnow()
    )
