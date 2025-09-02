// AI Extraction Pipeline for Flynn.ai v2 - End-to-end call processing
// Processes recorded calls from transcription through to email delivery

import OpenAI from 'openai';
import { createAdminClient } from '@/utils/supabase/server';
import { liveEventExtractor, ExtractedEvent, LiveExtractionResult } from '@/lib/ai/LiveEventExtractor';
import { callProcessingManager } from '@/lib/ai/CallProcessingManager';
import { BusinessCallDetection } from '@/lib/ai/BusinessCallDetection';
import { validateEnvironment } from '@/lib/validation/schemas';
import { Logger, withRetry, withMemoryCleanup, CallProcessingError } from '@/lib/utils/errorHandling';

// Validate environment on startup
validateEnvironment();

// Initialize OpenAI client with validation
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY!,
});

export interface CallProcessingResult {
  callSid: string;
  success: boolean;
  transcription?: string;
  events: ExtractedEvent[];
  processingTime: number;
  errorMessage?: string;
}

interface CallDetailsForProcessing {
  id: string;
  user_id: string;
  twilio_call_sid: string;
  duration: number | null;
  caller_number: string | null;
  created_at: string;
  users: {
    id: string;
    email: string;
    company_name: string | null;
    industry_type: string | null;
    phone_number: string | null;
  };
}

interface TranscriptionUpdateData {
  transcription: string | null;
  mainTopic: string | null;
  urgencyLevel: 'low' | 'medium' | 'high' | 'emergency';
  aiProcessingStatus: string;
}

export class AIExtractionPipeline {
  private static instance: AIExtractionPipeline;
  private logger = new Logger('AIExtractionPipeline');

  public static getInstance(): AIExtractionPipeline {
    if (!AIExtractionPipeline.instance) {
      AIExtractionPipeline.instance = new AIExtractionPipeline();
    }
    return AIExtractionPipeline.instance;
  }

  /**
   * Main entry point - process a recorded call with retry logic
   */
  public async processRecordedCall(callSid: string, recordingUrl: string): Promise<CallProcessingResult> {
    return withRetry(
      () => this.processRecordedCallInternal(callSid, recordingUrl),
      {
        maxRetries: 3,
        baseDelay: 1000,
        retryIf: (error) => {
          // Retry on network errors and temporary failures, not on validation errors
          return !error.message.includes('Validation') && 
                 !error.message.includes('Invalid') &&
                 !error.message.includes('No call details found');
        }
      }
    );
  }

  /**
   * Internal processing method with comprehensive error handling
   */
  private async processRecordedCallInternal(callSid: string, recordingUrl: string): Promise<CallProcessingResult> {
    const startTime = Date.now();
    
    try {
      this.logger.info('Starting AI extraction pipeline', { callSid, recordingUrl });

      // Step 1: Get call details and user info
      const callDetails = await this.getCallDetails(callSid);
      if (!callDetails) {
        throw new CallProcessingError(
          `No call details found for ${callSid}`,
          'CALL_NOT_FOUND',
          callSid,
          'high',
          false
        );
      }

      // Step 2: Transcribe the recording with memory management
      this.logger.info('Starting transcription', { callSid });
      const transcription = await withMemoryCleanup(
        () => this.transcribeRecording(recordingUrl),
        this.logger
      );
      
      if (!transcription || transcription.trim().length < 20) {
        throw new CallProcessingError(
          'Transcription failed or too short',
          'TRANSCRIPTION_FAILED',
          callSid,
          'high',
          true
        );
      }

      // Step 3: Extract events using the live extractor with industry context
      this.logger.info('Extracting events from transcription', { callSid, transcriptionLength: transcription.length });
      const industry = callDetails.users?.industry_type || 'general';
      
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
      
      this.logger.info('AI extraction pipeline completed', { 
        callSid, 
        eventCount: extractionResult.events.length, 
        processingTime 
      });

      return {
        callSid,
        success: true,
        transcription,
        events: extractionResult.events,
        processingTime
      };

    } catch (error) {
      const processingTime = Date.now() - startTime;
      
      this.logger.error('AI extraction pipeline failed', error instanceof Error ? error : new Error(String(error)));
      
      // Update call status with error
      try {
        await this.updateCallWithTranscription(callSid, {
          transcription: null,
          mainTopic: null,
          urgencyLevel: 'medium',
          aiProcessingStatus: 'extraction_failed'
        });
      } catch (updateError) {
        this.logger.error('Failed to update call status', updateError instanceof Error ? updateError : new Error(String(updateError)));
      }

      if (error instanceof CallProcessingError) {
        throw error;
      }

      throw new CallProcessingError(
        error instanceof Error ? error.message : 'Unknown error',
        'PROCESSING_FAILED',
        callSid,
        'high',
        true,
        { processingTime, originalError: error }
      );
    }
  }

