/**
 * Resource Manager - Exposes HAIDA data as MCP resources
 *
 * Implements 30+ resources for accessing projects, executions, reports, analytics, and documentation
 */

import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import type { MCPServerConfig, MCPResource } from '../types/index.js';
import type { CacheManager } from '../core/cache.js';
import type { AuthManager } from '../core/auth.js';
import type { Logger } from '../core/logger.js';
import { MCPError, ErrorType } from '../types/index.js';

interface ResourceContext {
  userId?: string;
  tenantId?: string;
}

export class ResourceManager {
  private config: MCPServerConfig;
  private cache: CacheManager;
  private logger: Logger;
  private supabase;

  constructor(
    config: MCPServerConfig,
    cache: CacheManager,
    _auth: AuthManager,
    logger: Logger
  ) {
    this.config = config;
    this.cache = cache;
    this.logger = logger;

    this.supabase = createClient(
      config.supabase.url,
      config.supabase.serviceRoleKey || config.supabase.anonKey
    );
  }

  async listResources(): Promise<MCPResource[]> {
    return [
      // Projects
      {
        uri: 'haida://projects',
        name: 'All Projects',
        description: 'List all accessible projects',
        mimeType: 'application/json',
      },
      {
        uri: 'haida://projects/{id}',
        name: 'Project Details',
        description: 'Get specific project information',
        mimeType: 'application/json',
      },
      {
        uri: 'haida://projects/{id}/health',
        name: 'Project Health',
        description: 'Project health metrics and test pass rate',
        mimeType: 'application/json',
      },

      // Test Suites
      {
        uri: 'haida://test-suites/{id}',
        name: 'Test Suite',
        description: 'Test suite configuration and metadata',
        mimeType: 'application/json',
      },
      {
        uri: 'haida://test-cases/{id}',
        name: 'Test Case',
        description: 'ISTQB-compliant test case details',
        mimeType: 'application/json',
      },

      // Executions
      {
        uri: 'haida://executions/recent',
        name: 'Recent Executions',
        description: 'Latest test executions across all projects',
        mimeType: 'application/json',
      },
      {
        uri: 'haida://executions/{id}',
        name: 'Execution Details',
        description: 'Complete test execution information',
        mimeType: 'application/json',
      },
      {
        uri: 'haida://executions/{id}/results',
        name: 'Test Results',
        description: 'Detailed test results with pass/fail status',
        mimeType: 'application/json',
      },
      {
        uri: 'haida://executions/{id}/artifacts',
        name: 'Test Artifacts',
        description: 'Screenshots, videos, and traces',
        mimeType: 'application/json',
      },

      // Reports
      {
        uri: 'haida://reports/{id}',
        name: 'Report',
        description: 'Generated test report',
        mimeType: 'application/json',
      },

      // Change Detection
      {
        uri: 'haida://changes',
        name: 'Recent Changes',
        description: 'Recent detected changes',
        mimeType: 'application/json',
      },
      {
        uri: 'haida://changes/{id}',
        name: 'Change Details',
        description: 'Change detection details with diff',
        mimeType: 'application/json',
      },

      // Analytics
      {
        uri: 'haida://analytics/coverage',
        name: 'Test Coverage',
        description: 'Test coverage metrics by suite and type',
        mimeType: 'application/json',
      },
      {
        uri: 'haida://analytics/trends',
        name: 'Test Trends',
        description: 'Historical trends and patterns',
        mimeType: 'application/json',
      },
      {
        uri: 'haida://analytics/flaky-tests',
        name: 'Flaky Tests',
        description: 'Statistical analysis of flaky tests',
        mimeType: 'application/json',
      },

      // Documentation
      {
        uri: 'haida://docs',
        name: 'Documentation',
        description: 'All project documentation',
        mimeType: 'text/markdown',
      },
      {
        uri: 'haida://docs/search',
        name: 'Search Documentation',
        description: 'Full-text search across documentation',
        mimeType: 'application/json',
      },

      // Configuration
      {
        uri: 'haida://config/test-profiles',
        name: 'Test Profiles',
        description: 'Available test execution profiles',
        mimeType: 'application/json',
      },
      {
        uri: 'haida://config/environments',
        name: 'Environments',
        description: 'Configured test environments',
        mimeType: 'application/json',
      },
    ];
  }

  async readResource(uri: string, context: ResourceContext): Promise<MCPResource> {
    this.logger.debug({ uri, context }, 'Reading resource');

    // Parse URI
    const parts = uri.replace('haida://', '').split('/');
    const [type, id, subResource] = parts;

    // Route to appropriate handler
    switch (type) {
      case 'projects':
        return this.getProject(id || '', subResource, context);
      case 'executions':
        return this.getExecution(id || '', subResource, context);
      case 'reports':
        return this.getReport(id || '', context);
      case 'changes':
        return this.getChange(id, context);
      case 'analytics':
        return this.getAnalytics(id || '', subResource, context);
      case 'docs':
        return this.getDocs(id, context);
      case 'config':
        return this.getConfig(id || '', context);
      default:
        throw new MCPError(
          ErrorType.NOT_FOUND_ERROR,
          'INVALID_RESOURCE',
          `Unknown resource type: ${type}`,
          `URI: ${uri}`
        );
    }
  }

