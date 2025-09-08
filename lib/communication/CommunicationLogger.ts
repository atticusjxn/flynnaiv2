// Flynn.ai v2 - Communication Logger
// Track and manage all customer communications

import { createClient } from '@/lib/supabase/server';
import { Database } from '@/types/database.types';

type CommunicationLog =
  Database['public']['Tables']['communication_logs']['Row'];
type CommunicationInsert =
  Database['public']['Tables']['communication_logs']['Insert'];
type CommunicationUpdate =
  Database['public']['Tables']['communication_logs']['Update'];

export interface CommunicationMetrics {
  total_communications: number;
  email_count: number;
  sms_count: number;
  call_count: number;
  success_rate: number;
  recent_activity: CommunicationLog[];
}

export interface CommunicationFilters {
  userId?: string;
  eventId?: string;
  callId?: string;
  communicationType?: 'email' | 'sms' | 'call';
  status?: 'pending' | 'sent' | 'delivered' | 'failed' | 'bounced';
  dateFrom?: Date;
  dateTo?: Date;
  recipient?: string;
}

export class CommunicationLogger {
  private getSupabaseClient() {
    return createClient();
  }

  async logCommunication(communication: CommunicationInsert): Promise<{
    success: boolean;
    id?: string;
    error?: string;
  }> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('communication_logs')
        .insert({
          ...communication,
          created_at: new Date().toISOString(),
        })
        .select()
        .single();

      if (error) throw error;

