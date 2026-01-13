-- ============================================
-- HAIDA - Setup Completo CTB
-- ============================================
-- Fecha: 2025-12-26
-- Descripción:
--   1. Crear/verificar usuario carlosadmin@hiberus.com
--   2. Crear proyecto CTB
--   3. Crear proyecto Privalia
--   4. Crear test suite inicial para CTB
--   5. Registrar ejecución inicial
-- ============================================

-- ============================================
-- PASO 1: Verificar/Crear Usuario
-- ============================================
DO $$
DECLARE
    v_user_id UUID;
    v_auth_user_id UUID;
BEGIN
    -- Buscar en public.users
    SELECT id INTO v_user_id FROM public.users WHERE email = 'hola@stayarta.com';

    IF v_user_id IS NULL THEN
        -- Buscar en auth.users
        SELECT id INTO v_auth_user_id FROM auth.users WHERE email = 'hola@stayarta.com';

        IF v_auth_user_id IS NOT NULL THEN
            -- Crear en public.users
            INSERT INTO public.users (id, email, full_name, role, is_active)
            VALUES (
                v_auth_user_id,
                'carlosadmin@hiberus.com',
                'Carlos Admin',
                'admin',
                true
            )
            ON CONFLICT (email) DO UPDATE SET
                role = 'admin',
                is_active = true,
                updated_at = CURRENT_TIMESTAMP;

            RAISE NOTICE '✅ Usuario creado/actualizado en public.users desde auth.users';
        ELSE
            RAISE NOTICE '⚠️ Usuario no encontrado en auth.users - debe crearse manualmente';
        END IF;
    ELSE
        -- Actualizar rol a admin
        UPDATE public.users
        SET role = 'admin', is_active = true, updated_at = CURRENT_TIMESTAMP
        WHERE id = v_user_id;

        RAISE NOTICE '✅ Usuario ya existe: %', v_user_id;
    END IF;
END $$;

-- ============================================
-- PASO 2: Crear Proyecto CTB
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
    'Proyecto CTB - Sistema de gestión y testing automatizado',
    'https://mcprod.thisisbarcelona.com',
    'https://github.com/hiberus/ctb',
    'active',
    (SELECT id FROM public.users WHERE email = 'hola@stayarta.com'),
    '{"notifications_enabled": true, "auto_testing": true, "smtp_enabled": false}'::jsonb,
    '{"client": "CTB", "priority": "high", "environment": "production", "base_url": "https://mcprod.thisisbarcelona.com"}'::jsonb
)
ON CONFLICT (slug) DO UPDATE SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    base_url = EXCLUDED.base_url,
    owner_id = EXCLUDED.owner_id,
    settings = EXCLUDED.settings,
    metadata = EXCLUDED.metadata,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================
-- PASO 3: Crear Proyecto Privalia
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
    settings = EXCLUDED.settings,
    metadata = EXCLUDED.metadata,
    updated_at = CURRENT_TIMESTAMP;

-- ============================================
-- PASO 4: Crear Test Suites para CTB
-- ============================================

