"""HAIDA Backend Application."""

from fastapi import FastAPI

def create_app() -> FastAPI:
    """Create and configure the FastAPI application."""
    app = FastAPI(
        title="HAIDA API",
        description="Project and configuration management API",
        version="1.0.0",
    )

    # Include routers
    from app.api.v1 import projects
    app.include_router(projects.router)

    @app.get("/health")
    def health_check():
        """Health check endpoint."""
        return {"status": "ok"}

    return app


__all__ = ["create_app"]
