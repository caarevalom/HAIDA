"""
HAIDA - Hiberus AI-Driven Automation
FastAPI Main Application
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.config import settings
from app.routers import auth, tests, reports, jira, confluence, ai, health
from app.db.database import init_db, check_db_connection
from app.models import *  # Importar todos los modelos para que SQLAlchemy los registre


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifecycle events"""
    print("🚀 HAIDA API Starting...")

    # Verificar conexión a BD
    print("🔍 Verificando conexión a base de datos...")
    if check_db_connection():
        print("✅ Conexión a base de datos exitosa")
    else:
        print("⚠️  No se pudo conectar a la base de datos")

    # Inicializar tablas (crear si no existen)
    try:
        init_db()
        print("✅ Tablas de base de datos inicializadas")
    except Exception as e:
        print(f"⚠️  Error inicializando BD: {str(e)}")

    yield
    print("👋 HAIDA API Shutting down...")


app = FastAPI(
    title="HAIDA API",
    description="Hiberus AI-Driven Automation - QA Testing Platform",
    version="2.0.0",
    lifespan=lifespan,
    docs_url="/docs",
    redoc_url="/redoc"
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])
app.include_router(tests.router, prefix="/api/tests", tags=["Tests"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(jira.router, prefix="/api/jira", tags=["Jira"])
app.include_router(confluence.router, prefix="/api/confluence", tags=["Confluence"])
app.include_router(ai.router, prefix="/api/ai", tags=["AI"])
app.include_router(health.router, tags=["Health"])


@app.get("/")
async def root():
    return {
        "name": "HAIDA API",
        "version": "2.0.0",
        "description": "Hiberus AI-Driven Automation",
        "docs": "/docs",
        "health": "/health"
    }


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(
        "app.main:app",
        host=settings.API_HOST,
        port=settings.API_PORT,
        reload=settings.API_RELOAD
    )
