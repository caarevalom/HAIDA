/**
 * Authentication Context - HAIDA FastAPI Backend
 * Manages user authentication state with HAIDA API
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User, ApiError, storage } from './apiService';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName?: string, role?: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      try {
        const token = storage.getToken();
        const storedUser = storage.getStoredUser();

        if (token && storedUser) {
          try {
            const currentUser = await authApi.getCurrentUser();
            setUser(currentUser);
            storage.setUser(currentUser);
          } catch (err) {
            console.error('Token validation failed:', err);
            storage.clear();
            setUser(null);
          }
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize authentication');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  const refreshUser = async () => {
    try {
      const currentUser = await authApi.getCurrentUser();
      setUser(currentUser);
      storage.setUser(currentUser);
    } catch (err) {
      console.error('Failed to refresh user:', err);
      storage.clear();
      setUser(null);
    }
  };

  const signIn = async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login({ email, password });
      if (response.user) {
        setUser(response.user as User);
      } else {
        await refreshUser();
      }
      return { success: true };
    } catch (err: any) {
      const apiError = err as ApiError;
      const errorMessage = apiError.detail || 'Authentication failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string, fullName?: string, role?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.register({ email, password, full_name: fullName, role: (role || 'viewer') as any });
      if (response.user) {
        setUser(response.user as User);
      } else {
        await refreshUser();
      }
      return { success: true };
    } catch (err: any) {
      const apiError = err as ApiError;
      const errorMessage = apiError.detail || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await authApi.logout();
    } catch (err) {
      console.error('Sign out error:', err);
    } finally {
      setUser(null);
      setIsLoading(false);
    }
  };

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user && authApi.isAuthenticated(),
    error,
    signIn,
    signUp,
    signOut,
    refreshUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
