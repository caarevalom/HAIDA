# ⚠️ ANÁLISIS DE INCONSISTENCIAS - HAIDA

**Generado**: ++34662652300
**Verificador**: Claude (HAIDA Verification Agent)
**Severidad**: Alta, Media, Baja

---

## 🔴 PROBLEMAS CRÍTICOS (ALTA SEVERIDAD)

---

### 1️⃣ CREDENCIALES EXPUESTAS EN REPOSITORIO

**Ubicación**: `/Users/carlosa/00-PROJECTS/HAIDA/haida-production/main/docs/root-docs/misc/CREDENTIALS.md`

**Problema**:
```
⚠️ Archivo CREDENTIALS.md contiene:
- Vercel tokens (TGtBryOqKfSQNAapoP1SWu4F, En71WFRhXA6GM1ghALnFrX3i)
- Telegram bot token (++34662652300:AAGUbxodYRSf1RsOWZARDmQEs8Rb84Sbxnc)
- Microsoft Client Secret (6GI8Q~kMgGHrl9AvhGfAiOUQp7xAqzTqncvCca3p)
- JWT Secret (ECB76E37-DB86-435A-9E17-3DEF19FF57A7)
- Supabase keys (Service Role, Anon Key)
- Jira API Token
- Database credentials
```

**Impacto**:
- ⚠️ Seguridad: **CRÍTICA** - Acceso no autorizado a todos los sistemas
- ⚠️ Compliance: Violación de estándares (SOC 2, ISO 27001)
- ⚠️ Financiero: Posible robo de recursos (GCP, Vercel, API quotas)

**Solución Recomendada**:

```bash
# 1. INMEDIATO: Rotar todos los secretos
# Vercel
vercel tokens revoke TGtBryOqKfSQNAapoP1SWu4F
vercel tokens revoke En71WFRhXA6GM1ghALnFrX3i

# Telegram Bot
# Ir a https://t.me/@botfather -> /revoke

# Microsoft Entra
# Azure Portal > App registration > Certificates & secrets > Delete

# JWT Secret
# Cambiar JWT_SECRET en variables de Vercel

# 2. Eliminar archivo de git
git rm docs/root-docs/misc/CREDENTIALS.md
git commit -m "Remove exposed credentials from repository"
git push

# 3. Agregar a .gitignore
echo "CREDENTIALS.md" >> .gitignore
echo ".env" >> .gitignore
echo ".env.local" >> .gitignore
echo ".env.*" >> .gitignore

# 4. Usar Vercel Environment Variables
# Vercel Dashboard > Settings > Environment Variables
# Agregar todas las credenciales como vars

# 5. Usar GitHub Secrets (si usas GitHub Actions)
# Settings > Secrets and variables > Actions
```

**Verificación**:
```bash
# Verificar que no hay secretos en git
git log -p --all -S "ATATT3xFfGF0ifmwmETk0aQ_AIqJWC53nvyigYErgHi8OUmBS5Qk5OXzrNMM8lGewcbzg"

# Verificar .gitignore
cat .gitignore | grep -E "env|credentials|secrets"
```

**Plazo**: 🔴 **INMEDIATO** (Hoy)

---

### 2️⃣ MÚLTIPLES BASES DE DATOS - CONFLICTO DEV/PROD

**Ubicación**: `.env.local`, `.env.production`, `.env.template`

**Problema**:
```
AMBOS Dev y Production apuntan al MISMO Supabase:
- Database: db.wdebyxvtunromsnkqbrd.supabase.co
- Proyecto: wdebyxvtunromsnkqbrd

❌ Riesgo: Tests en dev pueden sobrescribir datos de producción
❌ Riesgo: Eliminación de datos de prueba elimina datos reales
❌ Riesgo: Transacciones fallidas en dev rompen estadísticas de prod
```

**Impacto**:
- 🔴 Data Integrity: **CRÍTICA** - Pérdida/corrupción de datos
- 🔴 Compliance: Violación de aislamiento de ambientes
- 🔴 Operacional: Downtime de producción por pruebas

**Actual Env Config**:
```env
# .env.local (Development)
DATABASE_URL=postgresql://postgres.wdebyxvtunromsnkqbrd:hola@stayarta.com:6543/postgres?sslmode=require
SUPABASE_URL=https://wdebyxvtunromsnkqbrd.supabase.co

# .env.production (Production)
DATABASE_URL=postgresql://postgres.wdebyxvtunromsnkqbrd:hola@stayarta.com:6543/postgres?sslmode=require
SUPABASE_URL=https://wdebyxvtunromsnkqbrd.supabase.co
# 👆 MISMO!
```

**Solución Recomendada**:

