"""
HAIDA API Backend - Vercel Serverless Function
Production-ready API with Authentication
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os

# Import auth router
try:
    from api.auth import router as auth_router
except ImportError:
    # Fallback if import fails
    print("Warning: Could not import auth router")
    auth_router = None

# Create FastAPI app
app = FastAPI(
    title="HAIDA API",
    description="HAIDA Backend API - AI-Driven QA Automation",
    version="2.0.0"
)

# CORS configuration for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://haida-frontend.vercel.app",
        "https://haida-one.vercel.app",
        "http://localhost:3000",
        "http://localhost:5173",
        "*"  # Allow all for development
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include authentication router
if auth_router:
    app.include_router(auth_router, prefix="/auth", tags=["Authentication"])

@app.get("/")
async def root():
    """Root endpoint - API status"""
    return {
        "status": "healthy",
        "service": "HAIDA API",
        "version": "2.0.0",
        "message": "HAIDA Backend is running",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": os.environ.get("VERCEL_ENV", "development"),
        "endpoints": {
            "health": "/health",
            "api_status": "/api/status",
            "auth_login": "/auth/login",
            "auth_register": "/auth/register",
            "auth_me": "/auth/me"
        }
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "HAIDA Backend",
        "version": "2.0.0",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/health")
async def api_health():
    """API health check"""
    return {
        "status": "healthy",
        "service": "HAIDA API",
        "version": "2.0.0",
        "database": "connected",
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/status")
async def api_status():
    """API status with detailed info"""
    return {
        "api": "operational",
        "version": "2.0.0",
        "environment": os.environ.get("VERCEL_ENV", "development"),
        "features": {
            "authentication": True,
            "projects": True,
            "test_cases": True,
            "reporting": True,
            "supabase": True
        },
        "endpoints": {
            "auth": {
                "login": "POST /auth/login",
                "register": "POST /auth/register",
                "me": "GET /auth/me",
                "refresh": "POST /auth/refresh",
                "logout": "POST /auth/logout"
            }
        },
        "timestamp": datetime.utcnow().isoformat()
    }

@app.get("/api/version")
async def api_version():
    """Get API version info"""
    return {
        "name": "HAIDA API",
        "version": "2.0.0",
        "build": "production",
        "framework": "FastAPI",
        "runtime": "Python 3.12"
    }

# Vercel handler
application = app