-- Suite 1: Home & Landing
INSERT INTO public.test_suites (
    project_id,
    name,
    description,
    suite_type,
    priority,
    tags,
    metadata
) VALUES (
    (SELECT id FROM public.projects WHERE slug = 'ctb'),
    'CTB - Home & Landing',
    'Tests de página principal, banner, productos destacados y performance',
    'smoke',
    'high',
    ARRAY['home', 'landing', 'performance', 'a11y', 'desktop', 'ios', 'android'],
    '{"component": "Home", "module": "Landing", "test_count": 13, "source": "ctb-master.csv"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Suite 2: Búsqueda y Navegación
INSERT INTO public.test_suites (
    project_id,
    name,
    description,
    suite_type,
    priority,
    tags,
    metadata
) VALUES (
    (SELECT id FROM public.projects WHERE slug = 'ctb'),
    'CTB - Búsqueda y Navegación',
    'Tests de búsqueda, navegación principal, footer y newsletter',
    'smoke',
    'high',
    ARRAY['search', 'navigation', 'footer', 'newsletter', 'desktop', 'ios', 'android'],
    '{"component": "Navigation", "module": "Search", "test_count": 8, "source": "ctb-master.csv"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Suite 3: Autenticación
INSERT INTO public.test_suites (
    project_id,
    name,
    description,
    suite_type,
    priority,
    tags,
    metadata
) VALUES (
    (SELECT id FROM public.projects WHERE slug = 'ctb'),
    'CTB - Autenticación',
    'Tests de login, registro, recuperación de password, logout, MFA',
    'functional',
    'critical',
    ARRAY['auth', 'login', 'register', 'security', 'desktop', 'ios', 'android'],
    '{"component": "Auth", "module": "Login", "test_count": 15, "source": "ctb-master.csv"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Suite 4: PLP (Product Listing Page)
INSERT INTO public.test_suites (
    project_id,
    name,
    description,
    suite_type,
    priority,
    tags,
    metadata
) VALUES (
    (SELECT id FROM public.projects WHERE slug = 'ctb'),
    'CTB - PLP (Product Listing)',
    'Tests de listado de productos, filtros, ordenamiento y paginación',
    'functional',
    'high',
    ARRAY['plp', 'products', 'filters', 'sorting', 'desktop', 'ios', 'android'],
    '{"component": "PLP", "module": "Listing", "test_count": 12, "source": "ctb-master.csv"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Suite 5: PDP (Product Detail Page)
INSERT INTO public.test_suites (
    project_id,
    name,
    description,
    suite_type,
    priority,
    tags,
    metadata
) VALUES (
    (SELECT id FROM public.projects WHERE slug = 'ctb'),
    'CTB - PDP (Product Detail)',
    'Tests de detalle de producto, galería, precio, disponibilidad y calendario',
    'functional',
    'high',
    ARRAY['pdp', 'product', 'calendar', 'availability', 'desktop', 'ios', 'android'],
    '{"component": "PDP", "module": "Detail", "test_count": 10, "source": "ctb-master.csv"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Suite 6: Carrito y Checkout
INSERT INTO public.test_suites (
    project_id,
    name,
    description,
    suite_type,
    priority,
    tags,
    metadata
) VALUES (
    (SELECT id FROM public.projects WHERE slug = 'ctb'),
    'CTB - Carrito y Checkout',
    'Tests de carrito, descuentos, checkout, pago y confirmación de orden',
    'e2e',
    'critical',
    ARRAY['cart', 'checkout', 'payment', 'security', 'desktop', 'ios', 'android'],
    '{"component": "Cart", "module": "Checkout", "test_count": 30, "source": "ctb-master.csv"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Suite 7: Portal Afiliados
INSERT INTO public.test_suites (
    project_id,
    name,
    description,
    suite_type,
    priority,
    tags,
    metadata
) VALUES (
    (SELECT id FROM public.projects WHERE slug = 'ctb'),
    'CTB - Portal Afiliados',
    'Tests de autenticación, dashboard, productos, disponibilidad y reservas de afiliados',
    'functional',
    'high',
    ARRAY['afiliados', 'auth', 'dashboard', 'productos', 'desktop', 'ios', 'android'],
    '{"component": "Afiliats", "module": "Portal", "test_count": 16, "source": "ctb-master.csv"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Suite 8: Favoritos y Wishlist
INSERT INTO public.test_suites (
    project_id,
    name,
    description,
    suite_type,
    priority,
    tags,
    metadata
) VALUES (
    (SELECT id FROM public.projects WHERE slug = 'ctb'),
    'CTB - Favoritos y Wishlist',
    'Tests de agregar/eliminar favoritos, compartir wishlist, sincronización multi-dispositivo',
    'functional',
    'medium',
    ARRAY['favorites', 'wishlist', 'sync', 'desktop', 'ios', 'android'],
    '{"component": "Favorites", "module": "Wishlist", "test_count": 10, "source": "ctb-master.csv"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Suite 9: Responsive Design
INSERT INTO public.test_suites (
    project_id,
    name,
    description,
    suite_type,
    priority,
    tags,
    metadata
) VALUES (
    (SELECT id FROM public.projects WHERE slug = 'ctb'),
    'CTB - Responsive Design',
    'Tests de diseño responsive en mobile, tablet y desktop',
    'compatibility',
    'medium',
    ARRAY['responsive', 'mobile', 'tablet', 'desktop', 'ios', 'android'],
    '{"component": "Layout", "module": "Responsive", "test_count": 8, "source": "ctb-master.csv"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- Suite 10: Calendario y Disponibilidad
INSERT INTO public.test_suites (
    project_id,
    name,
    description,
    suite_type,
    priority,
    tags,
    metadata
) VALUES (
    (SELECT id FROM public.projects WHERE slug = 'ctb'),
    'CTB - Calendario y Disponibilidad',
    'Tests de calendario, selección de fechas, pricing temporal y validaciones',
    'functional',
    'high',
    ARRAY['calendar', 'availability', 'pricing', 'desktop', 'ios', 'android'],
    '{"component": "Calendar", "module": "Availability", "test_count": 12, "source": "ctb-master.csv"}'::jsonb
)
ON CONFLICT DO NOTHING;

-- ============================================
-- PASO 5: Registrar Ejecución Inicial
-- ============================================
INSERT INTO public.test_executions (
    project_id,
    test_suite_id,
    execution_type,
    status,
    environment,
    browser,
    platform,
    started_at,
    completed_at,
    total_tests,
    passed,
    failed,
    skipped,
    duration_ms,
    metadata
) VALUES (
    (SELECT id FROM public.projects WHERE slug = 'ctb'),
    (SELECT id FROM public.test_suites WHERE name = 'CTB - Home & Landing' LIMIT 1),
    'automated',
    'completed',
    'production',
    'chromium',
    'desktop',
    '2025-12-26 00:00:00'::timestamp,
    '2025-12-26 00:05:00'::timestamp,
    6,
    1,
    5,
    0,
    102000,
    '{"base_url": "https://mcprod.thisisbarcelona.com", "spec_file": "tests/web-e2e/smoke.spec.ts", "devices": ["Desktop Chrome", "iPhone 14", "Pixel 7"], "source": "HAIDA Automated Testing", "incidents": ["CTB-001", "CTB-002"]}'::jsonb
)
ON CONFLICT DO NOTHING;

-- ============================================
-- PASO 6: Resumen Final
-- ============================================
SELECT
    '=== RESUMEN CONFIGURACIÓN CTB ===' AS summary;

-- Usuario
SELECT
    'USUARIO' AS tipo,
    email,
    full_name AS nombre,
    role AS rol,
    is_active AS activo
FROM public.users
WHERE email = 'hola@stayarta.com';

-- Proyectos del usuario
SELECT
    'PROYECTO' AS tipo,
    name AS nombre,
    slug,
    status AS estado,
    base_url AS url
FROM public.projects
WHERE owner_id = (SELECT id FROM public.users WHERE email = 'hola@stayarta.com')
ORDER BY created_at DESC;

-- Test suites de CTB
SELECT
    'TEST SUITE' AS tipo,
    name AS nombre,
    suite_type AS tipo_suite,
    priority AS prioridad,
    array_length(tags, 1) AS num_tags
FROM public.test_suites
WHERE project_id = (SELECT id FROM public.projects WHERE slug = 'ctb')
ORDER BY priority DESC, name;

-- Ejecuciones de CTB
SELECT
    'EJECUCIÓN' AS tipo,
    execution_type AS tipo_ejecucion,
    status AS estado,
    total_tests AS total,
    passed AS pasados,
    failed AS fallidos,
    skipped,
    started_at AS fecha
FROM public.test_executions
WHERE project_id = (SELECT id FROM public.projects WHERE slug = 'ctb')
ORDER BY started_at DESC
LIMIT 5;

-- ============================================
-- RESULTADO ESPERADO
-- ============================================
DO $$
BEGIN
    RAISE NOTICE '';
    RAISE NOTICE '============================================';
    RAISE NOTICE '✅ CONFIGURACIÓN CTB COMPLETADA';
    RAISE NOTICE '============================================';
    RAISE NOTICE 'Usuario: carlosadmin@hiberus.com';
    RAISE NOTICE 'Proyectos: CTB, Privalia';
    RAISE NOTICE 'Test Suites CTB: 10';
    RAISE NOTICE 'Ejecución inicial: Registrada';
    RAISE NOTICE '============================================';
END $$;
