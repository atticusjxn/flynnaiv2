// Flynn.ai v2 - Billing Checkout API Route
import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/stripe/subscriptionService';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const subscriptionService = new SubscriptionService();

const checkoutSchema = z.object({
  tier: z.enum(['basic', 'professional', 'enterprise']),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
});

export async function POST(request: NextRequest) {
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
    const validatedData = checkoutSchema.parse(body);

    // Create checkout session
    const session = await subscriptionService.createCheckoutSession(
      user.id,
      validatedData.successUrl,
      validatedData.cancelUrl,
      validatedData.tier
    );

    return NextResponse.json({
      success: true,
      sessionId: session.sessionId,
      url: session.url,
      tier: validatedData.tier,
    });
  } catch (error) {
    console.error('Checkout creation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
