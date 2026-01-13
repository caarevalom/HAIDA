/**
 * Authentication Context - HAIDA Hybrid Auth
 * Supports both FastAPI backend auth and Supabase Microsoft SSO
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User, storage } from './apiService';
import { supabase } from './supabase';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    fullName?: string,
    role?: string
  ) => Promise<{ success: boolean; error?: string; notice?: string }>;
  signInWithMicrosoft: () => Promise<{ success: boolean; error?: string }>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
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
        const params = new URLSearchParams(window.location.search);
        const code = params.get('code');
        const state = params.get('state');
        const errorParam = params.get('error');

        if (errorParam) {
          setError(`Microsoft login error: ${errorParam}`);
          window.history.replaceState({}, document.title, window.location.pathname);
          return;
        }

        if (code && state) {
          try {
            const response = await authApi.microsoftCallback(code, state);
            if (response.user) {
              setUser(response.user as User);
            }
          } catch (err: any) {
            const message = err?.detail || err?.message || 'Microsoft login failed';
            setError(message);
          } finally {
            window.history.replaceState({}, document.title, window.location.pathname);
          }
          return;
        }

        const storedToken = storage.getToken();
        const storedUser = storage.getUser();
        if (storedToken && storedUser) {
          setUser(storedUser);
          return;
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
      const storedToken = storage.getToken();
      if (!storedToken) {
        storage.clear();
        setUser(null);
        return;
      }

      const userData = await authApi.getCurrentUser();
      setUser(userData);
      storage.setUser(userData);
    } catch (err) {
      console.error('Failed to refresh user:', err);
      storage.clear();
      setUser(null);
    }
  };

  const signIn = async (
    email: string,
    password: string,
    rememberMe: boolean = false
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.login({ email, password });

      if (response.user) {
        setUser(response.user as User);
      }

      if (rememberMe) {
        localStorage.setItem('haida_remember_me', 'true');
      } else {
        localStorage.removeItem('haida_remember_me');
      }

      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.detail || err?.message || 'Authentication failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName?: string,
    role?: string
  ): Promise<{ success: boolean; error?: string; notice?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.register({
        email,
        password,
        full_name: fullName || email,
        role: role || 'viewer',
      });

      if (response.user) {
        setUser(response.user as User);
      }

      return { success: true, notice: 'Account created' };
    } catch (err: any) {
      const errorMessage = err?.detail || err?.message || 'Registration failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signInWithMicrosoft = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await authApi.microsoftLogin();
      if (!response?.auth_url) {
        setError('Microsoft login not configured');
        return { success: false, error: 'Microsoft login not configured' };
      }

      window.location.href = response.auth_url;
      return { success: true };
    } catch (err: any) {
      const errorMessage = err?.detail || err?.message || 'Microsoft sign-in failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (email: string): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      setError(null);

      // Use Supabase password reset
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Password reset failed';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      await supabase.auth.signOut();
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
    isAuthenticated: !!user,
    error,
    signIn,
    signUp,
    signInWithMicrosoft,
    resetPassword,
    signOut,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;
