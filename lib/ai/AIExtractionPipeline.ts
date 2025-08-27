// AI Extraction Pipeline for Flynn.ai v2 - End-to-end call processing
// Processes recorded calls from transcription through to email delivery

import OpenAI from 'openai';
import { createAdminClient } from '@/utils/supabase/server';
import { liveEventExtractor, ExtractedEvent, LiveExtractionResult } from '@/lib/ai/LiveEventExtractor';
import { callProcessingManager } from '@/lib/ai/CallProcessingManager';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface CallProcessingResult {
  callSid: string;
  success: boolean;
  transcription?: string;
  events: ExtractedEvent[];
  processingTime: number;
  errorMessage?: string;
}

export class AIExtractionPipeline {
  private static instance: AIExtractionPipeline;

  public static getInstance(): AIExtractionPipeline {
    if (!AIExtractionPipeline.instance) {
      AIExtractionPipeline.instance = new AIExtractionPipeline();
    }
    return AIExtractionPipeline.instance;
  }

  /**
   * Main entry point - process a recorded call
   */
  public async processRecordedCall(callSid: string, recordingUrl: string): Promise<CallProcessingResult> {
    const startTime = Date.now();
    
    try {
      console.log(`Starting AI extraction pipeline for call ${callSid}`);

      // Step 1: Get call details and user info
      const callDetails = await this.getCallDetails(callSid);
      if (!callDetails) {
        throw new Error(`No call details found for ${callSid}`);
      }

      // Step 2: Transcribe the recording
      console.log(`Transcribing recording for call ${callSid}`);
      const transcription = await this.transcribeRecording(recordingUrl);
      
      if (!transcription || transcription.trim().length < 20) {
        throw new Error('Transcription failed or too short');
      }

      // Step 3: Extract events using the live extractor with industry context
      console.log(`Extracting events from transcription for call ${callSid}`);
      const industry = callDetails.users?.industry || 'general';
      
      const extractionResult = await liveEventExtractor.extractEventsFromLiveTranscription(
        callSid,
        transcription,
        industry,
        0.8
      );

      // Step 4: Store transcription in call record
      await this.updateCallWithTranscription(callSid, {
        transcription: transcription,
        mainTopic: extractionResult.events.length > 0 ? extractionResult.events[0].title : null,
        urgencyLevel: this.calculateOverallUrgency(extractionResult.events),
        aiProcessingStatus: 'extraction_completed'
      });

      // Step 5: Notify call processing manager of completion
      await callProcessingManager.handleExtractionComplete(callSid, extractionResult.events.length);

      const processingTime = Date.now() - startTime;
      
      console.log(`AI extraction pipeline completed for call ${callSid}: ${extractionResult.events.length} events in ${processingTime}ms`);

      return {
        callSid,
        success: true,
        transcription,
        events: extractionResult.events,
        processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      
      console.error(`AI extraction pipeline failed for call ${callSid}:`, error);
      
      // Update call status with error
      await this.updateCallWithTranscription(callSid, {
        transcription: null,
        mainTopic: null,
        urgencyLevel: 'medium',
        aiProcessingStatus: 'extraction_failed'
      });

      return {
        callSid,
        success: false,
        events: [],
        processingTime,
        errorMessage
      };
    }
  }

  /**
   * Transcribe audio recording using OpenAI Whisper
   */
  private async transcribeRecording(recordingUrl: string): Promise<string> {
    try {
      console.log(`Starting transcription for recording: ${recordingUrl}`);

      // Download the recording from Twilio
      const response = await fetch(recordingUrl + '.wav', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
          ).toString('base64')}`
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to download recording: ${response.statusText}`);
      }

      // Convert to file-like object for OpenAI
      const audioBuffer = await response.arrayBuffer();
      const audioFile = new File([audioBuffer], 'recording.wav', { type: 'audio/wav' });

