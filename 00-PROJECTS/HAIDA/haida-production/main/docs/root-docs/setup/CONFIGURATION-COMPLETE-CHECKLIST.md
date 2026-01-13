# ✅ HAIDA - Checklist de Configuración Completa

**Fecha**: ++34662652300
**Status**: ⚠️ ACCIÓN MANUAL REQUERIDA

---

## 📊 Resumen de Configuraciones

### ✅ Completado Automáticamente

| Tarea | Estado | Detalles |
|-------|--------|----------|
| Auditoría de Supabase | ✅ | [SUPABASE-AUDIT-REPORT.md](SUPABASE-AUDIT-REPORT.md) |
| Tests de autenticación creados | ✅ | [tests/web-e2e/auth-api.spec.ts](tests/web-e2e/auth-api.spec.ts) |
| Migración SQL generada | ✅ | [database/APPLY-THIS-IN-SUPABASE-DASHBOARD.sql](database/APPLY-THIS-IN-SUPABASE-DASHBOARD.sql) |
| URLs verificadas | ✅ | BASE_URL correcto en .env |
| Scripts de auditoría creados | ✅ | `/tmp/supabase-rest-audit.py` |
| Documentación actualizada | ✅ | Múltiples reportes generados |

### ⚠️ REQUIERE ACCIÓN MANUAL

| # | Tarea | Prioridad | Tiempo estimado |
|---|-------|-----------|-----------------|
| 1 | Aplicar migración SQL en Supabase Dashboard | 🔴 CRÍTICO | 2 minutos |
| 2 | Resetear passwords de usuarios de prueba | 🔴 CRÍTICO | 5 minutos |
| 3 | Configurar credenciales de Azure AD | 🟡 ALTA | 10 minutos |
| 4 | Verificar variables de entorno en Vercel | 🟡 MEDIA | 5 minutos |

---

## 🔴 TAREA CRÍTICA 1: Aplicar Migración SQL

### Qué hacer

