'use client';

import { cn } from '@/lib/utils';

// Professional SVG Icons for Metrics
const TrendingUpIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941"
    />
  </svg>
);

const ClockIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);

const CheckCircleIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
    />
  </svg>
);

const PhoneArrowUpRightIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M14.25 9.75v-4.5m0 0h4.5m-4.5 0 6-6m-3 18c-8.284 0-15-6.716-15-15V4.5A2.25 2.25 0 0 1 4.5 2.25h1.372c.516 0 .966.351 1.091.852l1.106 4.423c.11.44-.054.902-.417 1.173l-1.293.97a1.062 1.062 0 0 0-.38 1.21 12.035 12.035 0 0 0 7.143 7.143c.441.162.928-.004 1.21-.38l.97-1.293a1.125 1.125 0 0 1 1.173-.417l4.423 1.106c.5.125.852.575.852 1.091V19.5a2.25 2.25 0 0 1-2.25 2.25h-2.25Z"
    />
  </svg>
);

const ArrowUpIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 14l5-5 5 5" />
  </svg>
);

const ArrowDownIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={2}
    stroke="currentColor"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M17 10l-5 5-5-5" />
  </svg>
);

interface KPICardProps {
  title: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: {
    value: string;
    direction: 'up' | 'down';
    label?: string;
  };
  gradient: string;
  iconColor: string;
  className?: string;
}

function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  gradient,
  iconColor,
  className,
}: KPICardProps) {
  return (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-border/50 p-6 cursor-pointer shadow-sm',
        'transition-all duration-500 ease-out',
        'hover:shadow-2xl hover:shadow-black/10 hover:border-border/80 hover:-translate-y-2 hover:scale-[1.02]',
        'active:scale-[0.98] active:translate-y-0',
        'before:absolute before:inset-0 before:bg-gradient-to-r before:from-white/0 before:via-white/5 before:to-white/0',
        'before:translate-x-[-100%] before:transition-transform before:duration-700',
        'hover:before:translate-x-[100%]',
        className
      )}
    >
      {/* Background Gradient Overlay */}
      <div
        className={cn(
          'absolute top-0 right-0 w-40 h-40 opacity-5 rounded-full blur-3xl transition-all duration-700 group-hover:opacity-15 group-hover:scale-150 group-hover:rotate-45',
          gradient
        )}
      />

      {/* Animated border glow */}
      <div
        className={cn(
          'absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-500 group-hover:opacity-20',
          'bg-gradient-to-r from-transparent via-white to-transparent',
          'animate-pulse'
        )}
      />

      {/* Content */}
      <div className="relative z-10">
        <div className="flex items-start justify-between mb-4">
          <div
            className={cn(
              'p-3 rounded-xl shadow-lg transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-xl',
              'relative overflow-hidden',
              iconColor
            )}
          >
            {/* Icon glow effect */}
            <div className="absolute inset-0 bg-white/20 rounded-xl opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
            <Icon className="w-6 h-6 text-white relative z-10 transition-transform duration-300 group-hover:scale-110" />
          </div>

          {trend && (
            <div
              className={cn(
                'flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold shadow-sm',
                'transition-all duration-300 group-hover:scale-105 group-hover:shadow-md',
                trend.direction === 'up'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 group-hover:bg-emerald-100'
                  : 'bg-red-50 text-red-700 border border-red-200 group-hover:bg-red-100'
              )}
            >
              {trend.direction === 'up' ? (
                <ArrowUpIcon className="w-3 h-3 transition-transform duration-300 group-hover:animate-pulse" />
              ) : (
                <ArrowDownIcon className="w-3 h-3 transition-transform duration-300 group-hover:animate-pulse" />
              )}
              <span className="transition-all duration-300">{trend.value}</span>
            </div>
          )}
        </div>

        <div className="space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground tracking-wide uppercase transition-colors duration-300 group-hover:text-muted-foreground/80">
            {title}
          </h3>
          <p className="text-3xl font-bold text-card-foreground tracking-tight transition-all duration-300 group-hover:text-card-foreground/90 group-hover:scale-105">
            {value}
          </p>
          {subtitle && (
            <p className="text-sm text-muted-foreground transition-colors duration-300 group-hover:text-muted-foreground/80">
              {subtitle}
            </p>
          )}
          {trend?.label && (
            <p className="text-xs text-muted-foreground mt-2 transition-all duration-300 group-hover:text-muted-foreground/80 group-hover:translate-x-1">
              {trend.label}
            </p>
          )}
        </div>
      </div>

      {/* Premium shimmer effect */}
      <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </div>
  );
}

interface KPICardsProps {
  className?: string;
}

export default function KPICards({ className }: KPICardsProps) {
  const kpiData = [
    {
      title: 'Total Calls',
      value: '247',
      subtitle: 'This month',
      icon: PhoneArrowUpRightIcon,
      trend: {
        value: '+23%',
        direction: 'up' as const,
        label: 'vs last month',
      },
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
    },
    {
      title: 'Events Extracted',
      value: '189',
      subtitle: 'AI accuracy: 92%',
      icon: CheckCircleIcon,
      trend: {
        value: '+5.2%',
        direction: 'up' as const,
        label: 'accuracy improved',
      },
      gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      iconColor: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    },
    {
      title: 'Avg Response Time',
      value: '1.3m',
      subtitle: 'Call to email',
      icon: ClockIcon,
      trend: {
        value: '-15s',
        direction: 'up' as const,
        label: 'faster than target',
      },
      gradient: 'bg-gradient-to-br from-amber-500 to-amber-600',
      iconColor: 'bg-gradient-to-br from-amber-500 to-amber-600',
    },
    {
      title: 'Calendar Synced',
      value: '94%',
      subtitle: 'Success rate',
      icon: TrendingUpIcon,
      trend: {
        value: '+2.1%',
        direction: 'up' as const,
        label: 'vs last week',
      },
      gradient: 'bg-gradient-to-br from-violet-500 to-violet-600',
      iconColor: 'bg-gradient-to-br from-violet-500 to-violet-600',
    },
  ];

  return (
    <div
      className={cn(
        'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6',
        'animate-in fade-in slide-in-from-bottom-8 duration-700',
        className
      )}
    >
      {kpiData.map((kpi, index) => (
        <KPICard
          key={kpi.title}
          {...kpi}
          className={cn(
            'animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both',
            // Staggered animation delays for premium effect
            index === 0 && 'delay-100',
            index === 1 && 'delay-200',
            index === 2 && 'delay-300',
            index === 3 && 'delay-500'
          )}
        />
      ))}
    </div>
  );
}
