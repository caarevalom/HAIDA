/**
 * Redis-based caching with multi-level strategy
 */

import { Redis } from 'ioredis';
import type { MCPServerConfig, CacheEntry } from '../types/index.js';

export class CacheManager {
  private redis: Redis;
  private memoryCache: Map<string, CacheEntry<any>> = new Map();
  private readonly ttl: MCPServerConfig['redis']['ttl'];

  constructor(config: MCPServerConfig) {
    this.redis = new Redis(config.redis.url, {
      maxRetriesPerRequest: 3,
      retryStrategy: (times: number) => Math.min(times * 50, 2000),
    });

    this.ttl = config.redis.ttl;

    // Memory cache cleanup interval
    setInterval(() => this.cleanMemoryCache(), 60000); // Every minute
  }

  async get<T>(key: string): Promise<T | null> {
    // Level 1: Memory cache
    const memEntry = this.memoryCache.get(key);
    if (memEntry && memEntry.expiry > Date.now()) {
      return memEntry.value as T;
    }

    // Level 2: Redis
    const value = await this.redis.get(key);
    if (value) {
      const parsed = JSON.parse(value) as T;

      // Warm memory cache
      this.memoryCache.set(key, {
        value: parsed,
        expiry: Date.now() + 5000, // 5s in memory
        tags: [],
      });

      return parsed;
    }

    return null;
  }

  async set<T>(
    key: string,
    value: T,
    ttl?: number,
    tags: string[] = []
  ): Promise<void> {
    const serialized = JSON.stringify(value);

    // Redis
    if (ttl) {
      await this.redis.setex(key, ttl, serialized);
    } else {
      await this.redis.set(key, serialized);
    }

    // Memory cache (short TTL)
    this.memoryCache.set(key, {
      value,
      expiry: Date.now() + 5000,
      tags,
    });
  }

  async delete(key: string): Promise<void> {
    await this.redis.del(key);
    this.memoryCache.delete(key);
  }

  async invalidatePattern(pattern: string): Promise<void> {
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }

    // Clear related memory cache entries
    for (const [key] of this.memoryCache) {
      if (this.matchPattern(key, pattern)) {
        this.memoryCache.delete(key);
      }
    }
  }

  async invalidateTags(tags: string[]): Promise<void> {
    // Clear memory cache by tags
    for (const [key, entry] of this.memoryCache) {
      if (tags.some(tag => entry.tags.includes(tag))) {
        this.memoryCache.delete(key);
        await this.redis.del(key);
      }
    }
  }

  private cleanMemoryCache(): void {
    const now = Date.now();
    for (const [key, entry] of this.memoryCache) {
      if (entry.expiry <= now) {
        this.memoryCache.delete(key);
      }
    }
  }

  private matchPattern(key: string, pattern: string): boolean {
    const regex = new RegExp(
      '^' + pattern.replace(/\*/g, '.*').replace(/\?/g, '.') + '$'
    );
    return regex.test(key);
  }

  async disconnect(): Promise<void> {
    await this.redis.quit();
  }

  // Convenience methods with predefined TTLs
  async cacheProject<T>(id: string, data: T): Promise<void> {
    await this.set(`project:${id}`, data, this.ttl.projects, ['data', 'projects']);
  }

  async cacheExecution<T>(id: string, data: T): Promise<void> {
    await this.set(`execution:${id}`, data, this.ttl.executions, ['realtime', 'executions']);
  }

  async cacheReport<T>(id: string, data: T): Promise<void> {
    await this.set(`report:${id}`, data, this.ttl.reports, ['static', 'reports']);
  }

  async cacheDocs<T>(key: string, data: T): Promise<void> {
    await this.set(`docs:${key}`, data, this.ttl.docs, ['static', 'docs']);
  }
}
