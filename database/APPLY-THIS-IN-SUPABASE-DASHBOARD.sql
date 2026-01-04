-- ============================================
-- HAIDA - MIGRACIÓN CRÍTICA
-- ============================================
-- INSTRUCCIONES:
-- 1. Abre: https://supabase.com/dashboard/project/wdebyxvtunromsnkqbrd/sql/new
-- 2. Copia TODO este archivo
-- 3. Pega en SQL Editor
-- 4. Click en "RUN" o presiona Cmd+Enter
-- 5. Verifica que dice "Success. No rows returned"
-- ============================================

-- PASO 1: Agregar columna full_name a tabla users
ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS full_name VARCHAR(255);

-- PASO 2: Copiar datos existentes de name a full_name
UPDATE public.users
SET full_name = name
WHERE full_name IS NULL OR full_name = '';

-- PASO 3: Agregar comentario para documentación
COMMENT ON COLUMN public.users.full_name IS 'Full name of user (for API compatibility with backend)';

-- PASO 4: Sincronizar usuarios de auth.users a public.users
-- Esto insertará usuarios que existen en auth.users pero no en public.users
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

-- PASO 5: Verificar resultados
-- Esta query mostrará todos los usuarios con sus datos
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

-- ============================================
-- VERIFICACIÓN:
-- Deberías ver todos los usuarios con:
-- - Columna full_name poblada (no NULL)
-- - Total de 9 usuarios (los de auth.users)
-- ============================================
