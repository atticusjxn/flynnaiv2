import { NextRequest, NextResponse } from 'next/server';
import { calendarService } from '@/lib/calendar/CalendarService';
import { createGoogleCalendarProvider } from '@/lib/calendar/providers/GoogleCalendarProvider';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

// Register Google Calendar provider
const initializeCalendarService = (userId: string) => {
  const googleProvider = createGoogleCalendarProvider(userId);
  calendarService.registerProvider(googleProvider);
};

export async function GET(request: NextRequest) {
  try {
    // Get current user
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value;
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || '00000000-0000-0000-0000-000000000123'; // Fallback for testing

    initializeCalendarService(userId);

    // Get calendar integration status
    const authStatus = await calendarService.getProviderAuthStatus('google');

    return NextResponse.json({
      message: 'Calendar sync status',
      timestamp: new Date().toISOString(),
      user_id: userId,
      providers: calendarService.getAvailableProviders().map(p => ({
        id: p.providerId,
        name: p.displayName,
        authenticated: false, // Will be updated when we check each provider
      })),
      google_auth_status: authStatus,
    });

  } catch (error) {
    console.error('Calendar sync status error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to get calendar sync status', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, calendar_id, flynn_event } = await request.json();

    // Get current user
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          get(name: string) {
            return cookies().get(name)?.value;
          },
        },
      }
    );

    const { data: { user } } = await supabase.auth.getUser();
    const userId = user?.id || '00000000-0000-0000-0000-000000000123'; // Fallback for testing

    initializeCalendarService(userId);

    if (action === 'create-test-event') {
      if (!calendar_id) {
        return NextResponse.json(
          { error: 'calendar_id is required for creating events' },
          { status: 400 }
        );
      }

      console.log('Creating test calendar event for user:', userId);

      // Create a sample Flynn.ai event
      const sampleFlynnEvent = flynn_event || {
        id: `test-event-${Date.now()}`,
        call_id: `test-call-${Date.now()}`,
        title: 'Kitchen Sink Repair - Test Event',
        description: 'Test appointment created by Flynn.ai calendar integration. Customer needs kitchen sink leak fixed.',
        type: 'service_call',
        proposed_datetime: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // Tomorrow
        duration_minutes: 90,
        urgency: 'medium',
        customer_name: 'John Test',
        customer_phone: '+61455123456',
        customer_email: 'john.test@example.com',
        service_address: '123 Test Street, Melbourne VIC 3000',
        service_type: 'Plumbing Repair',
        confidence_score: 0.95,
        status: 'extracted',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      // Sync to calendar
      const result = await calendarService.syncFlynnEventToCalendar(
        sampleFlynnEvent,
        'google',
        calendar_id,
        {
          defaultDuration: 90,
          defaultTimeZone: 'Australia/Melbourne',
          includeCustomerInfo: true,
          addFlynnBranding: true,
          reminderMinutes: [15, 60],
        }
      );

      return NextResponse.json({
        message: 'Test calendar event sync completed',
        sync_result: result,
        flynn_event: sampleFlynnEvent,
      });
    }

    if (action === 'sync-flynn-event') {
      if (!calendar_id || !flynn_event) {
        return NextResponse.json(
          { error: 'calendar_id and flynn_event are required for syncing' },
          { status: 400 }
        );
      }

      console.log('Syncing Flynn event to calendar:', flynn_event.id);

      const result = await calendarService.syncFlynnEventToCalendar(
        flynn_event,
        'google',
        calendar_id,
        {
          defaultDuration: flynn_event.duration_minutes || 60,
          defaultTimeZone: 'Australia/Melbourne',
          includeCustomerInfo: true,
          addFlynnBranding: true,
          reminderMinutes: [15],
        }
      );

      return NextResponse.json({
        message: 'Flynn event sync completed',
        sync_result: result,
        flynn_event_id: flynn_event.id,
      });
    }

    if (action === 'batch-sync') {
      const { flynn_events } = await request.json();
      
      if (!calendar_id || !flynn_events || !Array.isArray(flynn_events)) {
        return NextResponse.json(
          { error: 'calendar_id and flynn_events array are required for batch sync' },
          { status: 400 }
        );
      }

      console.log(`Batch syncing ${flynn_events.length} Flynn events to calendar`);

      const result = await calendarService.batchSyncEventsToCalendar(
        flynn_events,
        'google',
        calendar_id,
        {
          defaultDuration: 60,
          defaultTimeZone: 'Australia/Melbourne',
          includeCustomerInfo: true,
          addFlynnBranding: true,
        }
      );

      return NextResponse.json({
        message: 'Batch sync completed',
        batch_result: result,
      });
    }

    return NextResponse.json(
      { error: 'Unknown action. Use: create-test-event, sync-flynn-event, batch-sync' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Calendar sync error:', error);
    return NextResponse.json(
      { 
        error: 'Calendar sync failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}