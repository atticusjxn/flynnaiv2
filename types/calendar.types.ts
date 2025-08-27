// Calendar integration types for Flynn.ai v2

export interface CalendarEvent {
  id?: string;
  title: string;
  description?: string;
  location?: string;
  start: {
    dateTime: string; // ISO 8601 format
    timeZone?: string;
  };
  end: {
    dateTime: string; // ISO 8601 format
    timeZone?: string;
  };
  attendees?: {
    email: string;
    displayName?: string;
    responseStatus?: 'needsAction' | 'declined' | 'tentative' | 'accepted';
  }[];
  organizer?: {
    email: string;
    displayName?: string;
  };
  status?: 'confirmed' | 'tentative' | 'cancelled';
  transparency?: 'opaque' | 'transparent';
  visibility?: 'default' | 'public' | 'private' | 'confidential';
  recurrence?: string[];
  reminders?: {
    useDefault: boolean;
    overrides?: {
      method: 'email' | 'popup';
      minutes: number;
    }[];
  };
  source?: {
    title: string;
    url?: string;
  };
}

export interface CalendarInfo {
  id: string;
  summary: string; // Calendar name
  description?: string;
  timeZone?: string;
  colorId?: string;
  backgroundColor?: string;
  foregroundColor?: string;
  accessRole?: 'owner' | 'reader' | 'writer';
  primary?: boolean;
  selected?: boolean;
}

export interface CalendarConflict {
  conflictingEvent: CalendarEvent;
  conflictType: 'overlap' | 'adjacent' | 'travel_time';
  severity: 'high' | 'medium' | 'low';
  suggestion?: string;
}

export interface CalendarEventResult {
  success: boolean;
  eventId?: string;
  event?: CalendarEvent;
  error?: string;
  conflicts?: CalendarConflict[];
}

export interface CalendarSyncResult {
  success: boolean;
  eventsProcessed: number;
  eventsCreated: number;
  eventsFailed: number;
  errors?: string[];
}

// Universal Calendar Provider Interface
export interface CalendarProvider {
  // Provider identification
  readonly providerId: 'google' | 'outlook' | 'apple' | 'ical';
  readonly displayName: string;
  readonly requiresAuth: boolean;

  // Authentication
  isAuthenticated(): Promise<boolean>;
  authenticate(userId: string): Promise<{ authUrl?: string; success: boolean; error?: string }>;
  refreshAuth?(refreshToken: string): Promise<{ success: boolean; error?: string }>;

  // Calendar management
  listCalendars(): Promise<CalendarInfo[]>;
  getCalendar(calendarId: string): Promise<CalendarInfo | null>;

  // Event management
  createEvent(calendarId: string, event: CalendarEvent): Promise<CalendarEventResult>;
  updateEvent(calendarId: string, eventId: string, event: Partial<CalendarEvent>): Promise<CalendarEventResult>;
  deleteEvent(calendarId: string, eventId: string): Promise<{ success: boolean; error?: string }>;
  getEvent(calendarId: string, eventId: string): Promise<CalendarEvent | null>;

  // Event querying
  listEvents(
    calendarId: string,
    options?: {
      timeMin?: string;
      timeMax?: string;
      maxResults?: number;
      singleEvents?: boolean;
      orderBy?: string;
    }
  ): Promise<CalendarEvent[]>;

  // Conflict detection
  checkConflicts(calendarId: string, event: CalendarEvent): Promise<CalendarConflict[]>;

  // Batch operations
  batchCreateEvents?(calendarId: string, events: CalendarEvent[]): Promise<CalendarSyncResult>;
}

// Database integration types
export interface CalendarIntegration {
  id?: string;
  user_id: string;
  provider: 'google' | 'outlook' | 'apple' | 'ical';
  access_token: string;
  refresh_token?: string;
  token_type: string;
  scope: string;
  expires_at?: string;
  is_active: boolean;
  calendar_count?: number;
  default_calendar_id?: string;
  connected_at: string;
  last_sync_at?: string;
  updated_at: string;
}

export interface CalendarEventMapping {
  id?: string;
  user_id: string;
  flynn_event_id: string; // FK to events table
  calendar_integration_id: string; // FK to calendar_integrations
  external_event_id: string; // ID in the external calendar
  calendar_id: string; // Which calendar in the external system
  sync_status: 'pending' | 'synced' | 'failed' | 'cancelled';
  sync_error?: string;
  created_at: string;
  updated_at: string;
  synced_at?: string;
}

// Flynn.ai specific event transformation
export interface FlynnEvent {
  id: string;
  call_id: string;
  title: string;
  description: string;
  type: 'appointment' | 'service_call' | 'meeting' | 'consultation' | 'quote' | 'follow_up';
  proposed_datetime?: string;
  duration_minutes?: number;
  urgency: 'low' | 'medium' | 'high' | 'emergency';
  customer_name?: string;
  customer_phone?: string;
  customer_email?: string;
  service_address?: string;
  service_type?: string;
  confidence_score: number;
  status: 'extracted' | 'confirmed' | 'scheduled' | 'completed' | 'cancelled';
  created_at: string;
  updated_at: string;
}

// Conversion utilities
export interface EventConversionOptions {
  defaultDuration?: number; // minutes
  defaultTimeZone?: string;
  includeCustomerInfo?: boolean;
  addFlynnBranding?: boolean;
  reminderMinutes?: number[];
}

// Calendar sync preferences
export interface CalendarSyncPreferences {
  auto_sync_enabled: boolean;
  default_calendar_id?: string;
  default_duration_minutes: number;
  include_customer_details: boolean;
  add_flynn_branding: boolean;
  reminder_settings: {
    email_minutes?: number;
    popup_minutes?: number;
  };
  conflict_resolution: 'ask' | 'skip' | 'auto_reschedule';
  sync_urgency_levels: ('low' | 'medium' | 'high' | 'emergency')[];
}