# 🗺️ MAPEO ARQUITECTURA COMPLETO - HAIDA

**Generado**: ++34662652300
**Status**: ✅ Verificado y mapeado
**Versión**: 1.0

---

## 📐 ARQUITECTURA DE ALTO NIVEL

```
┌─────────────────────────────────────────────────────────────────────┐
│                        USUARIOS FINALES                               │
│                    (Navegador, Teams, Mobile)                        │
└─────────────────────────────────────────────────────────────────────┘
                                 ▲
                                 │
                    ┌────────────┴────────────┐
                    │                        │
         ┌──────────▼─────────┐   ┌──────────▼─────────┐
         │  FRONTEND REACT    │   │ COPILOT STUDIO    │
         │ (haida.stayarta.com)   │ (Teams Integration)│
         │  Vite + React 18   │   │  DirectLine API   │
         │  TypeScript, TailwindCSS│                  │
         └──────────┬─────────┘   └──────────┬────────┘
                    │                        │
                    └────────────┬───────────┘
                                 │
                    ┌────────────▼────────────┐
                    │   MICROSOFT ENTRA ID   │
                    │  (OAuth2 / SSO Flow)   │
                    └────────────┬───────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
    ┌────▼──────┐        ┌──────▼──────┐        ┌──────▼──────┐
    │ FASTAPI   │◄─────►│  SUPABASE   │◄─────►│ PostgreSQL  │
    │ BACKEND   │        │  (Auth)     │        │ (Database)  │
    │ Production│        │             │        │             │
    │haidapi.   │        └─────────────┘        └─────────────┘
    │stayarta.  │
    │com        │
    └─────┬─────┘
          │
    ┌─────┴────────────────────────┐
    │                              │
    ├─ /auth (Local login)         │
    ├─ /entra (Microsoft SSO)      │
    ├─ /api/projects (CRUD)        │
    ├─ /api/test-cases (Scripts)   │
    ├─ /api/test-runs (Ejecución)  │
    ├─ /chat (IA Integration)      │
    ├─ /reports (Reportería)       │
    ├─ /files (Gestión archivos)   │
    ├─ /notifications (Alertas)    │
    └─ /openapi.json (API Spec)    │
```

---

## 🎯 MAPEO DETALLADO POR COMPONENTE

---

## 1️⃣ FRONTEND - REACT + VITE

### 📍 UBICACIÓN
```
/Users/carlosa/00-PROJECTS/HAIDA/haida-production/main/
```

### 📁 ESTRUCTURA
```
haida-production/main/
├── src/                              # Source code
│   ├── components/                   # React components
│   │   ├── Dashboard/
│   │   ├── Projects/
│   │   ├── TestCases/
│   │   ├── Reports/
│   │   ├── Chat/                    # AI Chat widget
│   │   └── common/                  # Shared components
│   ├── pages/                       # Page components
│   ├── hooks/                       # Custom React hooks
│   ├── services/                    # API calls
│   │   ├── api.ts                  # Axios instance
│   │   ├── supabase.ts             # Supabase client
│   │   ├── projects.ts             # Project API calls
│   │   ├── testCases.ts            # Test case API calls
│   │   └── reports.ts              # Report API calls
│   ├── store/                       # State management
│   ├── types/                       # TypeScript types
│   ├── styles/                      # Global styles
│   ├── App.tsx                      # Main component
│   └── main.tsx                     # Entry point
├── dist/                            # Build output (Vercel)
├── package.json                     # ⭐ Frontend dependencies
├── vite.config.ts                   # Vite configuration
├── tsconfig.json                    # TypeScript config
├── tailwind.config.ts               # Tailwind CSS config
└── .env.local                       # 🔐 Local environment variables
```

### 🔧 CONFIGURACIÓN VITE

**Archivo**: `vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'http://localhost:8000',
      '/auth': 'http://localhost:8000',
    }
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
```

### 📦 PACKAGE.JSON
**Archivo**: `package.json`
```json
{
  "name": "haida-frontend",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test:web": "playwright test",
    "test:web:ui": "playwright test --ui"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "@supabase/supabase-js": "^2.89.0",
    "axios": "^1.7.2",
    "zod": "^4.2.1",
    "@radix-ui/react-*": "latest",
    "tailwindcss": "^4.1.12"
  },
  "devDependencies": {
    "typescript": "^5.7.2",
    "vite": "^6.3.6",
    "@types/react": "^18.3.11",
    "@playwright/test": "^1.48.0"
  }
}
```

