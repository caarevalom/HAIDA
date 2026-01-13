-- ============================================
-- FIX ROW LEVEL SECURITY POLICIES - HAIDA
-- ============================================
-- Fecha: 2025-12-26
-- Problema: El registro de usuarios falla con error:
--   "new row violates row-level security policy for table users"
--
-- Solución: Configurar políticas RLS que permitan:
--   1. Service role tiene acceso completo
--   2. Usuarios autenticados pueden leer
--   3. Usuarios anónimos pueden insertar (registro)
-- ============================================

-- PASO 1: Verificar estado actual de RLS
SELECT
    schemaname,
    tablename,
    rowsecurity as "RLS Habilitado"
FROM pg_tables
WHERE tablename = 'users';

-- PASO 2: Ver políticas actuales
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

-- PASO 3: Eliminar políticas antiguas que puedan estar bloqueando
DROP POLICY IF EXISTS "Service role has full access" ON public.users;
DROP POLICY IF EXISTS "Authenticated users can read" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;
DROP POLICY IF EXISTS "Enable read access for all users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authenticated users only" ON public.users;

-- PASO 4: Crear nuevas políticas correctas

-- Política 1: Service role tiene acceso completo (CRÍTICA para backend API)
CREATE POLICY "Service role bypass RLS"
ON public.users
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

-- Política 2: Usuarios autenticados pueden leer todos los usuarios
CREATE POLICY "Authenticated users can read all users"
ON public.users
FOR SELECT
TO authenticated
USING (true);

-- Política 3: Usuarios autenticados pueden actualizar su propio perfil
CREATE POLICY "Users can update own profile"
ON public.users
FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Política 4: CRÍTICO - Permitir que el backend (service_role) inserte usuarios
-- Esta política ya está cubierta por "Service role bypass RLS"
-- Pero agregamos explícitamente para claridad
CREATE POLICY "Allow backend to insert users"
ON public.users
FOR INSERT
TO service_role
WITH CHECK (true);

-- Política 5: Usuarios pueden ver su propio perfil
CREATE POLICY "Users can view own profile"
ON public.users
FOR SELECT
TO authenticated
USING (auth.uid() = id OR true); -- true permite ver todos (ajustar según necesidad)

-- PASO 5: Asegurar que RLS está habilitado
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- PASO 6: Verificar que las políticas fueron creadas
SELECT
    policyname,
    cmd,
    roles,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'users'
ORDER BY policyname;

-- PASO 7: Test de inserción (este comando solo funciona desde SQL Editor con permisos de service_role)
-- Descomentar solo para probar:
-- INSERT INTO public.users (id, email, name, full_name, role, is_active)
-- VALUES (
--     gen_random_uuid(),
--     'test-rls-fix@hiberus.com',
--     'Test RLS Fix',
--     'Test RLS Fix',
--     'viewer',
--     true
-- );

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- Deberías ver 4-5 políticas creadas:
-- 1. Service role bypass RLS (FOR ALL)
-- 2. Authenticated users can read all users (FOR SELECT)
-- 3. Users can update own profile (FOR UPDATE)
-- 4. Allow backend to insert users (FOR INSERT)
-- 5. Users can view own profile (FOR SELECT)
--
-- Después de aplicar, el endpoint /auth/register debería funcionar
-- ============================================

-- TROUBLESHOOTING
-- Si aún falla después de esto:
--
-- 1. Verificar que el backend usa SUPABASE_SERVICE_KEY (no SUPABASE_KEY)
-- 2. Verificar que el header Authorization usa service_role key
-- 3. Verificar logs en Supabase Dashboard -> Logs -> Postgres
--
-- Query útil para debug:
SELECT current_user, current_setting('role');
