# Flynn.ai v2 Calendar Integration System

## Overview

Universal calendar integration supporting Google Calendar, Outlook, Apple Calendar, and standard ICS file generation. The system provides seamless event synchronization with conflict detection and real-time updates.

## Supported Calendar Providers

### 1. Google Calendar

- **OAuth 2.0** authentication
- **Real-time sync** via Calendar API v3
- **Multiple calendar** support
- **Event conflict detection**
- **Automatic reminders**

### 2. Microsoft Outlook/Office 365

- **OAuth 2.0** with Microsoft Graph API
- **Exchange Online** compatibility
- **Shared calendar** support
- **Teams meeting integration**

### 3. Apple Calendar/iCloud

- **CalDAV** protocol support
- **iCloud calendar** sync
- **Cross-device** synchronization

### 4. Standard ICS Files

- **RFC 5545** compliant
- **Email attachments**
- **Universal compatibility**
- **Import into any calendar app**

## Architecture

### Calendar Service Layer

```typescript
// lib/calendar/CalendarService.ts
export interface CalendarProvider {
  authenticate(userId: string, authCode: string): Promise<CalendarIntegration>;
  syncEvent(
    integration: CalendarIntegration,
    event: EventData
  ): Promise<string>;
  updateEvent(
    integration: CalendarIntegration,
    eventId: string,
    event: EventData
  ): Promise<boolean>;
  deleteEvent(
    integration: CalendarIntegration,
    eventId: string
  ): Promise<boolean>;
  checkConflicts(
    integration: CalendarIntegration,
    event: EventData
  ): Promise<ConflictInfo[]>;
  refreshToken(integration: CalendarIntegration): Promise<CalendarIntegration>;
}

export class CalendarService {
  private providers: Map<string, CalendarProvider>;

  constructor() {
    this.providers = new Map([
      ['google', new GoogleCalendarProvider()],
      ['outlook', new OutlookCalendarProvider()],
      ['apple', new AppleCalendarProvider()],
    ]);
  }

  async syncEventToCalendar(
    userId: string,
    eventId: string,
    providerType: string
  ): Promise<CalendarSyncResult> {
    try {
      // Get user's calendar integration
      const integration = await this.getCalendarIntegration(
        userId,
        providerType
      );
      if (!integration || !integration.is_active) {
        throw new Error('Calendar integration not found or inactive');
      }

      // Get event data
      const event = await this.getEventData(eventId);
      if (!event) {
        throw new Error('Event not found');
      }

      // Check for conflicts
      const conflicts = await this.checkEventConflicts(integration, event);
      if (conflicts.length > 0 && !event.ignore_conflicts) {
        return {
          success: false,
          conflicts: conflicts,
          requiresConfirmation: true,
        };
      }

      // Refresh token if needed
      const validIntegration = await this.ensureValidToken(integration);

      // Sync to calendar
      const provider = this.providers.get(providerType);
      if (!provider) {
        throw new Error(`Unsupported calendar provider: ${providerType}`);
      }

      const calendarEventId = await provider.syncEvent(validIntegration, event);

      // Update event record
      await this.updateEventCalendarStatus(eventId, {
        calendar_synced: true,
        calendar_event_id: calendarEventId,
        sync_provider: providerType,
        synced_at: new Date(),
      });

      return {
        success: true,
        calendarEventId: calendarEventId,
        calendarUrl: this.generateCalendarUrl(providerType, calendarEventId),
      };
    } catch (error) {
      console.error('Calendar sync failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
```

### Google Calendar Provider

