// Silent Call Processing Manager for Flynn.ai v2 - Complete call lifecycle management

import { keypadActivationManager, cleanupCallActivation } from '@/lib/ai/KeypadActivation';
import { realTimeAudioProcessor, stopRealTimeProcessing } from '@/lib/ai/RealTimeProcessor';
import { updateCallProcessingStatus } from '@/lib/supabase/calls';
import { createAdminClient } from '@/utils/supabase/server';
import { sendInstantAppointmentEmail } from '@/lib/email/InstantEmailService';
import { validateCallCompliance, recordCallCompliance } from '@/lib/compliance/PrivacyCompliance';
import { scheduleCallDataDeletion } from '@/lib/compliance/DataRetention';

export interface CallProcessingState {
  callSid: string;
  status: CallProcessingStatus;
  aiActivated: boolean;
  activationTime: string | null;
  processingStartTime: string | null;
  completionTime: string | null;
  errorCount: number;
  lastError: string | null;
  eventsExtracted: number;
  processingMetrics: ProcessingMetrics;
}

export interface ProcessingMetrics {
  transcriptionChunks: number;
  extractionAttempts: number;
  averageConfidence: number;
  processingLatency: number;
  audioQuality: number;
}

export type CallProcessingStatus = 
  | 'idle'
  | 'waiting_for_activation' 
  | 'keypad_activated'
  | 'media_stream_connected'
  | 'real_time_processing'
  | 'extracting_events'
  | 'processing_complete'
  | 'email_generation'
  | 'email_sent'
  | 'completed'
  | 'failed'
  | 'timeout';

export class CallProcessingManager {
  private static instance: CallProcessingManager;
  private callStates: Map<string, CallProcessingState> = new Map();
  private processingTimeouts: Map<string, NodeJS.Timeout> = new Map();
  
  // Silent processing configuration
  private readonly MAX_PROCESSING_TIME = 10 * 60 * 1000; // 10 minutes max
  private readonly CLEANUP_DELAY = 2 * 60 * 1000; // 2 minutes after call ends
  private readonly ERROR_THRESHOLD = 3; // Max errors before failing

  public static getInstance(): CallProcessingManager {
    if (!CallProcessingManager.instance) {
      CallProcessingManager.instance = new CallProcessingManager();
    }
    return CallProcessingManager.instance;
  }

  /**
   * Initialize call processing for a new call
   */
  public async initializeCall(callSid: string): Promise<void> {
    console.log(`Initializing silent processing management for call: ${callSid}`);

    const initialState: CallProcessingState = {
      callSid,
      status: 'waiting_for_activation',
      aiActivated: false,
      activationTime: null,
      processingStartTime: null,
      completionTime: null,
      errorCount: 0,
      lastError: null,
      eventsExtracted: 0,
      processingMetrics: {
        transcriptionChunks: 0,
        extractionAttempts: 0,
        averageConfidence: 0,
        processingLatency: 0,
        audioQuality: 0
      }
    };

    this.callStates.set(callSid, initialState);

    // Set timeout for maximum processing time
    const timeout = setTimeout(() => {
      this.handleProcessingTimeout(callSid);
    }, this.MAX_PROCESSING_TIME);
    
    this.processingTimeouts.set(callSid, timeout);

    await this.updateCallStatus(callSid, 'waiting_for_activation');
  }

  /**
   * Handle keypad activation (*7 pressed)
   */
  public async handleKeypadActivation(callSid: string): Promise<void> {
    const state = this.callStates.get(callSid);
    if (!state) {
      console.error(`No call state found for ${callSid} during keypad activation`);
      return;
    }

    console.log(`Handling silent keypad activation for call: ${callSid}`);

    // First validate compliance before proceeding
    const userId = await this.getUserIdForCall(callSid);
    const callerPhone = await this.getCallerPhoneForCall(callSid);
    
    if (userId) {
      const complianceCheck = await validateCallCompliance(callSid, userId, callerPhone || undefined);
      
      if (!complianceCheck.compliant) {
        console.warn(`Compliance check failed for call ${callSid}: ${complianceCheck.reason}`);
        state.status = 'failed';
        state.lastError = complianceCheck.reason || 'Compliance check failed';
        await this.updateCallStatus(callSid, 'failed');
        return;
      }

      // Record consent for keypad activation
      await recordCallCompliance(callSid, userId, 'keypad_activation');
    }

    // Update state silently
    state.aiActivated = true;
    state.activationTime = new Date().toISOString();
    state.processingStartTime = new Date().toISOString();
    state.status = 'keypad_activated';

    this.callStates.set(callSid, state);

    await this.updateCallStatus(callSid, 'keypad_activated');

    // Start real-time processing pipeline
    await this.startProcessingPipeline(callSid);
  }

