-- =====================================================
-- SISTEMA DE PERMISOS GRANULARES PARA HAIDA
-- =====================================================

-- 1. Tabla de Permisos (permissions)
-- Define todos los permisos disponibles en el sistema
CREATE TABLE IF NOT EXISTS public.permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) UNIQUE NOT NULL,
  resource VARCHAR(50) NOT NULL, -- e.g., 'projects', 'users', 'test_suites'
  action VARCHAR(50) NOT NULL,   -- e.g., 'create', 'read', 'update', 'delete', 'execute'
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  CONSTRAINT uq_permission_resource_action UNIQUE(resource, action)
);

COMMENT ON TABLE public.permissions IS 'Define todos los permisos disponibles en HAIDA';
COMMENT ON COLUMN public.permissions.resource IS 'Recurso sobre el que se aplica el permiso (projects, users, test_suites, etc.)';
COMMENT ON COLUMN public.permissions.action IS 'Acción permitida (create, read, update, delete, execute, manage)';

-- 2. Tabla de Roles (roles)
-- Define los roles del sistema
CREATE TABLE IF NOT EXISTS public.roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(50) UNIQUE NOT NULL,
  description TEXT,
  is_system_role BOOLEAN DEFAULT FALSE, -- Roles del sistema no se pueden eliminar
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

COMMENT ON TABLE public.roles IS 'Roles del sistema HAIDA';
COMMENT ON COLUMN public.roles.is_system_role IS 'Si es true, el rol no se puede eliminar (admin, qa_engineer, developer, viewer)';

-- 3. Tabla de Permisos por Rol (role_permissions)
-- Asocia permisos a roles
CREATE TABLE IF NOT EXISTS public.role_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id UUID NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),

  CONSTRAINT uq_role_permission UNIQUE(role_id, permission_id)
);

COMMENT ON TABLE public.role_permissions IS 'Asocia permisos a roles';

-- 4. Tabla de Permisos Personalizados por Usuario (user_permissions)
-- Permite asignar permisos adicionales o revocar permisos a usuarios específicos
CREATE TABLE IF NOT EXISTS public.user_permissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
  is_granted BOOLEAN DEFAULT TRUE, -- true = otorgar, false = revocar
  granted_at TIMESTAMPTZ DEFAULT NOW(),
  granted_by UUID REFERENCES auth.users(id),

  CONSTRAINT uq_user_permission UNIQUE(user_id, permission_id)
);

COMMENT ON TABLE public.user_permissions IS 'Permisos personalizados por usuario (override de permisos de rol)';
COMMENT ON COLUMN public.user_permissions.is_granted IS 'true = otorgar permiso adicional, false = revocar permiso del rol';

-- =====================================================
-- INSERTAR PERMISOS DEL SISTEMA
-- =====================================================

INSERT INTO public.permissions (name, resource, action, description) VALUES
-- Permisos de Proyectos
('projects.create', 'projects', 'create', 'Crear nuevos proyectos'),
('projects.read', 'projects', 'read', 'Ver proyectos'),
('projects.update', 'projects', 'update', 'Editar proyectos'),
('projects.delete', 'projects', 'delete', 'Eliminar proyectos'),
('projects.manage', 'projects', 'manage', 'Gestión completa de proyectos (incluye configuración)'),

-- Permisos de Test Suites
('test_suites.create', 'test_suites', 'create', 'Crear test suites'),
('test_suites.read', 'test_suites', 'read', 'Ver test suites'),
('test_suites.update', 'test_suites', 'update', 'Editar test suites'),
('test_suites.delete', 'test_suites', 'delete', 'Eliminar test suites'),
('test_suites.execute', 'test_suites', 'execute', 'Ejecutar test suites'),

-- Permisos de Test Cases
('test_cases.create', 'test_cases', 'create', 'Crear test cases'),
('test_cases.read', 'test_cases', 'read', 'Ver test cases'),
('test_cases.update', 'test_cases', 'update', 'Editar test cases'),
('test_cases.delete', 'test_cases', 'delete', 'Eliminar test cases'),

-- Permisos de Ejecuciones
('executions.read', 'executions', 'read', 'Ver resultados de ejecuciones'),
('executions.delete', 'executions', 'delete', 'Eliminar resultados de ejecuciones'),

