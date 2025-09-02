// Flynn.ai v2 - Initialize User Trial API Route
import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/stripe/subscriptionService';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const { userId, email } = await request.json();

    if (!userId || !email) {
      return NextResponse.json(
        { error: 'User ID and email are required' },
        { status: 400 }
      );
    }

    // Check if user already has a trial initialized
    const supabase = createClient();
    const { data: existingUser, error: userError } = await supabase
      .from('users')
      .select('stripe_customer_id, subscription_status, trial_start_date')
      .eq('id', userId)
      .single();

    if (userError) {
      console.error('Error checking existing user:', userError);
      return NextResponse.json(
        { error: 'Failed to check user status' },
        { status: 500 }
      );
    }

    // If user already has Stripe customer ID or active trial, skip initialization
    if (existingUser?.stripe_customer_id || existingUser?.trial_start_date) {
      return NextResponse.json({
        success: true,
        message: 'User trial already initialized',
        alreadyInitialized: true
      });
    }

    // Initialize free trial with Stripe customer
    const subscriptionService = new SubscriptionService();
    const trialUser = await subscriptionService.startFreeTrial(userId, email);

    return NextResponse.json({
      success: true,
      message: 'Trial initialized successfully',
      trial: trialUser,
      alreadyInitialized: false
    });

  } catch (error) {
    console.error('Failed to initialize trial:', error);
    return NextResponse.json(
      { error: 'Failed to initialize trial' },
      { status: 500 }
    );
  }
}