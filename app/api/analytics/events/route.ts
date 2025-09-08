import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';
import type { Database } from '@/types/database.types';

const TrackEventSchema = z.object({
  event_type: z.enum([
    'page_view',
    'feature_usage',
    'api_call',
    'conversion',
    'churn_risk',
    'support_interaction',
  ]),
  event_name: z.string().min(1).max(255),
  properties: z.record(z.any()).optional(),
  session_id: z.string().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get current user (optional for anonymous events)
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const body = await request.json();
    const validatedData = TrackEventSchema.parse(body);

    // Extract request metadata
    const ip =
      request.headers.get('x-forwarded-for') ||
      request.headers.get('x-real-ip') ||
      'unknown';
    const userAgent = request.headers.get('user-agent') || null;
    const referrer = request.headers.get('referer') || null;

    // Parse UTM parameters from properties if available
    const utm = validatedData.properties?.utm || {};

    const { error } = await supabase.from('analytics_events').insert({
      user_id: user?.id || null,
      event_type: validatedData.event_type,
      event_name: validatedData.event_name,
      properties: validatedData.properties,
      session_id: validatedData.session_id,
      ip_address: ip,
      user_agent: userAgent,
      referrer,
      utm_source: utm.source,
      utm_medium: utm.medium,
      utm_campaign: utm.campaign,
    });

    if (error) {
      console.error('Error tracking event:', error);
      return NextResponse.json(
        { error: 'Failed to track event' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid event data', details: error.errors },
        { status: 400 }
      );
    }

    console.error('Analytics event error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient();

    // Get current user (admin only for now)
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const url = new URL(request.url);
    const eventType = url.searchParams.get('event_type');
    const startDate = url.searchParams.get('start_date');
    const endDate = url.searchParams.get('end_date');
    const limit = Math.min(
      parseInt(url.searchParams.get('limit') || '100'),
      1000
    );

    let query = supabase
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (eventType) {
      query = query.eq('event_type', eventType);
    }

    if (startDate) {
      query = query.gte('created_at', startDate);
    }

    if (endDate) {
      query = query.lte('created_at', endDate);
    }

    const { data: events, error } = await query;

    if (error) {
      console.error('Error fetching analytics events:', error);
      return NextResponse.json(
        { error: 'Failed to fetch events' },
        { status: 500 }
      );
    }

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Analytics events API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