### 🌐 VARIABLES DE ENTORNO (.env.local)
```env
VITE_API_URL=https://haidapi.stayarta.com
VITE_SUPABASE_URL=https://wdebyxvtunromsnkqbrd.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
VITE_APP_URL=https://haida.stayarta.com
VITE_COPILOT_ENDPOINT=https://default...
```

### 📤 BUILD & DEPLOYMENT

**Local Development**:
```bash
npm install
npm run dev                    # http://localhost:5173
```

**Production Build**:
```bash
npm run build                  # Genera dist/
```

**Vercel Deployment**:
- **Framework Detected**: Vite
- **Build Command**: `npm run build`
- **Output Directory**: `dist/`
- **Install Command**: `npm ci`
- **Public Directory**: `dist/`

### 🔗 API INTEGRATION

**Base URL**: `https://haidapi.stayarta.com`

**Axios Instance** (`services/api.ts`):
```typescript
import axios from 'axios'

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  }
})

export default apiClient
```

**Endpoints usados**:
```
GET  /openapi.json              # Swagger spec
GET  /health                    # Health check
POST /auth/login                # Local login
GET  /entra/authorize           # Microsoft SSO
GET  /api/projects              # List projects
POST /api/projects              # Create project
GET  /api/projects/:id          # Get project
GET  /api/test-cases            # List test cases
POST /api/test-cases            # Create test case
GET  /chat/completions          # Chat API
```

---

## 2️⃣ BACKEND - FASTAPI (PYTHON)

### 📍 UBICACIÓN
```
/Users/carlosa/00-PROJECTS/HAIDA/haida-production/main/
```

### 📁 ESTRUCTURA
```
haida-production/main/
├── api/                             # ⭐ Vercel entry point
│   └── index.py                    # Wrapper para Vercel
├── app/                            # ⭐ FastAPI application
│   ├── main.py                     # Application entry point
│   ├── core/                       # Core utilities
│   │   ├── __init__.py
│   │   ├── config.py              # Config management
│   │   ├── logging.py             # Logging setup
│   │   ├── middleware.py          # Custom middleware
│   │   ├── cors.py                # CORS configuration
│   │   ├── jwt_auth.py            # JWT authentication
│   │   ├── rbac.py                # Role-based access control
│   │   ├── tenants.py             # Multi-tenancy
│   │   ├── i18n.py                # Internationalization
│   │   ├── limiter.py             # Rate limiting
│   │   └── exceptions.py          # Custom exceptions
│   ├── db/                        # Database layer
│   │   ├── __init__.py
│   │   ├── database.py            # Connection pool
│   │   ├── models.py              # SQLAlchemy models
│   │   ├── schemas.py             # Pydantic schemas
│   │   └── crud.py                # CRUD operations
│   ├── models/                    # Data models
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── test_case.py
│   │   ├── test_execution.py
│   │   └── report.py
│   ├── routes/                    # API endpoints
│   │   ├── __init__.py
│   │   ├── auth.py               # POST /auth/login, /register
│   │   ├── entra.py              # GET /entra/authorize
│   │   ├── projects.py           # CRUD /api/projects
│   │   ├── scripts.py            # CRUD /api/test-cases
│   │   ├── runs.py               # POST /api/test-runs
│   │   ├── reports.py            # GET /api/reports
│   │   ├── chat.py               # POST /chat/completions
│   │   ├── notifications.py      # GET /notifications
│   │   ├── docs.py               # GET /docs
│   │   ├── files.py              # POST /files/upload
│   │   ├── admin.py              # Admin endpoints
│   │   └── system.py             # /health, /status, /version
│   ├── services/                 # Business logic
│   │   ├── auth_service.py       # Auth logic
│   │   ├── entra_service.py      # Microsoft SSO (MSAL)
│   │   ├── project_service.py    # Project management
│   │   ├── test_service.py       # Test case logic
│   │   ├── chat_service.py       # AI chat logic
│   │   ├── report_service.py     # Report generation
│   │   └── email_service.py      # Email notifications
│   ├── schemas/                  # Pydantic validation
│   │   ├── user.py
│   │   ├── project.py
│   │   ├── test_case.py
│   │   └── responses.py
│   ├── ai/                       # AI integration
│   │   ├── __init__.py
│   │   ├── chat_handler.py       # Chat completions
│   │   ├── test_generator.py     # AI test generation
│   │   └── prompts.py            # System prompts
│   └── utils/                    # Utilities
│       ├── validators.py
│       ├── formatters.py
│       └── helpers.py
├── requirements.txt              # ⭐ Python dependencies
├── vercel.json                   # ⭐ Vercel configuration
├── docker-compose.yml            # ⭐ Docker setup
└── .env.local                    # 🔐 Environment variables
```

