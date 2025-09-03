// DTMF Handler for Flynn.ai v2 - Silent Keypad Activation

export interface DTMFEvent {
  callSid: string;
  digits: string;
  from: string;
  to: string;
  timestamp: string;
}

export interface KeypadActivationResult {
  activated: boolean;
  shouldStartProcessing: boolean;
  sequence: string;
  timestamp: string;
}

export class DTMFHandler {
  private static readonly AI_ACTIVATION_SEQUENCE = '*7';
  private activatedCalls: Set<string> = new Set();

  /**
   * Process DTMF input and determine if AI processing should be activated
   */
  public processDTMFInput(event: DTMFEvent): KeypadActivationResult {
    const { callSid, digits } = event;

    console.log(`DTMF processed for call ${callSid}: ${digits}`);

    // Check if this is the AI activation sequence
    if (digits === DTMFHandler.AI_ACTIVATION_SEQUENCE) {
      // Prevent duplicate activations
      if (this.activatedCalls.has(callSid)) {
        console.log(`AI processing already activated for call: ${callSid}`);
        return {
          activated: true,
          shouldStartProcessing: false,
          sequence: digits,
          timestamp: new Date().toISOString(),
        };
      }

      // Activate AI processing silently
      this.activatedCalls.add(callSid);
      console.log(`AI processing activated silently for call: ${callSid}`);

      return {
        activated: true,
        shouldStartProcessing: true,
        sequence: digits,
        timestamp: new Date().toISOString(),
      };
    }

    // For any other keypad input, no action needed
    return {
      activated: false,
      shouldStartProcessing: false,
      sequence: digits,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Check if AI processing is already activated for a call
   */
  public isAIActivated(callSid: string): boolean {
    return this.activatedCalls.has(callSid);
  }

  /**
   * Deactivate AI processing for a call (when call ends)
   */
  public deactivateAI(callSid: string): void {
    this.activatedCalls.delete(callSid);
    console.log(`AI processing deactivated for call: ${callSid}`);
  }

  /**
   * Get all currently activated calls
   */
  public getActivatedCalls(): string[] {
    return Array.from(this.activatedCalls);
  }

  /**
   * Clear all activations (for cleanup/reset)
   */
  public clearAllActivations(): void {
    console.log(
      `Clearing all AI activations. Total: ${this.activatedCalls.size}`
    );
    this.activatedCalls.clear();
  }
}

// Singleton instance for managing DTMF state across requests
export const dtmfHandler = new DTMFHandler();