```typescript
// lib/calendar/providers/GoogleCalendarProvider.ts
import { google } from 'googleapis';
import { OAuth2Client } from 'google-auth-library';

export class GoogleCalendarProvider implements CalendarProvider {
  private oauth2Client: OAuth2Client;

  constructor() {
    this.oauth2Client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET,
      process.env.GOOGLE_REDIRECT_URI
    );
  }

  async authenticate(
    userId: string,
    authCode: string
  ): Promise<CalendarIntegration> {
    try {
      // Exchange auth code for tokens
      const { tokens } = await this.oauth2Client.getToken(authCode);
      this.oauth2Client.setCredentials(tokens);

      // Get user's calendar info
      const calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client,
      });
      const calendars = await calendar.calendarList.list();

      const primaryCalendar = calendars.data.items?.find((cal) => cal.primary);
      if (!primaryCalendar) {
        throw new Error('No primary calendar found');
      }

      // Store integration
      const integration: CalendarIntegration = {
        user_id: userId,
        integration_type: 'google',
        is_active: true,
        access_token: this.encryptToken(tokens.access_token!),
        refresh_token: this.encryptToken(tokens.refresh_token!),
        token_expires_at: new Date(tokens.expiry_date!),
        calendar_id: primaryCalendar.id!,
        calendar_name: primaryCalendar.summary!,
        sync_enabled: true,
      };

      return await this.storeCalendarIntegration(integration);
    } catch (error) {
      console.error('Google Calendar authentication failed:', error);
      throw error;
    }
  }

  async syncEvent(
    integration: CalendarIntegration,
    event: EventData
  ): Promise<string> {
    try {
      // Set up auth with stored tokens
      this.oauth2Client.setCredentials({
        access_token: this.decryptToken(integration.access_token),
        refresh_token: this.decryptToken(integration.refresh_token),
      });

      const calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client,
      });

      // Prepare event data for Google Calendar
      const googleEvent = {
        summary: event.title,
        description: this.formatEventDescription(event),
        start: {
          dateTime: event.confirmed_datetime || event.proposed_datetime,
          timeZone: event.timezone || 'UTC',
        },
        end: {
          dateTime: this.calculateEndDateTime(event),
          timeZone: event.timezone || 'UTC',
        },
        location:
          event.location_type === 'address' ? event.location : undefined,
        attendees: this.formatAttendees(event),
        reminders: {
          useDefault: false,
          overrides: [
            { method: 'email', minutes: 24 * 60 }, // 1 day before
            { method: 'popup', minutes: 30 }, // 30 minutes before
          ],
        },
        extendedProperties: {
          private: {
            flynn_event_id: event.id,
            flynn_event_type: event.event_type,
            flynn_customer_phone: event.customer_phone || '',
            flynn_price_estimate: event.price_estimate?.toString() || '0',
          },
        },
      };

      // Create event in Google Calendar
      const response = await calendar.events.insert({
        calendarId: integration.calendar_id,
        requestBody: googleEvent,
        sendNotifications: true,
      });

      if (!response.data.id) {
        throw new Error('Failed to create calendar event');
      }

      return response.data.id;
    } catch (error) {
      console.error('Google Calendar sync failed:', error);
      throw error;
    }
  }

  async updateEvent(
    integration: CalendarIntegration,
    calendarEventId: string,
    event: EventData
  ): Promise<boolean> {
    try {
      this.oauth2Client.setCredentials({
        access_token: this.decryptToken(integration.access_token),
        refresh_token: this.decryptToken(integration.refresh_token),
      });

      const calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client,
      });

      // Get existing event
      const existingEvent = await calendar.events.get({
        calendarId: integration.calendar_id,
        eventId: calendarEventId,
      });

      if (!existingEvent.data) {
        throw new Error('Calendar event not found');
      }

      // Update event data
      const updatedEvent = {
        ...existingEvent.data,
        summary: event.title,
        description: this.formatEventDescription(event),
        start: {
          dateTime: event.confirmed_datetime || event.proposed_datetime,
          timeZone: event.timezone || 'UTC',
        },
        end: {
          dateTime: this.calculateEndDateTime(event),
          timeZone: event.timezone || 'UTC',
        },
        location:
          event.location_type === 'address' ? event.location : undefined,
      };

      await calendar.events.update({
        calendarId: integration.calendar_id,
        eventId: calendarEventId,
        requestBody: updatedEvent,
        sendNotifications: true,
      });

      return true;
    } catch (error) {
      console.error('Google Calendar update failed:', error);
      return false;
    }
  }

  async checkConflicts(
    integration: CalendarIntegration,
    event: EventData
  ): Promise<ConflictInfo[]> {
    try {
      this.oauth2Client.setCredentials({
        access_token: this.decryptToken(integration.access_token),
        refresh_token: this.decryptToken(integration.refresh_token),
      });

      const calendar = google.calendar({
        version: 'v3',
        auth: this.oauth2Client,
      });

      const startTime = new Date(
        event.confirmed_datetime || event.proposed_datetime!
      );
      const endTime = this.calculateEndDateTime(event);

      // Query for events in the time range
      const response = await calendar.events.list({
        calendarId: integration.calendar_id,
        timeMin: startTime.toISOString(),
        timeMax: endTime.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
      });

      const conflicts: ConflictInfo[] = [];

      if (response.data.items) {
        for (const conflictEvent of response.data.items) {
          if (conflictEvent.status === 'cancelled') continue;

          conflicts.push({
            eventId: conflictEvent.id!,
            title: conflictEvent.summary!,
            startTime: conflictEvent.start?.dateTime!,
            endTime: conflictEvent.end?.dateTime!,
            conflictType: this.determineConflictType(
              startTime,
              endTime,
              conflictEvent
            ),
          });
        }
      }

      return conflicts;
    } catch (error) {
      console.error('Google Calendar conflict check failed:', error);
      return [];
    }
  }

  private formatEventDescription(event: EventData): string {
    const parts = [event.description];

    if (event.customer_name) {
      parts.push(`\nCustomer: ${event.customer_name}`);
    }

    if (event.customer_phone) {
      parts.push(`Phone: ${event.customer_phone}`);
    }

    if (event.price_estimate) {
      parts.push(`Estimated Cost: $${event.price_estimate}`);
    }

    if (event.notes) {
      parts.push(`\nNotes: ${event.notes}`);
    }

    parts.push(`\nManaged by Flynn.ai`);
    parts.push(
      `Edit: ${process.env.NEXT_PUBLIC_APP_URL}/dashboard/events/${event.id}`
    );

    return parts.filter(Boolean).join('');
  }

  private formatAttendees(
    event: EventData
  ): Array<{ email: string; displayName?: string }> {
    const attendees = [];

    if (event.customer_email) {
      attendees.push({
        email: event.customer_email,
        displayName: event.customer_name || undefined,
      });
    }

    return attendees;
  }

  private calculateEndDateTime(event: EventData): string {
    const startTime = new Date(
      event.confirmed_datetime || event.proposed_datetime!
    );
    const durationMs = (event.duration_minutes || 60) * 60 * 1000;
    const endTime = new Date(startTime.getTime() + durationMs);
    return endTime.toISOString();
  }
}
```

