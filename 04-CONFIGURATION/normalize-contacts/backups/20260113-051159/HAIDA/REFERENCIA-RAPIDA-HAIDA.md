# ⚡ REFERENCIA RÁPIDA - HAIDA ARCHITECTURE

**Quick Reference Guide**
**Generado**: +34662652300
**Para**: Developers, DevOps, QA Engineers

---

## 🎯 RUTAS PRINCIPALES

### 📍 REPOSITORIOS

| Nombre | Ruta | Tipo | Ambiente |
|--------|------|------|----------|
| **HAIDA Production** | `/Users/carlosa/00-PROJECTS/HAIDA/haida-production/main/` | 🔴 Prod | `main` |
| **HAIDA Development** | `/Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev/` | 🟡 Dev | `develop` |
| **Documentation** | `/Users/carlosa/00-PROJECTS/HAIDA/haida-documentation/` | 📖 Docs | - |

---

## 🌐 URLS EN VIVO

### Frontend
```
DEV:   http://localhost:5173
PROD:  https://haida.stayarta.com
VERCEL: https://haida-frontend.vercel.app
```

### Backend
```
DEV:   http://localhost:8000
PROD:  https://haidapi.stayarta.com
VERCEL: https://haida-one.vercel.app
```

### Database
```
SUPABASE: https://wdebyxvtunromsnkqbrd.supabase.co
SQL:      postgresql://hola@stayarta.com:6543/postgres
```

### Copilot Studio
```
DIRECT_LINE: https://default9b7594d62c7d4fe2b248213f649968.77.environment.api.powerplatform.com/copilotstudio/dataverse-backed/...
```

---

## 🚀 COMANDOS ESENCIALES

### Frontend

```bash
# Setup
cd haida-production/main
npm install

# Development
npm run dev                    # Start Vite dev server (http://localhost:5173)

# Build
npm run build                  # Vite build → dist/

# Testing
npm run test:web             # Playwright E2E tests
npm run test:web:ui          # UI mode for debugging

# Production
npm run preview               # Preview production build
```

### Backend

```bash
# Setup
cd haida-production/main
pip install -r requirements.txt

# Development
python -m uvicorn app.main:app --reload    # http://localhost:8000

# Testing
python -m pytest tests/

# API Docs
curl http://localhost:8000/docs            # Swagger UI
curl http://localhost:8000/openapi.json    # OpenAPI spec
```

### Database

```bash
# Schema application
psql $DATABASE_URL < database/01-schema-haida.sql

# Test data (dev only)
psql $DATABASE_URL < database/02-test-data.sql

# Migrations
psql $DATABASE_URL < database/03-migration-add-full-name.sql

# Query example
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"
```

### Docker

```bash
# Start local stack (backend + redis)
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop
docker-compose down

# Production
docker-compose -f docker-compose.production.yml up -d
```

---

## 🔐 CREDENCIALES & VARIABLES

### 🟢 Públicas (Safe to share)
```env
VITE_API_URL=https://haidapi.stayarta.com
VITE_SUPABASE_URL=https://wdebyxvtunromsnkqbrd.supabase.co
ENTRA_CLIENT_ID=93dae11f-417c-49ff-8d66-d642afb66327
ENTRA_TENANT_ID=9b7594d6-2c7d-4fe2-b248-213f64996877
```

### 🔴 Privadas (NEVER share)
```
JWT_SECRET=*                   # Rotated
ENTRA_CLIENT_SECRET=*          # Rotated
SUPABASE_SERVICE_ROLE_KEY=*    # In Vercel env vars only
DATABASE_URL=*                 # In Vercel env vars only
Telegram Bot Token=*           # Rotated
Vercel Tokens=*                # Rotated
```

### 📍 Ubicación Correcta
```
Código:        .env.example (sin valores reales)
Dev Machine:   .env.local (en .gitignore)
Vercel:        Settings > Environment Variables (UI dashboard)
GitHub Actions: Settings > Secrets and variables > Actions
```

---

## 📊 TABLA ENDPOINTS API

