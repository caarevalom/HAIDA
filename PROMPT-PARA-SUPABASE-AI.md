# 🤖 Prompt para Supabase AI Assistant

Copia y pega este prompt completo en el Supabase AI Assistant.

---

## PROMPT PARA SUPABASE AI

```
Hola! Necesito configurar mi base de datos de Supabase para el proyecto HAIDA (QA Automation System).

Por favor, realiza las siguientes acciones en orden:

### 1. VERIFICAR SCHEMA ACTUAL DE TABLA USERS

Primero, muéstrame el schema completo de la tabla `public.users`:

```sql
SELECT
    column_name,
    data_type,
    character_maximum_length,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
AND table_name = 'users'
ORDER BY ordinal_position;
```

### 2. AGREGAR COLUMNA FULL_NAME SI NO EXISTE

Si la columna `full_name` NO existe, ejecútala:

```sql
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);
```

### 3. COPIAR DATOS EXISTENTES

Copia los datos de la columna `name` a `full_name` para usuarios existentes:

```sql
UPDATE public.users
SET full_name = name
WHERE full_name IS NULL OR full_name = '';
```

### 4. SINCRONIZAR USUARIOS DE AUTH.USERS A PUBLIC.USERS

Inserta usuarios que existen en `auth.users` pero no en `public.users`:

```sql
INSERT INTO public.users (id, email, name, full_name, role, created_at, is_active)
SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', SPLIT_PART(au.email, '@', 1)) as name,
    COALESCE(au.raw_user_meta_data->>'full_name', SPLIT_PART(au.email, '@', 1)) as full_name,
    COALESCE(au.raw_user_meta_data->>'role', 'viewer') as role,
    au.created_at,
    CASE WHEN au.email_confirmed_at IS NOT NULL THEN true ELSE false END as is_active
FROM auth.users au
WHERE NOT EXISTS (
    SELECT 1 FROM public.users pu WHERE pu.id = au.id
)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    is_active = EXCLUDED.is_active,
    updated_at = CURRENT_TIMESTAMP;
```

### 5. VERIFICAR RESULTADOS

Muestra todos los usuarios con sus datos completos:

```sql
SELECT
    id,
    email,
    name,
    full_name,
    role,
    is_active,
    created_at