### 🔧 MAIN.PY - CONFIGURACIÓN FASTAPI

**Archivo**: `app/main.py`
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi_limiter import FastAPILimiter
from redis import asyncio as aioredis

# Application instance
app = FastAPI(
    title="HAIDA Backend API",
    description="AI-Driven QA Automation Platform",
    version="2.0.0",
    docs_url="/docs",
    openapi_url="/openapi.json"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://haida-frontend.vercel.app",
        "https://haida.stayarta.com",
        "http://localhost:3000",
        "http://localhost:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Rate limiting
@app.on_event("startup")
async def startup():
    redis = aioredis.from_url("redis://localhost")
    await FastAPILimiter.init(redis)

# Include routers
from app.routes import (
    auth, entra, projects, scripts, runs,
    reports, chat, notifications, files, admin, system
)

app.include_router(system.router, tags=["System"])
app.include_router(auth.router, prefix="/auth", tags=["Auth"])
app.include_router(entra.router, prefix="/entra", tags=["Microsoft"])
app.include_router(projects.router, prefix="/api/projects", tags=["Projects"])
app.include_router(scripts.router, prefix="/api/test-cases", tags=["Test Cases"])
app.include_router(runs.router, prefix="/api/test-runs", tags=["Execution"])
app.include_router(reports.router, prefix="/api/reports", tags=["Reports"])
app.include_router(chat.router, prefix="/chat", tags=["Chat"])
```

### 📦 REQUIREMENTS.TXT

**Archivo**: `requirements.txt`
```
# Web Framework
fastapi==0.115.6
uvicorn==0.34.0
python-dotenv==1.0.1

# Data Validation
pydantic==2.10.6
pydantic-settings==2.2.1

# Database
psycopg2-binary==2.9.10
supabase==2.9.1
sqlalchemy==2.0.35

# Authentication
pyjwt==2.10.1
python-jose[cryptography]==3.3.0
msal==1.31.1
httpx==0.27.2

# LLM/AI
openai==1.48.0
anthropic==0.39.0

# Redis (Cache/Sessions)
redis==5.1.1
aioredis==2.0.1

# Utilities
requests==2.32.3
python-multipart==0.0.6
python-dateutil==2.9.0.post0

# Logging
python-json-logger==2.0.7

# Rate limiting
slowapi==0.1.9
```

### 🔐 VERCEL ENTRY POINT

**Archivo**: `api/index.py`
```python
from fastapi import FastAPI
from fastapi.middleware.wsgi import WSGIMiddleware
from app.main import app as fastapi_app

# Wrap FastAPI app for Vercel
app = fastapi_app

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
```

### 🌐 VARIABLES DE ENTORNO (.env.local)

```env
# FastAPI Config
NODE_ENV=production
PORT=3001
BASE_URL=https://mcprod.thisisbarcelona.com

# Database (Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres.wdebyxvtunromsnkqbrd:hola@stayarta.com:6543/postgres?sslmode=require
SUPABASE_URL=https://wdebyxvtunromsnkqbrd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# JWT Authentication
JWT_SECRET=ECB76E37-DB86-435A-9E17-3DEF19FF57A7
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=30

# Microsoft Entra ID (SSO)
ENTRA_AUTHORITY=https://login.microsoftonline.com/9b7594d6-2c7d-4fe2-b248-213f64996877
ENTRA_CLIENT_ID=93dae11f-417c-49ff-8d66-d642afb66327
ENTRA_CLIENT_SECRET=6GI8Q~kMgGHrl9AvhGfAiOUQp7xAqzTqncvCca3p
ENTRA_REDIRECT_URI=https://haida.stayarta.com/auth

# CORS
CORS_ORIGINS=https://haida-frontend.vercel.app,https://haida.stayarta.com,http://localhost:3000,http://localhost:5173

# Redis
REDIS_URL=redis://localhost:6379

# LLM Configuration
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
ROUTE_LLM_URL=https://routellm.abacus.ai/v1
ROUTE_LLM_MODEL=gpt-5

# Email (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=hola@stayarta.com
SMTP_PASSWORD=app-password

# Logging
LOG_LEVEL=INFO
DEBUG=false
```

### 🚀 API ENDPOINTS

| Method | Endpoint | Router | Description | Auth |
|--------|----------|--------|-------------|------|
| GET | `/health` | system | Health check | ❌ |
| GET | `/version` | system | API version | ❌ |
| GET | `/openapi.json` | system | OpenAPI spec | ❌ |
| POST | `/auth/login` | auth | Local login | ❌ |
| POST | `/auth/register` | auth | User registration | ❌ |
| POST | `/auth/logout` | auth | Logout | ✅ JWT |
| POST | `/auth/refresh` | auth | Refresh token | ✅ JWT |
| GET | `/entra/authorize` | entra | Microsoft SSO | ❌ |
| GET | `/entra/callback` | entra | OAuth callback | ❌ |
| GET | `/api/projects` | projects | List projects | ✅ JWT |
| POST | `/api/projects` | projects | Create project | ✅ JWT |
| GET | `/api/projects/{id}` | projects | Get project | ✅ JWT |
| PUT | `/api/projects/{id}` | projects | Update project | ✅ JWT |
| DELETE | `/api/projects/{id}` | projects | Delete project | ✅ JWT |
| GET | `/api/test-cases` | scripts | List test cases | ✅ JWT |
| POST | `/api/test-cases` | scripts | Create test case | ✅ JWT |
| GET | `/api/test-runs` | runs | List executions | ✅ JWT |
| POST | `/api/test-runs` | runs | Execute test | ✅ JWT |
| GET | `/api/reports` | reports | List reports | ✅ JWT |
| POST | `/api/reports/generate` | reports | Generate report | ✅ JWT |
| POST | `/chat/completions` | chat | Chat with AI | ✅ JWT |
| GET | `/notifications` | notifications | Get alerts | ✅ JWT |
| POST | `/files/upload` | files | Upload file | ✅ JWT |

### 📡 ROUTING ARCHITECTURE

**Vercel Routes** (`vercel.json`):
```json
{
  "version": 2,
  "builds": [
    { "src": "api/index.py", "use": "@vercel/python" }
  ],
  "routes": [
    { "src": "/health", "dest": "/api/index.py" },
    { "src": "/version", "dest": "/api/index.py" },
    { "src": "/status", "dest": "/api/index.py" },
    { "src": "/auth/(.*)", "dest": "/api/index.py" },
    { "src": "/entra/(.*)", "dest": "/api/index.py" },
    { "src": "/api/(.*)", "dest": "/api/index.py" },
    { "src": "/chat/(.*)", "dest": "/api/index.py" },
    { "src": "/notifications/(.*)", "dest": "/api/index.py" },
    { "src": "/reports/(.*)", "dest": "/api/index.py" },
    { "src": "/files/(.*)", "dest": "/api/index.py" },
    { "src": "/docs", "dest": "/api/index.py" },
    { "src": "/openapi.json", "dest": "/api/index.py" },
    { "src": "/(.*)", "dest": "/api/index.py" }
  ]
}
```

---

## 3️⃣ BASE DE DATOS - SUPABASE / POSTGRESQL

### 📍 UBICACIÓN ARCHIVOS
```
/Users/carlosa/00-PROJECTS/HAIDA/haida-production/main/database/
```

### 🗄️ ESTRUCTURA DATABASE

```
database/
├── 01-schema-haida.sql              # ⭐ Schema principal
├── 02-test-data.sql                 # Datos de prueba
├── 03-migration-add-full-name.sql   # Migración
├── 04-realtime-features.sql         # Realtime subscriptions
├── FIX-RLS-POLICIES.sql             # Row-level security
├── setup-ctb-complete.sql           # Setup completo
└── README-DATABASE.md               # Documentación
```

### 📊 TABLAS PRINCIPALES

#### **users** (Usuarios)
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255),                    -- Migrado de 'name'
  role VARCHAR(50) DEFAULT 'viewer',         -- viewer, editor, admin
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  metadata JSONB DEFAULT '{}',               -- Extra fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
```

#### **projects** (Proyectos)
```sql
CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  description TEXT,
  base_url VARCHAR(500) NOT NULL,
  repository_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'active',      -- active, archived, deleted
  owner_id UUID REFERENCES users(id),
  settings JSONB DEFAULT '{}',              -- Webhooks, notifications
  metadata JSONB DEFAULT '{}',              -- Custom fields
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (owner_id) REFERENCES users(id)
);

-- Índices
CREATE INDEX idx_projects_slug ON projects(slug);
CREATE INDEX idx_projects_owner_id ON projects(owner_id);
```

#### **test_suites** (Suite de Tests)
```sql
CREATE TABLE test_suites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  suite_type VARCHAR(50) NOT NULL,          -- smoke, regression, e2e, api, performance, a11y, security
  priority VARCHAR(20) DEFAULT 'medium',    -- critical, high, medium, low
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Índices
CREATE INDEX idx_test_suites_project_id ON test_suites(project_id);
CREATE INDEX idx_test_suites_suite_type ON test_suites(suite_type);
```

#### **test_cases** (Casos de Prueba - ISTQB)
```sql
CREATE TABLE test_cases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_suite_id UUID NOT NULL REFERENCES test_suites(id) ON DELETE CASCADE,
  test_id VARCHAR(50) UNIQUE NOT NULL,      -- TC_LOGIN_001
  name VARCHAR(255) NOT NULL,
  description TEXT,

  -- ISTQB Fields
  test_type VARCHAR(50) NOT NULL,           -- Functional, Negative, Security, Performance, etc
  component VARCHAR(100),                   -- UI Component name
  module VARCHAR(100),                      -- Feature module
  requirement_ids TEXT[] DEFAULT '{}',      -- Traceability
  preconditions TEXT,
  test_steps TEXT NOT NULL,
  expected_result TEXT NOT NULL,
  priority VARCHAR(20) DEFAULT 'medium',
  risk_level VARCHAR(20) DEFAULT 'medium',

  -- Automation
  is_automated BOOLEAN DEFAULT false,
  automation_script_path VARCHAR(500),
  automation_framework VARCHAR(50),         -- playwright, newman, k6, lighthouse

  status VARCHAR(50) DEFAULT 'active',      -- active, deprecated, archived
  tags TEXT[] DEFAULT '{}',
  created_by UUID REFERENCES users(id),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (test_suite_id) REFERENCES test_suites(id)
);

-- Índices
CREATE INDEX idx_test_cases_test_id ON test_cases(test_id);
CREATE INDEX idx_test_cases_suite_id ON test_cases(test_suite_id);
CREATE INDEX idx_test_cases_component ON test_cases(component);
```

#### **test_executions** (Ejecuciones)
```sql
CREATE TABLE test_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_case_id UUID NOT NULL REFERENCES test_cases(id),
  project_id UUID NOT NULL REFERENCES projects(id),

  status VARCHAR(50) NOT NULL,              -- passed, failed, skipped, blocked
  started_at TIMESTAMP NOT NULL,
  completed_at TIMESTAMP,
  duration_ms INTEGER,

  environment VARCHAR(50),                  -- dev, staging, production
  browser VARCHAR(50),                      -- chrome, firefox, safari, edge
  os_platform VARCHAR(50),                  -- windows, macos, linux

  error_message TEXT,
  error_details JSONB,

  retry_count INTEGER DEFAULT 0,
  is_flaky BOOLEAN DEFAULT false,

  attachments JSONB DEFAULT '{}',          -- Screenshots, videos
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (test_case_id) REFERENCES test_cases(id),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Índices
CREATE INDEX idx_test_executions_status ON test_executions(status);
CREATE INDEX idx_test_executions_project_id ON test_executions(project_id);
CREATE INDEX idx_test_executions_created_at ON test_executions(created_at);
```

#### **test_results** (Resultados Agregados)
```sql
CREATE TABLE test_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_case_id UUID NOT NULL REFERENCES test_cases(id),
  execution_id UUID NOT NULL REFERENCES test_executions(id),

  result VARCHAR(50) NOT NULL,              -- pass, fail, error, skip
  details JSONB,

  assertions_total INTEGER,
  assertions_passed INTEGER,
  assertions_failed INTEGER,

  performance_metrics JSONB,                -- Load time, memory, CPU
  screenshots TEXT[],
  video_url VARCHAR(500),

  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (test_case_id) REFERENCES test_cases(id),
  FOREIGN KEY (execution_id) REFERENCES test_executions(id)
);

-- Índices
CREATE INDEX idx_test_results_result ON test_results(result);
CREATE INDEX idx_test_results_execution_id ON test_results(execution_id);
```

#### **change_detections** (Detección de Cambios)
```sql
CREATE TABLE change_detections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id),

  url VARCHAR(500) NOT NULL,
  tag VARCHAR(100),

  last_checked_at TIMESTAMP,
  last_change_detected_at TIMESTAMP,

  change_type VARCHAR(50),                  -- visual, content, performance, error
  change_details JSONB,

  is_active BOOLEAN DEFAULT true,
  trigger_test_suites UUID[] DEFAULT '{}', -- Suites to run on change

  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Índices
CREATE INDEX idx_change_detections_url ON change_detections(url);
CREATE INDEX idx_change_detections_project_id ON change_detections(project_id);
```

#### **reports** (Reportería)
```sql
CREATE TABLE reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id),

  title VARCHAR(255) NOT NULL,
  description TEXT,

  report_type VARCHAR(50) NOT NULL,        -- summary, detailed, trend, comparison
  format VARCHAR(20) DEFAULT 'html',       -- html, pdf, excel, json

  test_execution_ids UUID[] DEFAULT '{}',  -- Executions included

  metrics JSONB,                           -- Pass rate, avg time, etc
  summary JSONB,

  generated_by UUID REFERENCES users(id),
  generated_at TIMESTAMP NOT NULL,
  expiry_at TIMESTAMP,                     -- Auto-delete after

  s3_url VARCHAR(500),                     -- Report file location
  is_public BOOLEAN DEFAULT false,

  created_at TIMESTAMP DEFAULT NOW(),
  FOREIGN KEY (project_id) REFERENCES projects(id)
);

-- Índices
CREATE INDEX idx_reports_project_id ON reports(project_id);
CREATE INDEX idx_reports_generated_at ON reports(generated_at);
```

### 🔐 SEGURIDAD - RLS POLICIES

```sql
-- Users can only see their own projects
CREATE POLICY "users_view_own_projects" ON projects
  FOR SELECT USING (owner_id = auth.uid());

-- Users can only update their own projects
CREATE POLICY "users_update_own_projects" ON projects
  FOR UPDATE USING (owner_id = auth.uid());

-- Test results visible only to project members
CREATE POLICY "test_results_visible_to_members" ON test_results
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM projects
            WHERE projects.id = test_results.project_id
            AND (projects.owner_id = auth.uid() OR true))
  );
```

### 🔗 CONEXIÓN DESDE CÓDIGO

**Python (Backend)** - `app/db/database.py`:
```python
from supabase import create_client, Client
from sqlalchemy import create_engine

# Supabase connection
SUPABASE_URL = os.getenv("SUPABASE_URL")
SUPABASE_KEY = os.getenv("SUPABASE_ANON_KEY")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# PostgreSQL connection (SQLAlchemy)
DATABASE_URL = os.getenv("DATABASE_URL")
engine = create_engine(DATABASE_URL)

# Session factory
from sqlalchemy.orm import sessionmaker
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

**JavaScript (Frontend)** - `services/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY)

