# Flynn.ai v2 Industry Configurations

## Overview
Comprehensive industry-specific configurations that adapt Flynn.ai's behavior, terminology, event types, and workflows to match different business contexts. Each industry profile optimizes the AI extraction, email templates, and user experience.

## Industry Configuration System

### Configuration Architecture

```typescript
// types/industry.ts
export interface IndustryConfiguration {
  id: string;
  name: string;
  code: string;
  description: string;
  
  // Event Management
  eventTypes: EventTypeConfig[];
  defaultEventType: string;
  defaultDuration: number; // minutes
  
  // Terminology
  terminology: TerminologyMap;
  
  // Business Logic
  businessHours: BusinessHours;
  pricingEnabled: boolean;
  locationRequired: boolean;
  autoConfirmEnabled: boolean;
  
  // AI Configuration
  extractionPrompts: ExtractionPrompts;
  urgencyKeywords: string[];
  emergencyKeywords: string[];
  
  // Email Configuration
  emailTemplates: EmailTemplateConfig[];
  subjectLineTemplates: string[];
  
  // Calendar Configuration
  calendarDefaults: CalendarDefaults;
  reminderSettings: ReminderSettings;
  
  // UI Customization
  colors: ColorScheme;
  icons: IconSet;
  labels: LabelSet;
}

export interface EventTypeConfig {
  code: string;
  name: string;
  description: string;
  defaultDuration: number;
  color: string;
  icon: string;
  requiresLocation: boolean;
  requiresPrice: boolean;
  allowsRecurring: boolean;
}
```

## Industry Configurations

### 1. Plumbing Services