      // Transcribe using Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'en',
        response_format: 'text',
        temperature: 0.2
      });

      console.log(`Transcription completed, length: ${transcription.length} characters`);
      
      return transcription;

    } catch (error) {
      console.error('Transcription error:', error);
      throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get call details from database
   */
  private async getCallDetails(callSid: string): Promise<any> {
    try {
      const supabase = createAdminClient();
      
      const { data: call } = await supabase
        .from('calls')
        .select(`
          *,
          users (
            id,
            email,
            company_name,
            industry,
            twilio_phone_number
          )
        `)
        .eq('twilio_call_sid', callSid)
        .single();

      return call;
    } catch (error) {
      console.error(`Error fetching call details for ${callSid}:`, error);
      return null;
    }
  }

  /**
   * Update call record with transcription and extraction results
   */
  private async updateCallWithTranscription(callSid: string, data: {
    transcription: string | null;
    mainTopic: string | null;
    urgencyLevel: string;
    aiProcessingStatus: string;
  }): Promise<void> {
    try {
      const supabase = createAdminClient();
      
      await supabase
        .from('calls')
        .update({
          transcription_text: data.transcription,
          main_topic: data.mainTopic,
          urgency_level: data.urgencyLevel,
          ai_processing_status: data.aiProcessingStatus,
          updated_at: new Date().toISOString()
        })
        .eq('twilio_call_sid', callSid);

    } catch (error) {
      console.error(`Error updating call ${callSid} with transcription:`, error);
      throw error;
    }
  }

  /**
   * Calculate overall urgency from multiple events
   */
  private calculateOverallUrgency(events: ExtractedEvent[]): 'low' | 'medium' | 'high' | 'emergency' {
    if (events.length === 0) return 'medium';
    
    const urgencyLevels = events.map(event => event.urgency);
    
    if (urgencyLevels.includes('emergency')) return 'emergency';
    if (urgencyLevels.includes('high')) return 'high';
    if (urgencyLevels.includes('medium')) return 'medium';
    return 'low';
  }

  /**
   * Process multiple recordings (batch processing)
   */
  public async processMultipleRecordings(recordings: Array<{ callSid: string; recordingUrl: string }>): Promise<CallProcessingResult[]> {
    const results: CallProcessingResult[] = [];
    
    // Process recordings in parallel with limited concurrency
    const concurrencyLimit = 3;
    const batches = this.chunkArray(recordings, concurrencyLimit);
    
    for (const batch of batches) {
      const batchPromises = batch.map(recording => 
        this.processRecordedCall(recording.callSid, recording.recordingUrl)
      );
      
      const batchResults = await Promise.allSettled(batchPromises);
      
      batchResults.forEach((result, index) => {
        if (result.status === 'fulfilled') {
          results.push(result.value);
        } else {
          results.push({
            callSid: batch[index].callSid,
            success: false,
            events: [],
            processingTime: 0,
            errorMessage: result.reason?.message || 'Unknown error'
          });
        }
      });
    }
    
    return results;
  }

  /**
   * Utility function to chunk array for batch processing
   */
  private chunkArray<T>(array: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += chunkSize) {
      chunks.push(array.slice(i, i + chunkSize));
    }
    return chunks;
  }

  /**
   * Get processing statistics
   */
  public async getProcessingStats(): Promise<{
    totalCallsProcessed: number;
    successfulExtractions: number;
    failedExtractions: number;
    averageProcessingTime: number;
  }> {
    try {
      const supabase = createAdminClient();
      
      const { data: stats } = await supabase
        .from('calls')
        .select('ai_processing_status')
        .not('ai_processing_status', 'is', null);

      const successful = stats?.filter(s => s.ai_processing_status === 'extraction_completed').length || 0;
      const failed = stats?.filter(s => s.ai_processing_status === 'extraction_failed').length || 0;
      const total = stats?.length || 0;

      return {
        totalCallsProcessed: total,
        successfulExtractions: successful,
        failedExtractions: failed,
        averageProcessingTime: 0 // TODO: Calculate from processing logs
      };
    } catch (error) {
      console.error('Error getting processing stats:', error);
      return {
        totalCallsProcessed: 0,
        successfulExtractions: 0,
        failedExtractions: 0,
        averageProcessingTime: 0
      };
    }
  }
}

// Export singleton instance
export const aiExtractionPipeline = AIExtractionPipeline.getInstance();

// Export convenience function for webhook usage
export async function processRecordedCall(callSid: string, recordingUrl: string): Promise<CallProcessingResult> {
  return await aiExtractionPipeline.processRecordedCall(callSid, recordingUrl);
}

// Export for batch processing
export async function processMultipleRecordings(recordings: Array<{ callSid: string; recordingUrl: string }>): Promise<CallProcessingResult[]> {
  return await aiExtractionPipeline.processMultipleRecordings(recordings);
}