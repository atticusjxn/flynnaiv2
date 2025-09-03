// TwiML Response Generation for Flynn.ai v2

export interface CallGreeting {
  message: string;
  voice?: 'alice' | 'man' | 'woman';
}

export interface RecordingConfig {
  maxLength?: number;
  transcribe?: boolean;
  recordingStatusCallback?: string;
  playBeep?: boolean;
}

export function generateCallHandlingTwiML(
  greeting?: CallGreeting,
  recordingConfig?: RecordingConfig
): string {
  const voice = greeting?.voice || 'alice';
  const message =
    greeting?.message ||
    'Thank you for calling. Your call is being recorded for appointment scheduling purposes.';

  const maxLength = recordingConfig?.maxLength || 600; // 10 minutes default
  const transcribe = recordingConfig?.transcribe || false;
  const playBeep = recordingConfig?.playBeep !== false; // default true

  const baseUrl =
    process.env.TWILIO_WEBHOOK_URL ||
    'https://flynnv2-h1g6zn20a-atticus-181af93c.vercel.app';

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voice}">${message}</Say>
  <Record 
    action="${baseUrl}/api/webhooks/twilio/recording"
    method="POST"
    maxLength="${maxLength}"
    transcribe="${transcribe}"
    recordingStatusCallback="${baseUrl}/api/webhooks/twilio/recording-status"
    recordingStatusCallbackMethod="POST"
    playBeep="${playBeep}"
  />
  <Say voice="${voice}">Thank you for your call. We will process your request and send you an email shortly.</Say>
</Response>`;
}

export function generateErrorTwiML(
  errorMessage?: string,
  voice?: 'alice' | 'man' | 'woman'
): string {
  const voiceValue = voice || 'alice';
  const message =
    errorMessage ||
    "We're sorry, there was an error processing your call. Please try again later.";

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voiceValue}">${message}</Say>
</Response>`;
}

export function generateBusyTwiML(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="alice">We're sorry, but we're unable to take your call right now. Please try again later.</Say>
  <Hangup/>
</Response>`;
}

// Industry-specific greeting messages
export const industryGreetings = {
  plumbing:
    'Thank you for calling. Please describe your plumbing issue and when you need service. Your call is being recorded.',
  real_estate:
    "Thank you for calling. Please let us know about the property you're interested in or the service you need. Your call is being recorded.",
  legal:
    'Thank you for calling our law office. Please describe your legal matter and contact information. Your call is being recorded.',
  medical:
    'Thank you for calling. Please provide your information and describe your appointment needs. Your call is being recorded.',
  sales:
    'Thank you for calling. Please let us know how we can help you today. Your call is being recorded.',
  consulting:
    'Thank you for calling. Please describe your consulting needs and preferred meeting times. Your call is being recorded.',
  general:
    'Thank you for calling. Please describe your needs and contact information. Your call is being recorded.',
} as const;

export type IndustryType = keyof typeof industryGreetings;

/**
 * Generate TwiML with DTMF gathering for keypad activation
 */
export function generateCallHandlingWithDTMFTwiML(
  greeting?: CallGreeting,
  recordingConfig?: RecordingConfig
): string {
  const voice = greeting?.voice || 'alice';
  const message =
    greeting?.message ||
    'Thank you for calling. Your call is being recorded for appointment scheduling purposes.';

  const maxLength = recordingConfig?.maxLength || 600; // 10 minutes default
  const transcribe = recordingConfig?.transcribe || false;
  const playBeep = recordingConfig?.playBeep !== false; // default true

  const baseUrl =
    process.env.TWILIO_WEBHOOK_URL ||
    'https://flynnv2-h1g6zn20a-atticus-181af93c.vercel.app';

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voice}">${message}</Say>
  <Gather 
    action="${baseUrl}/api/webhooks/twilio/dtmf"
    method="POST"
    numDigits="2"
    timeout="1"
    finishOnKey=""
    input="dtmf"
  >
    <!-- Gather runs continuously in background to detect *7 -->
  </Gather>
  <Record 
    action="${baseUrl}/api/webhooks/twilio/recording"
    method="POST"
    maxLength="${maxLength}"
    transcribe="${transcribe}"
    recordingStatusCallback="${baseUrl}/api/webhooks/twilio/recording-status"
    recordingStatusCallbackMethod="POST"
    playBeep="${playBeep}"
  />
  <Say voice="${voice}">Thank you for your call. We will process your request and send you an email shortly.</Say>
</Response>`;
}

/**
 * Generate TwiML for silent keypad activation response
 * This returns empty TwiML to continue the call without any indication to the caller
 */
export function generateKeypadActivationTwiML(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <!-- Silent activation - no indication to caller -->
  <!-- Call continues normally -->
</Response>`;
}

/**
 * Generate TwiML with Media Streams for real-time audio processing
 */
export function generateMediaStreamTwiML(callSid: string): string {
  const baseUrl =
    process.env.TWILIO_WEBHOOK_URL ||
    'https://flynnv2-h1g6zn20a-atticus-181af93c.vercel.app';

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Start>
    <Stream url="wss://${baseUrl.replace('https://', '')}/api/webhooks/twilio/media-stream">
      <Parameter name="callSid" value="${callSid}" />
    </Stream>
  </Start>
  <!-- Continue with normal call flow -->
</Response>`;
}

/**
 * Generate enhanced TwiML with both DTMF detection and Media Streams
 */
export function generateEnhancedCallHandlingTwiML(
  callSid: string,
  greeting?: CallGreeting,
  recordingConfig?: RecordingConfig
): string {
  const voice = greeting?.voice || 'alice';
  const message =
    greeting?.message ||
    'Thank you for calling. Your call is being recorded for appointment scheduling purposes.';

  const maxLength = recordingConfig?.maxLength || 600;
  const transcribe = recordingConfig?.transcribe || false;
  const playBeep = recordingConfig?.playBeep !== false;

  const baseUrl =
    process.env.TWILIO_WEBHOOK_URL ||
    'https://flynnv2-h1g6zn20a-atticus-181af93c.vercel.app';
  const wsUrl = baseUrl.replace('https://', '').replace('http://', '');

  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voice}">${message}</Say>
  
  <!-- Start Media Stream for potential real-time processing -->
  <Start>
    <Stream url="wss://${wsUrl}/api/webhooks/twilio/media-stream">
      <Parameter name="callSid" value="${callSid}" />
    </Stream>
  </Start>
  
  <!-- Continuous DTMF gathering for *7 detection -->
  <Gather 
    action="${baseUrl}/api/webhooks/twilio/dtmf"
    method="POST"
    numDigits="2"
    timeout="1"
    finishOnKey=""
    input="dtmf"
  >
    <!-- Record the call -->
    <Record 
      action="${baseUrl}/api/webhooks/twilio/recording"
      method="POST"
      maxLength="${maxLength}"
      transcribe="${transcribe}"
      recordingStatusCallback="${baseUrl}/api/webhooks/twilio/recording-status"
      recordingStatusCallbackMethod="POST"
      playBeep="${playBeep}"
    />
  </Gather>
  
  <Say voice="${voice}">Thank you for your call. We will process your request and send you an email shortly.</Say>
</Response>`;
}
