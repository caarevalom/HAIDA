"""
HAIDA API Backend - Vercel Serverless Function
Simple version for testing
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os

# Create FastAPI app
app = FastAPI(
    title="HAIDA API",
    description="HAIDA Backend API - AI-Driven QA Automation",
    version="2.0.2"
)

# CORS configuration for production
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    """Root endpoint - API status"""
    return {
        "status": "healthy",
        "service": "HAIDA API",
        "version": "2.0.2",
        "message": "HAIDA Backend is running - Simple version",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": os.environ.get("VERCEL_ENV", "development")
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "HAIDA Backend",
        "version": "2.0.2",
        "timestamp": datetime.utcnow().isoformat()
    }

# Test import of auth module
@app.get("/test-import")
async def test_import():
    """Test if auth module can be imported"""
    try:
        from api import auth
        return {
            "status": "success",
            "message": "Auth module imported successfully",
            "has_router": hasattr(auth, 'router')
        }
    except Exception as e:
        return {
            "status": "error",
            "message": str(e),
            "type": type(e).__name__
        }

# Vercel handler
application = app
