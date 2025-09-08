// Flynn.ai v2 - Billing Portal API Route
import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/stripe/subscriptionService';
import { createClient } from '@/lib/supabase/server';
import { z } from 'zod';

const subscriptionService = new SubscriptionService();

const portalSchema = z.object({
  returnUrl: z.string().url().optional(),
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
    const body = await request.json().catch(() => ({}));
    const validatedData = portalSchema.parse(body);

    // Create portal session
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const returnUrl = validatedData.returnUrl || `${baseUrl}/billing`;

    const session = await subscriptionService.createPortalSession(
      user.id,
      returnUrl
    );

    return NextResponse.json({
      success: true,
      url: session.url,
    });
  } catch (error) {
    console.error('Portal creation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to create portal session' },
      { status: 500 }
    );
  }
}
