# HAIDA v2.0 - Requerimientos del Proyecto

**Proyecto**: HAIDA (Hiberus AI-Driven Automation)
**Versión**: 2.0.0
**Tipo**: Plataforma SaaS de QA Automation
**Organización**: STAYArta → Hiberus → CTB
**Fecha**: Diciembre 2025

---

## 📊 MÉTRICAS REALES DEL PROYECTO

### Código Base
- **Archivos Python**: 894 archivos
- **Líneas de código**: 338,355 líneas
- **API Endpoints**: 23 endpoints REST
- **Routers**: 7 módulos (Auth, Tests, Reports, Jira, Confluence, AI, Health)
- **Tamaño total**: 19 MB
- **Archivos totales**: 1,065

### Infraestructura
- **Servicios Docker**: 7 contenedores
- **Base de datos**: 7 tablas, 10 índices, 10 políticas RLS
- **Dependencias Python**: 24 packages
- **Telegram Bot**: 243 líneas, 4 comandos principales
- **Configuración**: 3 archivos (docker-compose, Dockerfile, .env)

---

## 🎯 ÉPICA 1: BACKEND API (FastAPI)

### Epic Summary
Desarrollar backend completo en FastAPI con arquitectura REST, autenticación JWT, y múltiples módulos funcionales.

### Business Value
Backend robusto que soporta todas las operaciones CRUD, autenticación segura, y escalabilidad horizontal.

### Stories

#### HAIDA-1: Sistema de Autenticación JWT
**Tipo**: Story
**Prioridad**: Alta
**Story Points**: 8

**Descripción**:
Como usuario del sistema, necesito autenticarme de forma segura para acceder a las funcionalidades de HAIDA.

**Criterios de Aceptación**:
- ✅ Endpoint POST /api/auth/login con email/password
- ✅ Generación de tokens JWT con expiración de 30 minutos
- ✅ Endpoint POST /api/auth/register para nuevos usuarios
- ✅ Endpoint GET /api/auth/me para obtener usuario actual
- ✅ Endpoint POST /api/auth/refresh para renovar token
- ✅ Endpoint POST /api/auth/logout
- ✅ Passwords hasheados con bcrypt
- ✅ Middleware de autenticación para rutas protegidas

**Implementación**:
- Archivo: `app/routers/auth.py`
- Dependencias: python-jose, passlib, bcrypt
- Tests: Login exitoso, login fallido, token expirado, refresh

**DoD (Definition of Done)**:
- Código implementado y funcionando
- Tests unitarios > 80% cobertura
- Documentación Swagger actualizada
- Sin vulnerabilidades de seguridad

---

#### HAIDA-2: Módulo de Gestión de Tests
**Tipo**: Story
**Prioridad**: Alta
**Story Points**: 13

**Descripción**:
Como QA Engineer, necesito gestionar y ejecutar test suites desde la API.

**Criterios de Aceptación**:
- ✅ GET /api/tests - Listar todos los test suites
- ✅ POST /api/tests/run - Ejecutar suite específico
- ✅ GET /api/tests/{id}/status - Ver estado de ejecución
- ✅ GET /api/tests/{id}/results - Obtener resultados detallados
- ✅ Soporte para 4 tipos: web (E2E), api, performance, accessibility
- ✅ Ejecución en background con cola
- ✅ Notificaciones en tiempo real

**Implementación**:
- Archivo: `app/routers/tests.py`
- Integración: Playwright, Newman, k6, Lighthouse
- Background jobs: Celery + Redis

**Métricas de Éxito**:
- Tiempo de ejecución < 5 minutos para suite completo
- 95%+ de tests passing en CI/CD
- 0 falsos positivos

---

#### HAIDA-3: Sistema de Reportes
**Tipo**: Story
**Prioridad**: Media
**Story Points**: 8

**Descripción**:
Como Manager, necesito generar y consultar reportes de calidad para tomar decisiones.