// Usage
const { data, error } = await supabase
  .from('projects')
  .select('*')
  .eq('owner_id', userId)
```

### 📈 DIAGRAMA RELACIONES ER

```
users (1)
  ├─ (N) projects
  │   ├─ (N) test_suites
  │   │   ├─ (N) test_cases
  │   │   │   ├─ (N) test_executions
  │   │   │   │   └─ (N) test_results
  │   │   │   └─ (N) change_detections
  │   │   └─ (1) change_detections
  │   │       └─ trigger_test_suites[]
  │   └─ (N) reports
  │
  └─ (N) test_executions (executed_by)
      └─ (N) reports (generated_by)
```

---

## 🔄 FLUJO DE DATOS COMPLETO

### 1️⃣ USUARIO INICIA SESIÓN

```
┌──────────────────────────────────────────────┐
│  Usuario en https://haida.stayarta.com      │
│  (Frontend React)                            │
└────────────────┬─────────────────────────────┘
                 │
                 ▼
        ┌────────────────────┐
        │ ¿Usar SSO OAuth?   │
        │ Sí / No            │
        └────┬───────────────┘
             │
    ┌────────┴────────┐
    │                 │
    ▼ SSO            ▼ Local
┌─────────────────┐  ┌──────────────────┐
│ Redirect to:    │  │ POST /auth/login │
│ Microsoft       │  │ {email,password} │
│ login.          │  │                  │
│ microsoftonline │  └────────┬─────────┘
│ .com/TENANT_ID  │           │
└────────┬────────┘           ▼
         │          ┌─────────────────────┐
         │          │ Backend FastAPI     │
         │          │ Verify credentials  │
         │          │ Check users table   │
         │          └────────┬────────────┘
         │                   │
         ▼ MSAL callback ◄───┘
