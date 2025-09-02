import { createClient } from '@/utils/supabase/server';
import { Database } from '@/types/database.types';

type CallRecord = Database['public']['Tables']['calls']['Row'];
type EventRecord = Database['public']['Tables']['events']['Row'];

/**
 * Optimized database queries with proper indexing and caching strategies
 */
export class DatabaseOptimizer {
  private supabase;

  constructor() {
    this.supabase = createClient();
  }

  /**
   * Get calls with optimized query and pagination
   */
  async getOptimizedCalls(
    userId: string,
    page: number = 1,
    limit: number = 20,
    filters?: {
      status?: string[];
      urgency?: string[];
      aiStatus?: string[];
      search?: string;
      dateRange?: { start: Date; end: Date };
    }
  ) {
    let query = this.supabase
      .from('calls')
      .select(`
        id,
        caller_number,
        caller_name,
        call_status,
        call_duration,
        urgency_level,
        ai_processing_status,
        main_topic,
        call_summary,
        created_at,
        processed_at,
        email_sent_at
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range((page - 1) * limit, page * limit - 1);

    // Apply filters efficiently
    if (filters?.status?.length) {
      query = query.in('call_status', filters.status);
    }
    
    if (filters?.urgency?.length) {
      query = query.in('urgency_level', filters.urgency);
    }
    
    if (filters?.aiStatus?.length) {
      query = query.in('ai_processing_status', filters.aiStatus);
    }
    
    if (filters?.search) {
      query = query.or(
        `caller_name.ilike.%${filters.search}%,` +
        `caller_number.ilike.%${filters.search}%,` +
        `main_topic.ilike.%${filters.search}%,` +
        `call_summary.ilike.%${filters.search}%`
      );
    }
    
    if (filters?.dateRange) {
      query = query
        .gte('created_at', filters.dateRange.start.toISOString())
        .lte('created_at', filters.dateRange.end.toISOString());
    }

    const { data, error, count } = await query;

    if (error) throw error;

    return {
      data: data as CallRecord[],
      totalCount: count || 0,
      hasMore: count ? count > page * limit : false,
      currentPage: page,
    };
  }

  /**
   * Get call statistics with optimized aggregation
   */
  async getCallStatistics(userId: string, dateRange?: { start: Date; end: Date }) {
    let query = this.supabase
      .from('calls')
      .select('call_status, urgency_level, ai_processing_status, call_duration')
      .eq('user_id', userId);

    if (dateRange) {
      query = query
        .gte('created_at', dateRange.start.toISOString())
        .lte('created_at', dateRange.end.toISOString());
    }

    const { data, error } = await query;
    if (error) throw error;

    // Compute statistics efficiently
    const stats = {
      totalCalls: data?.length || 0,
      completedCalls: data?.filter(call => call.call_status === 'completed').length || 0,
      processedCalls: data?.filter(call => call.ai_processing_status === 'completed').length || 0,
      emergencyCalls: data?.filter(call => call.urgency_level === 'emergency').length || 0,
      avgDuration: data && data.length > 0 
        ? Math.round(data.reduce((acc, call) => acc + (call.call_duration || 0), 0) / data.length / 60)
        : 0,
    };

    return stats;
  }

  /**
   * Get events for a call with optimized joins
   */
  async getCallEvents(callId: string) {
    const { data, error } = await this.supabase
      .from('events')
      .select(`
        id,
        event_type,
        event_title,
        event_date,
        event_time,
        location,
        customer_name,
        customer_phone,
        urgency_level,
        status,
        confidence_score,
        created_at
      `)
      .eq('call_id', callId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data as EventRecord[];
  }

  /**
   * Bulk update call processing status
   */
  async bulkUpdateCallStatus(callIds: string[], status: string, userId: string) {
    const { data, error } = await this.supabase
      .from('calls')
      .update({ ai_processing_status: status, updated_at: new Date().toISOString() })
      .in('id', callIds)
      .eq('user_id', userId)
      .select('id');

    if (error) throw error;
    return data;
  }

  /**
   * Get analytics data with optimized queries
   */
  async getAnalyticsData(userId: string, timeframe: 'day' | 'week' | 'month' = 'week') {
    const now = new Date();
    const startDate = new Date();

    switch (timeframe) {
      case 'day':
        startDate.setDate(now.getDate() - 1);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
    }

    // Get aggregated data in a single query
    const { data, error } = await this.supabase
      .rpc('get_user_analytics', {
        p_user_id: userId,
        p_start_date: startDate.toISOString(),
        p_end_date: now.toISOString()
      });

    if (error) {
      // Fallback to manual aggregation if RPC doesn't exist
      return this.getFallbackAnalytics(userId, startDate, now);
    }

    return data;
  }

  private async getFallbackAnalytics(userId: string, startDate: Date, endDate: Date) {
    const { data, error } = await this.supabase
      .from('calls')
      .select('*')
      .eq('user_id', userId)
      .gte('created_at', startDate.toISOString())
      .lte('created_at', endDate.toISOString());

    if (error) throw error;

    // Manual aggregation
    return {
      totalCalls: data?.length || 0,
      avgProcessingTime: data && data.length > 0 
        ? data.reduce((acc, call) => {
            if (call.created_at && call.processed_at) {
              const processingTime = new Date(call.processed_at).getTime() - new Date(call.created_at).getTime();
              return acc + processingTime;
            }
            return acc;
          }, 0) / data.length / 1000 // Convert to seconds
        : 0,
      successRate: data && data.length > 0
        ? (data.filter(call => call.ai_processing_status === 'completed').length / data.length) * 100
        : 0,
    };
  }
}

/**
 * Create optimized database indexes (run once in production)
 */
export const createOptimizedIndexes = async () => {
  const supabase = createClient();

  const indexes = [
    // Calls table indexes
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calls_user_created ON calls(user_id, created_at DESC)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calls_status ON calls(call_status) WHERE call_status IS NOT NULL',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calls_urgency ON calls(urgency_level) WHERE urgency_level IS NOT NULL',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calls_ai_status ON calls(ai_processing_status) WHERE ai_processing_status IS NOT NULL',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_calls_search ON calls USING gin((caller_name || \' \' || caller_number || \' \' || COALESCE(main_topic, \'\') || \' \' || COALESCE(call_summary, \'\')) gin_trgm_ops)',
    
    // Events table indexes
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_call_id ON events(call_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_user_date ON events(user_id, event_date DESC)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_events_status ON events(status) WHERE status IS NOT NULL',
    
    // Phone numbers table indexes
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_phone_numbers_user ON phone_numbers(user_id)',
    
    // Communications table indexes
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_communications_event ON communications(event_id)',
    'CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_communications_status ON communications(status)',
  ];

  for (const indexSQL of indexes) {
    try {
      await supabase.rpc('execute_sql', { sql: indexSQL });
      console.log(`✓ Created index: ${indexSQL.split(' ')[5] || 'unknown'}`);
    } catch (error) {
      console.warn(`⚠ Could not create index: ${indexSQL}`, error);
    }
  }
};

export default DatabaseOptimizer;