**Criterios de Aceptación**:
- ✅ GET /api/reports - Listar reportes disponibles
- ✅ GET /api/reports/{id} - Obtener reporte específico
- ✅ POST /api/reports/generate - Generar nuevo reporte
- ✅ GET /api/reports/{id}/pdf - Descargar PDF
- ✅ Tipos: daily, weekly, monthly, custom
- ✅ Métricas: total tests, passed, failed, success rate
- ✅ Trending histórico
- ✅ Exportación a PDF y JSON

**Implementación**:
- Archivo: `app/routers/reports.py`
- Generación PDF: ReportLab
- Templates: Jinja2

---

#### HAIDA-4: Integración Jira
**Tipo**: Story
**Prioridad**: Alta
**Story Points**: 8

**Descripción**:
Como QA Engineer, necesito crear y actualizar issues en Jira automáticamente desde tests fallidos.

**Criterios de Aceptación**:
- ✅ GET /api/jira/issues - Listar issues del proyecto
- ✅ POST /api/jira/issues - Crear nuevo issue (Bug, Task, Story)
- ✅ PUT /api/jira/issues/{key} - Actualizar issue existente
- ✅ Creación automática de bugs cuando test falla
- ✅ Linking test execution ↔ Jira issue
- ✅ Sincronización bidireccional de estados
- ✅ Attachment de screenshots y logs

**Implementación**:
- Archivo: `app/routers/jira.py`
- API: Atlassian Python API v3
- Auth: Basic Auth con API Token

**Validación**:
- ✅ Conectado y funcionando: Status 200
- ✅ Email: hola@stayarta.com
- ✅ URL: https://stayarta.atlassian.net

---

#### HAIDA-5: Integración Confluence
**Tipo**: Story
**Prioridad**: Media
**Story Points**: 5

**Descripción**:
Como equipo, necesitamos documentación centralizada y actualizada automáticamente en Confluence.

**Criterios de Aceptación**:
- ✅ GET /api/confluence/pages - Listar páginas del espacio HAIDA
- ✅ POST /api/confluence/pages - Crear nueva página
- ✅ PUT /api/confluence/pages/{id} - Actualizar página
- ✅ Auto-publicación de resultados de tests
- ✅ Auto-actualización de documentación técnica
- ✅ Formato HTML/Markdown soportado
- ✅ Espacio HAIDA creado y accesible

