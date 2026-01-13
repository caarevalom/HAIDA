"""System endpoints: Health, Version, Status"""
from fastapi import APIRouter
from datetime import datetime
import os
from app.core.db import fetch_one
from app.core.supabase_client import get_supabase_client

router = APIRouter()


def _get_db_status() -> str:
    db_status = "unconfigured"
    if os.environ.get("DATABASE_URL"):
        try:
            fetch_one("SELECT 1")
            db_status = "operational"
        except Exception:
            try:
                supabase = get_supabase_client()
                supabase.table("tenants").select("id").limit(1).execute()
                db_status = "operational"
            except Exception:
                db_status = "down"
    return db_status

@router.get("/health")
def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": os.environ.get("APP_NAME", "HAIDA API"),
        "version": os.environ.get("APP_VERSION", "2.0.0"),
        "database": _get_db_status(),
        "timestamp": datetime.utcnow().isoformat()
    }


@router.get("/api/health")
def api_health():
    """Health check endpoint with database status"""
    return {
        "status": "healthy",
        "database": _get_db_status(),
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
    db_status = _get_db_status()

    redis_status = "unconfigured"
    if os.environ.get("REDIS_URL"):
        redis_status = "configured"

    return {
        "api": "operational",
        "database": db_status,
        "redis": redis_status,
        "version": os.environ.get("APP_VERSION", "2.0.0"),
        "uptime": "running",
        "timestamp": datetime.utcnow().isoformat()
    }
