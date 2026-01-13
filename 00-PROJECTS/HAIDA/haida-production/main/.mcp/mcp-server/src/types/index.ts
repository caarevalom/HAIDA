/**
 * HAIDA MCP Server - Type Definitions
 * Enterprise-grade type system for MCP server
 */

import { z } from 'zod';

// ============================================================================
// Configuration Types
// ============================================================================

export interface MCPServerConfig {
  name: string;
  version: string;
  environment: 'development' | 'staging' | 'production';
  port: number;

  // External services
  fastapi: {
    baseUrl: string;
    timeout: number;
  };

  supabase: {
    url: string;
    anonKey: string;
    serviceRoleKey?: string;
  };

  redis: {
    url: string;
    ttl: {
      projects: number;
      executions: number;
      reports: number;
      docs: number;
    };
  };

  auth: {
    jwtSecret: string;
    jwtExpiration: number;
  };

  rateLimit: {
    global: { points: number; duration: number };
    perUser: { points: number; duration: number };
    perTool: Record<string, { points: number; duration: number }>;
  };

  logging: {
    level: 'error' | 'warn' | 'info' | 'debug' | 'trace';
    pretty: boolean;
  };
}

// ============================================================================
// Authentication & Authorization
// ============================================================================

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'qa_engineer' | 'developer' | 'viewer';
  tenant_id: string;
  is_active: boolean;
  metadata?: Record<string, unknown>;
}

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  is_active: boolean;
  settings?: Record<string, unknown>;
}

export interface AuthContext {
  user: User;
  tenant: Tenant;
  permissions: Set<Permission>;
}

export enum Permission {
  VIEW_PROJECTS = 'view_projects',
  VIEW_EXECUTIONS = 'view_executions',
  VIEW_REPORTS = 'view_reports',
  CREATE_PROJECTS = 'create_projects',
  EXECUTE_TESTS = 'execute_tests',
  MODIFY_TESTS = 'modify_tests',
  DELETE_TESTS = 'delete_tests',
  MANAGE_USERS = 'manage_users',
  CONFIGURE_SYSTEM = 'configure_system',
}

// ============================================================================
// HAIDA Domain Models
// ============================================================================

export interface Project {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  base_url: string | null;
  repository_url: string | null;
  status: 'active' | 'archived' | 'maintenance';
  owner_id: string;
  tenant_id: string;
  created_at: Date;
  updated_at: Date;
  settings?: Record<string, unknown>;
}

