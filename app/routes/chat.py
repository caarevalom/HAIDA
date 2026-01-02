"""AI Chat endpoints - Copilot Studio integration"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid
from starlette.concurrency import run_in_threadpool
from app.core.supabase_client import get_supabase_client
from app.core.db import fetch_one, fetch_all
from app.core.request_context import get_tenant_id, get_user_id
from app.ai import get_assistant
from app.config import settings

router = APIRouter()
assistant = get_assistant()

class MessageCreate(BaseModel):
    content: str
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

@router.get("/threads", response_model=List[Thread])
async def list_threads(request: Request):
    """List chat threads"""
    tenant_id = get_tenant_id(request)
    user_id = get_user_id(request)
    try:
        supabase = get_supabase_client()
        threads_result = supabase.table("chat_threads")\
            .select("*")\
            .eq("tenant_id", tenant_id)\
            .eq("user_id", user_id)\
            .eq("status", "active")\
            .order("updated_at", desc=True)\
            .execute()
        data = threads_result.data or []
    except Exception:
        data = fetch_all(
            "SELECT * FROM chat_threads WHERE tenant_id = %s AND user_id = %s AND status = %s ORDER BY updated_at DESC",
            (tenant_id, user_id, "active"),
        ) or []

    threads = []
    for thread in data:
        try:
            supabase = get_supabase_client()
            count_result = supabase.table("chat_messages")\
                .select("id", count="exact")\
                .eq("thread_id", thread["id"])\
                .execute()
            message_count = count_result.count or 0
        except Exception:
            count_row = fetch_one(
                "SELECT COUNT(*) AS total FROM chat_messages WHERE thread_id = %s",
                (thread["id"],),
            ) or {"total": 0}
            message_count = count_row.get("total", 0)
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
async def create_thread(request: Request, title: Optional[str] = "New Conversation"):
    """Create chat thread"""
    tenant_id = get_tenant_id(request)
    user_id = get_user_id(request)
    payload = {
        "tenant_id": tenant_id,
        "user_id": user_id,
        "title": title,
        "provider": "copilot-studio",
        "status": "active",
        "created_at": datetime.utcnow().isoformat(),
        "updated_at": datetime.utcnow().isoformat(),
    }
    try:
        supabase = get_supabase_client()
        result = supabase.table("chat_threads").insert(payload).execute()
        if not result.data:
            raise HTTPException(status_code=500, detail="Thread creation failed")
        thread = result.data[0]
    except Exception:
        thread = fetch_one(
            """
            INSERT INTO chat_threads (tenant_id, user_id, title, provider, status, created_at, updated_at)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
            RETURNING id, title, provider, created_at, updated_at
            """,
            (
                tenant_id,
                user_id,
                title,
                "copilot-studio",
                "active",
                datetime.utcnow(),
                datetime.utcnow(),
            ),
        )
        if not thread:
            raise HTTPException(status_code=500, detail="Thread creation failed")
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
    try:
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
        data = messages_result.data or []
    except HTTPException:
        raise
    except Exception:
        thread = fetch_one(
            "SELECT id FROM chat_threads WHERE id = %s AND tenant_id = %s AND user_id = %s",
            (thread_id, tenant_id, user_id),
        )
        if not thread:
            raise HTTPException(status_code=404, detail="Thread not found")
        data = fetch_all(
            "SELECT * FROM chat_messages WHERE thread_id = %s ORDER BY created_at ASC",
            (thread_id,),
        ) or []

    messages = []
    for msg in data:
        messages.append(Message(
            id=msg["id"],
            thread_id=msg["thread_id"],
            role=msg["role"],
            content=msg["content"],
            provider="copilot-studio",
            created_at=msg.get("created_at") or datetime.utcnow()
        ))

    return messages

@router.post("/threads/{thread_id}/messages", response_model=Message)
async def send_message(request: Request, thread_id: str, message: MessageCreate):
    """Send message and get AI response"""
    tenant_id = get_tenant_id(request)
    user_id = get_user_id(request)
    try:
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
    except HTTPException:
        raise
    except Exception:
        thread = fetch_one(
            "SELECT id FROM chat_threads WHERE id = %s AND tenant_id = %s AND user_id = %s",
            (thread_id, tenant_id, user_id),
        )
        if not thread:
            raise HTTPException(status_code=404, detail="Thread not found")
        fetch_one(
            """
            INSERT INTO chat_messages (thread_id, role, content, content_type, created_at)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
            """,
            (thread_id, "user", message.content, "text", datetime.utcnow()),
        )

    provider = (message.provider or "copilot-studio").lower()
    assistant_content = "Copilot integration not configured"
    assistant_content_type = "error"
    copilot_ready = bool(settings.direct_line_secret)
    llm_ready = settings.LLM_PROVIDER.lower() == "lmstudio" or bool(settings.ROUTE_LLM_API_KEY)

    if provider == "copilot-studio" and not copilot_ready:
        provider = "llm-fallback"

    if provider != "copilot-studio":
        if not llm_ready:
            assistant_content = "Chat LLM no configurado: falta ROUTE_LLM_API_KEY"
        else:
            assistant_content = await run_in_threadpool(
                assistant.chat,
                user_message=message.content,
                conversation_id=thread_id,
                context=None,
                task_type="general"
            )
            assistant_content_type = "text"
    assistant_payload = {
        "thread_id": thread_id,
        "role": "assistant",
        "content": assistant_content,
        "content_type": assistant_content_type,
        "created_at": datetime.utcnow().isoformat(),
    }
    try:
        supabase = get_supabase_client()
        assistant_result = supabase.table("chat_messages").insert(assistant_payload).execute()
        if not assistant_result.data:
            raise HTTPException(status_code=500, detail="Assistant response failed")
        assistant = assistant_result.data[0]
        supabase.table("chat_threads")\
            .update({"updated_at": datetime.utcnow().isoformat()})\
            .eq("id", thread_id)\
            .execute()
    except Exception:
        assistant = fetch_one(
            """
            INSERT INTO chat_messages (thread_id, role, content, content_type, created_at)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id, thread_id, role, content, created_at
            """,
            (
                thread_id,
                "assistant",
                assistant_content,
                assistant_content_type,
                datetime.utcnow(),
            ),
        )
        if not assistant:
            raise HTTPException(status_code=500, detail="Assistant response failed")
        fetch_one(
            "UPDATE chat_threads SET updated_at = %s WHERE id = %s RETURNING id",
            (datetime.utcnow(), thread_id),
        )

    return Message(
        id=assistant["id"],
        thread_id=assistant["thread_id"],
        role=assistant["role"],
        content=assistant["content"],
        provider=message.provider,
        created_at=assistant.get("created_at") or datetime.utcnow()
    )
