import { useEffect, useState, useCallback } from 'react';
import { useEventsRealtime, useCallsRealtime } from './useRealtime';
import { useAuth } from './useAuth';

export interface DashboardStats {
  totalCalls: number;
  eventsExtracted: number;
  avgResponseTime: number;
  calendarSyncRate: number;
}

export interface RecentActivity {
  id: string;
  type: 'call' | 'event' | 'calendar_sync' | 'error';
  title: string;
  description: string;
  metadata?: any;
  timestamp: string;
  status?: string;
}

export function useDashboardRealtime() {
  const { user } = useAuth();
  const eventsRealtime = useEventsRealtime();
  const callsRealtime = useCallsRealtime();

  const [stats, setStats] = useState<DashboardStats>({
    totalCalls: 247,
    eventsExtracted: 189,
    avgResponseTime: 1.3,
    calendarSyncRate: 94,
  });

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [notifications, setNotifications] = useState<RecentActivity[]>([]);

  // Add new activity to the list
  const addActivity = useCallback(
    (activity: Omit<RecentActivity, 'id' | 'timestamp'>) => {
      const newActivity: RecentActivity = {
        ...activity,
        id: `activity-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
      };

      setRecentActivity((prev) => [newActivity, ...prev.slice(0, 9)]); // Keep only 10 most recent

      // Add to notifications if it's important
      if (activity.type === 'error' || activity.metadata?.urgent) {
        setNotifications((prev) => [newActivity, ...prev.slice(0, 4)]); // Keep only 5 notifications
      }
    },
    []
  );

  // Handle call events
  useEffect(() => {
    if (!user) return;

    const unsubscribe = callsRealtime.subscribe((payload) => {
      console.log('Call realtime event:', payload);

      if (payload.eventType === 'INSERT') {
        const call = payload.new;

        // Update stats
        setStats((prev) => ({
          ...prev,
          totalCalls: prev.totalCalls + 1,
        }));

        // Add activity
        addActivity({
          type: 'call',
          title: 'New call processed',
          description: `Call from ${call.caller_name || 'Unknown'} processed successfully`,
          metadata: {
            callId: call.id,
            duration: call.duration,
            status: call.status,
          },
        });
      }

      if (payload.eventType === 'UPDATE') {
        const call = payload.new;

        if (call.status === 'completed') {
          addActivity({
            type: 'call',
            title: 'Call processing completed',
            description: `AI extraction completed for call ${call.id}`,
            metadata: {
              callId: call.id,
              extractionAccuracy: call.ai_extraction_confidence,
            },
          });
        }

        if (call.status === 'failed') {
          addActivity({
            type: 'error',
            title: 'Call processing failed',
            description: `Failed to process call: ${call.error_message || 'Unknown error'}`,
            metadata: {
              callId: call.id,
              urgent: true,
            },
          });
        }
      }
    });

    return unsubscribe;
  }, [user, callsRealtime, addActivity]);

  // Handle event updates
  useEffect(() => {
    if (!user) return;

    const unsubscribe = eventsRealtime.subscribe((payload) => {
      console.log('Event realtime event:', payload);

      if (payload.eventType === 'INSERT') {
        const event = payload.new;

        // Update stats
        setStats((prev) => ({
          ...prev,
          eventsExtracted: prev.eventsExtracted + 1,
        }));

        // Add activity
        addActivity({
          type: 'event',
          title: 'Event extracted',
          description: `${event.title} scheduled for ${new Date(event.proposed_datetime).toLocaleDateString()}`,
          metadata: {
            eventId: event.id,
            confidence: event.confidence_score,
            urgency: event.urgency,
          },
        });
      }

      if (payload.eventType === 'UPDATE') {
        const event = payload.new;
        const oldEvent = payload.old;

        // Status changes
        if (event.status !== oldEvent.status) {
          let title = 'Event status updated';
          let description = `${event.title} is now ${event.status}`;

          if (event.status === 'confirmed') {
            title = 'Event confirmed';
            description = `${event.title} has been confirmed and scheduled`;
          } else if (event.status === 'cancelled') {
            title = 'Event cancelled';
            description = `${event.title} has been cancelled`;
          }

          addActivity({
            type: 'event',
            title,
            description,
            metadata: {
              eventId: event.id,
              oldStatus: oldEvent.status,
              newStatus: event.status,
            },
          });
        }

        // Calendar sync updates
        if (event.calendar_synced && !oldEvent.calendar_synced) {
          addActivity({
            type: 'calendar_sync',
            title: 'Calendar sync successful',
            description: `${event.title} synced to your calendar`,
            metadata: {
              eventId: event.id,
              calendarProvider: event.calendar_provider,
            },
          });

          // Update calendar sync rate
          setStats((prev) => ({
            ...prev,
            calendarSyncRate: Math.min(100, prev.calendarSyncRate + 0.5),
          }));
        }
      }
    });

    return unsubscribe;
  }, [user, eventsRealtime, addActivity]);

  // Clear notification
  const clearNotification = useCallback((notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Manual refresh stats
  const refreshStats = useCallback(async () => {
    if (!user) return;

    try {
      // In a real implementation, you would fetch from your API
      // For now, we'll simulate refreshing with current data
      console.log('Refreshing dashboard stats...');

      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Stats would be fetched from API in real implementation
    } catch (error) {
      console.error('Failed to refresh dashboard stats:', error);
      addActivity({
        type: 'error',
        title: 'Stats refresh failed',
        description: 'Unable to refresh dashboard statistics',
        metadata: {
          error: error instanceof Error ? error.message : 'Unknown error',
        },
      });
    }
  }, [user, addActivity]);

  return {
    stats,
    recentActivity,
    notifications,
    isConnected: eventsRealtime.isConnected && callsRealtime.isConnected,
    error: eventsRealtime.error || callsRealtime.error,
    clearNotification,
    clearAllNotifications,
    refreshStats,
    addActivity, // Expose for manual activity injection
  };
}
