// Flynn.ai v2 - Application Constants

export const APP_CONFIG = {
  name: 'Flynn.ai v2',
  description: 'Always-On AI Call Intelligence for Australian Business',
  version: '0.1.0',
  url: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  country: 'Australia',
  timezone: 'Australia/Sydney',
  currency: 'AUD',
} as const;

export const SUBSCRIPTION_TIERS = {
  TRIAL: 'trial',
  BASIC: 'basic',
  PROFESSIONAL: 'professional',
  ENTERPRISE: 'enterprise',
} as const;

export const SUBSCRIPTION_STATUSES = {
  TRIAL: 'trial',
  ACTIVE: 'active',
  PAST_DUE: 'past_due',
  CANCELLED: 'cancelled',
  INCOMPLETE: 'incomplete',
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

// Australian Business Terminology & Context
export const AUSTRALIAN_INDUSTRY_CONFIG = {
  plumbing: {
    displayName: 'Plumbing & HVAC',
    terminology: {
      appointment: 'service call',
      customer: 'customer',
      quote: 'quote',
      job: 'job',
      urgency: {
        emergency: 'emergency',
        urgent: 'urgent',
        routine: 'routine',
        maintenance: 'maintenance',
      },
    },
    businessHours: '8:00 AM - 5:00 PM',
    averageCallDuration: 90,
    commonServices: [
      'blocked drains',
      'hot water systems',
      'gas fitting',
      'emergency repairs',
    ],
    australianContext: {
      regulations: 'Licensed tradesperson required',
      peakSeason: 'Summer (Dec-Feb)',
      averageRate: '$120-180/hour',
      emergencyRate: '$200-300/hour',
    },
  },
  real_estate: {
    displayName: 'Real Estate',
    terminology: {
      appointment: 'showing',
      customer: 'client',
      quote: 'proposal',
      job: 'property transaction',
      urgency: {
        hot: 'hot prospect',
        warm: 'interested',
        cold: 'casual inquiry',
      },
    },
    businessHours: '9:00 AM - 6:00 PM',
    averageCallDuration: 45,
    commonServices: [
      'property showings',
      'market appraisals',
      'rental inspections',
      'settlement',
    ],
    australianContext: {
      regulations: 'REI licensed',
      peakSeason: 'Spring (Sep-Nov)',
      averageCommission: '2.5-3.5%',
      marketCycle: 'Varies by state',
    },
  },
  legal: {
    displayName: 'Legal Services',
    terminology: {
      appointment: 'consultation',
      customer: 'client',
      quote: 'fee estimate',
      job: 'matter',
      urgency: {
        critical: 'critical',
        urgent: 'urgent',
        routine: 'routine',
        research: 'research',
      },
    },
    businessHours: '9:00 AM - 5:00 PM',
    averageCallDuration: 60,
    commonServices: [
      'initial consultation',
      'contract review',
      'court representation',
      'conveyancing',
    ],
    australianContext: {
      regulations: 'Australian practising certificate',
      billing: 'Usually 6-minute increments',
      averageRate: '$300-800/hour',
      courtHours: '10:00 AM - 4:00 PM',
    },
  },
  medical: {
    displayName: 'Medical Practice',
    terminology: {
      appointment: 'appointment',
      customer: 'patient',
      quote: 'treatment plan',
      job: 'consultation',
      urgency: {
        emergency: 'emergency',
        urgent: 'urgent',
        routine: 'routine',
        followup: 'follow-up',
      },
    },
    businessHours: '8:00 AM - 5:00 PM',
    averageCallDuration: 30,
    commonServices: ['consultation', 'check-up', 'procedure', 'test results'],
    australianContext: {
      regulations: 'AHPRA registered',
      medicare: 'Medicare benefits available',
      bulkBilling: 'Bulk billing available',
      privateHealth: 'Private health cover accepted',
    },
  },
} as const;

// Australian Business Context
export const AUSTRALIAN_BUSINESS_CONTEXT = {
  workingHours: {
    standard: '9:00 AM - 5:00 PM',
    extended: '8:00 AM - 6:00 PM',
    weekend: 'Saturday mornings (emergency services)',
  },
  publicHolidays: [
    'Australia Day',
    'Easter Weekend',
    'ANZAC Day',
    "Queen's Birthday",
    'Christmas Period',
  ],
  timeZones: {
    sydney: 'Australia/Sydney',
    melbourne: 'Australia/Melbourne',
    brisbane: 'Australia/Brisbane',
    perth: 'Australia/Perth',
    adelaide: 'Australia/Adelaide',
  },
  businessRegistration: {
    abn: 'ABN required for business',
    acn: 'ACN for companies',
    gst: 'GST registration (if >$75k)',
    insurance: 'Public liability recommended',
  },
  paymentTerms: {
    standard: '30 days',
    tradies: '14 days',
    professional: '30 days',
    government: '30-60 days',
  },
} as const;
