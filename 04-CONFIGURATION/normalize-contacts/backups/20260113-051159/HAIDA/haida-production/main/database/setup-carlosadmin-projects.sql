-- ============================================
-- SETUP: Usuario carlosadmin@hiberus.com
-- ============================================
-- Fecha: 2025-12-26
-- Propósito:
--   1. Verificar usuario carlosadmin@hiberus.com
--   2. Crear proyectos CTB y Privalia
--   3. Asignarlos al usuario con permisos admin
-- ============================================

-- ============================================
-- PASO 1: Verificar usuario existe
-- ============================================
DO $$
DECLARE
    v_user_id UUID;
    v_user_email VARCHAR(255);
    v_user_role VARCHAR(50);
BEGIN
    -- Buscar usuario
    SELECT id, email, role INTO v_user_id, v_user_email, v_user_role
    FROM public.users
    WHERE email = 'hola@stayarta.com';

    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Usuario carlosadmin@hiberus.com NO encontrado en public.users';
    ELSE
        RAISE NOTICE '✅ Usuario encontrado:';
        RAISE NOTICE '   ID: %', v_user_id;
        RAISE NOTICE '   Email: %', v_user_email;
        RAISE NOTICE '   Rol actual: %', v_user_role;
    END IF;
END $$;

-- ============================================
-- PASO 2: Actualizar rol a admin (si no lo es)
-- ============================================
UPDATE public.users
SET role = 'admin',
    updated_at = CURRENT_TIMESTAMP
WHERE email = 'hola@stayarta.com'
  AND role != 'admin';

-- Verificar actualización
DO $$
DECLARE
    v_updated_role VARCHAR(50);
BEGIN
    SELECT role INTO v_updated_role
    FROM public.users
    WHERE email = 'hola@stayarta.com';

    RAISE NOTICE '✅ Rol actualizado a: %', v_updated_role;
END $$;

-- ============================================
-- PASO 3: Crear Proyecto CTB
-- ============================================
INSERT INTO public.projects (
    name,
    slug,
    description,
    base_url,
    repository_url,
    status,
    owner_id,
    settings,
    metadata
) VALUES (
    'CTB',
    'ctb',
    'Proyecto CTB - Sistema de gestión y testing',
    'https://ctb.example.com',
    'https://github.com/hiberus/ctb',
    'active',
    (SELECT id FROM public.users WHERE email = 'hola@stayarta.com'),
    '{"notifications_enabled": true, "auto_testing": true}'::jsonb,
    '{"client": "CTB", "priority": "high", "environment": "production"}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    base_url = EXCLUDED.base_url,
    owner_id = EXCLUDED.owner_id,
    updated_at = CURRENT_TIMESTAMP;

-- Verificar creación CTB
DO $$
DECLARE
    v_project_id UUID;
    v_project_name VARCHAR(255);
    v_owner_email VARCHAR(255);
BEGIN
    SELECT p.id, p.name, u.email
    INTO v_project_id, v_project_name, v_owner_email
    FROM public.projects p
    JOIN public.users u ON p.owner_id = u.id
    WHERE p.slug = 'ctb';

    RAISE NOTICE '✅ Proyecto CTB creado:';
    RAISE NOTICE '   ID: %', v_project_id;
    RAISE NOTICE '   Nombre: %', v_project_name;
    RAISE NOTICE '   Owner: %', v_owner_email;
END $$;

-- ============================================
-- PASO 4: Crear Proyecto Privalia
-- ============================================
INSERT INTO public.projects (
    name,
    slug,
    description,
    base_url,
    repository_url,
    status,
    owner_id,
    settings,
    metadata
) VALUES (
    'Privalia',
    'privalia',
    'Proyecto Privalia - E-commerce y testing automatizado',
    'https://privalia.example.com',
    'https://github.com/hiberus/privalia',
    'active',
    (SELECT id FROM public.users WHERE email = 'hola@stayarta.com'),
    '{"notifications_enabled": true, "auto_testing": true, "performance_monitoring": true}'::jsonb,
    '{"client": "Privalia", "priority": "critical", "environment": "production", "sla": "99.9%"}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    base_url = EXCLUDED.base_url,
    owner_id = EXCLUDED.owner_id,
    updated_at = CURRENT_TIMESTAMP;

-- Verificar creación Privalia
DO $$
DECLARE
    v_project_id UUID;
    v_project_name VARCHAR(255);
    v_owner_email VARCHAR(255);
BEGIN
    SELECT p.id, p.name, u.email
    INTO v_project_id, v_project_name, v_owner_email
    FROM public.projects p
    JOIN public.users u ON p.owner_id = u.id
    WHERE p.slug = 'privalia';

    RAISE NOTICE '✅ Proyecto Privalia creado:';
    RAISE NOTICE '   ID: %', v_project_id;
    RAISE NOTICE '   Nombre: %', v_project_name;
    RAISE NOTICE '   Owner: %', v_owner_email;
END $$;

-- ============================================
-- PASO 5: Resumen Final
-- ============================================
SELECT
    '=== RESUMEN FINAL ===' AS summary;

-- Usuario
SELECT
    'USUARIO' AS tipo,
    email,
    full_name AS nombre,
    role AS rol,
    is_active AS activo,
    created_at AS creado
FROM public.users
WHERE email = 'hola@stayarta.com';

-- Proyectos del usuario
SELECT
    'PROYECTO' AS tipo,
    p.name AS nombre,
    p.slug AS slug,
    p.status AS estado,
    p.base_url AS url,
    p.created_at AS creado
FROM public.projects p
WHERE p.owner_id = (SELECT id FROM public.users WHERE email = 'hola@stayarta.com')
ORDER BY p.created_at DESC;

-- Conteo de test suites por proyecto
SELECT
    'TEST SUITES' AS tipo,
    p.name AS proyecto,
    COUNT(ts.id) AS total_suites
FROM public.projects p
LEFT JOIN public.test_suites ts ON ts.project_id = p.id
WHERE p.owner_id = (SELECT id FROM public.users WHERE email = 'hola@stayarta.com')
GROUP BY p.name
ORDER BY p.name;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
-- Usuario: carlosadmin@hiberus.com con rol 'admin'
-- Proyectos: CTB y Privalia asignados como owner
-- Test Suites: 0 (proyectos nuevos sin suites aún)
-- ============================================

DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'CONFIGURACIÓN COMPLETADA EXITOSAMENTE';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Usuario: carlosadmin@hiberus.com';
    RAISE NOTICE 'Rol: admin';
    RAISE NOTICE 'Proyectos asignados: CTB, Privalia';
    RAISE NOTICE '============================================';
END $$;
