// Analytics client for tracking events and fetching metrics
import { Database } from '@/types/database.types';

type AnalyticsEvent =
  Database['public']['Tables']['analytics_events']['Insert'];

class AnalyticsClient {
  private sessionId: string;
  private userId?: string;

  constructor() {
    this.sessionId = this.generateSessionId();
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  setUserId(userId: string) {
    this.userId = userId;
  }

  async track(
    eventType: AnalyticsEvent['event_type'],
    eventName: string,
    properties?: Record<string, any>
  ) {
    try {
      await fetch('/api/analytics/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event_type: eventType,
          event_name: eventName,
          properties,
          session_id: this.sessionId,
        }),
      });
    } catch (error) {
      console.error('Analytics tracking error:', error);
    }
  }

  // Convenience methods for common events
  async trackPageView(page: string, properties?: Record<string, any>) {
    return this.track('page_view', page, {
      ...properties,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      referrer: document.referrer,
    });
  }

  async trackFeatureUsage(feature: string, properties?: Record<string, any>) {
    return this.track('feature_usage', feature, properties);
  }

  async trackConversion(
    event: string,
    value?: number,
    properties?: Record<string, any>
  ) {
    return this.track('conversion', event, {
      ...properties,
      value,
    });
  }

  async trackApiCall(
    endpoint: string,
    method: string,
    status: number,
    duration: number
  ) {
    return this.track('api_call', `${method} ${endpoint}`, {
      method,
      status,
      duration,
      endpoint,
    });
  }

  // Fetch analytics data
  async getMetrics(params?: {
    start_date?: string;
    end_date?: string;
    granularity?: 'daily' | 'weekly' | 'monthly';
    metrics?: string[];
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          searchParams.append(
            key,
            Array.isArray(value) ? JSON.stringify(value) : value
          );
        }
      });
    }

    const response = await fetch(`/api/analytics/metrics?${searchParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch metrics');
    }
    return response.json();
  }

  async getRevenueAnalytics(params?: {
    start_date?: string;
    end_date?: string;
    granularity?: 'daily' | 'weekly' | 'monthly';
    breakdown?: 'total' | 'by_tier' | 'by_industry' | 'cohort';
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          searchParams.append(key, value);
        }
      });
    }

    const response = await fetch(`/api/analytics/revenue?${searchParams}`);
    if (!response.ok) {
      throw new Error('Failed to fetch revenue analytics');
    }
    return response.json();
  }

  async getFeatureUsage(params?: {
    start_date?: string;
    end_date?: string;
    feature?: string;
    user_id?: string;
  }) {
    const searchParams = new URLSearchParams();
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value) {
          searchParams.append(key, value);
        }
      });
    }

    const response = await fetch(
      `/api/analytics/feature-usage?${searchParams}`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch feature usage data');
    }
    return response.json();
  }
}

// Global analytics instance
export const analytics = new AnalyticsClient();

// React hook for analytics
export function useAnalytics() {
  return analytics;
}

// Utility functions
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
}

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`;
}

export function calculateGrowthRate(current: number, previous: number): number {
  if (previous === 0) return current > 0 ? 100 : 0;
  return ((current - previous) / previous) * 100;
}
