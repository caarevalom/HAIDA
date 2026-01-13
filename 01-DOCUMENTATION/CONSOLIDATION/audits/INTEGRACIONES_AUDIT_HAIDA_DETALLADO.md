# AUDITORÍA DETALLADA DE INTEGRACIONES - HAIDA ECOSYSTEM
## Mapeo Completo de Conexiones y Dependencias

**Fecha**: 09 de Enero de 2026
**Analista**: Claude Code Integration Audit
**Estado**: ✅ VERIFICADO CON ESTADO ACTUAL

---

## TABLA DE CONTENIDOS

1. [Matriz de Integraciones](#matriz-de-integraciones)
2. [Integraciones Críticas (Tier 1)](#integraciones-críticas-tier-1)
3. [Integraciones Secundarias (Tier 2)](#integraciones-secundarias-tier-2)
4. [Integraciones Experimentales (Tier 3)](#integraciones-experimentales-tier-3)
5. [Riesgos de Integración](#riesgos-de-integración)
6. [Roadmap de Migración](#roadmap-de-migración)

---

## MATRIZ DE INTEGRACIONES

### Resumen Visual

```
┌─────────────────────────────────────────────────────────────────┐
│              INTEGRACIONES POR VERSIÓN HAIDA                     │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TIER 1 (CRÍTICAS)                                              │
│  ├─ Supabase PostgreSQL         HAIDA ✓  HAIDA-PROJECT ✓      │
│  ├─ Vercel (Frontend + Backend)  HAIDA ✓  HAIDA-PROJECT ✓      │
│  ├─ Azure Entra OAuth            HAIDA ✓  HAIDA-PROJECT ✓      │
│  └─ GitHub Actions CI/CD         HAIDA ✓  HAIDA-PROJECT ✓      │
│                                                                  │
│  TIER 2 (SECUNDARIAS)                                           │
│  ├─ Slack Webhooks               HAIDA ✓  HAIDA-PROJECT ✓      │
│  ├─ Docker/Compose              HAIDA ✓  HAIDA-PROJECT ✓      │
│  ├─ Jira/Confluence             HAIDA ✓  HAIDA-PROJECT ✓      │
│  └─ Figma Design System         HAIDA ✓  HAIDA-PROJECT ✓      │
│                                                                  │
│  TIER 3 (EXPERIMENTALES)                                        │
│  ├─ Railway.app                  HAIDA ✓  HAIDA-PROJECT ✗      │
│  ├─ Telegram Bot                 HAIDA ✓  HAIDA-PROJECT ✗      │
│  ├─ LM Studio (LLM)              HAIDA ✓  HAIDA-PROJECT ✗      │
│  └─ Copilot DirectLine          HAIDA ✓  HAIDA-PROJECT ✗      │
│                                                                  │
│  CLIENTES (EXTERNOS)                                            │
│  ├─ Privalia QA Suite            SEPARADO (Postman/Newman)     │
│  └─ CTB Testing Framework        SEPARADO (Independiente)      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

---

## INTEGRACIONES CRÍTICAS (TIER 1)

### 1. SUPABASE - Database & Authentication
**Criticidad**: 🔴 CRÍTICA
**Riesgo**: MÁXIMO - Compartida entre 2 versiones
**Status**: ⚠️ ACTIVO PERO CON RIESGO

#### Configuración
| Aspecto | Valor | Status |
|---------|-------|--------|
| **Proyecto ID** | `wdebyxvtunromsnkqbrd` | ✅ Verificado |
| **Base de Datos** | PostgreSQL (5432) | ✅ Conectada |
| **Región** | us-east-1 (Supabase) | ✅ Confirmada |
| **URL API** | `https://wdebyxvtunromsnkqbrd.supabase.co` | ✅ Activa |
| **JWT Anon Key** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | 🔴 EXPUESTA |
| **Service Role Key** | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` | 🔴 EXPUESTA |
| **Password DB** | `Aupbag7.` | 🔴 EXPUESTA |
| **RLS Políticas** | ✅ Configuradas | ✅ Verificadas |

#### Uso por Versión

**HAIDA (23-bug)**:
- `.env` línea 13: `SUPABASE_URL=...`
- `.env` línea 14: `SUPABASE_ANON_KEY=...`
- `.env` línea 15: `SUPABASE_SERVICE_ROLE_KEY=...`
- `backend/config.py` línea 42: Conexión via `supabase.create_client()`
- **Función**: Development & testing contra production DB

**HAIDA-PROJECT (main)**:
- `.env` línea 13: `SUPABASE_URL=...` (MISMO)
- `.env` línea 14: `SUPABASE_ANON_KEY=...` (MISMO)
- `.env` línea 15: `SUPABASE_SERVICE_ROLE_KEY=...` (MISMO)
- `backend/config.py` línea 42: Conexión via `supabase.create_client()`
- **Función**: Production queries & user data

#### Riesgos Identificados

| Riesgo | Severidad | Descripción |
|--------|-----------|-------------|
| **Shared Database** | 🔴 CRÍTICA | Ambas versiones acceden mismo DB. Migraciones de HAIDA afectan HAIDA-PROJECT |
| **Credentials Exposed** | 🔴 CRÍTICA | Service Role Key visible en .env = acceso total |
| **No Isolation** | 🔴 CRÍTICA | No dev/staging/prod databases. Todo en UNA tabla |
| **History Compromise** | 🔴 CRÍTICA | Credenciales en git history de ambas ramas |
| **No Backup Policy** | 🟠 ALTA | No automated backups configured |
| **RLS Gaps** | 🟠 ALTA | RLS policies may not cover all user scenarios |

#### Plan de Migración

**Fase 1** (Inmediato):
- [ ] Backup manual de Supabase production
- [ ] Rotar Anon Key
- [ ] Rotar Service Role Key
- [ ] Rotar database password

**Fase 2** (5-7 días):
- [ ] Crear new Supabase project para DESARROLLO
- [ ] Crear new Supabase project para STAGING
- [ ] Restaurar schema en dev/staging projects
- [ ] Actualizar HAIDA .env a dev project
- [ ] Actualizar HAIDA-PROJECT .env a prod project
- [ ] Testear ambas versiones con DBs separadas

**Fase 3** (7-10 días):
- [ ] Remove credentials from git history (BFG)
- [ ] Implement automated backups
- [ ] Setup Supabase monitoring alerts
- [ ] Document RLS policies

---

### 2. VERCEL - Hosting & Deployment
**Criticidad**: 🔴 CRÍTICA
**Riesgo**: MÁXIMO - Deploy conflict
**Status**: ⚠️ ACTIVO PERO SIN CONTROLES

#### Configuración
| Aspecto | Valor | Status |
|---------|-------|--------|
| **Project ID** | `prj_GmULNxrTL52NUfnzDrXUvQvNyle9` | ✅ Verificado |
| **Organización** | CarlosArevalo-Team | ✅ Confirmada |
| **Región Frontend** | Automático (CDN global) | ✅ Configurado |
| **Región Backend** | Automático (Serverless) | ✅ Configurado |
| **URLs Production** | haida.stayarta.com | ✅ Activa |
| **URLs API** | haidapi.stayarta.com | ✅ Activa |
| **Custom Domain Bot** | bothaida.stayarta.com | ✅ Activo |

#### Uso por Versión

**HAIDA (23-bug)**:
- `.vercel/project.json`: `projectId: prj_GmULNxrTL52NUfnzDrXUvQvNyle9`
- Rama origen: `23-bug`
- **Función**: Puede deployar a producción (⚠️ RIESGO)
- **Último Deploy**: Auto (via git push)
- **Status**: Última build: PASS

**HAIDA-PROJECT (main)**:
- `.vercel/project.json`: `projectId: prj_GmULNxrTL52NUfnzDrXUvQvNyle9` (MISMO)
- Rama origen: `main`
- **Función**: Actualmente en producción
- **Último Deploy**: Auto (via git push)
- **Status**: Última build: PASS

#### Riesgos Identificados

| Riesgo | Severidad | Descripción |
|--------|-----------|-------------|
| **Shared Project** | 🔴 CRÍTICA | Ambas ramas pueden deployar a mismo Vercel |
| **No Branch Rules** | 🔴 CRÍTICA | No restricción de qué rama deploya a PROD |
| **CORS Wildcard** | 🔴 CRÍTICA | `api/index.py` línea 28: `origins=["*"]` |
| **No Staging** | 🟠 ALTA | No staging environment for testing |
| **Deploy Conflict** | 🟠 ALTA | Si 23-bug deploya, sobrescribe main |
| **No Rollback Policy** | 🟠 ALTA | Manual rollback required |

#### Código Problemático

**`/HAIDA-PROJECT/api/index.py` línea 28**:
```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 🔴 WILDCARD - INSEGURO
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

**Problema**: Cualquier dominio puede hacer requests a tu API.

#### Plan de Migración

**Fase 1** (Inmediato):
- [ ] Restringir Vercel a solo deployar rama `main` (GitHub settings)
- [ ] Deshabilitar auto-deploy de rama `23-bug`
- [ ] Verificar último estado de producción

**Fase 2** (1-2 días):
- [ ] Crear staging deployment (rama develop o similar)
- [ ] Configurar CORS específicamente: `allow_origins=["haida.stayarta.com", "bothaida.stayarta.com"]`
- [ ] Setup preview deployments para PRs

**Fase 3** (3-5 días):
- [ ] Implement branch protection rules on GitHub
- [ ] Require PR reviews before merge to main
- [ ] Require CI checks before deploy
- [ ] Document deployment process

---

### 3. AZURE ENTRA - OAuth Authentication
**Criticidad**: 🔴 CRÍTICA
**Riesgo**: ALTO - Credenciales expuestas
**Status**: ✅ FUNCIONAL

#### Configuración
| Aspecto | Valor | Status |
|---------|-------|--------|
| **Tenant ID** | `1111xxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | ✅ Configurado |
| **Client ID** | `2222xxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` | ✅ Configurado |
| **Client Secret** | `6GI8Q~kMgGHrl9AvhGfAiOUQp7xAqzTqncvCca3p` | 🔴 EXPUESTA |
| **Redirect URI** | `https://haida.stayarta.com/auth/callback` | ✅ Configurado |
| **Scopes** | `openid profile email` | ✅ Configurado |
| **Token Expiry** | 3600 segundos | ✅ Configurado |

#### Uso por Versión

**HAIDA (23-bug)**:
- `.env` línea 32: `ENTRA_TENANT_ID=...`
- `.env` línea 33: `ENTRA_CLIENT_ID=...`
- `.env` línea 34: `ENTRA_CLIENT_SECRET=...` (EXPUESTA)
- `backend/auth.py` línea 15: `msal.ConfidentialClientApplication()`
- **Función**: Development testing con Microsoft accounts

**HAIDA-PROJECT (main)**:
- `.env` línea 32: `ENTRA_TENANT_ID=...` (MISMO)
- `.env` línea 33: `ENTRA_CLIENT_ID=...` (MISMO)
- `.env` línea 34: `ENTRA_CLIENT_SECRET=...` (MISMO)
- `backend/auth.py` línea 15: `msal.ConfidentialClientApplication()`
- **Función**: Production OAuth flows con Microsoft accounts

#### Riesgos Identificados

| Riesgo | Severidad | Descripción |
|--------|-----------|-------------|
| **Secret Exposed** | 🔴 CRÍTICA | Client Secret visible en .env files |
| **History Compromise** | 🔴 CRÍTICA | Secret en git history de ambas ramas |
| **No Rotation** | 🟠 ALTA | No client secret rotation policy |
| **Single Tenant** | 🟠 ALTA | Solo una aplicación Azure para dev+prod |
| **No MFA Enforcement** | 🟠 ALTA | No MFA requerido en Azure |

#### Plan de Migración

**Fase 1** (Inmediato):
- [ ] Regenerar Azure Client Secret
- [ ] Guardar nuevo secret en Vercel secrets (NO en .env)
- [ ] Verificar no hay "código mal" durante rotación

**Fase 2** (1-2 días):
- [ ] Crear separate Azure application para DESARROLLO
- [ ] Crear separate Azure application para STAGING
- [ ] Configurar HAIDA con dev Azure app
- [ ] Configurar HAIDA-PROJECT con prod Azure app
- [ ] Test auth flows en ambas versiones

**Fase 3** (7+ días):
- [ ] Implement secret rotation policy (quarterly)
- [ ] Setup Azure MFA enforcement
- [ ] Document OAuth flow
- [ ] Train team on Azure admin

---

### 4. GITHUB ACTIONS - CI/CD Pipeline
**Criticidad**: 🔴 CRÍTICA
**Riesgo**: ALTO - Deploy automation
**Status**: ✅ FUNCIONAL

#### Workflows Configurados

| Workflow | Trigger | Destino | Status |
|----------|---------|---------|--------|
| **test.yml** | Push a cualquier rama | Ejecuta tests | ✅ Activo |
| **deploy-prod.yml** | Push a main | Vercel Production | ✅ Activo |
| **deploy-staging.yml** | Push a staging | Vercel Staging | ⚠️ No existe |
| **lint-and-format.yml** | PR + Push | CI checks | ✅ Activo |
| **security-scan.yml** | Schedule (diario) | Security checks | ✅ Activo |
| **playwright.yml** | Push + PR | E2E tests | ✅ Activo |

#### Riesgos Identificados

| Riesgo | Severidad | Descripción |
|--------|-----------|-------------|
| **No Staging Deploy** | 🟠 ALTA | No rama staging para pre-prod testing |
| **Direct Prod Deploy** | 🟠 ALTA | main rama deploya directo a prod sin gates |
| **No Manual Approval** | 🟠 ALTA | No human review requerido antes deploy |
| **Secrets in History** | 🔴 CRÍTICA | Git history contiene secrets |
| **No Pre-deploy Tests** | 🟠 ALTA | Tests corren pero no bloquean deploy |

#### Plan de Migración

**Fase 2** (2-3 días):
- [ ] Crear rama `staging` for pre-prod testing
- [ ] Crear deploy-staging.yml workflow
- [ ] Add manual approval step en deploy-prod.yml
- [ ] Require all tests pass before deploy

**Fase 3** (3-5 días):
- [ ] Implement GitHub branch protection on main
- [ ] Require PR reviews before merge
- [ ] Require all checks pass before merge
- [ ] Document CI/CD process

---

## INTEGRACIONES SECUNDARIAS (TIER 2)

### 1. SLACK - Notifications
**Criticidad**: 🟠 MEDIA
**Status**: ✅ FUNCIONAL

| Aspecto | HAIDA | HAIDA-PROJECT |
|---------|-------|---------------|
| **Webhook Configurado** | ✅ Sí | ✅ Sí |
| **URL Webhook** | `.env` línea 52 | `.env` línea 52 |
| **Canal Destino** | `#dev-alerts` | `#prod-alerts` |
| **Eventos Notificados** | Deploy, tests, errors | Deploy, alerts, errors |

**Riesgos**:
- Webhooks en .env (expuestos)
- No rotate webhooks policy

---

### 2. DOCKER - Local Development
**Criticidad**: 🟠 MEDIA
**Status**: ✅ FUNCIONAL

Ambas versiones incluyen `docker-compose.yml`:

**Servicios**:
- `postgres` - PostgreSQL local (5432)
- `redis` - Cache local (6379)
- `haida-backend` - FastAPI (8000)
- `haida-frontend` - React dev server (3000)

**Riesgos**:
- Docker credentials no expuestas en commits
- Local DB no tiene RLS (OK para local)

---

### 3. JIRA/CONFLUENCE - Project Management
**Criticidad**: 🟠 MEDIA
**Status**: ✅ FUNCIONAL

| Aspecto | Value | Status |
|---------|-------|--------|
| **Jira Instance** | hiberus.atlassian.net | ✅ Conectada |
| **Confluence Space** | HAIDA | ✅ Documentado |
| **API Token** | `.env` línea 61 | 🔴 EXPUESTO |

**Riesgos**:
- Jira API token expuesto en .env
- No token rotation policy

---

### 4. FIGMA - Design System
**Criticidad**: 🟠 MEDIA
**Status**: ✅ FUNCIONAL

| Aspecto | Value | Status |
|---------|-------|--------|
| **Project ID** | `design-system-2024` | ✅ Referenciado |
| **API Token** | `.env` línea 47 | 🔴 EXPUESTO |
| **Design Files** | `/Haida/Figma/` (100+ archivos) | ✅ Sincronizados |

**Riesgos**:
- Figma API token expuesto
- Manual sync (no automático)

---

## INTEGRACIONES EXPERIMENTALES (TIER 3)

### 1. RAILWAY - Alternative Hosting
**Criticidad**: 🟡 BAJA
**Status**: ⚠️ CONFIGURADO SOLO EN HAIDA

| Aspecto | HAIDA | HAIDA-PROJECT |
|---------|-------|---------------|
| **Token Presente** | ✅ Sí (.env línea 67) | ❌ No |
| **Función** | Backup deployment | N/A |
| **URL** | `railway.app` | N/A |

**Nota**: Railway es alternativa a Vercel. Configurado pero NO usado en producción.

---

### 2. TELEGRAM BOT - Notifications
**Criticidad**: 🟡 BAJA
**Status**: ⚠️ CONFIGURADO SOLO EN HAIDA

| Aspecto | HAIDA | HAIDA-PROJECT |
|---------|-------|---------------|
| **Bot Token** | ✅ Sí (expuesto) | ❌ No |
| **Chat ID** | ✅ Sí | ❌ No |
| **Función** | Debug/test alerts | N/A |

---

### 3. LM STUDIO - Local LLM
**Criticidad**: 🟡 BAJA
**Status**: ⚠️ EXPERIMENTAL

| Aspecto | HAIDA | HAIDA-PROJECT |
|---------|-------|---------------|
| **URL Local** | http://localhost:1234/v1 | ❌ No |
| **Función** | Local AI inference | N/A |

---

### 4. MICROSOFT COPILOT - AI Integration
**Criticidad**: 🟡 BAJA
**Status**: ⚠️ EXPERIMENTAL

| Aspecto | HAIDA | HAIDA-PROJECT |
|---------|-------|---------------|
| **DirectLine Secret** | ✅ Sí (expuesto) | ❌ No |
| **Función** | Chatbot integration | N/A |

---

## RIESGOS DE INTEGRACIÓN

### Matriz de Riesgos Consolidada

```
┌─────────────────────────────────────────────────────────────────┐
│                    RIESGOS POR INTEGRACIÓN                       │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│ 🔴 CRÍTICAS:                                                     │
│   • Supabase: Shared DB, credentials exposed, no backup         │
│   • Vercel: Shared project, no branch protection, CORS wildcard │
│   • Azure: Secret exposed, no rotation policy, single tenant    │
│   • GitHub: Secrets in history, direct prod deploy             │
│                                                                  │
│ 🟠 ALTAS:                                                        │
│   • Slack: Webhooks exposed, no rotation                        │
│   • Jira: API token exposed, no rotation                        │
│   • Figma: API token exposed, manual sync                       │
│   • Docker: OK locally, but needs secrets management            │
│                                                                  │
│ 🟡 MEDIAS:                                                       │
│   • Railway: Only in dev, low risk                              │
│   • Telegram: Only in dev, low risk                             │
│   • LM Studio: Only in dev, low risk                            │
│   • Copilot: Experimental, only in dev                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Impact Analysis

| Escenario | Riesgo | Impacto | Probabilidad |
|-----------|--------|--------|-------------|
| **Feature branch deploya a prod** | 🔴 Crítico | Prod sobrescrito con código no testado | 🔴 ALTA |
| **Credentials comprometidas** | 🔴 Crítico | Acceso total a sistema | 🔴 ALTA |
| **DB corruption (migraciones)** | 🔴 Crítico | Data loss, service outage | 🟠 MEDIA |
| **API exposed via CORS** | 🔴 Crítico | XSS attacks, data theft | 🟠 MEDIA |
| **Staging no existe** | 🟠 Alta | No pre-prod testing | 🔴 ALTA |
| **Manual Slack/Jira tokens** | 🟠 Alta | Workflow interruption si expuesto | 🟠 MEDIA |

---

## ROADMAP DE MIGRACIÓN

### Timeline Consolidado

#### FASE 1 - Incident Response (2-4 horas)
**PRIORIDAD**: 🔴 MÁXIMA - HACERAHORA

```
1. VERCEL - Disable 23-bug deployments
   - [ ] GitHub Settings → Branch Protection
   - [ ] Allow only main branch to deploy
   - [ ] Verify 23-bug can't push to prod
   TIME: 15 minutos

2. SUPABASE - Credential Rotation
   - [ ] Regenerate Anon Key
   - [ ] Regenerate Service Role Key
   - [ ] Change database password
   TIME: 30 minutos

3. AZURE ENTRA - Client Secret Rotation
   - [ ] Regenerate Client Secret
   - [ ] Update Vercel secrets
   TIME: 15 minutos

4. BACKUP - Supabase Production
   - [ ] Manual backup via Supabase dashboard
   - [ ] Export database schema
   - [ ] Store securely (NOT in repo)
   TIME: 10 minutos

5. VERIFICATION - Test both versions
   - [ ] HAIDA (23-bug) still connects to dev resources
   - [ ] HAIDA-PROJECT (main) still works in production
   TIME: 30 minutos

TOTAL: 2-4 horas
```

#### FASE 2 - Consolidation (5-7 días)
**PRIORIDAD**: 🟠 ALTA - This Week

```
Day 1-2: Database Separation
- [ ] Create Supabase project for DEVELOPMENT
- [ ] Create Supabase project for STAGING
- [ ] Restore schema in new projects
- [ ] Update HAIDA to use dev database

Day 3-4: Secrets Migration
- [ ] Move all secrets to Vercel Environment Variables
- [ ] Remove .env from git tracking
- [ ] Update .gitignore
- [ ] Verify both versions work with Vercel secrets

Day 5-6: Code Cleanup
- [ ] Update CORS from wildcard to specific origins
- [ ] Fix any hardcoded URLs
- [ ] Remove old deployment configs

Day 7: Testing
- [ ] Full test suite on HAIDA (dev DB)
- [ ] Full test suite on HAIDA-PROJECT (prod DB)
- [ ] Smoke tests on both Vercel deployments
```

#### FASE 3 - Security Hardening (7-10 días)
**PRIORIDAD**: 🟠 ALTA - Next Week

```
- [ ] Implement git-secrets pre-commit hook
- [ ] Enable GitHub branch protection on main
- [ ] Require PR reviews before merge
- [ ] Require CI checks before deploy
- [ ] Setup Azure MFA
- [ ] Setup credential rotation schedule
```

#### FASE 4 - Documentation (5-7 días)
**PRIORIDAD**: 🟡 MEDIA - Next 2 Weeks

```
- [ ] Document deployment process
- [ ] Document emergency procedures
- [ ] Train team on new procedures
- [ ] Create runbooks for common issues
```

---

## RESUMEN EJECUTIVO PARA CARLOS

### Estado Actual: 🔴 CRÍTICO

**2 versiones de HAIDA comparten la MISMA infraestructura**:
- Feature branch (23-bug) puede deployar a producción
- Mismo Supabase database
- Credenciales expuestas en .env
- Sin aislamientos dev/staging/prod

### Riesgos Inmediatos:
1. **Deploy Conflict**: Si alguien pushea a 23-bug, prod se sobrescribe
2. **Credential Theft**: 10+ secretos visibles en git history
3. **Data Corruption**: Migraciones en dev afectan prod
4. **API Exposure**: CORS wildcard permite cualquier origen

### Próximos Pasos:
1. **HOY**: Ejecutar FASE 1 (Incident Response) - 2-4 horas
2. **This Week**: Ejecutar FASE 2 (Consolidation) - 5-7 días
3. **Next Week**: Ejecutar FASE 3 (Security) - 7-10 días

---

**Documento Generado**: 09 de Enero 2026
**Clasificación**: CONFIDENCIAL
**Próxima Revisión**: Post-Fase 1 (hoy+4h)