### Microsoft Outlook Provider

```typescript
// lib/calendar/providers/OutlookCalendarProvider.ts
import { Client } from '@microsoft/microsoft-graph-client';
import { AuthenticationProvider } from '@microsoft/microsoft-graph-client';

export class OutlookCalendarProvider implements CalendarProvider {
  private graphClient: Client;

  async authenticate(
    userId: string,
    authCode: string
  ): Promise<CalendarIntegration> {
    try {
      // Exchange auth code for tokens using Microsoft Graph
      const tokenResponse = await this.exchangeCodeForTokens(authCode);

      // Initialize Graph client
      const authProvider = new CustomAuthProvider(tokenResponse.access_token);
      this.graphClient = Client.initWithMiddleware({ authProvider });

      // Get user's calendars
      const calendars = await this.graphClient.api('/me/calendars').get();
      const primaryCalendar =
        calendars.value.find((cal: any) => cal.isDefaultCalendar) ||
        calendars.value[0];

      if (!primaryCalendar) {
        throw new Error('No calendar found');
      }

      const integration: CalendarIntegration = {
        user_id: userId,
        integration_type: 'outlook',
        is_active: true,
        access_token: this.encryptToken(tokenResponse.access_token),
        refresh_token: this.encryptToken(tokenResponse.refresh_token),
        token_expires_at: new Date(
          Date.now() + tokenResponse.expires_in * 1000
        ),
        calendar_id: primaryCalendar.id,
        calendar_name: primaryCalendar.name,
        sync_enabled: true,
      };

      return await this.storeCalendarIntegration(integration);
    } catch (error) {
      console.error('Outlook Calendar authentication failed:', error);
      throw error;
    }
  }

  async syncEvent(
    integration: CalendarIntegration,
    event: EventData
  ): Promise<string> {
    try {
      // Set up Graph client with stored tokens
      const authProvider = new CustomAuthProvider(
        this.decryptToken(integration.access_token)
      );
      this.graphClient = Client.initWithMiddleware({ authProvider });

      const outlookEvent = {
        subject: event.title,
        body: {
          contentType: 'HTML',
          content: this.formatEventDescription(event),
        },
        start: {
          dateTime: event.confirmed_datetime || event.proposed_datetime,
          timeZone: event.timezone || 'UTC',
        },
        end: {
          dateTime: this.calculateEndDateTime(event),
          timeZone: event.timezone || 'UTC',
        },
        location:
          event.location_type === 'address'
            ? {
                displayName: event.location,
                address: { street: event.location },
              }
            : undefined,
        attendees: this.formatOutlookAttendees(event),
        reminderMinutesBeforeStart: 30,
        isReminderOn: true,
        extensions: [
          {
            extensionName: 'Flynn.ai',
            id: `flynn_${event.id}`,
            eventId: event.id,
            eventType: event.event_type,
            customerPhone: event.customer_phone || '',
            priceEstimate: event.price_estimate?.toString() || '0',
          },
        ],
      };

      const response = await this.graphClient
        .api(`/me/calendars/${integration.calendar_id}/events`)
        .post(outlookEvent);

      return response.id;
    } catch (error) {
      console.error('Outlook Calendar sync failed:', error);
      throw error;
    }
  }
}
```

