import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe/server';
import { getTaskPostingFeeConfig } from '@/lib/stripe/taskPostingFee';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    // Verify user is authenticated
    const supabase = await createClient();
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user's profile (best-effort)
    const { data: profile } = await supabase
      .from('profiles')
      .select('email, name')
      .eq('id', user.id)
      .maybeSingle();

    // Create payment intent for $1 task posting fee
    const fee = await getTaskPostingFeeConfig(stripe);
    const paymentIntent = await stripe.paymentIntents.create({
      amount: fee.amount,
      currency: fee.currency,
      automatic_payment_methods: {
        enabled: true,
        // Keep the in-app flow simple: no redirect-based payment methods.
        allow_redirects: 'never',
      },
      metadata: {
        user_id: user.id,
        purpose: 'task_posting_fee',
        ...(fee.priceId ? { price_id: fee.priceId } : {}),
      },
      receipt_email: profile?.email || user.email,
      description: 'LobsterWork Task Posting Fee',
    });

    // Track the attempt immediately (webhook will later mark succeeded/failed).
    const admin = createAdminClient();
    const { error: insertError } = await admin
      .from('task_posting_payments')
      .upsert(
        {
          user_id: user.id,
          payment_intent_id: paymentIntent.id,
          amount: fee.amount,
          status: 'pending',
        },
        { onConflict: 'payment_intent_id' }
      );

    if (insertError) {
      console.error('Failed to record pending payment:', insertError);
      await stripe.paymentIntents.cancel(paymentIntent.id).catch(() => {});
      return NextResponse.json(
        { error: 'Failed to initialize payment' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id,
      amount: fee.amount,
      currency: fee.currency,
    });
  } catch (error) {
    console.error('Payment intent creation failed:', error);
    return NextResponse.json(
      { error: 'Failed to create payment intent' },
      { status: 500 }
    );
  }
}
