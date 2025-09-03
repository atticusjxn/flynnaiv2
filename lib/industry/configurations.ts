// Industry-specific configurations for Flynn.ai v2

export interface IndustryConfiguration {
  id: string;
  name: string;
  colors: {
    primary: string;
    secondary: string;
    accent: string;
  };
  terminology: {
    appointment: string;
    service_call: string;
    customer: string;
    events_title: string;
    summary_title: string;
    quote?: string;
    emergency?: string;
    meeting?: string;
    consultation?: string;
    inspection?: string;
    showing?: string;
    urgent?: string;
    [key: string]: string | undefined;
  };
  urgencyLevels: string[];
  defaultDuration: number; // minutes
  businessHours: string;
  requiresLocation: boolean;
  pricingExpected: boolean;
  complianceRequirements?: string[];
}

export const INDUSTRY_CONFIGURATIONS: Record<string, IndustryConfiguration> = {
  plumbing: {
    id: 'plumbing',
    name: 'Plumbing & HVAC',
    colors: {
      primary: '#1e40af',
      secondary: '#3b82f6',
      accent: '#60a5fa',
    },
    terminology: {
      appointment: 'service call',
      service_call: 'Service Call',
      customer: 'customer',
      events_title: 'Service Requests',
      summary_title: 'Service Call Summary',
      quote: 'Quote Request',
      emergency: 'Emergency Service',
    },
    urgencyLevels: ['emergency', 'high', 'medium', 'low'],
    defaultDuration: 90,
    businessHours: '08:00-17:00 Mon-Sat',
    requiresLocation: true,
    pricingExpected: true,
  },

  real_estate: {
    id: 'real_estate',
    name: 'Real Estate',
    colors: {
      primary: '#059669',
      secondary: '#10b981',
      accent: '#34d399',
    },
    terminology: {
      appointment: 'showing',
      service_call: 'property showing',
      customer: 'client',
      events_title: 'Scheduled Showings',
      summary_title: 'Property Inquiry Summary',
      meeting: 'Property Showing',
      inspection: 'Property Inspection',
      showing: 'Property Showing',
    },
    urgencyLevels: ['high', 'medium', 'low'], // no emergency in real estate
    defaultDuration: 45,
    businessHours: '09:00-18:00 Mon-Sun',
    requiresLocation: true,
    pricingExpected: false, // handled differently
  },

  legal: {
    id: 'legal',
    name: 'Legal Services',
    colors: {
      primary: '#7c3aed',
      secondary: '#8b5cf6',
      accent: '#a78bfa',
    },
    terminology: {
      appointment: 'consultation',
      service_call: 'consultation',
      customer: 'client',
      events_title: 'Legal Consultations',
      summary_title: 'Client Consultation Summary',
      consultation: 'Legal Consultation',
      meeting: 'Client Meeting',
    },
    urgencyLevels: ['emergency', 'high', 'medium', 'low'],
    defaultDuration: 60,
    businessHours: '09:00-17:00 Mon-Fri',
    requiresLocation: false,
    pricingExpected: true,
    complianceRequirements: ['attorney_client_privilege'],
  },

  medical: {
    id: 'medical',
    name: 'Medical & Healthcare',
    colors: {
      primary: '#dc2626',
      secondary: '#ef4444',
      accent: '#f87171',
    },
    terminology: {
      appointment: 'appointment',
      service_call: 'appointment',
      customer: 'patient',
      events_title: 'Medical Appointments',
      summary_title: 'Patient Call Summary',
      consultation: 'Consultation',
      urgent: 'Urgent Care',
    },
    urgencyLevels: ['emergency', 'high', 'medium', 'low'],
    defaultDuration: 30,
    businessHours: '08:00-17:00 Mon-Fri',
    requiresLocation: false,
    pricingExpected: false,
    complianceRequirements: ['HIPAA'],
  },

  sales: {
    id: 'sales',
    name: 'Sales & Business Development',
    colors: {
      primary: '#f59e0b',
      secondary: '#fbbf24',
      accent: '#fcd34d',
    },
    terminology: {
      appointment: 'meeting',
      service_call: 'sales call',
      customer: 'prospect',
      events_title: 'Sales Meetings',
      summary_title: 'Sales Call Summary',
      meeting: 'Sales Meeting',
    },
    urgencyLevels: ['high', 'medium', 'low'],
    defaultDuration: 45,
    businessHours: '09:00-17:00 Mon-Fri',
    requiresLocation: false,
    pricingExpected: false,
  },

  consulting: {
    id: 'consulting',
    name: 'Consulting Services',
    colors: {
      primary: '#6366f1',
      secondary: '#818cf8',
      accent: '#a5b4fc',
    },
    terminology: {
      appointment: 'consultation',
      service_call: 'consultation',
      customer: 'client',
      events_title: 'Consultations',
      summary_title: 'Client Call Summary',
      consultation: 'Consultation',
      meeting: 'Strategy Session',
    },
    urgencyLevels: ['high', 'medium', 'low'],
    defaultDuration: 90,
    businessHours: '09:00-17:00 Mon-Fri',
    requiresLocation: false,
    pricingExpected: true,
  },

  general: {
    id: 'general',
    name: 'General Business',
    colors: {
      primary: '#4f46e5',
      secondary: '#6366f1',
      accent: '#818cf8',
    },
    terminology: {
      appointment: 'appointment',
      service_call: 'service request',
      customer: 'customer',
      events_title: 'Appointments',
      summary_title: 'Call Summary',
      meeting: 'Meeting',
    },
    urgencyLevels: ['high', 'medium', 'low'],
    defaultDuration: 60,
    businessHours: '09:00-17:00 Mon-Fri',
    requiresLocation: false,
    pricingExpected: false,
  },
};