```typescript
export const PLUMBING_CONFIG: IndustryConfiguration = {
  id: 'plumbing',
  name: 'Plumbing Services',
  code: 'plumbing',
  description: 'Residential and commercial plumbing services',
  
  eventTypes: [
    {
      code: 'service_call',
      name: 'Service Call',
      description: 'On-site plumbing service or repair',
      defaultDuration: 90,
      color: '#3b82f6',
      icon: '🔧',
      requiresLocation: true,
      requiresPrice: true,
      allowsRecurring: false
    },
    {
      code: 'emergency',
      name: 'Emergency Service',
      description: 'Urgent plumbing emergency',
      defaultDuration: 120,
      color: '#dc2626',
      icon: '🚨',
      requiresLocation: true,
      requiresPrice: true,
      allowsRecurring: false
    },
    {
      code: 'quote',
      name: 'Quote/Estimate',
      description: 'Site visit for pricing estimate',
      defaultDuration: 60,
      color: '#059669',
      icon: '📋',
      requiresLocation: true,
      requiresPrice: false,
      allowsRecurring: false
    },
    {
      code: 'follow_up',
      name: 'Follow-up',
      description: 'Follow-up visit or call',
      defaultDuration: 30,
      color: '#7c3aed',
      icon: '📞',
      requiresLocation: false,
      requiresPrice: false,
      allowsRecurring: true
    }
  ],
  
  defaultEventType: 'service_call',
  defaultDuration: 90,
  
  terminology: {
    'appointment': 'service call',
    'meeting': 'site visit',
    'consultation': 'estimate visit',
    'demo': 'system walkthrough',
    'client': 'customer',
    'patient': 'customer'
  },
  
  businessHours: {
    monday: { start: '08:00', end: '17:00', enabled: true },
    tuesday: { start: '08:00', end: '17:00', enabled: true },
    wednesday: { start: '08:00', end: '17:00', enabled: true },
    thursday: { start: '08:00', end: '17:00', enabled: true },
    friday: { start: '08:00', end: '17:00', enabled: true },
    saturday: { start: '09:00', end: '15:00', enabled: true },
    sunday: { start: '10:00', end: '14:00', enabled: false },
    holidays: { enabled: false }
  },
  
  pricingEnabled: true,
  locationRequired: true,
  autoConfirmEnabled: false,
  
  extractionPrompts: {
    systemPrompt: `You are analyzing calls for a plumbing service business. 
    Focus on:
    - Service requests and repair needs
    - Emergency situations (water damage, flooding, no water/heat)
    - Location details (critical for field service)
    - Problem descriptions (for preparation and parts)
    - Time preferences and availability
    - Price estimates and budget discussions`,
    
    eventTypeClassification: {
      'service_call': ['fix', 'repair', 'install', 'replace', 'service'],
      'emergency': ['emergency', 'urgent', 'flooding', 'burst', 'no water', 'no heat'],
      'quote': ['quote', 'estimate', 'price', 'cost', 'how much'],
      'follow_up': ['follow up', 'check back', 'call back', 'touch base']
    },
    
    urgencyDetection: {
      emergency: ['flooding', 'burst pipe', 'no water', 'no heat', 'sewage backup', 'gas leak'],
      high: ['water damage', 'leak getting worse', 'no hot water', 'backed up'],
      medium: ['slow drain', 'dripping', 'running toilet', 'low pressure'],
      low: ['maintenance', 'upgrade', 'inspection', 'when convenient']
    }
  },
  
  urgencyKeywords: ['leak', 'broken', 'not working', 'clogged', 'backup'],
  emergencyKeywords: ['emergency', 'flooding', 'burst', 'no water', 'gas smell'],
  
  emailTemplates: [
    {
      name: 'service_call_overview',
      subject: 'Service Call Request - {customer_name} - {date}',
      greeting: 'Thank you for calling {company_name}',
      eventDescription: 'We have scheduled a service call for {description} at {location}.',
      footer: 'We look forward to helping you with your plumbing needs.'
    },
    {
      name: 'emergency_response',
      subject: 'URGENT: Emergency Service - {customer_name}',
      greeting: 'We received your emergency service request',
      eventDescription: 'Our technician will respond to your {description} emergency at {location}.',
      footer: 'We understand the urgency and will be there as soon as possible.'
    }
  ],
  
  subjectLineTemplates: [
    'Service Call - {main_topic} - {customer_name}',
    '{urgency} Plumbing Request - {location}',
    'Estimate Request - {description}'
  ],
  
  calendarDefaults: {
    defaultReminders: [30, 1440], // 30 minutes and 1 day
    travelTimeDefault: 15,
    bufferTimeDefault: 15,
    workingHours: { start: '08:00', end: '17:00' }
  },
  
  reminderSettings: {
    emailReminders: [
      { timing: 1440, message: 'Reminder: Service call tomorrow at {time}' },
      { timing: 60, message: 'We\'ll be there in 1 hour for your service call' }
    ],
    smsReminders: [
      { timing: 120, message: 'Hi {customer_name}, we\'ll be there in 2 hours for your {service_type}' }
    ]
  },
  
  colors: {
    primary: '#1e40af',
    secondary: '#3b82f6',
    accent: '#059669',
    emergency: '#dc2626',
    success: '#10b981',
    warning: '#f59e0b'
  },
  
  icons: {
    service: '🔧',
    emergency: '🚨',
    quote: '📋',
    phone: '📞',
    location: '📍',
    time: '⏰'
  },
  
  labels: {
    eventTypes: {
      service_call: 'Service Call',
      emergency: 'Emergency',
      quote: 'Estimate',
      follow_up: 'Follow-up'
    },
    statuses: {
      extracted: 'New Request',
      pending: 'Needs Confirmation',
      confirmed: 'Scheduled',
      completed: 'Completed'
    }
  }
};
```

### 2. Real Estate Services