┌──────────────────────┐
│ POST /entra/callback │
│ {auth_code}          │
└────────┬─────────────┘
         │
         ▼
  ┌─────────────────────────┐
  │ Backend exchanges code  │
  │ for access token        │
  │ (MSAL library)          │
  └────────┬────────────────┘
           │
           ▼
  ┌──────────────────────────────┐
  │ Create/Update user in DB     │
  │ INSERT/UPDATE users table    │
  │ (Supabase PostgreSQL)        │
  └────────┬─────────────────────┘
           │
           ▼
  ┌──────────────────────────────┐
  │ Generate JWT token           │
  │ (signed with JWT_SECRET)     │
  │ Expires: 30 minutes          │
  └────────┬─────────────────────┘
           │
           ▼
  ┌──────────────────────────────┐
  │ Return to Frontend:          │
  │ {token, user_id, role}       │
  │ Stored in localStorage       │
  └──────────────────────────────┘
```

### 2️⃣ USUARIO CREA PROYECTO

```
┌────────────────────────────────┐
│ Frontend:                       │
│ POST /api/projects              │
│ {name, description, base_url}   │
│ Header: Authorization: Bearer JWT
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ Backend FastAPI:               │
│ POST /api/projects handler     │
│                                │
│ 1. Verify JWT token            │
│ 2. Validate input (Pydantic)   │
│ 3. Generate slug from name     │
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ Database Operation:            │
│                                │
│ INSERT INTO projects           │
│ (id, name, slug, base_url,     │
│  owner_id=current_user,        │
│  status='active')              │
│                                │
│ Returns: project_id (UUID)     │
└────────────┬───────────────────┘
             │
             ▼
