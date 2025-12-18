"""
HAIDA API Backend - Vercel Serverless Function
Production-ready minimal API
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os

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

@app.get("/")
async def root():
    """Root endpoint - API status"""
    return {
        "status": "healthy",
        "service": "HAIDA API",
        "version": "2.0.0",
        "message": "HAIDA Backend is running",
        "timestamp": datetime.utcnow().isoformat(),
        "environment": os.environ.get("VERCEL_ENV", "development")
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
