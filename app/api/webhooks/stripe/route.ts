// Flynn.ai v2 - Stripe Webhook API Route
import { NextRequest, NextResponse } from 'next/server';
import { stripe } from '@/lib/stripe/client';
import { handleWebhookEvent } from '@/lib/stripe/webhookHandlers';
import { headers } from 'next/headers';

// Disable body parsing for webhooks
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const headersList = headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      console.error('Missing Stripe signature');
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!webhookSecret) {
      console.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    let event;

    try {
      // Verify webhook signature
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    try {
      await handleWebhookEvent(event);

      console.log(
        `Successfully handled webhook event: ${event.type} (${event.id})`
      );

      return NextResponse.json({
        received: true,
        event: event.type,
        id: event.id,
      });
    } catch (handlerError) {
      console.error(
        `Failed to handle webhook event ${event.type}:`,
        handlerError
      );

      // Return 500 so Stripe will retry
      return NextResponse.json(
        {
          error: 'Failed to process event',
          event: event.type,
          id: event.id,
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
