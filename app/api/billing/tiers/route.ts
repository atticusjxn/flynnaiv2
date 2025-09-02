// Flynn.ai v2 - Subscription Tiers API Route
import { NextRequest, NextResponse } from 'next/server';
import { SUBSCRIPTION_TIERS, formatCurrency } from '@/lib/stripe/client';

// GET - Get available subscription tiers
export async function GET(request: NextRequest) {
  try {
    // Format tiers for client consumption
    const tiersWithFormatting = Object.entries(SUBSCRIPTION_TIERS).map(([key, tier]) => ({
      id: key,
      name: tier.name,
      priceAud: tier.price_aud,
      priceFormatted: formatCurrency(tier.price_aud),
      features: tier.features,
      callLimit: tier.call_limit,
      callLimitFormatted: tier.call_limit === -1 ? 'Unlimited' : `${tier.call_limit} calls/month`,
      capabilities: {
        hasCalendarSync: tier.has_calendar_sync,
        hasSmsNotifications: tier.has_sms_notifications,
        hasBulkManagement: tier.has_bulk_management,
        hasApiAccess: tier.has_api_access,
      },
      popular: key === 'professional', // Mark Professional as popular
    }));

    return NextResponse.json({
      success: true,
      tiers: tiersWithFormatting,
    });

  } catch (error) {
    console.error('Tiers fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to get subscription tiers' },
      { status: 500 }
    );
  }
}