FROM public.users
ORDER BY created_at DESC;
```

Debería mostrar 9 usuarios en total, todos con `full_name` poblado.

### 6. CREAR FUNCIÓN RPC PARA ACCESO EXTERNO (OPCIONAL)

Para permitir que scripts externos puedan ejecutar verificaciones, crea esta función:

```sql
CREATE OR REPLACE FUNCTION get_users_summary()
RETURNS TABLE (
    total_users INTEGER,
    users_with_full_name INTEGER,
    users_without_full_name INTEGER,
    auth_users INTEGER,
    synced_users INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT
        (SELECT COUNT(*)::INTEGER FROM public.users),
        (SELECT COUNT(*)::INTEGER FROM public.users WHERE full_name IS NOT NULL AND full_name != ''),
        (SELECT COUNT(*)::INTEGER FROM public.users WHERE full_name IS NULL OR full_name = ''),
        (SELECT COUNT(*)::INTEGER FROM auth.users),
        (SELECT COUNT(*)::INTEGER FROM public.users pu WHERE EXISTS (SELECT 1 FROM auth.users au WHERE au.id = pu.id));
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

### 7. CONFIGURAR ROW LEVEL SECURITY (RLS)

Asegúrate de que las políticas RLS permitan acceso con service_role:

```sql
-- Verificar políticas actuales
SELECT
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies
WHERE tablename = 'users';

-- Si es necesario, habilita RLS pero permite acceso con service_role
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política para service_role (full access)
CREATE POLICY "Service role has full access" ON public.users
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);

-- Política para authenticated users (read only)
CREATE POLICY "Authenticated users can read" ON public.users
    FOR SELECT
    TO authenticated
    USING (true);
```

### 8. CREAR TRIGGER PARA AUTO-SYNC (FUTURO)

Para que futuros usuarios de auth.users se sincronicen automáticamente:

```sql
CREATE OR REPLACE FUNCTION sync_auth_user_to_public()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name, full_name, role, created_at, is_active)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'viewer'),
        NEW.created_at,
        CASE WHEN NEW.email_confirmed_at IS NOT NULL THEN true ELSE false END
    )
    ON CONFLICT (id) DO UPDATE SET
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        is_active = EXCLUDED.is_active,
        updated_at = CURRENT_TIMESTAMP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_auth_user_to_public();
```

### 9. VERIFICACIÓN FINAL

Ejecuta esta query para confirmar que todo está correcto:

```sql
-- Resumen de la configuración
SELECT
    'Total usuarios en public.users' as check_name,
    COUNT(*)::TEXT as result
FROM public.users
UNION ALL
SELECT
    'Usuarios con full_name',
    COUNT(*)::TEXT
FROM public.users
WHERE full_name IS NOT NULL AND full_name != ''
UNION ALL
SELECT
    'Total usuarios en auth.users',
    COUNT(*)::TEXT
FROM auth.users
UNION ALL
SELECT
    'Usuarios sincronizados',
    COUNT(*)::TEXT
FROM public.users pu
INNER JOIN auth.users au ON pu.id = au.id
UNION ALL
SELECT
    'Columna full_name existe',
    CASE WHEN EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'users' AND column_name = 'full_name'
    ) THEN 'YES' ELSE 'NO' END;
```

---

Por favor, ejecuta todos estos pasos en orden y muéstrame:
1. El resultado de cada query
2. Cualquier error que ocurra
3. La verificación final con el resumen

Gracias!
```

---

## CÓMO USAR ESTE PROMPT

### Opción 1: Supabase SQL Editor

1. Ve a: https://supabase.com/dashboard/project/wdebyxvtunromsnkqbrd/sql/new
2. Copia solo las queries SQL (sin el texto explicativo)
3. Ejecuta cada sección una por una
4. Verifica los resultados

### Opción 2: Supabase AI Assistant (Si existe)

1. Ve a: https://supabase.com/dashboard/project/wdebyxvtunromsnkqbrd
2. Busca el botón de AI Assistant o Chat
3. Pega TODO el prompt completo
4. Espera a que ejecute y muestre resultados

### Opción 3: Via API con Claude/ChatGPT

Si Supabase no tiene AI Assistant integrado, usa este prompt alternativo:

---

## PROMPT ALTERNATIVO PARA IA EXTERNA (Claude/ChatGPT)

```
Necesito que me ayudes a configurar mi base de datos de Supabase. Tengo acceso via REST API con esta información:

SUPABASE_URL: https://wdebyxvtunromsnkqbrd.supabase.co
SUPABASE_SERVICE_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTg5NTc1MSwiZXhwIjoyMDgxNDcxNzUxfQ.Jg6UBGpYDBBKvB4pgaKW_OJCTx0VOm9UMI18vqdUEJc

Necesito:
1. Verificar que existe la tabla `users` y ver sus columnas
2. Verificar si existe la columna `full_name`
3. Generar el SQL necesario para agregar `full_name` si no existe
4. Generar el SQL para sincronizar usuarios de auth.users a public.users

No puedo ejecutar ALTER TABLE via REST API, así que necesito el SQL para ejecutar en el SQL Editor de Supabase.

Por favor, genera:
1. Un script SQL completo y listo para copiar/pegar
2. Queries de verificación
3. Explicación de qué hace cada parte

El SQL debe ser compatible con PostgreSQL 15 (versión de Supabase).
```

---

## RESULTADO ESPERADO

Después de ejecutar todo, deberías ver:

```
✅ Total usuarios en public.users: 9
✅ Usuarios con full_name: 9
✅ Total usuarios en auth.users: 9
✅ Usuarios sincronizados: 9
✅ Columna full_name existe: YES
```

Si ves esto, la configuración está completa y puedes ejecutar:

```bash
# Verificar desde tu máquina
python3 /tmp/supabase-rest-audit.py

# Ejecutar tests
npx playwright test tests/web-e2e/auth-api.spec.ts
```

---

## TROUBLESHOOTING

### Error: "permission denied for table users"

**Solución**: Asegúrate de ejecutar las queries en Supabase Dashboard, no via REST API. El SQL Editor tiene permisos de superusuario.

### Error: "column full_name already exists"

**Solución**: Está bien! Significa que ya fue creada. Salta al paso 3 (copiar datos).

### Error: "function sync_auth_user_to_public already exists"

**Solución**: Usa `CREATE OR REPLACE FUNCTION` en lugar de solo `CREATE FUNCTION`.

### Los usuarios siguen sin full_name después de UPDATE

**Solución**: Verifica que la columna se creó correctamente:
```sql
SELECT column_name FROM information_schema.columns
WHERE table_name = 'users' AND column_name = 'full_name';
```

---

## VERIFICACIÓN MANUAL

Si prefieres hacerlo todo manualmente sin IA, sigue estos pasos:

1. **Abre SQL Editor**: https://supabase.com/dashboard/project/wdebyxvtunromsnkqbrd/sql/new

2. **Copia este SQL completo**:

```sql
-- ============================================
-- CONFIGURACIÓN COMPLETA HAIDA
-- ============================================

-- 1. Agregar columna full_name
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);

-- 2. Copiar datos
UPDATE public.users
SET full_name = name
WHERE full_name IS NULL OR full_name = '';

-- 3. Sincronizar usuarios
INSERT INTO public.users (id, email, name, full_name, role, created_at, is_active)
SELECT
    au.id,
    au.email,
    COALESCE(au.raw_user_meta_data->>'full_name', SPLIT_PART(au.email, '@', 1)),
    COALESCE(au.raw_user_meta_data->>'full_name', SPLIT_PART(au.email, '@', 1)),
    COALESCE(au.raw_user_meta_data->>'role', 'viewer'),
    au.created_at,
    CASE WHEN au.email_confirmed_at IS NOT NULL THEN true ELSE false END
FROM auth.users au
WHERE NOT EXISTS (SELECT 1 FROM public.users pu WHERE pu.id = au.id)
ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    role = EXCLUDED.role,
    updated_at = CURRENT_TIMESTAMP;

-- 4. Verificar
SELECT id, email, name, full_name, role FROM public.users ORDER BY created_at DESC;
```

3. **Click RUN** (o Cmd+Enter)

4. **Verifica los resultados** - Deberías ver 9 usuarios con full_name poblado

---

**Archivo generado**: 2025-12-26
**Úsalo en**: Supabase AI Assistant o SQL Editor
**Tiempo estimado**: 2-5 minutos
