import { NextRequest, NextResponse } from 'next/server';

export interface PerformanceMetrics {
  timestamp: number;
  route: string;
  method: string;
  duration: number;
  status: number;
  userAgent?: string;
  userId?: string;
  memoryUsage?: NodeJS.MemoryUsage;
  cpuUsage?: NodeJS.CpuUsage;
}

export interface SystemHealth {
  status: 'healthy' | 'degraded' | 'unhealthy';
  checks: {
    database: boolean;
    openai: boolean;
    twilio: boolean;
    resend: boolean;
    memory: boolean;
    disk: boolean;
  };
  metrics: {
    responseTime: number;
    errorRate: number;
    throughput: number;
    uptime: number;
  };
  timestamp: number;
}

/**
 * Performance monitoring and alerting system
 */
export class PerformanceMonitor {
  private metrics: PerformanceMetrics[] = [];
  private readonly maxMetrics = 10000; // Keep last 10k metrics in memory
  private startTime = Date.now();
  private errorCount = 0;
  private requestCount = 0;

  /**
   * Middleware to track API performance
   */
  async trackRequest(
    request: NextRequest,
    handler: () => Promise<NextResponse>
  ): Promise<NextResponse> {
    const start = process.hrtime.bigint();
    const startCpu = process.cpuUsage();
    const route = request.nextUrl.pathname;
    const method = request.method;

    let response: NextResponse;
    let status = 200;

    try {
      response = await handler();
      status = response.status;
      this.requestCount++;
    } catch (error) {
      this.errorCount++;
      status = 500;
      throw error;
    } finally {
      const end = process.hrtime.bigint();
      const duration = Number(end - start) / 1000000; // Convert to milliseconds
      const endCpu = process.cpuUsage(startCpu);

      // Record performance metrics
      const metric: PerformanceMetrics = {
        timestamp: Date.now(),
        route,
        method,
        duration,
        status,
        userAgent: request.headers.get('user-agent') || undefined,
        memoryUsage: process.memoryUsage(),
        cpuUsage: endCpu,
      };

      this.recordMetric(metric);

      // Alert on slow requests (>2 seconds)
      if (duration > 2000) {
        this.alertSlowRequest(metric);
      }

      // Alert on high memory usage (>512MB)
      if (
        metric.memoryUsage &&
        metric.memoryUsage.heapUsed > 512 * 1024 * 1024
      ) {
        this.alertHighMemoryUsage(metric);
      }
    }

    return response!;
  }

  /**
   * Record a performance metric
   */
  private recordMetric(metric: PerformanceMetrics) {
    this.metrics.push(metric);

    // Keep only the last N metrics to prevent memory leaks
    if (this.metrics.length > this.maxMetrics) {
      this.metrics = this.metrics.slice(-this.maxMetrics);
    }
  }

  /**
   * Get current system health status
   */
  async getSystemHealth(): Promise<SystemHealth> {
    const now = Date.now();
    const recentMetrics = this.metrics.filter((m) => now - m.timestamp < 60000); // Last minute

    const avgResponseTime =
      recentMetrics.length > 0
        ? recentMetrics.reduce((sum, m) => sum + m.duration, 0) /
          recentMetrics.length
        : 0;

    const errorRate =
      this.requestCount > 0 ? (this.errorCount / this.requestCount) * 100 : 0;
    const throughput = recentMetrics.length; // Requests per minute
    const uptime = (now - this.startTime) / 1000; // Seconds

    // Health checks
    const checks = {
      database: await this.checkDatabase(),
      openai: await this.checkOpenAI(),
      twilio: await this.checkTwilio(),
      resend: await this.checkResend(),
      memory: await this.checkMemory(),
      disk: await this.checkDisk(),
    };

    const healthyChecks = Object.values(checks).filter(Boolean).length;
    const totalChecks = Object.values(checks).length;

    let status: SystemHealth['status'] = 'healthy';
    if (healthyChecks < totalChecks) {
      status = healthyChecks < totalChecks * 0.5 ? 'unhealthy' : 'degraded';
    }

    return {
      status,
      checks,
      metrics: {
        responseTime: avgResponseTime,
        errorRate,
        throughput,
        uptime,
      },
      timestamp: now,
    };
  }

