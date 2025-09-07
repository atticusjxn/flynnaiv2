// Flynn.ai v2 - Subscription Management API Route
import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/stripe/subscriptionService';
import { createClient } from '@/utils/supabase/server';
import { z } from 'zod';

// Force dynamic rendering - this route uses cookies
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const subscriptionService = new SubscriptionService();

const updateSubscriptionSchema = z.object({
  tier: z.enum(['basic', 'professional', 'enterprise']),
});

// GET - Get current subscription info
export async function GET(request: NextRequest) {
  try {
    // Get user from session
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get subscription information
    const subscriptionInfo = await subscriptionService.getUserSubscriptionInfo(
      user.id
    );
    const trialStatus = await subscriptionService.getTrialStatus(user.id);
    const needsPayment = await subscriptionService.needsPaymentMethod(user.id);

    return NextResponse.json({
      success: true,
      subscription: subscriptionInfo,
      trial: trialStatus,
      needsPaymentMethod: needsPayment,
    });
  } catch (error) {
    console.error('Subscription info error:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription information' },
      { status: 500 }
    );
  }
}

// PUT - Update subscription tier
export async function PUT(request: NextRequest) {
  try {
    // Get user from session
    const supabase = createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = updateSubscriptionSchema.parse(body);

    // Change subscription tier
    const result = await subscriptionService.changeSubscriptionTier(
      user.id,
      validatedData.tier
    );

    return NextResponse.json({
      success: true,
      newTier: result.newTier,
    });
  } catch (error) {
    console.error('Subscription update error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to update subscription' },
      { status: 500 }
    );
  }
}