  /**
   * Transcribe audio recording using OpenAI Whisper with memory management
   */
  private async transcribeRecording(recordingUrl: string): Promise<string> {
    let audioBuffer: ArrayBuffer | undefined;
    let audioFile: File | undefined;
    
    try {
      this.logger.info('Starting transcription', { recordingUrl });

      // Download the recording from Twilio with proper auth
      const response = await fetch(recordingUrl + '.wav', {
        method: 'GET',
        headers: {
          'Authorization': `Basic ${Buffer.from(
            `${process.env.TWILIO_ACCOUNT_SID}:${process.env.TWILIO_AUTH_TOKEN}`
          ).toString('base64')}`
        }
      });

      if (!response.ok) {
        throw new CallProcessingError(
          `Failed to download recording: ${response.statusText}`,
          'RECORDING_DOWNLOAD_FAILED',
          'unknown',
          'high',
          true
        );
      }

      // Convert to file-like object for OpenAI with size limits
      audioBuffer = await response.arrayBuffer();
      const audioSizeMB = audioBuffer.byteLength / (1024 * 1024);
      
      if (audioSizeMB > 100) { // 100MB limit for safety
        throw new CallProcessingError(
          `Recording too large: ${audioSizeMB.toFixed(1)}MB`,
          'RECORDING_TOO_LARGE',
          'unknown',
          'medium',
          false
        );
      }

      this.logger.info('Audio downloaded', { sizeMB: audioSizeMB.toFixed(2) });

      audioFile = new File([audioBuffer], 'recording.wav', { type: 'audio/wav' });

      // Transcribe using Whisper with Australian English optimization
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'en',
        response_format: 'text',
        temperature: 0.1, // Lower temperature for more accurate transcription
        prompt: 'This is a business phone call in Australian English. Please transcribe accurately, including proper names, addresses, phone numbers, and technical terms related to trades, real estate, legal, and medical services.'
      });

      this.logger.info('Transcription completed', { 
        transcriptionLength: transcription.length,
        audioSizeMB: audioSizeMB.toFixed(2)
      });
      
      return transcription;

    } catch (error) {
      this.logger.error('Transcription failed', error instanceof Error ? error : new Error(String(error)));
      
      if (error instanceof CallProcessingError) {
        throw error;
      }
      
      throw new CallProcessingError(
        `Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'TRANSCRIPTION_FAILED',
        'unknown',
        'high',
        true
      );
    } finally {
      // Explicit memory cleanup
      try {
        if (audioBuffer) {
          audioBuffer = undefined;
        }
        if (audioFile) {
          audioFile = undefined;
        }
        
        // Force garbage collection if available (Node.js)
        if (global.gc && typeof global.gc === 'function') {
          global.gc();
        }
      } catch (cleanupError) {
        this.logger.warn('Memory cleanup warning', cleanupError instanceof Error ? cleanupError : new Error(String(cleanupError)));
      }
    }
  }

  /**
   * Get call details from database with proper typing
   */
  private async getCallDetails(callSid: string): Promise<CallDetailsForProcessing | null> {
    try {
      const supabase = createAdminClient();
      
      const { data: call, error } = await supabase
        .from('calls')
        .select(`
          id,
          user_id,
          twilio_call_sid,
          duration,
          caller_number,
          created_at,
          users!inner (
            id,
            email,
            company_name,
            industry_type,
            phone_number
          )
        `)
        .eq('twilio_call_sid', callSid)
        .single();

      if (error) {
        this.logger.error('Database error fetching call details', error);
        return null;
      }

      return call as CallDetailsForProcessing;
    } catch (error) {
      this.logger.error('Error fetching call details', error instanceof Error ? error : new Error(String(error)));
      return null;
    }
  }

  /**
   * Update call record with transcription and extraction results
   */
  private async updateCallWithTranscription(callSid: string, data: TranscriptionUpdateData): Promise<void> {
    try {
      const supabase = createAdminClient();
      
      const { error } = await supabase
        .from('calls')
        .update({
          transcription_text: data.transcription,
          main_topic: data.mainTopic,
          urgency_level: data.urgencyLevel,
          ai_processing_status: data.aiProcessingStatus,
          updated_at: new Date().toISOString()
        })
        .eq('twilio_call_sid', callSid);

      if (error) {
        this.logger.error('Database error updating call', error);
        throw error;
      }

    } catch (error) {
      this.logger.error(`Error updating call ${callSid} with transcription`, error instanceof Error ? error : new Error(String(error)));
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

  /**
   * Business call detection - determines if a call should be processed for events
   */
  public async detectBusinessCall(
    transcription: string,
    industry?: string,
    companyName?: string
  ): Promise<boolean> {
    try {
      const detector = new BusinessCallDetection();
      const result = await detector.detectBusinessCall(transcription, industry, companyName);
      
      console.log(`Business call detection: ${result.isBusinessCall} (confidence: ${result.confidence}, type: ${result.callType})`);
      
      return result.isBusinessCall && result.confidence > 0.3; // Require minimum confidence
    } catch (error) {
      console.error('Business call detection failed:', error);
      // Default to true for business processing if detection fails
      return true;
    }
  }

  /**
   * Enhanced transcription that handles Australian phone numbers and accents
   */
  public async transcribeRecording(recordingUrl: string): Promise<string> {
    try {
      // Download the recording
      const response = await fetch(recordingUrl);
      if (!response.ok) {
        throw new Error(`Failed to download recording: ${response.statusText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const audioFile = new File([audioBuffer], 'recording.wav', { type: 'audio/wav' });

      // Use OpenAI Whisper for transcription with Australian English optimization
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'en', // English
        prompt: 'This is a business phone call in Australian English. Please transcribe accurately, including proper names, addresses, phone numbers, and technical terms related to trades, real estate, legal, and medical services.',
        temperature: 0.1 // Lower temperature for more accurate transcription
      });

      return transcription.text || '';
    } catch (error) {
      console.error('Transcription failed:', error);
      throw new Error(`Transcription failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Enhanced event extraction with Australian context
   */
  public async extractEvents(
    transcription: string,
    industry: string,
    companyName?: string
  ): Promise<ExtractedEvent[]> {
    try {
      const events = await liveEventExtractor.extractEventsFromTranscription(
        transcription,
        industry,
        {
          companyName,
          timezone: 'Australia/Sydney', // Default Australian timezone
          currency: 'AUD',
          dateFormat: 'DD/MM/YYYY', // Australian date format
          phoneFormat: 'Australian', // Handle 04xx mobile numbers, 02/03/07/08 landlines
        }
      );

      return events;
    } catch (error) {
      console.error('Event extraction failed:', error);
      return [];
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