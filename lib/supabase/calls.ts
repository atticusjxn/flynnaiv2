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

// Individual function exports for webhook compatibility
export async function createCallRecord(callData: CallInsert): Promise<Call | null> {
  const callService = new CallService();
  return await callService.createCall(callData);
}

export async function updateCallWithRecording(
  twilioSid: string, 
  recordingData: { 
    recording_url: string;
    recording_sid?: string;
    duration?: number | null;
    status: string;
  }
): Promise<Call | null> {
  const callService = new CallService();
  
  // First get the call by Twilio SID
  const call = await callService.getCallByTwilioSid(twilioSid);
  if (!call) {
    console.error('Call not found for Twilio SID:', twilioSid);
    return null;
  }

  // Update the call with recording information
  return await callService.updateCall(call.id, {
    recording_url: recordingData.recording_url,
    recording_sid: recordingData.recording_sid,
    call_duration: recordingData.duration,
    call_status: recordingData.status as any,
    updated_at: new Date().toISOString()
  });
}

export async function updateCallStatus(twilioSid: string, status: string): Promise<void> {
  const callService = new CallService();
  
  // First get the call by Twilio SID
  const call = await callService.getCallByTwilioSid(twilioSid);
  if (!call) {
    console.error('Call not found for Twilio SID:', twilioSid);
    return;
  }

  // Update the call status
  await callService.updateCall(call.id, {
    call_status: status as any,
    updated_at: new Date().toISOString()
  });
}

export async function updateCallWithKeypadActivation(
  twilioSid: string, 
  activationData: {
    ai_processing_activated: boolean;
    ai_activation_time: string;
    keypad_sequence: string;
  }
): Promise<void> {
  const callService = new CallService();
  
  // Get the call by Twilio SID
  const call = await callService.getCallByTwilioSid(twilioSid);
  if (!call) {
    console.error('Call not found for Twilio SID:', twilioSid);
    return;
  }

  // Update call with keypad activation info
  await callService.updateCall(call.id, {
    ai_processing_status: 'keypad_activated',
    // Store activation data in metadata (assuming metadata field exists)
    updated_at: new Date().toISOString()
  });
}

export async function updateCallProcessingStatus(
  twilioSid: string, 
  status: string
): Promise<void> {
  const callService = new CallService();
  
  // Get the call by Twilio SID
  const call = await callService.getCallByTwilioSid(twilioSid);
  if (!call) {
    console.error('Call not found for Twilio SID:', twilioSid);
    return;
  }

  // Update call processing status
  await callService.updateCall(call.id, {
    ai_processing_status: status as any,
    updated_at: new Date().toISOString()
  });
}