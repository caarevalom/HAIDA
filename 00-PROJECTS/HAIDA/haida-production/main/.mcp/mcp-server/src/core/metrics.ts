/**
 * Metrics collection for monitoring and observability
 */

import type { Metrics, ErrorType } from '../types/index.js';

export class MetricsCollector {
  private metrics: Metrics = {
    requests: {
      total: 0,
      perMinute: 0,
      byTool: {},
      byResource: {},
    },
    latency: {
      average: 0,
      p50: 0,
      p95: 0,
      p99: 0,
    },
    errors: {
      total: 0,
      rate: 0,
      byType: {} as Record<ErrorType, number>,
    },
    cache: {
      hits: 0,
      misses: 0,
      hitRate: 0,
    },
  };

  private latencies: number[] = [];
  private requestTimestamps: number[] = [];
  private readonly maxLatencySamples = 1000;

  recordRequest(key: string): void {
    this.metrics.requests.total++;
    this.requestTimestamps.push(Date.now());

    // Clean old timestamps (older than 1 minute)
    const oneMinuteAgo = Date.now() - 60000;
    this.requestTimestamps = this.requestTimestamps.filter(t => t > oneMinuteAgo);
    this.metrics.requests.perMinute = this.requestTimestamps.length;

    // Track by type
    if (key.startsWith('tool.')) {
      const tool = key.substring(5);
      this.metrics.requests.byTool[tool] = (this.metrics.requests.byTool[tool] || 0) + 1;
    } else if (key.startsWith('resource.')) {
      const resource = key.substring(9);
      this.metrics.requests.byResource[resource] = (this.metrics.requests.byResource[resource] || 0) + 1;
    }
  }

  recordLatency(latencyMs: number): void {
    this.latencies.push(latencyMs);

    // Keep only recent samples
    if (this.latencies.length > this.maxLatencySamples) {
      this.latencies.shift();
    }

    // Recalculate percentiles
    this.updateLatencyMetrics();
  }

  recordError(type: string): void {
    this.metrics.errors.total++;
    const errorType = type as ErrorType;
    this.metrics.errors.byType[errorType] = (this.metrics.errors.byType[errorType] || 0) + 1;

    // Calculate error rate
    this.metrics.errors.rate =
      this.metrics.requests.total > 0
        ? this.metrics.errors.total / this.metrics.requests.total
        : 0;
  }

  recordCacheHit(hit: boolean): void {
    if (hit) {
      this.metrics.cache.hits++;
    } else {
      this.metrics.cache.misses++;
    }

    const total = this.metrics.cache.hits + this.metrics.cache.misses;
    this.metrics.cache.hitRate = total > 0 ? this.metrics.cache.hits / total : 0;
  }

  private updateLatencyMetrics(): void {
    if (this.latencies.length === 0) return;

    const sorted = [...this.latencies].sort((a, b) => a - b);

    this.metrics.latency.average =
      this.latencies.reduce((a, b) => a + b, 0) / this.latencies.length;

    this.metrics.latency.p50 = sorted[Math.floor(sorted.length * 0.5)] || 0;
    this.metrics.latency.p95 = sorted[Math.floor(sorted.length * 0.95)] || 0;
    this.metrics.latency.p99 = sorted[Math.floor(sorted.length * 0.99)] || 0;
  }

  getMetrics(): Metrics {
    return JSON.parse(JSON.stringify(this.metrics));
  }

  reset(): void {
    this.metrics = {
      requests: {
        total: 0,
        perMinute: 0,
        byTool: {},
        byResource: {},
      },
      latency: {
        average: 0,
        p50: 0,
        p95: 0,
        p99: 0,
      },
      errors: {
        total: 0,
        rate: 0,
        byType: {} as Record<ErrorType, number>,
      },
      cache: {
        hits: 0,
        misses: 0,
        hitRate: 0,
      },
    };
    this.latencies = [];
    this.requestTimestamps = [];
  }
}
