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

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://haida-frontend.vercel.app",
        "https://haida-one.vercel.app",
        "https://haida.stayarta.com",
        "https://haidapi.stayarta.com",
        "https://bothaida.stayarta.com",
        "http://localhost:3000",
        "http://localhost:5173",
        "*"
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

# Mount the main FastAPI app at root level to expose all routes
app.mount("", main_app)

application = app
