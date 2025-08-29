/**
 * TypeScript interfaces for Industry Configuration System components
 * These types extend the base industry configuration to support UI customization
 */

import { type IndustryConfiguration } from '@/lib/industry/configurations';

// Extended event type with UI-specific properties
export interface EventType {
  id: string;
  name: string;
  label: string;
  color: string;
  duration: number;
  urgency: string;
  description: string;
  requiresLocation: boolean;
  enabled: boolean;
  category?: 'standard' | 'emergency' | 'consultation' | 'custom';
  icon?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

// Terminology customization interface
export interface TerminologyItem {
  key: string;
  label: string;
  value: string;
  originalValue: string;
  description: string;
  category: 'core' | 'events' | 'customer' | 'ui';
  required: boolean;
  placeholder?: string;
  maxLength?: number;
}

// Email template configuration
export interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  htmlContent: string;
  textContent: string;
  variables: string[];
  isDefault: boolean;
  category: 'call_summary' | 'event_confirmation' | 'follow_up' | 'emergency' | 'custom';
  industryId?: string;
  createdAt?: Date;
  updatedAt?: Date;
  previewImageUrl?: string;
  tags?: string[];
}

// Email template variable definitions
export interface TemplateVariable {
  key: string;
  label: string;
  description: string;
  example: string;
  required: boolean;
  type: 'string' | 'date' | 'time' | 'phone' | 'email' | 'currency' | 'html';
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
  };
}

// Industry configuration with extended UI properties
export interface ExtendedIndustryConfiguration extends IndustryConfiguration {
  customEventTypes?: EventType[];
  customTerminology?: Record<string, string>;
  customEmailTemplates?: EmailTemplate[];
  branding?: {
    logo?: string;
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
    fontFamily?: string;
  };
  notifications?: {
    emailEnabled: boolean;
    smsEnabled: boolean;
    pushEnabled: boolean;
    webhookUrl?: string;
  };
  workflows?: {
    autoConfirmEvents: boolean;
    requireManualReview: boolean;
    sendFollowUpEmails: boolean;
    escalationRules?: EscalationRule[];
  };
}

// Escalation rule for urgent events
export interface EscalationRule {
  id: string;
  name: string;
  triggerCondition: 'urgency_level' | 'response_time' | 'customer_type' | 'event_type';
  triggerValue: string | number;
  action: 'email' | 'sms' | 'webhook' | 'phone_call';
  recipient: string;
  delay: number; // minutes
  enabled: boolean;
}

// Configuration change tracking
export interface ConfigurationChange {
  id: string;
  userId: string;
  changeType: 'industry' | 'event_type' | 'terminology' | 'template' | 'workflow';
  entityId: string;
  oldValue: any;
  newValue: any;
  timestamp: Date;
  reason?: string;
}

// Industry statistics for analytics
export interface IndustryStats {
  totalCalls: number;
  eventsExtracted: number;
  averageConfidence: number;
  topEventTypes: Array<{
    type: string;
    count: number;
    percentage: number;
  }>;
  urgencyDistribution: Record<string, number>;
  responseTimeMetrics: {
    average: number;
    median: number;
    p95: number;
  };
}

// Component props interfaces
export interface IndustryConfigurationSectionProps {
  userId?: string;
  initialIndustry?: string;
  onChange?: (changes: Partial<ExtendedIndustryConfiguration>) => void;
  onSave?: (configuration: ExtendedIndustryConfiguration) => Promise<void>;
}

export interface IndustrySelectorProps {
  currentIndustry: IndustryConfiguration | null;
  onIndustryChange: (industry: IndustryConfiguration) => void;
  disabled?: boolean;
  showPreview?: boolean;
}

export interface EventTypesConfigurationProps {
  industry: IndustryConfiguration;
  eventTypes?: EventType[];
  onChange: (eventTypes: EventType[]) => void;
  allowCustomTypes?: boolean;
  maxEventTypes?: number;
}

