'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

interface UsageAnalytics {
  tier: string;
  status: string;
  usage: {
    calls: {
      used: number;
      limit: number;
      remaining: number;
    };
    events: {
      extracted: number;
      successRate: number;
    };
  };
  features: {
    name: string;
    call_limit: number;
    has_calendar_sync: boolean;
    has_sms_notifications: boolean;
    has_bulk_management: boolean;
    has_api_access: boolean;
  };
}

interface UsageMetricsProps {
  userId?: string;
  period?: 'month' | 'week';
}

export default function UsageMetrics({ period = 'month' }: UsageMetricsProps) {
  const [analytics, setAnalytics] = useState<UsageAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const periodLabel = period === 'month' ? 'This Month' : 'This Week';

  useEffect(() => {
    async function fetchUsageAnalytics() {
      try {
        const response = await fetch('/api/billing/usage');
        const data = await response.json();

        if (data.success) {
          setAnalytics(data.analytics);
        } else {
          setError(data.error || 'Failed to fetch usage data');
        }
      } catch (err) {
        console.error('Failed to fetch usage analytics:', err);
        setError('Failed to load usage information');
      } finally {
        setLoading(false);
      }
    }

    fetchUsageAnalytics();
  }, []);

  if (loading) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl shadow-sm p-8"
      >
        <div className="animate-pulse">
          <div className="h-6 bg-muted rounded mb-4"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-20 bg-muted rounded-lg"></div>
            ))}
          </div>
        </div>
      </motion.div>
    );
  }

  if (error || !analytics) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card border border-border rounded-2xl shadow-sm p-8 text-center"
      >
        <p className="text-muted-foreground">Unable to load usage analytics</p>
      </motion.div>
    );
  }

  const isUnlimited = analytics.features.call_limit === -1;
  const usagePercentage = isUnlimited ? 0 : (analytics.usage.calls.used / analytics.usage.calls.limit) * 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-card border border-border rounded-2xl shadow-sm p-8"
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Usage Analytics</h2>
          <p className="text-muted-foreground">
            {periodLabel} • {analytics.features.name} Plan
          </p>
        </div>
        <div className="text-right">
          <div className={`text-sm font-medium ${
            isUnlimited ? 'text-green-600' : 
            usagePercentage > 90 ? 'text-red-600' : 
            usagePercentage > 70 ? 'text-amber-600' : 'text-green-600'
          }`}>
            {isUnlimited ? 'Unlimited' : `${analytics.usage.calls.remaining} calls left`}
          </div>
          <div className="text-xs text-muted-foreground">Australian Plan</div>
        </div>
      </div>

      {/* Usage Progress Bar (for limited plans) */}
      {!isUnlimited && (
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">Monthly Call Usage</span>
            <span className="text-sm font-medium text-foreground">
              {analytics.usage.calls.used}/{analytics.usage.calls.limit} calls
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-2">
            <motion.div
              className={`h-2 rounded-full ${
                usagePercentage > 90 ? 'bg-red-500' : 
                usagePercentage > 70 ? 'bg-amber-500' : 'bg-green-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(usagePercentage, 100)}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Total Calls */}
        <motion.div 
          className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/30 rounded-lg"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 002.25-2.25c0-1.372-.465-2.637-1.246-3.626-.28-.352-.708-.633-1.157-.777l-1.132-.337c-.4-.119-.817-.05-1.158.186-.34.235-.61.58-.735.978l-.297.893c-.267.8-1.206 1.213-2.028.926a11.932 11.932 0 01-5.31-5.31c-.287-.822.126-1.76.926-2.028l.893-.297c.398-.125.743-.395.978-.735.236-.34.305-.758.186-1.158l-.337-1.132c-.144-.449-.425-.877-.777-1.157C13.637 2.715 12.372 2.25 11 2.25 10.172 2.25 9.5 2.922 9.5 3.75V6.75z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{analytics.usage.calls.used.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Calls Processed</div>
            </div>
          </div>
        </motion.div>

        {/* Events Extracted */}
        <motion.div 
          className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/20 dark:to-green-900/30 rounded-lg"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5a2.25 2.25 0 002.25-2.25m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5a2.25 2.25 0 012.25 2.25v7.5" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{analytics.usage.events.extracted.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Events Created</div>
            </div>
          </div>
        </motion.div>

        {/* AI Success Rate */}
        <motion.div 
          className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/30 rounded-lg"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 00-2.456 2.456zM16.894 20.567L16.5 21.75l-.394-1.183a2.25 2.25 0 00-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 001.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 001.423 1.423l1.183.394-1.183.394a2.25 2.25 0 00-1.423 1.423z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">{Math.round(analytics.usage.events.successRate)}%</div>
              <div className="text-xs text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </motion.div>

        {/* Feature Status */}
        <motion.div 
          className="p-4 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-950/20 dark:to-amber-900/30 rounded-lg"
          whileHover={{ scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300 }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 bg-amber-500 rounded-lg flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <div className="text-2xl font-bold text-foreground">
                {[
                  analytics.features.has_calendar_sync,
                  analytics.features.has_sms_notifications,
                  analytics.features.has_bulk_management,
                  analytics.features.has_api_access
                ].filter(Boolean).length}
              </div>
              <div className="text-xs text-muted-foreground">Features Active</div>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Features Status */}
      <div className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-950/20 dark:to-gray-900/30 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-semibold text-foreground">Plan Features</h3>
          <div className="text-sm text-muted-foreground">{analytics.features.name}</div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div className={`flex items-center gap-2 ${analytics.features.has_calendar_sync ? 'text-green-600' : 'text-gray-400'}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              {analytics.features.has_calendar_sync ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              )}
            </svg>
            <span className="text-sm">Calendar Sync</span>
          </div>
          
          <div className={`flex items-center gap-2 ${analytics.features.has_sms_notifications ? 'text-green-600' : 'text-gray-400'}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              {analytics.features.has_sms_notifications ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              )}
            </svg>
            <span className="text-sm">SMS Alerts</span>
          </div>
          
          <div className={`flex items-center gap-2 ${analytics.features.has_bulk_management ? 'text-green-600' : 'text-gray-400'}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              {analytics.features.has_bulk_management ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              )}
            </svg>
            <span className="text-sm">Bulk Actions</span>
          </div>
          
          <div className={`flex items-center gap-2 ${analytics.features.has_api_access ? 'text-green-600' : 'text-gray-400'}`}>
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              {analytics.features.has_api_access ? (
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              )}
            </svg>
            <span className="text-sm">API Access</span>
          </div>
        </div>
      </div>

      {/* Value Proposition */}
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-foreground mb-1">Australian Business Value</h3>
            <p className="text-sm text-muted-foreground">
              Estimated time saved: <span className="font-semibold text-foreground">~{Math.round(analytics.usage.calls.used * 5)} minutes</span>
            </p>
          </div>
          <div className="text-right">
            <div className="text-xs text-muted-foreground">GST Inclusive Pricing</div>
            <div className="text-xs text-muted-foreground">Local Support Available</div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}