| Endpoint | Método | Router | Autenticación | Descripción |
|----------|--------|--------|----------------|-------------|
| `/health` | GET | system | ❌ | Health check |
| `/version` | GET | system | ❌ | API version |
| `/openapi.json` | GET | system | ❌ | OpenAPI spec |
| `/auth/login` | POST | auth | ❌ | Local login |
| `/auth/register` | POST | auth | ❌ | User signup |
| `/auth/logout` | POST | auth | ✅ JWT | Logout |
| `/entra/authorize` | GET | entra | ❌ | Microsoft SSO |
| `/entra/callback` | GET\|POST | entra | ❌ | OAuth callback |
| `/api/projects` | GET | projects | ✅ JWT | List projects |
| `/api/projects` | POST | projects | ✅ JWT | Create project |
| `/api/projects/{id}` | GET | projects | ✅ JWT | Get project |
| `/api/projects/{id}` | PUT | projects | ✅ JWT | Update project |
| `/api/projects/{id}` | DELETE | projects | ✅ JWT | Delete project |
| `/api/test-cases` | GET | scripts | ✅ JWT | List test cases |
| `/api/test-cases` | POST | scripts | ✅ JWT | Create test case |
| `/api/test-cases/{id}` | GET | scripts | ✅ JWT | Get test case |
| `/api/test-runs` | GET | runs | ✅ JWT | List executions |
| `/api/test-runs` | POST | runs | ✅ JWT | Execute test |
| `/api/test-runs/{id}` | GET | runs | ✅ JWT | Get execution |
| `/api/reports` | GET | reports | ✅ JWT | List reports |
| `/api/reports/generate` | POST | reports | ✅ JWT | Generate report |
| `/chat/completions` | POST | chat | ✅ JWT | Chat with AI |
| `/notifications` | GET | notifications | ✅ JWT | List alerts |
| `/files/upload` | POST | files | ✅ JWT | Upload file |

---

## 🗄️ TABLA TABLAS DATABASE

| Tabla | Propósito | Filas Típicas | Clave Principal |
|-------|----------|---------------|-----------------|
| `users` | Cuentas usuario | 10-1000 | `id` (UUID) |
| `projects` | Proyectos/aplicaciones | 5-100 | `id` (UUID) |
| `test_suites` | Suite de tests | 20-500 | `id` (UUID) |
| `test_cases` | Casos de prueba (ISTQB) | 100-5000 | `id` (UUID) |
| `test_executions` | Ejecuciones de tests | +34662652300 | `id` (UUID) |
| `test_results` | Resultados de tests | +34662652300 | `id` (UUID) |
| `change_detections` | Cambios detectados | 10-100 | `id` (UUID) |
| `reports` | Reportes generados | +34662652300 | `id` (UUID) |

---

## 🔄 FLUJOS PRINCIPALES

### 1. Usuario Login → Obtiene JWT

```
Frontend                Backend                 Supabase
   │                      │                         │
   ├─ POST /auth/login ──► │                        │
   │                      ├─ Query users table ────►
   │                      │ ◄──── User found ───────
   │                      ├─ Generate JWT ─┐
   │                      │ ◄─ {token, user_id}
   │ ◄─ 200 {token} ─────┤
   │
   └─ Store in localStorage
```

### 2. Usuario Crea Proyecto

```
Frontend                Backend                 Supabase
   │                      │                         │
   ├─ POST /api/projects  │                        │
   │  {name, slug}        │                        │
   │  Header: Bearer JWT  ├─ Validate JWT          │
   │                      ├─ INSERT projects ─────►
   │                      │ ◄─── project_id ───────
   │ ◄─ 201 {project} ───┤
```

### 3. Usuario Ejecuta Test

```
Frontend                Backend                 Supabase
   │                      │                        │
   ├─ POST /api/test-runs │                       │
   │  {test_case_id}      ├─ Query test_cases ───►
   │                      │ ◄─── test details ────
   │                      │                        │
   │                      ├─ INSERT test_executions► (running)
   │ ◄─ 202 {execution} ─┤                        │
   │                      │ [Running test...]      │
   │                      ├─ UPDATE test_executions► (completed)
   │                      ├─ INSERT test_results ─►
   │  [Poll /api/test-runs/{id}]
   │                      │ ◄─── results ─────────
   │ ◄─ 200 {results}────┤
```

---

## 📈 DIAGRAMA STACK

