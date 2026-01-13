/**
 * Monitoring and Analytics Service
 * Tracks errors, performance, and user interactions
 */

interface MonitoringEvent {
  category: 'error' | 'performance' | 'user_action' | 'api_call';
  action: string;
  label?: string;
  value?: number;
  metadata?: Record<string, any>;
}

interface PerformanceMetrics {
  name: string;
  duration: number;
  timestamp: number;
}

class MonitoringService {
  private isEnabled: boolean;
  private eventQueue: MonitoringEvent[] = [];
  private performanceMarks: Map<string, number> = new Map();

  constructor() {
    this.isEnabled = import.meta.env.PROD; // Only enable in production
    this.init();
  }

  private init() {
    if (!this.isEnabled) {
      console.log('[Monitoring] Running in development mode - monitoring disabled');
      return;
    }

    // Set up global error handler
    window.addEventListener('error', (event) => {
      this.trackError({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error?.stack,
      });
    });

    // Set up unhandled promise rejection handler
    window.addEventListener('unhandledrejection', (event) => {
      this.trackError({
        message: `Unhandled Promise Rejection: ${event.reason}`,
        type: 'unhandled_rejection',
      });
    });

    // Flush queue periodically
    setInterval(() => this.flushQueue(), 10000); // Every 10 seconds
  }

  /**
   * Track an event
   */
  track(event: MonitoringEvent) {
    const timestamp = Date.now();
    const enrichedEvent = {
      ...event,
      timestamp,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    this.eventQueue.push(enrichedEvent);

    // Log in development
    if (!this.isEnabled) {
      console.log('[Monitoring Event]', enrichedEvent);
    }

    // Flush if queue is getting large
    if (this.eventQueue.length >= 10) {
      this.flushQueue();
    }
  }

  /**
   * Track an error
   */
  trackError(error: any) {
    this.track({
      category: 'error',
      action: 'error_occurred',
      label: error.message || 'Unknown error',
      metadata: {
        stack: error.stack,
        filename: error.filename,
        lineno: error.lineno,
        colno: error.colno,
        type: error.type,
      },
    });
  }

  /**
   * Track API call
   */
  trackApiCall(endpoint: string, method: string, statusCode: number, duration: number) {
    this.track({
      category: 'api_call',
      action: `${method} ${endpoint}`,
      label: `Status: ${statusCode}`,
      value: duration,
      metadata: {
        endpoint,
        method,
        statusCode,
        duration,
      },
    });
  }

  /**
   * Track user action
   */
  trackUserAction(action: string, label?: string, metadata?: Record<string, any>) {
    this.track({
      category: 'user_action',
      action,
      label,
      metadata,
    });
  }

  /**
   * Start performance measurement
   */
  startPerformance(name: string) {
    this.performanceMarks.set(name, performance.now());
  }

  /**
   * End performance measurement
   */
  endPerformance(name: string) {
    const startTime = this.performanceMarks.get(name);
    if (!startTime) {
      console.warn(`[Monitoring] No start mark found for: ${name}`);
      return;
    }

    const duration = performance.now() - startTime;
    this.performanceMarks.delete(name);

    this.track({
      category: 'performance',
      action: name,
      value: duration,
      metadata: {
        duration,
        timestamp: Date.now(),
      },
    });

    return duration;
  }

  /**
   * Track page view
   */
  trackPageView(pageName: string) {
    this.track({
      category: 'user_action',
      action: 'page_view',
      label: pageName,
      metadata: {
        path: window.location.pathname,
        referrer: document.referrer,
      },
    });
  }

  /**
   * Flush event queue to backend
   */
  private async flushQueue() {
    if (this.eventQueue.length === 0) {
      return;
    }

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      // Send events to backend for logging
      // In production, this would send to a logging service
      if (this.isEnabled) {
        // TODO: Implement actual backend logging endpoint
        console.log(`[Monitoring] Flushing ${events.length} events to backend`);

        // Example: Send to backend analytics endpoint
        // await fetch('/api/analytics/events', {
        //   method: 'POST',
        //   headers: { 'Content-Type': 'application/json' },
        //   body: JSON.stringify({ events })
        // });
      }
    } catch (error) {
      console.error('[Monitoring] Failed to flush events:', error);
      // Re-add events to queue on failure
      this.eventQueue.unshift(...events);
    }
  }

  /**
   * Get performance metrics
  */
  getPerformanceMetrics(): PerformanceMetrics[] {
    const navigation = performance.getEntriesByType('navigation')[0] as
      | PerformanceNavigationTiming
      | undefined;
    const paint = performance.getEntriesByType('paint');
    const now = Date.now();

    const safeDuration = (start: number, end: number) => {
      if (!Number.isFinite(start) || !Number.isFinite(end)) {
        return 0;
      }
      if (start < 0 || end < 0) {
        return 0;
      }
      const duration = end - start;
      return Number.isFinite(duration) && duration > 0 ? duration : 0;
    };

    const metrics: PerformanceMetrics[] = [];

    if (navigation) {
      metrics.push(
        {
          name: 'dns_lookup',
          duration: safeDuration(navigation.domainLookupStart, navigation.domainLookupEnd),
          timestamp: now,
        },
        {
          name: 'tcp_connection',
          duration: safeDuration(navigation.connectStart, navigation.connectEnd),
          timestamp: now,
        },
        {
          name: 'request',
          duration: safeDuration(navigation.requestStart, navigation.responseStart),
          timestamp: now,
        },
        {
          name: 'response',
          duration: safeDuration(navigation.responseStart, navigation.responseEnd),
          timestamp: now,
        },
        {
          name: 'dom_processing',
          duration: safeDuration(navigation.domLoading, navigation.domComplete),
          timestamp: now,
        },
        {
          name: 'total_load_time',
          duration: safeDuration(navigation.fetchStart, navigation.loadEventEnd),
          timestamp: now,
        }
      );
    }

    // Add paint metrics
    paint.forEach((entry) => {
      metrics.push({
        name: entry.name,
        duration: entry.startTime,
        timestamp: now,
      });
    });

    return metrics;
  }

  /**
   * Log all performance metrics
   */
  logPerformance() {
    const metrics = this.getPerformanceMetrics();
    console.table(metrics);

    // Track each metric
    metrics.forEach((metric) => {
      this.track({
        category: 'performance',
        action: metric.name,
        value: metric.duration,
      });
    });
  }
}

// Create singleton instance
export const monitoring = new MonitoringService();

// Expose monitoring to window for API service tracking
if (typeof window !== 'undefined') {
  (window as any).haidaMonitoring = monitoring;
}

// Export utilities
export const trackError = (error: any) => monitoring.trackError(error);
export const trackApiCall = (
  endpoint: string,
  method: string,
  statusCode: number,
  duration: number
) => monitoring.trackApiCall(endpoint, method, statusCode, duration);
export const trackUserAction = (action: string, label?: string, metadata?: Record<string, any>) =>
  monitoring.trackUserAction(action, label, metadata);
export const trackPageView = (pageName: string) => monitoring.trackPageView(pageName);
export const startPerformance = (name: string) => monitoring.startPerformance(name);
export const endPerformance = (name: string) => monitoring.endPerformance(name);

export default monitoring;
