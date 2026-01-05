"""Perplexity AI Chat Integration for HAIDA"""
from fastapi import APIRouter, HTTPException, Request, Header, status
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
from datetime import datetime
import uuid
import asyncio
import os
import httpx
import logging
from app.core.supabase_client import get_supabase_client
from app.core.request_context import get_tenant_id, get_user_id
from app.core.tenants import require_tenant_membership
from app.core.limiter import rate_limit

router = APIRouter()
logger = logging.getLogger("haida.perplexity")

# Perplexity Configuration
PERPLEXITY_API_KEY = os.environ.get("PERPLEXITY_API_KEY", "")
PERPLEXITY_BASE_URL = os.environ.get("PERPLEXITY_BASE_URL", "https://api.perplexity.ai")
PERPLEXITY_MODEL = os.environ.get("PERPLEXITY_MODEL", "llama-2-70b-chat")
PERPLEXITY_MAX_TOKENS = int(os.environ.get("PERPLEXITY_MAX_TOKENS", "2048"))

# Verificar si Perplexity está configurado
PERPLEXITY_CONFIGURED = bool(PERPLEXITY_API_KEY)

class MessageCreate(BaseModel):
    content: str
    provider: Optional[str] = "perplexity"

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
    has_api_key: bool
    usage_limits: dict

class ProviderUpdate(BaseModel):
    is_active: Optional[bool] = None
    api_key: Optional[str] = None
    model: Optional[str] = None
    max_tokens: Optional[int] = None

async def _get_perplexity_config(supabase, tenant_id: str) -> tuple[str, str, int]:
    """Get Perplexity configuration from database or environment"""
    config = {}
    try:
        result = supabase.table("chat_providers")\
            .select("config")\
            .eq("tenant_id", tenant_id)\
            .eq("provider", "perplexity")\
            .limit(1)\
            .execute()
        if result.data:
            config = result.data[0].get("config") or {}
    except Exception:
        config = {}

    api_key = config.get("api_key") or PERPLEXITY_API_KEY
    model = config.get("model") or PERPLEXITY_MODEL
    max_tokens = int(config.get("max_tokens") or PERPLEXITY_MAX_TOKENS)
    return api_key, model, max_tokens

def _sanitize_provider_row(row: dict) -> dict:
    config = row.get("config") or {}
    return {
        "provider": row.get("provider"),
        "is_active": row.get("is_active", True),
        "config": {
            "model": config.get("model") or PERPLEXITY_MODEL,
            "max_tokens": int(config.get("max_tokens") or PERPLEXITY_MAX_TOKENS),
        },
        "has_api_key": bool(config.get("api_key") or PERPLEXITY_API_KEY),
        "usage_limits": row.get("usage_limits") or {},
    }

@router.get("/providers", response_model=List[ProviderSummary])
async def list_providers(request: Request):
    """List available chat providers"""
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
                "provider": "perplexity",
                "is_active": PERPLEXITY_CONFIGURED,
                "config": {
                    "model": PERPLEXITY_MODEL,
                    "max_tokens": PERPLEXITY_MAX_TOKENS,
                },
                "has_api_key": PERPLEXITY_CONFIGURED,
                "usage_limits": {},
            }
        ]
    return providers

@router.put("/providers/{provider}", response_model=ProviderSummary)
async def update_provider(request: Request, provider: str, payload: ProviderUpdate):
    """Update chat provider configuration"""
    tenant_id = get_tenant_id(request)
    user_id = get_user_id(request)
    require_tenant_membership(tenant_id, user_id)

    if provider not in {"perplexity", "copilot-studio", "openai", "anthropic"}:
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

    if payload.api_key is not None:
        config["api_key"] = payload.api_key
    if payload.model is not None:
        config["model"] = payload.model
    if payload.max_tokens is not None:
        config["max_tokens"] = payload.max_tokens

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
        .eq("provider", "perplexity")\
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
            title=thread.get("title") or "Perplexity Conversation",
            provider="perplexity",
            message_count=message_count,
            created_at=thread.get("created_at") or datetime.utcnow(),
            updated_at=thread.get("updated_at") or datetime.utcnow()
        ))

    return threads

