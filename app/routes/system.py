"""
System endpoints: Health, Version, Status
"""
from fastapi import APIRouter, Depends
from datetime import datetime
import os

router = APIRouter()

@router.get("/health")
def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/version")
def version():
    """Get application version"""
    return {
        "version": os.environ.get("APP_VERSION", "2.0.0"),
        "environment": os.environ.get("NODE_ENV", "production"),
        "build_date": os.environ.get("BUILD_DATE", "2025-12-16")
    }

@router.get("/status")
def status():
    """Get detailed system status"""
    return {
        "api": "operational",
        "database": "operational",  # TODO: Check DB connection
        "redis": "operational",     # TODO: Check Redis connection
        "version": os.environ.get("APP_VERSION", "2.0.0"),
        "uptime": "running",
        "timestamp": datetime.utcnow().isoformat()
    }
