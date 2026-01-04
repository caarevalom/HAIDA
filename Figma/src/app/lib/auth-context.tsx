/**
 * Authentication Context - HAIDA Hybrid Auth
 * Supports both FastAPI backend auth and Supabase Microsoft SSO
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User, ApiError, storage } from './apiService';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for Microsoft OAuth
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wdebyxvtunromsnkqbrd.supabase.co';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxMzQzODYsImV4cCI6MjA0OTcxMDM4Nn0.wZ_3yV0gPOT-gG3vLRBt9Gv-VRgp7qfz8lJWr0YCcbM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);
const ENTRA_STATE_KEY = 'haida_entra_state';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (
    email: string,
    password: string,
    fullName?: string,
    role?: string
  ) => Promise<{ success: boolean; error?: string }>;
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
        const errorParam = params.get('error');
        const errorDescription = params.get('error_description');
        const stateParam = params.get('state');

        if (code || errorParam) {
          if (errorParam) {
            const message = decodeURIComponent(errorDescription || errorParam);
            setError(message);
            localStorage.removeItem(ENTRA_STATE_KEY);
            window.history.replaceState({}, document.title, window.location.origin);
            return;
          }

          const storedState = localStorage.getItem(ENTRA_STATE_KEY);
          const state = stateParam || storedState || undefined;
          const response = await authApi.microsoftCallback(code as string, state || undefined);
          if (response.user) {
            setUser(response.user as User);
          }
          if (state) {
            localStorage.removeItem(ENTRA_STATE_KEY);
          }
          window.history.replaceState({}, document.title, window.location.origin);
          return;
        }

        // Check for email/password auth token
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

  const signIn = async (
    email: string,
    password: string
  ): Promise<{ success: boolean; error?: string }> => {
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

  const signUp = async (
    email: string,
    password: string,
    fullName?: string,
    role?: string
  ): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await authApi.register({
        email,
        password,
        full_name: fullName,
        role: (role || 'viewer') as any,
      });
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

  const signInWithMicrosoft = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      setError(null);

      const login = await authApi.microsoftLogin();
      if (!login?.auth_url) {
        setError('Microsoft SSO is not configured');
        return { success: false, error: 'Microsoft SSO is not configured' };
      }

      if (login.state) {
        localStorage.setItem(ENTRA_STATE_KEY, login.state);
      }
      window.location.href = login.auth_url;
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message || 'Microsoft sign-in failed';
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
      // Sign out from Supabase if using Microsoft auth
      await supabase.auth.signOut();
      // Sign out from FastAPI
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