## ICS File Generation

### Standard ICS File Creator

```typescript
// lib/calendar/icsGenerator.ts
export interface ICSEventData {
  title: string;
  description: string;
  startDate: Date;
  endDate: Date;
  location?: string;
  uid: string;
  organizer?: {
    name: string;
    email: string;
  };
  attendees?: Array<{
    name?: string;
    email: string;
  }>;
}

export function generateICSFile(eventData: ICSEventData): string {
  const formatDate = (date: Date): string => {
    return date
      .toISOString()
      .replace(/[-:]/g, '')
      .replace(/\.\d{3}/, '');
  };

  const escapeText = (text: string): string => {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/;/g, '\\;')
      .replace(/,/g, '\\,')
      .replace(/\n/g, '\\n');
  };

  let icsContent = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Flynn.ai//Event//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:REQUEST',
    'BEGIN:VEVENT',
    `UID:${eventData.uid}@flynn.ai`,
    `DTSTAMP:${formatDate(new Date())}`,
    `DTSTART:${formatDate(eventData.startDate)}`,
    `DTEND:${formatDate(eventData.endDate)}`,
    `SUMMARY:${escapeText(eventData.title)}`,
    `DESCRIPTION:${escapeText(eventData.description)}`,
  ];

  if (eventData.location) {
    icsContent.push(`LOCATION:${escapeText(eventData.location)}`);
  }

  if (eventData.organizer) {
    icsContent.push(
      `ORGANIZER;CN=${escapeText(eventData.organizer.name)}:MAILTO:${eventData.organizer.email}`
    );
  }

  if (eventData.attendees) {
    eventData.attendees.forEach((attendee) => {
      const attendeeLine = attendee.name
        ? `ATTENDEE;CN=${escapeText(attendee.name)};ROLE=REQ-PARTICIPANT:MAILTO:${attendee.email}`
        : `ATTENDEE;ROLE=REQ-PARTICIPANT:MAILTO:${attendee.email}`;
      icsContent.push(attendeeLine);
    });
  }

  // Add reminders
  icsContent.push(
    'BEGIN:VALARM',
    'TRIGGER:-PT30M',
    'DESCRIPTION:Reminder',
    'ACTION:DISPLAY',
    'END:VALARM'
  );

  icsContent.push(
    'STATUS:CONFIRMED',
    'TRANSP:OPAQUE',
    'END:VEVENT',
    'END:VCALENDAR'
  );

  return icsContent.join('\r\n');
}

export function generateEventICS(event: EventData, userInfo: UserInfo): string {
  const startDate = new Date(
    event.confirmed_datetime || event.proposed_datetime!
  );
  const endDate = new Date(
    startDate.getTime() + (event.duration_minutes || 60) * 60000
  );

  return generateICSFile({
    title: event.title,
    description: formatEventDescription(event),
    startDate,
    endDate,
    location: event.location_type === 'address' ? event.location : undefined,
    uid: event.id,
    organizer: {
      name: userInfo.full_name || userInfo.company_name || 'Flynn.ai User',
      email: userInfo.email,
    },
    attendees: event.customer_email
      ? [
          {
            name: event.customer_name,
            email: event.customer_email,
          },
        ]
      : undefined,
  });
}

function formatEventDescription(event: EventData): string {
  const parts = [event.description || ''];

  if (event.customer_name) {
    parts.push(`Customer: ${event.customer_name}`);
  }

  if (event.customer_phone) {
    parts.push(`Phone: ${event.customer_phone}`);
  }

  if (event.price_estimate) {
    parts.push(`Estimated Cost: $${event.price_estimate}`);
  }

  if (event.notes) {
    parts.push(`Notes: ${event.notes}`);
  }

  parts.push('Powered by Flynn.ai');

  return parts.filter(Boolean).join('\\n\\n');
}
```

