import { NextRequest, NextResponse } from 'next/server';
import { googleCalendarAuth } from '@/lib/calendar/googleCalendarAuth';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    console.log('Initiating Google Calendar auth for user:', userId);

    // Generate authorization URL
    const authUrl = googleCalendarAuth.generateAuthUrl(userId);

    return NextResponse.json({
      message: 'Google Calendar authorization URL generated',
      auth_url: authUrl,
      user_id: userId,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Google Calendar auth initiation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to initiate Google Calendar authorization',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get current user from Supabase auth
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

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'User not authenticated' },
        { status: 401 }
      );
    }

    console.log('Initiating Google Calendar auth for authenticated user:', user.id);

    // Generate authorization URL
    const authUrl = googleCalendarAuth.generateAuthUrl(user.id);

    return NextResponse.json({
      message: 'Google Calendar authorization URL generated',
      auth_url: authUrl,
      user_id: user.id,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Google Calendar auth initiation error:', error);
    return NextResponse.json(
      {
        error: 'Failed to initiate Google Calendar authorization',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}