/**
 * Tipos TypeScript para el Sistema de Permisos de HAIDA
 */

export interface Permission {
  id: string;
  name: string;
  resource: string;
  action: string;
  description?: string;
  created_at: string;
}

export interface Role {
  id: string;
  name: string;
  display_name: string;
  description?: string;
  is_system_role: boolean;
  created_at: string;
  updated_at: string;
}

export interface RolePermission {
  id: string;
  role_id: string;
  permission_id: string;
  granted_at: string;
  granted_by?: string;
  permission?: Permission;
  role?: Role;
}

export interface UserPermission {
  id: string;
  user_id: string;
  permission_id: string;
  is_granted: boolean;
  granted_at: string;
  granted_by?: string;
  permission?: Permission;
}

export interface User {
  id: string;
  email: string;
  full_name?: string;
  role: string;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface UserWithPermissions extends User {
  permissions?: UserPermission[];
  effective_permissions?: Permission[];
}

// Recursos del sistema
export type Resource =
  | 'projects'
  | 'test_suites'
  | 'test_cases'
  | 'executions'
  | 'reports'
  | 'users'
  | 'settings';

// Acciones disponibles
export type Action =
  | 'create'
  | 'read'
  | 'update'
  | 'delete'
  | 'execute'
  | 'export'
  | 'manage'
  | 'manage_permissions';

// Nombres de permisos (para type-safety)
export type PermissionName =
  | 'projects.create'
  | 'projects.read'
  | 'projects.update'
  | 'projects.delete'
  | 'projects.manage'
  | 'test_suites.create'
  | 'test_suites.read'
  | 'test_suites.update'
  | 'test_suites.delete'
  | 'test_suites.execute'
  | 'test_cases.create'
  | 'test_cases.read'
  | 'test_cases.update'
  | 'test_cases.delete'
  | 'executions.read'
  | 'executions.delete'
  | 'reports.read'
  | 'reports.export'
  | 'reports.create'
  | 'users.create'
  | 'users.read'
  | 'users.update'
  | 'users.delete'
  | 'users.manage_permissions'
  | 'settings.read'
  | 'settings.update';

// Nombres de roles
export type RoleName = 'admin' | 'qa_engineer' | 'developer' | 'viewer';
