// Keypad Activation Handler for Flynn.ai v2 - Silent *7 Activation

import { dtmfHandler, DTMFEvent } from '@/lib/twilio/dtmfHandler';
import { startRealTimeProcessing } from '@/lib/ai/RealTimeProcessor';
import { updateCallWithKeypadActivation } from '@/lib/supabase/calls';

export interface ActivationEvent {
  callSid: string;
  digits: string;
  from: string;
  to: string;
  activated: boolean;
  timestamp: string;
}

export class KeypadActivationManager {
  private static instance: KeypadActivationManager;
  private activationLog: Map<string, ActivationEvent> = new Map();

  public static getInstance(): KeypadActivationManager {
    if (!KeypadActivationManager.instance) {
      KeypadActivationManager.instance = new KeypadActivationManager();
    }
    return KeypadActivationManager.instance;
  }

  /**
   * Process keypad input for potential AI activation
   */
  public async processKeypadInput(
    callSid: string,
    digits: string,
    from: string,
    to: string
  ): Promise<ActivationEvent> {
    const timestamp = new Date().toISOString();

    console.log(`Processing keypad input for call ${callSid}: ${digits}`);

    // Create DTMF event
    const dtmfEvent: DTMFEvent = {
      callSid,
      digits,
      from,
      to,
      timestamp,
    };

    // Process with DTMF handler
    const result = dtmfHandler.processDTMFInput(dtmfEvent);

    const activationEvent: ActivationEvent = {
      callSid,
      digits,
      from,
      to,
      activated: result.activated,
      timestamp,
    };

    // Log the activation event
    this.activationLog.set(callSid, activationEvent);

    // If AI processing should start, initialize the pipeline
    if (result.shouldStartProcessing) {
      await this.initializeAIProcessing(callSid, result.sequence, timestamp);
    }

    return activationEvent;
  }

  /**
   * Initialize AI processing pipeline after *7 activation
   */
  private async initializeAIProcessing(
    callSid: string,
    sequence: string,
    timestamp: string
  ): Promise<void> {
    try {
      console.log(
        `Initializing AI processing for call ${callSid} after keypad sequence: ${sequence}`
      );

      // Update call record with activation info
      await updateCallWithKeypadActivation(callSid, {
        ai_processing_activated: true,
        ai_activation_time: timestamp,
        keypad_sequence: sequence,
      });

      // Start real-time audio processing
      const processingStarted = await startRealTimeProcessing(callSid);

      if (processingStarted) {
        console.log(
          `AI processing successfully initialized for call: ${callSid}`
        );
      } else {
        console.error(`Failed to start AI processing for call: ${callSid}`);
      }
    } catch (error) {
      console.error(
        `Error initializing AI processing for call ${callSid}:`,
        error
      );
    }
  }

  /**
   * Check if AI processing is active for a call
   */
  public isAIActive(callSid: string): boolean {
    const activationEvent = this.activationLog.get(callSid);
    return activationEvent?.activated || false;
  }

  /**
   * Get activation event for a call
   */
  public getActivationEvent(callSid: string): ActivationEvent | null {
    return this.activationLog.get(callSid) || null;
  }

  /**
   * Clean up activation data when call ends
   */
  public cleanupCall(callSid: string): void {
    console.log(`Cleaning up activation data for call: ${callSid}`);
    this.activationLog.delete(callSid);
    dtmfHandler.deactivateAI(callSid);
  }

  /**
   * Get all active AI processing calls
   */
  public getActiveCalls(): ActivationEvent[] {
    return Array.from(this.activationLog.values()).filter(
      (event) => event.activated
    );
  }

  /**
   * Generate silent activation response
   * This ensures the caller has no indication that AI processing was activated
   */
  public generateSilentResponse(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <!-- Silent activation - no audio feedback to caller -->
  <!-- Call continues normally without any indication -->
</Response>`;
  }

  /**
   * Handle emergency activation scenarios
   */
  public async handleEmergencyActivation(callSid: string): Promise<void> {
    try {
      console.log(`Handling emergency activation for call: ${callSid}`);

      // In emergency scenarios, we might want to:
      // 1. Prioritize processing
      // 2. Send immediate notifications
      // 3. Escalate to human operators

      // For now, just ensure processing is active
      const isActive = this.isAIActive(callSid);
      if (!isActive) {
        // Auto-activate AI for emergency calls
        await this.processKeypadInput(callSid, '*7', '', '');
      }
    } catch (error) {
      console.error(
        `Error handling emergency activation for call ${callSid}:`,
        error
      );
    }
  }
}

// Export singleton instance
export const keypadActivationManager = KeypadActivationManager.getInstance();

/**
 * Main function to process keypad activation
 */
export async function handleKeypadActivation(
  callSid: string,
  digits: string,
  from: string,
  to: string
): Promise<ActivationEvent> {
  return await keypadActivationManager.processKeypadInput(
    callSid,
    digits,
    from,
    to
  );
}

/**
 * Check if AI is active for a call
 */
export function isAIProcessingActive(callSid: string): boolean {
  return keypadActivationManager.isAIActive(callSid);
}

/**
 * Clean up call data
 */
export function cleanupCallActivation(callSid: string): void {
  keypadActivationManager.cleanupCall(callSid);
}
