// Media Stream Handler for Flynn.ai v2 - Real-time Audio Processing

import { createAdminClient } from '@/utils/supabase/server';

export interface MediaStreamConfig {
  callSid: string;
  sampleRate: number;
  channels: number;
  encoding: string;
}

export interface AudioChunk {
  callSid: string;
  payload: string; // Base64 encoded audio
  timestamp: number;
  sequenceNumber: number;
}

export class MediaStreamHandler {
  private activeStreams: Map<string, MediaStreamConfig> = new Map();
  private audioBuffers: Map<string, AudioChunk[]> = new Map();

  /**
   * Initialize media stream for a call after AI activation
   */
  public async initializeStream(callSid: string): Promise<boolean> {
    try {
      console.log(`Initializing media stream for call: ${callSid}`);
      
      // Configure media stream settings
      const config: MediaStreamConfig = {
        callSid,
        sampleRate: 8000, // Twilio standard
        channels: 1, // Mono
        encoding: 'mulaw'
      };

      this.activeStreams.set(callSid, config);
      this.audioBuffers.set(callSid, []);

      // Update call record with media stream status
      const supabase = createAdminClient();
      await supabase
        .from('calls')
        .update({
          ai_processing_status: 'media_stream_initialized',
          updated_at: new Date().toISOString()
        })
        .eq('twilio_call_sid', callSid);

      console.log(`Media stream initialized for call: ${callSid}`);
      return true;

    } catch (error) {
      console.error(`Failed to initialize media stream for call ${callSid}:`, error);
      return false;
    }
  }

  /**
   * Process incoming audio chunk
   */
  public async processAudioChunk(
    callSid: string, 
    payload: string, 
    timestamp: number
  ): Promise<void> {
    try {
      if (!this.activeStreams.has(callSid)) {
        console.warn(`No active stream for call: ${callSid}`);
        return;
      }

      const buffer = this.audioBuffers.get(callSid) || [];
      const chunk: AudioChunk = {
        callSid,
        payload,
        timestamp,
        sequenceNumber: buffer.length
      };

      buffer.push(chunk);
      this.audioBuffers.set(callSid, buffer);

      // Process audio in chunks of ~1 second (8000 samples at 8kHz)
      if (buffer.length >= 50) { // ~1 second of audio
        await this.processAudioBuffer(callSid, buffer.slice(-50));
      }

    } catch (error) {
      console.error(`Error processing audio chunk for call ${callSid}:`, error);
    }
  }

  /**
   * Process accumulated audio buffer for transcription
   */
  private async processAudioBuffer(callSid: string, chunks: AudioChunk[]): Promise<void> {
    try {
      // Combine audio chunks into a single buffer
      const combinedPayload = chunks.map(chunk => chunk.payload).join('');
      
      // Convert to audio format for Whisper API
      const audioBuffer = Buffer.from(combinedPayload, 'base64');
      
      // TODO: Send to real-time AI processor
      console.log(`Processing ${chunks.length} audio chunks for call: ${callSid}`);
      
      // This will be implemented in RealTimeProcessor
      // await processRealTimeAudio(callSid, audioBuffer);

    } catch (error) {
      console.error(`Error processing audio buffer for call ${callSid}:`, error);
    }
  }

  /**
   * Stop media stream processing
   */
  public async stopStream(callSid: string): Promise<void> {
    try {
      console.log(`Stopping media stream for call: ${callSid}`);
      
      // Process any remaining audio
      const remainingBuffer = this.audioBuffers.get(callSid);
      if (remainingBuffer && remainingBuffer.length > 0) {
        await this.processAudioBuffer(callSid, remainingBuffer);
      }

      // Clean up
      this.activeStreams.delete(callSid);
      this.audioBuffers.delete(callSid);

      // Update call record
      const supabase = createAdminClient();
      await supabase
        .from('calls')
        .update({
          ai_processing_status: 'media_stream_completed',
          updated_at: new Date().toISOString()
        })
        .eq('twilio_call_sid', callSid);

      console.log(`Media stream stopped for call: ${callSid}`);

    } catch (error) {
      console.error(`Error stopping media stream for call ${callSid}:`, error);
    }
  }

  /**
   * Get active stream info
   */
  public getStreamInfo(callSid: string): MediaStreamConfig | null {
    return this.activeStreams.get(callSid) || null;
  }

  /**
   * Get all active streams
   */
  public getActiveStreams(): string[] {
    return Array.from(this.activeStreams.keys());
  }
}

// Singleton instance for managing media streams
export const mediaStreamHandler = new MediaStreamHandler();

/**
 * Initialize media stream for a call (exported function)
 */
export async function initializeMediaStream(callSid: string): Promise<boolean> {
  return await mediaStreamHandler.initializeStream(callSid);
}

/**
 * Process real-time audio (exported function)
 */
export async function processRealTimeAudio(
  callSid: string,
  payload: string,
  timestamp: number
): Promise<void> {
  return await mediaStreamHandler.processAudioChunk(callSid, payload, timestamp);
}