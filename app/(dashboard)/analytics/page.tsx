'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@nextui-org/card';
import { Button } from '@nextui-org/button';
import { Select, SelectItem } from '@nextui-org/select';
import { DateRangePicker } from '@nextui-org/date-picker';
import { ChartBarIcon, CurrencyDollarIcon, UserGroupIcon, FireIcon } from '@heroicons/react/24/outline';
import MetricCard from '@/components/analytics/MetricCard';
import RevenueChart from '@/components/analytics/RevenueChart';
import FeatureHeatMap from '@/components/analytics/FeatureHeatMap';
import { useAnalytics } from '@/lib/analytics/analytics-client';

interface AnalyticsMetrics {
  totalUsers: number;
  activeUsers: number;
  monthlyRecurringRevenue: number;
  churnRate: number;
  customerLifetimeValue: number;
  conversionRate: number;
}

interface RevenueData {
  metric_date: string;
  monthly_recurring_revenue: number;
  new_signups: number;
  churn_rate: number;
  total_active_users: number;
}

interface FeatureUsageData {
  feature: string;
  totalUsage: number;
  uniqueUsers: number;
  adoptionRate: number;
  byIndustry: Record<string, number>;
  byTier: Record<string, number>;
}

export default function AnalyticsPage() {
  const analytics = useAnalytics();
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('30d');
  const [metrics, setMetrics] = useState<AnalyticsMetrics | null>(null);
  const [revenueData, setRevenueData] = useState<RevenueData[]>([]);
  const [featureData, setFeatureData] = useState<FeatureUsageData[]>([]);
  const [heatMapData, setHeatMapData] = useState<Record<string, { intensity: number; users: number; usage: number }>>({});

  const timeRangeOptions = [
    { key: '7d', label: 'Last 7 days' },
    { key: '30d', label: 'Last 30 days' },
    { key: '90d', label: 'Last 90 days' },
    { key: '1y', label: 'Last year' },
  ];

  const getDateRange = (range: string) => {
    const now = new Date();
    const days = range === '7d' ? 7 : range === '30d' ? 30 : range === '90d' ? 90 : 365;
    const startDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
    
    return {
      start_date: startDate.toISOString().split('T')[0],
      end_date: now.toISOString().split('T')[0],
    };
  };

  const fetchAnalyticsData = async (range: string) => {
    setLoading(true);
    try {
      const dateRange = getDateRange(range);
      
      // Fetch all analytics data in parallel
      const [metricsResponse, revenueResponse, featureResponse] = await Promise.all([
        analytics.getMetrics({
          ...dateRange,
          granularity: 'daily',
        }),
        analytics.getRevenueAnalytics({
          ...dateRange,
          granularity: 'monthly',
          breakdown: 'total',
        }),
        analytics.getFeatureUsage(dateRange),
      ]);

      // Process metrics data
      if (metricsResponse?.data) {
        const latest = metricsResponse.data[metricsResponse.data.length - 1];
        const previous = metricsResponse.data[metricsResponse.data.length - 2];
        
        setMetrics({
          totalUsers: latest?.total_users || 0,
          activeUsers: latest?.active_users || 0,
          monthlyRecurringRevenue: latest?.monthly_recurring_revenue || 0,
          churnRate: latest?.churn_rate || 0,
          customerLifetimeValue: latest?.customer_lifetime_value || 0,
          conversionRate: latest?.conversion_rate || 0,
        });
      }

      // Process revenue data
      if (revenueResponse?.data) {
        setRevenueData(revenueResponse.data);
      }

      // Process feature usage data
      if (featureResponse?.featureBreakdown) {
        setFeatureData(featureResponse.featureBreakdown);
        setHeatMapData(featureResponse.adoptionHeatMap || {});
      }

    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData(timeRange);
    
    // Track page view
    analytics.trackPageView('analytics-dashboard', {
      timeRange,
      timestamp: new Date().toISOString(),
    });
  }, [timeRange]);

  const handleRefresh = () => {
    fetchAnalyticsData(timeRange);
    analytics.trackFeatureUsage('analytics_refresh', {
      timeRange,
      timestamp: new Date().toISOString(),
    });
  };

  const handleExport = () => {
    analytics.trackFeatureUsage('analytics_export', {
      timeRange,
      format: 'csv',
      timestamp: new Date().toISOString(),
    });
    // TODO: Implement CSV export functionality
  };

  return (
    <div className="container max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground mb-2">Analytics Dashboard</h1>
          <p className="text-default-600">Track business performance, user engagement, and feature adoption</p>
        </div>
        
        <div className="flex items-center gap-3">
          <Select
            size="sm"
            placeholder="Time Range"
            selectedKeys={[timeRange]}
            onSelectionChange={(keys) => setTimeRange(Array.from(keys)[0] as string)}
            className="w-40 nextui-select"
            classNames={{
              trigger: "bg-white border border-gray-200 min-h-8 pr-10 relative",
              value: "text-sm text-left",
              selectorIcon: "absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 z-10",
              popoverContent: "bg-white border border-gray-200 shadow-xl rounded-lg p-0",
              listbox: "bg-white p-1",
            }}
            popoverProps={{
              placement: "bottom-start",
              classNames: {
                content: "bg-white border border-gray-200 shadow-xl rounded-lg p-0 min-w-0",
                base: "bg-white shadow-xl rounded-lg",
              }
            }}
          >
            {timeRangeOptions.map((option) => (
              <SelectItem key={option.key} value={option.key}>
                {option.label}
              </SelectItem>
            ))}
          </Select>
          
          <Button 
            size="sm" 
            variant="bordered" 
            onClick={handleRefresh}
            isLoading={loading}
          >
            Refresh
          </Button>
          
          <Button 
            size="sm" 
            color="primary"
            onClick={handleExport}
            startContent={<ChartBarIcon className="h-4 w-4" />}
          >
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
        <MetricCard
          title="Total Users"
          value={metrics?.totalUsers || 0}
          format="number"
          subtitle="Registered users"
          isLoading={loading}
        />
        
        <MetricCard
          title="Active Users"
          value={metrics?.activeUsers || 0}
          format="number"
          subtitle="Monthly active"
          isLoading={loading}
        />
        
        <MetricCard
          title="Monthly Revenue"
          value={metrics?.monthlyRecurringRevenue || 0}
          format="currency"
          subtitle="MRR"
          isLoading={loading}
        />
        
        <MetricCard
          title="Churn Rate"
          value={metrics?.churnRate || 0}
          format="percent"
          subtitle="Monthly churn"
          isLoading={loading}
        />
        
        <MetricCard
          title="Customer LTV"
          value={metrics?.customerLifetimeValue || 0}
          format="currency"
          subtitle="Lifetime value"
          isLoading={loading}
        />
        
        <MetricCard
          title="Conversion Rate"
          value={metrics?.conversionRate || 0}
          format="percent"
          subtitle="Trial to paid"
          isLoading={loading}
        />
      </div>

      {/* Charts and Visualizations */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Revenue Chart */}
        <RevenueChart
          data={revenueData}
          isLoading={loading}
          className="col-span-1"
        />

        {/* Industry Performance */}
        <Card className="col-span-1">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserGroupIcon className="h-5 w-5 text-primary" />
              <div>
                <h3 className="text-lg font-semibold">Industry Performance</h3>
                <p className="text-sm text-default-600">Revenue breakdown by industry type</p>
              </div>
            </div>
          </CardHeader>
          <CardBody>
            {loading ? (
              <div className="animate-pulse space-y-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="h-4 bg-default-200 rounded w-20"></div>
                    <div className="flex-1 h-6 bg-default-200 rounded"></div>
                    <div className="h-4 bg-default-200 rounded w-16"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {['Plumbing', 'Real Estate', 'Legal', 'Medical'].map((industry, index) => (
                  <div key={industry} className="flex items-center gap-3">
                    <div className="w-20 text-sm text-default-600">{industry}</div>
                    <div className="flex-1">
                      <div className="h-6 bg-default-100 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${Math.max((4 - index) * 20, 5)}%` }}
                        />
                      </div>
                    </div>
                    <div className="text-sm font-medium w-16 text-right">
                      {((4 - index) * 20)}%
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardBody>
        </Card>
      </div>

      {/* Feature Usage Heat Map */}
      <FeatureHeatMap
        data={featureData}
        heatMapData={heatMapData}
        isLoading={loading}
      />

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FireIcon className="h-5 w-5 text-warning-500" />
            <div>
              <h3 className="text-lg font-semibold">Recent Activity</h3>
              <p className="text-sm text-default-600">Latest user actions and system events</p>
            </div>
          </div>
        </CardHeader>
        <CardBody>
          {loading ? (
            <div className="animate-pulse space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className="h-8 w-8 bg-default-200 rounded-full"></div>
                  <div className="flex-1 space-y-1">
                    <div className="h-4 bg-default-200 rounded w-3/4"></div>
                    <div className="h-3 bg-default-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-3 bg-default-200 rounded w-16"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FireIcon className="h-12 w-12 text-default-300 mx-auto mb-4" />
              <h4 className="text-lg font-semibold text-default-600 mb-2">Activity Feed Coming Soon</h4>
              <p className="text-default-500">Real-time activity tracking will be available in the next update.</p>
            </div>
          )}
        </CardBody>
      </Card>
    </div>
  );
}