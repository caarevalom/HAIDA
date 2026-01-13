/**
 * Configuration loader with validation and defaults
 */

import { config } from 'dotenv';
import { z } from 'zod';
import type { MCPServerConfig } from '../types/index.js';

// Load environment variables
config();

// Environment schema validation
const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  PORT: z.string().transform(Number).default('3000'),
  LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug', 'trace']).default('info'),
  LOG_PRETTY: z.string().transform(v => v === 'true').default('false'),

  FASTAPI_BASE_URL: z.string().url(),
  FASTAPI_TIMEOUT: z.string().transform(Number).default('30000'),

  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),

  REDIS_URL: z.string().default('redis://localhost:6379'),
  REDIS_TTL_PROJECTS: z.string().transform(Number).default('300'),
  REDIS_TTL_EXECUTIONS: z.string().transform(Number).default('60'),
  REDIS_TTL_REPORTS: z.string().transform(Number).default('7200'),
  REDIS_TTL_DOCS: z.string().transform(Number).default('86400'),

  JWT_SECRET: z.string().min(32),
  JWT_EXPIRATION: z.string().transform(Number).default('3600'),

  RATE_LIMIT_GLOBAL_POINTS: z.string().transform(Number).default('10000'),
  RATE_LIMIT_GLOBAL_DURATION: z.string().transform(Number).default('60'),
  RATE_LIMIT_USER_POINTS: z.string().transform(Number).default('100'),
  RATE_LIMIT_USER_DURATION: z.string().transform(Number).default('60'),
});

export function loadConfig(): MCPServerConfig {
  const env = EnvSchema.parse(process.env);

  return {
    name: 'haida-mcp-server',
    version: '1.0.0',
    environment: env.NODE_ENV,
    port: env.PORT,

    fastapi: {
      baseUrl: env.FASTAPI_BASE_URL,
      timeout: env.FASTAPI_TIMEOUT,
    },

    supabase: env.SUPABASE_SERVICE_ROLE_KEY
      ? {
          url: env.SUPABASE_URL,
          anonKey: env.SUPABASE_ANON_KEY,
          serviceRoleKey: env.SUPABASE_SERVICE_ROLE_KEY,
        }
      : {
          url: env.SUPABASE_URL,
          anonKey: env.SUPABASE_ANON_KEY,
        },

    redis: {
      url: env.REDIS_URL,
      ttl: {
        projects: env.REDIS_TTL_PROJECTS,
        executions: env.REDIS_TTL_EXECUTIONS,
        reports: env.REDIS_TTL_REPORTS,
        docs: env.REDIS_TTL_DOCS,
      },
    },

    auth: {
      jwtSecret: env.JWT_SECRET,
      jwtExpiration: env.JWT_EXPIRATION,
    },

    rateLimit: {
      global: {
        points: env.RATE_LIMIT_GLOBAL_POINTS,
        duration: env.RATE_LIMIT_GLOBAL_DURATION,
      },
      perUser: {
        points: env.RATE_LIMIT_USER_POINTS,
        duration: env.RATE_LIMIT_USER_DURATION,
      },
      perTool: {
        run_test_suite: { points: 10, duration: 60 },
        generate_report: { points: 20, duration: 60 },
        chat_with_haida: { points: 50, duration: 60 },
      },
    },

    logging: {
      level: env.LOG_LEVEL,
      pretty: env.LOG_PRETTY,
    },
  };
}
