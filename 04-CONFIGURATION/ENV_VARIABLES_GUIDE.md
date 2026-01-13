# HAIDA - Guía de Variables de Entorno

Esta guía documenta todas las variables de entorno utilizadas en los proyectos HAIDA.

> **⚠️ SEGURIDAD**: Los archivos `.env` están excluidos del repositorio Git por razones de seguridad. Nunca versiones credenciales reales.

---

## Índice

1. [CTB - QA Environment](#ctb---qa-environment)
2. [HAIDA Production](#haida-production)
3. [HAIDA Development](#haida-development)
4. [Variables Comunes](#variables-comunes)

---

## CTB - QA Environment

**Ubicación**: `00-PROJECTS/CTB/client-repos/main/.env`

### URLs Base
```bash
BASE_URL=https://mcprod.thisisbarcelona.com
TEST_URL=https://mcprod.thisisbarcelona.com
B2C_URL=https://mcprod.thisisbarcelona.com
AFILIATS_URL=https://mcprod.thisisbarcelona.com/es/affiliates
OFICINAS_URL=https://mcprod.thisisbarcelona.com/es/offices/
```

### Credenciales de Prueba
```bash
CTB_USERNAME=<username>
CTB_PASSWORD=<password>
AFILIATS_USERNAME=<email>
AFILIATS_PASSWORD=<password>
OFICINAS_USERNAME=<email>
OFICINAS_PASSWORD=<password>
```

### Datos de Prueba
```bash
TEST_EMAIL=user@test.com
TEST_PASSWORD=Test123!
TEST_CARD_NUMBER=4111111111111111  # Stripe test card
TEST_CARD_EXP=12/30
TEST_CARD_CVV=123
```

### Perfiles de Ejecución
```bash
PLATFORMS=desktop,ios,android
BROWSERS=chromium,firefox,webkit
VIEWPORTS_DESKTOP=1366x768,1440x900
VIEWPORTS_MOBILE_IOS=390x844
VIEWPORTS_MOBILE_ANDROID=412x915
```

### Reportes
```bash
ALLURE_RESULTS_DIR=reports/allure-results
PLAYWRIGHT_REPORT_DIR=playwright-report
SLACK_WEBHOOK=<webhook_url>
```

### Integraciones
```bash
REDMINE_URL=https://redmine.hiberus.com/redmine
SHAREPOINT_URL=<sharepoint_url>
```

### Rutas Locales
```bash
CTB_DOCS_ROOT=/Users/carlosa/Hiberus/CTB
FIGMA_EXPORTS_DIR=/Users/carlosa/Hiberus/CTB/docs/figma/figma_exports
```

---

## HAIDA Production

**Ubicación**: `00-PROJECTS/HAIDA/haida-production/main/.env.local`

### Aplicación
```bash
APP_NAME=HAIDA
CORS_ORIGINS=https://haida-frontend.vercel.app,http://localhost:3000
```

### Supabase (Base de Datos)
```bash
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<database>
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_KEY=<service_role_jwt_token>
```

### Vercel
```bash
VERCEL_OIDC_TOKEN=<jwt_token>
```

---

## HAIDA Development

**Ubicación**: `00-PROJECTS/HAIDA/haida-main/dev/.env.testing` y `.env.local`

### URLs de Aplicación
```bash
BASE_URL=https://haida.carlosarta.com
API_URL=https://back.carlosarta.com
```

### Supabase (Frontend)
```bash
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=<anon_jwt_token>
```

### Usuarios de Prueba
```bash
TEST_ADMIN_EMAIL=<admin_email>
TEST_ADMIN_PASSWORD=<admin_password>
TEST_QA_EMAIL=<qa_email>
TEST_QA_PASSWORD=<qa_password>
TEST_DEV_EMAIL=<dev_email>
TEST_DEV_PASSWORD=<dev_password>
TEST_VIEWER_EMAIL=<viewer_email>
TEST_VIEWER_PASSWORD=<viewer_password>
```

### Jira
```bash
JIRA_URL=https://<workspace>.atlassian.net
JIRA_EMAIL=<email>
JIRA_API_TOKEN=<api_token>
JIRA_PROJECT_KEY=<project_key>
```

### Confluence
```bash
CONFLUENCE_URL=https://<workspace>.atlassian.net/wiki
CONFLUENCE_EMAIL=<email>
CONFLUENCE_API_TOKEN=<api_token>  # Mismo token que Jira
CONFLUENCE_SPACE_KEY=<space_key>
```

### Allure Reporting
```bash
ALLURE_RESULTS_DIR=./allure-results
ALLURE_REPORT_DIR=./allure-report
```

### ISTQB Compliance
```bash
ISTQB_TEMPLATE_VERSION=v4.0
TEST_LEVEL=System_Integration
TEST_TYPE=Functional_E2E
```

### Telegram Bot (Dev)
```bash
TELEGRAM_BOT_TOKEN=<bot_token>
TELEGRAM_CHAT_ID=<chat_id>
```

---

## Variables Comunes

### Bases de Datos

| Variable | Descripción | Formato |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:port/db` |
| `SUPABASE_URL` | Supabase project URL | `https://<ref>.supabase.co` |
| `SUPABASE_SERVICE_KEY` | Service role key (backend) | JWT token |
| `VITE_SUPABASE_ANON_KEY` | Anonymous key (frontend) | JWT token |

### Testing

| Variable | Descripción | Valores |
|----------|-------------|---------|
| `BROWSERS` | Navegadores para testing | `chromium,firefox,webkit` |
| `PLATFORMS` | Plataformas a testear | `desktop,ios,android` |
| `VIEWPORTS_*` | Resoluciones de pantalla | `WIDTHxHEIGHT` |

### Integración

| Variable | Descripción |
|----------|-------------|
| `JIRA_URL` | URL de instancia Jira |
| `JIRA_API_TOKEN` | Token de API de Atlassian |
| `CONFLUENCE_URL` | URL de Confluence |
| `SLACK_WEBHOOK` | Webhook para notificaciones |

---

## Estructura de Archivos Recomendada

```
proyecto/
├── .env                    # Archivo principal (git-ignored)
├── .env.example            # Template sin credenciales (versionado)
├── .env.local              # Variables locales específicas (git-ignored)
├── .env.production         # Variables de producción (git-ignored)
├── .env.testing            # Variables de testing (git-ignored)
└── .env.development        # Variables de desarrollo (git-ignored)
```

---

## Notas de Seguridad

1. **Nunca versionar archivos `.env`** con credenciales reales
2. **Usar `.env.example`** con placeholders para documentar
3. **Rotar credenciales** si se exponen accidentalmente
4. **Usar gestores de secretos** para producción (Vercel, Railway, etc.)
5. **Tokens JWT tienen expiración** - verificar regularmente

---

## Cómo Usar

### 1. Clonar el repositorio
```bash
git clone <repo-url>
cd <project-dir>
```

### 2. Copiar archivos de ejemplo
```bash
cp .env.example .env
```

### 3. Completar las credenciales
Editar `.env` con los valores reales proporcionados por el equipo.

### 4. Verificar que está ignorado
```bash
git status  # No debería aparecer .env
```

---

## Contacto

Para obtener credenciales de desarrollo o producción, contactar:
- **DevOps Lead**: [contacto]
- **QA Lead**: [contacto]

---

**Última actualización**: 2026-01-13