```typescript
export const REAL_ESTATE_CONFIG: IndustryConfiguration = {
  id: 'real_estate',
  name: 'Real Estate',
  code: 'real_estate',
  description: 'Real estate sales and property management',
  
  eventTypes: [
    {
      code: 'showing',
      name: 'Property Showing',
      description: 'Property showing or tour',
      defaultDuration: 45,
      color: '#059669',
      icon: '🏠',
      requiresLocation: true,
      requiresPrice: false,
      allowsRecurring: false
    },
    {
      code: 'meeting',
      name: 'Client Meeting',
      description: 'Client consultation or discussion',
      defaultDuration: 60,
      color: '#3b82f6',
      icon: '👥',
      requiresLocation: false,
      requiresPrice: false,
      allowsRecurring: false
    },
    {
      code: 'inspection',
      name: 'Property Inspection',
      description: 'Home inspection or walkthrough',
      defaultDuration: 90,
      color: '#7c3aed',
      icon: '🔍',
      requiresLocation: true,
      requiresPrice: false,
      allowsRecurring: false
    },
    {
      code: 'closing',
      name: 'Closing',
      description: 'Property closing or signing',
      defaultDuration: 120,
      color: '#dc2626',
      icon: '📝',
      requiresLocation: true,
      requiresPrice: false,
      allowsRecurring: false
    }
  ],
  
  defaultEventType: 'showing',
  defaultDuration: 45,
  
  terminology: {
    'service_call': 'property showing',
    'appointment': 'showing',
    'customer': 'client',
    'quote': 'market analysis',
    'emergency': 'urgent showing'
  },
  
  businessHours: {
    monday: { start: '09:00', end: '18:00', enabled: true },
    tuesday: { start: '09:00', end: '18:00', enabled: true },
    wednesday: { start: '09:00', end: '18:00', enabled: true },
    thursday: { start: '09:00', end: '18:00', enabled: true },
    friday: { start: '09:00', end: '18:00', enabled: true },
    saturday: { start: '10:00', end: '17:00', enabled: true },
    sunday: { start: '12:00', end: '17:00', enabled: true },
    holidays: { enabled: false }
  },
  
  pricingEnabled: false,
  locationRequired: true,
  autoConfirmEnabled: false,
  
  extractionPrompts: {
    systemPrompt: `You are analyzing calls for a real estate business.
    Focus on:
    - Property addresses and locations
    - Showing requests and availability
    - Client qualification (pre-approved, cash buyer, timeline)
    - Property types and preferences
    - Urgency indicators (moving timeline, competing offers)
    - Market conditions and pricing discussions`,
    
    eventTypeClassification: {
      'showing': ['show', 'see property', 'tour', 'view', 'look at'],
      'meeting': ['meet', 'discuss', 'consultation', 'talk about'],
      'inspection': ['inspect', 'walkthrough', 'examine', 'check out'],
      'closing': ['closing', 'sign', 'finalize', 'settlement']
    },
    
    urgencyDetection: {
      high: ['pre-approved', 'cash buyer', 'move quickly', 'urgent', 'closing soon'],
      medium: ['looking actively', 'ready to buy', 'serious buyer'],
      low: ['just looking', 'exploring options', 'maybe interested']
    }
  },
  
  urgencyKeywords: ['pre-approved', 'cash', 'urgent', 'quickly', 'closing'],
  emergencyKeywords: ['today', 'right now', 'asap', 'immediate'],
  
  emailTemplates: [
    {
      name: 'showing_request',
      subject: 'Property Showing - {property_address} - {date}',
      greeting: 'Thank you for your interest in {property_address}',
      eventDescription: 'I have scheduled a showing for {date} at {time}.',
      footer: 'I look forward to showing you this beautiful property.'
    }
  ],
  
  calendarDefaults: {
    defaultReminders: [60, 1440],
    travelTimeDefault: 20,
    bufferTimeDefault: 15,
    workingHours: { start: '09:00', end: '18:00' }
  }
};
```

### 3. Legal Services

