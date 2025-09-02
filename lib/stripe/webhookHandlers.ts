// Flynn.ai v2 - Stripe Webhook Handlers for Australian Market
import { SubscriptionService } from './subscriptionService';
import Stripe from 'stripe';

const subscriptionService = new SubscriptionService();

/**
 * Handle customer.subscription.created event
 */
export async function handleSubscriptionCreated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;
    
    await subscriptionService.updateSubscriptionStatus(
      customerId,
      'active',
      subscription.id
    );

    console.log(`Subscription created for customer: ${customerId}`);
  } catch (error) {
    console.error('Error handling subscription created:', error);
    throw error;
  }
}

/**
 * Handle customer.subscription.updated event
 */
export async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;
    
    // Map Stripe status to our internal status
    let status: 'active' | 'past_due' | 'cancelled' | 'incomplete';
    
    switch (subscription.status) {
      case 'active':
        status = 'active';
        break;
      case 'past_due':
        status = 'past_due';
        break;
      case 'canceled':
        status = 'cancelled';
        break;
      case 'incomplete':
      case 'incomplete_expired':
        status = 'incomplete';
        break;
      default:
        status = 'incomplete';
    }

    await subscriptionService.updateSubscriptionStatus(
      customerId,
      status,
      subscription.id
    );

    console.log(`Subscription updated for customer: ${customerId}, status: ${status}`);
  } catch (error) {
    console.error('Error handling subscription updated:', error);
    throw error;
  }
}

/**
 * Handle customer.subscription.deleted event
 */
export async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  try {
    const customerId = subscription.customer as string;
    
    await subscriptionService.updateSubscriptionStatus(
      customerId,
      'cancelled'
    );

    console.log(`Subscription cancelled for customer: ${customerId}`);
  } catch (error) {
    console.error('Error handling subscription deleted:', error);
    throw error;
  }
}

/**
 * Handle invoice.payment_succeeded event
 */
export async function handleInvoicePaymentSucceeded(invoice: Stripe.Invoice) {
  try {
    if (!invoice.subscription) {
      return; // Not a subscription invoice
    }

    const customerId = invoice.customer as string;
    const subscriptionId = typeof invoice.subscription === 'string' 
      ? invoice.subscription 
      : invoice.subscription.id;
    
    // Ensure customer status is active after successful payment
    await subscriptionService.updateSubscriptionStatus(
      customerId,
      'active',
      subscriptionId
    );

    console.log(`Payment succeeded for customer: ${customerId}`);
  } catch (error) {
    console.error('Error handling invoice payment succeeded:', error);
    throw error;
  }
}

/**
 * Handle invoice.payment_failed event
 */
export async function handleInvoicePaymentFailed(invoice: Stripe.Invoice) {
  try {
    if (!invoice.subscription) {
      return; // Not a subscription invoice
    }

    const customerId = invoice.customer as string;
    const subscriptionId = typeof invoice.subscription === 'string' 
      ? invoice.subscription 
      : invoice.subscription.id;
    
    // Mark as past due after failed payment
    await subscriptionService.updateSubscriptionStatus(
      customerId,
      'past_due',
      subscriptionId
    );

    console.log(`Payment failed for customer: ${customerId}`);
    
    // TODO: Send email notification about failed payment
    // await sendPaymentFailedEmail(customerId);
  } catch (error) {
    console.error('Error handling invoice payment failed:', error);
    throw error;
  }
}

/**
 * Handle checkout.session.completed event
 */
export async function handleCheckoutSessionCompleted(session: Stripe.Checkout.Session) {
  try {
    const customerId = session.customer as string;
    const subscriptionId = session.subscription as string;

    if (session.mode === 'subscription' && subscriptionId) {
      await subscriptionService.updateSubscriptionStatus(
        customerId,
        'active',
        subscriptionId
      );

      console.log(`Checkout completed for customer: ${customerId}`);
      
      // TODO: Send welcome email for successful subscription
      // await sendWelcomeEmail(customerId);
    }
  } catch (error) {
    console.error('Error handling checkout session completed:', error);
    throw error;
  }
}

/**
 * Main webhook event handler
 */
export async function handleWebhookEvent(event: Stripe.Event) {
  try {
    switch (event.type) {
      case 'customer.subscription.created':
        await handleSubscriptionCreated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription);
        break;
        
      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription);
        break;
        
      case 'invoice.payment_succeeded':
        await handleInvoicePaymentSucceeded(event.data.object as Stripe.Invoice);
        break;
        
      case 'invoice.payment_failed':
        await handleInvoicePaymentFailed(event.data.object as Stripe.Invoice);
        break;
        
      case 'checkout.session.completed':
        await handleCheckoutSessionCompleted(event.data.object as Stripe.Checkout.Session);
        break;
        
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }
  } catch (error) {
    console.error(`Error handling webhook event ${event.type}:`, error);
    throw error;
  }
}