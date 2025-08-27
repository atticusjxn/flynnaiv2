// Google Calendar Provider for Flynn.ai v2
import { google } from 'googleapis';
import { CalendarProvider, CalendarEvent, CalendarInfo, CalendarEventResult, CalendarConflict } from '@/types/calendar.types';
import { googleCalendarAuth, GoogleCalendarTokens } from '../googleCalendarAuth';
import { createAdminClient } from '@/utils/supabase/server';

export class GoogleCalendarProvider implements CalendarProvider {
  readonly providerId = 'google' as const;
  readonly displayName = 'Google Calendar';
  readonly requiresAuth = true;

  private userId: string;
  private tokens: GoogleCalendarTokens | null = null;

  constructor(userId: string) {
    this.userId = userId;
  }

  /**
   * Load tokens from database
   */
  private async loadTokens(): Promise<GoogleCalendarTokens | null> {
    try {
      const supabase = createAdminClient();
      const { data, error } = await supabase
        .from('calendar_integrations')
        .select('*')
        .eq('user_id', this.userId)
        .eq('provider', 'google')
        .eq('is_active', true)
        .single();

      if (error || !data) {
        console.log('No Google Calendar integration found for user:', this.userId);
        return null;
      }

      return {
        access_token: data.access_token,
        refresh_token: data.refresh_token || undefined,
        scope: data.scope,
        token_type: data.token_type,
        expiry_date: data.expires_at ? new Date(data.expires_at).getTime() : undefined,
      };

    } catch (error) {
      console.error('Error loading Google Calendar tokens:', error);
      return null;
    }
  }

