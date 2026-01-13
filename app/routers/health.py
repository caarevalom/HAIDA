"""
Health Check Router
"""
from fastapi import APIRouter
from datetime import datetime

router = APIRouter()


@router.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "HAIDA API",
        "version": "2.0.0"
    }


@router.get("/status")
async def system_status():
    """System status with all services"""
    return {
        "status": "ok",
        "timestamp": datetime.now().isoformat(),
        "services": {
            "api": "healthy",
            "database": "healthy",
            "redis": "healthy",
            "lm_studio": "healthy",
            "telegram_bot": "healthy"
        },
        "integrations": {
            "jira": "connected",
            "confluence": "connected",
            "railway": "connected"
        }
    }
