'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';

// Professional SVG Icons
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

const CalendarIcon = ({ className }: { className?: string }) => (
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
      d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5"
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

const ExclamationTriangleIcon = ({ className }: { className?: string }) => (
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
      d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
    />
  </svg>
);

const ArrowTopRightOnSquareIcon = ({ className }: { className?: string }) => (
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
      d="M13.5 6H5.25A2.25 2.25 0 0 0 3 8.25v10.5A2.25 2.25 0 0 0 5.25 21h10.5A2.25 2.25 0 0 0 18 18.75V10.5m-10.5 6L21 3m0 0h-5.25M21 3v5.25"
    />
  </svg>
);

interface ActivityItem {
  id: string;
  type: 'call' | 'event_extracted' | 'calendar_sync' | 'error';
  title: string;
  description: string;
  timestamp: string;
  metadata?: {
    caller?: string;
    duration?: string;
    confidence?: number;
    urgency?: 'low' | 'medium' | 'high' | 'emergency';
    status?: string;
  };
  href?: string;
}

interface ActivityItemProps {
  item: ActivityItem;
  index: number;
}

function ActivityItemComponent({ item, index }: ActivityItemProps) {
  const getIcon = () => {
    switch (item.type) {
      case 'call':
        return PhoneIcon;
      case 'event_extracted':
        return CheckCircleIcon;
      case 'calendar_sync':
        return CalendarIcon;
      case 'error':
        return ExclamationTriangleIcon;
      default:
        return PhoneIcon;
    }
  };

  const getIconColor = () => {
    switch (item.type) {
      case 'call':
        return 'bg-blue-100 text-blue-600 border-blue-200';
      case 'event_extracted':
        return 'bg-emerald-100 text-emerald-600 border-emerald-200';
      case 'calendar_sync':
        return 'bg-violet-100 text-violet-600 border-violet-200';
      case 'error':
        return 'bg-red-100 text-red-600 border-red-200';
      default:
        return 'bg-gray-100 text-gray-600 border-gray-200';
    }
  };

  const getUrgencyColor = (urgency?: string) => {
    switch (urgency) {
      case 'emergency':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low':
        return 'bg-green-100 text-green-700 border-green-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const Icon = getIcon();
  const content = (
    <div
      className="group flex items-start space-x-4 p-4 rounded-xl hover:bg-muted/40 transition-all duration-200 hover:scale-[1.01]"
      style={
        {
          animationDelay: `${index * 50}ms`,
          animationDuration: '400ms',
          animationFillMode: 'both',
        } as React.CSSProperties
      }
    >
      {/* Icon */}
      <div
        className={cn(
          'flex-shrink-0 w-10 h-10 rounded-xl border flex items-center justify-center transition-all duration-200 group-hover:scale-110',
          getIconColor()
        )}
      >
        <Icon className="w-5 h-5" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors duration-200 truncate">
              {item.title}
            </p>
            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
              {item.description}
            </p>

            {/* Metadata */}
            {item.metadata && (
              <div className="flex items-center space-x-3 mt-2">
                {item.metadata.caller && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {item.metadata.caller}
                  </span>
                )}
                {item.metadata.duration && (
                  <span className="text-xs text-muted-foreground">
                    {item.metadata.duration}
                  </span>
                )}
                {item.metadata.confidence && (
                  <span className="text-xs text-muted-foreground">
                    {item.metadata.confidence}% confidence
                  </span>
                )}
                {item.metadata.urgency && (
                  <span
                    className={cn(
                      'text-xs font-medium px-2 py-0.5 rounded-full border',
                      getUrgencyColor(item.metadata.urgency)
                    )}
                  >
                    {item.metadata.urgency}
                  </span>
                )}
                {item.metadata.status && (
                  <span className="text-xs font-medium text-muted-foreground">
                    {item.metadata.status}
                  </span>
                )}
              </div>
            )}
          </div>

          <div className="flex-shrink-0 ml-4 text-right">
            <p className="text-xs text-muted-foreground">{item.timestamp}</p>
            {item.href && (
              <ArrowTopRightOnSquareIcon className="w-4 h-4 text-muted-foreground mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
            )}
          </div>
        </div>
      </div>
    </div>
  );

  if (item.href) {
    return (
      <Link
        href={item.href}
        className="block animate-in fade-in slide-in-from-left-2"
      >
        {content}
      </Link>
    );
  }

  return (
    <div className="animate-in fade-in slide-in-from-left-2">{content}</div>
  );
}

interface RecentActivityProps {
  className?: string;
}

export default function RecentActivity({ className }: RecentActivityProps) {
  // Mock data - in real app this would come from API
  const activities: ActivityItem[] = [
    {
      id: '1',
      type: 'call',
      title: 'New call processed',
      description:
        'Customer needs urgent plumbing repair for burst pipe in kitchen',
      timestamp: '2 minutes ago',
      metadata: {
        caller: 'Sarah Johnson',
        duration: '4:32',
        urgency: 'emergency',
      },
      href: '/calls/1',
    },
    {
      id: '2',
      type: 'event_extracted',
      title: 'Service appointment extracted',
      description: 'Kitchen sink repair scheduled for tomorrow at 10:00 AM',
      timestamp: '5 minutes ago',
      metadata: {
        confidence: 92,
        urgency: 'high',
      },
      href: '/events/2',
    },
    {
      id: '3',
      type: 'calendar_sync',
      title: 'Google Calendar updated',
      description: 'Appointment synced to your primary calendar',
      timestamp: '8 minutes ago',
      metadata: {
        status: 'Success',
      },
    },
    {
      id: '4',
      type: 'call',
      title: 'Consultation call completed',
      description: 'Property viewing appointment for downtown condo',
      timestamp: '1 hour ago',
      metadata: {
        caller: 'Mike Chen',
        duration: '12:45',
        urgency: 'medium',
      },
      href: '/calls/4',
    },
    {
      id: '5',
      type: 'event_extracted',
      title: 'Follow-up meeting extracted',
      description: 'Client wants to discuss renovation timeline next week',
      timestamp: '2 hours ago',
      metadata: {
        confidence: 85,
        urgency: 'low',
      },
      href: '/events/5',
    },
    {
      id: '6',
      type: 'error',
      title: 'Calendar sync failed',
      description:
        'Unable to sync appointment - please check calendar permissions',
      timestamp: '3 hours ago',
      metadata: {
        status: 'Retry required',
      },
    },
  ];

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-foreground">Recent Activity</h2>
        <Link
          href="/calls"
          className="text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-200 flex items-center space-x-1 group"
        >
          <span>View all</span>
          <ArrowTopRightOnSquareIcon className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </Link>
      </div>

      <div className="bg-card border border-border rounded-2xl shadow-sm overflow-hidden">
        {activities.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto bg-muted rounded-full flex items-center justify-center mb-4">
              <PhoneIcon className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              No activity yet
            </h3>
            <p className="text-muted-foreground max-w-sm mx-auto">
              Your call activity and AI extractions will appear here once you
              start processing calls.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {activities.map((activity, index) => (
              <ActivityItemComponent
                key={activity.id}
                item={activity}
                index={index}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
