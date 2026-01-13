# 🚀 HAIDA - Guía Completa de Configuración

Esta guía te ayudará a configurar completamente el proyecto HAIDA en tu máquina local.

**Fecha**: 2026-01-13
**Autor**: Carlos Arévalo (STAYArta)
**Proyecto**: HAIDA Intelligent QA Automation Platform

---

## 📋 Índice

1. [Requisitos Previos](#requisitos-previos)
2. [Estructura del Proyecto](#estructura-del-proyecto)
3. [Configuración Inicial](#configuración-inicial)
4. [Variables de Entorno](#variables-de-entorno)
5. [Instalación de Dependencias](#instalación-de-dependencias)
6. [Configuración de Supabase](#configuración-de-supabase)
7. [Configuración de Vercel](#configuración-de-vercel)
8. [Ejecutar el Proyecto Localmente](#ejecutar-el-proyecto-localmente)
9. [Testing](#testing)
10. [Deployment](#deployment)
11. [Troubleshooting](#troubleshooting)

---

## 1. Requisitos Previos

### Software Requerido

| Software | Versión Mínima | Propósito |
|----------|----------------|-----------|
| **Node.js** | 18.x (recomendado 20.x) | Runtime JavaScript |
| **Python** | 3.11+ | Backend API (FastAPI) |
| **Git** | 2.x+ | Control de versiones |
| **Docker** | 20.x+ (opcional) | Containerización |
| **pnpm/npm** | 8.x+ / 9.x+ | Gestión de paquetes |

### Cuentas Requeridas

- ✅ **Supabase** - Base de datos + Auth + Storage
- ✅ **Vercel** - Hosting frontend + serverless API
- ✅ **GitHub** - Repositorio + CI/CD
- ⚠️ **Jira/Confluence** - Integración (opcional)
- ⚠️ **Telegram Bot** - Notificaciones (opcional)

---

## 2. Estructura del Proyecto

```
HAIDA/
├── .env                          # ✅ ARCHIVO CONSOLIDADO (credenciales reales)
├── .env.example                  # ✅ Template sin credenciales
├── ENV_SETUP.md                  # 📖 Documentación de variables
├── HAIDA_SETUP_GUIDE.md          # 📖 Esta guía
│
├── 00-PROJECTS/                  # Proyectos principales
│   ├── CTB/                      # Cliente CTB - Testing
│   ├── PRIVALIA/                 # Cliente Privalia
│   └── HAIDA/
│       ├── haida-production/main # 🚀 Versión producción
│       │   ├── api/              # FastAPI serverless
│       │   ├── app/              # FastAPI application
│       │   ├── src/              # Frontend React/TypeScript
│       │   ├── haida/            # Sub-módulo HAIDA
│       │   ├── tests/            # Suite de testing
│       │   ├── .github/workflows # CI/CD pipelines
│       │   ├── playwright.config.ts
│       │   └── package.json
│       │
│       └── haida-main/dev        # 💻 Versión desarrollo
│           ├── docker-compose.yml
│           └── ... (similar a production)
│
├── 01-DOCUMENTATION/             # Docs del proyecto
├── 02-AUTOMATION-SCRIPTS/        # Scripts de automatización
├── 03-TESTING-DATA/              # Fixtures y datos de prueba
├── 04-CONFIGURATION/             # Archivos de configuración
├── 06-DOWNLOADS/                 # Recursos descargables
└── 07-SECURITY/                  # Certificados y seguridad
```

---

## 3. Configuración Inicial

### Paso 1: Clonar el Repositorio

```bash
git clone git@github.com:caarevalom/HAIDA.git
cd HAIDA
```

### Paso 2: Verificar Archivo .env

El archivo `.env` ya está creado en la raíz con todas las credenciales consolidadas.

```bash
# Verificar que existe
ls -la .env

# ⚠️ IMPORTANTE: Este archivo está en .gitignore
# Contiene credenciales reales, NUNCA versionarlo
```

### Paso 3: Navegar al Proyecto Principal

```bash
# Para producción
cd 00-PROJECTS/HAIDA/haida-production/main

# O para desarrollo
cd 00-PROJECTS/HAIDA/haida-main/dev
```

---

## 4. Variables de Entorno

### Archivo Consolidado: `/Users/carlosa/HAIDA/.env`

**Contiene 12 secciones:**

1. **HAIDA Application** - URLs, CORS, debug
2. **Supabase Database** - PostgreSQL, conexiones, keys
3. **Atlassian** - Jira/Confluence integración
4. **CTB Testing** - Entorno de pruebas CTB
5. **Usuarios de Prueba** - Credenciales de testing
6. **Testing** - Playwright/Allure configuración
7. **Notificaciones** - Slack/Telegram
8. **Deployment** - Vercel/Railway tokens
9. **AI/LLM** - LM Studio, DeepSeek R1
10. **Auth/JWT/SSO** - Microsoft Entra ID, JWT
11. **Copilot Studio** - Direct Line API
12. **Opcionales** - Redis, SMTP

### Variables Críticas Configuradas

| Variable | Valor | Estado |
|----------|-------|--------|
| `SUPABASE_URL` | https://wdebyxvtunromsnkqbrd.supabase.co | ✅ Configurado |
| `SUPABASE_SERVICE_KEY` | eyJhbGc... (JWT) | ✅ Configurado |
| `DATABASE_URL` | postgresql://postgres:Aupbag7.@... | ✅ Configurado |
| `JIRA_API_TOKEN` | ATATT3x... | ✅ Configurado |
| `TELEGRAM_BOT_TOKEN` | 8280849337:AAGUb... | ✅ Configurado |
| `VERCEL_OIDC_TOKEN` | eyJhbGc... (expira ~12h) | ⚠️ Renovar periódicamente |
| `JWT_SECRET` | haida_super_secret... | ✅ Configurado |

### Renovar Tokens Expirados

```bash
# Vercel OIDC Token (expira cada 12 horas)
cd 00-PROJECTS/HAIDA/haida-production/main
vercel login
vercel env pull .env.local

# Copiar el nuevo token a /Users/carlosa/HAIDA/.env
```

---

## 5. Instalación de Dependencias

### Frontend + Backend (Node.js)

```bash
cd 00-PROJECTS/HAIDA/haida-production/main

# Instalar dependencias (recomendado pnpm)
pnpm install

# O con npm
npm install
```

**Dependencias principales instaladas:**
- React 18.3.1
- TypeScript 5.7.2
- Vite 6.3.6
- Tailwind CSS 4.1.12
- Material-UI 7.3.5
- Radix UI components
- Playwright 1.48.0
- Allure 2.15.0
- Supabase JS Client
- Zod 4.2.1

### Backend Python (FastAPI)

```bash
cd 00-PROJECTS/HAIDA/haida-production/main

# Crear virtual environment
python3 -m venv venv
source venv/bin/activate  # macOS/Linux
# venv\Scripts\activate  # Windows

# Instalar dependencias
pip install -r requirements.txt
```

**Dependencias Python instaladas:**
- FastAPI
- Uvicorn
- SQLAlchemy
- Pydantic
- python-jose (JWT)
- httpx
- supabase-py

### Instalación de Playwright Browsers

```bash
# Instalar navegadores de Playwright
npx playwright install --with-deps

# Verificar instalación
npx playwright --version
# → Version 1.48.0
```

---

## 6. Configuración de Supabase

### Proyecto Supabase Configurado

**URL del proyecto**: https://app.supabase.com/project/wdebyxvtunromsnkqbrd

**Credenciales en `.env`:**
```bash
SUPABASE_URL=https://wdebyxvtunromsnkqbrd.supabase.co
SUPABASE_ANON_KEY=eyJhbGc...  # Cliente público
SUPABASE_SERVICE_KEY=eyJhbGc...  # Backend admin
```

### Esquema de Base de Datos

**Tablas principales:**
- `profiles` - Información de usuarios
- `projects` - Proyectos HAIDA
- `test_cases` - Casos de prueba
- `test_executions` - Ejecuciones de tests
- `reports` - Reportes generados
- `files` - Archivos subidos
- `notifications` - Sistema de notificaciones

### Verificar Conexión

```bash
# Test de conexión a Supabase
cd 00-PROJECTS/HAIDA/haida-production/main

# Crear script de test
cat > test_supabase.py << 'EOF'
from supabase import create_client
import os

url = "https://wdebyxvtunromsnkqbrd.supabase.co"
key = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."  # Service key

client = create_client(url, key)
response = client.table('profiles').select("*").limit(1).execute()
print(f"✅ Conexión exitosa: {len(response.data)} registros")
EOF

python test_supabase.py
```

---

## 7. Configuración de Vercel

### Proyecto Vercel Configurado

**Proyecto**: haida
**Owner**: carlos-arevalos-projects-cf7340ea
**Team ID**: team_pInjcrwJS8Q5wP2lR6iSk54M
**User ID**: w9ITuSz5cmhTvpQIafRHh8mS

### Variables de Entorno en Vercel

```bash
# Login en Vercel
vercel login

# Link al proyecto
cd 00-PROJECTS/HAIDA/haida-production/main
vercel link

# Subir variables de entorno
vercel env add SUPABASE_URL production
# → https://wdebyxvtunromsnkqbrd.supabase.co

vercel env add SUPABASE_SERVICE_KEY production
# → [Pegar service key del .env]

# Continuar con todas las variables necesarias...
```

### Deployment a Vercel

```bash
# Deploy preview
vercel

# Deploy a producción
vercel --prod
```

**URLs del proyecto:**
- **Production**: https://haida-frontend.vercel.app
- **Dashboard**: https://haida-dashboard.vercel.app
- **Custom Domain**: https://haida.carlosarta.com

---

## 8. Ejecutar el Proyecto Localmente

### Opción 1: Modo Desarrollo (Frontend + Backend separados)

**Terminal 1 - Frontend Vite:**
```bash
cd 00-PROJECTS/HAIDA/haida-production/main
pnpm run dev

# → Vite dev server en http://localhost:3000
```

**Terminal 2 - Backend FastAPI:**
```bash
cd 00-PROJECTS/HAIDA/haida-production/main
source venv/bin/activate
uvicorn app.main:app --reload --port 8000

# → FastAPI en http://localhost:8000
# → Docs: http://localhost:8000/docs (si OpenAPI habilitado)
```

### Opción 2: Modo Production Build

```bash
# Build frontend
pnpm run build

# Serve con preview
pnpm run preview

# O con FastAPI sirviendo estáticos
python -m uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### Opción 3: Docker Compose (solo en dev/)

```bash
cd 00-PROJECTS/HAIDA/haida-main/dev
docker-compose up -d

# Servicios levantados:
# - backend (port 8000)
# - redis (port 6379)
# - changedetection.io (port 5000)
```

### Verificar que todo funciona

```bash
# Health check backend
curl http://localhost:8000/health
# → {"status": "ok", "timestamp": "..."}

# Health check frontend
curl http://localhost:3000
# → HTML de React app
```

---

## 9. Testing

### Tests E2E (Playwright)

```bash
cd 00-PROJECTS/HAIDA/haida-production/main

# Ejecutar todos los tests
pnpm run test:web

# Ejecutar con UI interactivo
pnpm run test:web:ui

# Ejecutar tests específicos
npx playwright test tests/web-e2e/smoke.spec.ts

# Ejecutar en un navegador específico
npx playwright test --project="Desktop Chrome"
```

### Tests API (Newman)

```bash
# Ejecutar colección de Postman
pnpm run test:api

# O directamente
newman run tests/api/collection.json -e tests/api/environment.json
```

### Performance Tests (Lighthouse)

```bash
# Auditar performance
pnpm run lighthouse

# Lighthouse CI (en CI/CD)
lhci autorun
```

### Generar Reportes Allure

```bash
# Limpiar reportes anteriores
pnpm run allure:clean

# Generar reporte
pnpm run allure:generate

# Abrir reporte en navegador
pnpm run allure:open
```

---

## 10. Deployment

### Deployment a Vercel (Producción)

```bash
cd 00-PROJECTS/HAIDA/haida-production/main

# Asegurarse de que está todo commiteado
git status

# Deploy a producción
vercel --prod

# O automático con GitHub Actions
git push origin main
# → Trigger workflow .github/workflows/ci-cd.yml
```

### Deployment a Railway (Backend alternativo)

```bash
# Instalar Railway CLI
npm i -g @railway/cli

# Login
railway login

# Link proyecto
railway link

# Deploy
railway up
```

### CI/CD con GitHub Actions

**Workflows configurados:**

| Workflow | Trigger | Propósito |
|----------|---------|-----------|
| `ci-cd.yml` | Push a main | Build, test, deploy completo |
| `codeql.yml` | Push a main | Análisis de seguridad |
| `quality-gates.yml` | Pull request | Control de calidad |
| `lighthouse-ci.yml` | Push a main | Performance monitoring |
| `qa-pipeline.yml` | Scheduled/Manual | Tests E2E completos |

**Ver status de workflows:**
```bash
gh workflow list
gh run list --workflow=ci-cd.yml
```

---

## 11. Troubleshooting

### Problema: Error de conexión a Supabase

**Síntoma:**
```
Error: Invalid Supabase URL or API key
```

**Solución:**
```bash
# Verificar variables en .env
cat /Users/carlosa/HAIDA/.env | grep SUPABASE

# Verificar que el proyecto Supabase esté activo
# → https://app.supabase.com/project/wdebyxvtunromsnkqbrd

# Regenerar keys si es necesario
# Settings → API → Regenerate service_role key
```

### Problema: Playwright browsers no instalados

**Síntoma:**
```
Error: Executable doesn't exist at /path/to/chromium
```

**Solución:**
```bash
npx playwright install --with-deps
```

### Problema: Puerto 3000 ya en uso

**Síntoma:**
```
Error: listen EADDRINUSE: address already in use :::3000
```

**Solución:**
```bash
# Encontrar proceso usando puerto 3000
lsof -ti:3000

# Matar proceso
kill -9 $(lsof -ti:3000)

# O usar otro puerto
PORT=3001 pnpm run dev
```

### Problema: Vercel OIDC Token expirado

**Síntoma:**
```
Error: 401 Unauthorized - Invalid token
```

**Solución:**
```bash
# Renovar token
cd 00-PROJECTS/HAIDA/haida-production/main
vercel env pull .env.local

# Copiar nuevo VERCEL_OIDC_TOKEN a /Users/carlosa/HAIDA/.env
```

### Problema: Tests de Playwright fallan

**Síntoma:**
```
Error: Test timeout of 30000ms exceeded
```

**Solución:**
```bash
# Aumentar timeout en playwright.config.ts
timeout: 60 * 1000  # 60 segundos

# O ejecutar con más retries
npx playwright test --retries=2

# O en modo headed para debug
npx playwright test --headed
```

### Problema: Error de permisos en Python

**Síntoma:**
```
PermissionError: [Errno 13] Permission denied
```

**Solución:**
```bash
# Usar virtual environment
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### Problema: TypeScript errors al compilar

**Síntoma:**
```
Error: TS2307: Cannot find module '@/components/...'
```

**Solución:**
```bash
# Verificar tsconfig.json paths
# Reinstalar dependencias
rm -rf node_modules pnpm-lock.yaml
pnpm install

# Reiniciar TypeScript server en VSCode
# Cmd+Shift+P → "TypeScript: Restart TS Server"
```

---

## 📚 Documentación Adicional

- [.env.example](./.env.example) - Template de variables de entorno
- [ENV_SETUP.md](./ENV_SETUP.md) - Guía detallada de variables
- [04-CONFIGURATION/ENV_VARIABLES_GUIDE.md](./04-CONFIGURATION/ENV_VARIABLES_GUIDE.md) - Referencia completa
- [00-PROJECTS/HAIDA/haida-production/main/README.md](./00-PROJECTS/HAIDA/haida-production/main/README.md) - README del proyecto

### URLs Útiles

| Recurso | URL |
|---------|-----|
| **GitHub Repo** | https://github.com/caarevalom/HAIDA |
| **Vercel Dashboard** | https://vercel.com/carlos-arevalos-projects-cf7340ea/haida |
| **Supabase Dashboard** | https://app.supabase.com/project/wdebyxvtunromsnkqbrd |
| **Jira STAYArta** | https://stayarta.atlassian.net |
| **Confluence STAYArta** | https://stayarta.atlassian.net/wiki |

---

## 🆘 Soporte

Para obtener ayuda:
- **Email**: hola@stayarta.com
- **GitHub Issues**: https://github.com/caarevalom/HAIDA/issues
- **Telegram**: @carlosarevalos

---

**Última actualización**: 2026-01-13
**Versión**: 1.0
**Autor**: Carlos Arévalo
