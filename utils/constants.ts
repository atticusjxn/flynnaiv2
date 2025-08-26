// Flynn.ai v2 - Application Constants

export const APP_CONFIG = {
  name: 'Flynn.ai v2',
  description: 'AI-Powered Call to Calendar Automation',
  version: '0.1.0',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
} as const;

export const SUBSCRIPTION_TIERS = {
  BASIC: 'basic',
  PROFESSIONAL: 'professional', 
  ENTERPRISE: 'enterprise',
} as const;

export const EVENT_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const URGENCY_LEVELS = {
  LOW: 'low',
  MEDIUM: 'medium', 
  HIGH: 'high',
  EMERGENCY: 'emergency',
} as const;

export const CALL_STATUSES = {
  PROCESSING: 'processing',
  COMPLETED: 'completed',
  FAILED: 'failed',
} as const;

export const SUPPORTED_INDUSTRIES = {
  PLUMBING: 'plumbing',
  REAL_ESTATE: 'real_estate',
  LEGAL: 'legal',
  MEDICAL: 'medical', 
  SALES: 'sales',
  CONSULTING: 'consulting',
  GENERAL: 'general_services',
  OTHER: 'other',
} as const;

export const AI_CONFIG = {
  MAX_TOKENS: 2000,
  TEMPERATURE: 0.1,
  TIMEOUT_MS: 30000,
  CONFIDENCE_THRESHOLD: 0.7,
} as const;

export const EMAIL_CONFIG = {
  FROM_NAME: 'Flynn.ai',
  REPLY_TO: 'support@flynn.ai',
} as const;

export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  CALLS: '/calls', 
  EVENTS: '/events',
  CALENDAR: '/calendar',
  SETTINGS: '/settings',
  LOGIN: '/login',
  REGISTER: '/register',
} as const;