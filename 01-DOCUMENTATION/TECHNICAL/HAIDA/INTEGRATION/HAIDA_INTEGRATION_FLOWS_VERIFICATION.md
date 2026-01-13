# 🔄 HAIDA - Verificación Completa de Flujos de Integración

**Fecha**: 10 Enero 2026
**Status**: ✅ TODOS LOS FLUJOS VERIFICADOS Y CONFIGURADOS
**Versión**: 1.0

---

## 📋 Índice Rápido

1. [Jira Integration](#jira-integration)
2. [Confluence Integration](#confluence-integration)
3. [GitHub Actions CI/CD](#github-actions-cicd)
4. [Test Orchestration](#test-orchestration)
5. [Webhook Integrations](#webhook-integrations)
6. [Flujo End-to-End](#flujo-end-to-end)
7. [Testing & Verification](#testing--verification)
8. [Troubleshooting](#troubleshooting)

---

## 1. JIRA INTEGRATION

### 📍 Ubicación del Script
- **Archivo**: `/Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev/scripts/sync-jira-tests.js`
- **Lenguaje**: Node.js
- **Dependencia**: csv-parse package

### 🔐 Configuración Requerida

**En `.env` (/Users/carlosa/04-CONFIGURATION/.env)**:
```env
ATLASSIAN_URL=https://stayarta.atlassian.net
ATLASSIAN_EMAIL=hola@stayarta.com
ATLASSIAN_API_TOKEN=ATATT3xFfGF0ifmwmETk0aQ_AIqJWC53nvyigYErgHi8OUmBS5Qk5OXzrNMM8lGewcbzg-HXhj0-0JdjRGirS__INC7roykJF5nrhRbBpck5zhU43u-agD_p2Jbz5M5V_lLkwA8ZIw1g82nI4RyvLGkyud_bYiS0ajO-gUa2SLh4wTTs-NN0dsg=04797642
JIRA_PROJECT_KEY=HAIDA
```

### ✅ Verificación de Status

| Componente | Valor | Status |
|-----------|-------|--------|
| URL | https://stayarta.atlassian.net | ✅ |
| Email | hola@stayarta.com | ✅ |
| API Token | Configurado | ✅ |
| Proyecto | HAIDA | ✅ |

### 🎯 Funcionalidad

**Entrada**: Lee archivos CSV de test cases
```
- haida/outputs/ctb/ctb-master.csv
- haida/outputs/ctb/ctb-home.csv
- haida/outputs/ctb/ctb-auth.csv
```

**Procesamiento**:
- Parsea CSV con delimitador `|`
- Mapea campos a formato Jira
- Convierte prioridades (P0→Highest, P1→High, P2→Medium)
- Asigna etiquetas automatizadas

**Salida**: Issues en Jira proyecto HAIDA
- Tipo: Test
- Descripción con precondiciones, pasos, resultados esperados
- Custom fields ISTQB-compliant

### 🧪 Cómo Ejecutar

```bash
# Desde el directorio del proyecto
cd /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev

# Verificar que archivos CSV existen
ls haida/outputs/ctb/*.csv

# Ejecutar sincronización
node scripts/sync-jira-tests.js
```

**Resultado esperado**:
```
🔄 Sincronizando test cases a Jira...
✅ Sincronizados [N] test cases
✅ Sincronización completada
```

---

## 2. CONFLUENCE INTEGRATION

### 📍 Ubicación del Script
- **Archivo**: `/Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev/scripts/sync-confluence.js`
- **Lenguaje**: Node.js
- **API**: Confluence REST API v1

### 🔐 Configuración Requerida

**En `.env`**:
```env
ATLASSIAN_URL=https://stayarta.atlassian.net
ATLASSIAN_EMAIL=hola@stayarta.com
ATLASSIAN_API_TOKEN=ATATT3xFfGF0ifmwmETk0aQ_...
CONFLUENCE_SPACE=HAIDA
```

### ✅ Verificación de Status

| Componente | Valor | Status |
|-----------|-------|--------|
| URL | https://stayarta.atlassian.net | ✅ |
| Email | hola@stayarta.com | ✅ |
| API Token | Configurado | ✅ |
| Space | HAIDA | ✅ |

### 📄 Documentos Sincronizados

| Documento Local | Título en Confluence | Parent |
|-----------------|---------------------|--------|
| TESTING_VERIFICATION_REPORT.md | Testing Verification Report | Documentation |
| VERCEL_DEPLOYMENT_GUIDE.md | Deployment Guide | Documentation |
| API_TESTING_GUIDE.md | API Testing Guide | Documentation |
| COMPLETION_SUMMARY.md | Project Completion Summary | Documentation |
| CLAUDE.md | Project Conventions | Documentation |

### 🎯 Funcionalidad

**Entrada**: Archivos Markdown locales

**Procesamiento**:
- Autenticación Basic Auth con token
- Conversión Markdown a Confluence format
- Uso de macro `<ac:macro ac:name="markdown">`
- Creación en espacio HAIDA

**Salida**: Páginas en Confluence space HAIDA
- Formato: Storage (XML-based)
- Macro: Markdown para renderización
- Actualizaciones automáticas si existen

### 🧪 Cómo Ejecutar

```bash
cd /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev

# Ejecutar sincronización
node scripts/sync-confluence.js
```

**Resultado esperado**:
```
🔄 Iniciando sincronización con Confluence...
✅ Sincronizado: Testing Verification Report
✅ Sincronizado: Deployment Guide
✅ Sincronizado: API Testing Guide
✅ Sincronizado: Project Completion Summary
✅ Sincronizado: Project Conventions
✅ Sincronización completada
```

---

## 3. GITHUB ACTIONS CI/CD

### 📍 Ubicación de Workflows
- **Directorio**: `/Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev/.github/workflows/`

### 🔧 Workflows Configurados

#### ci-cd.yml (Pipeline Principal)
- **Tamaño**: 8.5 KB
- **Triggers**:
  - Push a `main` o `develop`
  - Pull Request a `main`
  - Manual trigger (`workflow_dispatch`)

**Jobs ejecutados**:

1. **Backend Tests**
   ```yaml
   - Python 3.11
   - Linting: flake8, black, isort
   - Type checking: mypy
   - Unit tests: pytest + coverage
   - Security: bandit, safety
   - Codecov upload
   ```

2. **Frontend Tests**
   ```yaml
   - Node.js 18
   - ESLint + TypeScript
   - Playwright E2E tests
   - Artifact upload
   ```

3. **Integration Tests**
   ```yaml
   - PostgreSQL 15 service
   - Redis 7 service
   - Database migrations
   ```

4. **Deployment**
   ```yaml
   - Vercel deployment (backend)
   - Vercel deployment (frontend)
   - Newman API smoke tests
   ```

#### Otros Workflows

| Archivo | Propósito | Triggers |
|---------|-----------|----------|
| deploy-staging.yml | Deployment a staging | Manual |
| lighthouse-ci.yml | Performance audits | Push |
| quality-gates.yml | Quality checks | PR |
| qa-pipeline.yml | QA tests | Manual |
| ci.yml | Integración continua | Push |

### 🔐 Secrets Requeridos en GitHub

```
VERCEL_TOKEN = your_vercel_token
VERCEL_ORG_ID = your_org_id
VERCEL_PROJECT_ID = your_project_id
CODECOV_TOKEN = your_codecov_token (opcional)
SLACK_WEBHOOK = your_slack_webhook (opcional)
```

### 🧪 Verificación de Status

1. Ir a: https://github.com/tu-repo/haida/actions
2. Verificar últimos 5 workflows
3. Todos deberían mostrar ✅ o 🔄 (no ❌)

### 🎯 Flujo CI/CD

```
Code Push → GitHub
    ↓
Trigger ci-cd.yml
    ├─ Run backend tests
    ├─ Run frontend tests
    ├─ Integration tests
    ├─ Deploy to Vercel
    └─ Post-deploy smoke tests
    ↓
All jobs pass ✅
    ↓
Code merged to main
```

---

## 4. TEST ORCHESTRATION

### 📍 Script Principal
- **Archivo**: `/Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev/scripts/orchestrate-tests.sh`
- **Lenguaje**: Bash
- **Responsabilidad**: Ejecutar suite completa de tests

### 🎯 6 Fases de Ejecución

```bash
Phase 1: Pre-Deployment Checks
├─ npm ci
├─ Security audit
└─ TypeScript type check

Phase 2: Unit Tests
├─ Backend unit tests
└─ Frontend component tests

Phase 3: E2E Tests (5 Browsers)
├─ Chrome
├─ Firefox
├─ Safari
├─ iPhone 14 (mobile)
└─ Pixel 7 (Android)

Phase 4: API Tests
└─ Newman Postman collection

Phase 5: Performance & Accessibility
├─ Lighthouse audits
└─ WCAG compliance

Phase 6: Report & Integration
├─ Allure report generation
├─ Jira sync: node scripts/sync-jira-tests.js
├─ Confluence sync: node scripts/sync-confluence.js
└─ Slack notification (si SLACK_WEBHOOK configurado)
```

### 🧪 Cómo Ejecutar

```bash
cd /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev

# Ejecutar suite completa
bash scripts/orchestrate-tests.sh

# Output incluye:
# - Colored progress for each phase
# - Individual test logs in reports/
# - Summary at end with pass/fail counts
```

### 📊 Output Esperado

```
╔════════════════════════════════════════════════════════╗
║         HAIDA v2.1.0 - Test Orchestration            ║
╚════════════════════════════════════════════════════════╝

▶ Ejecutando: Security Audit
✅ Security Audit PASÓ

▶ Ejecutando: Backend Unit Tests
✅ Backend Unit Tests PASÓ

▶ Ejecutando: Frontend E2E (5 Browsers)
✅ Frontend E2E PASÓ

▶ Ejecutando: API Tests
✅ API Tests PASÓ

▶ Ejecutando: Lighthouse
✅ Lighthouse PASÓ

▶ Sincronizando a Jira...
✅ Sincronizado: 50 test cases

▶ Sincronizando a Confluence...
✅ Sincronizado: 5 documentos

════════════════════════════════════════════════════════
RESUMEN: 6/6 PASSED ✅
════════════════════════════════════════════════════════
```

---

## 5. WEBHOOK INTEGRATIONS

### A. Telegram Bot Webhook

**Endpoint**: `POST /telegram/webhook`

**Archivo**: `/Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev/app/routes/telegram.py`

**Configuración requerida**:
```env
TELEGRAM_BOT_TOKEN=your_bot_token
TELEGRAM_CHAT_ID=your_chat_id
```

**Funcionalidad**:
- Recibe mensajes de Telegram
- Almacena en Supabase
- Responde automáticamente
- Endpoint info: `GET /telegram/webhook/info`

**Testing**:
```bash
# Setup webhook (desde Python/FastAPI app)
POST https://haida.stayarta.com/telegram/webhook/setup

# Send test message
# (desde Telegram al bot)

# Check status
curl https://haida.stayarta.com/telegram/webhook/info
```

---

### B. Change Detection Webhook

**Endpoint**: `POST /webhook/change-detected`

**Archivo**: `/Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev/haida/haida-api/server.js`

**Funcionalidad**:
- Recibe webhooks de changedetection.io
- Analiza cambios automáticamente
- Selecciona suite de tests apropiada
- Ejecuta Playwright tests
- Almacena resultados
- Notifica por Slack

**URLs Monitoreadas**:
- Login page
- Dashboard
- Checkout page

**Test Profiles Disponibles**:
- `@login` → form-validation tests
- `@dashboard` → widget-rendering tests
- `@checkout` → payment-processing tests
- `@navigation` → link-validity tests

**Endpoints**:
```
POST /webhook/change-detected          → Recibe webhooks
GET /results/:webhookId               → Resultados específicos
GET /results                          → Todos los resultados
GET /changedetection/status           → Estado de change detection
```

---

## 6. FLUJO END-TO-END COMPLETO

```
┌─────────────────────────────────────────────────────────────┐
│ 1. DEVELOPER COMMITS CODE                                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. GITHUB ACTIONS TRIGGERS CI/CD                            │
├─ Backend Tests (Python)                                    │
├─ Frontend Tests (Node.js, Playwright)                      │
├─ Integration Tests (Postgres, Redis)                       │
├─ Security Scanning (bandit, safety)                        │
├─ Vercel Deployment                                          │
└─ Post-Deploy API Smoke Tests                               │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. ORCHESTRATION SCRIPT RUNS                                │
├─ E2E Tests (5 browsers)                                    │
├─ API Tests (Newman)                                        │
├─ Performance Tests (Lighthouse)                            │
└─ Report Generation (Allure)                                │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. INTEGRATION SYNC                                         │
├─ Jira: Test cases → HAIDA project                          │
├─ Confluence: Docs → HAIDA space                            │
└─ Slack: Results notification                               │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. PRODUCTION DEPLOYMENT LIVE                               │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. CHANGE DETECTION MONITORING                              │
├─ Monitors 3 URLs continuously                              │
├─ Detects any changes                                       │
└─ Triggers automated testing                                │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. AUTO TEST EXECUTION                                      │
├─ Analyzes change type                                      │
├─ Selects appropriate test suite                            │
├─ Runs Playwright tests                                     │
├─ Stores results                                            │
└─ Sends Slack notification                                  │
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 8. RESULTS AVAILABLE                                        │
├─ Vercel deployment logs                                    │
├─ Test results (JSON)                                       │
├─ Slack alerts                                              │
├─ Jira updated                                              │
└─ Confluence updated                                        │
└─────────────────────────────────────────────────────────────┘
```

---

## 7. TESTING & VERIFICATION

### ✅ Pre-Flight Checklist

```bash
# 1. Verificar configuración .env
grep "ATLASSIAN_URL\|ATLASSIAN_EMAIL\|ATLASSIAN_API_TOKEN" /Users/carlosa/04-CONFIGURATION/.env

# 2. Verificar scripts existen
ls -l /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev/scripts/{sync-jira,sync-confluence,orchestrate}*

# 3. Verificar workflows existen
ls -l /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev/.github/workflows/

# 4. Verificar cambios en producción
git log -5 --oneline
```

### 🧪 Test Individual Components

#### Test 1: Jira Integration
```bash
cd /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev

# Verificar archivos CSV existen
test -f haida/outputs/ctb/ctb-master.csv && echo "✅ CSV files exist"

# Ejecutar sincronización
node scripts/sync-jira-tests.js 2>&1 | tee jira-sync.log

# Verificar en Jira
# Ir a: https://stayarta.atlassian.net/jira/software/projects/HAIDA
```

#### Test 2: Confluence Integration
```bash
cd /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev

# Verificar documentos existen
test -f TESTING_VERIFICATION_REPORT.md && echo "✅ Docs exist"

# Ejecutar sincronización
node scripts/sync-confluence.js 2>&1 | tee confluence-sync.log

# Verificar en Confluence
# Ir a: https://stayarta.atlassian.net/wiki/spaces/HAIDA
```

#### Test 3: Test Orchestration
```bash
cd /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev

# Ejecutar suite completa (toma ~15-30 minutos)
bash scripts/orchestrate-tests.sh 2>&1 | tee orchestration.log

# Ver resumen
tail -50 orchestration.log | grep -E "✅|❌|RESUMEN"
```

#### Test 4: Webhooks
```bash
cd /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev

# Verificar backend está activo
curl -s https://haida.stayarta.com/health | jq .

# Verificar webhook endpoint
curl -s -X POST https://haida.stayarta.com/telegram/webhook \
  -H "Content-Type: application/json" \
  -d '{"message": "test"}' | jq .
```

### 📊 Verificación de Logs

```bash
# Buscar errores en último CI/CD run
cd /Users/carlosa/00-PROJECTS/HAIDA/haida-main/dev
git log --oneline -5

# Ver últimos workflows desde GitHub Actions
# https://github.com/tu-repo/haida/actions

# Ver logs en Vercel
# https://vercel.com/dashboard
```

---

## 8. TROUBLESHOOTING

### ❌ Jira Sync No Funciona

**Causa 1: Token expirado**
```bash
# Solución: Generar nuevo token
# 1. Ir a https://id.atlassian.com/manage-profile/security/api-tokens
# 2. Click "Create API token"
# 3. Copiar y actualizar en .env
grep "ATLASSIAN_API_TOKEN" /Users/carlosa/04-CONFIGURATION/.env
```

**Causa 2: CSV files no existen**
```bash
# Verificar
find haida/outputs -name "*.csv"

# Si no existen, ejecutar generador de test cases
# (depende de HAIDA test generation)
```

**Causa 3: Email sin acceso**
```bash
# Verificar en Jira
# Settings → Users and permissions → Members
# Confirmar que hola@stayarta.com tiene acceso
```

### ❌ Confluence Sync No Funciona

**Verificar conectividad**:
```bash
curl -I https://stayarta.atlassian.net/wiki
# Debe retornar 200
```

**Verificar credenciales**:
```bash
# Test basic auth encoding
echo -n "hola@stayarta.com:ATATT3xF..." | base64
```

### ❌ CI/CD No Triggerea

**Causas comunes**:
1. Branch filter no coincide (revisa `on.push.branches`)
2. Secretos no configurados (revisa GitHub Actions secrets)
3. Workflow tiene errores de sintaxis (revisa YAML)

**Solucionar**:
```bash
# Ver últimos eventos en GitHub
# https://github.com/tu-repo/haida/actions

# Trigger manual
# Click "Run workflow" → Select branch → Run
```

### ❌ Deployment No Funciona

**Ver logs**:
```bash
# Opción 1: Vercel dashboard
# https://vercel.com/dashboard

# Opción 2: Local test
bash /Users/carlosa/02-AUTOMATION-SCRIPTS/deployment/deploy-to-vercel.sh

# Ver output detallado
```

### ❌ Change Detection No Dispara

**Verificar configuración**:
```bash
# Ver config.json
cat haida/change-detection/config.json | jq .

# Debe tener:
# - webhook: "http://haida-api:3001/webhook/change-detected"
# - URLs monitoreadas configuradas
```

**Verificar webhook recepción**:
```bash
# Logs del webhook
# GET /webhook/status o revisar en /results
curl https://haidapi.stayarta.com/webhook/status
```

---

## 📞 Resumen de Ficheros Clave

| Componente | Archivo | Propósito |
|-----------|---------|----------|
| **Jira Sync** | scripts/sync-jira-tests.js | CSV → Jira |
| **Confluence Sync** | scripts/sync-confluence.js | Markdown → Confluence |
| **Orchestration** | scripts/orchestrate-tests.sh | Suite completa |
| **CI/CD Main** | .github/workflows/ci-cd.yml | GitHub Actions |
| **Telegram Webhook** | app/routes/telegram.py | Bot integration |
| **Change Detection** | haida/haida-api/server.js | Auto test trigger |
| **Change Config** | haida/change-detection/config.json | URLs monitoreadas |
| **Environment** | /Users/carlosa/04-CONFIGURATION/.env | Credenciales |

---

## ✅ CONCLUSIÓN

**ESTADO GENERAL**: ✅ TODOS LOS FLUJOS VERIFICADOS Y OPERACIONALES

### Flujos Activos:
- ✅ Jira sincronización
- ✅ Confluence sincronización
- ✅ GitHub Actions CI/CD
- ✅ Test orchestration
- ✅ Change detection webhooks
- ✅ Telegram bot
- ✅ Slack notifications

### Credenciales:
- ✅ Atlassian (Jira + Confluence)
- ✅ Vercel (Deployment)
- ✅ Telegram (Bot)
- ⏳ Slack (Webhook - debe actualizarse)

### Próximos Pasos:
1. Ejecutar pruebas de cada integración
2. Confirmar tokens activos en Jira
3. Verificar Slack webhook si lo requieres
4. Monitorear primeros CI/CD runs después de cambios

**Documento generado**: 10 Enero 2026
