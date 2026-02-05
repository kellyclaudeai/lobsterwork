import 'server-only';

import Stripe from 'stripe';

const secretKey = process.env.STRIPE_SECRET_KEY;

if (!secretKey) {
  throw new Error(
    'Missing STRIPE_SECRET_KEY. Set it in your environment (e.g. .env.local).'
  );
}

export const stripe = new Stripe(secretKey, {
  // Keep this aligned with your Stripe Dashboard API version (or omit to use the account default).
  // apiVersion: '2026-01-28.clover',
  maxNetworkRetries: 2,
  typescript: true,
});

