import { NextRequest, NextResponse } from 'next/server';
import { calendarService } from '@/lib/calendar/CalendarService';
import { createGoogleCalendarProvider } from '@/lib/calendar/providers/GoogleCalendarProvider';
import { getGoogleCalendarConfig } from '@/lib/calendar/googleCalendarAuth';

export async function GET() {
  try {
    const config = getGoogleCalendarConfig();
    
    return NextResponse.json({
      message: 'Calendar Service Test',
      timestamp: new Date().toISOString(),
      google_config: config,
      providers_registered: calendarService.getAvailableProviders().map(p => ({
        id: p.providerId,
        name: p.displayName,
        requiresAuth: p.requiresAuth,
      })),
      endpoints: {
        auth: '/api/calendar/google/auth',
        callback: '/api/calendar/google/callback',
        sync: '/api/calendar/sync',
        test_provider: '/api/calendar/test (POST)',
      }
    });

  } catch (error) {
    console.error('Calendar test error:', error);
    return NextResponse.json(
      { 
        error: 'Calendar test failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, user_id, calendar_id } = await request.json();

    if (action === 'test-provider') {
      if (!user_id) {
        return NextResponse.json(
          { error: 'user_id is required for provider testing' },
          { status: 400 }
        );
      }

      console.log('Testing Google Calendar provider for user:', user_id);
      
      // Create and register Google Calendar provider
      const googleProvider = createGoogleCalendarProvider(user_id);
      calendarService.registerProvider(googleProvider);

      // Test authentication status
      const authStatus = await calendarService.getProviderAuthStatus('google');
      
      let calendars = [];
      let testResult = null;

      if (authStatus.isAuthenticated) {
        try {
          // List calendars
          calendars = await googleProvider.listCalendars();
          console.log(`Found ${calendars.length} calendars`);

          // Test creating a sample event if calendar_id provided
          if (calendar_id) {
            const sampleEvent = {
              title: 'Flynn.ai Calendar Test',
              description: 'Test event created by Flynn.ai calendar integration system.',
              start: {
                dateTime: new Date(Date.now() + 60 * 60 * 1000).toISOString(), // 1 hour from now
                timeZone: 'America/Los_Angeles',
              },
              end: {
                dateTime: new Date(Date.now() + 2 * 60 * 60 * 1000).toISOString(), // 2 hours from now
                timeZone: 'America/Los_Angeles',
              },
            };

            testResult = await googleProvider.createEvent(calendar_id, sampleEvent);
            console.log('Test event creation result:', testResult);
          }

        } catch (error) {
          console.error('Error testing calendar provider:', error);
          return NextResponse.json({
            message: 'Calendar provider authenticated but API test failed',
            auth_status: authStatus,
            error: error instanceof Error ? error.message : 'Unknown error',
          });
        }
      }

      return NextResponse.json({
        message: 'Calendar provider test completed',
        auth_status: authStatus,
        calendars_found: calendars.length,
        calendars: calendars.slice(0, 5), // Return first 5 calendars
        test_event_result: testResult,
      });
    }

    return NextResponse.json(
      { error: 'Unknown action. Use: test-provider' },
      { status: 400 }
    );

  } catch (error) {
    console.error('Calendar test error:', error);
    return NextResponse.json(
      { 
        error: 'Calendar test failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}