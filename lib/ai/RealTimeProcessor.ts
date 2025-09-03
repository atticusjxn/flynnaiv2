// Real-Time AI Processor for Flynn.ai v2 - Live Audio Processing

import OpenAI from 'openai';
import { createAdminClient } from '@/utils/supabase/server';
import { updateCallProcessingStatus } from '@/lib/supabase/calls';
import { extractLiveEvents } from '@/lib/ai/LiveEventExtractor';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export interface AudioProcessingConfig {
  callSid: string;
  sampleRate: number;
  encoding: string;
  language: string;
}

export interface TranscriptionChunk {
  text: string;
  confidence: number;
  timestamp: number;
  duration: number;
}

export interface LiveEventExtraction {
  callSid: string;
  extractedEvents: any[];
  confidence: number;
  processingTime: number;
  transcriptionText: string;
}

export class RealTimeAudioProcessor {
  private activeProcessors: Map<string, AudioProcessingConfig> = new Map();
  private transcriptionBuffers: Map<string, TranscriptionChunk[]> = new Map();
  private audioBuffers: Map<string, Buffer[]> = new Map();

  /**
   * Start real-time processing for a call
   */
  public async startProcessing(callSid: string): Promise<boolean> {
    try {
      console.log(`Starting real-time AI processing for call: ${callSid}`);

      const config: AudioProcessingConfig = {
        callSid,
        sampleRate: 8000, // Twilio standard
        encoding: 'mulaw',
        language: 'en',
      };

      this.activeProcessors.set(callSid, config);
      this.transcriptionBuffers.set(callSid, []);
      this.audioBuffers.set(callSid, []);

      await updateCallProcessingStatus(callSid, 'real_time_processing_started');

      return true;
    } catch (error) {
      console.error(
        `Failed to start real-time processing for ${callSid}:`,
        error
      );
      return false;
    }
  }

  /**
   * Process incoming audio chunk in real-time
   */
  public async processAudioChunk(
    callSid: string,
    audioPayload: string,
    timestamp: number
  ): Promise<void> {
    try {
      if (!this.activeProcessors.has(callSid)) {
        console.warn(`No active processor for call: ${callSid}`);
        return;
      }

      // Convert base64 audio to buffer
      const audioBuffer = Buffer.from(audioPayload, 'base64');
      const buffers = this.audioBuffers.get(callSid) || [];
      buffers.push(audioBuffer);
      this.audioBuffers.set(callSid, buffers);

      // Process audio in 2-second chunks for real-time transcription
      if (buffers.length >= 16) {
        // ~2 seconds at 8kHz
        await this.transcribeAudioChunk(
          callSid,
          Buffer.concat(buffers),
          timestamp
        );
        // Keep only the last 8 buffers for overlap
        this.audioBuffers.set(callSid, buffers.slice(-8));
      }
    } catch (error) {
      console.error(`Error processing audio chunk for ${callSid}:`, error);
    }
  }

  /**
   * Transcribe audio chunk using OpenAI Whisper
   */
  private async transcribeAudioChunk(
    callSid: string,
    audioBuffer: Buffer,
    timestamp: number
  ): Promise<void> {
    try {
      console.log(`Transcribing audio chunk for call: ${callSid}`);

      // Convert mulaw to wav format for Whisper
      const wavBuffer = this.convertMulawToWav(audioBuffer);

      // Create a temporary file for Whisper API
      const audioBlob = new Blob([wavBuffer as any], { type: 'audio/wav' });
      const audioFile = new File([audioBlob], `${callSid}-${timestamp}.wav`, {
        type: 'audio/wav',
      });

      // Transcribe with Whisper
      const transcription = await openai.audio.transcriptions.create({
        file: audioFile,
        model: 'whisper-1',
        language: 'en',
        response_format: 'verbose_json',
      });

      if (transcription.text && transcription.text.trim().length > 0) {
        const chunk: TranscriptionChunk = {
          text: transcription.text,
          confidence: 0.8, // Whisper doesn't provide confidence scores
          timestamp,
          duration: transcription.duration || 2.0,
        };

        // Add to transcription buffer
        const chunks = this.transcriptionBuffers.get(callSid) || [];
        chunks.push(chunk);
        this.transcriptionBuffers.set(callSid, chunks);

        console.log(
          `Transcribed: "${transcription.text}" for call: ${callSid}`
        );

        // Process for event extraction if we have enough content
        if (chunks.length >= 3) {
          // ~6 seconds of transcription
          await this.extractEventsFromTranscription(callSid, chunks.slice(-5));
        }
      }
    } catch (error) {
      console.error(`Transcription error for call ${callSid}:`, error);
    }
  }

