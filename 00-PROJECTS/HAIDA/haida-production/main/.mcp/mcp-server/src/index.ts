#!/usr/bin/env node
/**
 * HAIDA MCP Server - Main Entry Point
 * Enterprise-grade Model Context Protocol server for HAIDA QA Automation
 *
 * Version: 1.0.0
 * Author: HAIDA Team
 *
 * This server exposes HAIDA's complete QA automation capabilities through
 * the Model Context Protocol, providing:
 * - 50+ tools for test management and execution
 * - 30+ resources for data access
 * - 20+ AI-powered prompts
 * - Enterprise-grade security, caching, and monitoring
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  ListToolsRequestSchema,
  CallToolRequestSchema,
  ListResourcesRequestSchema,
  ReadResourceRequestSchema,
  ListPromptsRequestSchema,
  GetPromptRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';

import { loadConfig } from './core/config.js';
import { createLogger } from './core/logger.js';
import { AuthManager } from './core/auth.js';
import { CacheManager } from './core/cache.js';
import { ErrorHandler } from './core/error-handler.js';
import { RateLimiter } from './core/rate-limiter.js';
import { HealthMonitor } from './core/health-monitor.js';
import { MetricsCollector } from './core/metrics.js';

import { ResourceManager } from './resources/index.js';
import { ToolOrchestrator } from './tools/index.js';
import { PromptEngine } from './prompts/index.js';

// ============================================================================
// Server Initialization
// ============================================================================

async function main() {
  // Load configuration
  const config = loadConfig();
  const logger = createLogger(config.logging);

  logger.info({
    msg: 'Starting HAIDA MCP Server',
    version: config.version,
    environment: config.environment,
  });

  // Initialize core components
  const authManager = new AuthManager(config);
  const cacheManager = new CacheManager(config);
  const errorHandler = new ErrorHandler(logger);
  const rateLimiter = new RateLimiter(config);
  const healthMonitor = new HealthMonitor(config, logger);
  const metricsCollector = new MetricsCollector();

  // Initialize managers
  const resourceManager = new ResourceManager(config, cacheManager, authManager, logger);
  const toolOrchestrator = new ToolOrchestrator(config, cacheManager, authManager, rateLimiter, logger);
  const promptEngine = new PromptEngine(config, resourceManager, logger);

  // Create MCP server
  const server = new Server(
    {
      name: config.name,
      version: config.version,
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    }
  );

  // ============================================================================
  // Tool Handlers
  // ============================================================================

  server.setRequestHandler(ListToolsRequestSchema, async () => {
    metricsCollector.recordRequest('list_tools');

    try {
      const tools = await toolOrchestrator.listTools();
      return { tools };
    } catch (error) {
      errorHandler.handle(error as Error);
      throw error;
    }
  });

  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    metricsCollector.recordRequest(`tool.${name}`);

    const startTime = Date.now();

    try {
      // Rate limiting
      await rateLimiter.checkLimit(`tool.${name}`, undefined);

      // Execute tool
      const result = await toolOrchestrator.executeTool(name, args, {
        userId: undefined,
        tenantId: undefined,
      });

      metricsCollector.recordLatency(Date.now() - startTime);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    } catch (error) {
      metricsCollector.recordError((error as Error).name);
      const mcpError = errorHandler.handle(error as Error);

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify({
              error: {
                code: mcpError.code,
                message: mcpError.message,
                details: mcpError.details,
                retryable: mcpError.retryable,
              },
            }, null, 2),
          },
        ],
        isError: true,
      };
    }
  });

  // ============================================================================
  // Resource Handlers
  // ============================================================================

  server.setRequestHandler(ListResourcesRequestSchema, async () => {
    metricsCollector.recordRequest('list_resources');

    try {
      const resources = await resourceManager.listResources();
      return { resources };
    } catch (error) {
      errorHandler.handle(error as Error);
      throw error;
    }
  });

  server.setRequestHandler(ReadResourceRequestSchema, async (request) => {
    const { uri } = request.params;
    metricsCollector.recordRequest(`resource.${uri}`);

    const startTime = Date.now();

    try {
      const resource = await resourceManager.readResource(uri, {
        userId: undefined,
        tenantId: undefined,
      });

      metricsCollector.recordLatency(Date.now() - startTime);
      metricsCollector.recordCacheHit(false); // TODO: implement cache detection

      return { contents: [resource] };
    } catch (error) {
      metricsCollector.recordError((error as Error).name);
      const mcpError = errorHandler.handle(error as Error);
      throw mcpError;
    }
  });

  // ============================================================================
  // Prompt Handlers
  // ============================================================================

  server.setRequestHandler(ListPromptsRequestSchema, async () => {
    metricsCollector.recordRequest('list_prompts');

    try {
      const prompts = await promptEngine.listPrompts();
      return { prompts };
    } catch (error) {
      errorHandler.handle(error as Error);
      throw error;
    }
  });

  server.setRequestHandler(GetPromptRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    metricsCollector.recordRequest(`prompt.${name}`);

    const startTime = Date.now();

    try {
      const prompt = await promptEngine.getPrompt(name, args || {}, {
        userId: undefined,
        tenantId: undefined,
      });

      metricsCollector.recordLatency(Date.now() - startTime);

      return {
        description: prompt.description,
        messages: prompt.messages,
      };
    } catch (error) {
      metricsCollector.recordError((error as Error).name);
      const mcpError = errorHandler.handle(error as Error);
      throw mcpError;
    }
  });

  // ============================================================================
  // Server Lifecycle
  // ============================================================================

  // Start health monitoring
  healthMonitor.start();

  // Graceful shutdown
  process.on('SIGINT', async () => {
    logger.info('Received SIGINT, shutting down gracefully...');

    healthMonitor.stop();
    await cacheManager.disconnect();

    logger.info('Shutdown complete');
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    logger.info('Received SIGTERM, shutting down gracefully...');

    healthMonitor.stop();
    await cacheManager.disconnect();

    logger.info('Shutdown complete');
    process.exit(0);
  });

  // Handle uncaught errors
  process.on('uncaughtException', (error) => {
    logger.fatal({ error }, 'Uncaught exception');
    process.exit(1);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.fatal({ reason, promise }, 'Unhandled rejection');
    process.exit(1);
  });

  // Start server
  const transport = new StdioServerTransport();
  await server.connect(transport);

  logger.info({
    msg: 'HAIDA MCP Server started successfully',
    pid: process.pid,
    tools: (await toolOrchestrator.listTools()).length,
    resources: (await resourceManager.listResources()).length,
    prompts: (await promptEngine.listPrompts()).length,
  });
}

// ============================================================================
// Execute
// ============================================================================

main().catch((error) => {
  console.error('Fatal error starting HAIDA MCP Server:', error);
  process.exit(1);
});
