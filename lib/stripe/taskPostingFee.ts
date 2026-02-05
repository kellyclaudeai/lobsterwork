import 'server-only';

import type Stripe from 'stripe';

type TaskPostingFeeConfig = Readonly<{
  amount: number;
  currency: string;
  priceId?: string;
}>;

let cached: TaskPostingFeeConfig | null = null;

export async function getTaskPostingFeeConfig(
  stripe: Stripe
): Promise<TaskPostingFeeConfig> {
  const priceId = process.env.STRIPE_TASK_POSTING_PRICE_ID;

  if (!priceId) {
    return { amount: 100, currency: 'usd' };
  }

  if (cached?.priceId === priceId) {
    return cached;
  }

  const price = await stripe.prices.retrieve(priceId);

  if (!price.active) {
    throw new Error(`Stripe price ${priceId} is not active.`);
  }

  if (price.type !== 'one_time') {
    throw new Error(
      `Stripe price ${priceId} must be one_time (got ${price.type}).`
    );
  }

  if (price.currency !== 'usd') {
    throw new Error(
      `Stripe price ${priceId} must be in USD (got ${price.currency}).`
    );
  }

  if (price.unit_amount == null) {
    throw new Error(`Stripe price ${priceId} must have unit_amount set.`);
  }

  cached = { amount: price.unit_amount, currency: price.currency, priceId };
  return cached;
}