-- Permisos de Reportes
('reports.read', 'reports', 'read', 'Ver reportes'),
('reports.export', 'reports', 'export', 'Exportar reportes'),
('reports.create', 'reports', 'create', 'Crear reportes personalizados'),

-- Permisos de Usuarios
('users.create', 'users', 'create', 'Crear nuevos usuarios'),
('users.read', 'users', 'read', 'Ver usuarios'),
('users.update', 'users', 'update', 'Editar usuarios'),
('users.delete', 'users', 'delete', 'Eliminar usuarios'),
('users.manage_permissions', 'users', 'manage_permissions', 'Gestionar permisos de usuarios'),

-- Permisos de Configuración
('settings.read', 'settings', 'read', 'Ver configuración del sistema'),
('settings.update', 'settings', 'update', 'Modificar configuración del sistema')

ON CONFLICT (resource, action) DO NOTHING;

-- =====================================================
-- INSERTAR ROLES DEL SISTEMA
-- =====================================================

INSERT INTO public.roles (name, description, is_system_role) VALUES
('admin', 'Administrador del sistema - Acceso completo', TRUE),
('qa_engineer', 'Ingeniero de QA - Puede crear y ejecutar tests', TRUE),
('developer', 'Desarrollador - Puede ver tests y resultados', TRUE),
('viewer', 'Visualizador - Solo puede ver información', TRUE)

ON CONFLICT (name) DO NOTHING;

-- =====================================================
-- ASIGNAR PERMISOS A ROLES
-- =====================================================