```typescript
export const LEGAL_CONFIG: IndustryConfiguration = {
  id: 'legal',
  name: 'Legal Services',
  code: 'legal',
  description: 'Legal consultations and services',
  
  eventTypes: [
    {
      code: 'consultation',
      name: 'Legal Consultation',
      description: 'Initial client consultation',
      defaultDuration: 60,
      color: '#1e40af',
      icon: '⚖️',
      requiresLocation: false,
      requiresPrice: true,
      allowsRecurring: false
    },
    {
      code: 'meeting',
      name: 'Client Meeting',
      description: 'Client meeting or case discussion',
      defaultDuration: 90,
      color: '#3b82f6',
      icon: '👥',
      requiresLocation: false,
      requiresPrice: false,
      allowsRecurring: true
    },
    {
      code: 'court',
      name: 'Court Appearance',
      description: 'Court hearing or appearance',
      defaultDuration: 180,
      color: '#dc2626',
      icon: '🏛️',
      requiresLocation: true,
      requiresPrice: false,
      allowsRecurring: false
    },
    {
      code: 'deposition',
      name: 'Deposition',
      description: 'Deposition or testimony',
      defaultDuration: 240,
      color: '#7c3aed',
      icon: '📝',
      requiresLocation: true,
      requiresPrice: false,
      allowsRecurring: false
    }
  ],
  
  terminology: {
    'service_call': 'consultation',
    'customer': 'client',
    'appointment': 'consultation',
    'emergency': 'urgent legal matter'
  },
  
  businessHours: {
    monday: { start: '09:00', end: '17:00', enabled: true },
    tuesday: { start: '09:00', end: '17:00', enabled: true },
    wednesday: { start: '09:00', end: '17:00', enabled: true },
    thursday: { start: '09:00', end: '17:00', enabled: true },
    friday: { start: '09:00', end: '17:00', enabled: true },
    saturday: { start: '10:00', end: '14:00', enabled: false },
    sunday: { enabled: false },
    holidays: { enabled: false }
  },
  
  pricingEnabled: true,
  locationRequired: false,
  autoConfirmEnabled: false,
  
  extractionPrompts: {
    systemPrompt: `You are analyzing calls for a legal services firm.
    Focus on:
    - Legal matter types (divorce, business, criminal, estate, etc.)
    - Urgency indicators (deadlines, court dates, statute of limitations)
    - Client confidentiality considerations
    - Consultation requests vs. ongoing case work
    - Billing and fee discussions
    - Referral sources and existing relationships`,
    
    urgencyDetection: {
      emergency: ['deadline tomorrow', 'court today', 'statute of limitations'],
      high: ['court date', 'deadline', 'urgent legal matter', 'time sensitive'],
      medium: ['consultation needed', 'legal question', 'case review'],
      low: ['general information', 'thinking about', 'maybe need']
    }
  },
  
  urgencyKeywords: ['deadline', 'court', 'urgent', 'asap', 'time sensitive'],
  emergencyKeywords: ['emergency', 'tonight', 'today', 'immediate']
};
```

### 4. Medical/Healthcare

```typescript
export const MEDICAL_CONFIG: IndustryConfiguration = {
  id: 'medical',
  name: 'Medical/Healthcare',
  code: 'medical',
  description: 'Medical appointments and healthcare services',
  
  eventTypes: [
    {
      code: 'appointment',
      name: 'Patient Appointment',
      description: 'Regular patient appointment',
      defaultDuration: 30,
      color: '#059669',
      icon: '🩺',
      requiresLocation: false,
      requiresPrice: false,
      allowsRecurring: true
    },
    {
      code: 'consultation',
      name: 'Consultation',
      description: 'Medical consultation',
      defaultDuration: 45,
      color: '#3b82f6',
      icon: '👨‍⚕️',
      requiresLocation: false,
      requiresPrice: false,
      allowsRecurring: false
    },
    {
      code: 'follow_up',
      name: 'Follow-up',
      description: 'Follow-up appointment',
      defaultDuration: 20,
      color: '#7c3aed',
      icon: '📋',
      requiresLocation: false,
      requiresPrice: false,
      allowsRecurring: false
    },
    {
      code: 'urgent',
      name: 'Urgent Care',
      description: 'Urgent medical care',
      defaultDuration: 45,
      color: '#dc2626',
      icon: '🚑',
      requiresLocation: false,
      requiresPrice: false,
      allowsRecurring: false
    }
  ],
  
  terminology: {
    'service_call': 'appointment',
    'customer': 'patient',
    'client': 'patient',
    'meeting': 'appointment'
  },
  
  businessHours: {
    monday: { start: '08:00', end: '17:00', enabled: true },
    tuesday: { start: '08:00', end: '17:00', enabled: true },
    wednesday: { start: '08:00', end: '17:00', enabled: true },
    thursday: { start: '08:00', end: '17:00', enabled: true },
    friday: { start: '08:00', end: '17:00', enabled: true },
    saturday: { start: '09:00', end: '13:00', enabled: false },
    sunday: { enabled: false }
  },
  
  pricingEnabled: false,
  locationRequired: false,
  autoConfirmEnabled: true,
  
  extractionPrompts: {
    systemPrompt: `You are analyzing calls for a medical/healthcare practice.
    IMPORTANT: Handle all information as potentially PHI (Protected Health Information).
    Focus on:
    - Appointment requests and scheduling
    - Symptom descriptions (general only, no detailed PHI)
    - Urgency assessment for medical needs
    - Insurance and billing information
    - Follow-up appointments and care coordination
    - Patient preferences and accessibility needs
    
    PRIVACY: Do not extract or store detailed medical information.`,
    
    urgencyDetection: {
      emergency: ['chest pain', 'breathing problems', 'severe bleeding', 'unconscious'],
      high: ['severe pain', 'urgent', 'can\'t wait', 'getting worse'],
      medium: ['uncomfortable', 'concerning', 'soon as possible'],
      low: ['routine', 'check-up', 'when convenient', 'maintenance']
    }
  },
  
  urgencyKeywords: ['pain', 'urgent', 'worse', 'concerned', 'symptoms'],
  emergencyKeywords: ['emergency', 'chest pain', 'breathing', 'severe', 'unconscious']
};
```

