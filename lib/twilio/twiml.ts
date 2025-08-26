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
  const message = greeting?.message || 'Thank you for calling. Your call is being recorded for appointment scheduling purposes.';
  
  const maxLength = recordingConfig?.maxLength || 600; // 10 minutes default
  const transcribe = recordingConfig?.transcribe || false;
  const playBeep = recordingConfig?.playBeep !== false; // default true
  
  return `<?xml version="1.0" encoding="UTF-8"?>
<Response>
  <Say voice="${voice}">${message}</Say>
  <Record 
    action="/api/webhooks/twilio/recording"
    method="POST"
    maxLength="${maxLength}"
    transcribe="${transcribe}"
    recordingStatusCallback="/api/webhooks/twilio/recording-status"
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
  const message = errorMessage || "We're sorry, there was an error processing your call. Please try again later.";
  
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
  plumbing: "Thank you for calling. Please describe your plumbing issue and when you need service. Your call is being recorded.",
  real_estate: "Thank you for calling. Please let us know about the property you're interested in or the service you need. Your call is being recorded.",
  legal: "Thank you for calling our law office. Please describe your legal matter and contact information. Your call is being recorded.",
  medical: "Thank you for calling. Please provide your information and describe your appointment needs. Your call is being recorded.",
  sales: "Thank you for calling. Please let us know how we can help you today. Your call is being recorded.",
  consulting: "Thank you for calling. Please describe your consulting needs and preferred meeting times. Your call is being recorded.",
  general: "Thank you for calling. Please describe your needs and contact information. Your call is being recorded."
} as const;

export type IndustryType = keyof typeof industryGreetings;