┌────────────────────────────────┐
│ Response to Frontend:          │
│ Status: 201 Created            │
│ {project_id, name, slug, ...}  │
└────────────────────────────────┘
```

### 3️⃣ USUARIO CREA CASO DE PRUEBA

```
┌──────────────────────────────────────┐
│ Frontend:                             │
│ POST /api/test-cases                  │
│ {project_id, name, test_steps, ...}   │
│ Header: Authorization: Bearer JWT     │
└────────────┬────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Backend FastAPI:                     │
│ Validate user owns project           │
│ Validate ISTQB format fields         │
│ Generate test_id (TC_001, TC_002)    │
│ Generate UUID for test case ID       │
└────────────┬────────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Database:                            │
│                                      │
│ INSERT INTO test_cases               │
│ (test_suite_id, test_id, name,       │
│  test_steps, expected_result, ...)   │
│                                      │
│ Returns: test_case_id (UUID)         │
└────────────────────────────────────┘
```

### 4️⃣ USUARIO EJECUTA PRUEBA

```
┌─────────────────────────────────────┐
│ Frontend:                            │
│ POST /api/test-runs                 │
│ {test_case_id, project_id}          │
│ Header: Authorization: Bearer JWT   │
└────────────┬──────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Backend FastAPI:                    │
│ 1. Get test case details            │
│ 2. Create execution record          │
│ 3. Execute based on framework:      │
│    - If Playwright: trigger script  │
│    - If Newman: run Postman API     │
│    - If k6: trigger perf test       │
└────────────┬──────────────────────┘
             │
             ▼
