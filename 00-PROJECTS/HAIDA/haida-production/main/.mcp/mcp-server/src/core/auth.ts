/**
 * Authentication and authorization manager
 */

import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import type { MCPServerConfig, AuthContext } from '../types/index.js';
import { MCPError, ErrorType, Permission } from '../types/index.js';

const ROLE_PERMISSIONS: Record<string, Set<Permission>> = {
  admin: new Set(Object.values(Permission)),
  qa_engineer: new Set([
    Permission.VIEW_PROJECTS,
    Permission.VIEW_EXECUTIONS,
    Permission.VIEW_REPORTS,
    Permission.CREATE_PROJECTS,
    Permission.EXECUTE_TESTS,
    Permission.MODIFY_TESTS,
  ]),
  developer: new Set([
    Permission.VIEW_PROJECTS,
    Permission.VIEW_EXECUTIONS,
    Permission.VIEW_REPORTS,
    Permission.EXECUTE_TESTS,
  ]),
  viewer: new Set([
    Permission.VIEW_PROJECTS,
    Permission.VIEW_EXECUTIONS,
    Permission.VIEW_REPORTS,
  ]),
};

export class AuthManager {
  private supabase;
  private jwtSecret: string;

  constructor(config: MCPServerConfig) {
    this.supabase = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey || config.supabase.anonKey
    );
    this.jwtSecret = config.auth.jwtSecret;
  }

  async validateToken(token: string): Promise<AuthContext> {
    try {
      // Verify JWT
      const payload = jwt.verify(token, this.jwtSecret) as any;

      // Load user from database
      const { data: user, error } = await this.supabase
        .from('users')
        .select('*, tenants!inner(*)')
        .eq('id', payload.userId)
        .eq('is_active', true)
        .single();

      if (error || !user) {
        throw new MCPError(
          ErrorType.AUTH_ERROR,
          'INVALID_TOKEN',
          'Invalid or expired token',
          error?.message
        );
      }

      // Build auth context
      return {
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          tenant_id: user.tenant_id,
          is_active: user.is_active,
          metadata: user.metadata,
        },
        tenant: {
          id: user.tenants.id,
          name: user.tenants.name,
          slug: user.tenants.slug,
          is_active: user.tenants.is_active,
          settings: user.tenants.settings,
        },
        permissions: ROLE_PERMISSIONS[user.role] || new Set(),
      };
    } catch (error) {
      if (error instanceof MCPError) {
        throw error;
      }

      throw new MCPError(
        ErrorType.AUTH_ERROR,
        'AUTH_FAILED',
        'Authentication failed',
        (error as Error).message
      );
    }
  }

  async validateApiKey(_apiKey: string): Promise<AuthContext> {
    // TODO: Implement API key validation
    throw new MCPError(
      ErrorType.AUTH_ERROR,
      'NOT_IMPLEMENTED',
      'API key authentication not yet implemented'
    );
  }

  authorize(context: AuthContext, permission: Permission): boolean {
    return context.permissions.has(permission);
  }

  requirePermission(context: AuthContext, permission: Permission): void {
    if (!this.authorize(context, permission)) {
      throw new MCPError(
        ErrorType.AUTH_ERROR,
        'INSUFFICIENT_PERMISSIONS',
        `Missing required permission: ${permission}`,
        `User ${context.user.email} lacks permission: ${permission}`
      );
    }
  }
}
