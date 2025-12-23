/**
 * Authentication Context - HAIDA Hybrid Auth
 * Supports both FastAPI backend auth and Supabase Microsoft SSO
 */
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authApi, User, ApiError, storage } from './apiService';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client for Microsoft OAuth
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wdebyxvtunromsnkqbrd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndkZWJ5eHZ0dW5yb21zbmtxYnJkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQxMzQzODYsImV4cCI6MjA0OTcxMDM4Nn0.wZ_3yV0gPOT-gG3vLRBt9Gv-VRgp7qfz8lJWr0YCcbM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;

  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName?: string, role?: string) => Promise<{ success: boolean; error?: string }>;
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
        // Check for OAuth session from Supabase (Microsoft login)
        const { data: { session } } = await supabase.auth.getSession();

        if (session?.user) {
          // User logged in with Microsoft OAuth
          console.log('Microsoft OAuth session detected:', session.user.email);

          // Create/sync user in our backend
          try {
            // Try to get existing user from backend
            const currentUser = await authApi.getCurrentUser();
            setUser(currentUser);
            storage.setUser(currentUser);
          } catch (err) {
            // User doesn't exist in backend, create it
            console.log('Creating user from Microsoft OAuth session');
            // For now, we'll set a basic user object from Supabase data
            const oauthUser = {
              id: session.user.id,
              email: session.user.email || '',
              name: session.user.user_metadata?.full_name || session.user.email || 'Microsoft User',
              role: 'viewer',
              is_active: true,
              created_at: new Date().toISOString()
            };
            setUser(oauthUser);
            storage.setUser(oauthUser);
          }
        } else {
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
        }
      } catch (err) {
        console.error('Auth initialization error:', err);
        setError('Failed to initialize authentication');
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();

    // Listen for auth state changes from Supabase
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Supabase auth state changed:', event);

      if (event === 'SIGNED_IN' && session?.user) {
        // User signed in with Microsoft
        const oauthUser = {
          id: session.user.id,
          email: session.user.email || '',
          name: session.user.user_metadata?.full_name || session.user.email || 'Microsoft User',
          role: 'viewer',
          is_active: true,
          created_at: new Date().toISOString()
        };
        setUser(oauthUser);
        storage.setUser(oauthUser);
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        storage.clear();
      }
    });

    return () => {
      subscription.unsubscribe();
    };
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

  const signInWithMicrosoft = async (): Promise<{ success: boolean; error?: string }> => {
    try {
      setIsLoading(true);
      setError(null);

      // Use Supabase OAuth for Microsoft
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'azure',
        options: {
          redirectTo: `${window.location.origin}`,
          scopes: 'openid email profile'
        }
      });

      if (error) {
        setError(error.message);
        return { success: false, error: error.message };
      }

      // OAuth will redirect to Microsoft, then back to the app
      // The actual user creation happens in the callback
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
        redirectTo: `${window.location.origin}/reset-password`
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
