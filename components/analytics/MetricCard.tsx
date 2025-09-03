'use client';

import { Card, CardBody } from '@nextui-org/card';
import { Chip } from '@nextui-org/chip';
import { 
  TrendingUpIcon, 
  TrendingDownIcon,
  MinusIcon 
} from '@heroicons/react/24/outline';
import { formatCurrency, formatNumber, formatPercent } from '@/lib/analytics/analytics-client';

export interface MetricCardProps {
  title: string;
  value: number;
  previousValue?: number;
  format?: 'number' | 'currency' | 'percent';
  trend?: 'up' | 'down' | 'neutral';
  subtitle?: string;
  isLoading?: boolean;
  className?: string;
}

export default function MetricCard({
  title,
  value,
  previousValue,
  format = 'number',
  trend,
  subtitle,
  isLoading = false,
  className = '',
}: MetricCardProps) {
  const formatValue = (val: number) => {
    switch (format) {
      case 'currency':
        return formatCurrency(val);
      case 'percent':
        return formatPercent(val);
      case 'number':
      default:
        return formatNumber(val);
    }
  };

  const calculateChange = () => {
    if (!previousValue || previousValue === 0) return null;
    const change = ((value - previousValue) / previousValue) * 100;
    return change;
  };

  const change = calculateChange();
  const determinedTrend = trend || (change !== null ? (
    change > 0 ? 'up' : change < 0 ? 'down' : 'neutral'
  ) : 'neutral');

  const getTrendIcon = () => {
    switch (determinedTrend) {
      case 'up':
        return <TrendingUpIcon className="h-4 w-4" />;
      case 'down':
        return <TrendingDownIcon className="h-4 w-4" />;
      default:
        return <MinusIcon className="h-4 w-4" />;
    }
  };

  const getTrendColor = () => {
    switch (determinedTrend) {
      case 'up':
        return 'success';
      case 'down':
        return 'danger';
      default:
        return 'default';
    }
  };

  if (isLoading) {
    return (
      <Card className={className}>
        <CardBody className="p-4">
          <div className="animate-pulse">
            <div className="h-4 bg-default-200 rounded mb-2"></div>
            <div className="h-8 bg-default-200 rounded mb-2"></div>
            <div className="h-3 bg-default-200 rounded w-2/3"></div>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={`hover:shadow-md transition-shadow ${className}`}>
      <CardBody className="p-4">
        <div className="flex items-start justify-between mb-2">
          <h3 className="text-sm font-medium text-default-600">{title}</h3>
          {change !== null && (
            <Chip
              size="sm"
              variant="flat"
              color={getTrendColor()}
              startContent={getTrendIcon()}
              className="text-xs"
            >
              {Math.abs(change).toFixed(1)}%
            </Chip>
          )}
        </div>
        
        <div className="mb-1">
          <span className="text-2xl font-bold text-foreground">
            {formatValue(value)}
          </span>
        </div>
        
        {subtitle && (
          <p className="text-xs text-default-500">{subtitle}</p>
        )}
        
        {previousValue !== undefined && (
          <div className="mt-2 text-xs text-default-500">
            vs {formatValue(previousValue)} previous period
          </div>
        )}
      </CardBody>
    </Card>
  );
}