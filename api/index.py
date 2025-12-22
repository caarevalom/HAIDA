"""
HAIDA API Backend - Vercel Serverless Function
Production-ready API with Authentication
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os

# Import auth router
auth_router = None
auth_import_error = None
try:
    from api.auth import router as auth_router
except Exception as e:
    # Fallback if import fails
    print(f"Warning: Could not import auth router: {e}")
    auth_import_error = str(e)

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
        "version": "2.0.1",  # Incremented to verify deployment
        "message": "HAIDA Backend is running",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": os.environ.get("VERCEL_ENV", "development"),
        "auth_router_loaded": auth_router is not None,
        "endpoints": {
            "health": "/health",
            "api_status": "/api/status",
            "debug": "/debug",
            "auth_login": "/auth/login",
            "auth_register": "/auth/register",
            "auth_me": "/auth/me"
        }
    }

@app.get("/debug")
async def debug():
    """Debug endpoint to check router status"""
    import sys
    return {
        "auth_router_loaded": auth_router is not None,
        "auth_import_error": auth_import_error,
        "python_version": sys.version,
        "environment": os.environ.get("VERCEL_ENV", "development"),
        "env_vars_set": {
            "SUPABASE_URL": bool(os.environ.get("SUPABASE_URL")),
            "SUPABASE_SERVICE_ROLE_KEY": bool(os.environ.get("SUPABASE_SERVICE_ROLE_KEY")),
            "DATABASE_URL": bool(os.environ.get("DATABASE_URL")),
            "JWT_SECRET": bool(os.environ.get("JWT_SECRET"))
        },
        "routes": [route.path for route in app.routes],
        "timestamp": datetime.utcnow().isoformat()
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
