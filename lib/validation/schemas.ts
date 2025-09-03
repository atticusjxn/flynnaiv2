// Flynn.ai v2 - Comprehensive Input Validation Schemas
import { z } from 'zod';

// Environment validation
export const EnvironmentSchema = z.object({
  OPENAI_API_KEY: z.string().min(1),
  TWILIO_ACCOUNT_SID: z.string().regex(/^AC[0-9a-f]{32}$/),
  TWILIO_AUTH_TOKEN: z.string().min(1),
  SUPABASE_URL: z.string().url(),
  SUPABASE_ANON_KEY: z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

// Twilio webhook validation
export const TwilioCallWebhookSchema = z.object({
  CallSid: z.string().regex(/^CA[0-9a-f]{32}$/),
  From: z.string().regex(/^\+?[1-9]\d{1,14}$/), // E.164 phone number format
  To: z.string().regex(/^\+?[1-9]\d{1,14}$/),
  CallStatus: z.enum([
    'queued',
    'ringing',
    'in-progress',
    'completed',
    'busy',
    'failed',
    'no-answer',
    'canceled',
  ]),
  Direction: z.enum(['inbound', 'outbound']),
  RecordingUrl: z.string().url().optional(),
  RecordingSid: z
    .string()
    .regex(/^RE[0-9a-f]{32}$/)
    .optional(),
  RecordingDuration: z.string().regex(/^\d+$/).optional(),
});

export const TwilioRecordingWebhookSchema = z.object({
  RecordingSid: z.string().regex(/^RE[0-9a-f]{32}$/),
  RecordingUrl: z.string().url(),
  CallSid: z.string().regex(/^CA[0-9a-f]{32}$/),
  RecordingDuration: z.string().regex(/^\d+$/),
  RecordingStatus: z.enum(['in-progress', 'completed', 'failed']).optional(),
});

// User settings validation
export const AIProcessingSettingsSchema = z.object({
  aiProcessingEnabled: z.boolean(),
  settings: z
    .object({
      dailyLimit: z.number().min(1).max(1000).optional(),
    })
    .optional(),
});

// Phone number validation (Australian focus)
export const AustralianPhoneNumberSchema = z.string().refine(
  (phone) => {
    // Remove all non-digit characters
    const cleaned = phone.replace(/\D/g, '');

    // Australian mobile: 04xx xxx xxx (10 digits)
    // Australian landline: 0x xxxx xxxx (10 digits, where x is 2,3,7,8)
    // International format: +61 with appropriate area codes

    if (cleaned.startsWith('61') && cleaned.length === 12) {
      // International format +61
      const nationalNumber = cleaned.substring(2);
      return (
        /^[2378]\d{8}$/.test(nationalNumber) || /^4\d{8}$/.test(nationalNumber)
      );
    }

    if (cleaned.length === 10 && cleaned.startsWith('0')) {
      // National format
      return /^0[2378]\d{8}$/.test(cleaned) || /^04\d{8}$/.test(cleaned);
    }

    return false;
  },
  {
    message: 'Invalid Australian phone number format',
  }
);

// User input validation
export const UserRegistrationSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
  fullName: z.string().min(2).max(100),
  companyName: z.string().min(2).max(100),
  industry: z.enum([
    'plumbing',
    'real_estate',
    'legal',
    'medical',
    'sales',
    'consulting',
    'other',
  ]),
  phoneNumber: AustralianPhoneNumberSchema,
});

export const UserUpdateSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  companyName: z.string().min(2).max(100).optional(),
  industry: z
    .enum([
      'plumbing',
      'real_estate',
      'legal',
      'medical',
      'sales',
      'consulting',
      'other',
    ])
    .optional(),
  phoneNumber: AustralianPhoneNumberSchema.optional(),
});

// Call processing validation
export const CallProcessingSchema = z.object({
  callSid: z.string().regex(/^CA[0-9a-f]{32}$/),
  recordingUrl: z.string().url(),
  recordingSid: z.string().regex(/^RE[0-9a-f]{32}$/),
  userId: z.string().uuid(),
});

// Event extraction validation
export const ExtractedEventSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).optional(),
  proposedDateTime: z.string().datetime().optional(),
  location: z.string().max(500).optional(),
  customerName: z.string().max(100).optional(),
  customerPhone: AustralianPhoneNumberSchema.optional(),
  customerEmail: z.string().email().optional(),
  urgency: z.enum(['low', 'medium', 'high', 'emergency']),
  eventType: z.string().max(50),
  confidence: z.number().min(0).max(1),
  estimatedDuration: z.number().min(15).max(480).optional(), // minutes
  estimatedPrice: z.number().min(0).optional(),
});

// Database UUID validation
export const UUIDSchema = z.string().uuid();

// ID validation helper
export const validateUserId = (userId: unknown): string => {
  return UUIDSchema.parse(userId);
};

// Pagination validation
export const PaginationSchema = z.object({
  page: z.number().min(1).default(1),
  limit: z.number().min(1).max(100).default(20),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc'),
});

// Search validation
export const SearchSchema = z.object({
  query: z.string().min(1).max(100),
  filters: z
    .object({
      industry: z.string().optional(),
      urgency: z.enum(['low', 'medium', 'high', 'emergency']).optional(),
      dateFrom: z.string().datetime().optional(),
      dateTo: z.string().datetime().optional(),
    })
    .optional(),
});

// Rate limiting validation
export const RateLimitSchema = z.object({
  identifier: z.string().min(1).max(100),
  endpoint: z.enum([
    'ai-processing',
    'webhooks',
    'user-settings',
    'onboarding',
  ]),
  windowMs: z.number().min(1000).max(3600000), // 1 second to 1 hour
  maxRequests: z.number().min(1).max(10000),
});

// Business call detection validation
export const BusinessCallDetectionSchema = z.object({
  transcription: z.string().min(10).max(50000),
  industry: z.string().optional(),
  companyName: z.string().max(100).optional(),
  confidence: z.number().min(0).max(1),
});

// Webhook security validation
export const WebhookSignatureSchema = z.object({
  signature: z.string().min(1),
  timestamp: z.string().regex(/^\d+$/),
  payload: z.string().min(1),
});

// Export validation helper functions
export const validateEnvironment = () => {
  try {
    return EnvironmentSchema.parse({
      OPENAI_API_KEY: process.env.OPENAI_API_KEY,
      TWILIO_ACCOUNT_SID: process.env.TWILIO_ACCOUNT_SID,
      TWILIO_AUTH_TOKEN: process.env.TWILIO_AUTH_TOKEN,
      SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
    });
  } catch (error) {
    console.error('Environment validation failed:', error);
    throw new Error('Invalid environment configuration');
  }
};
