"""
AI Chat Router - DeepSeek R1 Integration
"""
from fastapi import APIRouter
from starlette.concurrency import run_in_threadpool
from app.config import settings
from datetime import datetime
from app.ai import get_assistant

router = APIRouter()
assistant = get_assistant()


@router.post("/chat")
async def chat_with_ai(
    message: str,
    conversation_id: str | None = None,
    task_type: str = "general"
):
    """Chat with configured LLM provider"""
    response = await run_in_threadpool(
        assistant.chat,
        user_message=message,
        conversation_id=conversation_id or "default",
        context=None,
        task_type=task_type
    )

    return {
        "conversation_id": conversation_id or "default",
        "message": message,
        "response": response,
        "model": settings.ROUTE_LLM_MODEL if settings.LLM_PROVIDER.lower() != "lmstudio" else settings.LM_STUDIO_MODEL,
        "provider": settings.LLM_PROVIDER,
        "timestamp": datetime.now().isoformat()
    }


@router.get("/history")
async def get_chat_history(conversation_id: str | None = None):
    """Get chat history"""
    history = assistant.get_conversation_history(conversation_id or "default")
    return {
        "conversation_id": conversation_id or "default",
        "messages": history
    }
