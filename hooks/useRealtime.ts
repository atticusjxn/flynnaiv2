import { useEffect, useState, useCallback, useRef } from 'react';
import { createClient } from '@/utils/supabase/client';
import { useAuthContext } from '@/components/MinimalAuthProvider';

interface RealtimeSubscription {
  unsubscribe: () => void;
}

type RealtimeEvent = 'INSERT' | 'UPDATE' | 'DELETE';

interface RealtimePayload<T = any> {
  eventType: RealtimeEvent;
  new: T;
  old: T;
  table: string;
  schema: string;
}

interface UseRealtimeOptions {
  table: string;
  filter?: string;
  event?: RealtimeEvent | RealtimeEvent[];
  enabled?: boolean;
}

export function useRealtime<T = any>({
  table,
  filter,
  event = ['INSERT', 'UPDATE', 'DELETE'],
  enabled = true,
}: UseRealtimeOptions) {
  const { user } = useAuthContext();
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const subscriptionRef = useRef<RealtimeSubscription | null>(null);
  const callbacksRef = useRef<
    Map<string, (payload: RealtimePayload<T>) => void>
  >(new Map());

  const subscribe = useCallback(
    (
      callback: (payload: RealtimePayload<T>) => void,
      options: {
        event?: RealtimeEvent | RealtimeEvent[];
        filter?: string;
      } = {}
    ) => {
      if (!enabled || !user) return () => {};

      const callbackId = Math.random().toString(36).substr(2, 9);
      callbacksRef.current.set(callbackId, callback);

      return () => {
        callbacksRef.current.delete(callbackId);
      };
    },
    [enabled, user]
  );

  const setupSubscription = useCallback(async () => {
    if (!enabled || !user || subscriptionRef.current) return;

    try {
      const supabase = createClient();

      // Create channel for the table
      const channel = supabase
        .channel(`realtime:${table}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: table,
            filter: filter || `user_id=eq.${user.id}`,
          },
          (payload) => {
            console.log('Realtime event received:', payload);

            // Notify all callbacks
            callbacksRef.current.forEach((callback) => {
              try {
                callback({
                  eventType: payload.eventType as RealtimeEvent,
                  new: payload.new as T,
                  old: payload.old as T,
                  table: payload.table,
                  schema: payload.schema,
                });
              } catch (error) {
                console.error('Error in realtime callback:', error);
              }
            });
          }
        )
        .subscribe((status) => {
          console.log(`Realtime subscription status for ${table}:`, status);
          setIsConnected(status === 'SUBSCRIBED');
          if (status === 'CHANNEL_ERROR') {
            setError('Failed to connect to realtime updates');
          } else if (status === 'SUBSCRIBED') {
            setError(null);
          }
        });

      subscriptionRef.current = {
        unsubscribe: () => {
          supabase.removeChannel(channel);
        },
      };
    } catch (error) {
      console.error('Error setting up realtime subscription:', error);
      setError(error instanceof Error ? error.message : 'Unknown error');
    }
  }, [enabled, user, table, filter]);

  const cleanup = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
      subscriptionRef.current = null;
    }
    setIsConnected(false);
    callbacksRef.current.clear();
  }, []);

  useEffect(() => {
    if (enabled && user) {
      setupSubscription();
    } else {
      cleanup();
    }

    return cleanup;
  }, [enabled, user, setupSubscription, cleanup]);

  return {
    subscribe,
    isConnected,
    error,
    reconnect: setupSubscription,
  };
}

// Specific hooks for common use cases
export function useEventsRealtime() {
  return useRealtime({
    table: 'events',
    enabled: true,
  });
}

export function useCallsRealtime() {
  return useRealtime({
    table: 'calls',
    enabled: true,
  });
}

export function useCalendarMappingsRealtime() {
  return useRealtime({
    table: 'calendar_event_mappings',
    enabled: true,
  });
}
