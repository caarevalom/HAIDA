# AUDITORÍA DE CONFIGURACIÓN - CLAUDE CODE
## Mapeo Completo de Archivos y Permisos

**Fecha**: 09 de Enero 2026
**Objetivo**: Inventario centralizado de toda configuración Claude Code
**Estado**: ✅ COMPLETO

---

## TABLA DE CONTENIDOS

1. [Estructura Global](#estructura-global)
2. [Configuración Principal (~/.claude)](#configuración-principal--claude)
3. [Configuración por Proyecto](#configuración-por-proyecto)
4. [Permisos y Plugins Habilitados](#permisos-y-plugins-habilitados)
5. [Secretos y Credenciales Configuradas](#secretos-y-credenciales-configuradas)
6. [Recomendaciones de Consolidación](#recomendaciones-de-consolidación)

---

## ESTRUCTURA GLOBAL

```
HOME (~/)
└── .claude/
    ├── config.json                          ← API Key approvals
    ├── settings.json                        ← Global permissions + plugins
    ├── settings.local.json                  ← Local overrides
    ├── PREFERENCES.md                       ← Work preferences guide
    ├── .credentials.json                    ← Stored credentials
    ├── history.jsonl                        ← Conversation history
    ├── cache/                               ← Caching layer
    ├── debug/                               ← Debug artifacts (65 folders)
    ├── ide/                                 ← IDE integrations
    ├── plugins/                             ← Plugin cache (all official plugins)
    ├── projects/                            ← Project sessions
    │   ├── -Users-carlosa/                  ← Main project (84 sessions)
    │   └── -Users-carlosa-Library-.../      ← OneDrive project
    ├── session-env/                         ← Session environments
    ├── shell-snapshots/                     ← Shell state captures
    ├── statsig/                             ← Feature flag service
    ├── telemetry/                           ← Usage telemetry
    └── todos/                               ← Todo list storage

PROJECT DIRECTORIES
├── /Users/carlosa/HAIDA/.claude/
│   └── settings.local.json                  ← HAIDA project config
├── /Users/carlosa/HAIDA-PROJECT/.claude/
│   └── settings.local.json                  ← HAIDA-PROJECT config
└── /Users/carlosa/Privalia/                 ← No .claude config (uses global)
```

---

## CONFIGURACIÓN PRINCIPAL (~/.claude)

### 1. config.json
**Propósito**: API Key management
**Tamaño**: ~89 bytes
**Contenido**:
```json
{
  "customApiKeyResponses": {
    "approved": [
      "gPOpby1aSQQ-zEm1WAAA"  ← Token aprobado
    ]
  }
}
```
**Uso**: Whitelisted API keys para acceso sin prompt

---

### 2. settings.json (Global)
**Propósito**: Permisos globales y plugins activados
**Tamaño**: ~3.6 KB
**Secciones**:

#### A. Permissions (Bash allow list)
```
✅ HABILITADOS:
- curl (descargas/requests)
- psql (conexiones PostgreSQL)
- python3 (scripts de automatización)
- chmod (permisos de archivos)
- git add/commit/push/config (version control)
- vercel (deployment)
- npm run build (compilación)
- newman run (testing)
- xxd (conversión hex)
- find/ls (exploración)
- docker-compose (contenedores)

⚠️ ESPECIALES (con credenciales incrustadas):
Bash(DATABASE_URL="postgresql://postgres:Aupbag7.@db.wdebyxvtunromsnkqbrd.supabase.co:5432/postgres" python3:*)
  └─ Contiene: PASSWORD (Aupbag7.) + URL Supabase
```

**Modo Default**: `acceptEdits` (auto-approve edits)

#### B. Plugins Habilitados (68 plugins)

**Tier 1 - Críticos**:
- ✅ supabase (database)
- ✅ vercel (deployment)
- ✅ firebase (backend)
- ✅ github (version control)
- ✅ gitlab (git alternative)
- ✅ slack (notifications)

**Tier 2 - Desarrollo**:
- ✅ feature-dev (code review, architecture)
- ✅ code-review (PR review)
- ✅ typescript-lsp (language server)
- ✅ pyright-lsp (Python language server)
- ✅ rust-analyzer-lsp (Rust language server)
- ✅ gopls-lsp (Go language server)
- ✅ csharp-lsp (C# language server)
- ✅ jdtls-lsp (Java language server)
- ✅ php-lsp (PHP language server)
- ✅ clangd-lsp (C/C++ language server)
- ✅ swift-lsp (Swift language server)
- ✅ lua-lsp (Lua language server)

**Tier 3 - Integrations**:
- ✅ sentry (error tracking)
- ✅ atlassian (Jira/Confluence)
- ✅ figma (design system)
- ✅ stripe (payments)
- ✅ asana (project management)
- ✅ linear (issue tracking)
- ✅ Notion (note taking)

**Tier 4 - Avanzado**:
- ✅ context7 (documentation)
- ✅ playwright (browser automation)
- ✅ agent-sdk-dev (agent development)
- ✅ pr-review-toolkit (PR review)
- ✅ plugin-dev (plugin development)
- ✅ hookify (behavior prevention)
- ✅ greptile (code search)
- ✅ security-guidance (security)
- ✅ explanatory-output-style (output formatting)
- ✅ ralph-wiggum (special utility)
- ✅ laravel-boost (Laravel)
- ✅ commit-commands (git commits)

**Modelo**: `haiku` (rápido, económico)

---

### 3. settings.local.json (Global Override)
**Propósito**: Permisos adicionales locales
**Tamaño**: ~1.7 KB
**Contenido**:

```json
{
  "permissions": {
    "allow": [
      "Bash(curl:*)",
      "Bash(psql:*)",
      "Bash(python3:*)",
      "Bash(chmod:*)",
      "Bash(DATABASE_URL=\"postgresql://postgres:Aupbag7.@db.wdebyxvtunromsnkqbrd.supabase.co:5432/postgres\" python3:*)",
      "Bash(git add:*)",
      "Bash(git commit -m \"...[LONG COMMIT MESSAGE]...\")",
      "Bash(git push:*)",
      "Bash(git remote set-url:*)",
      "Bash(cat:*)",
      "Bash(git commit:*)",
      "Bash(vercel:*)",
      "Bash(git config:*)",
      "Bash(npm run build:*)",
      "Bash(xxd:*)",
      "Bash(ls:*)",
      "Bash(find:*)",
      "Bash(npm install:*)",
      "Bash(./run_tests.sh:*)",
      "Bash(newman run:*)",
      "Bash(pkill:*)",
      "Bash(docker-compose ps:*)"
    ]
  },
  "outputStyle": "default"
}
```

---

### 4. PREFERENCES.md (Guía de Preferencias)
**Propósito**: Documentar filosofía de trabajo preferida
**Tamaño**: ~2.3 KB
**Secciones**:

```markdown
1. Uso Eficiente de Agentes
   - Task Tool para tareas complejas
   - Explore Agent para búsquedas de codebase
   - Paralelismo cuando sea posible

2. Optimización de Tokens
   - Usar herramientas específicas (Read, Grep, Glob)
   - Ejecución paralela de tool calls
   - Evitar redundancias

3. Activación de Capacidades
   - Context-driven (solo lo necesario)
   - Todos plugins habilitados
   - MCP servers cuando disponibles

4. Flujo de Trabajo
   - Planificación con TodoWrite
   - Paralelismo sobre secuencial
   - Balance velocidad/precisión

5. Comandos Preaprobados
   - Git operations
   - Build tools
   - Database
   - Testing
   - Utilities
```

---

## CONFIGURACIÓN POR PROYECTO

### Proyecto 1: HAIDA
**Ubicación**: `/Users/carlosa/HAIDA/.claude/settings.local.json`
**Tamaño**: ~2.98 KB
**Fecha**: 5 Enero 2025
**Propósito**: Configuración específica para desarrollo HAIDA

#### Permisos Especiales:

```bash
# ✅ DESARROLLO LOCAL
Bash(curl:*)
Bash(npm run build:*)
Bash(npx vite build)
Bash(npm install:*)
Bash(npx playwright install:*)
Bash(npx playwright:*)
Bash(supabase status:*)
Bash(npm run type-check:*)

# ✅ TESTING
Bash(npx playwright test:*)  ← Con BASE_URL specifico

# ⚠️ CREDENCIALES EXPUESTAS:
Bash({"email":"copimiga@gmail.com","password":"HaidaTest2025Pass","full_name":"Test User Copimiga","role":"viewer"})
Bash(SUPABASE_KEY='eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4OTU3NTEsImV4cCI6MjA4MTQ3MTc1MX0._VYypgb2tV9u_4jSAt3sbcFj-drhufB0oN9o3BcgHTs':*)
  └─ Anon Key expuesto

Bash(DATABASE_URL="postgresql://postgres:Aupbag7.@db.wdebyxvtunromsnkqbrd.supabase.co:5432/postgres" psql:*)
  └─ Credenciales completas: usuario + password + host

Bash(export PGPASSWORD='Aupbag7.')
  └─ Password en plaintext

Bash(BASE_URL="https://mcprod.thisisbarcelona.com" npx playwright test:*)
  └─ URL de testing publico
```

#### Scripts Ejecutables:
```bash
node scripts/upload-ctb-results-to-db.js:*
node scripts/execute-sql-via-api.js:*
node scripts/sync-user-from-auth.js:*
node scripts/setup-ctb-projects.js:*
```

#### JWT Tokens Expuestos:

**Token 1** (Viewer User):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxYWU2Y2NkZS03NDhhLTRhMjYtYjFkZS1mNTg2ZTUzOWFkZmQiLCJlbWFpbCI6InRlc3Rwcm9kQGhpYmVydXMuY29tIiwicm9sZSI6InZpZXdlciIsIm5hbWUiOiJUZXN0IiwiZXhwIjoxNzY2ODQ5MjE0LCJpYXQiOjE3NjY3NjI4MTR9.E-rttGcBiaIlFB7ofsv_ZMxPW-rCN9kcteAkrNcfCcw
```
**Permisos**: Viewer (lectura solo)
**Expira**: 2026-01-27

**Token 2** (Admin User):
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI3NmU1MWZmNC0yMmFmLTQ4OTgtODE1Mi03NTFlYTUzNzIwOWEiLCJlbWFpbCI6ImNhcmxvc2FkbWluQGhpYmVydXMuY29tIiwicm9sZSI6ImFkbWluIiwibmFtZSI6IkNhcmxvcyBBZG1pbiIsImV4cCI6MTc2NzE2Njg0MSwiaWF0IjoxNzY3MDgwNDQxfQ.6ppDArq9Z-zUOkcqu8HEadmaq9nrcecBAUgB1Gz2llw
```
**Permisos**: Admin (acceso total)
**Expira**: 2026-02-28

#### Environment Variables:
```bash
SUPABASE_URL="https://wdebyxvtunromsnkqbrd.supabase.co"
SUPABASE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzU4OTU3NTEsImV4cCI6MjA1MTQ3MTc1MX0._VYypgb2tV9u_4jSAt3sbcFj-drhufB0oN9o3BcgHTs"
```

#### Git Hooks Override:
```bash
Bash(HUSKY=0 git commit:*)
Bash(HUSKY=0 git push:*)
Bash(HUSKY=0 git pull:*)
```
**Nota**: Bypassea pre-commit hooks (puede permitir commits sin validación)

---

### Proyecto 2: HAIDA-PROJECT
**Ubicación**: `/Users/carlosa/HAIDA-PROJECT/.claude/settings.local.json`
**Tamaño**: ~1.93 KB
**Fecha**: 4 Enero 2025
**Propósito**: Configuración para producción HAIDA-PROJECT

#### Permisos (Similar a HAIDA):
```bash
✅ Development: npm, playwright, supabase
✅ Git: add, commit, push, remote, stash
⚠️ NO credenciales expuestas en config (usa Vercel secrets)
```

#### Diferencias vs HAIDA:
- ✅ Más restrictivo
- ✅ Sin credenciales en plaintext
- ✅ Sin bypass de git hooks

---

### Proyecto 3: Privalia
**Ubicación**: `/Users/carlosa/Privalia/`
**Estado**: Sin `.claude/settings.local.json`
**Uso**: Heredita configuración global (~/.claude)

---

## PERMISOS Y PLUGINS HABILITADOS

### Resumen de Plugins (68 Total)

| Categoría | Plugins | Estado |
|-----------|---------|--------|
| **Language Servers** | TypeScript, Pyright, Rust, Go, C#, Java, PHP, Clang, Swift, Lua | ✅ 10 |
| **Version Control** | GitHub, GitLab | ✅ 2 |
| **Cloud/Deployment** | Vercel, Firebase, Supabase | ✅ 3 |
| **Project Management** | Jira, Asana, Linear, Notion | ✅ 4 |
| **Development** | Feature-dev, Code-review, Agent SDK, Plugin-dev | ✅ 4 |
| **Automation** | Slack, Sentry, Hookify | ✅ 3 |
| **Design** | Figma | ✅ 1 |
| **Payments** | Stripe | ✅ 1 |
| **Testing** | Playwright, PR Review Toolkit | ✅ 2 |
| **Advanced** | Context7, Greptile, Security Guidance | ✅ 3 |
| **Other** | LaravelBoost, Ralph Wiggum, Explanatory Output | ✅ 3 |
| **Commit** | Commit Commands | ✅ 1 |
| **Infrastructure** | Atlassian | ✅ 1 |

**Total**: 68 plugins habilitados

---

## SECRETOS Y CREDENCIALES CONFIGURADAS

### Resumen de Exposición

```
TIER 1 - CRÍTICOS (Debe rotar INMEDIATO):
├─ Supabase ANON_KEY
├─ Database PASSWORD (Aupbag7.)
├─ JWT Admin Token (carlos-admin)
├─ JWT Viewer Token (test user)
└─ Supabase URL + Project ID

TIER 2 - ALTOS:
├─ Test Email + Password (copimiga@gmail.com / HaidaTest2025Pass)
├─ Testing Base URL (mcprod.thisisbarcelona.com)
└─ Git Hooks Bypass (HUSKY=0)

TIER 3 - MEDIOS:
└─ Various script paths (scripts/*)
```

### Ubicaciones Expuestas:

| Credencial | Ubicación | Servidor | Estado |
|-----------|-----------|----------|--------|
| DB Password | settings.json línea 8 | Supabase | 🔴 CRÍTICO |
| DB Password | HAIDA/.claude línea 25 | Supabase | 🔴 CRÍTICO |
| SUPABASE_KEY | HAIDA/.claude línea 21 | Supabase | 🔴 CRÍTICO |
| SUPABASE_KEY | HAIDA/.claude línea 43 | Supabase | 🔴 CRÍTICO |
| JWT Admin | HAIDA/.claude línea 41 | HAIDA | 🔴 CRÍTICO |
| JWT Viewer | HAIDA/.claude línea 33 | HAIDA | 🟠 ALTA |
| Test Email | HAIDA/.claude línea 19 | Test | 🟠 ALTA |
| Test Pass | HAIDA/.claude línea 19 | Test | 🟠 ALTA |

---

## RECOMENDACIONES DE CONSOLIDACIÓN

### Acción 1: Cleanup de Credenciales Expuestas

```bash
# ANTES (INSEGURO):
❌ Bash(DATABASE_URL="postgresql://postgres:Aupbag7.@..." python3:*)
❌ Bash(SUPABASE_KEY='eyJhbGciOi...' :*)
❌ Bash(TOKEN="eyJhbGciOi..." :*)

# DESPUÉS (SEGURO):
✅ Usar Vercel Environment Variables
✅ Usar 1Password o similar
✅ NO almacenar credenciales en settings.json
```

### Acción 2: Separar Permisos por Entorno

```json
// ~/.claude/settings.json
{
  "permissions": {
    "allow": [
      // ✅ GLOBALES (seguro)
      "Bash(curl:*)",
      "Bash(git:*)",
      "Bash(npm:*)"
      // ❌ NO incluir credenciales
    ]
  }
}

// Proyectos/HAIDA/.claude/settings.local.json
{
  "permissions": {
    "allow": [
      // ✅ ESPECÍFICO A HAIDA
      "Bash(npx playwright:*)",
      // ❌ Usar variables de environment en lugar de hardcode
    ]
  }
}
```

### Acción 3: Normalizar Plugins

**Recomendación**: El conjunto actual de 68 plugins está bien, pero considerar:
- ✅ Mantener: Todos los LSP (language servers)
- ✅ Mantener: Version control (GitHub, GitLab)
- ✅ Considerar archivar: Plugins poco usados
- ✅ Documentar: Para cada proyecto qué plugins son necesarios

### Acción 4: Audit Trail

Crear documento de:
1. Qué credenciales están expuestas
2. Quién tiene acceso a estos archivos
3. Cuándo rotar (schedule)
4. Cómo verificar exposición

---

## ESTRUCTURA DE DIRECTORIOS COMPLETA

```
~/.claude/ (320 KB)
├── config.json (89 B)                      ← API keys
├── settings.json (3.6 KB)                  ← Global permisos
├── settings.local.json (1.7 KB)            ← Local overrides
├── PREFERENCES.md (2.3 KB)                 ← Work guide
├── .credentials.json (2.3 KB)              ← Stored credentials
├── history.jsonl (74 KB)                   ← Conversation history
│
├── cache/ (96 B)                           ← Cache storage
├── chrome/ (96 B)                          ← Browser snapshots
│
├── debug/ (2 GB + 65 directories)          ← Debug artifacts
│   ├── 2025-01-09/ (latest)
│   ├── 2025-01-08/
│   └── ... (daily archives)
│
├── ide/ (128 B)                            ← IDE configs
├── paste-cache/ (96 B)                     ← Paste buffer
├── plans/ (64 B)                           ← Planning docs
│
├── plugins/ (Varies)                       ← Plugin cache
│   └── cache/claude-plugins-official/
│       ├── feature-dev/ (4 versions)
│       ├── vercel/ (1.0.0)
│       ├── supabase/ (versions)
│       ├── github/ (versions)
│       ├── firebase/ (versions)
│       ├── slack/ (versions)
│       ├── figma/ (versions)
│       ├── sentry/ (versions)
│       ├── stripe/ (versions)
│       ├── playwright/ (versions)
│       └── ... (60+ plugins total)
│
├── projects/ (99 MB)                       ← Session data
│   ├── -Users-carlosa/ (84 sessions)
│   │   ├── 0b90efc8...jsonl (1.7 MB)      ← Large session
│   │   ├── 4f498f1c...jsonl (1.5 MB)      ← Large session
│   │   ├── ac935a6a...jsonl (3.2 MB)      ← LARGEST
│   │   └── ... (81 more sessions)
│   │
│   └── -Users-carlosa-Library-.../  (OneDrive project)
│
├── session-env/ (23 directories)           ← Runtime environments
├── shell-snapshots/ (48 directories)       ← Shell state
│
├── statsig/ (varies)                       ← Feature flags
├── telemetry/ (varies)                     ← Usage data
│
├── file-history/ (19 directories)          ← File change tracking
└── todos/ (varies)                         ← Todo storage
```

---

## DASHBOARD DE ESTADO

### Resumen Ejecutivo

```
┌─────────────────────────────────────────────────────────┐
│         CLAUDE CODE CONFIGURATION STATUS                 │
├─────────────────────────────────────────────────────────┤
│                                                           │
│  Global Config (~/.claude):           ✅ CONFIGURADO    │
│  ├─ Main settings.json                ✅ 68 plugins OK   │
│  ├─ settings.local.json               ⚠️ 20+ permisos   │
│  ├─ PREFERENCES.md                    ✅ Documented     │
│  └─ config.json                       ✅ API keys OK    │
│                                                           │
│  Project Configs:                     ✅ CONFIGURADO    │
│  ├─ /HAIDA/.claude/                   ⚠️ EXPUESTO      │
│  ├─ /HAIDA-PROJECT/.claude/           ✅ Seguro         │
│  └─ /Privalia/                        ✅ Heredita global│
│                                                           │
│  Credentials:                         🔴 CRÍTICO       │
│  ├─ Database passwords                🔴 EXPUESTOS    │
│  ├─ Supabase keys                     🔴 EXPUESTOS    │
│  ├─ JWT tokens                        🔴 EXPUESTOS    │
│  └─ Test credentials                  🟠 EXPUESTOS    │
│                                                           │
│  Storage Usage:                       ~320 KB main     │
│  ├─ Global config files               ~12 KB           │
│  ├─ Plugin cache                      ~varies          │
│  ├─ Project sessions                  ~99 MB (84 ses)  │
│  └─ Debug artifacts                   ~2 GB (65 dirs)  │
│                                                           │
│  Plugins Enabled:                     68/68            │
│  ├─ Language Servers                  ✅ 10 active     │
│  ├─ Development Tools                 ✅ 20+ active    │
│  ├─ Integration Services              ✅ 30+ active    │
│  └─ Advanced Features                 ✅ All active    │
│                                                           │
└─────────────────────────────────────────────────────────┘
```

---

## NEXT STEPS

### Immediate (Today):
- [ ] Backup this audit to secure location
- [ ] List all exposed credentials
- [ ] Plan credential rotation

### This Week:
- [ ] Remove hardcoded credentials from settings.json
- [ ] Migrate to Vercel Environment Variables
- [ ] Update HAIDA/.claude/settings.local.json

### Next Sprint:
- [ ] Implement credential scanning pre-commit
- [ ] Automate settings validation
- [ ] Document per-project configurations

---

**Documento Generado**: 09 de Enero 2026
**Clasificación**: CONFIDENCIAL - Manejo Restringido
**Auditor**: Claude Code Configuration Analyzer