```bash
# 1. Crear segundo proyecto Supabase para desarrollo
# https://supabase.com -> New Project -> "haida-dev"
# Region: Same as production
# Database password: Generate random strong password

# 2. Obtener nuevas credenciales
# Supabase Dashboard (haida-dev) > Settings > Database
# - New Database URL
# - New SUPABASE_URL
# - New SUPABASE_ANON_KEY
# - New SUPABASE_SERVICE_ROLE_KEY

# 3. Actualizar .env.local
cat > .env.local << 'EOF'
# DEVELOPMENT ENVIRONMENT
NODE_ENV=development

# Database (HAIDA DEV - Supabase Dev Project)
DATABASE_URL=postgresql://postgres.DEVPROJECT:hola@stayarta.com:6543/postgres?sslmode=require
SUPABASE_URL=https://DEVPROJECT.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...DEVKEY...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...DEVKEY...

# Other dev config
DEBUG=true
LOG_LEVEL=DEBUG
EOF

# 4. Crear .env.production con BD de producción
# (Mantener SUPABASE_URL original - wdebyxvtunromsnkqbrd)
cat > .env.production << 'EOF'
# PRODUCTION ENVIRONMENT
NODE_ENV=production

# Database (HAIDA PROD - Supabase Production Project)
DATABASE_URL=postgresql://postgres.wdebyxvtunromsnkqbrd:hola@stayarta.com:6543/postgres?sslmode=require
SUPABASE_URL=https://wdebyxvtunromsnkqbrd.supabase.co
SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...PRODKEY...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...PRODKEY...

# Production security
DEBUG=false
LOG_LEVEL=ERROR
CORS_ORIGINS=https://haida.stayarta.com
EOF

# 5. Aplicar schema a DB dev
# En el proyecto haida-dev, ejecutar:
psql "postgresql://postgres.DEVPROJECT:hola@stayarta.com:6543/postgres" < database/01-schema-haida.sql

# 6. Agregar datos de prueba (SOLO en dev)
psql "postgresql://postgres.DEVPROJECT:hola@stayarta.com:6543/postgres" < database/02-test-data.sql

# 7. Verificar separación
# Development
echo "DEV DB:" && psql "$DEV_DATABASE_URL" -c "SELECT COUNT(*) FROM users;"

# Production (no correr si no es necesario)
echo "PROD DB:" && psql "$PROD_DATABASE_URL" -c "SELECT COUNT(*) FROM users;"
```

**Plazo**: 🟠 **URGENTE** (Próximos 2 días)

---

### 3️⃣ INCONSISTENCIA EN .ENV FILES

**Ubicación**: `/Users/carlosa/00-PROJECTS/HAIDA/haida-production/main/`

**Problema**:
```
Múltiples archivos .env sin claridad:
├── .env                              (Symlink ?)
├── .env.local                        (Contiene credenciales reales)
├── .env.example                      (Template)
├── .env.corrected                    (Versión "corregida"?)
├── .env.production                   (¿Usado?)
├── .env.template                     (¿Diferente de .example?)
└── Symlink a /Users/carlosa/04-CONFIGURATION/.env  (¿Por qué?)

❌ Confusión: ¿Cuál es la verdadera configuración?
❌ Riesgo: Usar archivo incorrecto en deployment
```

**Solución Recomendada**:

```bash
# 1. Auditar archivos existentes
ls -la /Users/carlosa/00-PROJECTS/HAIDA/haida-production/main/.env*

# 2. Consolidar en estructura clara
haida-production/main/
├── .env.example                 # Template (check-in a git)
├── .env.development             # Desarrollo local
├── .env.production              # Producción (NO en git)
└── .env.staging                 # Staging (si existe)

# 3. Crear .env.example (Template)
cat > .env.example << 'EOF'
# HAIDA - Environment Variables Template
# Copy this to .env.local and fill in actual values

# Node
NODE_ENV=development
PORT=3001
DEBUG=true

# Database
DATABASE_URL=postgresql://user:password@host:5432/database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# JWT
JWT_SECRET=generate-random-string-here
JWT_ALGORITHM=HS256
JWT_EXPIRATION_MINUTES=30

# Microsoft Entra ID
ENTRA_AUTHORITY=https://login.microsoftonline.com/tenant-id
ENTRA_CLIENT_ID=client-id
ENTRA_CLIENT_SECRET=client-secret
ENTRA_REDIRECT_URI=https://haida.stayarta.com/auth

# LLM
OPENAI_API_KEY=sk-...
ANTHROPIC_API_KEY=sk-ant-...
EOF

# 4. Actualizar .gitignore
cat > .gitignore << 'EOF'
# Environment
.env
.env.local
.env.*.local
.env.production
.env.staging
!.env.example

# Credentials
CREDENTIALS.md
secrets.json

# Dependencies
node_modules/
__pycache__/
*.pyc
venv/
.venv/

# Build
dist/
build/
*.egg-info/

# Logs
*.log
logs/

# IDE
.vscode/
.idea/
*.swp
*.swo
EOF

# 5. Eliminar archivos duplicados
rm -f .env.corrected
rm -f .env.template
rm -f .env.production  # Mover a secretos de Vercel
rm -f .env.staging

# 6. Resolver symlink
unlink .env  # Si es symlink
echo ".env" >> .gitignore
```