  /**
   * Get performance analytics
   */
  getAnalytics(timeRange: number = 3600000) {
    // Default: 1 hour
    const cutoff = Date.now() - timeRange;
    const relevantMetrics = this.metrics.filter((m) => m.timestamp > cutoff);

    if (relevantMetrics.length === 0) {
      return {
        totalRequests: 0,
        avgResponseTime: 0,
        medianResponseTime: 0,
        p95ResponseTime: 0,
        errorRate: 0,
        slowestRoutes: [],
        mostUsedRoutes: [],
      };
    }

    // Sort by duration for percentile calculations
    const sortedByDuration = [...relevantMetrics].sort(
      (a, b) => a.duration - b.duration
    );
    const p95Index = Math.floor(sortedByDuration.length * 0.95);

    // Group by route for route analytics
    const routeStats = relevantMetrics.reduce(
      (acc, metric) => {
        const key = `${metric.method} ${metric.route}`;
        if (!acc[key]) {
          acc[key] = { count: 0, totalDuration: 0, errors: 0 };
        }
        acc[key].count++;
        acc[key].totalDuration += metric.duration;
        if (metric.status >= 400) {
          acc[key].errors++;
        }
        return acc;
      },
      {} as Record<
        string,
        { count: number; totalDuration: number; errors: number }
      >
    );

    const slowestRoutes = Object.entries(routeStats)
      .map(([route, stats]) => ({
        route,
        avgDuration: stats.totalDuration / stats.count,
        requests: stats.count,
      }))
      .sort((a, b) => b.avgDuration - a.avgDuration)
      .slice(0, 10);

    const mostUsedRoutes = Object.entries(routeStats)
      .map(([route, stats]) => ({
        route,
        requests: stats.count,
        avgDuration: stats.totalDuration / stats.count,
      }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);

    return {
      totalRequests: relevantMetrics.length,
      avgResponseTime:
        relevantMetrics.reduce((sum, m) => sum + m.duration, 0) /
        relevantMetrics.length,
      medianResponseTime:
        sortedByDuration[Math.floor(sortedByDuration.length / 2)]?.duration ||
        0,
      p95ResponseTime: sortedByDuration[p95Index]?.duration || 0,
      errorRate:
        (relevantMetrics.filter((m) => m.status >= 400).length /
          relevantMetrics.length) *
        100,
      slowestRoutes,
      mostUsedRoutes,
    };
  }

  private async checkDatabase(): Promise<boolean> {
    try {
      const { createClient } = await import('@/utils/supabase/server');
      const supabase = createClient();
      const { error } = await supabase
        .from('users')
        .select('id')
        .limit(1)
        .single();
      return !error || error.code === 'PGRST116'; // No rows found is OK for health check
    } catch {
      return false;
    }
  }

  private async checkOpenAI(): Promise<boolean> {
    try {
      if (!process.env.OPENAI_API_KEY) return false;
      // Simple API key validation - don't make actual requests for health checks
      return process.env.OPENAI_API_KEY.startsWith('sk-');
    } catch {
      return false;
    }
  }

  private async checkTwilio(): Promise<boolean> {
    try {
      if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN)
        return false;
      return true; // Basic env var check
    } catch {
      return false;
    }
  }

  private async checkResend(): Promise<boolean> {
    try {
      if (!process.env.RESEND_API_KEY) return false;
      return process.env.RESEND_API_KEY.startsWith('re_');
    } catch {
      return false;
    }
  }

  private async checkMemory(): Promise<boolean> {
    try {
      const memUsage = process.memoryUsage();
      // Alert if heap usage is over 80% of 512MB (our typical container limit)
      return memUsage.heapUsed < 512 * 1024 * 1024 * 0.8;
    } catch {
      return false;
    }
  }

  private async checkDisk(): Promise<boolean> {
    try {
      // In serverless environments, disk space is usually not a concern
      // but we can check if we can write to temp directory
      const fs = await import('fs/promises');
      const path = await import('path');
      const tmpPath = path.join('/tmp', 'health-check');
      await fs.writeFile(tmpPath, 'test');
      await fs.unlink(tmpPath);
      return true;
    } catch {
      return false;
    }
  }

  private alertSlowRequest(metric: PerformanceMetrics) {
    console.warn(
      `🐌 Slow request detected: ${metric.method} ${metric.route} took ${metric.duration.toFixed(2)}ms`
    );

    // In production, send to monitoring service
    if (process.env.NODE_ENV === 'production') {
      this.sendAlert('slow_request', {
        route: metric.route,
        method: metric.method,
        duration: metric.duration,
        timestamp: metric.timestamp,
      });
    }
  }

  private alertHighMemoryUsage(metric: PerformanceMetrics) {
    const memMB = metric.memoryUsage
      ? Math.round(metric.memoryUsage.heapUsed / 1024 / 1024)
      : 0;
    console.warn(
      `🔥 High memory usage detected: ${memMB}MB on ${metric.method} ${metric.route}`
    );

    if (process.env.NODE_ENV === 'production') {
      this.sendAlert('high_memory', {
        route: metric.route,
        method: metric.method,
        memoryUsage: memMB,
        timestamp: metric.timestamp,
      });
    }
  }

  private async sendAlert(type: string, data: any) {
    // Implementation would send to monitoring service like DataDog, New Relic, etc.
    console.log(`Alert [${type}]:`, data);
  }
}

// Global instance
export const performanceMonitor = new PerformanceMonitor();

/**
 * HOF for wrapping API routes with performance monitoring
 */
export function withPerformanceMonitoring(
  handler: (req: NextRequest) => Promise<NextResponse>
) {
  return async (req: NextRequest): Promise<NextResponse> => {
    return performanceMonitor.trackRequest(req, () => handler(req));
  };
}
