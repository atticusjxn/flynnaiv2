// Flynn.ai v2 - Settings Types
// Comprehensive user preferences and settings interfaces

export interface UserSettings {
  // Account Settings
  profile: ProfileSettings;
  
  // Email Preferences  
  email: EmailSettings;
  
  // Calendar Settings
  calendar: CalendarSettings;
  
  // Notification Preferences
  notifications: NotificationSettings;
  
  // AI & Processing Settings
  ai: AISettings;
  
  // UI Preferences
  ui: UISettings;
  
  // Version for settings migration
  version: number;
}

export interface ProfileSettings {
  displayName?: string;
  companyName?: string;
  timezone?: string;
  language?: string;
  avatar?: string;
  businessHours?: {
    enabled: boolean;
    monday?: BusinessDay;
    tuesday?: BusinessDay;
    wednesday?: BusinessDay;
    thursday?: BusinessDay;
    friday?: BusinessDay;
    saturday?: BusinessDay;
    sunday?: BusinessDay;
  };
}

export interface BusinessDay {
  enabled: boolean;
  startTime: string; // "09:00"
  endTime: string;   // "17:00"
}

export interface EmailSettings {
  // Notification Frequency
  frequency: 'immediate' | 'hourly' | 'daily' | 'weekly';
  
  // Email Format
  format: 'html' | 'text';
  
  // Content Preferences
  includeTranscript: boolean;
  includeCallSummary: boolean;
  includeEventDetails: boolean;
  includeCustomerInfo: boolean;
  includeRecordingLink: boolean;
  
  // Delivery Preferences
  businessHoursOnly: boolean;
  quietHours?: {
    enabled: boolean;
    startTime: string; // "22:00"
    endTime: string;   // "08:00"
  };
  
  // Template Preferences
  templateStyle: 'professional' | 'modern' | 'minimal' | 'detailed';
  brandingEnabled: boolean;
  customSignature?: string;
  
  // Auto-actions
  autoAttachICS: boolean;
  includeManageEventLinks: boolean;
  
  // Digest Settings (for non-immediate frequencies)
  digestTime: string; // "09:00" for daily/weekly
  weeklyDigestDay: 'monday' | 'tuesday' | 'wednesday' | 'thursday' | 'friday' | 'saturday' | 'sunday';
}

export interface CalendarSettings {
  // Default Integration
  defaultCalendar?: string; // calendar integration ID
  
  // Sync Preferences
  autoSync: boolean;
  syncOnlyConfirmed: boolean;
  
  // Event Creation Settings
  defaultDuration: number; // minutes
  bufferTime: number; // minutes before/after events
  
  // Conflict Resolution
  conflictResolution: 'manual' | 'auto_reschedule' | 'skip_conflicts';
  allowOverlappingEvents: boolean;
  
  // Event Details
  includeCustomerInfo: boolean;
  includeCallTranscript: boolean;
  includeLocation: boolean;
  setReminders: boolean;
  reminderMinutes: number[];
  
  // Advanced Settings
  privateEvents: boolean; // mark events as private
  eventColor?: string;
  eventPrefix?: string; // "Flynn.ai: " prefix for event titles
  
  // Timezone Handling
  useBusinessTimezone: boolean;
  convertToLocalTime: boolean;
}

export interface NotificationSettings {
  // Email Notifications
  email: {
    newCall: boolean;
    eventExtracted: boolean;
    eventConfirmed: boolean;
    eventReminder: boolean;
    systemUpdates: boolean;
    weeklyDigest: boolean;
    urgentOnly: boolean;
  };
  
  // SMS Notifications (if enabled)
  sms: {
    enabled: boolean;
    emergencyOnly: boolean;
    eventReminders: boolean;
    systemAlerts: boolean;
  };
  
  // Push Notifications (for PWA)
  push: {
    enabled: boolean;
    newCall: boolean;
    eventExtracted: boolean;
    eventConfirmed: boolean;
    showPreview: boolean;
  };
  
  // In-App Notifications
  inApp: {
    enabled: boolean;
    position: 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';
    duration: number; // milliseconds
    showSuccess: boolean;
    showErrors: boolean;
    showInfo: boolean;
  };
  
  // Do Not Disturb
  quietHours: {
    enabled: boolean;
    startTime: string;
    endTime: string;
    allowEmergency: boolean;
  };
}

export interface AISettings {
  // Processing Preferences
  processingMode: 'speed' | 'balanced' | 'accuracy';
  
  // Confidence Thresholds
  autoConfirmThreshold: number; // 0.0 to 1.0
  humanReviewThreshold: number; // 0.0 to 1.0
  
  // Event Extraction
  extractMultipleEvents: boolean;
  requireExplicitTime: boolean;
  requireLocation: boolean;
  
  // Industry-Specific Settings
  industryOptimizations: boolean;
  customKeywords: string[];
  
  // Auto Actions
  autoConfirmHighConfidence: boolean;
  autoCreateCalendarEvents: boolean;
  autoSendCustomerEmails: boolean;
  
  // Language Processing
  language: 'english' | 'auto-detect';
  transcriptionQuality: 'standard' | 'enhanced';
  
  // Data Retention
  keepRecordings: boolean;
  recordingRetentionDays: number;
  keepTranscripts: boolean;
  transcriptRetentionDays: number;
}