**Variables de Vercel** (Dashboard):
```
Vercel Dashboard > Settings > Environment Variables

DEV (Preview):
DATABASE_URL = ...dev-db-url...
SUPABASE_URL = ...dev-supabase...

PROD (Production):
DATABASE_URL = ...prod-db-url...
SUPABASE_URL = ...prod-supabase...
JWT_SECRET = (rotated value)
ENTRA_CLIENT_SECRET = (rotated value)
```

**Plazo**: 🟠 **URGENTE** (Próximos 2 días)

---

## 🟡 PROBLEMAS IMPORTANTES (MEDIA SEVERIDAD)

---

### 4️⃣ RUTAS DUPLICADAS / INCONSISTENTES EN vercel.json

**Ubicación**: `/haida-production/main/vercel.json` vs `/haida-main/dev/vercel.json`

**Problema**:
```
Production has 12+ routes:
  /health, /version, /status, /debug, /auth/*, /entra/*, /api/*, etc

Development has only 6 routes:
  /auth/*, /entra/*, /m365/*, /chat/*, /api/*, default /

❌ Inconsistencia: Rutas no coinciden entre entornos
❌ Riesgo: Funcionalidad diferente en dev vs prod
```

**Production** (`vercel.json`):
```json
{
  "version": 2,
  "builds": [{"src": "api/index.py", "use": "@vercel/python"}],
  "routes": [
    {"src": "/health", "dest": "/api/index.py"},
    {"src": "/version", "dest": "/api/index.py"},
    {"src": "/status", "dest": "/api/index.py"},
    {"src": "/auth/(.*)", "dest": "/api/index.py"},
    {"src": "/entra/(.*)", "dest": "/api/index.py"},
    {"src": "/api/(.*)", "dest": "/api/index.py"},
    {"src": "/chat/(.*)", "dest": "/api/index.py"},
    {"src": "/notifications/(.*)", "dest": "/api/index.py"},
    {"src": "/reports/(.*)", "dest": "/api/index.py"},
    {"src": "/files/(.*)", "dest": "/api/index.py"},
    {"src": "/docs", "dest": "/api/index.py"},
    {"src": "/openapi.json", "dest": "/api/index.py"}
  ]
}
```

**Development** (`haida-main/dev/vercel.json`):
```json
{
  "version": 2,
  "builds": [{"src": "api/index.py", "use": "@vercel/python"}],
  "routes": [
    {"src": "/auth/(.*)", "dest": "/api/index.py"},
    {"src": "/entra/(.*)", "dest": "/api/index.py"},
    {"src": "/m365/(.*)", "dest": "/api/index.py"},
    {"src": "/chat/(.*)", "dest": "/api/index.py"},
    {"src": "/api/(.*)", "dest": "/api/index.py"},
    {"src": "/", "dest": "/api/index.py"}
  ]
}
```

**Solución Recomendada**:
```bash
# Sincronizar vercel.json en dev con production
cp haida-production/main/vercel.json haida-main/dev/vercel.json

# Verificar
diff haida-production/main/vercel.json haida-main/dev/vercel.json
# Debe estar vacío
```

**Plazo**: 🟡 **MEDIA** (Esta semana)

---

### 5️⃣ BASE DE DATOS - FALTA SEPARACIÓN POR SCHEMA

**Ubicación**: `database/` y Supabase project settings

**Problema**:
```
Todas las tablas en "public" schema:
- No hay separación entre entornos (incluso si fuera mismo DB)
- No hay separación entre tenants (multi-tenant no aislado)

❌ Riesgo: Datos de cliente A accesibles a cliente B
❌ Riesgo: Backups/restore afectan todos los clientes
```

**Solución Recomendada**:

```sql
-- Crear schema por ambiente
CREATE SCHEMA dev;
CREATE SCHEMA staging;
CREATE SCHEMA prod;

-- Crear schema por tenant (multi-tenant)
CREATE SCHEMA tenant_1;
CREATE SCHEMA tenant_2;

-- Modificar RLS policies para tenant isolation
CREATE POLICY "tenant_isolation" ON projects
  USING (auth.jwt() ->> 'tenant_id' = tenant_id);

-- Usar schema en aplicación
-- En FastAPI: SET search_path = 'prod';
-- En frontend: SELECT * FROM prod.projects
```

