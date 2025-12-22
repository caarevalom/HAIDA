/**
 * Protected Route Component
 * Redirects to login if user is not authenticated
 */
import { useEffect } from 'react';
import { useAuth } from '../lib/auth-context';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'qa_engineer' | 'developer' | 'viewer';
  onUnauthorized?: () => void;
}

export function ProtectedRoute({
  children,
  requiredRole,
  onUnauthorized
}: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // User is not authenticated, trigger redirect
      onUnauthorized?.();
    }
  }, [isAuthenticated, isLoading, onUnauthorized]);

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, don't render children
  if (!isAuthenticated) {
    return null;
  }

  // Check role-based access
  if (requiredRole && user) {
    const roleHierarchy: Record<string, number> = {
      'viewer': 1,
      'developer': 2,
      'qa_engineer': 3,
      'admin': 4
    };

    const userRoleLevel = roleHierarchy[user.role] || 0;
    const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

    if (userRoleLevel < requiredRoleLevel) {
      return (
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-destructive mb-2">Access Denied</h2>
            <p className="text-muted-foreground">
              You don't have permission to access this page.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Required role: {requiredRole} | Your role: {user.role}
            </p>
          </div>
        </div>
      );
    }
  }

  return <>{children}</>;
}