export interface UISettings {
  // Theme
  theme: 'light' | 'dark' | 'system';
  
  // Layout Preferences  
  sidebarCollapsed: boolean;
  compactMode: boolean;
  
  // Dashboard Preferences
  defaultView: 'calls' | 'events' | 'calendar';
  itemsPerPage: number;
  showAvatars: boolean;
  
  // Table/List Preferences
  visibleColumns: string[];
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  
  // Accessibility
  reducedMotion: boolean;
  highContrast: boolean;
  fontSize: 'small' | 'medium' | 'large';
  
  // Quick Actions
  favoriteActions: string[];
  showQuickActions: boolean;
}

// Settings update interfaces
export interface SettingsUpdateRequest {
  section: keyof UserSettings;
  updates: Partial<UserSettings[keyof UserSettings]>;
}

export interface SettingsSaveResponse {
  success: boolean;
  updated: UserSettings;
  errors?: string[];
}

// Settings validation schemas (for use with Zod)
export interface SettingsValidation {
  profile: Record<string, any>;
  email: Record<string, any>;
  calendar: Record<string, any>;
  notifications: Record<string, any>;
  ai: Record<string, any>;
  ui: Record<string, any>;
}

// Default settings
export const DEFAULT_USER_SETTINGS: UserSettings = {
  profile: {
    timezone: 'Australia/Sydney',
    language: 'english',
    businessHours: {
      enabled: true,
      monday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      tuesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      wednesday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      thursday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      friday: { enabled: true, startTime: '09:00', endTime: '17:00' },
      saturday: { enabled: false, startTime: '09:00', endTime: '17:00' },
      sunday: { enabled: false, startTime: '09:00', endTime: '17:00' },
    },
  },
  
  email: {
    frequency: 'immediate',
    format: 'html',
    includeTranscript: true,
    includeCallSummary: true,
    includeEventDetails: true,
    includeCustomerInfo: true,
    includeRecordingLink: false,
    businessHoursOnly: false,
    templateStyle: 'professional',
    brandingEnabled: true,
    autoAttachICS: true,
    includeManageEventLinks: true,
    digestTime: '09:00',
    weeklyDigestDay: 'monday',
  },
  
  calendar: {
    autoSync: true,
    syncOnlyConfirmed: false,
    defaultDuration: 60,
    bufferTime: 15,
    conflictResolution: 'manual',
    allowOverlappingEvents: false,
    includeCustomerInfo: true,
    includeCallTranscript: false,
    includeLocation: true,
    setReminders: true,
    reminderMinutes: [15, 60],
    privateEvents: false,
    useBusinessTimezone: true,
    convertToLocalTime: true,
  },
  
  notifications: {
    email: {
      newCall: true,
      eventExtracted: true,
      eventConfirmed: true,
      eventReminder: true,
      systemUpdates: true,
      weeklyDigest: true,
      urgentOnly: false,
    },
    sms: {
      enabled: false,
      emergencyOnly: true,
      eventReminders: false,
      systemAlerts: true,
    },
    push: {
      enabled: true,
      newCall: true,
      eventExtracted: true,
      eventConfirmed: false,
      showPreview: true,
    },
    inApp: {
      enabled: true,
      position: 'top-right',
      duration: 5000,
      showSuccess: true,
      showErrors: true,
      showInfo: true,
    },
    quietHours: {
      enabled: false,
      startTime: '22:00',
      endTime: '08:00',
      allowEmergency: true,
    },
  },
  
  ai: {
    processingMode: 'balanced',
    autoConfirmThreshold: 0.85,
    humanReviewThreshold: 0.6,
    extractMultipleEvents: true,
    requireExplicitTime: false,
    requireLocation: false,
    industryOptimizations: true,
    customKeywords: [],
    autoConfirmHighConfidence: false,
    autoCreateCalendarEvents: true,
    autoSendCustomerEmails: false,
    language: 'english',
    transcriptionQuality: 'standard',
    keepRecordings: true,
    recordingRetentionDays: 90,
    keepTranscripts: true,
    transcriptRetentionDays: 365,
  },
  
  ui: {
    theme: 'system',
    sidebarCollapsed: false,
    compactMode: false,
    defaultView: 'calls',
    itemsPerPage: 20,
    showAvatars: true,
    visibleColumns: ['caller', 'status', 'events', 'date'],
    sortBy: 'created_at',
    sortOrder: 'desc',
    reducedMotion: false,
    highContrast: false,
    fontSize: 'medium',
    favoriteActions: ['confirm_event', 'reschedule', 'add_note'],
    showQuickActions: true,
  },
  
  version: 1,
};

// Settings section metadata for UI generation
export interface SettingsSectionMeta {
  id: keyof UserSettings;
  title: string;
  description: string;
  icon: React.ComponentType;
  order: number;
}

// Form field types for dynamic form generation
export interface SettingsField {
  key: string;
  label: string;
  description?: string;
  type: 'text' | 'email' | 'number' | 'boolean' | 'select' | 'multiselect' | 'time' | 'slider' | 'textarea';
  options?: { value: string; label: string }[];
  min?: number;
  max?: number;
  step?: number;
  required?: boolean;
  validation?: (value: any) => string | null;
}