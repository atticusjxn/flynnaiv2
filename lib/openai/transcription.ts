// Whisper API Integration for Flynn.ai v2
import { openai, OPENAI_CONFIG } from './client';
import { retry } from '../utils/retry';

export interface TranscriptionResult {
  text: string;
  confidence?: number;
  duration?: number;
  language?: string;
  processing_time: number;
  model_used: string;
}

export interface TranscriptionError {
  error: string;
  details?: string;
  retryable: boolean;
}

export class TranscriptionService {
  /**
   * Transcribe audio file using Whisper API
   */
  async transcribeAudio(
    audioFile: File | Buffer,
    filename?: string
  ): Promise<TranscriptionResult> {
    const startTime = Date.now();
    
    try {
      console.log('Starting audio transcription with Whisper API');
      
      // Prepare the file for OpenAI API
      const file = audioFile instanceof Buffer 
        ? new File([audioFile], filename || 'audio.mp3', { type: 'audio/mpeg' })
        : audioFile;

      // Call Whisper API with retry logic
      const transcription = await retry(
        () => openai.audio.transcriptions.create({
          file,
          model: OPENAI_CONFIG.transcription.model,
          response_format: OPENAI_CONFIG.transcription.response_format,
          language: OPENAI_CONFIG.transcription.language,
          temperature: OPENAI_CONFIG.transcription.temperature,
        }),
        {
          maxRetries: OPENAI_CONFIG.rateLimit.maxRetries,
          delay: OPENAI_CONFIG.rateLimit.retryDelay,
          backoff: OPENAI_CONFIG.rateLimit.backoffMultiplier,
        }
      );

      const processingTime = Date.now() - startTime;
      
      console.log(`Transcription completed in ${processingTime}ms`);
      console.log(`Transcribed text length: ${transcription.text.length} characters`);

      return {
        text: transcription.text,
        processing_time: processingTime,
        model_used: OPENAI_CONFIG.transcription.model,
        language: 'en',
      };

    } catch (error) {
      console.error('Transcription error:', error);
      throw this.handleTranscriptionError(error);
    }
  }

  /**
   * Transcribe audio from URL (Twilio recording URL)
   */
  async transcribeFromUrl(recordingUrl: string): Promise<TranscriptionResult> {
    try {
      console.log('Downloading audio from URL for transcription:', recordingUrl);
      
      // Download the audio file from Twilio
      const response = await fetch(recordingUrl);
      if (!response.ok) {
        throw new Error(`Failed to download audio: ${response.status} ${response.statusText}`);
      }

      const audioBuffer = await response.arrayBuffer();
      const audioFile = Buffer.from(audioBuffer);
      
      // Extract filename from URL or use default
      const filename = recordingUrl.split('/').pop()?.split('?')[0] || 'recording.mp3';
      
      return await this.transcribeAudio(audioFile, filename);

    } catch (error) {
      console.error('URL transcription error:', error);
      throw this.handleTranscriptionError(error);
    }
  }

  /**
   * Validate audio file before transcription
   */
  private validateAudioFile(file: File): boolean {
    const maxSize = 25 * 1024 * 1024; // 25MB limit for Whisper API
    const supportedTypes = [
      'audio/mpeg', 'audio/mp3', 'audio/wav', 'audio/m4a', 
      'audio/mp4', 'audio/webm', 'audio/flac'
    ];

    if (file.size > maxSize) {
      throw new Error('Audio file too large. Maximum size is 25MB.');
    }

    if (!supportedTypes.includes(file.type)) {
      console.warn(`Unsupported file type: ${file.type}. Attempting transcription anyway.`);
    }

    return true;
  }

  /**
   * Handle and categorize transcription errors
   */
  private handleTranscriptionError(error: any): TranscriptionError {
    if (error.status === 429) {
      return {
        error: 'Rate limit exceeded',
        details: 'OpenAI API rate limit reached. Please try again later.',
        retryable: true,
      };
    }

    if (error.status === 413) {
      return {
        error: 'File too large',
        details: 'Audio file exceeds 25MB limit for Whisper API.',
        retryable: false,
      };
    }

    if (error.status >= 500) {
      return {
        error: 'OpenAI server error',
        details: 'Temporary server error. Will retry automatically.',
        retryable: true,
      };
    }

    if (error.status === 400) {
      return {
        error: 'Invalid audio file',
        details: 'Audio file format not supported or corrupted.',
        retryable: false,
      };
    }

    return {
      error: 'Transcription failed',
      details: error.message || 'Unknown error occurred during transcription.',
      retryable: false,
    };
  }

  /**
   * Get transcription confidence estimate based on text characteristics
   */
  private estimateConfidence(text: string): number {
    // Simple heuristic based on text characteristics
    let confidence = 0.8; // Base confidence
    
    // Longer texts typically have better context
    if (text.length > 500) confidence += 0.1;
    
    // Presence of common business words
    const businessWords = ['appointment', 'service', 'meeting', 'schedule', 'time', 'address'];
    const businessWordCount = businessWords.filter(word => 
      text.toLowerCase().includes(word)
    ).length;
    confidence += businessWordCount * 0.02;
    
    // Penalize for excessive repetition or unclear markers
    if (text.includes('[unclear]') || text.includes('[inaudible]')) {
      confidence -= 0.2;
    }
    
    return Math.min(confidence, 1.0);
  }
}

// Export singleton instance
export const transcriptionService = new TranscriptionService();

// Convenience functions
export async function transcribeRecording(recordingUrl: string): Promise<TranscriptionResult> {
  return transcriptionService.transcribeFromUrl(recordingUrl);
}

export async function transcribeAudioFile(
  audioFile: File | Buffer, 
  filename?: string
): Promise<TranscriptionResult> {
  return transcriptionService.transcribeAudio(audioFile, filename);
}