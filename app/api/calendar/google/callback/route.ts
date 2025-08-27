import { NextRequest, NextResponse } from 'next/server';
import { googleCalendarAuth } from '@/lib/calendar/googleCalendarAuth';
import { createAdminClient } from '@/utils/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state'); // User ID
    const error = searchParams.get('error');

    // Handle OAuth errors
    if (error) {
      console.error('Google Calendar OAuth error:', error);
      return NextResponse.redirect(
        new URL(`/settings?calendar_error=${encodeURIComponent(error)}`, request.url)
      );
    }

    if (!code || !state) {
      console.error('Missing authorization code or state');
      return NextResponse.redirect(
        new URL('/settings?calendar_error=invalid_callback', request.url)
      );
    }

    const userId = state;
    console.log('Processing Google Calendar callback for user:', userId);

    // Exchange code for tokens
    const tokenResult = await googleCalendarAuth.exchangeCodeForTokens(code, state);

    if (!tokenResult.success || !tokenResult.tokens) {
      console.error('Token exchange failed:', tokenResult.error);
      return NextResponse.redirect(
        new URL(`/settings?calendar_error=${encodeURIComponent(tokenResult.error || 'token_exchange_failed')}`, request.url)
      );
    }

    // Store tokens in database
    const supabase = createAdminClient();
    const { error: dbError } = await supabase
      .from('calendar_integrations')
      .upsert({
        user_id: userId,
        provider: 'google',
        access_token: tokenResult.tokens.access_token,
        refresh_token: tokenResult.tokens.refresh_token,
        token_type: tokenResult.tokens.token_type,
        scope: tokenResult.tokens.scope,
        expires_at: tokenResult.tokens.expiry_date ? new Date(tokenResult.tokens.expiry_date).toISOString() : null,
        is_active: true,
        connected_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });

    if (dbError) {
      console.error('Database error storing calendar integration:', dbError);
      return NextResponse.redirect(
        new URL('/settings?calendar_error=database_error', request.url)
      );
    }

    console.log('Successfully stored Google Calendar integration for user:', userId);

    // Test the integration by fetching calendar list
    try {
      const client = googleCalendarAuth.getAuthenticatedClient(tokenResult.tokens);
      const { google } = require('googleapis');
      const calendar = google.calendar({ version: 'v3', auth: client });
      
      const calendarList = await calendar.calendarList.list({ maxResults: 10 });
      console.log(`Successfully connected to ${calendarList.data.items?.length || 0} calendars`);

      // Update integration with calendar count
      await supabase
        .from('calendar_integrations')
        .update({
          calendar_count: calendarList.data.items?.length || 0,
          last_sync_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .eq('provider', 'google');

    } catch (testError) {
      console.error('Calendar test failed:', testError);
      // Don't fail the whole process, just log the error
    }

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/settings?calendar_success=google_connected', request.url)
    );

  } catch (error) {
    console.error('Google Calendar callback error:', error);
    return NextResponse.redirect(
      new URL(`/settings?calendar_error=${encodeURIComponent('callback_processing_failed')}`, request.url)
    );
  }
}