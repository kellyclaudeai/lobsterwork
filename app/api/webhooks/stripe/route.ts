import { NextRequest, NextResponse } from 'next/server';
import type Stripe from 'stripe';

import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe/server';

// This is needed to receive raw body
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

async function upsertTaskPostingPayment(
  paymentIntent: Stripe.PaymentIntent,
  status: 'pending' | 'succeeded' | 'failed'
) {
  if (paymentIntent.metadata?.purpose !== 'task_posting_fee') {
    return;
  }

  const userId = paymentIntent.metadata?.user_id;

  // Ignore PaymentIntents not created by our app.
  if (!userId) {
    console.warn(
      `Stripe webhook: PaymentIntent ${paymentIntent.id} missing metadata.user_id; skipping DB write.`
    );
    return;
  }

  const admin = createAdminClient();
  const { error } = await admin.from('task_posting_payments').upsert(
    {
      user_id: userId,
      payment_intent_id: paymentIntent.id,
      amount: paymentIntent.amount,
      status,
    },
    { onConflict: 'payment_intent_id' }
  );

  if (error) throw error;
}

export async function POST(req: NextRequest) {
  try {
    const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!stripeWebhookSecret) {
      console.error(
        'Missing STRIPE_WEBHOOK_SECRET. For local dev, run `stripe listen ...` and copy the whsec_... value into .env.local.'
      );
      return NextResponse.json(
        { error: 'Webhook secret not configured' },
        { status: 500 }
      );
    }

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.log('Payment succeeded:', paymentIntent.id);
        await upsertTaskPostingPayment(paymentIntent, 'succeeded');
        break;
      }

      case 'payment_intent.payment_failed': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.error('Payment failed:', paymentIntent.id);
        await upsertTaskPostingPayment(paymentIntent, 'failed');
        break;
      }

      case 'payment_intent.canceled': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        console.warn('Payment canceled:', paymentIntent.id);
        await upsertTaskPostingPayment(paymentIntent, 'failed');
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    return NextResponse.json(
      { error: 'Webhook handler failed' },
      { status: 500 }
    );
  }
}
