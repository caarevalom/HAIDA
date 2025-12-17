"""Notifications endpoints"""
from fastapi import APIRouter
from typing import List
from datetime import datetime

router = APIRouter()

@router.get("")
async def list_notifications():
    """List user notifications - TODO: Implement"""
    return []

@router.post("/{notification_id}/read")
async def mark_as_read(notification_id: str):
    """Mark notification as read - TODO: Implement"""
    return {"message": "Marked as read"}

@router.delete("/{notification_id}")
async def delete_notification(notification_id: str):
    """Delete notification - TODO: Implement"""
    return {"message": "Deleted"}