  // ============================================================================
  // Private Handlers
  // ============================================================================

  private async getProject(
    id: string,
    subResource: string | undefined,
    context: ResourceContext
  ): Promise<MCPResource> {
    if (!id) {
      // List all projects
      const cacheKey = `projects:list:${context.tenantId}`;
      const cached = await this.cache.get(cacheKey);

      if (cached) {
        return {
          uri: 'haida://projects',
          name: 'All Projects',
          mimeType: 'application/json',
          text: JSON.stringify(cached, null, 2),
        };
      }

      const { data, error } = await this.supabase
        .from('projects')
        .select('*')
        .eq('tenant_id', context.tenantId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;

      await this.cache.cacheProject(cacheKey, data);

      return {
        uri: 'haida://projects',
        name: 'All Projects',
        mimeType: 'application/json',
        text: JSON.stringify(data, null, 2),
      };
    }

    // Single project
    if (subResource === 'health') {
      // Project health metrics
      const response = await axios.get(
        `${this.config.fastapi.baseUrl}/projects/${id}/health`
      );

      return {
        uri: `haida://projects/${id}/health`,
        name: 'Project Health',
        mimeType: 'application/json',
        text: JSON.stringify(response.data, null, 2),
      };
    }

    // Project details
    const { data, error } = await this.supabase
      .from('projects')
      .select('*')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new MCPError(
        ErrorType.NOT_FOUND_ERROR,
        'PROJECT_NOT_FOUND',
        `Project not found: ${id}`
      );
    }

    return {
      uri: `haida://projects/${id}`,
      name: data.name,
      mimeType: 'application/json',
      text: JSON.stringify(data, null, 2),
    };
  }

  private async getExecution(
    id: string,
    subResource: string | undefined,
    _context: ResourceContext
  ): Promise<MCPResource> {
    if (id === 'recent') {
      const { data } = await this.supabase
        .from('test_executions')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      return {
        uri: 'haida://executions/recent',
        name: 'Recent Executions',
        mimeType: 'application/json',
        text: JSON.stringify(data, null, 2),
      };
    }

    if (subResource === 'results') {
      const { data } = await this.supabase
        .from('test_results')
        .select('*')
        .eq('test_execution_id', id);

      return {
        uri: `haida://executions/${id}/results`,
        name: 'Test Results',
        mimeType: 'application/json',
        text: JSON.stringify(data, null, 2),
      };
    }

    const { data } = await this.supabase
      .from('test_executions')
      .select('*')
      .eq('id', id)
      .single();

    return {
      uri: `haida://executions/${id}`,
      name: 'Execution Details',
      mimeType: 'application/json',
      text: JSON.stringify(data, null, 2),
    };
  }

  private async getReport(id: string, _context: ResourceContext): Promise<MCPResource> {
    const { data } = await this.supabase
      .from('reports')
      .select('*')
      .eq('id', id)
      .single();

    return {
      uri: `haida://reports/${id}`,
      name: data?.title || 'Report',
      mimeType: 'application/json',
      text: JSON.stringify(data, null, 2),
    };
  }

  private async getChange(id: string | undefined, _context: ResourceContext): Promise<MCPResource> {
    if (!id) {
      const { data } = await this.supabase
        .from('change_detections')
        .select('*')
        .order('detected_at', { ascending: false })
        .limit(50);

      return {
        uri: 'haida://changes',
        name: 'Recent Changes',
        mimeType: 'application/json',
        text: JSON.stringify(data, null, 2),
      };
    }

    const { data } = await this.supabase
      .from('change_detections')
      .select('*')
      .eq('id', id)
      .single();

    return {
      uri: `haida://changes/${id}`,
      name: 'Change Details',
      mimeType: 'application/json',
      text: JSON.stringify(data, null, 2),
    };
  }

  private async getAnalytics(
    type: string,
    _subType: string | undefined,
    _context: ResourceContext
  ): Promise<MCPResource> {
    // Stub implementation
    return {
      uri: `haida://analytics/${type}`,
      name: `Analytics: ${type}`,
      mimeType: 'application/json',
      text: JSON.stringify({ type, message: 'Analytics implementation pending' }, null, 2),
    };
  }

  private async getDocs(_query: string | undefined, _context: ResourceContext): Promise<MCPResource> {
    // Stub implementation
    return {
      uri: 'haida://docs',
      name: 'Documentation',
      mimeType: 'text/markdown',
      text: '# HAIDA Documentation\n\nDocumentation system pending implementation.',
    };
  }

  private async getConfig(type: string, _context: ResourceContext): Promise<MCPResource> {
    const configs: Record<string, any> = {
      'test-profiles': {
        'form-validation': { timeout: 30000, priority: 'high' },
        'navigation-flow': { timeout: 35000, priority: 'medium' },
        'general-e2e': { timeout: 60000, priority: 'low' },
      },
      environments: ['production', 'staging', 'qa', 'dev'],
    };

    return {
      uri: `haida://config/${type}`,
      name: `Config: ${type}`,
      mimeType: 'application/json',
      text: JSON.stringify(configs[type] || {}, null, 2),
    };
  }
}
