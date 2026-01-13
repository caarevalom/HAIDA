/**
 * Environment Variables Validation Schema
 * Uses Zod for runtime validation and type-safe environment variables
 */

import { z } from 'zod';

// Database Configuration Schema
const databaseSchema = z.object({
  DATABASE_URL: z.string().url().startsWith('postgresql://'),
  POSTGRES_HOST: z.string().min(1),
  POSTGRES_PORT: z.coerce.number().int().positive().default(5432),
  POSTGRES_DATABASE: z.string().min(1),
  POSTGRES_USER: z.string().min(1),
  POSTGRES_PASSWORD: z.string().min(16, 'Password must be at least 16 characters'),
});

// Supabase Configuration Schema
const supabaseSchema = z.object({
  SUPABASE_URL: z.string().url().startsWith('https://'),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

// Microsoft Entra ID (Azure AD) Schema
const azureSchema = z.object({
  AZURE_CLIENT_ID: z.string().uuid(),
  AZURE_TENANT_ID: z.string().uuid(),
  AZURE_CLIENT_SECRET: z.string().min(1),
  AZURE_REDIRECT_URI: z.string().url().optional(),
});

// JWT Configuration Schema
const jwtSchema = z.object({
  JWT_SECRET: z.string().min(32, 'JWT Secret must be at least 32 characters'),
  JWT_ALGORITHM: z.enum(['HS256', 'HS384', 'HS512', 'RS256']).default('HS256'),
  ACCESS_TOKEN_EXPIRE_MINUTES: z.coerce.number().int().positive().default(30),
  REFRESH_TOKEN_EXPIRE_DAYS: z.coerce.number().int().positive().default(7),
});

// Application Configuration Schema
const appSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(8000),
  BASE_URL: z.string().url(),
  FRONTEND_URL: z.string().url().optional(),
});

// CORS Configuration Schema
const corsSchema = z.object({
  CORS_ORIGINS: z
    .string()
    .transform((val) => val.split(',').map((url) => url.trim()))
    .pipe(z.array(z.string().url())),
  ALLOWED_HOSTS: z
    .string()
    .transform((val) => val.split(',').map((host) => host.trim()))
    .pipe(z.array(z.string())),
});

// Rate Limiting Schema
const rateLimitSchema = z.object({
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000), // 15 minutes
});

// Note: Redis and Observability schemas removed from main validation
// to keep the schema strict. Add them back when needed.

// Testing Configuration Schema
const testingSchema = z.object({
  TEST_TIMEOUT: z.coerce.number().int().positive().default(30000),
  HEADLESS: z
    .string()
    .transform((val) => val === 'true')
    .pipe(z.boolean())
    .default(true),
  SLOWMO: z.coerce.number().int().nonnegative().default(0),
});

// Complete Environment Schema
export const envSchema = z.object({
  ...databaseSchema.shape,
  ...supabaseSchema.shape,
  ...azureSchema.shape,
  ...jwtSchema.shape,
  ...appSchema.shape,
  ...corsSchema.shape,
  ...rateLimitSchema.shape,
  ...testingSchema.shape,
});

export type Env = z.infer<typeof envSchema>;

/**
 * Validate and parse environment variables
 * @throws {z.ZodError} If validation fails
 */
export function validateEnv(): Env {
  try {
    return envSchema.parse(process.env);
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      console.error('❌ Environment validation failed:');
      const zodError = error as z.ZodError;
      zodError.issues.forEach((err: z.ZodIssue) => {
        console.error(`  - ${err.path.join('.')}: ${err.message}`);
      });
      throw new Error('Invalid environment configuration');
    }
    throw error;
  }
}

/**
 * Safe environment getter with validation
 * Returns validated environment or undefined if invalid
 */
export function safeGetEnv(): Env | undefined {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.warn('⚠️  Environment validation failed (non-fatal):');
    result.error.issues.forEach((err: z.ZodIssue) => {
      console.warn(`  - ${err.path.join('.')}: ${err.message}`);
    });
    return undefined;
  }
  return result.data;
}

/**
 * Check if environment is production
 */
export function isProduction(): boolean {
  return process.env.NODE_ENV === 'production';
}

/**
 * Check if environment is development
 */
export function isDevelopment(): boolean {
  return process.env.NODE_ENV === 'development';
}

/**
 * Check if environment is test
 */
export function isTest(): boolean {
  return process.env.NODE_ENV === 'test';
}