**Plazo**: 🟡 **MEDIA** (Próximas 2 semanas)

---

### 6️⃣ FALTA MONITOREO Y ALERTAS

**Ubicación**: No encontrado en codebase

**Problema**:
```
❌ Sin Application Insights integrado
❌ Sin alertas de errores
❌ Sin métricas de performance
❌ Sin logs centralizados

❌ Riesgo: Producción sin visibilidad
❌ Riesgo: Issues no detectados hasta que clientes reportan
```

**Solución Recomendada**:

```python
# En app/main.py - Agregar Application Insights

from azure.monitor.opentelemetry import configure_azure_monitor
from opentelemetry.sdk.trace import TracerProvider
from opentelemetry.sdk.trace.export import BatchSpanProcessor
from opentelemetry.exporter.jaeger import JaegerExporter

# Configurar tracing
jaeger_exporter = JaegerExporter(
    agent_host_name="localhost",
    agent_port=6831,
)

configure_azure_monitor()  # Azure Monitor
tracer = TracerProvider()
tracer.add_span_processor(BatchSpanProcessor(jaeger_exporter))

# Log errors
import logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.exception_handler(Exception)
async def exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    # Send alert to Slack/Teams
    return JSONResponse(status_code=500, content={"error": "Internal Server Error"})
```

**Plazo**: 🟡 **MEDIA** (Este mes)

---

## 🟢 PROBLEMAS MENORES (BAJA SEVERIDAD)

---

### 7️⃣ DOCUMENTACIÓN DESACTUALIZADA

**Ubicación**: Múltiples archivos .md

**Problema**:
```
- HAIDA-MIGRATION-COMPLETADO.md dice "completed" pero hay migraciones pendientes
- README files con valores placeholder
- OPERATIONAL_SETUP.md tiene URLs antiguas
```

**Solución**: Actualizar antes de siguiente release

**Plazo**: 🟢 **BAJA** (Próximo mes)

---

### 8️⃣ TESTS SIN COBERTURA COMPLETA

**Ubicación**: `tests/` directory

**Problema**:
```
❌ Tests E2E: No cubren todos los flujos
❌ API tests: Faltan test cases de error
❌ Unit tests: Pocos o nulos
```

**Solución**: Implementar cobertura mínima 80%

**Plazo**: 🟢 **BAJA** (Q1 2026)

---

## 📊 RESUMEN DE SEVERIDAD

| Severidad | Cantidad | Plazo |
|-----------|----------|-------|
| 🔴 Crítica | 3 | INMEDIATO |
| 🟡 Media | 3 | URGENTE |
| 🟢 Baja | 2 | MEDIO PLAZO |

---

## 🎯 PLAN DE ACCIÓN PRIORIZADO

### FASE 1 - INMEDIATO (HOY)

```bash
# 1. Rotar credenciales
# 2. Eliminar CREDENTIALS.md
# 3. Agregar a .gitignore

# Verificación
git log -p | grep -i "secret\|password\|token"
```

**Entrega**: Confidencialidad asegurada ✅

---

### FASE 2 - URGENTE (Próximos 2 días)

```bash
# 1. Crear haida-dev project en Supabase
# 2. Migrar .env files
# 3. Sincronizar vercel.json
# 4. Pruebas de connectivity

# Verificación
npm run dev  # Con .env.development
# Debe conectar a DB dev, no prod
```

**Entrega**: Ambientes separados ✅

---

### FASE 3 - IMPORTANTE (Esta semana)

```bash
# 1. Actualizar documentación
# 2. Agregar Application Insights
# 3. Configurar alertas

# Verificación
curl https://haidapi.stayarta.com/health
# Debe retornar status + métricas
```

**Entrega**: Monitoreo activo ✅

---

### FASE 4 - MEJORA CONTINUA (Próximas semanas)

```bash
# 1. Schema separation (tenant isolation)
# 2. Aumentar test coverage
# 3. Implementar CI/CD checks

# Verificación
npm run test  # Coverage > 80%
```

**Entrega**: Calidad mejorada ✅

---

## ✅ VERIFICACIÓN FINAL

```bash
# 1. Verificar estructura
./scripts/verify-architecture.sh

# 2. Validar configuración
./scripts/validate-config.sh

# 3. Ejecutar tests
npm run test:full

# 4. Revisar logs
tail -f logs/verification.log
```

---

**Status Final**: ⚠️ VERIFICACIÓN COMPLETADA - ACCIONES RECOMENDADAS GENERADAS
