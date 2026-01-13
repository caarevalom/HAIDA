"""
HAIDA API Backend - Vercel Serverless Function
Routes /api/* to the full FastAPI application.
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime
import os

from app.main import app as main_app

app = FastAPI(
    title="HAIDA API",
    description="HAIDA Backend API - AI-Driven QA Automation",
    version="2.0.0"
)

env_origins = [
    origin.strip()
    for origin in os.environ.get("CORS_ORIGINS", "").split(",")
    if origin.strip()
]
allow_origins = env_origins or [
    "https://haida.stayarta.com",
    "https://haida-frontend.vercel.app",
    "https://haida-one.vercel.app",
    "http://localhost:3000",
    "http://localhost:5173",
]
allow_credentials = os.environ.get("CORS_ALLOW_CREDENTIALS", "true").lower() == "true"
if "*" in allow_origins and allow_credentials:
    allow_credentials = False

app.add_middleware(
    CORSMiddleware,
    allow_origins=allow_origins,
    allow_credentials=allow_credentials,
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

# Expose FastAPI app routes at root and under /api
app.include_router(main_app.router)
app.mount("/api", main_app)

application = app