### 5. Sales/Business Development

```typescript
export const SALES_CONFIG: IndustryConfiguration = {
  id: 'sales',
  name: 'Sales & Business Development',
  code: 'sales',
  description: 'Sales meetings and business development',
  
  eventTypes: [
    {
      code: 'demo',
      name: 'Product Demo',
      description: 'Product demonstration',
      defaultDuration: 60,
      color: '#059669',
      icon: '🖥️',
      requiresLocation: false,
      requiresPrice: false,
      allowsRecurring: false
    },
    {
      code: 'discovery',
      name: 'Discovery Call',
      description: 'Discovery/qualification call',
      defaultDuration: 45,
      color: '#3b82f6',
      icon: '🔍',
      requiresLocation: false,
      requiresPrice: false,
      allowsRecurring: false
    },
    {
      code: 'follow_up',
      name: 'Follow-up',
      description: 'Follow-up call or meeting',
      defaultDuration: 30,
      color: '#7c3aed',
      icon: '📞',
      requiresLocation: false,
      requiresPrice: false,
      allowsRecurring: true
    },
    {
      code: 'proposal',
      name: 'Proposal Review',
      description: 'Proposal presentation',
      defaultDuration: 90,
      color: '#dc2626',
      icon: '📊',
      requiresLocation: false,
      requiresPrice: false,
      allowsRecurring: false
    }
  ],
  
  terminology: {
    'service_call': 'sales call',
    'appointment': 'meeting',
    'customer': 'prospect',
    'client': 'prospect'
  },
  
  extractionPrompts: {
    systemPrompt: `You are analyzing calls for a sales/business development team.
    Focus on:
    - Meeting requests and demo scheduling  
    - Company size and industry information
    - Budget and timeline discussions
    - Decision maker identification
    - Pain points and requirements
    - Competitor mentions and comparisons
    - Urgency indicators (budget cycles, deadlines)`,
    
    urgencyDetection: {
      high: ['budget approved', 'need by', 'decision this week', 'ready to move'],
      medium: ['evaluating options', 'interested', 'timeline'],
      low: ['exploring', 'just learning', 'future consideration']
    }
  }
};
```

### 6. Consulting Services

