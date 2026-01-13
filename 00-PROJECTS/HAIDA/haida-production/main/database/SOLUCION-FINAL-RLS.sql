-- ================================================================
-- SOLUCIÓN FINAL PARA PROBLEMA DE REGISTRO DE USUARIOS
-- ================================================================
-- Problema: RLS bloquea INSERT desde api/auth.py (Vercel) aunque usa service_role_key
-- Causa: Supabase Python client con REST API respeta RLS incluso con service_role
-- Solución: Deshabilitar RLS y usar trigger para auto-sync desde auth.users
-- ================================================================

-- PASO 1: Deshabilitar RLS en tabla public.users
-- Esto permite que el backend inserte usuarios directamente
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- PASO 2: Verificar que el trigger de auto-sync exista
-- Este trigger copia automáticamente usuarios de auth.users a public.users
SELECT
    tgname as trigger_name,
    CASE tgenabled
        WHEN 'O' THEN 'enabled'
        WHEN 'D' THEN 'disabled'
        ELSE 'other'
    END as status,
    pg_get_triggerdef(oid) as definition
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- PASO 3: Si el trigger no existe (resultado vacío arriba), crearlo
-- EJECUTAR SOLO SI EL SELECT ANTERIOR NO DEVOLVIÓ NADA

-- Función que sincroniza usuario de auth.users a public.users
CREATE OR REPLACE FUNCTION sync_auth_user_to_public()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id,
        email,
        name,
        full_name,
        role,
        is_active,
        created_at
    )
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'full_name', SPLIT_PART(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'viewer'),
        true,
        NEW.created_at
    )
    ON CONFLICT (id) DO UPDATE SET
        email = EXCLUDED.email,
        full_name = EXCLUDED.full_name,
        role = EXCLUDED.role,
        updated_at = CURRENT_TIMESTAMP;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que se dispara cuando se crea un usuario en auth.users
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION sync_auth_user_to_public();

-- PASO 4: Verificar configuración final
SELECT
    'RLS Status' as check_type,
    CASE WHEN relrowsecurity THEN 'ENABLED ❌' ELSE 'DISABLED ✅' END as status
FROM pg_class
WHERE relname = 'users' AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public')
UNION ALL
SELECT
    'Trigger Status',
    CASE
        WHEN COUNT(*) > 0 THEN 'EXISTS ✅'
        ELSE 'NOT FOUND ❌'
    END
FROM pg_trigger
WHERE tgname = 'on_auth_user_created';

-- ================================================================
-- RESULTADO ESPERADO:
-- ================================================================
-- check_type      | status
-- ----------------+---------------
-- RLS Status      | DISABLED ✅
-- Trigger Status  | EXISTS ✅
-- ================================================================

-- NOTA IMPORTANTE:
-- Con esta configuración:
-- 1. El backend puede insertar usuarios directamente (RLS deshabilitado)
-- 2. Cuando Supabase Auth crea un usuario, el trigger lo copia automáticamente a public.users
-- 3. No se necesita lógica de INSERT en el backend - solo usar Supabase Auth signup
-- ================================================================
