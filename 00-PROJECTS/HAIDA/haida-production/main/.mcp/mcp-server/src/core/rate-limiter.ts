/**
 * Multi-tier rate limiting with Redis
 */

import { RateLimiterRedis, RateLimiterMemory } from 'rate-limiter-flexible';
import { Redis } from 'ioredis';
import type { MCPServerConfig } from '../types/index.js';
import { MCPError, ErrorType } from '../types/index.js';

export class RateLimiter {
  private redis: Redis;
  private globalLimiter: RateLimiterRedis;
  private userLimiter: RateLimiterRedis;
  private toolLimiters: Map<string, RateLimiterMemory> = new Map();

  constructor(config: MCPServerConfig) {
    this.redis = new Redis(config.redis.url);

    // Global rate limiter
    this.globalLimiter = new RateLimiterRedis({
      storeClient: this.redis,
      keyPrefix: 'rl:global',
      points: config.rateLimit.global.points,
      duration: config.rateLimit.global.duration,
    });

    // Per-user rate limiter
    this.userLimiter = new RateLimiterRedis({
      storeClient: this.redis,
      keyPrefix: 'rl:user',
      points: config.rateLimit.perUser.points,
      duration: config.rateLimit.perUser.duration,
    });

    // Per-tool rate limiters (in-memory for speed)
    for (const [tool, limits] of Object.entries(config.rateLimit.perTool)) {
      this.toolLimiters.set(
        tool,
        new RateLimiterMemory({
          keyPrefix: `rl:tool:${tool}`,
          points: limits.points,
          duration: limits.duration,
        })
      );
    }
  }

  async checkLimit(resource: string, userId?: string): Promise<void> {
    try {
      // Check global limit
      await this.globalLimiter.consume('global', 1);

      // Check user limit
      if (userId) {
        await this.userLimiter.consume(userId, 1);
      }

      // Check tool-specific limit
      const toolName = resource.replace('tool.', '');
      const toolLimiter = this.toolLimiters.get(toolName);
      if (toolLimiter && userId) {
        await toolLimiter.consume(userId, 1);
      }
    } catch (error: any) {
      if (error.msBeforeNext) {
        const retryAfter = Math.ceil(error.msBeforeNext / 1000);
        throw new MCPError(
          ErrorType.RATE_LIMIT_ERROR,
          'RATE_LIMIT_EXCEEDED',
          `Rate limit exceeded. Retry after ${retryAfter} seconds`,
          `Resource: ${resource}, User: ${userId || 'anonymous'}`,
          true
        );
      }
      throw error;
    }
  }

  async getRemainingPoints(_resource: string, userId?: string): Promise<number> {
    try {
      const res = await this.userLimiter.get(userId || 'global');
      return res?.remainingPoints || 0;
    } catch {
      return 0;
    }
  }
}