```
┌─────────────────────────────────────────────────┐
│                  USUARIOS                        │
│         (Navegador, Teams, Mobile)              │
└─────────────┬───────────────────────────────────┘
              │
    ┌─────────┴──────────┐
    │                    │
┌───▼────────┐   ┌──────▼────────┐
│  Frontend  │   │ Copilot       │
│  React 18  │   │ Studio        │
│  Vite      │   │ (Teams)       │
└───┬────────┘   └──────┬────────┘
    │                   │
    └─────────┬─────────┘
              │
    ┌─────────▼──────────────────┐
    │ Microsoft Entra ID OAuth2  │
    │ JWT Token Generation       │
    └─────────┬──────────────────┘
              │
    ┌─────────▼──────────────────┐
    │    FastAPI Backend         │
    │    (Serverless Vercel)     │
    │ haidapi.stayarta.com       │
    └─────────┬──────────────────┘
              │
    ┌─────────▼──────────────────┐
    │ PostgreSQL via Supabase    │
    │ wdebyxvtunromsnkqbrd       │
    │ (Managed cloud database)   │
    └────────────────────────────┘
```

---

## 🎨 ARCHIVOS CLAVE

| Archivo | Ruta | Propósito |
|---------|------|----------|
| **package.json** | `haida-production/main/` | Frontend deps |
| **vercel.json** | `haida-production/main/` | Deployment routing |
| **requirements.txt** | `haida-production/main/` | Python deps |
| **app/main.py** | `haida-production/main/app/` | FastAPI app |
| **vite.config.ts** | `haida-production/main/` | Vite config |
| **01-schema-haida.sql** | `haida-production/main/database/` | DB schema |
| **MAPEO-ARQUITECTURA-COMPLETO.md** | `haida-production/main/` | Este documento |
| **.env.example** | `haida-production/main/` | Env template |

---

## 🆘 TROUBLESHOOTING RÁPIDO

### Frontend no conecta a Backend

```bash
# Verificar CORS
curl -H "Origin: http://localhost:3000" \
  -H "Access-Control-Request-Method: GET" \
  http://localhost:8000/api/projects -v

# Verificar .env.local
cat .env.local | grep VITE_API_URL
# Debe ser: VITE_API_URL=http://localhost:8000 (dev)
#        o: VITE_API_URL=https://haidapi.stayarta.com (prod)
```

### JWT Token inválido

```bash
# Verificar token
curl -H "Authorization: Bearer TOKEN" \
  http://localhost:8000/auth/me

# Si falla: Token expired or invalid
# Solución: Obtener nuevo token con /auth/login
```

### Base de datos no conecta

```bash
# Verificar DATABASE_URL
echo $DATABASE_URL

# Verificar conexión
psql $DATABASE_URL -c "SELECT 1;"

# Si falla: Check credentials and network access
```

### Tests fallando

```bash
# Ver logs detallados
npm run test:web -- --debug

# Ver HTML report
npm run test:web
npx playwright show-report

# Borrar cache
rm -rf node_modules/.vite
npm install
```

---

## 📞 CONTACTOS & RECURSOS

| Rol | Email | Teléfono |
|-----|-------|----------|
| Lead Dev | Carlos A. | ++34662652300 |
| QA Team | hola@stayarta.com | - |
| Jira/Confluence | hola@stayarta.com | - |

---

## 📚 DOCUMENTACIÓN RELACIONADA

- 📖 **MAPEO-ARQUITECTURA-COMPLETO.md** - Documentación técnica detallada
- ⚠️ **VERIFICACION-INCONSISTENCIAS.md** - Problemas y soluciones
- 🔐 **CREDENTIALS.md** - Variables secretas (⚠️ NO distribuir)
- 🚀 **OPERATIONAL_SETUP.md** - Setup operacional

---

## ✅ CHECKLIST DEPLOYMENT

```bash
# Pre-deployment
[ ] npm run build         # Frontend compila sin errores
[ ] npm run test:web      # Tests pasan
[ ] curl /health          # Backend responde
[ ] psql $DB < schema     # DB schema aplicado

# Deployment (Vercel)
[ ] vercel login
[ ] vercel deploy --prod

# Post-deployment
[ ] curl https://haidapi.stayarta.com/health
[ ] Verificar logs: vercel logs -f
[ ] Verificar BD: psql $PROD_DB -c "SELECT COUNT(*) FROM projects;"
```

---

**Last Updated**: +34662652300
**Status**: ✅ Verificado y actualizado
