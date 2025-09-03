'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

// Professional SVG Icons
const PlusIcon = ({ className }: { className?: string }) => (
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
      d="M12 4.5v15m7.5-7.5h-15"
    />
  </svg>
);

const CogIcon = ({ className }: { className?: string }) => (
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
      d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a6.759 6.759 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
    />
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
    />
  </svg>
);

const PhoneIcon = ({ className }: { className?: string }) => (
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
      d="M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.372c0-.516-.351-.966-.852-1.091l-4.423-1.106c-.44-.11-.902.055-1.173.417l-.97 1.293c-.282.376-.769.542-1.21.38a12.035 12.035 0 0 1-7.143-7.143c-.162-.441.004-.928.38-1.21l1.293-.97c.363-.271.527-.734.417-1.173L6.963 3.102a1.125 1.125 0 0 0-1.091-.852H4.5A2.25 2.25 0 0 0 2.25 4.5v2.25Z"
    />
  </svg>
);

const CalendarDaysIcon = ({ className }: { className?: string }) => (
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
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5m-16.5-7.5h16.5m-16.5 3.75h16.5"
    />
  </svg>
);

const ChartBarIcon = ({ className }: { className?: string }) => (
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
      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
    />
  </svg>
);

const DocumentTextIcon = ({ className }: { className?: string }) => (
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
      d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z"
    />
  </svg>
);

const LinkIcon = ({ className }: { className?: string }) => (
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
      d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244"
    />
  </svg>
);

interface QuickAction {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  href?: string;
  onClick?: () => void;
  gradient: string;
  iconColor: string;
  comingSoon?: boolean;
}

interface QuickActionCardProps {
  action: QuickAction;
  index: number;
}

function QuickActionCard({ action, index }: QuickActionCardProps) {
  const Icon = action.icon;

  const content = (
    <div
      className={cn(
        'group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-border/50 p-6 cursor-pointer shadow-sm',
        'transition-all duration-500 ease-out',
        'hover:shadow-2xl hover:shadow-black/10 hover:border-border/80 hover:-translate-y-3 hover:scale-105',
        'active:scale-95 active:translate-y-0',
        !action.comingSoon && 'hover:bg-gray-50/50 dark:hover:bg-gray-800/50',
        action.comingSoon &&
          'opacity-75 cursor-not-allowed hover:scale-100 hover:translate-y-0'
      )}
      style={
        {
          animationDelay: `${index * 150}ms`,
          animationDuration: '700ms',
          animationFillMode: 'both',
        } as React.CSSProperties
      }
    >
      {/* Premium Background Effects */}
      <div
        className={cn(
          'absolute inset-0 opacity-0 transition-all duration-700',
          'bg-gradient-to-br from-white/5 via-transparent to-transparent',
          'group-hover:opacity-100'
        )}
      />

      {/* Background Gradient Overlay */}
      <div
        className={cn(
          'absolute top-0 right-0 w-32 h-32 opacity-5 rounded-full blur-3xl transition-all duration-700 group-hover:opacity-15 group-hover:scale-150 group-hover:rotate-45',
          action.gradient
        )}
      />

      {/* Premium shimmer effect */}
      <div
        className={cn(
          'absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-in-out',
          'bg-gradient-to-r from-transparent via-white/8 to-transparent'
        )}
      />

      {/* Content */}
      <div className="relative z-10 text-center">
        <div className="relative mb-6">
          <div
            className={cn(
              'inline-flex p-4 rounded-2xl shadow-lg transition-all duration-500',
              'group-hover:scale-110 group-hover:rotate-6 group-hover:shadow-2xl',
              !action.comingSoon && 'group-hover:-translate-y-1',
              action.iconColor
            )}
          >
            {/* Icon backdrop glow */}
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />

            <Icon
              className={cn(
                'w-8 h-8 text-white relative z-10 transition-all duration-300',
                'group-hover:scale-110',
                !action.comingSoon && 'group-hover:drop-shadow-lg'
              )}
            />
          </div>

          {/* Floating particles effect */}
          <div
            className={cn(
              'absolute -top-2 -right-1 w-2 h-2 rounded-full opacity-0 transition-all duration-500',
              'group-hover:opacity-60 group-hover:-translate-y-4 group-hover:translate-x-2',
              action.gradient
            )}
          />
          <div
            className={cn(
              'absolute -bottom-1 -left-2 w-1.5 h-1.5 rounded-full opacity-0 transition-all duration-700 delay-100',
              'group-hover:opacity-40 group-hover:translate-y-3 group-hover:-translate-x-1',
              action.gradient
            )}
          />
        </div>

        <h3
          className={cn(
            'text-lg font-bold text-card-foreground mb-3 transition-all duration-300',
            'group-hover:text-primary group-hover:scale-105 group-hover:-translate-y-1'
          )}
        >
          {action.title}
        </h3>

        <p
          className={cn(
            'text-sm text-muted-foreground leading-relaxed transition-all duration-300',
            'group-hover:text-muted-foreground/90'
          )}
        >
          {action.description}
        </p>

        {action.comingSoon && (
          <div className="mt-4">
            <span
              className={cn(
                'inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold',
                'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-600',
                'border border-gray-300 shadow-sm',
                'transition-all duration-300 group-hover:shadow-md'
              )}
            >
              <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mr-2 animate-pulse" />
              Coming Soon
            </span>
          </div>
        )}

        {/* Hover action indicator */}
        {!action.comingSoon && (
          <div
            className={cn(
              'mt-4 opacity-0 transition-all duration-300 group-hover:opacity-100 group-hover:translate-y-0',
              'translate-y-2'
            )}
          >
            <div className="w-8 h-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-full mx-auto" />
          </div>
        )}
      </div>
    </div>
  );

  if (action.href && !action.comingSoon) {
    return (
      <Link
        href={action.href}
        className={cn(
          'block animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both',
          // Staggered delays
          `delay-[${index * 150}ms]`
        )}
      >
        {content}
      </Link>
    );
  }

  if (action.onClick && !action.comingSoon) {
    return (
      <button
        onClick={action.onClick}
        className={cn(
          'block w-full text-left animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both',
          `delay-[${index * 150}ms]`
        )}
      >
        {content}
      </button>
    );
  }

  return (
    <div
      className={cn(
        'animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both',
        `delay-[${index * 150}ms]`
      )}
    >
      {content}
    </div>
  );
}

