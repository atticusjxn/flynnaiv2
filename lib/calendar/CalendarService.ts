// Universal Calendar Service for Flynn.ai v2
import {
  CalendarProvider,
  CalendarEvent,
  CalendarEventResult,
  CalendarConflict,
  FlynnEvent,
  EventConversionOptions,
} from '@/types/calendar.types';

export class CalendarService {
  private providers: Map<string, CalendarProvider> = new Map();

  /**
   * Register a calendar provider
   */
  registerProvider(provider: CalendarProvider): void {
    this.providers.set(provider.providerId, provider);
    console.log(`Registered calendar provider: ${provider.displayName}`);
  }

  /**
   * Get available calendar providers
   */
  getAvailableProviders(): CalendarProvider[] {
    return Array.from(this.providers.values());
  }

  /**
   * Get specific calendar provider
   */
  getProvider(providerId: string): CalendarProvider | undefined {
    return this.providers.get(providerId);
  }

  /**
   * Convert Flynn.ai event to calendar event
   */
  convertFlynnEventToCalendar(
    flynnEvent: FlynnEvent,
    options: EventConversionOptions = {}
  ): CalendarEvent {
    const {
      defaultDuration = 60,
      defaultTimeZone = 'America/Los_Angeles',
      includeCustomerInfo = true,
      addFlynnBranding = true,
      reminderMinutes = [15, 60],
    } = options;

    // Calculate event timing
    const startTime = flynnEvent.proposed_datetime
      ? new Date(flynnEvent.proposed_datetime)
      : new Date(); // Fallback to current time

    const duration = flynnEvent.duration_minutes || defaultDuration;
    const endTime = new Date(startTime.getTime() + duration * 60000);

    // Build description
    let description = flynnEvent.description || '';

    if (includeCustomerInfo && flynnEvent.customer_name) {
      description += `\n\nCustomer: ${flynnEvent.customer_name}`;
      if (flynnEvent.customer_phone) {
        description += `\nPhone: ${flynnEvent.customer_phone}`;
      }
      if (flynnEvent.customer_email) {
        description += `\nEmail: ${flynnEvent.customer_email}`;
      }
    }

    if (flynnEvent.service_type) {
      description += `\nService: ${flynnEvent.service_type}`;
    }

    if (addFlynnBranding) {
      description += `\n\n📞 Processed by Flynn.ai (Confidence: ${Math.round(flynnEvent.confidence_score * 100)}%)`;
    }

    // Build attendees list
    const attendees = [];
    if (flynnEvent.customer_email) {
      attendees.push({
        email: flynnEvent.customer_email,
        displayName: flynnEvent.customer_name || undefined,
        responseStatus: 'needsAction' as const,
      });
    }

    // Set urgency-based color and transparency
    const getEventProperties = (urgency: string) => {
      switch (urgency) {
        case 'emergency':
          return { colorId: '11', transparency: 'opaque' as const }; // Red
        case 'high':
          return { colorId: '6', transparency: 'opaque' as const }; // Orange
        case 'medium':
          return { colorId: '2', transparency: 'opaque' as const }; // Green
        case 'low':
          return { colorId: '7', transparency: 'transparent' as const }; // Blue
        default:
          return { colorId: '1', transparency: 'opaque' as const }; // Default blue
      }
    };

    const eventProps = getEventProperties(flynnEvent.urgency);

    const calendarEvent: CalendarEvent = {
      title: flynnEvent.title,
      description: description.trim(),
      location: flynnEvent.service_address || undefined,
      start: {
        dateTime: startTime.toISOString(),
        timeZone: defaultTimeZone,
      },
      end: {
        dateTime: endTime.toISOString(),
        timeZone: defaultTimeZone,
      },
      attendees: attendees.length > 0 ? attendees : undefined,
      status: flynnEvent.status === 'confirmed' ? 'confirmed' : 'tentative',
      transparency: eventProps.transparency,
      reminders: {
        useDefault: false,
        overrides: reminderMinutes.map((minutes) => ({
          method: 'popup' as const,
          minutes,
        })),
      },
      source: {
        title: 'Flynn.ai Call Processing',
        url: `${process.env.NEXTAUTH_URL}/calls/${flynnEvent.call_id}`,
      },
    };

    return calendarEvent;
  }

