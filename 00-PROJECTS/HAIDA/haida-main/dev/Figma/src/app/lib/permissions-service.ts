/**
 * Servicio para gestionar permisos y roles en HAIDA
 */

import { supabase } from './supabase';
import type {
  Permission,
  Role,
  RolePermission,
  UserPermission,
  User,
  UserWithPermissions,
  PermissionName
} from './permissions-types';

class PermissionsService {
  /**
   * Obtener todos los permisos
   */
  async getPermissions() {
    const { data, error } = await supabase
      .from('permissions')
      .select('*')
      .order('resource, action');

    if (error) throw error;
    return data as Permission[];
  }

  /**
   * Obtener todos los roles
   */
  async getRoles() {
    const { data, error } = await supabase
      .from('roles')
      .select('*')
      .order('name');

    if (error) throw error;
    return data as Role[];
  }

  /**
   * Obtener permisos de un rol
   */
  async getRolePermissions(roleId: string) {
    const { data, error } = await supabase
      .from('role_permissions')
      .select(`
        *,
        permission:permissions (*)
      `)
      .eq('role_id', roleId);

    if (error) throw error;
    return data as RolePermission[];
  }

  /**
   * Obtener permisos de un rol por nombre
   */
  async getRolePermissionsByName(roleName: string) {
    // Primero obtener el rol
    const { data: role, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('name', roleName)
      .single();

    if (roleError) throw roleError;
    if (!role) throw new Error(`Role ${roleName} not found`);

    return this.getRolePermissions(role.id);
  }

  /**
   * Obtener todos los usuarios
   */
  async getUsers() {
    const { data, error } = await supabase
      .from('users')
      .select('*')
      .order('email');

    if (error) throw error;
    return data as User[];
  }

  /**
   * Obtener usuario con sus permisos
   */
  async getUserWithPermissions(userId: string): Promise<UserWithPermissions | null> {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError) throw userError;
    if (!user) return null;

    // Obtener permisos personalizados del usuario
    const { data: userPerms, error: userPermsError } = await supabase
      .from('user_permissions')
      .select(`
        *,
        permission:permissions (*)
      `)
      .eq('user_id', userId);

    if (userPermsError) throw userPermsError;

    // Obtener permisos efectivos (rol + personalizados)
    const { data: effectivePerms, error: effectiveError } = await supabase
      .rpc('get_user_permissions', { p_user_id: userId });

    if (effectiveError) {
      console.warn('Could not fetch effective permissions:', effectiveError);
    }

    return {
      ...user,
      permissions: userPerms as UserPermission[],
      effective_permissions: effectivePerms as Permission[]
    };
  }

  /**
   * Actualizar rol de un usuario
   */
  async updateUserRole(userId: string, newRole: string) {
    const { data, error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as User;
  }

  /**
   * Otorgar permiso personalizado a un usuario
   */
  async grantUserPermission(
    userId: string,
    permissionId: string,
    grantedBy?: string
  ) {
    const { data, error } = await supabase
      .from('user_permissions')
      .upsert([{
        user_id: userId,
        permission_id: permissionId,
        is_granted: true,
        granted_by: grantedBy
      }], {
        onConflict: 'user_id,permission_id'
      })
      .select()
      .single();

    if (error) throw error;
    return data as UserPermission;
  }

  /**
   * Revocar permiso personalizado de un usuario
   */
  async revokeUserPermission(
    userId: string,
    permissionId: string,
    grantedBy?: string
  ) {
    const { data, error } = await supabase
      .from('user_permissions')
      .upsert([{
        user_id: userId,
        permission_id: permissionId,
        is_granted: false,
        granted_by: grantedBy
      }], {
        onConflict: 'user_id,permission_id'
      })
      .select()
      .single();

    if (error) throw error;
    return data as UserPermission;
  }

  /**
   * Eliminar permiso personalizado de un usuario (quitar override)
   */
  async deleteUserPermission(userId: string, permissionId: string) {
    const { error } = await supabase
      .from('user_permissions')
      .delete()
      .eq('user_id', userId)
      .eq('permission_id', permissionId);

    if (error) throw error;
  }

  /**
   * Verificar si un usuario tiene un permiso específico
   */
  async userHasPermission(userId: string, permissionName: PermissionName): Promise<boolean> {
    try {
      const { data, error } = await supabase
        .rpc('user_has_permission', {
          p_user_id: userId,
          p_permission_name: permissionName
        });

      if (error) {
        console.error('Error checking permission:', error);
        return false;
      }

      return data === true;
    } catch (err) {
      console.error('Error in userHasPermission:', err);
      return false;
    }
  }

  /**
   * Crear nuevo usuario (registro admin)
   */
  async createUser(email: string, password: string, role: string, fullName: string) {
    // Crear usuario en auth.users
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: fullName,
        role
      }
    });

    if (authError) throw authError;

    // Crear en public.users (el trigger debería hacerlo, pero por si acaso)
    const { data: userData, error: userError } = await supabase
      .from('users')
      .upsert([{
        id: authData.user.id,
        email,
        full_name: fullName,
        role,
        is_active: true
      }], {
        onConflict: 'id'
      })
      .select()
      .single();

    if (userError) throw userError;

    return userData as User;
  }

  /**
   * Eliminar usuario
   */
  async deleteUser(userId: string) {
    // Eliminar de auth.users (esto eliminará en cascada de public.users)
    const { error } = await supabase.auth.admin.deleteUser(userId);
    if (error) throw error;
  }

  /**
   * Activar/desactivar usuario
   */
  async toggleUserActive(userId: string, isActive: boolean) {
    const { data, error } = await supabase
      .from('users')
      .update({ is_active: isActive })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as User;
  }

  /**
   * Actualizar información del usuario
   */
  async updateUser(userId: string, updates: Partial<User>) {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;
    return data as User;
  }
}

export const permissionsService = new PermissionsService();
