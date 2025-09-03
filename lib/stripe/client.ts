// Flynn.ai v2 - Stripe Client for Australian Market
import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY is not defined in environment variables');
}

// Initialize Stripe client configured for Australian market
export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-08-27.basil',
  typescript: true,
});

// Flynn.ai Subscription Tiers
export const SUBSCRIPTION_TIERS = {
  basic: {
    name: 'Basic',
    price_aud: 29,
    features: [
      'AI call notes and event extraction',
      'Professional email delivery',
      'Basic calendar integration (ICS files)',
      '100 calls per month',
      'Email support',
    ],
    call_limit: 100,
    has_calendar_sync: false,
    has_sms_notifications: false,
    has_bulk_management: false,
    has_api_access: false,
  },
  professional: {
    name: 'Professional',
    price_aud: 79,
    features: [
      'Everything in Basic',
      'Advanced calendar sync (Google, Outlook)',
      'SMS customer notifications',
      'Bulk event management',
      '500 calls per month',
      'Priority support',
    ],
    call_limit: 500,
    has_calendar_sync: true,
    has_sms_notifications: true,
    has_bulk_management: true,
    has_api_access: false,
  },
  enterprise: {
    name: 'Enterprise',
    price_aud: 149,
    features: [
      'Everything in Professional',
      'Unlimited calls',
      'Custom industry configurations',
      'Team collaboration',
      'API access',
      'Dedicated support',
    ],
    call_limit: -1, // Unlimited
    has_calendar_sync: true,
    has_sms_notifications: true,
    has_bulk_management: true,
    has_api_access: true,
  },
} as const;

// Australian market configuration
export const STRIPE_CONFIG = {
  currency: 'aud',
  country: 'AU',
  locale: 'en-AU',
  tax_behavior: 'inclusive', // GST inclusive pricing
  trial_period_days: 30,

  // Australian compliance settings
  gst_rate: 0.1, // 10% GST
  tax_code: 'txcd_20240101_000000', // Australian GST tax code
  business_type: 'SaaS',

  // Customer portal configuration
  portal_features: {
    customer_update: {
      allowed_updates: ['email', 'address', 'phone', 'tax_id'],
      enabled: true,
    },
    invoice_history: { enabled: true },
    payment_method_update: { enabled: true },
    subscription_cancel: {
      enabled: true,
      mode: 'at_period_end', // Australian consumer protection
      cancellation_reason: { enabled: true },
    },
  },
} as const;

// Stripe price IDs (these need to be created in Stripe Dashboard)
export const PRICE_IDS = {
  basic_aud: process.env.STRIPE_PRICE_ID_BASIC_AUD || '',
  professional_aud: process.env.STRIPE_PRICE_ID_PROFESSIONAL_AUD || '',
  enterprise_aud: process.env.STRIPE_PRICE_ID_ENTERPRISE_AUD || '',
  // Legacy support
  monthly_aud:
    process.env.STRIPE_PRICE_ID_MONTHLY_AUD ||
    process.env.STRIPE_PRICE_ID_BASIC_AUD ||
    '',
} as const;

// Helper function to format currency for Australian market
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
  }).format(amount);
}

// Helper function to get publishable key for client-side
export function getStripePublishableKey(): string {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) {
    throw new Error('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is not defined');
  }
  return key;
}
