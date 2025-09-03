// Flynn.ai v2 - Subscription Service for Australian Market
import { stripe, STRIPE_CONFIG, PRICE_IDS, SUBSCRIPTION_TIERS } from './client';
import { createClient } from '@/utils/supabase/server';

export interface TrialUser {
  id: string;
  email: string;
  trial_start_date?: string;
  trial_end_date?: string;
  subscription_status:
    | 'trial'
    | 'active'
    | 'past_due'
    | 'cancelled'
    | 'incomplete';
  stripe_customer_id?: string;
}

export class SubscriptionService {
  /**
   * Start a free trial for a new user (no payment method required)
   */
  async startFreeTrial(userId: string, email: string): Promise<TrialUser> {
    try {
      // Create Stripe customer (no payment method required)
      const customer = await stripe.customers.create({
        email,
        metadata: {
          user_id: userId,
          trial_started: new Date().toISOString(),
        },
      });

      // Calculate trial dates
      const trialStart = new Date();
      const trialEnd = new Date();
      trialEnd.setDate(trialStart.getDate() + STRIPE_CONFIG.trial_period_days);

      // Update user in database with trial information
      const supabase = createClient();
      const { data, error } = await supabase
        .from('users')
        .update({
          stripe_customer_id: customer.id,
          subscription_status: 'trial',
          trial_start_date: trialStart.toISOString(),
          trial_end_date: trialEnd.toISOString(),
          subscription_tier: 'trial',
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        throw new Error(`Database update failed: ${error.message}`);
      }

      return {
        id: data.id,
        email: data.email,
        trial_start_date: data.trial_start_date,
        trial_end_date: data.trial_end_date,
        subscription_status: data.subscription_status,
        stripe_customer_id: data.stripe_customer_id,
      };
    } catch (error) {
      console.error('Failed to start free trial:', error);
      throw new Error('Failed to start free trial');
    }
  }

  /**
   * Create checkout session for trial-to-paid conversion
   */
  async createCheckoutSession(
    userId: string,
    successUrl: string,
    cancelUrl: string,
    tier: 'basic' | 'professional' | 'enterprise' = 'basic'
  ) {
    try {
      // Get user details
      const supabase = createClient();
      const { data: user, error } = await supabase
        .from('users')
        .select('stripe_customer_id, email')
        .eq('id', userId)
        .single();

      if (error || !user) {
        throw new Error('User not found');
      }

      if (!user.stripe_customer_id) {
        throw new Error('User has no Stripe customer ID');
      }

      // Get the price ID for the selected tier
      const priceId = PRICE_IDS[`${tier}_aud` as keyof typeof PRICE_IDS];
      if (!priceId) {
        throw new Error(`Price ID not found for tier: ${tier}`);
      }

      // Create checkout session for subscription
      const session = await stripe.checkout.sessions.create({
        customer: user.stripe_customer_id,
        payment_method_types: ['card'],
        mode: 'subscription',
        line_items: [
          {
            price: priceId,
            quantity: 1,
          },
        ],
        success_url: successUrl,
        cancel_url: cancelUrl,
        metadata: {
          user_id: userId,
        },
        subscription_data: {
          metadata: {
            user_id: userId,
          },
        },
        // Australian tax settings
        automatic_tax: {
          enabled: true,
        },
        customer_update: {
          address: 'auto',
        },
      });

      return {
        sessionId: session.id,
        url: session.url,
      };
    } catch (error) {
      console.error('Failed to create checkout session:', error);
      throw new Error('Failed to create checkout session');
    }
  }

  /**
   * Create customer portal session for subscription management
   */
  async createPortalSession(userId: string, returnUrl: string) {
    try {
      const supabase = createClient();
      const { data: user, error } = await supabase
        .from('users')
        .select('stripe_customer_id')
        .eq('id', userId)
        .single();

      if (error || !user?.stripe_customer_id) {
        throw new Error('User not found or has no Stripe customer');
      }

      const session = await stripe.billingPortal.sessions.create({
        customer: user.stripe_customer_id,
        return_url: returnUrl,
      });

      return {
        url: session.url,
      };
    } catch (error) {
      console.error('Failed to create portal session:', error);
      throw new Error('Failed to create portal session');
    }
  }

  /**
   * Get trial status for a user
   */
  async getTrialStatus(userId: string) {
    try {
      const supabase = createClient();
      const { data: user, error } = await supabase
        .from('users')
        .select(
          'trial_start_date, trial_end_date, subscription_status, subscription_tier'
        )
        .eq('id', userId)
        .single();

      if (error || !user) {
        throw new Error('User not found');
      }

      const now = new Date();
      const trialEnd = user.trial_end_date
        ? new Date(user.trial_end_date)
        : null;

      let daysRemaining = 0;
      let isTrialActive = false;

      if (trialEnd) {
        const timeDiff = trialEnd.getTime() - now.getTime();
        daysRemaining = Math.max(0, Math.ceil(timeDiff / (1000 * 3600 * 24)));
        isTrialActive =
          daysRemaining > 0 && user.subscription_status === 'trial';
      }

      return {
        isTrialActive,
        daysRemaining,
        trialEndDate: trialEnd,
        subscriptionStatus: user.subscription_status,
        subscriptionTier: user.subscription_tier,
      };
    } catch (error) {
      console.error('Failed to get trial status:', error);
      throw new Error('Failed to get trial status');
    }
  }

  /**
   * Update subscription status from webhook events
   */
  async updateSubscriptionStatus(
    stripeCustomerId: string,
    status: 'active' | 'past_due' | 'cancelled' | 'incomplete',
    subscriptionId?: string
  ) {
    try {
      const updateData: any = {
        subscription_status: status,
        subscription_tier: status === 'active' ? 'basic' : 'trial',
      };

      if (subscriptionId) {
        updateData.stripe_subscription_id = subscriptionId;
      }

      // If subscription becomes active, clear trial dates
      if (status === 'active') {
        updateData.trial_start_date = null;
        updateData.trial_end_date = null;
      }

      const supabase = createClient();
      const { error } = await supabase
        .from('users')
        .update(updateData)
        .eq('stripe_customer_id', stripeCustomerId);

      if (error) {
        throw new Error(
          `Failed to update subscription status: ${error.message}`
        );
      }

      console.log(
        `Updated subscription status to ${status} for customer ${stripeCustomerId}`
      );
    } catch (error) {
      console.error('Failed to update subscription status:', error);
      throw error;
    }
  }

  /**
   * Check if user needs to add payment method before trial expires
   */
  async needsPaymentMethod(userId: string): Promise<boolean> {
    try {
      const supabase = createClient();
      const { data: user, error } = await supabase
        .from('users')
        .select('stripe_customer_id, subscription_status, trial_end_date')
        .eq('id', userId)
        .single();

      if (error || !user?.stripe_customer_id) {
        return false;
      }

      // If not on trial, they don't need to add payment method
      if (user.subscription_status !== 'trial') {
        return false;
      }

      // Check if they have a payment method
      const customer = await stripe.customers.retrieve(user.stripe_customer_id);
      if (customer.deleted) {
        return true;
      }

      const paymentMethods = await stripe.paymentMethods.list({
        customer: user.stripe_customer_id,
        type: 'card',
      });

      // If no payment methods and trial ending soon (within 7 days)
      if (paymentMethods.data.length === 0 && user.trial_end_date) {
        const trialEnd = new Date(user.trial_end_date);
        const now = new Date();
        const daysUntilExpiry = Math.ceil(
          (trialEnd.getTime() - now.getTime()) / (1000 * 3600 * 24)
        );

        return daysUntilExpiry <= 7;
      }

      return false;
    } catch (error) {
      console.error('Failed to check payment method requirement:', error);
      return false;
    }
  }

  /**
   * Get user's subscription tier and limits
   */
  async getUserSubscriptionInfo(userId: string) {
    try {
      const supabase = createClient();
      const { data: user, error } = await supabase
        .from('users')
        .select(
          'subscription_tier, subscription_status, stripe_customer_id, stripe_subscription_id'
        )
        .eq('id', userId)
        .single();

      if (error || !user) {
        throw new Error('User not found');
      }

      const tier =
        (user.subscription_tier as keyof typeof SUBSCRIPTION_TIERS) || 'basic';
      const tierInfo = SUBSCRIPTION_TIERS[tier];

      return {
        tier,
        status: user.subscription_status,
        limits: tierInfo,
        stripeCustomerId: user.stripe_customer_id,
        stripeSubscriptionId: user.stripe_subscription_id,
      };
    } catch (error) {
      console.error('Failed to get subscription info:', error);
      throw error;
    }
  }

  /**
   * Check if user can make another call (usage limits)
   */
  async canMakeCall(
    userId: string
  ): Promise<{ allowed: boolean; remaining: number; limit: number }> {
    try {
      const subscriptionInfo = await this.getUserSubscriptionInfo(userId);

      // Enterprise has unlimited calls
      if (subscriptionInfo.limits.call_limit === -1) {
        return { allowed: true, remaining: -1, limit: -1 };
      }

      // Get current month's call count
      const supabase = createClient();
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count, error } = await supabase
        .from('calls')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString());

      if (error) {
        throw error;
      }

      const callsThisMonth = count || 0;
      const limit = subscriptionInfo.limits.call_limit;
      const remaining = Math.max(0, limit - callsThisMonth);
      const allowed = callsThisMonth < limit;

      return { allowed, remaining, limit };
    } catch (error) {
      console.error('Failed to check call limits:', error);
      // Allow calls in case of error to avoid blocking users
      return { allowed: true, remaining: 0, limit: 0 };
    }
  }

  /**
   * Get usage analytics for billing dashboard
   */
  async getUsageAnalytics(userId: string) {
    try {
      const supabase = createClient();
      const subscriptionInfo = await this.getUserSubscriptionInfo(userId);

      // Get current month's usage
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { data: callsData, error: callsError } = await supabase
        .from('calls')
        .select('id, created_at, ai_processing_status')
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString());

      if (callsError) {
        throw callsError;
      }

      const calls = callsData || [];
      const callsThisMonth = calls.length;
      const successfulCalls = calls.filter(
        (call) => call.ai_processing_status === 'completed'
      ).length;

      // Get events extracted
      const { data: eventsData, error: eventsError } = await supabase
        .from('events')
        .select('id, created_at')
        .eq('user_id', userId)
        .gte('created_at', startOfMonth.toISOString());

      if (eventsError) {
        throw eventsError;
      }

      const eventsThisMonth = (eventsData || []).length;

      return {
        tier: subscriptionInfo.tier,
        status: subscriptionInfo.status,
        usage: {
          calls: {
            used: callsThisMonth,
            limit: subscriptionInfo.limits.call_limit,
            remaining:
              subscriptionInfo.limits.call_limit === -1
                ? -1
                : Math.max(
                    0,
                    subscriptionInfo.limits.call_limit - callsThisMonth
                  ),
          },
          events: {
            extracted: eventsThisMonth,
            successRate:
              callsThisMonth > 0 ? (successfulCalls / callsThisMonth) * 100 : 0,
          },
        },
        features: subscriptionInfo.limits,
      };
    } catch (error) {
      console.error('Failed to get usage analytics:', error);
      throw error;
    }
  }

  /**
   * Upgrade/downgrade subscription tier
   */
  async changeSubscriptionTier(
    userId: string,
    newTier: 'basic' | 'professional' | 'enterprise'
  ) {
    try {
      const subscriptionInfo = await this.getUserSubscriptionInfo(userId);

      if (!subscriptionInfo.stripeSubscriptionId) {
        throw new Error('User has no active subscription');
      }

      const newPriceId = PRICE_IDS[`${newTier}_aud` as keyof typeof PRICE_IDS];
      if (!newPriceId) {
        throw new Error(`Price ID not found for tier: ${newTier}`);
      }

      // Get current subscription
      const subscription = await stripe.subscriptions.retrieve(
        subscriptionInfo.stripeSubscriptionId
      );
      const currentItemId = subscription.items.data[0].id;

      // Update subscription with new price
      await stripe.subscriptions.update(subscriptionInfo.stripeSubscriptionId, {
        items: [
          {
            id: currentItemId,
            price: newPriceId,
          },
        ],
        proration_behavior: 'always_invoice', // Immediate proration
      });

      // Update database
      const supabase = createClient();
      await supabase
        .from('users')
        .update({ subscription_tier: newTier })
        .eq('id', userId);

      return { success: true, newTier };
    } catch (error) {
      console.error('Failed to change subscription tier:', error);
      throw error;
    }
  }
}
