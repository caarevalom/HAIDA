"""System endpoints: Health, Version, Status"""
from fastapi import APIRouter
from fastapi.responses import JSONResponse
from datetime import datetime
import os
import json
from app.core.db import fetch_one
from app.core.supabase_client import get_supabase_client

router = APIRouter()

@router.get("/health")
def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/version")
def version():
    """Get application version"""
    return {
        "version": os.environ.get("APP_VERSION", "2.0.0"),
        "environment": os.environ.get("NODE_ENV", "production"),
        "build_date": os.environ.get("BUILD_DATE", "2025-12-16")
    }

@router.get("/status")
def status():
    """Get detailed system status"""
    db_status = "unconfigured"
    if os.environ.get("DATABASE_URL"):
        try:
            fetch_one("SELECT 1")
            db_status = "operational"
        except Exception:
            try:
                supabase = get_supabase_client()
                supabase.table("tenants").select("id").limit(1).execute()
                db_status = "operational"
            except Exception:
                db_status = "down"

    redis_status = "unconfigured"
    if os.environ.get("REDIS_URL"):
        redis_status = "configured"

    return {
        "api": "operational",
        "database": db_status,
        "redis": redis_status,
        "version": os.environ.get("APP_VERSION", "2.0.0"),
        "uptime": "running",
        "timestamp": datetime.utcnow().isoformat()
    }

@router.get("/copilot/manifest", response_class=JSONResponse)
def copilot_manifest():
    """Get Copilot Studio capability manifest"""
    manifest = {
        "schema_version": "1.0.0",
        "name_for_human": "HAIDA Automation API",
        "name_for_model": "haida_api",
        "description_for_human": "QA Automation and Test Management API - Crear y ejecutar casos de prueba, generar reportes y automatizar testing",
        "description_for_model": "API para gestión de QA automation, casos de prueba, ejecución de tests y generación de reportes",
        "auth": {
            "type": "oauth2",
            "client_id": "c3321f1a-6c32-4d6e-b3e6-a4de2f7fee4e",
            "scopes": ["User.Read", "email", "profile", "openid"]
        },
        "api": {
            "type": "openapi",
            "url": "https://haidapi.stayarta.com/openapi.json",
            "is_user_authenticated": True
        },
        "logo_url": "https://haida.stayarta.com/logo.png",
        "contact_email": "hola@stayarta.com",
        "servers": [
            {
                "url": "https://haidapi.stayarta.com",
                "description": "HAIDA API Production"
            }
        ],
        "capabilities": [
            "Crear y gestionar proyectos de testing",
            "Crear casos de prueba (scripts)",
            "Ejecutar pruebas automaticamente",
            "Obtener resultados de ejecuciones",
            "Generar reportes de testing",
            "Descargar reportes en diferentes formatos",
            "Chat con IA para ayuda en testing",
            "Gestionar usuarios y autenticación",
            "Integración con Microsoft Entra ID OAuth",
            "Búsqueda de documentación"
        ]
    }
    return manifest

@router.get("/openapi.json", response_class=JSONResponse)
def openapi_spec():
    """Get OpenAPI specification for Copilot Studio"""
    spec = {
        "openapi": "3.0.0",
        "info": {
            "title": "HAIDA Automation API",
            "version": "2.0.0",
            "description": "QA Automation and Test Management API"
        },
        "servers": [
            {
                "url": "https://haidapi.stayarta.com",
                "description": "Production"
            }
        ],
        "paths": {
            "/health": {
                "get": {
                    "summary": "Health Check",
                    "tags": ["System"],
                    "operationId": "health",
                    "responses": {
                        "200": {
                            "description": "System is healthy"
                        }
                    }
                }
            },
            "/status": {
                "get": {
                    "summary": "System Status",
                    "tags": ["System"],
                    "operationId": "status",
                    "responses": {
                        "200": {
                            "description": "System status details"
                        }
                    }
                }
            },
            "/auth/login": {
                "post": {
                    "summary": "Login",
                    "tags": ["Authentication"],
                    "operationId": "login",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "email": {"type": "string"},
                                        "password": {"type": "string"}
                                    }
                                }
                            }
                        }
                    },
                    "responses": {
                        "200": {
                            "description": "Login successful"
                        }
                    }
                }
            },
            "/projects": {
                "get": {
                    "summary": "List Projects",
                    "tags": ["Projects"],
                    "operationId": "list_projects",
                    "responses": {
                        "200": {
                            "description": "List of projects"
                        }
                    }
                },
                "post": {
                    "summary": "Create Project",
                    "tags": ["Projects"],
                    "operationId": "create_project",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "name": {"type": "string"},
                                        "description": {"type": "string"}
                                    }
                                }
                            }
                        }
                    },
                    "responses": {
                        "201": {
                            "description": "Project created"
                        }
                    }
                }
            },
            "/scripts": {
                "get": {
                    "summary": "List Test Cases",
                    "tags": ["Test Cases"],
                    "operationId": "list_test_cases",
                    "responses": {
                        "200": {
                            "description": "List of test cases"
                        }
                    }
                },
                "post": {
                    "summary": "Create Test Case",
                    "tags": ["Test Cases"],
                    "operationId": "create_test_case",
                    "responses": {
                        "201": {
                            "description": "Test case created"
                        }
                    }
                }
            },
            "/script-runs": {
                "get": {
                    "summary": "List Executions",
                    "tags": ["Test Execution"],
                    "operationId": "list_executions",
                    "responses": {
                        "200": {
                            "description": "List of test executions"
                        }
                    }
                },
                "post": {
                    "summary": "Execute Test",
                    "tags": ["Test Execution"],
                    "operationId": "execute_test",
                    "responses": {
                        "201": {
                            "description": "Test execution started"
                        }
                    }
                }
            },
            "/reports": {
                "get": {
                    "summary": "List Reports",
                    "tags": ["Reports"],
                    "operationId": "list_reports",
                    "responses": {
                        "200": {
                            "description": "List of reports"
                        }
                    }
                },
                "post": {
                    "summary": "Generate Report",
                    "tags": ["Reports"],
                    "operationId": "generate_report",
                    "responses": {
                        "201": {
                            "description": "Report generated"
                        }
                    }
                }
            }
        },
        "components": {
            "securitySchemes": {
                "oauth2": {
                    "type": "oauth2",
                    "flows": {
                        "authorizationCode": {
                            "authorizationUrl": "https://login.microsoftonline.com/9b7594d6-2c7d-4fe2-b248-213f64996877/oauth2/v2.0/authorize",
                            "tokenUrl": "https://login.microsoftonline.com/9b7594d6-2c7d-4fe2-b248-213f64996877/oauth2/v2.0/token",
                            "refreshUrl": "https://login.microsoftonline.com/9b7594d6-2c7d-4fe2-b248-213f64996877/oauth2/v2.0/token",
                            "scopes": {
                                "User.Read": "Read user profile",
                                "email": "Read user email",
                                "profile": "Read user profile",
                                "openid": "OpenID Connect"
                            }
                        }
                    }
                }
            }
        },
        "security": [
            {
                "oauth2": ["User.Read", "email", "profile", "openid"]
            }
        ]
    }
    return spec
