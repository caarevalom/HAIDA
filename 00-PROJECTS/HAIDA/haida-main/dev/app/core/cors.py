"""CORS configuration for FastAPI"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from typing import Dict

def setup_cors(app: FastAPI, env: Dict):
    """Setup CORS middleware with environment-based configuration"""

    # Get allowed origins from environment
    allowed_origins = env.get("CORS_ORIGINS", "*").split(",")
    allow_credentials = env.get("CORS_ALLOW_CREDENTIALS", "true").lower() == "true"

    # In development, allow all origins
    if env.get("NODE_ENV") == "development":
        allowed_origins = ["*"]

    if "*" in allowed_origins and allow_credentials:
        allow_credentials = False

    app.add_middleware(
        CORSMiddleware,
        allow_origins=allowed_origins,
        allow_credentials=allow_credentials,
        allow_methods=["*"],
        allow_headers=["*"],
        expose_headers=["X-Request-Id", "X-Correlation-Id"]
    )