1. Abre [Supabase Dashboard → SQL Editor](https://supabase.com/dashboard/project/wdebyxvtunromsnkqbrd/sql/new)

2. Copia **TODO** el contenido de este archivo:
   ```
   database/APPLY-THIS-IN-SUPABASE-DASHBOARD.sql
   ```

3. Pega en el SQL Editor

4. Click en **"RUN"** o presiona `Cmd+Enter` (Mac) / `Ctrl+Enter` (Windows)

5. **Verifica que dice**: `"Success. No rows returned"` o muestra la tabla de usuarios

### Qué hace esta migración

- ✅ Agrega columna `full_name` a tabla `users`
- ✅ Copia datos existentes de `name` a `full_name`
- ✅ Sincroniza 4 usuarios faltantes de `auth.users` → `public.users`
- ✅ Actualiza roles y metadata

### Resultado esperado

Deberías ver **9 usuarios** en total con todos los campos poblados:

```sql
| id | email | name | full_name | role | is_active |
|----|-------|------|-----------|------|-----------|
| ... | hola@stayarta.com | Carlos A | Carlos A | viewer | true |
| ... | hola@stayarta.com | Carlos Arevalo | Carlos Arevalo | viewer | true |
| ... | hola@stayarta.com | Fer No | Fer No | viewer | true |
| ... | hola@stayarta.com | HAIDA Admin | HAIDA Admin | admin | true |
| ... | (5 más) | ... | ... | ... | ... |
```

### ⚠️ Problemas comunes

**Error: "permission denied"**
- Asegúrate de estar usando el proyecto correcto (wdebyxvtunromsnkqbrd)
- Verifica que tienes permisos de owner/admin en Supabase

**Error: "column already exists"**
- Está bien! Significa que la columna ya fue agregada
- El script usa `IF NOT EXISTS` para ser seguro

---

## 🔴 TAREA CRÍTICA 2: Resetear Passwords de Usuarios

### Usuarios que necesitan password conocida

Para poder ejecutar tests de autenticación, necesitas passwords conocidas para estos usuarios:

1. **hola@stayarta.com**
2. **hola@stayarta.com**

### Cómo resetear passwords

#### Opción A: Via Supabase Dashboard (Recomendado)

1. Abre [Supabase → Auth → Users](https://supabase.com/dashboard/project/wdebyxvtunromsnkqbrd/auth/users)

2. Para cada usuario:
   - Click en el usuario
   - Click en **"Send password recovery"** o **"Reset password"**
   - Copia el link de recovery
   - Abre en navegador privado
   - Establece nueva password: `HaidaTest2025Pass!`

#### Opción B: Via Email Recovery

1. En Supabase Dashboard → Auth → Users
2. Click en usuario → **"Send password recovery"**
3. El usuario recibirá email con link de reset
4. Click en link y establecer password: `HaidaTest2025Pass!`

#### Opción C: Crear usuario nuevo de prueba

Si prefieres no modificar usuarios existentes:

```bash
# Ejecutar este script Python
python3 << 'EOF'
import requests

SUPABASE_URL = "https://wdebyxvtunromsnkqbrd.supabase.co"
SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU4OTU3NTEsImV4cCI6MjA4MTQ3MTc1MX0._VYypgb2tV9u_4jSAt3sbcFj-drhufB0oN9o3BcgHTs"

url = f"{SUPABASE_URL}/auth/v1/signup"
headers = {
    "apikey": SUPABASE_ANON_KEY,
    "Content-Type": "application/json"
}

data = {
    "email": "hola@stayarta.com",
    "password": "HaidaTest2025Pass!",
    "data": {
        "full_name": "Test User HAIDA",
        "role": "viewer"
    }
}

response = requests.post(url, headers=headers, json=data)
print(f"Status: {response.status_code}")
print(f"Response: {response.json()}")
EOF
```

---

## 🟡 TAREA ALTA 3: Configurar Azure AD para Microsoft OAuth

### Estado Actual

El endpoint `/entra/login` devuelve **501 Not Implemented** porque faltan credenciales.

### Valores actuales en .env

```env
AZURE_CLIENT_ID=your_azure_client_id
AZURE_TENANT_ID=your_azure_tenant_id
AZURE_CLIENT_SECRET=your_azure_client_secret
```

### Cómo obtener credenciales reales

1. **Ir a Azure Portal**: https://portal.azure.com

2. **Azure Active Directory** → **App registrations** → **New registration**

3. **Configurar app**:
   - Name: `HAIDA Production`
   - Supported account types: `Accounts in this organizational directory only`
   - Redirect URI: `https://haida-one.vercel.app/entra/callback`

4. **Copiar valores**:
   - **Application (client) ID** → `AZURE_CLIENT_ID`
   - **Directory (tenant) ID** → `AZURE_TENANT_ID`

5. **Crear Client Secret**:
   - Certificates & secrets → New client secret
   - Copiar el **Value** → `AZURE_CLIENT_SECRET`

6. **Actualizar .env local**:
   ```env
   AZURE_CLIENT_ID=<tu-client-id>
   AZURE_TENANT_ID=<tu-tenant-id>
   AZURE_CLIENT_SECRET=<tu-client-secret>
   ```

7. **Actualizar en Vercel**:
   ```bash
   vercel env add AZURE_CLIENT_ID production
   vercel env add AZURE_TENANT_ID production
   vercel env add AZURE_CLIENT_SECRET production
   ```

### Verificación

Después de configurar:

```bash
curl https://haida-one.vercel.app/entra/login
# Debería redirigir a login.microsoftonline.com (302/307)
# No devolver 501
```

---

## 🟡 TAREA MEDIA 4: Verificar Variables de Entorno en Vercel

### Variables críticas que deben estar en Vercel

Ve a [Vercel → haida-one → Settings → Environment Variables](https://vercel.app/carlos-arevalos-projects-cf7340ea/haida-one/settings/environment-variables)

Verifica que existen:

| Variable | Valor esperado | Ambiente |
|----------|----------------|----------|
| SUPABASE_URL | https://wdebyxvtunromsnkqbrd.supabase.co | Production |
| SUPABASE_KEY | eyJhbGciOiJIUz... | Production |
| SUPABASE_SERVICE_KEY | eyJhbGciOiJIUz... | Production |
| JWT_SECRET | (min 32 caracteres) | Production |
| AZURE_CLIENT_ID | (UUID de Azure AD) | Production |
| AZURE_TENANT_ID | (UUID de Azure AD) | Production |
| AZURE_CLIENT_SECRET | (Secret de Azure AD) | Production |

### Prefijo HAIDA_PUBLIC_

Como tienes la integración de Vercel con Supabase configurada, las variables con prefijo `HAIDA_PUBLIC_` se sincronizan automáticamente.

Verifica en Settings que tienes:
- `HAIDA_PUBLIC_SUPABASE_URL`
- `HAIDA_PUBLIC_SUPABASE_ANON_KEY`

---

## ✅ Verificación Post-Configuración

Después de completar las tareas manuales, ejecuta estos tests:

### 1. Verificar migración SQL

```bash
# Ejecutar script de verificación
python3 /tmp/supabase-rest-audit.py
```

**Esperado**:
```
✅ Tabla users existe: ✅
✅ Tiene columna 'name': ✅
✅ Tiene columna 'full_name': ✅  <-- NUEVO
   Usuarios en auth.users: 9
   Tablas HAIDA existentes: 7/7
```

### 2. Test de autenticación con password conocida

```bash
# Ejecutar tests de autenticación
npx playwright test tests/web-e2e/auth-api.spec.ts --project="Desktop Chrome"
```

**Esperado**:
```
✅ 11 passed  (antes: 5)
❌ 1 failed  (Microsoft OAuth - esperado si no configuraste Azure AD)
```

### 3. Test de health check

```bash
curl https://haida-one.vercel.app/health | python3 -m json.tool
```

**Esperado**:
```json
{
  "status": "healthy",
  "service": "HAIDA Backend",
  "version": "2.0.1",
  "auth_router_loaded": true,
  "entra_router_loaded": true
}
```

### 4. Test de Microsoft OAuth (si configuraste Azure AD)

```bash
curl -I https://haida-one.vercel.app/entra/login
```

**Esperado**:
```
HTTP/2 302 (o 307)
Location: https://login.microsoftonline.com/...
```

**NO esperado**:
```
HTTP/2 501  <-- Error de "Not Implemented"
```

---

## 📋 URLs Verificadas

### ✅ URLs Correctas en Configuración

| Archivo | URL | Estado |
|---------|-----|--------|
| .env | BASE_URL=https://haida-one.vercel.app | ✅ CORRECTO |
| .env | SUPABASE_URL=https://wdebyxvtunromsnkqbrd.supabase.co | ✅ CORRECTO |
| playwright.config.ts | baseURL: process.env.BASE_URL | ✅ CORRECTO |
| tests/web-e2e/auth-api.spec.ts | API_URL=process.env.BASE_URL | ✅ CORRECTO |

### ℹ️ URLs localhost correctas (para desarrollo local)

Estas URLs localhost son **correctas** porque son para desarrollo local:

| Archivo | URL | Propósito |
|---------|-----|-----------|
| .env | CORS_ORIGINS=http://localhost:3000,http://localhost:5173 | Frontend local |
| .env | REDIS_URL=redis://redis:6379 | Redis en Docker local |
| tools/mock-server.js | localhost | Mock server para testing |

**NO modificar estas** - son necesarias para cuando corras el frontend localmente.

---

## 🎯 Orden de Ejecución Recomendado

### Ahora mismo (5-10 minutos)

1. ✅ Aplicar migración SQL (TAREA 1)
2. ✅ Resetear password de hola@stayarta.com (TAREA 2)
3. ✅ Ejecutar tests de verificación

### Cuando tengas tiempo (30 minutos)

4. ⏳ Configurar Azure AD (TAREA 3)
5. ⏳ Verificar variables en Vercel (TAREA 4)
6. ⏳ Ejecutar suite completa de tests

---

## 📊 Estado de Tests

### Antes de configuraciones

| Test Suite | Passed | Failed | Skipped |
|------------|--------|--------|---------|
| auth-api.spec.ts | 5 | 7 | 0 |
| smoke.spec.ts | 0 | 2 | 0 |

**Razón**: Falta columna `full_name`, passwords desconocidas, OAuth no configurado

### Después de Tarea 1 (Solo migración SQL)

| Test Suite | Passed | Failed | Skipped |
|------------|--------|--------|---------|
| auth-api.spec.ts | 7 | 5 | 0 |
| smoke.spec.ts | 2 | 0 | 0 |

**Mejora**: +40% tests pasando

### Después de Tarea 2 (+ Passwords)

| Test Suite | Passed | Failed | Skipped |
|------------|--------|--------|---------|
| auth-api.spec.ts | 11 | 1 | 0 |
| smoke.spec.ts | 2 | 0 | 0 |

**Mejora**: +92% tests pasando

### Después de Tarea 3 (+ Azure AD)

| Test Suite | Passed | Failed | Skipped |
|------------|--------|--------|---------|
| auth-api.spec.ts | 12 | 0 | 0 |
| smoke.spec.ts | 2 | 0 | 0 |

**Mejora**: 100% tests pasando ✅

---

## 📞 Soporte

Si encuentras problemas:

1. **Revisar logs de Vercel**: https://vercel.com/carlos-arevalos-projects-cf7340ea/haida-one/logs
2. **Revisar logs de Supabase**: https://supabase.com/dashboard/project/wdebyxvtunromsnkqbrd/logs/explorer
3. **Ejecutar script de auditoría**: `python3 /tmp/supabase-rest-audit.py`
4. **Revisar reportes generados**:
   - [SUPABASE-AUDIT-REPORT.md](SUPABASE-AUDIT-REPORT.md)
   - [AUTH-TESTING-REPORT.md](AUTH-TESTING-REPORT.md)
   - [TESTING-GUIDE.md](TESTING-GUIDE.md)

---

## ✅ Checklist Final

Marca cuando completes:

- [ ] Migración SQL aplicada en Supabase Dashboard
- [ ] Password de hola@stayarta.com reseteada a `HaidaTest2025Pass!`
- [ ] Tests de autenticación ejecutados (mínimo 11/12 passing)
- [ ] Azure AD configurado (opcional pero recomendado)
- [ ] Variables de entorno verificadas en Vercel
- [ ] Documentación revisada

---

**Última actualización**: ++34662652300:10:00 GMT
**Siguiente acción**: Aplicar migración SQL en Supabase Dashboard
**Archivo a usar**: [database/APPLY-THIS-IN-SUPABASE-DASHBOARD.sql](database/APPLY-THIS-IN-SUPABASE-DASHBOARD.sql)
