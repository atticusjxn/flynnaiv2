'use client';

import { useState, useEffect } from 'react';
import { Card, CardBody, CardHeader } from '@nextui-org/card';
import { Select, SelectItem } from '@nextui-org/select';
import { Button } from '@nextui-org/button';
import { CalendarIcon } from '@heroicons/react/24/outline';

interface RevenueData {
  metric_date: string;
  monthly_recurring_revenue: number;
  new_signups: number;
  churn_rate: number;
  total_active_users: number;
}

interface RevenueChartProps {
  data: RevenueData[];
  isLoading?: boolean;
  className?: string;
}

export default function RevenueChart({
  data = [],
  isLoading = false,
  className = '',
}: RevenueChartProps) {
  const [timeRange, setTimeRange] = useState('6m');
  const [chartType, setChartType] = useState('mrr');

  const timeRanges = [
    { key: '1m', label: 'Last Month' },
    { key: '3m', label: 'Last 3 Months' },
    { key: '6m', label: 'Last 6 Months' },
    { key: '1y', label: 'Last Year' },
  ];

  const chartTypes = [
    { key: 'mrr', label: 'Monthly Recurring Revenue' },
    { key: 'users', label: 'Active Users' },
    { key: 'churn', label: 'Churn Rate' },
    { key: 'signups', label: 'New Signups' },
  ];

  const getFilteredData = () => {
    const now = new Date();
    const months =
      timeRange === '1m'
        ? 1
        : timeRange === '3m'
          ? 3
          : timeRange === '6m'
            ? 6
            : 12;
    const cutoffDate = new Date(now.getFullYear(), now.getMonth() - months, 1);

    return data.filter((item) => new Date(item.metric_date) >= cutoffDate);
  };

  const getChartValue = (item: RevenueData) => {
    switch (chartType) {
      case 'mrr':
        return item.monthly_recurring_revenue || 0;
      case 'users':
        return item.total_active_users || 0;
      case 'churn':
        return item.churn_rate || 0;
      case 'signups':
        return item.new_signups || 0;
      default:
        return 0;
    }
  };

  const formatValue = (value: number) => {
    if (chartType === 'mrr') {
      return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
        minimumFractionDigits: 0,
      }).format(value);
    }
    if (chartType === 'churn') {
      return `${value.toFixed(1)}%`;
    }
    return value.toLocaleString();
  };

  const filteredData = getFilteredData();
  const maxValue = Math.max(...filteredData.map(getChartValue));
  const minValue = Math.min(...filteredData.map(getChartValue));

  if (isLoading) {
    return (
      <Card className={className}>
        <CardHeader>
          <div className="animate-pulse">
            <div className="h-6 bg-default-200 rounded w-48"></div>
          </div>
        </CardHeader>
        <CardBody>
          <div className="animate-pulse">
            <div className="h-64 bg-default-200 rounded"></div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={className}>
      <CardHeader className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Revenue Analytics</h3>
          <p className="text-sm text-default-600">
            Track your business growth over time
          </p>
        </div>

        <div className="flex gap-2 flex-wrap">
          <Select
            size="sm"
            placeholder="Chart Type"
            selectedKeys={[chartType]}
            onSelectionChange={(keys) =>
              setChartType(Array.from(keys)[0] as string)
            }
            className="w-48"
          >
            {chartTypes.map((type) => (
              <SelectItem key={type.key} value={type.key}>
                {type.label}
              </SelectItem>
            ))}
          </Select>

          <Select
            size="sm"
            placeholder="Time Range"
            selectedKeys={[timeRange]}
            onSelectionChange={(keys) =>
              setTimeRange(Array.from(keys)[0] as string)
            }
            className="w-32"
          >
            {timeRanges.map((range) => (
              <SelectItem key={range.key} value={range.key}>
                {range.label}
              </SelectItem>
            ))}
          </Select>
        </div>
      </CardHeader>

      <CardBody>
        {filteredData.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <CalendarIcon className="h-12 w-12 text-default-300 mb-4" />
            <h4 className="text-lg font-semibold text-default-600 mb-2">
              No Data Available
            </h4>
            <p className="text-default-500">
              No revenue data found for the selected time period.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Simple bar chart visualization */}
            <div className="grid grid-cols-1 gap-2">
              {filteredData.map((item, index) => {
                const value = getChartValue(item);
                const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;
                const date = new Date(item.metric_date).toLocaleDateString(
                  'en-US',
                  {
                    month: 'short',
                    year: 'numeric',
                  }
                );

                return (
                  <div key={index} className="flex items-center gap-3">
                    <div className="w-16 text-xs text-default-500 text-right">
                      {date}
                    </div>
                    <div className="flex-1 relative">
                      <div className="h-8 bg-default-100 rounded-md overflow-hidden">
                        <div
                          className="h-full bg-primary transition-all duration-300 flex items-center justify-end pr-2"
                          style={{ width: `${Math.max(percentage, 2)}%` }}
                        >
                          <span className="text-white text-xs font-medium">
                            {formatValue(value)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Summary stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-default-200">
              <div>
                <p className="text-xs text-default-500">Current</p>
                <p className="font-semibold">
                  {formatValue(
                    getChartValue(
                      filteredData[filteredData.length - 1] ||
                        ({} as RevenueData)
                    )
                  )}
                </p>
              </div>
              <div>
                <p className="text-xs text-default-500">Peak</p>
                <p className="font-semibold">{formatValue(maxValue)}</p>
              </div>
              <div>
                <p className="text-xs text-default-500">Low</p>
                <p className="font-semibold">{formatValue(minValue)}</p>
              </div>
              <div>
                <p className="text-xs text-default-500">Average</p>
                <p className="font-semibold">
                  {formatValue(
                    filteredData.reduce(
                      (sum, item) => sum + getChartValue(item),
                      0
                    ) / filteredData.length
                  )}
                </p>
              </div>
            </div>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
