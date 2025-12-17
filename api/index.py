"""
Vercel serverless function entry point for HAIDA FastAPI backend
"""
from app.main import app

# Vercel expects 'app' or 'application' variable
application = app
