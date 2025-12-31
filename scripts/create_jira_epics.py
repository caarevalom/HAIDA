#!/usr/bin/env python3
"""
Script para crear Epics y Stories en Jira desde el documento de requerimientos
Estructura completa de HAIDA v2.0
"""

import os
import time
from atlassian import Jira
from dotenv import load_dotenv

# Configuración Jira
load_dotenv()

JIRA_URL = os.getenv("ATLASSIAN_URL")
JIRA_EMAIL = os.getenv("ATLASSIAN_EMAIL")
JIRA_TOKEN = os.getenv("ATLASSIAN_API_TOKEN")
PROJECT_KEY = os.getenv("JIRA_PROJECT_KEY", "HAIDA")

if not JIRA_URL or not JIRA_EMAIL or not JIRA_TOKEN:
    raise SystemExit("Missing ATLASSIAN_URL/ATLASSIAN_EMAIL/ATLASSIAN_API_TOKEN environment variables.")

# Inicializar cliente Jira
jira = Jira(
    url=JIRA_URL,
    username=JIRA_EMAIL,
    password=JIRA_TOKEN,
    cloud=True
)

# Estructura de Epics y Stories
EPICS_AND_STORIES = [
    {
        "epic": {
            "summary": "ÉPICA 1: BACKEND API (FastAPI)",
            "description": """
Desarrollo completo del backend API REST con FastAPI.
Incluye autenticación JWT, routers modulares, integración con base de datos.

**Componentes**:
- 7 routers REST (auth, tests, reports, jira, confluence, ai, health)
- Sistema de autenticación JWT
- Middleware CORS y seguridad
- Documentación Swagger automática
- Integración con PostgreSQL/Supabase

**Métricas Objetivo**:
- 23 endpoints REST funcionales
- < 200ms tiempo de respuesta promedio
- 99.9% uptime
- Rate limiting configurado
            """,
            "priority": "Highest"
        },
        "stories": [
            {
                "summary": "Sistema de Autenticación JWT",
                "description": """
**Objetivo**: Implementar autenticación completa con JWT tokens.

**Criterios de Aceptación**:
- ✅ Endpoint POST /api/auth/login con email/password
- ✅ Generación de tokens JWT con expiración de 30 minutos
- ✅ Passwords hasheados con bcrypt (12 salt rounds)
- ✅ Endpoint POST /api/auth/register para nuevos usuarios
- ✅ Endpoint GET /api/auth/me para obtener usuario actual
- ✅ Endpoint POST /api/auth/refresh para renovar token
- ✅ Endpoint POST /api/auth/logout para invalidar token

**Implementación**:
- Archivo: `app/routers/auth.py`
- Dependencias: python-jose[cryptography], passlib[bcrypt]
- Config: JWT_SECRET, JWT_ALGORITHM, JWT_EXPIRATION_MINUTES en .env

**DoD**:
- ✅ Tests unitarios > 80% coverage
- ✅ Documentación Swagger completa
- ✅ Manejo de errores 401/403 adecuado
- ✅ Rate limiting: 5 intentos/minuto por IP
                """,
                "priority": "Highest",
                "story_points": 8,
                "labels": ["backend", "auth", "security"]
            },
            {
                "summary": "Router de Tests - CRUD y Ejecución",
                "description": """
**Objetivo**: Gestión completa de test suites y ejecuciones.

**Criterios de Aceptación**:
- ✅ GET /api/tests - Listar todas las test suites del proyecto
- ✅ POST /api/tests - Crear nueva test suite
- ✅ GET /api/tests/{id} - Obtener detalles de una suite
- ✅ PUT /api/tests/{id} - Actualizar suite
- ✅ DELETE /api/tests/{id} - Eliminar suite
- ✅ POST /api/tests/run - Ejecutar suite (async con Celery)
- ✅ GET /api/tests/executions - Historial de ejecuciones

**Implementación**:
- Archivo: `app/routers/tests.py`
- Integración con: Playwright, Newman, k6, Lighthouse
- Queue: Celery + Redis para ejecuciones async

**DoD**:
- ✅ Ejecutar tests en background (no bloquear API)
- ✅ Webhooks para notificar fin de ejecución
- ✅ Logs de ejecución guardados en BD
                """,
                "priority": "High",
                "story_points": 13,
                "labels": ["backend", "tests", "core"]
            },
            {
                "summary": "Router de Reports - Generación y Consulta",
                "description": """
**Objetivo**: Sistema de reportes con Allure Framework.

**Criterios de Aceptación**:
- ✅ GET /api/reports - Listar reportes disponibles
- ✅ POST /api/reports/generate - Generar reporte Allure
- ✅ GET /api/reports/{id} - Descargar reporte (PDF/HTML)
- ✅ GET /api/reports/trending - Datos históricos para gráficos

**Implementación**:
- Archivo: `app/routers/reports.py`
- Allure CLI para generación
- ReportLab para PDFs custom

**DoD**:
- ✅ Reportes generados en < 5 segundos
- ✅ Storage en S3 o filesystem con cleanup automático
                """,
                "priority": "Medium",
                "story_points": 8,
                "labels": ["backend", "reports", "allure"]
            },
            {
                "summary": "Integración Jira - Creación Automática de Issues",
                "description": """
**Objetivo**: Crear tickets Jira automáticamente cuando tests fallan.

**Criterios de Aceptación**:
- ✅ POST /api/jira/issues - Crear issue desde test failure
- ✅ GET /api/jira/issues - Listar issues del proyecto HAIDA
- ✅ PUT /api/jira/issues/{key} - Actualizar estado de issue
- ✅ Mapping automático: Test → Issue (tabla jira_issues)

**Implementación**:
- Archivo: `app/routers/jira.py`
- Librería: atlassian-python-api
- Plantilla de issue: bug, test-failure, automated

**DoD**:
- ✅ Issues creados con screenshot adjunto
- ✅ Descripción incluye: pasos para reproducir, logs, stack trace
                """,
                "priority": "High",
                "story_points": 8,
                "labels": ["backend", "jira", "integration"]
            },
            {
                "summary": "Integración Confluence - Documentación Automática",
                "description": """
**Objetivo**: Publicar resultados de tests en Confluence automáticamente.

**Criterios de Aceptación**:
- ✅ POST /api/confluence/pages - Crear página con resultados
- ✅ GET /api/confluence/pages - Listar páginas del espacio HAIDA
- ✅ PUT /api/confluence/pages/{id} - Actualizar página existente

**Implementación**:
- Archivo: `app/routers/confluence.py`
- Template HTML para páginas de resultados
- Gráficos de trending embebidos

**DoD**:
- ✅ Páginas creadas con formato profesional
- ✅ Tablas de resultados con colores (rojo/verde)
                """,
                "priority": "Medium",
                "story_points": 5,
                "labels": ["backend", "confluence", "docs"]
            },
            {
                "summary": "Router de IA - Chat con DeepSeek R1",
                "description": """
**Objetivo**: Integrar DeepSeek R1 para asistencia inteligente.

**Criterios de Aceptación**:
- ✅ POST /api/ai/chat - Enviar mensaje y recibir respuesta
- ✅ GET /api/ai/chats - Historial de conversaciones
- ✅ POST /api/ai/generate-tests - Generar test cases desde spec

**Implementación**:
- Archivo: `app/routers/ai.py`
- Cliente: LM Studio API (compatible OpenAI)
- Modelo: DeepSeek-R1-0528-Qwen3-8B

**DoD**:
- ✅ Respuestas en < 5 segundos
- ✅ Context preservation (últimos 10 mensajes)
                """,
                "priority": "Medium",
                "story_points": 8,
                "labels": ["backend", "ai", "deepseek"]
            },
            {
                "summary": "Health Checks y Monitoreo",
                "description": """
**Objetivo**: Endpoints de salud para monitoreo y alertas.

**Criterios de Aceptación**:
- ✅ GET /health - Health check básico (200 OK)
- ✅ GET /status - Estado detallado de servicios
- ✅ GET /metrics - Métricas Prometheus (opcional)

**Implementación**:
- Archivo: `app/routers/health.py`
- Checks: DB, Redis, LM Studio, Jira, Confluence

**DoD**:
- ✅ Response time < 100ms
- ✅ Integración con Railway health checks
                """,
                "priority": "High",
                "story_points": 3,
                "labels": ["backend", "monitoring", "devops"]
            }
        ]
    },
    {
        "epic": {
            "summary": "ÉPICA 2: BASE DE DATOS (Supabase PostgreSQL)",
            "description": """
Diseño e implementación del schema de base de datos con seguridad RLS.

**Componentes**:
- 7 tablas relacionales
- 10 índices optimizados
- 10 políticas Row Level Security (RLS)
- 4 usuarios demo
- Triggers automáticos

**Stack**:
- PostgreSQL 15 (Supabase)
- SQLAlchemy 2.0 ORM
- Alembic para migraciones
            """,
            "priority": "Highest"
        },
        "stories": [
            {
                "summary": "Diseño de Schema y Migraciones",
                "description": """
**Objetivo**: Schema completo con todas las tablas y relaciones.

**Tablas**:
1. users (autenticación, roles)
2. projects (multi-tenant)
3. test_suites (tipos, configuración)
4. test_executions (resultados, logs)
5. reports (PDF, HTML)
6. jira_issues (mapping)
7. ai_chats (historial IA)

**DoD**:
- ✅ Archivo database_schema.sql funcional
- ✅ Migraciones Alembic creadas
- ✅ Seed data con 4 usuarios demo
                """,
                "priority": "Highest",
                "story_points": 13,
                "labels": ["database", "schema", "postgresql"]
            },
            {
                "summary": "Row Level Security (RLS) y Multi-tenancy",
                "description": """
**Objetivo**: Seguridad a nivel de fila para aislamiento de datos.

**Políticas RLS**:
- Users solo ven sus propios datos
- Projects aislados por owner
- Test suites visibles solo para miembros del proyecto

**DoD**:
- ✅ 10 políticas RLS creadas y testeadas
- ✅ Admin puede ver todo
- ✅ Viewers solo lectura
                """,
                "priority": "High",
                "story_points": 8,
                "labels": ["database", "security", "rls"]
            },
            {
                "summary": "Índices y Optimización de Performance",
                "description": """
**Objetivo**: Queries rápidas con índices adecuados.

**Índices**:
- users.email (UNIQUE)
- test_executions.test_suite_id + created_at (composite)
- jira_issues.test_execution_id

**DoD**:
- ✅ Queries < 50ms en promedio
- ✅ EXPLAIN ANALYZE ejecutado en queries críticas
                """,
                "priority": "Medium",
                "story_points": 5,
                "labels": ["database", "performance", "optimization"]
            }
        ]
    },
    {
        "epic": {
            "summary": "ÉPICA 3: TELEGRAM BOT 24/7",
            "description": """
Bot de Telegram con MiniApp para gestión de HAIDA desde chat.

**Funcionalidades**:
- Dashboard MiniApp embebida
- Comandos: /start, /status, /tests, /reports, /help
- Inline mode para búsquedas
- Callback handlers para botones
- Deploy 24/7 en Railway

**Stack**:
- python-telegram-bot 20.7
- Async handlers
- Webhook mode (Railway)
            """,
            "priority": "High"
        },
        "stories": [
            {
                "summary": "Bot Core - Comandos y Handlers",
                "description": """
**Objetivo**: Bot funcional con todos los comandos principales.

**Comandos**:
- /start → Menú principal con botones
- /status → Health check de servicios
- /tests → Listar y ejecutar test suites
- /reports → Ver últimos reportes
- /help → Ayuda y documentación

**DoD**:
- ✅ 243 líneas de código funcionando
- ✅ Error handling para comandos inválidos
                """,
                "priority": "High",
                "story_points": 8,
                "labels": ["telegram", "bot", "core"]
            },
            {
                "summary": "MiniApp Web Embebida",
                "description": """
**Objetivo**: Dashboard web dentro de Telegram.

**Features**:
- Ver gráficos de trending
- Ejecutar tests con configuración avanzada
- Descargar reportes PDF

**DoD**:
- ✅ MiniApp funciona en Telegram iOS y Android
- ✅ Autenticación con Telegram user ID
                """,
                "priority": "Medium",
                "story_points": 13,
                "labels": ["telegram", "miniapp", "web"]
            },
            {
                "summary": "Deploy Railway 24/7",
                "description": """
**Objetivo**: Bot siempre online en Railway.

**Configuración**:
- Webhook mode (no polling)
- Health checks configurados
- Auto-restart en fallos
- Logs centralizados

**DoD**:
- ✅ Uptime > 99.5%
- ✅ Response time < 500ms
                """,
                "priority": "High",
                "story_points": 5,
                "labels": ["telegram", "deploy", "railway"]
            }
        ]
    },
    {
        "epic": {
            "summary": "ÉPICA 4: TESTING AUTOMATIZADO MULTI-NIVEL",
            "description": """
Framework de testing completo con 4 niveles:
- E2E Web (Playwright)
- API (Newman)
- Performance (k6)
- Accessibility (Lighthouse)

**Objetivo**: Cobertura 95%+ con estándares ISTQB.

**Frameworks**:
- Playwright 1.41
- Newman 6.0
- k6 latest
- Lighthouse 12.0
            """,
            "priority": "Highest"
        },
        "stories": [
            {
                "summary": "Tests E2E Web con Playwright",
                "description": """
**Objetivo**: Suite completa de tests E2E multi-navegador.

**Features**:
- Tests en Chrome, Firefox, Safari, Edge
- Screenshots + videos automáticos en fallos
- Paralelización (4 workers)
- Retry automático (1 retry)

**DoD**:
- ✅ > 50 tests E2E creados
- ✅ Ejecución completa en < 3 minutos
                """,
                "priority": "Highest",
                "story_points": 21,
                "labels": ["testing", "e2e", "playwright"]
            },
            {
                "summary": "Tests API con Newman/Postman",
                "description": """
**Objetivo**: Validación completa de API REST.

**Collections**:
- Auth endpoints
- Tests CRUD
- Reports endpoints
- Jira/Confluence integration

**DoD**:
- ✅ > 100 assertions API
- ✅ Environments: dev, qa, prod
                """,
                "priority": "High",
                "story_points": 13,
                "labels": ["testing", "api", "newman"]
            },
            {
                "summary": "Tests de Performance con k6",
                "description": """
**Objetivo**: Validar performance bajo carga.

**Escenarios**:
- Load testing (100 usuarios concurrentes)
- Stress testing (identificar límite)
- Spike testing (picos de tráfico)

**DoD**:
- ✅ Response time < 200ms (p95)
- ✅ Throughput > 1000 req/s
                """,
                "priority": "Medium",
                "story_points": 8,
                "labels": ["testing", "performance", "k6"]
            },
            {
                "summary": "Auditorías de Accesibilidad con Lighthouse",
                "description": """
**Objetivo**: Compliance WCAG 2.0 AA.

**Auditorías**:
- Accessibility score > 90
- Performance score > 85
- Best practices score > 90
- SEO score > 85

**DoD**:
- ✅ Auditorías automáticas en CI/CD
- ✅ Reportes HTML generados
                """,
                "priority": "Medium",
                "story_points": 5,
                "labels": ["testing", "accessibility", "lighthouse"]
            }
        ]
    },
    {
        "epic": {
            "summary": "ÉPICA 5: DEVOPS & INFRAESTRUCTURA",
            "description": """
Infraestructura completa con Docker, CI/CD y deployment.

**Componentes**:
- Docker Compose (7 servicios)
- GitHub Actions CI/CD
- Railway deployment
- Monitoring y logging

**Objetivo**: Zero-downtime deployments, scaling automático.
            """,
            "priority": "High"
        },
        "stories": [
            {
                "summary": "Docker Compose - Entorno Local",
                "description": """
**Objetivo**: Levantar stack completo con un comando.

**Servicios**:
1. api (FastAPI)
2. postgres (BD)
3. redis (cache)
4. bot (Telegram)
5. playwright (runner)
6. newman (runner)
7. allure (reportes)

**DoD**:
- ✅ `docker-compose up -d` funciona
- ✅ Health checks para todos los servicios
                """,
                "priority": "High",
                "story_points": 13,
                "labels": ["devops", "docker", "local"]
            },
            {
                "summary": "CI/CD GitHub Actions",
                "description": """
**Objetivo**: Pipeline completo de CI/CD.

**Stages**:
1. Lint (flake8, black)
2. Tests (pytest)
3. Build (Docker image)
4. Deploy (Railway)

**DoD**:
- ✅ Tests corriendo en cada PR
- ✅ Deploy automático a Railway en merge a main
                """,
                "priority": "High",
                "story_points": 8,
                "labels": ["devops", "cicd", "github-actions"]
            },
            {
                "summary": "Deployment Railway - API + Bot",
                "description": """
**Objetivo**: Deploy productivo en Railway.

**Configuración**:
- API: Web service (https://haida-api.railway.app)
- Bot: Worker process (24/7)
- Variables de entorno desde Railway UI
- Logs centralizados

**DoD**:
- ✅ Uptime > 99.5%
- ✅ Auto-scaling configurado
                """,
                "priority": "Highest",
                "story_points": 8,
                "labels": ["devops", "deploy", "railway"]
            }
        ]
    },
    {
        "epic": {
            "summary": "ÉPICA 6: REPORTING & ANALYTICS",
            "description": """
Sistema de reportes con Allure Framework y dashboards.

**Features**:
- Reportes HTML unificados
- Trending histórico
- Exportación PDF
- Dashboards con gráficos

**Stack**:
- Allure Framework 2.0
- ReportLab para PDFs
- Chart.js para gráficos
            """,
            "priority": "Medium"
        },
        "stories": [
            {
                "summary": "Allure Framework - Reportes Unificados",
                "description": """
**Objetivo**: Reportes HTML profesionales con Allure.

**Features**:
- Resultados de Playwright, Newman, k6, Lighthouse
- Screenshots y videos embebidos
- Logs y stack traces
- Trending histórico (últimos 30 días)

**DoD**:
- ✅ Reportes generados en < 5 segundos
- ✅ Servidor Allure corriendo en Docker
                """,
                "priority": "Medium",
                "story_points": 13,
                "labels": ["reporting", "allure", "analytics"]
            }
        ]
    },
    {
        "epic": {
            "summary": "ÉPICA 7: SEGURIDAD & COMPLIANCE",
            "description": """
Medidas de seguridad y compliance con estándares.

**Features**:
- JWT authentication
- RLS en base de datos
- CORS configurado
- Rate limiting
- HTTPS obligatorio
- Audit logs
- GDPR compliance
- WCAG 2.0 AA

**Estándares**:
- ISTQB (testing)
- WCAG 2.0 AA (accesibilidad)
- GDPR (privacidad)
            """,
            "priority": "Highest"
        },
        "stories": [
            {
                "summary": "Seguridad API - CORS, Rate Limiting, JWT",
                "description": """
**Objetivo**: API segura contra ataques comunes.

**Medidas**:
- CORS: Solo dominios autorizados
- Rate limiting: 100 req/min por IP
- JWT: Tokens con expiración 30 min
- HTTPS: TLS 1.3 obligatorio

**DoD**:
- ✅ Security headers configurados
- ✅ OWASP Top 10 validado
                """,
                "priority": "Highest",
                "story_points": 8,
                "labels": ["security", "api", "cors"]
            },
            {
                "summary": "Compliance GDPR y Audit Logs",
                "description": """
**Objetivo**: Compliance con GDPR y trazabilidad.

**Features**:
- Audit logs en tabla audit_log
- GDPR: derecho al olvido (endpoint DELETE /api/auth/me)
- Encriptación de datos sensibles
- Retention policy (logs 90 días)

**DoD**:
- ✅ Todas las acciones críticas logueadas
- ✅ GDPR-compliant
                """,
                "priority": "High",
                "story_points": 5,
                "labels": ["security", "compliance", "gdpr"]
            }
        ]
    }
]

