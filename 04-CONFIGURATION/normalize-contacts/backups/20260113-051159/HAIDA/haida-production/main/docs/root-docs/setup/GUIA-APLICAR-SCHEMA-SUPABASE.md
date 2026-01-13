# 📊 GUÍA: Aplicar Schema SQL a Supabase

**Proyecto**: HAIDA
**Fecha**: +34662652300
**Base de Datos**: Supabase PostgreSQL

---

## 🎯 OBJETIVO

Aplicar el schema completo de HAIDA v2.0 a tu proyecto Supabase incluyendo:

- Schema principal (25 tablas)
- Migration #1: Tabla `defects`
- Migration #2: Migración de `test_steps` TEXT → JSONB

---

## 📋 PREREQUISITOS

- ✅ Cuenta Supabase activa
- ✅ Proyecto: **HAIDA** (ID: `wdebyxvtunromsnkqbrd`)
- ✅ Acceso al SQL Editor en Supabase Dashboard

---

## 🚀 PASO 1: Acceder a Supabase SQL Editor

### 1.1 Login a Supabase

```
URL: https://supabase.com/dashboard
```

### 1.2 Seleccionar Proyecto HAIDA

```
Project: HAIDA
ID: wdebyxvtunromsnkqbrd
URL: https://wdebyxvtunromsnkqbrd.supabase.co
```

### 1.3 Abrir SQL Editor

- En el menú lateral izquierdo, click en **SQL Editor**
- Click en **New query** (botón verde)

---

## 📝 PASO 2: Aplicar Schema Principal

### 2.1 Copiar Schema SQL

Abrir el archivo:

```
C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA\infrastructure\supabase\schema.sql
```

### 2.2 Pegar en SQL Editor

- Copiar **TODO** el contenido del archivo `schema.sql`
- Pegar en el SQL Editor de Supabase

### 2.3 Ejecutar

- Click en botón **Run** (esquina inferior derecha)
- **ADVERTENCIA**: Esto puede tardar 1-2 minutos
- Esperar a que aparezca "Success" en verde

### 2.4 Verificar Tablas Creadas

Ejecutar este query para verificar:

```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

**Deberías ver** (al menos estas tablas principales):

- `tenants`
- `tenant_members`
- `user_profiles`
- `projects`
- `test_suites`
- `test_cases`
- `test_executions`
- `test_execution_results`
- `chat_threads`
- `chat_messages`
- `docs`
- `scripts`
- `change_detections`
- ... y más (total ~25 tablas)

---

## 🔧 PASO 3: Aplicar Migration #1 - Tabla Defects

### 3.1 Nueva Query en SQL Editor

- Click en **New query**

### 3.2 Copiar Migration SQL

Abrir el archivo:

```
C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA\infrastructure\supabase\migrations\001_create_defects_table.sql
```

### 3.3 Pegar y Ejecutar

- Copiar contenido completo
- Pegar en SQL Editor
- Click **Run**

### 3.4 Verificar

```sql
SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name = 'defects'
);
```

**Resultado esperado**: `true`

---

## 🔧 PASO 4: Aplicar Migration #2 - Test Steps JSONB

### 4.1 Nueva Query

- Click en **New query**

### 4.2 Copiar Migration SQL

Abrir el archivo:

```
C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA\infrastructure\supabase\migrations\002_migrate_test_steps_to_jsonb.sql
```

### 4.3 Pegar y Ejecutar

- Copiar contenido completo
- Pegar en SQL Editor
- Click **Run**

### 4.4 Verificar

```sql
SELECT data_type
FROM information_schema.columns
WHERE table_name = 'test_cases'
AND column_name = 'test_steps';
```

**Resultado esperado**: `jsonb`

---

## ✅ PASO 5: Verificación Final

### 5.1 Ejecutar Check Completo

```sql
-- 1. Contar tablas públicas
SELECT COUNT(*)
FROM information_schema.tables
WHERE table_schema = 'public';

-- 2. Verificar tabla defects
SELECT COUNT(*) as defects_count
FROM defects;

-- 3. Verificar test_steps es JSONB
SELECT
    column_name,
    data_type
FROM information_schema.columns
WHERE table_name = 'test_cases'
AND column_name IN ('test_steps', 'expected_result');

-- 4. Listar todas las tablas
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
```

### 5.2 Resultados Esperados

- **Tablas públicas**: ~25-30 tablas
- **Tabla defects**: 0 registros (normal, está vacía)
- **test_steps**: tipo `jsonb`
- **expected_result**: tipo `text`

---

## 🎯 PASO 6: Aplicar Policies (RLS)

El schema ya incluye RLS policies básicas, pero verifica que estén activas:

```sql
-- Ver policies de la tabla projects
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies
WHERE tablename = 'projects';
```

Si no hay policies, aplicar el archivo:

```
C:\Users\CarlosArturoArevaloM\Documents\Proyectos\HAIDA\infrastructure\supabase\policies.sql
```

---

## 📊 PASO 7: Seed Data (Opcional)

Para testear el sistema, puedes insertar datos de prueba:

```sql
-- Crear tenant de prueba
INSERT INTO tenants (id, name, slug, subscription_plan, settings)
VALUES (
    gen_random_uuid(),
    'Hiberus Testing',
    'hiberus-testing',
    'professional',
    '{
        "allow_public_signup": false,
        "max_users": 50,
        "features": {
            "chat_ia": true,
            "advanced_reporting": true
        }
    }'::jsonb
)
RETURNING id, name, slug;