@router.post("/threads", response_model=Thread)
async def create_thread(request: Request, title: Optional[str] = "New Conversation"):
    """Create chat thread"""
    tenant_id = get_tenant_id(request)
    user_id = get_user_id(request)
    require_tenant_membership(tenant_id, user_id)
    supabase = get_supabase_client()

    payload = {
        "tenant_id": tenant_id,
        "user_id": user_id,
        "title": title,
        "provider": "perplexity",
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
        provider="perplexity",
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
        .select("id")\
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

    messages = []
    for msg in messages_result.data or []:
        messages.append(Message(
            id=msg["id"],
            thread_id=msg["thread_id"],
            role=msg["role"],
            content=msg["content"],
            provider="perplexity",
            created_at=msg.get("created_at") or datetime.utcnow()
        ))

    return messages

async def _call_perplexity_api(api_key: str, model: str, max_tokens: int, messages: List[Dict[str, str]]) -> str:
    """Call Perplexity AI API and return response"""
    if not api_key:
        logger.error("Perplexity API key not configured")
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail="Perplexity API key not configured"
        )

    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json"
    }

    payload = {
        "model": model,
        "messages": messages,
        "max_tokens": max_tokens,
        "temperature": 0.7,
    }

    try:
        logger.info(f"Calling Perplexity API with model={model}, messages={len(messages)}")

        async with httpx.AsyncClient(timeout=30) as client:
            response = await client.post(
                f"{PERPLEXITY_BASE_URL}/chat/completions",
                json=payload,
                headers=headers
            )
            response.raise_for_status()
            result = response.json()

            if "error" in result:
                error_msg = result.get('error', {}).get('message', 'Unknown error')
                logger.error(f"Perplexity API error: {error_msg}")
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Perplexity API error: {error_msg}"
                )

            # Extract response text
            if result.get("choices") and len(result["choices"]) > 0:
                response_text = result["choices"][0].get("message", {}).get("content", "No response from Perplexity")
                logger.info(f"Perplexity API response received: {len(response_text)} chars")
                return response_text
            else:
                logger.warning("Perplexity API returned no choices")
                return "No response from Perplexity API"

    except httpx.HTTPError as e:
        logger.error(f"Perplexity API connection error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_502_BAD_GATEWAY,
            detail=f"Perplexity API connection error: {str(e)}"
        )
    except Exception as e:
        logger.error(f"Unexpected error calling Perplexity API: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to process Perplexity API response"
        )

@router.post("/threads/{thread_id}/messages", response_model=Message)
async def send_message(request: Request, thread_id: str, message: MessageCreate):
    """Send message and get AI response from Perplexity"""
    tenant_id = get_tenant_id(request)
    user_id = get_user_id(request)
    require_tenant_membership(tenant_id, user_id)
    rate_limit(
        user_id,
        "chat_perplexity",
        max_calls=int(os.environ.get("RATE_LIMIT_PERPLEXITY_MAX", "30")),
        window_sec=int(os.environ.get("RATE_LIMIT_PERPLEXITY_WINDOW", "60")),
    )
    supabase = get_supabase_client()

    thread_result = supabase.table("chat_threads")\
        .select("*")\
        .eq("id", thread_id)\
        .eq("tenant_id", tenant_id)\
        .eq("user_id", user_id)\
        .execute()
    if not thread_result.data:
        raise HTTPException(status_code=404, detail="Thread not found")

    thread = thread_result.data[0]

    # Save user message
    user_payload = {
        "thread_id": thread_id,
        "role": "user",
        "content": message.content,
        "content_type": "text",
        "created_at": datetime.utcnow().isoformat(),
    }
    supabase.table("chat_messages").insert(user_payload).execute()

    # Get configuration and conversation history
    api_key, model, max_tokens = await _get_perplexity_config(supabase, tenant_id)

    # Fetch conversation history
    messages_result = supabase.table("chat_messages")\
        .select("*")\
        .eq("thread_id", thread_id)\
        .order("created_at", desc=False)\
        .execute()

    # Build messages for API
    api_messages = []
    for msg in messages_result.data or []:
        api_messages.append({
            "role": msg["role"],
            "content": msg["content"]
        })

    # Call Perplexity API
    assistant_content = "Perplexity integration error"
    try:
        assistant_content = await _call_perplexity_api(api_key, model, max_tokens, api_messages)
    except HTTPException:
        raise
    except Exception as e:
        assistant_content = f"Error calling Perplexity: {str(e)}"

    # Save assistant message
    assistant_payload = {
        "thread_id": thread_id,
        "role": "assistant",
        "content": assistant_content,
        "content_type": "error" if "error" in assistant_content.lower() else "text",
        "created_at": datetime.utcnow().isoformat(),
    }
    assistant_result = supabase.table("chat_messages").insert(assistant_payload).execute()
    if not assistant_result.data:
        raise HTTPException(status_code=500, detail="Assistant response failed")
    assistant = assistant_result.data[0]

    # Update thread updated_at
    supabase.table("chat_threads")\
        .update({"updated_at": datetime.utcnow().isoformat()})\
        .eq("id", thread_id)\
        .execute()

    return Message(
        id=assistant["id"],
        thread_id=assistant["thread_id"],
        role=assistant["role"],
        content=assistant["content"],
        provider="perplexity",
        created_at=assistant.get("created_at") or datetime.utcnow()
    )

@router.get("/status")
async def status():
    """Check Perplexity integration status"""
    return {
        "configured": PERPLEXITY_CONFIGURED,
        "api_key_set": bool(PERPLEXITY_API_KEY),
        "model": PERPLEXITY_MODEL,
        "base_url": PERPLEXITY_BASE_URL,
        "max_tokens": PERPLEXITY_MAX_TOKENS,
    }
