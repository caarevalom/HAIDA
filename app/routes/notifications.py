"""Notifications endpoints"""
from fastapi import APIRouter, HTTPException, Request
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
from app.core.supabase_client import get_supabase_client
from app.core.request_context import get_tenant_id, get_user_id

router = APIRouter()

class Notification(BaseModel):
    id: str
    title: Optional[str] = None
    message: str
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None

@router.get("")
async def list_notifications(request: Request) -> List[Notification]:
    """List user notifications"""
    tenant_id = get_tenant_id(request)
    user_id = get_user_id(request)
    supabase = get_supabase_client()

    result = supabase.table("notifications")\
        .select("*")\
        .eq("tenant_id", tenant_id)\
        .eq("user_id", user_id)\
        .order("created_at", desc=True)\
        .execute()

    return result.data or []

@router.post("/{notification_id}/read")
async def mark_as_read(request: Request, notification_id: str):
    """Mark notification as read"""
    tenant_id = get_tenant_id(request)
    user_id = get_user_id(request)
    supabase = get_supabase_client()

    result = supabase.table("notifications")\
        .update({"is_read": True, "read_at": datetime.utcnow().isoformat()})\
        .eq("id", notification_id)\
        .eq("tenant_id", tenant_id)\
        .eq("user_id", user_id)\
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Marked as read"}

@router.delete("/{notification_id}")
async def delete_notification(request: Request, notification_id: str):
    """Delete notification"""
    tenant_id = get_tenant_id(request)
    user_id = get_user_id(request)
    supabase = get_supabase_client()

    result = supabase.table("notifications")\
        .delete()\
        .eq("id", notification_id)\
        .eq("tenant_id", tenant_id)\
        .eq("user_id", user_id)\
        .execute()

    if not result.data:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"message": "Deleted"}
