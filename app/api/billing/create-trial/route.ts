// Flynn.ai v2 - Create Free Trial API Route
import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/stripe/subscriptionService';
import { createClient } from '@/utils/supabase/server';

const subscriptionService = new SubscriptionService();

export async function POST(request: NextRequest) {
  try {
    // Get user from session
    const supabase = createClient();
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();

    if (authError || !authUser) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get user details from database
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id, email, subscription_status')
      .eq('id', authUser.id)
      .single();

    if (userError || !user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user already has a trial or subscription
    if (user.subscription_status && user.subscription_status !== 'cancelled') {
      return NextResponse.json(
        { error: 'User already has an active trial or subscription' },
        { status: 400 }
      );
    }

    // Start free trial
    const trialUser = await subscriptionService.startFreeTrial(authUser.id, user.email);

    return NextResponse.json({
      success: true,
      trial: trialUser,
      message: 'Free trial started successfully',
    });

  } catch (error) {
    console.error('Failed to create trial:', error);
    return NextResponse.json(
      { error: 'Failed to start free trial' },
      { status: 500 }
    );
  }
}