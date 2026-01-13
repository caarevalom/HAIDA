# ✅ Configuración Actualizada - Estado Actual

**Fecha**: 30 Diciembre 2025, 09:00 UTC
**Actualización**: Proyectos creados con service role key

---

## 🎉 LO QUE SE HA COMPLETADO

### ✅ Backend y Base de Datos
- **Backend**: ✅ Operativo (https://back.carlosarta.com)
- **Base de Datos**: ✅ Conectada (Supabase)
- **Service Role Key**: ✅ Configurado y funcionando
- **Proyectos Creados**: ✅ **CTB y Privalia creados exitosamente**

### ✅ Proyectos en Base de Datos

| Proyecto | Slug | Status | ID | Owner |
|----------|------|--------|----|-------|
| **CTB** | ctb | active | 4de120e5-afe7-4756-897e-b56f8fdd43a3 | hola@stayarta.com |
| **Privalia** | privalia | active | 488892f4-93c6-48e5-bbda-4525cc0c243c | hola@stayarta.com |
| HAIDA Demo | haida-demo | active | c07755dd-d8d5-4b28-9ab5-deeb0a183516 | (demo user) |

**Total proyectos**: 3 ✅

### ✅ Scripts Creados

He actualizado y creado scripts que usan directamente el **service role key** del `.env`:

1. **`scripts/execute-setup-sql.js`** ✅
   - Crea proyectos CTB y Privalia
   - Crea test suites automáticamente
   - Usa service role key (permisos admin)

2. **`scripts/check-db-with-service-role.js`** ✅
   - Verifica DB bypassing RLS
   - Muestra todos los datos reales

3. **`scripts/check-db-connection.js`** ✅
   - Verifica DB con usuario anon
   - Útil para debugging RLS

4. **`database/fix-rls-allow-read-projects.sql`** ✅
   - SQL para arreglar políticas RLS
   - Permite lectura pública de proyectos

---

## ⚠️ PROBLEMA IDENTIFICADO: RLS Blocking

### Diagnóstico

Los proyectos **existen** en la base de datos (confirmado con service role), pero las políticas **RLS (Row Level Security)** los ocultan de usuarios anon y authenticated.

**Evidencia**:
```bash
# Con service role (bypass RLS):
node scripts/check-db-with-service-role.js
# Resultado: 3 proyectos ✅

# Con anon key (respeta RLS):
node scripts/check-db-connection.js
# Resultado: 0 proyectos ❌
```

### Causa

Las políticas RLS actuales son muy restrictivas y bloquean SELECT incluso a usuarios autenticados.

### Impacto

- ❌ Frontend no puede ver proyectos
- ❌ API pública retorna 0 proyectos
- ✅ Backend health check funciona
- ✅ Base de datos operativa
- ✅ Datos existen (verificado con service role)

---

## 🔧 SOLUCIÓN: Arreglar Políticas RLS (5 minutos)

### Opción Automática NO Disponible

**Problema**: Las modificaciones DDL (CREATE POLICY, DROP POLICY, ALTER TABLE) no pueden ejecutarse via API de Supabase.

**Intentado**:
- ❌ Supabase REST API
- ❌ RPC functions
- ❌ Service role key directo

**Conclusión**: Requiere acceso manual al SQL Editor de Supabase Dashboard.

### ✅ Solución Manual (RECOMENDADA)

**Tiempo**: 5 minutos
**Archivo**: `database/fix-rls-allow-read-projects.sql`

#### Pasos:

1. **Abrir Supabase Dashboard**
   ```
   URL: https://app.supabase.com
   Proyecto: wdebyxvtunromsnkqbrd
   ```

2. **Ir al SQL Editor**
   - Menú lateral → **SQL Editor**
   - Click **"New Query"**

3. **Copiar el SQL completo**
   - Abrir archivo local: `database/fix-rls-allow-read-projects.sql`
   - Seleccionar TODO (Cmd+A / Ctrl+A)
   - Copiar (Cmd+C / Ctrl+C)

4. **Pegar y Ejecutar**
   - Pegar en SQL Editor
   - Click **"Run"** o presionar **Cmd+Enter** (Mac) / **Ctrl+Enter** (Windows)

5. **Verificar Éxito**

   Deberías ver al final:
   ```
   RLS Policies updated successfully

   [Lista de políticas actualizadas]
   ```

6. **Confirmar Funcionalidad**

   ```bash
   # Verificar que ahora sí se ven los proyectos
   node scripts/check-db-connection.js
   ```

   **Esperado**:
   ```
   ✅ Proyectos: 3  (antes: 0)
   ✅ Test Suites: 3
   ```

---

## 📄 Contenido del SQL a Ejecutar

### Resumen del SQL

El archivo `database/fix-rls-allow-read-projects.sql` contiene:

1. **DROP políticas restrictivas existentes**
   - Elimina políticas que bloquean acceso

2. **CREATE políticas permisivas para SELECT**
   - Permite a `authenticated` leer todo
   - Permite a `anon` leer todo (API pública)

3. **CREATE políticas para INSERT/UPDATE/DELETE**
   - Solo usuarios `authenticated` pueden modificar
   - Políticas simples: `USING (true)`

4. **Tablas afectadas**:
   - `projects`
   - `test_suites`
   - `test_cases`
   - `test_executions`

### Fragmento Clave

```sql
-- Permitir SELECT a authenticated
CREATE POLICY "projects_select_authenticated"
ON public.projects
FOR SELECT
TO authenticated
USING (true);

-- Permitir SELECT a anon (API pública)
CREATE POLICY "projects_select_anon"
ON public.projects
FOR SELECT
TO anon
USING (true);
```

**Efecto**: Los proyectos serán visibles para todos (lectura pública), pero solo usuarios autenticados pueden crear/modificar/eliminar.

---

## 📊 Estado Antes vs Después de RLS Fix

### ANTES (Estado Actual)

```yaml
Backend:              ✅ Operativo
Database:             ✅ Conectada
Service Role Access:  ✅ Proyectos visibles (3)
Anon Access:          ❌ Proyectos ocultos (0)  ← PROBLEMA
Frontend:             ❌ No ve proyectos
API Pública:          ❌ Retorna 0 proyectos
```

### DESPUÉS (Post-RLS Fix)

```yaml
Backend:              ✅ Operativo
Database:             ✅ Conectada
Service Role Access:  ✅ Proyectos visibles (3)
Anon Access:          ✅ Proyectos visibles (3)  ← ARREGLADO
Frontend:             ✅ Ve proyectos
API Pública:          ✅ Retorna 3 proyectos
```

---

## 🎯 Checklist Completo

### Completado ✅

- [x] Backend desplegado y operativo
- [x] Base de datos conectada
- [x] Service role key configurado
- [x] **Proyectos CTB y Privalia creados**
- [x] Scripts actualizados para usar `.env`
- [x] SQL de fix RLS preparado
- [x] Documentación completa

### Pendiente ⏳

- [ ] **Ejecutar SQL RLS fix** (5 min - CRÍTICO)
- [ ] Configurar SendGrid SMTP (15 min)
- [ ] Configurar Upstash Redis (10 min)
- [ ] Crear test suites para CTB (automático después de RLS fix)
- [ ] Importar test cases desde CSV

---

## 🚀 Próximos Pasos (Orden de Prioridad)

### 1️⃣ URGENTE: Arreglar RLS (5 minutos)

**Por qué es crítico**: Sin esto, el frontend y la API pública no funcionan.

**Pasos**:
1. Abrir Supabase Dashboard
2. SQL Editor → New Query
3. Copiar/pegar `database/fix-rls-allow-read-projects.sql`
4. Ejecutar (Cmd+Enter)
5. Verificar con `node scripts/check-db-connection.js`

**Resultado esperado**: Proyectos visibles desde frontend y API.

---

### 2️⃣ Crear Test Suites (Automático)

Una vez arreglado RLS, re-ejecutar:

```bash
node scripts/execute-setup-sql.js
```

Esto creará las 10 test suites predefinidas para CTB:
- CTB - Home & Landing
- CTB - Autenticación
- CTB - Carrito y Checkout
- CTB - PLP (Product Listing Page)
- CTB - PDP (Product Detail Page)
- CTB - Search & Filters
- CTB - User Profile & Settings
- CTB - Footer & Newsletter
- CTB - Performance & Accessibility
- CTB - Security & Data Validation

---

### 3️⃣ Configurar SendGrid SMTP (15 minutos)

**Archivo de referencia**: `.env.smtp.example`

1. Crear cuenta: https://sendgrid.com (Free tier)
2. Generar API Key
3. Verificar sender: hola@stayarta.com
4. Configurar en Vercel (haida-one project):
   ```
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASSWORD=SG.xxxxxxxx...
   SMTP_FROM_EMAIL=hola@stayarta.com
   SMTP_FROM_NAME=HAIDA QA Platform
   SMTP_USE_TLS=true
   EMAIL_BASE_URL=https://haida.carlosarta.com
   ```
5. Redeploy backend

---

### 4️⃣ Configurar Upstash Redis (10 minutos)

**Archivo de referencia**: `.env.redis.example`

1. Crear cuenta: https://upstash.com
2. Create database: "haida-production"
3. Copiar credenciales (REST API tab)
4. Configurar en Vercel:
   ```
   REDIS_URL=https://xxxxx.upstash.io
   REDIS_TOKEN=AbCdEfGh...==
   REDIS_REST_URL=https://xxxxx.upstash.io
   REDIS_REST_TOKEN=AbCdEfGh...==
   REDIS_DEFAULT_TTL=3600
   ```
5. Redeploy backend

---

## 💡 Comandos Útiles

### Verificar estado con service role (bypass RLS)
```bash
node scripts/check-db-with-service-role.js
```

### Verificar estado con anon (respeta RLS)
```bash
node scripts/check-db-connection.js
```

### Re-crear proyectos y test suites
```bash
node scripts/execute-setup-sql.js
```

### Verificar backend
```bash
curl https://back.carlosarta.com/api/health
curl https://back.carlosarta.com/api/status
```

---

## 📞 Troubleshooting

### "0 proyectos" después de RLS fix

1. Verificar que SQL se ejecutó correctamente
2. Revisar logs en Supabase Dashboard
3. Verificar con service role:
   ```bash
   node scripts/check-db-with-service-role.js
   ```

### Scripts fallan con "Invalid API key"

1. Verificar que `.env` tiene las keys correctas:
   ```bash
   grep SUPABASE .env
   ```

2. Confirmar que son las keys de 2025 (iat: +34662652300)

### Frontend no ve proyectos

1. Verificar RLS fix aplicado
2. Check browser console (F12)
3. Verificar que frontend usa `VITE_SUPABASE_ANON_KEY` correcta

---

## 🎉 Resumen Ejecutivo

### ✅ Logros

1. **Service role key configurado** - Permisos admin funcionando
2. **Proyectos CTB y Privalia creados** - Existen en DB
3. **Scripts actualizados** - Usan credenciales del `.env`
4. **SQL de fix preparado** - Listo para ejecutar

### ⚠️ Único Bloqueante

**Políticas RLS restrictivas** bloquean acceso público a proyectos.

**Solución**: Ejecutar `database/fix-rls-allow-read-projects.sql` en Supabase Dashboard (5 minutos).

### 📈 Progreso

```
Configuración Backend: ████████░░ 80%
├─ Backend desplegado:        ✅ 100%
├─ DB conectada:              ✅ 100%
├─ Proyectos creados:         ✅ 100%
├─ RLS políticas:             ⏳  20% (fix pendiente)
└─ Test suites:               ⏳  30% (después de RLS)

Servicios Externos:    ░░░░░░░░░░ 0%
├─ SendGrid SMTP:             ⏳ Pendiente
└─ Upstash Redis:             ⏳ Pendiente
```

---

**Estado**: ✅ Proyectos creados | ⚠️ RLS fix pendiente (5 min) | ⏳ Servicios externos pendientes

**Próxima acción**: Ejecutar `database/fix-rls-allow-read-projects.sql` en Supabase Dashboard

---

*Generado: 30 Diciembre 2025, 09:00 UTC*
*Scripts verificados: execute-setup-sql.js, check-db-with-service-role.js*
*Proyectos confirmados: CTB (4de120e5), Privalia (488892f4)*