## Calendar Conflict Detection

### Smart Conflict Resolution

```typescript
// lib/calendar/conflictDetection.ts
export interface ConflictInfo {
  eventId: string;
  title: string;
  startTime: string;
  endTime: string;
  conflictType: 'overlap' | 'adjacent' | 'travel_time';
  severity: 'low' | 'medium' | 'high';
}

export class ConflictDetector {
  detectConflicts(
    newEvent: EventData,
    existingEvents: CalendarEvent[],
    userPreferences: ConflictPreferences
  ): ConflictInfo[] {
    const conflicts: ConflictInfo[] = [];
    const newStart = new Date(
      newEvent.confirmed_datetime || newEvent.proposed_datetime!
    );
    const newEnd = new Date(
      newStart.getTime() + (newEvent.duration_minutes || 60) * 60000
    );

    for (const existing of existingEvents) {
      const existingStart = new Date(existing.start);
      const existingEnd = new Date(existing.end);

      // Check for direct overlap
      if (this.hasOverlap(newStart, newEnd, existingStart, existingEnd)) {
        conflicts.push({
          eventId: existing.id,
          title: existing.title,
          startTime: existing.start,
          endTime: existing.end,
          conflictType: 'overlap',
          severity: 'high',
        });
      }

      // Check for travel time conflicts
      else if (
        this.hasTravelTimeConflict(newEvent, existing, userPreferences)
      ) {
        conflicts.push({
          eventId: existing.id,
          title: existing.title,
          startTime: existing.start,
          endTime: existing.end,
          conflictType: 'travel_time',
          severity: 'medium',
        });
      }

      // Check for adjacent meetings (potential issue)
      else if (this.isAdjacent(newStart, newEnd, existingStart, existingEnd)) {
        conflicts.push({
          eventId: existing.id,
          title: existing.title,
          startTime: existing.start,
          endTime: existing.end,
          conflictType: 'adjacent',
          severity: 'low',
        });
      }
    }

    return conflicts;
  }

  private hasOverlap(
    start1: Date,
    end1: Date,
    start2: Date,
    end2: Date
  ): boolean {
    return start1 < end2 && start2 < end1;
  }

  private hasTravelTimeConflict(
    newEvent: EventData,
    existingEvent: CalendarEvent,
    preferences: ConflictPreferences
  ): boolean {
    const travelTimeMinutes = this.calculateTravelTime(
      newEvent.location,
      existingEvent.location,
      preferences.defaultTravelTime
    );

    const newStart = new Date(
      newEvent.confirmed_datetime || newEvent.proposed_datetime!
    );
    const existingEnd = new Date(existingEvent.end);

    // Check if there's enough time between events for travel
    const timeBetween =
      (newStart.getTime() - existingEnd.getTime()) / (1000 * 60);
    return timeBetween > 0 && timeBetween < travelTimeMinutes;
  }

  private calculateTravelTime(
    location1: string,
    location2: string,
    defaultMinutes: number
  ): number {
    // In a full implementation, this would use Google Maps API
    // or similar to calculate actual travel time

    // Simple heuristic for now
    if (
      !location1 ||
      !location2 ||
      location1.includes('virtual') ||
      location2.includes('virtual')
    ) {
      return 0; // No travel time for virtual meetings
    }

    // Use default travel time
    return defaultMinutes;
  }
}
```

## Real-time Calendar Sync

### Webhook Handlers for Calendar Updates

```typescript
// app/api/webhooks/calendar/[provider]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { CalendarWebhookHandler } from '@/lib/calendar/webhookHandler';

export async function POST(
  request: NextRequest,
  { params }: { params: { provider: string } }
) {
  try {
    const provider = params.provider;
    const body = await request.json();

    const handler = new CalendarWebhookHandler();

    switch (provider) {
      case 'google':
        await handler.handleGoogleWebhook(body, request.headers);
        break;
      case 'outlook':
        await handler.handleOutlookWebhook(body, request.headers);
        break;
      default:
        return NextResponse.json(
          { error: 'Unsupported provider' },
          { status: 400 }
        );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Calendar webhook error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
```

## Calendar Integration UI Components

### Calendar Connection Interface

