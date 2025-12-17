"""AI Chat endpoints - Copilot Studio integration"""
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import uuid

router = APIRouter()

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
async def list_threads():
    """List chat threads - TODO: Implement DB query"""
    return []

@router.post("/threads", response_model=Thread)
async def create_thread(title: Optional[str] = "New Conversation"):
    """Create chat thread - TODO: Implement DB insert"""
    return Thread(
        id=str(uuid.uuid4()),
        title=title,
        provider="copilot-studio",
        message_count=0,
        created_at=datetime.utcnow(),
        updated_at=datetime.utcnow()
    )

@router.get("/threads/{thread_id}/messages", response_model=List[Message])
async def list_messages(thread_id: str):
    """List thread messages - TODO: Implement DB query"""
    return []

@router.post("/threads/{thread_id}/messages", response_model=Message)
async def send_message(thread_id: str, message: MessageCreate):
    """Send message and get AI response - TODO: Implement Copilot API"""
    # TODO: Call Copilot Studio Direct Line API
    user_message = Message(
        id=str(uuid.uuid4()),
        thread_id=thread_id,
        role="user",
        content=message.content,
        provider=message.provider,
        created_at=datetime.utcnow()
    )

    # TODO: Get response from Copilot
    assistant_message = Message(
        id=str(uuid.uuid4()),
        thread_id=thread_id,
        role="assistant",
        content="[Copilot response - TODO: Implement]",
        provider=message.provider,
        created_at=datetime.utcnow()
    )

    return assistant_message
