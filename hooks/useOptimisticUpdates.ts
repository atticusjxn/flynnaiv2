import { useCallback, useRef, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface OptimisticUpdate<T> {
  id: string;
  type: 'create' | 'update' | 'delete';
  table: string;
  data: T;
  originalData?: T;
  timestamp: number;
  status: 'pending' | 'confirmed' | 'failed';
  error?: string;
}

export function useOptimisticUpdates<T = any>() {
  const [pendingUpdates, setPendingUpdates] = useState<OptimisticUpdate<T>[]>(
    []
  );
  const updateTimeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Apply optimistic update
  const applyOptimisticUpdate = useCallback(
    (
      type: 'create' | 'update' | 'delete',
      table: string,
      data: T,
      originalData?: T
    ): string => {
      const updateId = `${type}-${table}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

      const update: OptimisticUpdate<T> = {
        id: updateId,
        type,
        table,
        data,
        originalData,
        timestamp: Date.now(),
        status: 'pending',
      };

      setPendingUpdates((prev) => [...prev, update]);

      // Auto-timeout after 10 seconds
      const timeout = setTimeout(() => {
        setPendingUpdates((prev) =>
          prev.map((u) =>
            u.id === updateId
              ? { ...u, status: 'failed', error: 'Request timeout' }
              : u
          )
        );
      }, 10000);

      updateTimeouts.current.set(updateId, timeout);

      return updateId;
    },
    []
  );

  // Confirm optimistic update
  const confirmUpdate = useCallback((updateId: string) => {
    const timeout = updateTimeouts.current.get(updateId);
    if (timeout) {
      clearTimeout(timeout);
      updateTimeouts.current.delete(updateId);
    }

    setPendingUpdates((prev) =>
      prev.map((update) =>
        update.id === updateId ? { ...update, status: 'confirmed' } : update
      )
    );

    // Remove confirmed updates after a brief delay
    setTimeout(() => {
      setPendingUpdates((prev) => prev.filter((u) => u.id !== updateId));
    }, 1000);
  }, []);

  // Fail optimistic update
  const failUpdate = useCallback((updateId: string, error: string) => {
    const timeout = updateTimeouts.current.get(updateId);
    if (timeout) {
      clearTimeout(timeout);
      updateTimeouts.current.delete(updateId);
    }

    setPendingUpdates((prev) =>
      prev.map((update) =>
        update.id === updateId ? { ...update, status: 'failed', error } : update
      )
    );
  }, []);

  // Get merged data with optimistic updates applied
  const applyOptimisticUpdatesToData = useCallback(
    <TData extends { id?: string }>(
      originalData: TData[],
      table: string
    ): TData[] => {
      let result = [...originalData];

      // Apply pending updates for this table
      const tableUpdates = pendingUpdates.filter(
        (update) => update.table === table && update.status !== 'failed'
      );

      for (const update of tableUpdates) {
        switch (update.type) {
          case 'create':
            result.push(update.data as TData);
            break;

          case 'update':
            result = result.map((item) =>
              item.id === (update.data as any).id
                ? { ...item, ...update.data }
                : item
            );
            break;

          case 'delete':
            result = result.filter(
              (item) => item.id !== (update.data as any).id
            );
            break;
        }
      }

      return result;
    },
    [pendingUpdates]
  );

  // Optimistic database operations
  const optimisticCreate = useCallback(
    async (
      table: string,
      data: T & { id?: string }
    ): Promise<{ updateId: string; data?: T; error?: string }> => {
      // Generate temporary ID if not provided
      const tempId =
        data.id ||
        `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const dataWithId = { ...data, id: tempId };

      const updateId = applyOptimisticUpdate('create', table, dataWithId);

      try {
        const supabase = createClient();
        const { data: result, error } = await supabase
          .from(table)
          .insert([data])
          .select()
          .single();

        if (error) {
          failUpdate(updateId, error.message);
          return { updateId, error: error.message };
        }

        confirmUpdate(updateId);
        return { updateId, data: result };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        failUpdate(updateId, errorMessage);
        return { updateId, error: errorMessage };
      }
    },
    [applyOptimisticUpdate, confirmUpdate, failUpdate]
  );

  const optimisticUpdate = useCallback(
    async (
      table: string,
      id: string,
      updates: Partial<T>,
      originalData?: T
    ): Promise<{ updateId: string; data?: T; error?: string }> => {
      const updateId = applyOptimisticUpdate(
        'update',
        table,
        { ...updates, id } as T,
        originalData
      );

      try {
        const supabase = createClient();
        const { data: result, error } = await supabase
          .from(table)
          .update(updates)
          .eq('id', id)
          .select()
          .single();

        if (error) {
          failUpdate(updateId, error.message);
          return { updateId, error: error.message };
        }

        confirmUpdate(updateId);
        return { updateId, data: result };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        failUpdate(updateId, errorMessage);
        return { updateId, error: errorMessage };
      }
    },
    [applyOptimisticUpdate, confirmUpdate, failUpdate]
  );

  const optimisticDelete = useCallback(
    async (
      table: string,
      id: string,
      originalData?: T
    ): Promise<{ updateId: string; success?: boolean; error?: string }> => {
      const updateId = applyOptimisticUpdate(
        'delete',
        table,
        { id } as T,
        originalData
      );

      try {
        const supabase = createClient();
        const { error } = await supabase.from(table).delete().eq('id', id);

        if (error) {
          failUpdate(updateId, error.message);
          return { updateId, error: error.message };
        }

        confirmUpdate(updateId);
        return { updateId, success: true };
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        failUpdate(updateId, errorMessage);
        return { updateId, error: errorMessage };
      }
    },
    [applyOptimisticUpdate, confirmUpdate, failUpdate]
  );

  // Clear all failed updates
  const clearFailedUpdates = useCallback(() => {
    setPendingUpdates((prev) =>
      prev.filter((update) => update.status !== 'failed')
    );
  }, []);

  return {
    pendingUpdates,
    applyOptimisticUpdatesToData,
    optimisticCreate,
    optimisticUpdate,
    optimisticDelete,
    confirmUpdate,
    failUpdate,
    clearFailedUpdates,
  };
}

// Event-specific optimistic updates hook
export function useOptimisticEvents() {
  const {
    pendingUpdates,
    applyOptimisticUpdatesToData,
    optimisticCreate,
    optimisticUpdate,
    optimisticDelete,
    clearFailedUpdates,
  } = useOptimisticUpdates();

  const updateEventStatus = useCallback(
    async (eventId: string, newStatus: string, originalEvent?: any) => {
      return optimisticUpdate(
        'events',
        eventId,
        {
          status: newStatus,
          updated_at: new Date().toISOString(),
        },
        originalEvent
      );
    },
    [optimisticUpdate]
  );

  const confirmEvent = useCallback(
    async (eventId: string, originalEvent?: any) => {
      return updateEventStatus(eventId, 'confirmed', originalEvent);
    },
    [updateEventStatus]
  );

  const cancelEvent = useCallback(
    async (eventId: string, originalEvent?: any) => {
      return updateEventStatus(eventId, 'cancelled', originalEvent);
    },
    [updateEventStatus]
  );

  return {
    pendingUpdates: pendingUpdates.filter((u) => u.table === 'events'),
    applyOptimisticUpdatesToEvents: (events: any[]) =>
      applyOptimisticUpdatesToData(events, 'events'),
    updateEventStatus,
    confirmEvent,
    cancelEvent,
    createEvent: (eventData: any) => optimisticCreate('events', eventData),
    deleteEvent: (eventId: string, originalEvent?: any) =>
      optimisticDelete('events', eventId, originalEvent),
    clearFailedUpdates,
  };
}
