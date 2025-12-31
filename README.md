# 🚀 HAIDA v2.0 - Hiberus AI-Driven Automation

> **QA Automation Platform** powered by FastAPI, Supabase, DeepSeek R1, and modern testing tools

## 📋 Tabla de Contenidos

- [Descripción](#descripción)
- [Arquitectura](#arquitectura)
- [Stack Tecnológico](#stack-tecnológico)
- [Instalación](#instalación)
- [Configuración](#configuración)
- [Uso](#uso)
- [API Endpoints](#api-endpoints)
- [Telegram Bot](#telegram-bot)
- [Docker](#docker)
- [Base de Datos](#base-de-datos)
- [Deployment](#deployment)
- [Documentación](#documentación)

---

## 📖 Descripción

**HAIDA** es una plataforma completa de automatización QA que integra:
- ✅ Tests E2E web (Playwright)
- ✅ Tests API (Newman/Postman)
- ✅ Tests de performance (k6)
- ✅ Tests de accesibilidad (Lighthouse)
- ✅ Reportes automáticos (Allure)
- ✅ Integración Jira/Confluence
- ✅ Chat IA con DeepSeek R1
- ✅ Telegram Bot 24/7
- ✅ Dashboard web

---

## 🏗️ Arquitectura

```
┌─────────────────┐
│  Telegram Bot   │ ←→ Railway (24/7)
└────────┬────────┘
         │
┌────────▼────────┐
│   FastAPI API   │ ←→ Railway/Local
└────────┬────────┘
         │
┌────────▼────────┐     ┌──────────────┐
│   Supabase DB   │ ←→  │  LM Studio   │
│   (PostgreSQL)  │     │  DeepSeek R1 │
└─────────────────┘     └──────────────┘
         │
┌────────▼────────┐
│  Test Runners   │
│ • Playwright    │
│ • Newman        │
│ • k6            │
│ • Lighthouse    │
└─────────────────┘
         │
┌────────▼────────┐     ┌──────────────┐
│ Allure Reports  │ ←→  │ Jira/Conflu. │
└─────────────────┘     └──────────────┘
```

---

## 💻 Stack Tecnológico

### Backend
- **FastAPI** 0.109.0 - Web framework
- **Uvicorn** - ASGI server
- **SQLAlchemy** 2.0 - ORM
- **Alembic** - DB migrations
- **Pydantic** v2 - Validation

### Database
- **Supabase** (PostgreSQL) - Database principal
- **Redis** - Cache y queues

### Testing
- **Playwright** 1.41 - Tests E2E web
- **Newman** - Tests API (Postman)
- **k6** - Performance testing
- **Lighthouse** - Accessibility
- **Allure** - Reports

### AI/ML
- **LM Studio** - DeepSeek R1 local

### Integrations
- **python-telegram-bot** 20.7
- **atlassian-python-api** 3.41
- **Supabase Client**

### DevOps
- **Docker** + **Docker Compose**
- **Railway** - Deployment
- **GitHub Actions** - CI/CD (pendiente)

---

## 🔧 Instalación

### Prerequisitos
- Python 3.11+
- Docker + Docker Compose
- Node.js 20+ (para Newman, Lighthouse)
- Git

### 1. Clonar proyecto
```bash
cd ~/Hiberus/HAIDA-PROJECT
```

### 2. Instalar dependencias Python
```bash
python3 -m venv venv
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate  # Windows

pip install -r requirements.txt
```

### 3. Instalar dependencias Node.js
```bash
npm install -g newman lighthouse allure-commandline
```

### 4. Instalar browsers (Playwright)
```bash
playwright install chromium
```

---

## ⚙️ Configuración

### 1. Variables de Entorno (.env)

Copia el archivo de ejemplo y completa los valores:

```bash
cp .env.example .env
```

Ejemplo de configuración:

```bash
# Database
DATABASE_URL=postgresql://postgres:...@db.your-project.supabase.co:5432/postgres
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=YOUR_SUPABASE_KEY

# Atlassian
ATLASSIAN_URL=https://stayarta.atlassian.net
ATLASSIAN_EMAIL=hola@stayarta.com
ATLASSIAN_API_TOKEN=YOUR_ATLASSIAN_API_TOKEN

# Telegram
TELEGRAM_BOT_TOKEN=YOUR_TELEGRAM_BOT_TOKEN

# LM Studio
LM_STUDIO_URL=http://localhost:1234/v1
LM_STUDIO_MODEL=lmstudio-community/DeepSeek-R1-0528-Qwen3-8B-MLX-4bit

# JWT
JWT_SECRET=change_me_in_production
```

### 2. Inicializar Base de Datos

Ejecuta el script SQL en Supabase SQL Editor:

```bash
# 1. Ir a https://supabase.com/dashboard
# 2. Abrir proyecto
# 3. SQL Editor
# 4. Copiar y ejecutar database_schema.sql
```

O ejecuta localmente:
```bash
psql $DATABASE_URL < database_schema.sql
```

---

## 🚀 Uso

### Opción 1: Docker Compose (Recomendado)

```bash
# Iniciar todos los servicios
docker-compose up -d

# Ver logs
docker-compose logs -f

# Parar servicios
docker-compose down
```

Servicios disponibles:
- API: http://localhost:8000
- Docs: http://localhost:8000/docs
- Allure: http://localhost:5050
- PostgreSQL: localhost:5432
- Redis: localhost:6379

### Opción 2: Local (Desarrollo)

```bash
# Terminal 1: API
uvicorn app.main:app --reload

# Terminal 2: Bot
python3 scripts/telegram_bot_v2.py

# Terminal 3: Redis (opcional)
redis-server
```

---

## 📚 API Endpoints

### Authentication
```http
POST /api/auth/login       # Login (returns JWT)
POST /api/auth/register    # Register new user
GET  /api/auth/me         # Get current user
POST /api/auth/refresh    # Refresh token
POST /api/auth/logout     # Logout
```

### Tests
```http
GET  /api/tests                    # List test suites
POST /api/tests/run                # Run tests
GET  /api/tests/{id}/status        # Test status
GET  /api/tests/{id}/results       # Test results
```

### Reports
```http
GET  /api/reports                  # List reports
GET  /api/reports/{id}             # Get report
POST /api/reports/generate         # Generate report
GET  /api/reports/{id}/pdf         # Download PDF
```

### Jira
```http
GET  /api/jira/issues              # List issues
POST /api/jira/issues              # Create issue
PUT  /api/jira/issues/{key}        # Update issue
```

### Confluence
```http
GET  /api/confluence/pages         # List pages
POST /api/confluence/pages         # Create page
PUT  /api/confluence/pages/{id}    # Update page
```

### AI
```http
POST /api/ai/chat                  # Chat with DeepSeek
GET  /api/ai/history               # Chat history
```

### Health
```http
GET  /health                       # Health check
GET  /status                       # System status
```

---

## 🤖 Telegram Bot

### Funcionalidades

- **Dashboard Web** (MiniApp)
- **Estado del Sistema**
- **Ejecutar Tests** (Web, API, Performance, A11y)
- **Ver Reportes**
- **Integración Jira/Confluence**
- **Chat con IA** (DeepSeek R1)
- **Modo Inline** (usar en cualquier chat)

### Comandos

```
/start   - Menú principal
/status  - Estado del sistema
```

### Uso en cualquier chat (Inline Mode)

```
@haida_bot <consulta>
```

### Deployment Railway

```bash
# Deploy automático con Git
git push railway main

# O manual
./deploy_railway.sh
```

---

## 🐳 Docker

### Servicios en docker-compose.yml

1. **api** - FastAPI backend (puerto 8000)
2. **postgres** - PostgreSQL database (puerto 5432)
3. **redis** - Redis cache (puerto 6379)
4. **bot** - Telegram bot (siempre activo)
5. **playwright** - Test runner E2E
6. **newman** - Test runner API
7. **allure** - Reports server (puerto 5050)

### Comandos útiles

```bash
# Rebuild servicios
docker-compose build

# Ver servicios corriendo
docker-compose ps

# Logs de un servicio específico
docker-compose logs -f api

# Ejecutar comando en contenedor
docker-compose exec api python3 -c "print('Hello')"

# Limpiar todo
docker-compose down -v
```

---

## 💾 Base de Datos

### Schema

- **users** - Usuarios del sistema
- **projects** - Proyectos QA
- **test_suites** - Suites de tests
- **test_executions** - Ejecuciones de tests
- **reports** - Reportes generados
- **jira_issues** - Issues de Jira sincronizados
- **ai_chats** - Historial de chat con IA

### Usuarios Demo

| Email | Password | Role |
|-------|----------|------|
| admin@haida.com | admin123 | Admin |
| qa@haida.com | admin123 | QA Engineer |
| dev@haida.com | admin123 | Developer |
| viewer@haida.com | admin123 | Viewer |

### Migraciones (Alembic)

```bash
# Crear migración
alembic revision --autogenerate -m "descripción"

# Aplicar migraciones
alembic upgrade head

# Revertir migración
alembic downgrade -1
```

---

## 🌐 Deployment

### Railway (Bot + API)

1. Conecta el repo a Railway
2. Las variables de entorno ya están en .env
3. Railway detecta automáticamente Procfile y railway.json
4. Deploy automático en cada push a main

### Vercel (Frontend - Pendiente)

Dashboard Next.js en: https://haida-dashboard.vercel.app

---

## 📖 Documentación

### Swagger UI
http://localhost:8000/docs

### ReDoc
http://localhost:8000/redoc

### Confluence
https://stayarta.atlassian.net/wiki/spaces/HAIDA

---

## 🧪 Tests

### Ejecutar tests

```bash
# Tests unitarios
pytest tests/unit -v

# Tests E2E (Playwright)
playwright test

# Tests API (Newman)
newman run tests/newman/collection.json

# Tests performance (k6)
k6 run tests/k6/load-test.js

# Tests accesibilidad (Lighthouse)
lighthouse http://localhost:3000 --view
```

### Ver reportes (Allure)

```bash
# Generar reporte
allure generate allure-results -o allure-reports

# Ver reporte
allure open allure-reports
```

---

## 📁 Estructura del Proyecto

```
HAIDA-PROJECT/
├── app/
│   ├── main.py                 # FastAPI app
│   ├── config.py               # Configuration
│   ├── routers/                # API endpoints
│   │   ├── auth.py
│   │   ├── tests.py
│   │   ├── reports.py
│   │   ├── jira.py
│   │   ├── confluence.py
│   │   ├── ai.py
│   │   └── health.py
│   ├── models/                 # SQLAlchemy models
│   ├── schemas/                # Pydantic schemas
│   ├── services/               # Business logic
│   └── db/                     # Database
├── scripts/
│   ├── telegram_bot_v2.py      # Telegram bot
│   ├── upload_conf.py          # Confluence uploader
│   └── bot.py                  # Bot básico
├── tests/                      # Test files
│   ├── playwright/
│   ├── newman/
│   ├── k6/
│   └── lighthouse/
├── docker-compose.yml          # Docker services
├── Dockerfile                  # API container
├── requirements.txt            # Python deps
├── database_schema.sql         # DB schema
├── .env                        # Environment vars
├── Procfile                    # Railway config
├── railway.json                # Railway settings
└── README.md                   # This file
```

---

## 🔒 Seguridad

- JWT authentication
- Row Level Security (RLS) en Supabase
- CORS configurado
- Passwords hasheados con bcrypt
- API tokens en .env (nunca en código)

---

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama (`git checkout -b feature/amazing-feature`)
3. Commit cambios (`git commit -m 'Add amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

---

## 📝 Licencia

Copyright © 2025 Hiberus - Carlos Arévalo (STAYArta)

---

## 👥 Autor

**Carlos Arévalo**
- CEO STAYArta
- Creator of HAIDA
- Email: hola@stayarta.com

**Empresa**: Hiberus
**Cliente**: CTB (Cliente de Hiberus que usará HAIDA)

---

## 📞 Soporte

- **Issues**: https://github.com/hiberus/haida/issues
- **Confluence**: https://stayarta.atlassian.net/wiki/spaces/HAIDA
- **Telegram Bot**: @haida_bot

---

## ✅ Status del Proyecto

| Componente | Estado | Completado |
|------------|--------|------------|
| Backend FastAPI | ✅ | 100% |
| Telegram Bot | ✅ | 100% |
| Database Schema | ✅ | 100% |
| Docker Compose | ✅ | 100% |
| API Endpoints | ✅ | 100% |
| Auth JWT | ✅ | 100% |
| Integrations | ⚠️ | 70% |
| Tests Suites | ⏳ | 30% |
| Frontend Dashboard | ⏳ | 0% |
| CI/CD | ⏳ | 0% |

**Leyenda**: ✅ Completo | ⚠️ Parcial | ⏳ Pendiente

---

**Última actualización**: 31 de Diciembre de 2025