-- ADMIN: Todos los permisos
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- QA_ENGINEER: Permisos de QA (crear, ejecutar, ver)
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'qa_engineer'
  AND p.name IN (
    -- Proyectos
    'projects.read',
    'projects.update',
    -- Test Suites
    'test_suites.create',
    'test_suites.read',
    'test_suites.update',
    'test_suites.delete',
    'test_suites.execute',
    -- Test Cases
    'test_cases.create',
    'test_cases.read',
    'test_cases.update',
    'test_cases.delete',
    -- Ejecuciones
    'executions.read',
    'executions.delete',
    -- Reportes
    'reports.read',
    'reports.export',
    'reports.create'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- DEVELOPER: Permisos de lectura y actualización
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'developer'
  AND p.name IN (
    'projects.read',
    'test_suites.read',
    'test_suites.execute',
    'test_cases.read',
    'executions.read',
    'reports.read',
    'reports.export'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- VIEWER: Solo lectura
INSERT INTO public.role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM public.roles r
CROSS JOIN public.permissions p
WHERE r.name = 'viewer'
  AND p.name IN (
    'projects.read',
    'test_suites.read',
    'test_cases.read',
    'executions.read',
    'reports.read'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- =====================================================
-- FUNCIÓN: Verificar si un usuario tiene un permiso
-- =====================================================

CREATE OR REPLACE FUNCTION public.user_has_permission(
  p_user_id UUID,
  p_permission_name VARCHAR
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_has_permission BOOLEAN := FALSE;
  v_user_role VARCHAR;
  v_permission_id UUID;
BEGIN
  -- Obtener el rol del usuario
  SELECT role INTO v_user_role
  FROM public.users
  WHERE id = p_user_id;

  -- Obtener el ID del permiso
  SELECT id INTO v_permission_id
  FROM public.permissions
  WHERE name = p_permission_name;

  IF v_permission_id IS NULL THEN
    RETURN FALSE;
  END IF;

  -- Verificar si hay un permiso personalizado del usuario
  SELECT is_granted INTO v_has_permission
  FROM public.user_permissions
  WHERE user_id = p_user_id
    AND permission_id = v_permission_id;

  -- Si existe permiso personalizado, retornar ese valor
  IF v_has_permission IS NOT NULL THEN
    RETURN v_has_permission;
  END IF;

  -- Si no hay permiso personalizado, verificar permisos del rol
  SELECT EXISTS(
    SELECT 1
    FROM public.role_permissions rp
    JOIN public.roles r ON r.id = rp.role_id
    WHERE r.name = v_user_role
      AND rp.permission_id = v_permission_id
  ) INTO v_has_permission;

  RETURN v_has_permission;
END;
$$;

COMMENT ON FUNCTION public.user_has_permission IS 'Verifica si un usuario tiene un permiso específico (considerando permisos personalizados)';

-- =====================================================
-- FUNCIÓN: Obtener todos los permisos de un usuario
-- =====================================================

CREATE OR REPLACE FUNCTION public.get_user_permissions(p_user_id UUID)
RETURNS TABLE (
  permission_id UUID,
  permission_name VARCHAR,
  resource VARCHAR,
  action VARCHAR,
  source VARCHAR -- 'role' o 'custom'
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_role VARCHAR;
BEGIN
  -- Obtener el rol del usuario
  SELECT role INTO v_user_role
  FROM public.users
  WHERE id = p_user_id;

  -- Retornar permisos del rol + permisos personalizados
  RETURN QUERY
  SELECT DISTINCT
    p.id,
    p.name,
    p.resource,
    p.action,
    CASE
      WHEN up.id IS NOT NULL THEN 'custom'
      ELSE 'role'
    END AS source
  FROM public.permissions p
  LEFT JOIN public.user_permissions up ON up.permission_id = p.id AND up.user_id = p_user_id AND up.is_granted = TRUE
  WHERE
    -- Permisos del rol
    p.id IN (
      SELECT rp.permission_id
      FROM public.role_permissions rp
      JOIN public.roles r ON r.id = rp.role_id
      WHERE r.name = v_user_role
    )
    -- O permisos personalizados otorgados
    OR (up.id IS NOT NULL AND up.is_granted = TRUE)
  -- Excluir permisos personalizados revocados
  AND NOT EXISTS (
    SELECT 1
    FROM public.user_permissions up_revoked
    WHERE up_revoked.user_id = p_user_id
      AND up_revoked.permission_id = p.id
      AND up_revoked.is_granted = FALSE
  );
END;
$$;

COMMENT ON FUNCTION public.get_user_permissions IS 'Obtiene todos los permisos efectivos de un usuario (rol + personalizados)';

-- =====================================================
-- RLS POLICIES PARA TABLAS DE PERMISOS
-- =====================================================

-- Habilitar RLS
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_permissions ENABLE ROW LEVEL SECURITY;

-- Policies: Todos pueden leer permisos y roles
CREATE POLICY "permissions_select_all" ON public.permissions FOR SELECT USING (true);
CREATE POLICY "roles_select_all" ON public.roles FOR SELECT USING (true);
CREATE POLICY "role_permissions_select_all" ON public.role_permissions FOR SELECT USING (true);

-- Policies: Solo admins pueden modificar permisos y roles
CREATE POLICY "permissions_admin_only" ON public.permissions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "roles_admin_only" ON public.roles FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

CREATE POLICY "role_permissions_admin_only" ON public.role_permissions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- Policies: user_permissions - los usuarios pueden ver sus propios permisos
CREATE POLICY "user_permissions_select_own" ON public.user_permissions FOR SELECT
USING (user_id = auth.uid() OR EXISTS (
  SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "user_permissions_admin_only" ON public.user_permissions FOR ALL
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE id = auth.uid() AND role = 'admin'
  )
);

-- =====================================================
-- ÍNDICES PARA RENDIMIENTO
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_permissions_resource ON public.permissions(resource);
CREATE INDEX IF NOT EXISTS idx_permissions_action ON public.permissions(action);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role_id ON public.role_permissions(role_id);
CREATE INDEX IF NOT EXISTS idx_role_permissions_permission_id ON public.role_permissions(permission_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_user_id ON public.user_permissions(user_id);
CREATE INDEX IF NOT EXISTS idx_user_permissions_permission_id ON public.user_permissions(permission_id);

-- =====================================================
-- FIN DEL SCRIPT
-- =====================================================

-- Verificación
SELECT 'Permisos creados: ' || COUNT(*)::TEXT FROM public.permissions;
SELECT 'Roles creados: ' || COUNT(*)::TEXT FROM public.roles;
SELECT 'Asignaciones de permisos: ' || COUNT(*)::TEXT FROM public.role_permissions;