  /**
   * Create event in calendar with conflict detection
   */
  async createEventWithConflictDetection(
    providerId: string,
    calendarId: string,
    event: CalendarEvent,
    options: { skipConflictCheck?: boolean } = {}
  ): Promise<CalendarEventResult> {
    const provider = this.getProvider(providerId);
    if (!provider) {
      return {
        success: false,
        error: `Calendar provider '${providerId}' not found`,
      };
    }

    try {
      // Check for conflicts unless explicitly skipped
      let conflicts: CalendarConflict[] = [];
      if (!options.skipConflictCheck) {
        conflicts = await provider.checkConflicts(calendarId, event);
      }

      // Proceed with creation if no high-severity conflicts
      const hasBlockingConflicts = conflicts.some((c) => c.severity === 'high');
      if (hasBlockingConflicts) {
        return {
          success: false,
          error: 'High-severity scheduling conflicts detected',
          conflicts,
        };
      }

      // Create the event
      const result = await provider.createEvent(calendarId, event);

      if (result.success) {
        console.log(`Successfully created calendar event: ${result.eventId}`);
      }

      // Include conflicts in result for user awareness
      return {
        ...result,
        conflicts: conflicts.length > 0 ? conflicts : undefined,
      };
    } catch (error) {
      console.error('Error creating calendar event:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to create calendar event',
      };
    }
  }

  /**
   * Sync Flynn.ai event to calendar
   */
  async syncFlynnEventToCalendar(
    flynnEvent: FlynnEvent,
    providerId: string,
    calendarId: string,
    options: EventConversionOptions = {}
  ): Promise<CalendarEventResult> {
    try {
      // Convert Flynn event to calendar format
      const calendarEvent = this.convertFlynnEventToCalendar(
        flynnEvent,
        options
      );

      // Create event with conflict detection
      const result = await this.createEventWithConflictDetection(
        providerId,
        calendarId,
        calendarEvent
      );

      if (result.success) {
        console.log(
          `Successfully synced Flynn event ${flynnEvent.id} to ${providerId} calendar`
        );
      }

      return result;
    } catch (error) {
      console.error('Error syncing Flynn event to calendar:', error);
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : 'Failed to sync event to calendar',
      };
    }
  }

  /**
   * Batch sync multiple Flynn events to calendar
   */
  async batchSyncEventsToCalendar(
    flynnEvents: FlynnEvent[],
    providerId: string,
    calendarId: string,
    options: EventConversionOptions = {}
  ): Promise<{
    success: boolean;
    results: CalendarEventResult[];
    summary: {
      total: number;
      successful: number;
      failed: number;
      conflicts: number;
    };
  }> {
    console.log(
      `Batch syncing ${flynnEvents.length} events to ${providerId} calendar`
    );

    const results: CalendarEventResult[] = [];
    let successful = 0;
    let failed = 0;
    let conflicts = 0;

    // Process events sequentially to avoid rate limiting
    for (const flynnEvent of flynnEvents) {
      const result = await this.syncFlynnEventToCalendar(
        flynnEvent,
        providerId,
        calendarId,
        options
      );

      results.push(result);

      if (result.success) {
        successful++;
      } else {
        failed++;
      }

      if (result.conflicts && result.conflicts.length > 0) {
        conflicts++;
      }

      // Brief delay to respect API rate limits
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    const summary = {
      total: flynnEvents.length,
      successful,
      failed,
      conflicts,
    };

    console.log('Batch sync completed:', summary);

    return {
      success: failed === 0,
      results,
      summary,
    };
  }

  /**
   * Get provider authentication status
   */
  async getProviderAuthStatus(providerId: string): Promise<{
    isAuthenticated: boolean;
    provider: CalendarProvider | null;
    error?: string;
  }> {
    const provider = this.getProvider(providerId);

    if (!provider) {
      return {
        isAuthenticated: false,
        provider: null,
        error: `Provider '${providerId}' not found`,
      };
    }

    try {
      const isAuthenticated = await provider.isAuthenticated();
      return {
        isAuthenticated,
        provider,
      };
    } catch (error) {
      return {
        isAuthenticated: false,
        provider,
        error:
          error instanceof Error
            ? error.message
            : 'Authentication check failed',
      };
    }
  }
}

// Export singleton instance
export const calendarService = new CalendarService();