-- Crear proyecto de prueba (usa el tenant_id del INSERT anterior)
INSERT INTO projects (tenant_id, name, slug, base_url, type, status)
VALUES (
    'TENANT_ID_AQUI',
    'Proyecto Demo HAIDA',
    'demo-haida',
    'https://demo.haida.com',
    'web',
    'active'
)
RETURNING id, name;

-- Crear test suite
INSERT INTO test_suites (project_id, name, suite_type, priority)
VALUES (
    'PROJECT_ID_AQUI',
    'Login Tests',
    'smoke',
    'critical'
)
RETURNING id, name;

-- Crear test case con steps en JSONB
INSERT INTO test_cases (
    test_suite_id,
    test_id,
    name,
    test_type,
    priority,
    test_steps,
    expected_result
)
VALUES (
    'SUITE_ID_AQUI',
    'TC_LOGIN_001',
    'Verify login with valid credentials',
    'e2e',
    'p0',
    '[
        {"action": "Navigate to login page", "expected": "Login form displayed"},
        {"action": "Enter valid email", "expected": "Email field populated"},
        {"action": "Enter valid password", "expected": "Password field populated"},
        {"action": "Click Login button", "expected": "Redirected to dashboard"}
    ]'::jsonb,
    'User successfully logged in and redirected to dashboard'
)
RETURNING id, test_id, name;
```

---

## 🐛 TROUBLESHOOTING

### Error: "relation already exists"

**Causa**: Intentas crear una tabla que ya existe
**Solución**: Ignora el error o usa `CREATE TABLE IF NOT EXISTS`

### Error: "column already exists"

**Causa**: Intentas agregar columna duplicada
**Solución**: Ignora el error o usa `ADD COLUMN IF NOT EXISTS`

### Error: "syntax error near..."

**Causa**: Query mal formateado
**Solución**:

1. Asegúrate de copiar TODO el contenido del archivo
2. Verifica que no haya caracteres extraños
3. Ejecuta secciones pequeñas paso a paso

### Error: "permission denied"

**Causa**: Usuario no tiene permisos
**Solución**:

1. Usa el SQL Editor de Supabase (tiene permisos admin)
2. No uses psql directo como usuario `postgres`

---

## ✅ VERIFICACIÓN POST-DEPLOYMENT

### Backend Conecta a DB

```bash
# Desde terminal local (con Docker corriendo)
curl http://localhost:8000/admin/db-status

# Deberías ver:
{
  "status": "connected",
  "total_tables": 25+,
  "migrations_status": {
    "defects_table_exists": true,
    "test_steps_is_jsonb": true
  }
}
```

### Frontend Conecta a Supabase

Desde el frontend (Figma), al iniciar debería poder:

- Autenticarse con Supabase Auth
- Listar proyectos (si hay seed data)
- Crear test cases con steps JSON

---

## 📚 ARCHIVOS DE REFERENCIA

| Archivo                                 | Ubicación                              | Descripción               |
| --------------------------------------- | -------------------------------------- | ------------------------- |
| **schema.sql**                          | `infrastructure/supabase/schema.sql`   | Schema principal completo |
| **001_create_defects_table.sql**        | `infrastructure/supabase/migrations/`  | Migration tabla defects   |
| **002_migrate_test_steps_to_jsonb.sql** | `infrastructure/supabase/migrations/`  | Migration JSONB           |
| **policies.sql**                        | `infrastructure/supabase/policies.sql` | RLS Policies              |

---

## 🎯 PRÓXIMOS PASOS

Después de aplicar el schema:

1. ✅ **Testear conexión desde backend**

   ```bash
   curl http://localhost:8000/admin/db-status
   ```

2. ✅ **Configurar frontend para conectarse**
   - Actualizar `NEXT_PUBLIC_SUPABASE_URL` en `.env`
   - Actualizar `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. ✅ **Insertar seed data de prueba**
   - Usar queries del Paso 7

4. ✅ **Testear endpoints críticos**
   - `GET /projects`
   - `POST /auth/login`
   - `GET /test-suites`

---

**¿Problemas?** Revisa los logs en:

- Supabase Dashboard → Database → Logs
- Backend Docker: `docker-compose logs backend`

---

**Última actualización**: +34662652300:00 UTC
