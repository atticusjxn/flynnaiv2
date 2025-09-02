// Flynn.ai v2 - Usage Analytics API Route
import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/stripe/subscriptionService';
import { createClient } from '@/utils/supabase/server';

const subscriptionService = new SubscriptionService();

// GET - Get usage analytics
export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get usage analytics
    const analytics = await subscriptionService.getUsageAnalytics(user.id);
    const callLimits = await subscriptionService.canMakeCall(user.id);

    return NextResponse.json({
      success: true,
      analytics,
      currentLimits: callLimits,
    });

  } catch (error) {
    console.error('Usage analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to get usage analytics' },
      { status: 500 }
    );
  }
}

// POST - Check if user can make a call (for rate limiting)
export async function POST(request: NextRequest) {
  try {
    // Get user from session
    const supabase = createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check call limits
    const canMakeCall = await subscriptionService.canMakeCall(user.id);

    return NextResponse.json({
      success: true,
      ...canMakeCall,
    });

  } catch (error) {
    console.error('Call limit check error:', error);
    return NextResponse.json(
      { error: 'Failed to check call limits' },
      { status: 500 }
    );
  }
}