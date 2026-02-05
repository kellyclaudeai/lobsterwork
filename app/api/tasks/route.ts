import { NextRequest, NextResponse } from 'next/server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { stripe } from '@/lib/stripe/server';
import { getTaskPostingFeeConfig } from '@/lib/stripe/taskPostingFee';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function asNonEmptyString(value: unknown): string | null {
  if (typeof value !== 'string') return null;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : null;
}

export async function POST(req: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body: unknown = await req.json().catch(() => null);
    if (!body || typeof body !== 'object') {
      return badRequest('Invalid JSON body');
    }

    const paymentIntentId = asNonEmptyString(
      (body as Record<string, unknown>).payment_intent_id
    );
    if (!paymentIntentId) {
      return badRequest('payment_intent_id is required');
    }

    const title = asNonEmptyString((body as Record<string, unknown>).title);
    const description = asNonEmptyString(
      (body as Record<string, unknown>).description
    );
    const budgetMin = (body as Record<string, unknown>).budget_min;
    const budgetMax = (body as Record<string, unknown>).budget_max;

    if (!title) return badRequest('title is required');
    if (!description) return badRequest('description is required');
    if (typeof budgetMin !== 'number') return badRequest('budget_min is required');
    if (typeof budgetMax !== 'number') return badRequest('budget_max is required');
    if (budgetMax < budgetMin) {
      return badRequest('Maximum budget must be greater than minimum budget');
    }

    const preferredWorkerType =
      asNonEmptyString((body as Record<string, unknown>).preferred_worker_type) ??
      null;
    const deadline =
      asNonEmptyString((body as Record<string, unknown>).deadline) ?? null;
    const category =
      asNonEmptyString((body as Record<string, unknown>).category) ?? null;

    // Verify PaymentIntent directly with Stripe (avoids webhook race conditions).
    let paymentIntent;
    try {
      paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      if (message.includes('No such payment_intent')) {
        return badRequest('Unknown payment_intent_id');
      }
      console.error('Stripe PaymentIntent retrieve failed:', err);
      return NextResponse.json(
        { error: 'Failed to verify payment' },
        { status: 502 }
      );
    }

    if (paymentIntent.status !== 'succeeded') {
      return NextResponse.json(
        { error: 'Payment has not succeeded yet' },
        { status: 402 }
      );
    }

    if (paymentIntent.metadata?.purpose !== 'task_posting_fee') {
      return badRequest('Invalid payment intent purpose');
    }

    if (paymentIntent.metadata?.user_id !== user.id) {
      return NextResponse.json(
        { error: 'Payment intent does not belong to this user' },
        { status: 403 }
      );
    }

    const fee = await getTaskPostingFeeConfig(stripe);
    if (paymentIntent.amount !== fee.amount || paymentIntent.currency !== fee.currency) {
      return badRequest('Payment amount/currency mismatch');
    }

    const admin = createAdminClient();
    const { data: task, error: rpcError } = await admin.rpc(
      'create_task_with_payment',
      {
        p_user_id: user.id,
        p_payment_intent_id: paymentIntent.id,
        p_amount: paymentIntent.amount,
        p_title: title,
        p_description: description,
        p_budget_min: budgetMin,
        p_budget_max: budgetMax,
        p_preferred_worker_type: preferredWorkerType,
        p_deadline: deadline,
        p_category: category,
      }
    );

    if (rpcError) {
      const message = rpcError.message || 'Failed to create task';

      if (message.includes('payment_already_used')) {
        // Idempotency nicety: if this PaymentIntent already created a task for this user,
        // return that task rather than erroring.
        const { data: payment } = await admin
          .from('task_posting_payments')
          .select('task_id')
          .eq('payment_intent_id', paymentIntent.id)
          .eq('user_id', user.id)
          .maybeSingle();

        if (payment?.task_id) {
          const { data: existingTask } = await admin
            .from('tasks')
            .select('*')
            .eq('id', payment.task_id)
            .maybeSingle();

          if (existingTask) {
            return NextResponse.json({ task: existingTask, alreadyCreated: true });
          }
        }

        return NextResponse.json({ error: 'Payment already used' }, { status: 409 });
      }

      if (message.includes('payment_intent_user_mismatch')) {
        return NextResponse.json(
          { error: 'Payment intent does not belong to this user' },
          { status: 403 }
        );
      }

      console.error('create_task_with_payment failed:', rpcError);
      return NextResponse.json({ error: message }, { status: 500 });
    }

    return NextResponse.json({ task });
  } catch (error) {
    console.error('Create task API failed:', error);
    return NextResponse.json({ error: 'Failed to create task' }, { status: 500 });
  }
}