  /**
   * Start the complete processing pipeline
   */
  private async startProcessingPipeline(callSid: string): Promise<void> {
    try {
      console.log(`Starting silent processing pipeline for call: ${callSid}`);

      // Update status to indicate processing has started
      await this.updateCallStatus(callSid, 'real_time_processing');

      // The RealTimeProcessor will handle the actual audio processing
      // This manager just tracks the state silently

    } catch (error) {
      console.error(`Error starting processing pipeline for call ${callSid}:`, error);
      await this.handleProcessingError(callSid, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Update processing metrics during live processing
   */
  public async updateProcessingMetrics(
    callSid: string, 
    metrics: Partial<ProcessingMetrics>
  ): Promise<void> {
    const state = this.callStates.get(callSid);
    if (!state) return;

    // Update metrics silently
    state.processingMetrics = { ...state.processingMetrics, ...metrics };
    this.callStates.set(callSid, state);

    // No external indication - completely silent
  }

  /**
   * Handle extraction completion
   */
  public async handleExtractionComplete(callSid: string, eventsCount: number): Promise<void> {
    const state = this.callStates.get(callSid);
    if (!state) return;

    console.log(`Silent extraction completed for call ${callSid}: ${eventsCount} events`);

    state.eventsExtracted = eventsCount;
    state.status = 'processing_complete';
    state.completionTime = new Date().toISOString();

    this.callStates.set(callSid, state);

    await this.updateCallStatus(callSid, 'processing_complete');

    // Trigger email generation if events were found
    if (eventsCount > 0) {
      await this.triggerEmailGeneration(callSid);
    }
  }

  /**
   * Trigger email generation silently
   */
  private async triggerEmailGeneration(callSid: string): Promise<void> {
    try {
      console.log(`Triggering silent email generation for call: ${callSid}`);

      await this.updateCallStatus(callSid, 'email_generation');

      // Get call details and user information
      const callDetails = await this.getCallDetailsForEmail(callSid);
      
      if (!callDetails) {
        console.error(`No call details found for email generation: ${callSid}`);
        await this.handleProcessingError(callSid, 'Call details not found');
        return;
      }

      // Get extracted events from the processing state
      const state = this.callStates.get(callSid);
      const extractedEvents = await this.getExtractedEventsForCall(callSid);

      // Prepare email delivery request
      const emailRequest = {
        callSid: callSid,
        userId: callDetails.user_id,
        userEmail: callDetails.user_email,
        companyName: callDetails.company_name,
        industry: callDetails.industry || 'general',
        extractedEvents: extractedEvents,
        callDuration: callDetails.duration,
        callerPhone: callDetails.caller_number,
        transcriptionText: callDetails.transcription
      };

      // Send instant email
      await sendInstantAppointmentEmail(emailRequest);

      // Mark email as sent immediately (the service handles delivery asynchronously)
      await this.handleEmailSent(callSid);

    } catch (error) {
      console.error(`Error triggering email generation for call ${callSid}:`, error);
      await this.handleProcessingError(callSid, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Handle email sent completion
   */
  public async handleEmailSent(callSid: string): Promise<void> {
    console.log(`Email sent silently for call: ${callSid}`);

    await this.updateCallStatus(callSid, 'email_sent');

    // Mark as completed
    setTimeout(() => {
      this.completeCallProcessing(callSid);
    }, 1000);
  }

  /**
   * Complete call processing and cleanup
   */
  public async completeCallProcessing(callSid: string): Promise<void> {
    console.log(`Completing silent processing for call: ${callSid}`);

    const state = this.callStates.get(callSid);
    if (state) {
      state.status = 'completed';
      state.completionTime = new Date().toISOString();
      this.callStates.set(callSid, state);
    }

    await this.updateCallStatus(callSid, 'completed');

    // Schedule data retention and deletion per compliance policies
    const userId = await this.getUserIdForCall(callSid);
    const userIndustry = await this.getUserIndustry(callSid);
    
    if (userId) {
      await scheduleCallDataDeletion(callSid, userId, userIndustry);
    }

    // Schedule cleanup
    setTimeout(() => {
      this.cleanupCall(callSid);
    }, this.CLEANUP_DELAY);
  }

  /**
   * Handle call end (when Twilio call ends)
   */
  public async handleCallEnd(callSid: string): Promise<void> {
    console.log(`Handling call end for: ${callSid}`);

    const state = this.callStates.get(callSid);
    if (state && state.aiActivated) {
      // Stop real-time processing
      await stopRealTimeProcessing(callSid);
      
      // If we haven't completed processing, try to finalize
      if (state.status !== 'completed' && state.status !== 'failed') {
        await this.finalizeProcessing(callSid);
      }
    }

    // Schedule cleanup
    setTimeout(() => {
      this.cleanupCall(callSid);
    }, this.CLEANUP_DELAY);
  }

  /**
   * Finalize processing when call ends
   */
  private async finalizeProcessing(callSid: string): Promise<void> {
    try {
      console.log(`Finalizing processing for ended call: ${callSid}`);

      // Let RealTimeProcessor finish any pending work
      await stopRealTimeProcessing(callSid);

      // Check if we extracted any events
      const state = this.callStates.get(callSid);
      if (state && state.eventsExtracted > 0) {
        await this.triggerEmailGeneration(callSid);
      } else {
        await this.completeCallProcessing(callSid);
      }

    } catch (error) {
      console.error(`Error finalizing processing for call ${callSid}:`, error);
      await this.handleProcessingError(callSid, error instanceof Error ? error.message : 'Unknown error');
    }
  }

  /**
   * Handle processing errors silently
   */
  private async handleProcessingError(callSid: string, errorMessage: string): Promise<void> {
    const state = this.callStates.get(callSid);
    if (!state) return;

    state.errorCount++;
    state.lastError = errorMessage;
    
    console.error(`Silent processing error for call ${callSid} (${state.errorCount}/${this.ERROR_THRESHOLD}): ${errorMessage}`);

    if (state.errorCount >= this.ERROR_THRESHOLD) {
      state.status = 'failed';
      await this.updateCallStatus(callSid, 'failed');
      
      // Schedule cleanup
      setTimeout(() => {
        this.cleanupCall(callSid);
      }, this.CLEANUP_DELAY);
    } else {
      // Continue processing despite error
      this.callStates.set(callSid, state);
    }
  }

  /**
   * Handle processing timeout
   */
  private async handleProcessingTimeout(callSid: string): Promise<void> {
    console.log(`Processing timeout for call: ${callSid}`);

    await this.updateCallStatus(callSid, 'timeout');
    
    // Stop all processing
    await stopRealTimeProcessing(callSid);
    
    // Cleanup
    this.cleanupCall(callSid);
  }

  /**
   * Clean up call resources
   */
  private cleanupCall(callSid: string): void {
    console.log(`Cleaning up silent processing resources for call: ${callSid}`);

    // Clear timeout
    const timeout = this.processingTimeouts.get(callSid);
    if (timeout) {
      clearTimeout(timeout);
      this.processingTimeouts.delete(callSid);
    }

    // Clean up activation state
    cleanupCallActivation(callSid);

    // Remove from our state tracking
    this.callStates.delete(callSid);

    // Final status update
    this.updateCallStatus(callSid, 'completed').catch(error => {
      console.error(`Error in final cleanup for call ${callSid}:`, error);
    });
  }

  /**
   * Update call status in database (silently)
   */
  private async updateCallStatus(callSid: string, status: CallProcessingStatus): Promise<void> {
    try {
      await updateCallProcessingStatus(callSid, status);
    } catch (error) {
      console.error(`Error updating call status for ${callSid}:`, error);
    }
  }

  /**
   * Get current processing state for a call
   */
  public getCallState(callSid: string): CallProcessingState | null {
    return this.callStates.get(callSid) || null;
  }

  /**
   * Get all active calls being processed
   */
  public getActiveCalls(): CallProcessingState[] {
    return Array.from(this.callStates.values()).filter(
      state => state.status !== 'completed' && state.status !== 'failed'
    );
  }

  /**
   * Get processing statistics
   */
  public getProcessingStats(): {
    totalCalls: number;
    activeCalls: number;
    completedCalls: number;
    failedCalls: number;
  } {
    const states = Array.from(this.callStates.values());
    
    return {
      totalCalls: states.length,
      activeCalls: states.filter(s => !['completed', 'failed'].includes(s.status)).length,
      completedCalls: states.filter(s => s.status === 'completed').length,
      failedCalls: states.filter(s => s.status === 'failed').length
    };
  }

  /**
   * Get call details for email generation
   */
  private async getCallDetailsForEmail(callSid: string): Promise<any> {
    try {
      const supabase = createAdminClient();
      
      const { data: call } = await supabase
        .from('calls')
        .select(`
          *,
          users (
            email,
            company_name,
            industry
          )
        `)
        .eq('twilio_call_sid', callSid)
        .single();

      if (call && call.users) {
        return {
          ...call,
          user_email: call.users.email,
          company_name: call.users.company_name,
          industry: call.users.industry
        };
      }

      return call;
    } catch (error) {
      console.error(`Error fetching call details for email ${callSid}:`, error);
      return null;
    }
  }

  /**
   * Get extracted events for a call from database
   */
  private async getExtractedEventsForCall(callSid: string): Promise<any[]> {
    try {
      const supabase = createAdminClient();
      
      const { data: events } = await supabase
        .from('events')
        .select('*')
        .eq('call_id', callSid)
        .order('created_at', { ascending: true });

      return events || [];
    } catch (error) {
      console.error(`Error fetching extracted events for call ${callSid}:`, error);
      return [];
    }
  }

  /**
   * Get user ID for a call
   */
  private async getUserIdForCall(callSid: string): Promise<string | null> {
    try {
      const supabase = createAdminClient();
      
      const { data: call } = await supabase
        .from('calls')
        .select('user_id')
        .eq('twilio_call_sid', callSid)
        .single();

      return call?.user_id || null;
    } catch (error) {
      console.error(`Error fetching user ID for call ${callSid}:`, error);
      return null;
    }
  }

  /**
   * Get caller phone for a call
   */
  private async getCallerPhoneForCall(callSid: string): Promise<string | null> {
    try {
      const supabase = createAdminClient();
      
      const { data: call } = await supabase
        .from('calls')
        .select('caller_number')
        .eq('twilio_call_sid', callSid)
        .single();

      return call?.caller_number || null;
    } catch (error) {
      console.error(`Error fetching caller phone for call ${callSid}:`, error);
      return null;
    }
  }

  /**
   * Get user industry for a call
   */
  private async getUserIndustry(callSid: string): Promise<string> {
    try {
      const supabase = createAdminClient();
      
      const { data: call } = await supabase
        .from('calls')
        .select(`
          users (
            industry
          )
        `)
        .eq('twilio_call_sid', callSid)
        .single();

      return (call?.users as any)?.industry || 'general';
    } catch (error) {
      console.error(`Error fetching user industry for call ${callSid}:`, error);
      return 'general';
    }
  }
}

// Export singleton instance
export const callProcessingManager = CallProcessingManager.getInstance();

// Export convenience functions
export async function initializeCallProcessing(callSid: string): Promise<void> {
  return await callProcessingManager.initializeCall(callSid);
}

export async function handleCallActivation(callSid: string): Promise<void> {
  return await callProcessingManager.handleKeypadActivation(callSid);
}

export async function completeCallProcessing(callSid: string): Promise<void> {
  return await callProcessingManager.completeCallProcessing(callSid);
}

export async function handleCallEndProcessing(callSid: string): Promise<void> {
  return await callProcessingManager.handleCallEnd(callSid);
}