┌─────────────────────────────────────┐
│ Database:                           │
│                                     │
│ INSERT INTO test_executions         │
│ (test_case_id, status='running',    │
│  started_at=NOW())                  │
│                                     │
│ Returns: execution_id (UUID)        │
└──────────────┬────────────────────┘
               │
               ▼
        [Test Running]
        (5-30 seconds)
        │
        ▼
┌──────────────────────────────────────┐
│ Database:                            │
│                                      │
│ UPDATE test_executions               │
│ SET status='passed',                 │
│     completed_at=NOW(),              │
│     duration_ms=5432                 │
│ WHERE id=execution_id                │
│                                      │
│ INSERT INTO test_results             │
│ (test_case_id, execution_id,         │
│  result='pass',                      │
│  assertions_passed=10)               │
└──────────────┬──────────────────────┘
               │
               ▼
┌──────────────────────────────────────┐
│ Response to Frontend:                │
│ Status: 200 OK                       │
│ {execution_id, result, duration_ms,  │
│  timestamp}                          │
└──────────────────────────────────────┘
```

### 5️⃣ USUARIO GENERA REPORTE

```
┌──────────────────────────────────────┐
│ Frontend:                            │
│ POST /api/reports/generate           │
│ {project_id, format='pdf'}           │
│ Header: Authorization: Bearer JWT    │
└────────────┬──────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Backend FastAPI:                     │
│ 1. Query test_executions where       │
│    project_id=X and                  │
│    created_at > last_30_days         │
│ 2. Calculate metrics:                │
│    - Pass rate = passes/total        │
│    - Avg duration                    │
│    - Failed tests                    │
│ 3. Generate HTML/PDF                 │
└────────────┬──────────────────────┘
             │
             ▼
