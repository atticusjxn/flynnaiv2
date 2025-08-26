// Flynn.ai v2 - Call Database Operations
import { createClient } from '@/utils/supabase/server';
import { Database } from '@/types/database.types';

type Call = Database['public']['Tables']['calls']['Row'];
type CallInsert = Database['public']['Tables']['calls']['Insert'];
type CallUpdate = Database['public']['Tables']['calls']['Update'];

export class CallService {
  private supabase = createClient();

  async createCall(callData: CallInsert): Promise<Call | null> {
    const { data, error } = await this.supabase
      .from('calls')
      .insert(callData)
      .select()
      .single();

    if (error) {
      console.error('Error creating call:', error);
      return null;
    }

    return data;
  }

  async updateCall(callId: string, updates: CallUpdate): Promise<Call | null> {
    const { data, error } = await this.supabase
      .from('calls')
      .update(updates)
      .eq('id', callId)
      .select()
      .single();

    if (error) {
      console.error('Error updating call:', error);
      return null;
    }

    return data;
  }

  async getCallById(callId: string): Promise<Call | null> {
    const { data, error } = await this.supabase
      .from('calls')
      .select('*')
      .eq('id', callId)
      .single();

    if (error) {
      console.error('Error fetching call:', error);
      return null;
    }

    return data;
  }

  async getCallByTwilioSid(twilioSid: string): Promise<Call | null> {
    const { data, error } = await this.supabase
      .from('calls')
      .select('*')
      .eq('twilio_call_sid', twilioSid)
      .single();

    if (error) {
      console.error('Error fetching call by Twilio SID:', error);
      return null;
    }

    return data;
  }

  async getUserCalls(
    userId: string,
    limit = 20,
    offset = 0
  ): Promise<Call[]> {
    const { data, error } = await this.supabase
      .from('calls')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching user calls:', error);
      return [];
    }

    return data || [];
  }

  async getProcessingCalls(): Promise<Call[]> {
    const { data, error } = await this.supabase
      .from('calls')
      .select('*')
      .eq('ai_processing_status', 'processing');

    if (error) {
      console.error('Error fetching processing calls:', error);
      return [];
    }

    return data || [];
  }

  async updateProcessingStatus(
    callId: string,
    status: 'pending' | 'processing' | 'completed' | 'failed',
    processedAt?: string
  ): Promise<void> {
    const updates: CallUpdate = { ai_processing_status: status };
    if (processedAt) {
      updates.processed_at = processedAt;
    }

    await this.supabase
      .from('calls')
      .update(updates)
      .eq('id', callId);
  }

  async markEmailSent(callId: string): Promise<void> {
    await this.supabase
      .from('calls')
      .update({ email_sent_at: new Date().toISOString() })
      .eq('id', callId);
  }
}