export interface TestSuite {
  id: string;
  project_id: string;
  name: string;
  description: string | null;
  suite_type: 'smoke' | 'regression' | 'integration' | 'e2e' | 'api' | 'performance' | 'accessibility' | 'security';
  priority: 'critical' | 'high' | 'medium' | 'low';
  tags: string[];
  is_active: boolean;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface TestCase {
  id: string;
  test_suite_id: string;
  test_id: string;
  name: string;
  description: string | null;
  test_type: string;
  component: string | null;
  module: string | null;
  requirement_ids: string[];
  preconditions: string | null;
  test_steps: string | null;
  expected_result: string | null;
  priority: 'critical' | 'high' | 'medium' | 'low';
  risk_level: 'high' | 'medium' | 'low';
  is_automated: boolean;
  automation_script_path: string | null;
  automation_framework: string | null;
  status: 'active' | 'deprecated' | 'draft';
  tags: string[];
  created_at: Date;
  updated_at: Date;
}

export interface TestExecution {
  id: string;
  project_id: string;
  change_detection_id: string | null;
  execution_type: 'manual' | 'scheduled' | 'webhook_triggered' | 'ci_cd';
  trigger_source: string | null;
  environment: 'production' | 'staging' | 'qa' | 'dev';
  browser: string | null;
  platform: string | null;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  started_at: Date | null;
  completed_at: Date | null;
  duration_ms: number | null;
  total_tests: number;
  passed_tests: number;
  failed_tests: number;
  skipped_tests: number;
  allure_report_url: string | null;
  playwright_report_url: string | null;
  artifacts_path: string | null;
  triggered_by: string;
  metadata?: Record<string, unknown>;
}

export interface TestResult {
  id: string;
  test_execution_id: string;
  test_case_id: string | null;
  test_name: string;
  test_file: string | null;
  test_id_ref: string | null;
  status: 'passed' | 'failed' | 'skipped' | 'flaky';
  error_message: string | null;
  error_stack: string | null;
  duration_ms: number;
  retries: number;
  screenshot_url: string | null;
  video_url: string | null;
  trace_url: string | null;
  logs: string | null;
  assertions_passed: number;
  assertions_failed: number;
  started_at: Date;
  completed_at: Date;
}

export interface ChangeDetection {
  id: string;
  project_id: string;
  url: string;
  tag: string | null;
  change_type: 'html' | 'css' | 'javascript' | 'api' | 'visual';
  previous_md5: string | null;
  current_md5: string;
  diff_summary: string | null;
  webhook_payload: Record<string, unknown> | null;
  selected_test_profile: string | null;
  test_suite_ids: string[];
  status: 'pending' | 'processing' | 'completed' | 'failed';
  processed_at: Date | null;
  detected_at: Date;
  created_at: Date;
}

export interface Report {
  id: string;
  project_id: string;
  type: 'execution_summary' | 'test_coverage' | 'trends' | 'performance';
  title: string;
  description: string | null;
  date_range_start: Date | null;
  date_range_end: Date | null;
  format: 'html' | 'pdf' | 'json' | 'csv';
  file_path: string | null;
  file_size_bytes: number | null;
  generated_at: Date;
  generated_by: string;
  is_public: boolean;
  metadata?: Record<string, unknown>;
}

// ============================================================================
// MCP Resource Types
// ============================================================================

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
  text?: string;
  blob?: string;
}

// ============================================================================
// MCP Tool Types
// ============================================================================

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: z.ZodSchema;
}

export interface ToolResult<T = unknown> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: string;
    retryable?: boolean;
  };
}

// ============================================================================
// MCP Prompt Types
// ============================================================================

export interface MCPPrompt {
  name: string;
  description: string;
  arguments: z.ZodSchema;
}

export interface PromptMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
}

// ============================================================================
// Error Types
// ============================================================================

export enum ErrorType {
  CLIENT_ERROR = 'client_error',
  SERVER_ERROR = 'server_error',
  NETWORK_ERROR = 'network_error',
  TIMEOUT_ERROR = 'timeout_error',
  AUTH_ERROR = 'auth_error',
  RATE_LIMIT_ERROR = 'rate_limit',
  NOT_FOUND_ERROR = 'not_found',
}

export class MCPError extends Error {
  constructor(
    public type: ErrorType,
    public code: string,
    message: string,
    public details?: string,
    public retryable: boolean = false
  ) {
    super(message);
    this.name = 'MCPError';
  }
}

// ============================================================================
// Cache Types
// ============================================================================

export interface CacheEntry<T> {
  value: T;
  expiry: number;
  tags: string[];
}

export interface CacheConfig {
  ttl: number;
  tags: string[];
}

// ============================================================================
// Health Check Types
// ============================================================================

export interface HealthStatus {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: Date;
  uptime: number;
  version: string;
  checks: {
    database: CheckResult;
    redis: CheckResult;
    fastapi: CheckResult;
  };
  metrics: {
    requestsPerMinute: number;
    averageLatency: number;
    errorRate: number;
    cacheHitRate: number;
  };
}

export interface CheckResult {
  status: 'pass' | 'fail';
  message?: string;
  responseTime?: number;
}

// ============================================================================
// Metrics Types
// ============================================================================

export interface Metrics {
  requests: {
    total: number;
    perMinute: number;
    byTool: Record<string, number>;
    byResource: Record<string, number>;
  };
  latency: {
    average: number;
    p50: number;
    p95: number;
    p99: number;
  };
  errors: {
    total: number;
    rate: number;
    byType: Record<ErrorType, number>;
  };
  cache: {
    hits: number;
    misses: number;
    hitRate: number;
  };
}