/**
 * Get industry configuration by ID
 */
export function getIndustryConfiguration(
  industryId: string
): IndustryConfiguration {
  return INDUSTRY_CONFIGURATIONS[industryId] || INDUSTRY_CONFIGURATIONS.general;
}

/**
 * Get all available industries
 */
export function getAllIndustries(): IndustryConfiguration[] {
  return Object.values(INDUSTRY_CONFIGURATIONS);
}

/**
 * Get industry by name (case-insensitive)
 */
export function getIndustryByName(name: string): IndustryConfiguration | null {
  const normalizedName = name.toLowerCase().replace(/[^a-z0-9]/g, '_');

  for (const config of Object.values(INDUSTRY_CONFIGURATIONS)) {
    if (
      config.id === normalizedName ||
      config.name.toLowerCase().includes(normalizedName)
    ) {
      return config;
    }
  }

  return null;
}

/**
 * Validate industry configuration
 */
export function validateIndustryConfiguration(config: IndustryConfiguration): {
  valid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (!config.id?.trim()) {
    errors.push('Industry ID is required');
  }

  if (!config.name?.trim()) {
    errors.push('Industry name is required');
  }

  if (!config.colors?.primary) {
    errors.push('Primary color is required');
  }

  if (!config.terminology?.appointment) {
    errors.push('Appointment terminology is required');
  }

  if (!config.terminology?.customer) {
    errors.push('Customer terminology is required');
  }

  if (!config.urgencyLevels?.length) {
    errors.push('Urgency levels are required');
  }

  if (!config.defaultDuration || config.defaultDuration < 1) {
    errors.push('Valid default duration is required');
  }

  if (!config.businessHours?.trim()) {
    errors.push('Business hours are required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Get urgency level configuration
 */
export function getUrgencyLevelConfig(urgency: string) {
  const configs = {
    emergency: {
      label: 'EMERGENCY',
      color: '#dc2626',
      priority: 1,
      responseTime: '< 2 hours',
      icon: '🚨',
    },
    high: {
      label: 'HIGH PRIORITY',
      color: '#f59e0b',
      priority: 2,
      responseTime: 'Same day',
      icon: '🔴',
    },
    medium: {
      label: 'MEDIUM',
      color: '#10b981',
      priority: 3,
      responseTime: '24-48 hours',
      icon: '🟡',
    },
    low: {
      label: 'LOW',
      color: '#6b7280',
      priority: 4,
      responseTime: '2-5 days',
      icon: '🔵',
    },
  };

  return (configs as any)[urgency] || configs.medium;
}

/**
 * Get industry-specific event type labels
 */
export function getEventTypeLabel(
  eventType: string,
  industryId: string
): string {
  const config = getIndustryConfiguration(industryId);
  const terminology = config.terminology;

  // Try to find specific terminology first
  if (terminology[eventType]) {
    return terminology[eventType];
  }

  // Fall back to generic labels
  const genericLabels = {
    service_call: 'Service Call',
    appointment: 'Appointment',
    meeting: 'Meeting',
    consultation: 'Consultation',
    quote: 'Quote Request',
    emergency: 'Emergency',
    inspection: 'Inspection',
    showing: 'Showing',
    follow_up: 'Follow-up',
  };

  return (
    (genericLabels as any)[eventType] ||
    eventType.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase())
  );
}

/**
 * Check if industry requires specific compliance
 */
export function industryRequiresCompliance(
  industryId: string,
  requirement: string
): boolean {
  const config = getIndustryConfiguration(industryId);
  return config.complianceRequirements?.includes(requirement) || false;
}

/**
 * Get business hours in structured format
 */
export function parseBusinessHours(businessHours: string): {
  startTime: string;
  endTime: string;
  days: string;
} {
  const match = businessHours.match(/(\d{2}:\d{2})-(\d{2}:\d{2})\s+(.+)/);

  if (match) {
    return {
      startTime: match[1],
      endTime: match[2],
      days: match[3],
    };
  }

  return {
    startTime: '09:00',
    endTime: '17:00',
    days: 'Mon-Fri',
  };
}
