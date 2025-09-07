// Flynn.ai v2 - Trial Status API Route
import { NextRequest, NextResponse } from 'next/server';
import { SubscriptionService } from '@/lib/stripe/subscriptionService';
import { createClient } from '@/utils/supabase/server';

// Force dynamic rendering - this route uses cookies
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const subscriptionService = new SubscriptionService();

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

    const trialStatus = await subscriptionService.getTrialStatus(user.id);
    const needsPaymentMethod = await subscriptionService.needsPaymentMethod(
      user.id
    );

    return NextResponse.json({
      success: true,
      ...trialStatus,
      needsPaymentMethod,
    });
  } catch (error) {
    console.error('Failed to get trial status:', error);
    return NextResponse.json(
      { error: 'Failed to get trial status' },
      { status: 500 }
    );
  }
}