interface QuickActionsProps {
  className?: string;
}

export default function QuickActions({ className }: QuickActionsProps) {
  const quickActions: QuickAction[] = [
    {
      title: 'View All Calls',
      description: 'Browse your call history and manage recordings',
      icon: PhoneIcon,
      href: '/calls',
      gradient: 'bg-gradient-to-br from-blue-500 to-blue-600',
      iconColor: 'bg-gradient-to-br from-blue-500 to-blue-600',
    },
    {
      title: 'Manage Events',
      description: 'Review and edit extracted calendar events',
      icon: DocumentTextIcon,
      href: '/events',
      gradient: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
      iconColor: 'bg-gradient-to-br from-emerald-500 to-emerald-600',
    },
    {
      title: 'Calendar Setup',
      description: 'Connect your Google Calendar or Outlook',
      icon: CalendarDaysIcon,
      href: '/calendar',
      gradient: 'bg-gradient-to-br from-violet-500 to-violet-600',
      iconColor: 'bg-gradient-to-br from-violet-500 to-violet-600',
    },
    {
      title: 'Twilio Integration',
      description: 'Configure your phone number and webhooks',
      icon: CogIcon,
      href: '/settings',
      gradient: 'bg-gradient-to-br from-amber-500 to-amber-600',
      iconColor: 'bg-gradient-to-br from-amber-500 to-amber-600',
    },
    {
      title: 'Analytics',
      description: 'View performance metrics and AI accuracy',
      icon: ChartBarIcon,
      href: '/analytics',
      gradient: 'bg-gradient-to-br from-purple-500 to-purple-600',
      iconColor: 'bg-gradient-to-br from-purple-500 to-purple-600',
      comingSoon: true,
    },
    {
      title: 'API Access',
      description: 'Integrate Flynn.ai with your existing tools',
      icon: LinkIcon,
      href: '/api-docs',
      gradient: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      iconColor: 'bg-gradient-to-br from-indigo-500 to-indigo-600',
      comingSoon: true,
    },
  ];

  return (
    <div
      className={cn(
        'space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-700',
        className
      )}
    >
      {/* Premium Header */}
      <div className="flex items-center justify-between animate-in fade-in slide-in-from-left-4 duration-700 delay-100">
        <div>
          <h2 className="text-2xl font-bold text-foreground mb-1 transition-colors duration-300 hover:text-primary">
            Quick Actions
          </h2>
          <div className="w-12 h-0.5 bg-gradient-to-r from-primary to-primary/60 rounded-full" />
        </div>
        <p className="text-sm text-muted-foreground transition-colors duration-300 hover:text-muted-foreground/80">
          Get started with Flynn.ai
        </p>
      </div>

      {/* Enhanced Grid Container */}
      <div
        className={cn(
          'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6',
          'animate-in fade-in slide-in-from-bottom-4 duration-700 delay-200'
        )}
      >
        {quickActions.map((action, index) => (
          <QuickActionCard key={action.title} action={action} index={index} />
        ))}
      </div>
    </div>
  );
}