export interface TerminologySettingsProps {
  industry: IndustryConfiguration;
  terminology?: Record<string, string>;
  onChange: (terminology: Record<string, string>) => void;
  showPreview?: boolean;
  allowCustomTerms?: boolean;
}

export interface EmailTemplateConfigurationProps {
  industry: IndustryConfiguration;
  templates?: EmailTemplate[];
  onChange: (templates: EmailTemplate[]) => void;
  allowCustomTemplates?: boolean;
  maxTemplates?: number;
}

// Modal and form interfaces
export interface EventTypeModalProps {
  eventType: EventType | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (eventType: EventType) => void;
  urgencyLevels: string[];
  existingNames?: string[];
}

export interface TemplateEditorProps {
  template: EmailTemplate;
  variables: TemplateVariable[];
  onSave: (template: EmailTemplate) => void;
  onCancel: () => void;
  previewMode?: 'desktop' | 'mobile';
  allowHtmlEditing?: boolean;
}

// Configuration validation
export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
  severity: 'error' | 'warning' | 'info';
}

export interface ValidationWarning {
  field: string;
  message: string;
  suggestion?: string;
}

// Industry configuration context
export interface IndustryConfigurationContextValue {
  currentIndustry: IndustryConfiguration | null;
  extendedConfig: ExtendedIndustryConfiguration | null;
  isLoading: boolean;
  hasUnsavedChanges: boolean;
  validationResult: ValidationResult | null;
  
  // Actions
  updateIndustry: (industry: IndustryConfiguration) => void;
  updateEventTypes: (eventTypes: EventType[]) => void;
  updateTerminology: (terminology: Record<string, string>) => void;
  updateTemplates: (templates: EmailTemplate[]) => void;
  saveConfiguration: () => Promise<void>;
  resetConfiguration: () => void;
  validateConfiguration: () => ValidationResult;
}

// Theme configuration for industry-specific styling
export interface IndustryTheme {
  colors: {
    primary: string;
    secondary: string;
    accent: string;
    success: string;
    warning: string;
    error: string;
    background: string;
    surface: string;
    text: string;
    textSecondary: string;
  };
  typography: {
    fontFamily: string;
    headingWeight: number;
    bodyWeight: number;
    sizes: Record<string, string>;
  };
  spacing: Record<string, string>;
  borderRadius: Record<string, string>;
  shadows: Record<string, string>;
}

// Export utility types
export type EventTypeCategory = EventType['category'];
export type EmailTemplateCategory = EmailTemplate['category'];
export type TerminologyCategory = TerminologyItem['category'];
export type ConfigurationChangeType = ConfigurationChange['changeType'];

// Form data types for controlled components
export interface EventTypeFormData extends Omit<EventType, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
}

export interface TemplateFormData extends Omit<EmailTemplate, 'id' | 'createdAt' | 'updatedAt'> {
  id?: string;
}

export interface TerminologyFormData {
  [key: string]: string;
}

// API response types
export interface SaveConfigurationResponse {
  success: boolean;
  configuration?: ExtendedIndustryConfiguration;
  errors?: ValidationError[];
  message?: string;
}

export interface LoadConfigurationResponse {
  success: boolean;
  configuration?: ExtendedIndustryConfiguration;
  message?: string;
}

// Hook return types
export interface UseIndustryConfigurationReturn {
  configuration: ExtendedIndustryConfiguration | null;
  isLoading: boolean;
  error: string | null;
  hasChanges: boolean;
  
  updateConfiguration: (updates: Partial<ExtendedIndustryConfiguration>) => void;
  saveConfiguration: () => Promise<SaveConfigurationResponse>;
  resetConfiguration: () => void;
  validateConfiguration: () => ValidationResult;
}

// Preview data types
export interface PreviewData {
  customerName: string;
  customerPhone: string;
  appointmentType: string;
  appointmentDate: string;
  appointmentTime: string;
  location: string;
  urgencyLevel: string;
  callSummary: string;
  companyName: string;
  callDuration: string;
}