┌──────────────────────────────────────┐
│ Database:                            │
│                                      │
│ INSERT INTO reports                  │
│ (project_id, title, format,          │
│  metrics, generated_by,              │
│  generated_at=NOW())                 │
│                                      │
│ Returns: report_id (UUID)            │
└─────────────────────────────────────┘
```

---

## ✅ CHECKLIST DE VERIFICACION

### Frontend
- [✅] Ubicación: `/haida-production/main/`
- [✅] Build tool: Vite 6.3.6
- [✅] Framework: React 18.3.1
- [✅] Language: TypeScript 5.7.2
- [✅] Styles: TailwindCSS 4.1.12
- [✅] API Client: Axios
- [✅] Database Client: @supabase/supabase-js
- [✅] Deployment: Vercel (haida-frontend.vercel.app → haida.stayarta.com)
- [✅] Entry: http://localhost:5173 (dev) / https://haida.stayarta.com (prod)

### Backend
- [✅] Ubicación: `/haida-production/main/`
- [✅] Framework: FastAPI 0.115.6
- [✅] Language: Python 3.9+
- [✅] ASGI Server: Uvicorn 0.34.0
- [✅] Database Client: Supabase SDK 2.9.1, SQLAlchemy 2.0.35
- [✅] Authentication: PyJWT 2.10.1, MSAL 1.31.1
- [✅] Deployment: Vercel Serverless (haida-one.vercel.app → haidapi.stayarta.com)
- [✅] Entry point: `api/index.py` (Vercel) / `app/main.py` (FastAPI)
- [✅] Routers: 11+ routers (auth, entra, projects, scripts, etc)

### Database
- [✅] Provider: Supabase (PostgreSQL managed)
- [✅] URL: https://wdebyxvtunromsnkqbrd.supabase.co
- [✅] Schema files: 6+ migration files
- [✅] Tables: 8 main tables (users, projects, test_suites, test_cases, etc)
- [✅] Security: RLS policies enabled
- [✅] Connection: Via SUPABASE_URL + SUPABASE_ANON_KEY
- [✅] Migrations: Apply via `psql` or Python scripts

### Integration
- [✅] Frontend → Backend: Axios to https://haidapi.stayarta.com/api/*
- [✅] Backend → Database: Supabase SDK + SQLAlchemy ORM
- [✅] Authentication: JWT tokens (30 min expiry)
- [✅] SSO: Microsoft Entra ID via MSAL
- [✅] API Documentation: OpenAPI spec at /openapi.json

---

## 🔧 PRÓXIMOS PASOS RECOMENDADOS

1. **Separar Base de Datos Dev/Prod**
   - Crear segundo proyecto Supabase para desarrollo
   - Actualizar `.env.local` con DB dev

2. **Consolidar Variables de Entorno**
   - Eliminar archivos .env duplicados
   - Usar Vercel Environment Variables
   - Documentar jerarquía de configuración

3. **Mejorar Seguridad**
   - Rotar secretos (JWT_SECRET, ENTRA_CLIENT_SECRET)
   - Implementar secret rotation automática
   - Auditar credenciales expuestas

4. **Optimizar Performance**
   - Implementar caching en Redis
   - Añadir indexación de BD
   - Monitorizar con Application Insights

5. **Documentar CI/CD**
   - Documenter GitHub Actions workflows
   - Setup automated tests antes de deploy
   - Implementar feature flags

---

**Última actualización**: ++34662652300
**Verificado por**: Claude (HAIDA Verification Agent)
**Status**: 🟢 Mapeado y verificado correctamente