  /**
   * Get authenticated Google Calendar client
   */
  private async getCalendarClient() {
    if (!this.tokens) {
      this.tokens = await this.loadTokens();
    }

    if (!this.tokens) {
      throw new Error('Google Calendar not connected for this user');
    }

    // Check if token needs refresh
    if (this.tokens.expiry_date && Date.now() > this.tokens.expiry_date - 300000) { // 5 minutes buffer
      console.log('Refreshing Google Calendar access token');
      
      if (!this.tokens.refresh_token) {
        throw new Error('No refresh token available, re-authentication required');
      }

      const refreshResult = await googleCalendarAuth.refreshAccessToken(this.tokens.refresh_token);
      if (!refreshResult.success || !refreshResult.tokens) {
        throw new Error(`Token refresh failed: ${refreshResult.error}`);
      }

      this.tokens = refreshResult.tokens;

      // Update tokens in database
      const supabase = createAdminClient();
      await supabase
        .from('calendar_integrations')
        .update({
          access_token: this.tokens.access_token,
          refresh_token: this.tokens.refresh_token,
          expires_at: this.tokens.expiry_date ? new Date(this.tokens.expiry_date).toISOString() : null,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', this.userId)
        .eq('provider', 'google');
    }

    const auth = googleCalendarAuth.getAuthenticatedClient(this.tokens);
    return google.calendar({ version: 'v3', auth });
  }

  /**
   * Check if user is authenticated
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const tokens = await this.loadTokens();
      if (!tokens) return false;

      // Validate tokens by making a test API call
      return await googleCalendarAuth.validateTokens(tokens);
    } catch (error) {
      console.error('Error checking Google Calendar authentication:', error);
      return false;
    }
  }

  /**
   * Initiate authentication
   */
  async authenticate(userId: string): Promise<{ authUrl?: string; success: boolean; error?: string }> {
    try {
      const authUrl = googleCalendarAuth.generateAuthUrl(userId);
      return {
        authUrl,
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Authentication failed',
      };
    }
  }

  /**
   * List user's calendars
   */
  async listCalendars(): Promise<CalendarInfo[]> {
    try {
      const calendar = await this.getCalendarClient();
      const response = await calendar.calendarList.list();
      
      const calendars = response.data.items || [];
      return calendars.map(cal => ({
        id: cal.id || '',
        summary: cal.summary || 'Unnamed Calendar',
        description: cal.description || undefined,
        timeZone: cal.timeZone || undefined,
        colorId: cal.colorId || undefined,
        backgroundColor: cal.backgroundColor || undefined,
        foregroundColor: cal.foregroundColor || undefined,
        accessRole: cal.accessRole as any,
        primary: cal.primary || false,
        selected: cal.selected || false,
      }));

    } catch (error) {
      console.error('Error listing Google Calendars:', error);
      throw new Error(`Failed to list calendars: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get specific calendar
   */
  async getCalendar(calendarId: string): Promise<CalendarInfo | null> {
    try {
      const calendar = await this.getCalendarClient();
      const response = await calendar.calendarList.get({ calendarId });
      
      const cal = response.data;
      return {
        id: cal.id || '',
        summary: cal.summary || 'Unnamed Calendar',
        description: cal.description || undefined,
        timeZone: cal.timeZone || undefined,
        colorId: cal.colorId || undefined,
        backgroundColor: cal.backgroundColor || undefined,
        foregroundColor: cal.foregroundColor || undefined,
        accessRole: cal.accessRole as any,
        primary: cal.primary || false,
        selected: cal.selected || false,
      };

    } catch (error) {
      console.error('Error getting Google Calendar:', error);
      return null;
    }
  }

  /**
   * Create calendar event
   */
  async createEvent(calendarId: string, event: CalendarEvent): Promise<CalendarEventResult> {
    try {
      const calendar = await this.getCalendarClient();
      
      // Convert Flynn event format to Google Calendar format
      const googleEvent = {
        summary: event.title,
        description: event.description,
        location: event.location,
        start: {
          dateTime: event.start.dateTime,
          timeZone: event.start.timeZone || 'America/Los_Angeles',
        },
        end: {
          dateTime: event.end.dateTime,
          timeZone: event.end.timeZone || 'America/Los_Angeles',
        },
        attendees: event.attendees?.map(attendee => ({
          email: attendee.email,
          displayName: attendee.displayName,
          responseStatus: attendee.responseStatus,
        })),
        organizer: event.organizer,
        status: event.status,
        transparency: event.transparency,
        visibility: event.visibility,
        recurrence: event.recurrence,
        reminders: event.reminders,
        source: event.source,
      };

      console.log('Creating Google Calendar event:', { calendarId, title: event.title });
      
      const response = await calendar.events.insert({
        calendarId,
        requestBody: googleEvent,
        sendUpdates: 'all', // Send invitations to attendees
      });

      const createdEvent = response.data;
      
      return {
        success: true,
        eventId: createdEvent.id || undefined,
        event: {
          ...event,
          id: createdEvent.id || undefined,
        },
      };

    } catch (error) {
      console.error('Error creating Google Calendar event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to create event',
      };
    }
  }

  /**
   * Update calendar event
   */
  async updateEvent(calendarId: string, eventId: string, event: Partial<CalendarEvent>): Promise<CalendarEventResult> {
    try {
      const calendar = await this.getCalendarClient();
      
      // Get existing event first
      const existingResponse = await calendar.events.get({ calendarId, eventId });
      const existingEvent = existingResponse.data;

      // Merge updates with existing event
      const updatedEvent = {
        ...existingEvent,
        summary: event.title || existingEvent.summary,
        description: event.description || existingEvent.description,
        location: event.location || existingEvent.location,
        start: event.start ? {
          dateTime: event.start.dateTime,
          timeZone: event.start.timeZone,
        } : existingEvent.start,
        end: event.end ? {
          dateTime: event.end.dateTime,
          timeZone: event.end.timeZone,
        } : existingEvent.end,
        attendees: event.attendees || existingEvent.attendees,
        status: event.status || existingEvent.status,
        transparency: event.transparency || existingEvent.transparency,
      };

      const response = await calendar.events.update({
        calendarId,
        eventId,
        requestBody: updatedEvent,
        sendUpdates: 'all',
      });

      return {
        success: true,
        eventId: response.data.id || undefined,
        event: event as CalendarEvent,
      };

    } catch (error) {
      console.error('Error updating Google Calendar event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update event',
      };
    }
  }

  /**
   * Delete calendar event
   */
  async deleteEvent(calendarId: string, eventId: string): Promise<{ success: boolean; error?: string }> {
    try {
      const calendar = await this.getCalendarClient();
      
      await calendar.events.delete({
        calendarId,
        eventId,
        sendUpdates: 'all',
      });

      console.log('Successfully deleted Google Calendar event:', eventId);
      return { success: true };

    } catch (error) {
      console.error('Error deleting Google Calendar event:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete event',
      };
    }
  }

  /**
   * Get specific calendar event
   */
  async getEvent(calendarId: string, eventId: string): Promise<CalendarEvent | null> {
    try {
      const calendar = await this.getCalendarClient();
      const response = await calendar.events.get({ calendarId, eventId });
      
      const event = response.data;
      return {
        id: event.id || undefined,
        title: event.summary || 'Untitled Event',
        description: event.description || undefined,
        location: event.location || undefined,
        start: {
          dateTime: event.start?.dateTime || event.start?.date || '',
          timeZone: event.start?.timeZone,
        },
        end: {
          dateTime: event.end?.dateTime || event.end?.date || '',
          timeZone: event.end?.timeZone,
        },
        attendees: event.attendees?.map(attendee => ({
          email: attendee.email || '',
          displayName: attendee.displayName,
          responseStatus: attendee.responseStatus as any,
        })),
        status: event.status as any,
        transparency: event.transparency as any,
      };

    } catch (error) {
      console.error('Error getting Google Calendar event:', error);
      return null;
    }
  }

  /**
   * List calendar events
   */
  async listEvents(
    calendarId: string,
    options: {
      timeMin?: string;
      timeMax?: string;
      maxResults?: number;
      singleEvents?: boolean;
      orderBy?: string;
    } = {}
  ): Promise<CalendarEvent[]> {
    try {
      const calendar = await this.getCalendarClient();
      
      const response = await calendar.events.list({
        calendarId,
        timeMin: options.timeMin,
        timeMax: options.timeMax,
        maxResults: options.maxResults || 50,
        singleEvents: options.singleEvents ?? true,
        orderBy: options.orderBy || 'startTime',
      });

      const events = response.data.items || [];
      return events.map(event => ({
        id: event.id || undefined,
        title: event.summary || 'Untitled Event',
        description: event.description || undefined,
        location: event.location || undefined,
        start: {
          dateTime: event.start?.dateTime || event.start?.date || '',
          timeZone: event.start?.timeZone,
        },
        end: {
          dateTime: event.end?.dateTime || event.end?.date || '',
          timeZone: event.end?.timeZone,
        },
        attendees: event.attendees?.map(attendee => ({
          email: attendee.email || '',
          displayName: attendee.displayName,
          responseStatus: attendee.responseStatus as any,
        })),
        status: event.status as any,
        transparency: event.transparency as any,
      }));

    } catch (error) {
      console.error('Error listing Google Calendar events:', error);
      throw new Error(`Failed to list events: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Check for calendar conflicts
   */
  async checkConflicts(calendarId: string, event: CalendarEvent): Promise<CalendarConflict[]> {
    try {
      const conflicts: CalendarConflict[] = [];

      // Get events in the time window around the proposed event
      const buffer = 2 * 60 * 60 * 1000; // 2 hours buffer
      const eventStart = new Date(event.start.dateTime);
      const eventEnd = new Date(event.end.dateTime);
      
      const timeMin = new Date(eventStart.getTime() - buffer).toISOString();
      const timeMax = new Date(eventEnd.getTime() + buffer).toISOString();

      const existingEvents = await this.listEvents(calendarId, {
        timeMin,
        timeMax,
        singleEvents: true,
      });

      // Check for direct overlaps and adjacent conflicts
      for (const existing of existingEvents) {
        const existingStart = new Date(existing.start.dateTime);
        const existingEnd = new Date(existing.end.dateTime);

        // Direct overlap
        if (
          (eventStart < existingEnd && eventEnd > existingStart) ||
          (existingStart < eventEnd && existingEnd > eventStart)
        ) {
          conflicts.push({
            conflictingEvent: existing,
            conflictType: 'overlap',
            severity: 'high',
            suggestion: 'Consider rescheduling to avoid conflict',
          });
        }
        // Adjacent events (less than 15 minutes apart)
        else if (
          Math.abs(eventStart.getTime() - existingEnd.getTime()) < 15 * 60 * 1000 ||
          Math.abs(existingStart.getTime() - eventEnd.getTime()) < 15 * 60 * 1000
        ) {
          conflicts.push({
            conflictingEvent: existing,
            conflictType: 'adjacent',
            severity: 'medium',
            suggestion: 'Consider adding buffer time between meetings',
          });
        }
        // Travel time consideration for events with locations
        else if (
          event.location && existing.location && 
          event.location !== existing.location &&
          Math.abs(eventStart.getTime() - existingEnd.getTime()) < 30 * 60 * 1000
        ) {
          conflicts.push({
            conflictingEvent: existing,
            conflictType: 'travel_time',
            severity: 'medium',
            suggestion: 'Allow more time for travel between locations',
          });
        }
      }

      return conflicts;

    } catch (error) {
      console.error('Error checking Google Calendar conflicts:', error);
      return []; // Return empty array rather than throwing
    }
  }
}

// Factory function for creating Google Calendar provider instances
export function createGoogleCalendarProvider(userId: string): GoogleCalendarProvider {
  return new GoogleCalendarProvider(userId);
}