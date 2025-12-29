/**
 * Supabase Client Configuration
 * Connects to the real HAIDA database
 */
import { createClient } from '@supabase/supabase-js';

// Environment variables (set in .env or vercel.json)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || 'https://wdebyxvtunromsnkqbrd.supabase.co';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn('Supabase credentials not configured. Check your environment variables.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

// Database types based on HAIDA schema
export interface DbTenant {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo_url?: string;
  settings?: Record<string, any>;
  subscription_plan: string;
  subscription_status: string;
  created_at: string;
  updated_at: string;
}

export interface DbProject {
  id: string;
  tenant_id: string;
  name: string;
  description?: string;
  status: string;
  repository_url?: string;
  default_environment?: string;
  settings?: Record<string, any>;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DbTestSuite {
  id: string;
  project_id: string;
  name: string;
  description?: string;
  suite_type: string;
  priority: string;
  tags?: string[];
  is_active: boolean;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DbTestCase {
  id: string;
  test_suite_id: string;
  test_id: string;
  name: string;
  description?: string;
  test_type: string;
  component?: string;
  module?: string;
  preconditions?: string;
  expected_result?: string;
  priority: string;
  risk_level?: string;
  is_automated: boolean;
  status: string;
  tags?: string[];
  test_steps?: any;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface DbTestExecution {
  id: string;
  project_id: string;
  test_suite_id?: string;
  execution_name?: string;
  status: string;
  started_at?: string;
  completed_at?: string;
  duration_ms?: number;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  skipped_tests: number;
  triggered_by?: string;
  trigger_type: string;
  environment?: string;
  created_at: string;
}

export interface DbUser {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  role: string;
  tenant_id?: string;
  is_active: boolean;
  last_login_at?: string;
  created_at: string;
}

// Auth helpers
export const auth = {
  // Sign in with email and password
  signIn: async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  },

  // Sign up new user
  signUp: async (email: string, password: string, metadata?: { full_name?: string }) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata,
      },
    });
    return { data, error };
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  },

  // Get current user
  getUser: async () => {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();
    return { user, error };
  },

  // Get current session
  getSession: async () => {
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession();
    return { session, error };
  },

  // Password reset
  resetPassword: async (email: string) => {
    const { data, error } = await supabase.auth.resetPasswordForEmail(email);
    return { data, error };
  },

  // Listen to auth changes
  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return supabase.auth.onAuthStateChange(callback);
  },
};

// Data helpers
export const db = {
  // Tenants
  getTenants: async () => {
    const { data, error } = await supabase
      .from('tenants')
      .select('*')
      .order('created_at', { ascending: false });
    return { data: data as DbTenant[] | null, error };
  },

  // Projects
  getProjects: async (tenantId?: string) => {
    let query = supabase.from('projects').select('*').order('created_at', { ascending: false });

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query;
    return { data: data as DbProject[] | null, error };
  },

  getProject: async (projectId: string) => {
    const { data, error } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
    return { data: data as DbProject | null, error };
  },

  createProject: async (project: Partial<DbProject>) => {
    const { data, error } = await supabase.from('projects').insert(project).select().single();
    return { data: data as DbProject | null, error };
  },

  // Test Suites
  getTestSuites: async (projectId?: string) => {
    let query = supabase.from('test_suites').select('*').order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;
    return { data: data as DbTestSuite[] | null, error };
  },

  // Test Cases
  getTestCases: async (suiteId?: string) => {
    let query = supabase.from('test_cases').select('*').order('created_at', { ascending: false });

    if (suiteId) {
      query = query.eq('test_suite_id', suiteId);
    }

    const { data, error } = await query;
    return { data: data as DbTestCase[] | null, error };
  },

  createTestCase: async (testCase: Partial<DbTestCase>) => {
    const { data, error } = await supabase.from('test_cases').insert(testCase).select().single();
    return { data: data as DbTestCase | null, error };
  },

  updateTestCase: async (id: string, updates: Partial<DbTestCase>) => {
    const { data, error } = await supabase
      .from('test_cases')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    return { data: data as DbTestCase | null, error };
  },

  // Test Executions
  getTestExecutions: async (projectId?: string) => {
    let query = supabase
      .from('test_executions')
      .select('*')
      .order('created_at', { ascending: false });

    if (projectId) {
      query = query.eq('project_id', projectId);
    }

    const { data, error } = await query;
    return { data: data as DbTestExecution[] | null, error };
  },

  createTestExecution: async (execution: Partial<DbTestExecution>) => {
    const { data, error } = await supabase
      .from('test_executions')
      .insert(execution)
      .select()
      .single();
    return { data: data as DbTestExecution | null, error };
  },

  // Users
  getUsers: async (tenantId?: string) => {
    let query = supabase.from('users').select('*').order('created_at', { ascending: false });

    if (tenantId) {
      query = query.eq('tenant_id', tenantId);
    }

    const { data, error } = await query;
    return { data: data as DbUser[] | null, error };
  },

  // Project Health View
  getProjectHealth: async () => {
    const { data, error } = await supabase.from('v_project_health').select('*');
    return { data, error };
  },

  // Test Coverage View
  getTestCoverage: async () => {
    const { data, error } = await supabase.from('v_test_coverage').select('*');
    return { data, error };
  },
};

export default supabase;