```typescript
export const CONSULTING_CONFIG: IndustryConfiguration = {
  id: 'consulting',
  name: 'Consulting Services',
  code: 'consulting',
  description: 'Professional consulting services',
  
  eventTypes: [
    {
      code: 'consultation',
      name: 'Initial Consultation',
      description: 'Initial client consultation',
      defaultDuration: 90,
      color: '#1e40af',
      icon: '💼',
      requiresLocation: false,
      requiresPrice: true,
      allowsRecurring: false
    },
    {
      code: 'strategy_session',
      name: 'Strategy Session',
      description: 'Strategic planning session',
      defaultDuration: 120,
      color: '#059669',
      icon: '🎯',
      requiresLocation: false,
      requiresPrice: false,
      allowsRecurring: false
    },
    {
      code: 'workshop',
      name: 'Workshop',
      description: 'Training workshop or session',
      defaultDuration: 240,
      color: '#7c3aed',
      icon: '🎓',
      requiresLocation: false,
      requiresPrice: false,
      allowsRecurring: false
    },
    {
      code: 'check_in',
      name: 'Check-in',
      description: 'Progress check-in meeting',
      defaultDuration: 60,
      color: '#3b82f6',
      icon: '📈',
      requiresLocation: false,
      requiresPrice: false,
      allowsRecurring: true
    }
  ],
  
  terminology: {
    'service_call': 'consultation',
    'customer': 'client',
    'appointment': 'session'
  }
};
```

## Configuration Management System

### Dynamic Configuration Loading

```typescript
// lib/industry/configurationManager.ts
export class IndustryConfigurationManager {
  private configurations: Map<string, IndustryConfiguration> = new Map();
  
  constructor() {
    this.loadConfigurations();
  }
  
  private loadConfigurations() {
    const configs = [
      PLUMBING_CONFIG,
      REAL_ESTATE_CONFIG,
      LEGAL_CONFIG,
      MEDICAL_CONFIG,
      SALES_CONFIG,
      CONSULTING_CONFIG
    ];
    
    configs.forEach(config => {
      this.configurations.set(config.code, config);
    });
  }
  
  getConfiguration(industryCode: string): IndustryConfiguration | null {
    return this.configurations.get(industryCode) || null;
  }
  
  getAllConfigurations(): IndustryConfiguration[] {
    return Array.from(this.configurations.values());
  }
  
  getEventTypes(industryCode: string): EventTypeConfig[] {
    const config = this.getConfiguration(industryCode);
    return config?.eventTypes || [];
  }
  
  getTerminology(industryCode: string): TerminologyMap {
    const config = this.getConfiguration(industryCode);
    return config?.terminology || {};
  }
  
  translateTerm(industryCode: string, term: string): string {
    const terminology = this.getTerminology(industryCode);
    return terminology[term] || term;
  }
  
  getBusinessHours(industryCode: string): BusinessHours {
    const config = this.getConfiguration(industryCode);
    return config?.businessHours || this.getDefaultBusinessHours();
  }
  
  isBusinessTime(industryCode: string, dateTime: Date): boolean {
    const businessHours = this.getBusinessHours(industryCode);
    const dayName = dateTime.toLocaleDateString('en-US', { weekday: 'lowercase' }) as keyof BusinessHours;
    const hours = businessHours[dayName];
    
    if (!hours?.enabled) return false;
    
    const timeString = dateTime.toTimeString().slice(0, 5); // HH:MM format
    return timeString >= hours.start && timeString <= hours.end;
  }
  
  private getDefaultBusinessHours(): BusinessHours {
    const defaultHours = { start: '09:00', end: '17:00', enabled: true };
    return {
      monday: defaultHours,
      tuesday: defaultHours,
      wednesday: defaultHours,
      thursday: defaultHours,
      friday: defaultHours,
      saturday: { start: '10:00', end: '14:00', enabled: false },
      sunday: { enabled: false },
      holidays: { enabled: false }
    };
  }
}
```

### User Configuration Override