def create_epic(epic_data):
    """Crear un Epic (Task) en Jira"""
    try:
        # Usar Task en lugar de Epic (Epic no está habilitado en plan free)
        issue = jira.issue_create({
            "project": {"key": PROJECT_KEY},
            "summary": epic_data["summary"],
            "description": epic_data["description"],
            "issuetype": {"name": "Task"},  # Cambio: Task en lugar de Epic
            "priority": {"name": epic_data.get("priority", "Medium")},
            "labels": ["epic", "haida-v2"]  # Etiqueta para identificar como Epic
        })

        epic_key = issue["key"]
        print(f"✅ Epic (Task) creado: {epic_key} - {epic_data['summary']}")
        return epic_key

    except Exception as e:
        print(f"❌ Error creando epic: {str(e)}")
        return None

def create_story(story_data, epic_key):
    """Crear una Story (Task) vinculada a un Epic"""
    try:
        # Preparar labels con el epic parent
        labels = story_data.get("labels", []) + ["story", "haida-v2"]
        if epic_key:
            labels.append(f"epic:{epic_key}")

        fields = {
            "project": {"key": PROJECT_KEY},
            "summary": story_data["summary"],
            "description": story_data["description"],
            "issuetype": {"name": "Task"},  # Cambio: Task en lugar de Story
            "priority": {"name": story_data.get("priority", "Medium")},
            "labels": labels
        }

        # En Jira Cloud free, parent puede no estar disponible
        # Usamos labels para linkear Epic → Story

        issue = jira.issue_create(fields)

        story_key = issue["key"]
        print(f"   ✅ Story (Task) creada: {story_key} - {story_data['summary']}")

        # Intentar crear link (puede fallar si no hay permisos)
        try:
            if epic_key:
                jira.issue_link_create({
                    "type": {"name": "Relates"},
                    "inwardIssue": {"key": story_key},
                    "outwardIssue": {"key": epic_key}
                })
                print(f"      🔗 Vinculada a {epic_key}")
        except:
            pass  # Link opcional

        return story_key

    except Exception as e:
        print(f"   ❌ Error creando story: {str(e)}")
        return None

def main():
    print("🚀 HAIDA - Creación de Epics y Stories en Jira")
    print(f"📍 Proyecto: {PROJECT_KEY}")
    print(f"🌐 URL: {JIRA_URL}")
    print("="*60)

    total_epics = 0
    total_stories = 0

    for item in EPICS_AND_STORIES:
        print(f"\n📦 {item['epic']['summary']}")

        # Crear Epic
        epic_key = create_epic(item["epic"])

        if epic_key:
            total_epics += 1

            # Crear Stories del Epic
            for story in item.get("stories", []):
                story_key = create_story(story, epic_key)

                if story_key:
                    total_stories += 1

                time.sleep(0.5)  # Evitar rate limiting

        time.sleep(1)

    # Resumen final
    print("\n" + "="*60)
    print("📊 RESUMEN:")
    print(f"   Epics creados: {total_epics}/{len(EPICS_AND_STORIES)}")
    print(f"   Stories creadas: {total_stories}")
    print(f"\n✅ Proceso completado!")
    print(f"\n🌐 Ver en Jira: {JIRA_URL}/browse/{PROJECT_KEY}")

if __name__ == "__main__":
    main()