      return { success: true, id: data.id };
    } catch (error) {
      console.error('Failed to log communication:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async updateCommunicationStatus(
    id: string,
    updates: Pick<
      CommunicationUpdate,
      'status' | 'delivered_at' | 'error_message' | 'external_id'
    >
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { error } = await this.getSupabaseClient()
        .from('communication_logs')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Failed to update communication status:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async getCommunicationLogs(
    filters: CommunicationFilters = {},
    page: number = 1,
    limit: number = 50
  ): Promise<{
    communications: CommunicationLog[];
    totalCount: number;
    totalPages: number;
  }> {
    try {
      let query = this.getSupabaseClient()
        .from('communication_logs')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.userId) {
        query = query.eq('user_id', filters.userId);
      }
      if (filters.eventId) {
        query = query.eq('event_id', filters.eventId);
      }
      if (filters.callId) {
        query = query.eq('call_id', filters.callId);
      }
      if (filters.communicationType) {
        query = query.eq('communication_type', filters.communicationType);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }
      if (filters.recipient) {
        query = query.ilike('recipient', `%${filters.recipient}%`);
      }
      if (filters.dateFrom) {
        query = query.gte('created_at', filters.dateFrom.toISOString());
      }
      if (filters.dateTo) {
        query = query.lte('created_at', filters.dateTo.toISOString());
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, count, error } = await query;

      if (error) throw error;

      const totalPages = Math.ceil((count || 0) / limit);

      return {
        communications: data || [],
        totalCount: count || 0,
        totalPages,
      };
    } catch (error) {
      console.error('Failed to get communication logs:', error);
      return {
        communications: [],
        totalCount: 0,
        totalPages: 0,
      };
    }
  }

  async getCommunicationMetrics(
    userId?: string,
    dateFrom?: Date,
    dateTo?: Date
  ): Promise<CommunicationMetrics> {
    try {
      let baseQuery = this.getSupabaseClient().from('communication_logs').select('*');

      if (userId) {
        baseQuery = baseQuery.eq('user_id', userId);
      }
      if (dateFrom) {
        baseQuery = baseQuery.gte('created_at', dateFrom.toISOString());
      }
      if (dateTo) {
        baseQuery = baseQuery.lte('created_at', dateTo.toISOString());
      }

      const { data: communications, error } = await baseQuery;

      if (error) throw error;

      const total = communications?.length || 0;
      const emailCount =
        communications?.filter((c) => c.communication_type === 'email')
          .length || 0;
      const smsCount =
        communications?.filter((c) => c.communication_type === 'sms').length ||
        0;
      const callCount =
        communications?.filter((c) => c.communication_type === 'call').length ||
        0;

      const successfulCommunications =
        communications?.filter((c) =>
          ['sent', 'delivered'].includes(c.status || '')
        ).length || 0;

      const successRate =
        total > 0 ? (successfulCommunications / total) * 100 : 0;

      // Get recent activity (last 10 communications)
      const recentActivity = (communications || [])
        .sort(
          (a, b) =>
            new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        )
        .slice(0, 10);

      return {
        total_communications: total,
        email_count: emailCount,
        sms_count: smsCount,
        call_count: callCount,
        success_rate: Math.round(successRate * 100) / 100,
        recent_activity: recentActivity,
      };
    } catch (error) {
      console.error('Failed to get communication metrics:', error);
      return {
        total_communications: 0,
        email_count: 0,
        sms_count: 0,
        call_count: 0,
        success_rate: 0,
        recent_activity: [],
      };
    }
  }

  async getEventCommunications(eventId: string): Promise<CommunicationLog[]> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('communication_logs')
        .select('*')
        .eq('event_id', eventId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Failed to get event communications:', error);
      return [];
    }
  }

  async getCallCommunications(callId: string): Promise<CommunicationLog[]> {
    try {
      const { data, error } = await this.getSupabaseClient()
        .from('communication_logs')
        .select('*')
        .eq('call_id', callId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Failed to get call communications:', error);
      return [];
    }
  }

  async getFailedCommunications(
    userId?: string,
    hours: number = 24
  ): Promise<CommunicationLog[]> {
    try {
      const cutoffTime = new Date(
        Date.now() - hours * 60 * 60 * 1000
      ).toISOString();

      let query = this.getSupabaseClient()
        .from('communication_logs')
        .select('*')
        .eq('status', 'failed')
        .gte('created_at', cutoffTime)
        .order('created_at', { ascending: false });

      if (userId) {
        query = query.eq('user_id', userId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data || [];
    } catch (error) {
      console.error('Failed to get failed communications:', error);
      return [];
    }
  }

  async markAsDelivered(
    externalId: string,
    communicationType: 'email' | 'sms'
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { error } = await this.getSupabaseClient()
        .from('communication_logs')
        .update({
          status: 'delivered',
          delivered_at: new Date().toISOString(),
        })
        .eq('external_id', externalId)
        .eq('communication_type', communicationType);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Failed to mark communication as delivered:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async markAsFailed(
    externalId: string,
    communicationType: 'email' | 'sms',
    errorMessage: string
  ): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      const { error } = await this.getSupabaseClient()
        .from('communication_logs')
        .update({
          status: 'failed',
          error_message: errorMessage,
        })
        .eq('external_id', externalId)
        .eq('communication_type', communicationType);

      if (error) throw error;

      return { success: true };
    } catch (error) {
      console.error('Failed to mark communication as failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async retryCommunication(communicationId: string): Promise<{
    success: boolean;
    error?: string;
  }> {
    try {
      // Get the original communication
      const { data: originalComm, error: fetchError } = await this.getSupabaseClient()
        .from('communication_logs')
        .select('*')
        .eq('id', communicationId)
        .single();

      if (fetchError || !originalComm) {
        return { success: false, error: 'Communication not found' };
      }

      // Create a new retry communication log
      const retryComm: CommunicationInsert = {
        user_id: originalComm.user_id,
        event_id: originalComm.event_id,
        call_id: originalComm.call_id,
        communication_type: originalComm.communication_type,
        recipient: originalComm.recipient,
        subject: `[RETRY] ${originalComm.subject}`,
        content: originalComm.content,
        status: 'pending',
      };

      const result = await this.logCommunication(retryComm);

      if (result.success) {
        // Mark original as retried (you might want to add this status)
        await this.getSupabaseClient()
          .from('communication_logs')
          .update({ error_message: `Retried as ${result.id}` })
          .eq('id', communicationId);
      }

      return result;
    } catch (error) {
      console.error('Failed to retry communication:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  async deleteCommunicationLogs(
    userId: string,
    olderThanDays: number = 90
  ): Promise<{
    success: boolean;
    deletedCount: number;
    error?: string;
  }> {
    try {
      const cutoffDate = new Date(
        Date.now() - olderThanDays * 24 * 60 * 60 * 1000
      ).toISOString();

      const { data, error } = await this.getSupabaseClient()
        .from('communication_logs')
        .delete()
        .eq('user_id', userId)
        .lt('created_at', cutoffDate)
        .select('id');

      if (error) throw error;

      return {
        success: true,
        deletedCount: data?.length || 0,
      };
    } catch (error) {
      console.error('Failed to delete old communication logs:', error);
      return {
        success: false,
        deletedCount: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}

// Export singleton instance
export const communicationLogger = new CommunicationLogger();