```typescript
// lib/industry/userConfiguration.ts
export interface UserIndustryConfiguration {
  userId: string;
  industryCode: string;
  customizations: {
    eventTypes?: EventTypeConfig[];
    terminology?: Partial<TerminologyMap>;
    businessHours?: Partial<BusinessHours>;
    emailTemplates?: EmailTemplateConfig[];
    colors?: Partial<ColorScheme>;
    labels?: Partial<LabelSet>;
  };
  createdAt: Date;
  updatedAt: Date;
}

export class UserConfigurationManager {
  async getUserConfiguration(userId: string): Promise<UserIndustryConfiguration | null> {
    // Load from database
    const userConfig = await supabase
      .from('user_industry_configurations')
      .select('*')
      .eq('user_id', userId)
      .single();
      
    return userConfig.data;
  }
  
  async saveUserConfiguration(config: UserIndustryConfiguration): Promise<void> {
    await supabase
      .from('user_industry_configurations')
      .upsert(config);
  }
  
  mergeWithIndustryDefaults(
    industryConfig: IndustryConfiguration, 
    userConfig: UserIndustryConfiguration
  ): IndustryConfiguration {
    return {
      ...industryConfig,
      eventTypes: userConfig.customizations.eventTypes || industryConfig.eventTypes,
      terminology: { ...industryConfig.terminology, ...userConfig.customizations.terminology },
      businessHours: { ...industryConfig.businessHours, ...userConfig.customizations.businessHours },
      emailTemplates: userConfig.customizations.emailTemplates || industryConfig.emailTemplates,
      colors: { ...industryConfig.colors, ...userConfig.customizations.colors },
      labels: { ...industryConfig.labels, ...userConfig.customizations.labels }
    };
  }
}
```

## Industry-Specific UI Components

### Industry Selector Component

```tsx
// components/industry/IndustrySelector.tsx
import { useState } from 'react';
import { IndustryConfigurationManager } from '@/lib/industry/configurationManager';

interface IndustrySelectorProps {
  selectedIndustry: string | null;
  onIndustryChange: (industryCode: string) => void;
}

export function IndustrySelector({ selectedIndustry, onIndustryChange }: IndustrySelectorProps) {
  const configManager = new IndustryConfigurationManager();
  const industries = configManager.getAllConfigurations();
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {industries.map(industry => (
        <button
          key={industry.code}
          onClick={() => onIndustryChange(industry.code)}
          className={`
            p-6 rounded-lg border-2 transition-all
            ${selectedIndustry === industry.code 
              ? 'border-blue-500 bg-blue-50' 
              : 'border-gray-200 hover:border-gray-300'
            }
          `}
        >
          <div className="text-3xl mb-2">{industry.icons?.service || '🏢'}</div>
          <h3 className="font-semibold text-lg">{industry.name}</h3>
          <p className="text-sm text-gray-600 mt-1">{industry.description}</p>
        </button>
      ))}
    </div>
  );
}
```

### Event Type Selector

```tsx
// components/industry/EventTypeSelector.tsx
import { IndustryConfigurationManager } from '@/lib/industry/configurationManager';

interface EventTypeSelectorProps {
  industryCode: string;
  selectedEventType: string | null;
  onEventTypeChange: (eventType: string) => void;
}

export function EventTypeSelector({ 
  industryCode, 
  selectedEventType, 
  onEventTypeChange 
}: EventTypeSelectorProps) {
  const configManager = new IndustryConfigurationManager();
  const eventTypes = configManager.getEventTypes(industryCode);
  
  return (
    <div className="flex flex-wrap gap-2">
      {eventTypes.map(eventType => (
        <button
          key={eventType.code}
          onClick={() => onEventTypeChange(eventType.code)}
          className={`
            px-4 py-2 rounded-full border flex items-center space-x-2
            ${selectedEventType === eventType.code
              ? 'border-blue-500 bg-blue-100 text-blue-800'
              : 'border-gray-300 hover:border-gray-400'
            }
          `}
          style={{
            borderColor: selectedEventType === eventType.code ? eventType.color : undefined
          }}
        >
          <span>{eventType.icon}</span>
          <span className="text-sm font-medium">{eventType.name}</span>
        </button>
      ))}
    </div>
  );
}
```

## Configuration Validation

### Configuration Schema Validation

