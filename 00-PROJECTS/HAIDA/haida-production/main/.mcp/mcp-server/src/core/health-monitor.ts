/**
 * Health monitoring and system status checks
 */

import axios from 'axios';
import { createClient } from '@supabase/supabase-js';
import { Redis } from 'ioredis';
import type { MCPServerConfig, HealthStatus, CheckResult } from '../types/index.js';
import type { Logger } from './logger.js';

export class HealthMonitor {
  private config: MCPServerConfig;
  private logger: Logger;
  private startTime: number = Date.now();
  private intervalId?: NodeJS.Timeout;

  constructor(config: MCPServerConfig, logger: Logger) {
    this.config = config;
    this.logger = logger;
  }

  start(intervalMs: number = 60000): void {
    this.logger.info('Starting health monitor');

    this.intervalId = setInterval(async () => {
      const status = await this.check();
      if (status.status !== 'healthy') {
        this.logger.warn({ status }, 'System health degraded');
      }
    }, intervalMs);
  }

  stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.logger.info('Health monitor stopped');
    }
  }

  async check(): Promise<HealthStatus> {
    const [database, redis, fastapi] = await Promise.all([
      this.checkDatabase(),
      this.checkRedis(),
      this.checkFastAPI(),
    ]);

    const checks = { database, redis, fastapi };
    const allHealthy = Object.values(checks).every(c => c.status === 'pass');

    return {
      status: allHealthy ? 'healthy' : 'degraded',
      timestamp: new Date(),
      uptime: Date.now() - this.startTime,
      version: this.config.version,
      checks,
      metrics: {
        requestsPerMinute: 0, // TODO: Implement from metrics collector
        averageLatency: 0,
        errorRate: 0,
        cacheHitRate: 0,
      },
    };
  }

  private async checkDatabase(): Promise<CheckResult> {
    const start = Date.now();
    try {
      const supabase = createClient(
        this.config.supabase.url,
        this.config.supabase.anonKey
      );

      const { error } = await supabase.from('users').select('id').limit(1);

      if (error) {
        return {
          status: 'fail',
          message: error.message,
          responseTime: Date.now() - start,
        };
      }

      return {
        status: 'pass',
        responseTime: Date.now() - start,
      };
    } catch (error) {
      return {
        status: 'fail',
        message: (error as Error).message,
        responseTime: Date.now() - start,
      };
    }
  }

  private async checkRedis(): Promise<CheckResult> {
    const start = Date.now();
    try {
      const redis = new Redis(this.config.redis.url);
      await redis.ping();
      await redis.quit();

      return {
        status: 'pass',
        responseTime: Date.now() - start,
      };
    } catch (error) {
      return {
        status: 'fail',
        message: (error as Error).message,
        responseTime: Date.now() - start,
      };
    }
  }

  private async checkFastAPI(): Promise<CheckResult> {
    const start = Date.now();
    try {
      const response = await axios.get(`${this.config.fastapi.baseUrl}/health`, {
        timeout: 5000,
      });

      if (response.status === 200) {
        return {
          status: 'pass' as const,
          responseTime: Date.now() - start,
        };
      } else {
        return {
          status: 'fail' as const,
          message: `HTTP ${response.status}`,
          responseTime: Date.now() - start,
        };
      }
    } catch (error) {
      return {
        status: 'fail',
        message: (error as Error).message,
        responseTime: Date.now() - start,
      };
    }
  }
}