**Implementación**:
- Archivo: `app/routers/confluence.py`
- API: Confluence REST API v2
- Espacio: HAIDA (https://stayarta.atlassian.net/wiki/spaces/HAIDA)

**Validación**:
- ✅ Página creada: ID +34662652300
- ✅ Contenido: 13,268 caracteres

---

#### HAIDA-6: Chat IA con DeepSeek R1
**Tipo**: Story
**Prioridad**: Media
**Story Points**: 13

**Descripción**:
Como usuario, necesito un asistente IA para consultas técnicas, análisis de errores y generación de tests.

**Criterios de Aceptación**:
- ✅ POST /api/ai/chat - Enviar mensaje al modelo
- ✅ GET /api/ai/history - Obtener historial de conversación
- ✅ Modelo: DeepSeek-R1-0528-Qwen3-8B-MLX-4bit
- ✅ Contexto preservado entre mensajes
- ✅ Capacidades:
  - Análisis de logs y errores
  - Generación de test cases
  - Sugerencias de optimización
  - Respuestas técnicas QA
- ✅ Latencia < 2 segundos por respuesta
- ✅ Almacenamiento de conversaciones en DB

**Implementación**:
- Archivo: `app/routers/ai.py`
- Servidor: LM Studio (http://localhost:1234/v1)
- Almacenamiento: Tabla `ai_chats` en Supabase

---

#### HAIDA-7: Health Checks y Monitoring
**Tipo**: Story
**Prioridad**: Alta
**Story Points**: 3

**Descripción**:
Como DevOps, necesito endpoints de salud para monitorear el estado del sistema.

**Criterios de Aceptación**:
- ✅ GET /health - Health check básico (200 OK)
- ✅ GET /status - Estado detallado de todos los servicios
- ✅ Validación de conexiones:
  - Database (Supabase)
  - Redis
  - LM Studio
  - Telegram Bot
  - Jira/Confluence
- ✅ Métricas: uptime, versión, timestamp
- ✅ Response time < 100ms

**Implementación**:
- Archivo: `app/routers/health.py`
- Monitoring: OpenTelemetry (futuro)

---

## 🎯 ÉPICA 2: BASE DE DATOS (Supabase/PostgreSQL)

### Epic Summary
Diseñar e implementar schema de base de datos completo con RLS, triggers, y datos de prueba.

### Business Value
Almacenamiento seguro, escalable y con trazabilidad completa de todas las operaciones.

### Stories

#### HAIDA-10: Schema de Base de Datos
**Tipo**: Story
**Prioridad**: Alta
**Story Points**: 8

**Descripción**:
Como desarrollador, necesito un schema completo y normalizado para almacenar todos los datos del sistema.

**Criterios de Aceptación**:
- ✅ Tabla `users` - Gestión de usuarios (4 roles)
- ✅ Tabla `projects` - Proyectos QA multi-tenant
- ✅ Tabla `test_suites` - Suites de pruebas
- ✅ Tabla `test_executions` - Historial de ejecuciones
- ✅ Tabla `reports` - Reportes generados
- ✅ Tabla `jira_issues` - Sincronización Jira
- ✅ Tabla `ai_chats` - Conversaciones con IA
- ✅ 10 índices para optimización
- ✅ Relaciones FK correctas
- ✅ Campos timestamp (created_at, updated_at)

**Implementación**:
- Archivo: `database_schema.sql`
- Totales: 7 tablas, 10 índices

**Métricas**:
- Performance: Queries < 50ms
- Storage: Estimado 100 MB/mes

---

#### HAIDA-11: Row Level Security (RLS)
**Tipo**: Story
**Prioridad**: Alta
**Story Points**: 5

**Descripción**:
Como administrador de seguridad, necesito políticas RLS para aislamiento multi-tenant.

**Criterios de Aceptación**:
- ✅ 10 políticas RLS implementadas
- ✅ Users solo ven sus propios datos
- ✅ Admins ven todos los datos
- ✅ Projects aislados por owner
- ✅ Test executions visibles solo a project members
- ✅ AI chats privados por usuario
- ✅ Auditoría de accesos

**Implementación**:
- Políticas definidas en `database_schema.sql`
- Totales: 10 CREATE POLICY statements

**Validación**:
- Tests de aislamiento: User A no puede ver datos de User B
- Admin puede ver todo
- Performance no degradada (< 10% overhead)

---

#### HAIDA-12: Seeds y Datos Demo
**Tipo**: Story
**Prioridad**: Media
**Story Points**: 2

**Descripción**:
Como desarrollador, necesito datos de prueba para desarrollo y demos.

**Criterios de Aceptación**:
- ✅ 4 usuarios demo (admin, qa, dev, viewer)
- ✅ 1 proyecto demo "Demo Project"
- ✅ 4 test suites (web, api, perf, a11y)
- ✅ Passwords: admin123 (para todos)
- ✅ Datos realistas y representativos
- ✅ Script idempotente (puede ejecutarse múltiples veces)

**Implementación**:
- Incluido en `database_schema.sql`
- INSERT ON CONFLICT DO NOTHING

---

## 🎯 ÉPICA 3: TELEGRAM BOT

### Epic Summary
Desarrollar bot de Telegram completo con MiniApp, inline mode, y todas las funcionalidades HAIDA.

### Business Value
Interfaz conversacional 24/7 para QA Engineers, accesible desde cualquier dispositivo móvil.

### Stories

#### HAIDA-20: Bot Core con Menú Principal
**Tipo**: Story
**Prioridad**: Alta
**Story Points**: 8

**Descripción**:
Como usuario, necesito un bot de Telegram con menú interactivo para acceder a funciones HAIDA.

**Criterios de Aceptación**:
- ✅ Comando /start con menú completo
- ✅ Botones inline para navegación
- ✅ Opciones:
  - 📊 Dashboard Web (MiniApp)
  - ✅ Estado Sistema
  - 🧪 Tests
  - 📈 Reportes
  - 🎯 Jira
  - 📚 Confluence
  - 💬 Chat IA
- ✅ Respuestas < 1 segundo
- ✅ Manejo de errores graceful

**Implementación**:
- Archivo: `scripts/telegram_bot_v2.py`
- Líneas: 243
- Framework: python-telegram-bot 20.7

**Deployment**:
- Plataforma: Railway
- Uptime: 99.9%
- Modo: Worker 24/7

---

#### HAIDA-21: MiniApp Dashboard
**Tipo**: Story
**Prioridad**: Media
**Story Points**: 13

**Descripción**:
Como usuario móvil, necesito un dashboard web embebido en Telegram para ver métricas visuales.

**Criterios de Aceptación**:
- ✅ WebAppInfo configurado
- ✅ URL: https://haida-dashboard.vercel.app
- ✅ Componentes:
  - Gráficos de tendencias
  - Estado de tests en tiempo real
  - Últimos reportes
  - Notificaciones
- ✅ Responsive design
- ✅ Autenticación JWT integrada

**Implementación**:
- Framework: Next.js 14
- Deployment: Vercel
- Estado: ⏳ Planeado

---

#### HAIDA-22: Inline Mode
**Tipo**: Story
**Prioridad**: Baja
**Story Points**: 5

**Descripción**:
Como usuario, quiero usar el bot en cualquier chat de Telegram mediante @haida_bot.

**Criterios de Aceptación**:
- ✅ InlineQueryHandler implementado
- ✅ Resultados:
  - Estado del sistema
  - Link a documentación
  - Link a Jira
  - Últimos reportes
- ✅ Búsqueda por keywords
- ✅ Formato: InlineQueryResultArticle

**Implementación**:
- Handler: `inline_query()` en telegram_bot_v2.py

---

## 🎯 ÉPICA 4: TESTING AUTOMATIZADO

### Epic Summary
Implementar runners para 4 tipos de tests: E2E Web, API, Performance, Accessibility.

### Business Value
Cobertura de testing 360° con reporting unificado y ejecución automatizada.

### Stories

#### HAIDA-30: Tests E2E Web (Playwright)
**Tipo**: Story
**Prioridad**: Alta
**Story Points**: 21

**Descripción**:
Como QA Engineer, necesito ejecutar tests E2E automatizados en múltiples navegadores.

**Criterios de Aceptación**:
- ✅ Framework: Playwright 1.41+
- ✅ Navegadores: Chromium, Firefox, WebKit, Mobile
- ✅ Tipos de tests:
  - Smoke tests (críticos)
  - Regression (cobertura completa)
  - Visual regression
  - Cross-browser
- ✅ Features:
  - Screenshots en fallos
  - Videos de ejecución
  - Traces para debugging
  - Paralelización (workers: 4)
- ✅ Reporting: Allure Framework
- ✅ Ejecución: < 5 minutos para 50 tests

**Implementación**:
- Directorio: `tests/playwright/`
- Configuración: `playwright.config.ts`
- Docker: Imagen mcr.microsoft.com/playwright

**Métricas de Éxito**:
- Cobertura: 95%+ de user journeys
- Flakiness: < 1%
- Success rate: > 98%

---

#### HAIDA-31: Tests API (Newman/Postman)
**Tipo**: Story
**Prioridad**: Alta
**Story Points**: 13

**Descripción**:
Como QA Engineer, necesito validar todos los endpoints API con collections Postman.

**Criterios de Aceptación**:
- ✅ Framework: Newman 6.0+
- ✅ Collections organizadas por módulo:
  - Auth
  - Tests
  - Reports
  - Jira
  - Confluence
  - AI
- ✅ Environments: dev, qa, staging, prod
- ✅ Assertions completas:
  - Status codes
  - Response time (< 500ms)
  - Schema validation
  - Data correctness
- ✅ Reporting: Allure + HTML
- ✅ CI/CD integration

**Implementación**:
- Directorio: `tests/newman/`
- Collections: JSON format
- Runner: newman run

**Cobertura**:
- 23 endpoints
- 100+ assertions
- 4 environments

---

#### HAIDA-32: Tests de Performance (k6)
**Tipo**: Story
**Prioridad**: Media
**Story Points**: 8

**Descripción**:
Como DevOps, necesito tests de carga para validar escalabilidad del sistema.

**Criterios de Aceptación**:
- ✅ Framework: k6
- ✅ Tipos de tests:
  - Load: 100 VUs concurrentes
  - Stress: Hasta breaking point
  - Spike: Picos de tráfico repentinos
  - Soak: Estabilidad 24h
- ✅ Métricas:
  - Response time (p95 < 200ms)
  - Throughput (RPS)
  - Error rate (< 0.1%)
- ✅ Thresholds automáticos
- ✅ Grafana dashboards

**Implementación**:
- Directorio: `tests/k6/`
- Scripts: JavaScript
- Reporting: InfluxDB + Grafana

**SLOs**:
- P95 latency: < 200ms
- P99 latency: < 500ms
- Throughput: > 1000 RPS
- Availability: 99.9%

---

#### HAIDA-33: Tests de Accesibilidad (Lighthouse)
**Tipo**: Story
**Prioridad**: Media
**Story Points**: 5

**Descripción**:
Como QA Accessibility, necesito auditorías WCAG 2.0 AA automatizadas.

**Criterios de Aceptación**:
- ✅ Framework: Lighthouse 12.0+ + axe-core 4.9
- ✅ Validaciones:
  - WCAG 2.0 AA compliance
  - Color contrast
  - Keyboard navigation
  - Screen reader compatibility
  - ARIA labels
- ✅ Métricas Core Web Vitals:
  - LCP < 2.5s
  - FID < 100ms
  - CLS < 0.1
- ✅ Scores: > 90 en Accessibility
- ✅ Reporting: HTML + JSON

**Implementación**:
- Tool: lighthouse CLI
- Config: `lighthouse.config.js`
- Integration: CI/CD pipeline

**Compliance**:
- WCAG 2.0 AA: 100%
- Best Practices: > 95
- Performance: > 90
- SEO: > 90

---

## 🎯 ÉPICA 5: DEVOPS & INFRAESTRUCTURA

### Epic Summary
Configurar Docker, CI/CD, deployment en Railway, y monitoring.

### Business Value
Deployment automatizado, alta disponibilidad, y observabilidad completa del sistema.

### Stories

#### HAIDA-40: Docker Compose
**Tipo**: Story
**Prioridad**: Alta
**Story Points**: 8

**Descripción**:
Como desarrollador, necesito entorno local containerizado con todos los servicios.

**Criterios de Aceptación**:
- ✅ 7 servicios Docker:
  1. api (FastAPI)
  2. postgres (PostgreSQL 15)
  3. redis (Redis 7)
  4. bot (Telegram)
  5. playwright (Test runner)
  6. newman (API tests)
  7. allure (Reports server)
- ✅ Networking: haida-network
- ✅ Volumes persistentes
- ✅ Health checks
- ✅ Restart policies
- ✅ docker-compose up -d → Todo funciona
- ✅ Tiempo de inicio: < 2 minutos

**Implementación**:
- Archivo: `docker-compose.yml`
- Imagen base: python:3.11-slim
- Puertos expuestos: 8000, 5432, 6379, 5050

**Métricas Reales**:
- Servicios configurados: 7
- Volúmenes: 2 (postgres-data, redis-data)

---

#### HAIDA-41: Deployment Railway
**Tipo**: Story
**Prioridad**: Alta
**Story Points**: 5

**Descripción**:
Como DevOps, necesito deployment automático en Railway para 24/7 uptime.

**Criterios de Aceptación**:
- ✅ Procfile configurado: `worker: python3 scripts/telegram_bot_v2.py`
- ✅ railway.json con builder NIXPACKS
- ✅ Runtime: Python 3.11.7
- ✅ Auto-deploy en push a main
- ✅ Variables de entorno sincronizadas
- ✅ Health checks: GET /health cada 60s
- ✅ Restart on failure (max 10 retries)
- ✅ Logs centralizados

**Implementación**:
- Archivos:
  - `Procfile`
  - `railway.json`
  - `runtime.txt`
  - `deploy_railway.sh`
- URL: https://haida-api.railway.app

**Uptime SLA**:
- Target: 99.9%
- Max downtime/mes: 43 minutos

---

#### HAIDA-42: CI/CD Pipeline
**Tipo**: Story
**Prioridad**: Media
**Story Points**: 13

**Descripción**:
Como equipo, necesitamos pipeline automatizado para testing y deployment.

**Criterios de Aceptación**:
- ✅ GitHub Actions workflows:
  - ci.yml: Tests on every PR
  - deploy.yml: Deploy on merge to main
- ✅ Jobs:
  - Lint (black, flake8, mypy)
  - Unit tests (pytest)
  - Integration tests
  - E2E tests (Playwright)
  - API tests (Newman)
  - Build Docker images
  - Deploy to Railway
- ✅ Branch protection rules
- ✅ Required checks: All tests pass
- ✅ Auto-deploy: main → production

**Implementación**:
- Directorio: `.github/workflows/`
- Estado: ⏳ Planeado

---

## 🎯 ÉPICA 6: REPORTING & ANALYTICS

### Epic Summary
Sistema unificado de reportes con Allure Framework, trending histórico, y exportación.

### Business Value
Visibilidad completa de calidad, métricas accionables, y reportes ejecutivos.

### Stories

#### HAIDA-50: Allure Framework Integration
**Tipo**: Story
**Prioridad**: Alta
**Story Points**: 8

**Descripción**:
Como QA Lead, necesito reportes unificados de todos los tipos de tests.

**Criterios de Aceptación**:
- ✅ Allure Docker service en puerto 5050
- ✅ Integración con:
  - Playwright (allure-playwright)
  - Newman (newman-reporter-allure)
  - Pytest (allure-pytest)
- ✅ Features:
  - Timeline de ejecuciones
  - Trending histórico
  - Categorización de fallos
  - Screenshots y logs
  - Test duration metrics
  - Flaky tests detection
- ✅ Retención: 30 días
- ✅ Exportación: HTML, JSON

**Implementación**:
- Docker: frankescobar/allure-docker-service
- Directorios:
  - allure-results/
  - allure-reports/

**Métricas**:
- Tests ejecutados/día: ~500
- Reportes generados/semana: ~50
- Storage requerido: ~1 GB/mes

---

## 🎯 ÉPICA 7: SEGURIDAD & COMPLIANCE

### Epic Summary
Implementar medidas de seguridad enterprise-grade y cumplimiento regulatorio.

### Business Value
Protección de datos sensibles, auditoría completa, y compliance GDPR/WCAG.

### Stories

#### HAIDA-60: Seguridad API
**Tipo**: Story
**Prioridad**: Alta
**Story Points**: 8

**Descripción**:
Como Security Engineer, necesito API protegida contra vulnerabilidades comunes.

**Criterios de Aceptación**:
- ✅ JWT tokens con expiración (30 min)
- ✅ CORS configurado (whitelist)
- ✅ Rate limiting: 100 req/min por IP
- ✅ HTTPS obligatorio (TLS 1.3)
- ✅ Headers de seguridad:
  - X-Content-Type-Options
  - X-Frame-Options
  - X-XSS-Protection
  - Strict-Transport-Security
- ✅ Input validation (Pydantic)
- ✅ SQL injection prevention (ORMs)
- ✅ XSS prevention (escaping)
- ✅ CSRF tokens

**Implementación**:
- Middleware: FastAPI security
- Validación: Pydantic v2
- Headers: SecurityHeaders middleware

**Auditoría**:
- OWASP Top 10: Mitigado
- Pentesting: Trimestral
- Vulnerabilities: 0 critical, 0 high

---

#### HAIDA-61: Auditoría y Logging
**Tipo**: Story
**Prioridad**: Media
**Story Points**: 5

**Descripción**:
Como Compliance Officer, necesito trazabilidad completa de todas las acciones.

**Criterios de Aceptación**:
- ✅ Logs estructurados (JSON)
- ✅ Niveles: DEBUG, INFO, WARNING, ERROR, CRITICAL
- ✅ Eventos auditados:
  - Login/logout
  - Creación/modificación de recursos
  - Ejecución de tests
  - Acceso a datos sensibles
- ✅ Retención: 90 días
- ✅ Almacenamiento: Centralizado
- ✅ Búsqueda: Elasticsearch (futuro)
- ✅ Alertas: Critical errors → Slack

**Implementación**:
- Logger: Python logging
- Formato: JSON
- Destino: Stdout → Railway logs

---

## 📊 MÉTRICAS DE ÉXITO DEL PROYECTO

### KPIs Técnicos
- **API Uptime**: > 99.9%
- **Response Time (p95)**: < 200ms
- **Test Success Rate**: > 98%
- **Code Coverage**: > 80%
- **Zero Downtime Deploys**: 100%
- **Security Vulnerabilities**: 0 critical/high

### KPIs de Negocio
- **Time to Market**: -60% (vs. manual testing)
- **Bug Detection Rate**: +40% (vs. manual)
- **QA Engineer Productivity**: +90%
- **Cost Savings**: €2,000-3,000/proyecto/mes
- **ROI**: 1,200-1,500% anual

### KPIs de Calidad
- **Test Coverage**: > 95%
- **ISTQB Compliance**: 100%
- **WCAG 2.0 AA**: 100%
- **User Satisfaction (NPS)**: > 70

---

## 🎯 ROADMAP POR FASES

### ✅ Fase 1: MVP (Q4 2024) - COMPLETADA
- Backend FastAPI completo
- Base de datos Supabase
- Telegram Bot v2.0
- Integraciones Jira/Confluence
- Docker Compose
- Documentación empresarial

### 🔄 Fase 2: Production Ready (Q1 2025) - EN CURSO
- Deployment Railway estable
- Tests E2E funcionales
- Reportes Allure
- CI/CD GitHub Actions
- Monitoring básico

### ⏳ Fase 3: Escalabilidad (Q2 2025)
- Dashboard Next.js
- Frontend completo
- Multi-tenancy completo
- Auto-scaling
- Monitoring avanzado (Grafana)

### 🔮 Fase 4: IA Avanzada (Q3-Q4 2025)
- Auto-healing tests
- Visual regression ML
- Predicción de bugs
- NLP test generation
- Mobile app (iOS/Android)

---

## 💰 INVERSIÓN Y PRESUPUESTO

### Costos de Desarrollo (Actual)
- **Desarrollo**: 400 horas × €50/hora = €20,000
- **Infraestructura**: €100/mes (Railway + Supabase)
- **Herramientas**: €0 (open source)
- **Total Fase 1**: €20,000

### Proyección de Costos (Anual)
- **Mantenimiento**: €500/mes = €6,000/año
- **Infraestructura**: €100/mes = €1,200/año
- **Licencias**: €0 (open source)
- **Total Año 1**: €7,200

### ROI Proyectado
- **Ahorro por proyecto**: €3,000/mes
- **Proyectos simultáneos**: 5
- **Ahorro anual**: €180,000
- **Inversión inicial**: €20,000
- **ROI**: 900% primer año

---

## 📞 STAKEHOLDERS

### Equipo de Desarrollo
- **Carlos Arévalo** - CEO STAYArta, Creator HAIDA
- Email: hola@stayarta.com
- Rol: Product Owner + Lead Developer

### Cliente
- **Hiberus** - Empresa de consultoría TI
- **CTB** - Cliente final de Hiberus
- Rol: Usuario final de la plataforma

### Partners Tecnológicos
- **Railway** - Hosting y deployment
- **Supabase** - Database as a Service
- **Vercel** - Frontend hosting (futuro)
- **Atlassian** - Jira + Confluence

---

**Documento creado**: Diciembre 2025
**Próxima revisión**: Q1 2026
**Versión**: 1.0.0