```tsx
// components/calendar/CalendarIntegrationCard.tsx
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface CalendarIntegrationCardProps {
  provider: 'google' | 'outlook' | 'apple';
  isConnected: boolean;
  calendarName?: string;
  lastSync?: Date;
  onConnect: () => void;
  onDisconnect: () => void;
}

export function CalendarIntegrationCard({
  provider,
  isConnected,
  calendarName,
  lastSync,
  onConnect,
  onDisconnect,
}: CalendarIntegrationCardProps) {
  const [isLoading, setIsLoading] = useState(false);

  const providerInfo = {
    google: {
      name: 'Google Calendar',
      icon: '🗓️',
      description: 'Sync with your Google Calendar',
    },
    outlook: {
      name: 'Microsoft Outlook',
      icon: '📅',
      description: 'Sync with Outlook/Office 365',
    },
    apple: {
      name: 'Apple Calendar',
      icon: '🍎',
      description: 'Sync with iCloud Calendar',
    },
  };

  const info = providerInfo[provider];

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await onConnect();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="p-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="text-2xl">{info.icon}</div>
          <div>
            <h3 className="text-lg font-semibold">{info.name}</h3>
            <p className="text-sm text-gray-600">{info.description}</p>
            {isConnected && calendarName && (
              <p className="text-xs text-green-600">
                Connected to "{calendarName}"
              </p>
            )}
            {isConnected && lastSync && (
              <p className="text-xs text-gray-500">
                Last sync: {lastSync.toLocaleString()}
              </p>
            )}
          </div>
        </div>

        <div className="flex flex-col space-y-2">
          {isConnected ? (
            <>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-green-600">Connected</span>
              </div>
              <Button variant="outline" size="sm" onClick={onDisconnect}>
                Disconnect
              </Button>
            </>
          ) : (
            <Button onClick={handleConnect} disabled={isLoading}>
              {isLoading ? 'Connecting...' : 'Connect'}
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
```

## Testing & Validation

### Calendar Integration Testing

```typescript
// __tests__/calendar/calendarService.test.ts
import { CalendarService } from '@/lib/calendar/CalendarService';
import { GoogleCalendarProvider } from '@/lib/calendar/providers/GoogleCalendarProvider';

describe('CalendarService', () => {
  let calendarService: CalendarService;

  beforeEach(() => {
    calendarService = new CalendarService();
  });

  describe('syncEventToCalendar', () => {
    it('should sync event to Google Calendar successfully', async () => {
      // Mock setup
      const mockEvent = {
        id: 'event-123',
        title: 'Test Event',
        confirmed_datetime: '2025-01-16T14:00:00Z',
        duration_minutes: 60,
        location: '123 Main St',
        customer_name: 'John Doe',
        customer_email: 'john@example.com',
      };

      // Test sync
      const result = await calendarService.syncEventToCalendar(
        'user-123',
        'event-123',
        'google'
      );

      expect(result.success).toBe(true);
      expect(result.calendarEventId).toBeTruthy();
    });

    it('should handle calendar conflicts appropriately', async () => {
      // Test conflict detection
      const result = await calendarService.syncEventToCalendar(
        'user-123',
        'conflicting-event',
        'google'
      );

      expect(result.success).toBe(false);
      expect(result.conflicts).toHaveLength(1);
      expect(result.requiresConfirmation).toBe(true);
    });
  });
});
```

## Security & Privacy

### Calendar Data Protection

1. **Token Encryption**: All access/refresh tokens encrypted at rest
2. **Minimal Permissions**: Request only necessary calendar scopes
3. **Data Retention**: Purge old calendar sync data regularly
4. **User Control**: Users can disconnect integrations anytime
5. **Audit Logging**: Track all calendar operations

### OAuth Security Best Practices

```typescript
// lib/calendar/oauth/security.ts
export class OAuthSecurityManager {
  generateState(): string {
    // Generate cryptographically secure random state
    return crypto.randomBytes(32).toString('hex');
  }

  validateState(receivedState: string, storedState: string): boolean {
    return crypto.timingSafeEqual(
      Buffer.from(receivedState),
      Buffer.from(storedState)
    );
  }

  generatePKCEChallenge(): { codeVerifier: string; codeChallenge: string } {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');

    return { codeVerifier, codeChallenge };
  }
}
```

This comprehensive calendar integration system provides seamless synchronization across all major calendar platforms while maintaining security, performance, and user control.