  /**
   * Extract events from accumulated transcription chunks using LiveEventExtractor
   */
  private async extractEventsFromTranscription(
    callSid: string,
    chunks: TranscriptionChunk[]
  ): Promise<void> {
    try {
      const combinedText = chunks.map((chunk) => chunk.text).join(' ');
      const avgConfidence =
        chunks.reduce((sum, chunk) => sum + chunk.confidence, 0) /
        chunks.length;

      console.log(`Extracting events from transcription for call: ${callSid}`);
      console.log(`Combined text: "${combinedText}"`);

      // Get user's industry context from call record
      const industry = await this.getCallIndustryContext(callSid);

      // Use LiveEventExtractor for comprehensive extraction
      const extractionResult = await extractLiveEvents(
        callSid,
        combinedText,
        industry,
        avgConfidence
      );

      if (extractionResult.events.length > 0) {
        console.log(
          `Extracted ${extractionResult.events.length} events from live call: ${callSid}`
        );

        // Update processing status
        await updateCallProcessingStatus(callSid, 'live_events_extracted');
      }
    } catch (error) {
      console.error(`Event extraction error for call ${callSid}:`, error);
    }
  }

  /**
   * Get industry context for a call from database
   */
  private async getCallIndustryContext(callSid: string): Promise<string> {
    try {
      const supabase = createAdminClient();

      const { data: call } = await supabase
        .from('calls')
        .select('users(industry)')
        .eq('twilio_call_sid', callSid)
        .single();

      return (call as any)?.users?.industry || 'general';
    } catch (error) {
      console.error(
        `Error getting industry context for call ${callSid}:`,
        error
      );
      return 'general';
    }
  }

  /**
   * Stop real-time processing for a call
   */
  public async stopProcessing(callSid: string): Promise<void> {
    try {
      console.log(`Stopping real-time AI processing for call: ${callSid}`);

      // Process any remaining audio/transcription
      const remainingChunks = this.transcriptionBuffers.get(callSid);
      if (remainingChunks && remainingChunks.length > 0) {
        await this.extractEventsFromTranscription(callSid, remainingChunks);
      }

      // Clean up
      this.activeProcessors.delete(callSid);
      this.transcriptionBuffers.delete(callSid);
      this.audioBuffers.delete(callSid);

      await updateCallProcessingStatus(
        callSid,
        'real_time_processing_completed'
      );
    } catch (error) {
      console.error(
        `Error stopping real-time processing for call ${callSid}:`,
        error
      );
    }
  }

  /**
   * Convert mulaw audio to WAV format
   */
  private convertMulawToWav(mulawBuffer: Buffer): Buffer {
    // Simplified mulaw to PCM conversion
    // In production, you'd use a proper audio library like 'wav' or 'node-ffmpeg'

    // For now, return the buffer as-is (this would need proper implementation)
    return mulawBuffer;
  }

  /**
   * Get processing status for a call
   */
  public getProcessingStatus(callSid: string): AudioProcessingConfig | null {
    return this.activeProcessors.get(callSid) || null;
  }

  /**
   * Get all active processors
   */
  public getActiveProcessors(): string[] {
    return Array.from(this.activeProcessors.keys());
  }
}

// Singleton instance
export const realTimeAudioProcessor = new RealTimeAudioProcessor();

/**
 * Export functions for use in webhooks
 */
export async function processRealTimeAudio(
  callSid: string,
  audioPayload: string,
  timestamp: number
): Promise<void> {
  return await realTimeAudioProcessor.processAudioChunk(
    callSid,
    audioPayload,
    timestamp
  );
}

export async function startRealTimeProcessing(
  callSid: string
): Promise<boolean> {
  return await realTimeAudioProcessor.startProcessing(callSid);
}

export async function stopRealTimeProcessing(callSid: string): Promise<void> {
  return await realTimeAudioProcessor.stopProcessing(callSid);
}