```typescript
// lib/industry/validation.ts
import { z } from 'zod';

export const EventTypeConfigSchema = z.object({
  code: z.string().min(1),
  name: z.string().min(1),
  description: z.string(),
  defaultDuration: z.number().min(15).max(480),
  color: z.string().regex(/^#[0-9A-F]{6}$/i),
  icon: z.string(),
  requiresLocation: z.boolean(),
  requiresPrice: z.boolean(),
  allowsRecurring: z.boolean()
});

export const IndustryConfigurationSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  code: z.string().min(1),
  description: z.string(),
  eventTypes: z.array(EventTypeConfigSchema),
  defaultEventType: z.string(),
  defaultDuration: z.number().min(15).max(480),
  terminology: z.record(z.string()),
  pricingEnabled: z.boolean(),
  locationRequired: z.boolean(),
  autoConfirmEnabled: z.boolean()
});

export function validateIndustryConfiguration(config: unknown): IndustryConfiguration {
  return IndustryConfigurationSchema.parse(config);
}
```

## Migration & Updates

### Configuration Versioning

```typescript
// lib/industry/migration.ts
export interface ConfigurationMigration {
  fromVersion: string;
  toVersion: string;
  migrate: (config: any) => IndustryConfiguration;
}

export const CONFIGURATION_MIGRATIONS: ConfigurationMigration[] = [
  {
    fromVersion: '1.0',
    toVersion: '2.0',
    migrate: (config) => {
      // Add new eventTypes field
      if (!config.eventTypes) {
        config.eventTypes = getDefaultEventTypes(config.code);
      }
      return config;
    }
  }
];

export class ConfigurationMigrator {
  migrateConfiguration(config: any, currentVersion: string): IndustryConfiguration {
    let migratedConfig = config;
    
    for (const migration of CONFIGURATION_MIGRATIONS) {
      if (this.shouldApplyMigration(currentVersion, migration)) {
        migratedConfig = migration.migrate(migratedConfig);
      }
    }
    
    return validateIndustryConfiguration(migratedConfig);
  }
  
  private shouldApplyMigration(currentVersion: string, migration: ConfigurationMigration): boolean {
    return this.compareVersions(currentVersion, migration.fromVersion) >= 0 &&
           this.compareVersions(currentVersion, migration.toVersion) < 0;
  }
}
```

## Testing Industry Configurations

### Configuration Testing

```typescript
// __tests__/industry/configurations.test.ts
import { IndustryConfigurationManager } from '@/lib/industry/configurationManager';
import { PLUMBING_CONFIG } from '@/lib/industry/configurations';

describe('Industry Configurations', () => {
  let configManager: IndustryConfigurationManager;
  
  beforeEach(() => {
    configManager = new IndustryConfigurationManager();
  });
  
  test('should load all industry configurations', () => {
    const configs = configManager.getAllConfigurations();
    expect(configs).toHaveLength(6);
    expect(configs.map(c => c.code)).toContain('plumbing');
    expect(configs.map(c => c.code)).toContain('real_estate');
  });
  
  test('should get plumbing configuration correctly', () => {
    const config = configManager.getConfiguration('plumbing');
    expect(config).toBeDefined();
    expect(config?.name).toBe('Plumbing Services');
    expect(config?.eventTypes).toHaveLength(4);
  });
  
  test('should translate terminology correctly', () => {
    const translated = configManager.translateTerm('plumbing', 'appointment');
    expect(translated).toBe('service call');
    
    const notTranslated = configManager.translateTerm('plumbing', 'unknown_term');
    expect(notTranslated).toBe('unknown_term');
  });
  
  test('should validate business hours correctly', () => {
    const mondayMorning = new Date('2025-01-13T10:00:00Z'); // Monday 10 AM
    const sundayEvening = new Date('2025-01-12T20:00:00Z'); // Sunday 8 PM
    
    expect(configManager.isBusinessTime('plumbing', mondayMorning)).toBe(true);
    expect(configManager.isBusinessTime('plumbing', sundayEvening)).toBe(false);
  });
});
```

This comprehensive industry configuration system allows Flynn.ai to adapt seamlessly to different business types while providing consistent functionality across all industries.