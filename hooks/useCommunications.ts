// Flynn.ai v2 - Communication Data Hooks
// S-tier hooks for communication management with real-time updates

'use client';

import { useState, useEffect, useCallback } from 'react';
import { Database } from '@/types/database.types';
import { createClient } from '@/utils/supabase/client';

type CommunicationLog = Database['public']['Tables']['communication_logs']['Row'];

export interface CommunicationFilters {
  type?: 'email' | 'sms' | 'call';
  status?: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  recipient?: string;
  eventId?: string;
  callId?: string;
  dateFrom?: string;
  dateTo?: string;
  page?: number;
  limit?: number;
}

export interface CommunicationMetrics {
  overview: {
    total_communications: number;
    email_count: number;
    sms_count: number;
    call_count: number;
    success_rate: number;
    failed_count: number;
  };
  recent_activity: CommunicationLog[];
  failed_communications: CommunicationLog[];
  hourly_stats: Array<{
    hour: number;
    count: number;
    success_rate: number;
  }>;
  response_rates: {
    email_open_rate: number;
    sms_response_rate: number;
    call_pickup_rate: number;
  };
  trends: {
    weekly_growth: {
      communications: number;
      success_rate: number;
    };
    most_active_day: string;
    peak_hours: number[];
  };
}

export interface UseCommunicationsResult {
  communications: CommunicationLog[];
  loading: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  } | null;
  refetch: () => Promise<void>;
  loadMore: () => Promise<void>;
}

// Hook for fetching communications with filters and pagination
export function useCommunications(filters: CommunicationFilters = {}) {
  const [communications, setCommunications] = useState<CommunicationLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [pagination, setPagination] = useState<UseCommunicationsResult['pagination']>(null);
  
  const supabase = createClient();

  const fetchCommunications = useCallback(async (loadMore = false) => {
    try {
      if (!loadMore) {
        setLoading(true);
        setError(null);
      }

      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value.toString());
        }
      });

      const response = await fetch(`/api/communications?${params}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch communications: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch communications');
      }

      if (loadMore && pagination) {
        setCommunications(prev => [...prev, ...result.data]);
      } else {
        setCommunications(result.data);
      }
      
      setPagination(result.pagination);
    } catch (err) {
      console.error('Error fetching communications:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch communications');
    } finally {
      setLoading(false);
    }
  }, [filters, pagination]);

  const loadMore = useCallback(async () => {
    if (pagination && pagination.hasNext && !loading) {
      const nextPageFilters = {
        ...filters,
        page: pagination.page + 1
      };
      await fetchCommunications(true);
    }
  }, [pagination, filters, loading, fetchCommunications]);

  useEffect(() => {
    fetchCommunications();
  }, [fetchCommunications]);

  // Set up real-time subscriptions for communication updates
  useEffect(() => {
    const channel = supabase
      .channel('communication_logs_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'communication_logs'
        },
        (payload) => {
          console.log('Communication update:', payload);
          
          if (payload.eventType === 'INSERT') {
            setCommunications(prev => [payload.new as CommunicationLog, ...prev]);
          } else if (payload.eventType === 'UPDATE') {
            setCommunications(prev => 
              prev.map(comm => 
                comm.id === (payload.new as CommunicationLog).id 
                  ? payload.new as CommunicationLog 
                  : comm
              )
            );
          } else if (payload.eventType === 'DELETE') {
            setCommunications(prev => 
              prev.filter(comm => comm.id !== (payload.old as CommunicationLog).id)
            );
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase]);

  return {
    communications,
    loading,
    error,
    pagination,
    refetch: () => fetchCommunications(),
    loadMore
  };
}

// Hook for communication metrics
export function useCommunicationMetrics(dateFrom?: string, dateTo?: string) {
  const [metrics, setMetrics] = useState<CommunicationMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMetrics = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const response = await fetch(`/api/communications/metrics?${params}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metrics: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch metrics');
      }

      setMetrics(result.data);
    } catch (err) {
      console.error('Error fetching communication metrics:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch metrics');
    } finally {
      setLoading(false);
    }
  }, [dateFrom, dateTo]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  // Auto-refresh metrics every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      if (!loading) {
        fetchMetrics();
      }
    }, 30000);

    return () => clearInterval(interval);
  }, [loading, fetchMetrics]);

  return {
    metrics,
    loading,
    error,
    refetch: fetchMetrics
  };
}

// Hook for retrying failed communications
export function useRetryCommunication() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const retryCommunication = useCallback(async (communicationId: string) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/communications/retry', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ communicationId })
      });

      if (!response.ok) {
        throw new Error(`Failed to retry communication: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to retry communication');
      }

      return result.data;
    } catch (err) {
      console.error('Error retrying communication:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to retry communication';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    retryCommunication,
    loading,
    error
  };
}

// Hook for sending new communications
export function useSendCommunication() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendCommunication = useCallback(async (data: {
    eventId?: string;
    callId?: string;
    communicationType: 'email' | 'sms' | 'call';
    recipient: string;
    subject?: string;
    content: string;
  }) => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch('/api/communications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error(`Failed to send communication: ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        throw new Error(result.error || 'Failed to send communication');
      }

      return result.data;
    } catch (err) {
      console.error('Error sending communication:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to send communication';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    sendCommunication,
    loading,
    error
  };
}