# Task: Phase 3 - Payments + Escrow (Stripe, Webhooks, Idempotency)

**Status:** Ready  
**Priority:** High  
**Created:** 2026-02-04  
**Updated:** 2026-02-04  
**Assigned:** Unassigned

---

## Description

Implement escrow-style payments so:
- Requester funds the contract at award time (or milestone-by-milestone).
- Provider gets paid only when requester accepts deliverables (or milestone acceptance).
- Refunds/cancellations follow a defined policy.

This phase must be built with webhook idempotency and ledger reconciliation from day one.

---

## Current State (Code Reality)

- No server-side endpoints for Stripe.
- No webhook handlers.
- No payment tables/ledger.
- No payout strategy implemented.

---

## Why This Matters

- Payments are the highest-risk part of marketplaces.
- Webhooks arrive duplicated and out of order; if we don't build for that, we will double-charge or double-pay.
- Auditable ledgers prevent trust erosion and make support possible.

---

## Acceptance Criteria

- [ ] Contract can be funded in Stripe test mode.
- [ ] Payment state in DB matches Stripe state (and is resilient to duplicates).
- [ ] Release payment is idempotent (double-click safe).
- [ ] Webhook processing is signature-verified and idempotent.
- [ ] Ledger reconciliation tests pass (no negative balances, totals match).
- [ ] Bender 1 passes through "fund -> accept -> release".

---

## Work Items

### 1) Decide Payment Architecture

- [ ] Stripe Checkout vs PaymentIntents:
- [ ] Checkout is faster to ship.
- [ ] PaymentIntents is more flexible for complex milestones.
- [ ] Decide escrow strategy:
- [ ] Fund full contract at award time
- [ ] Fund per milestone

### 2) Server-Side Stripe Integration

- [ ] Create server endpoints for:
- [ ] creating a checkout session or payment intent
- [ ] querying payment status for UI
- [ ] releasing escrow (or marking milestone funded/released)
- [ ] Create a Stripe webhook endpoint:
- [ ] signature verification
- [ ] strict event allowlist
- [ ] Define environment variables and ensure they never ship to the client bundle:
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] Decide initial webhook event allowlist (example):
- [ ] `checkout.session.completed`
- [ ] `payment_intent.succeeded`
- [ ] `payment_intent.payment_failed`
- [ ] `charge.refunded`

### 3) DB Model (Ledger + Webhook Events)

- [ ] Add `stripe_events` table:
- [ ] store Stripe event id (unique)
- [ ] store processed_at
- [ ] store raw payload (optional, or store a hash)
- [ ] Add `payments` table:
- [ ] contract id
- [ ] amounts, currency, fees
- [ ] status
- [ ] stripe ids (session id, payment intent id, charge id)
- [ ] Add `escrow_ledger` table for accounting-style entries.
- [ ] Add `payouts` table (even if payouts are manual in v1).

### 4) Idempotency Rules

- [ ] Webhook handler must no-op on already processed event ids.
- [ ] Release endpoint must be idempotent:
- [ ] DB guard (only release once)
- [ ] Stripe idempotency keys where relevant
- [ ] Handle out-of-order events without corrupting state.

Local/staging webhook testing:
- [ ] Add a documented workflow for Stripe CLI (or equivalent) to forward webhooks to local dev.
- [ ] Add tests that replay webhook payloads (duplicate and out-of-order).

### 5) Refunds, Cancellations, Disputes (MVP Policy)

- [ ] Define the cancellation windows and who can cancel when.
- [ ] Define automatic vs manual refund triggers.
- [ ] Tie disputes to payment freeze (no auto-release when disputed).

### 6) Payout Strategy

- [ ] Decide v1 approach:
- [ ] Track "owed to provider" and pay manually (fastest)
- [ ] Stripe Connect Express for automated payouts (more work, more real)

---

## Testing

- [ ] E2E: fund contract -> submit deliverable -> accept -> release payment.
- [ ] Webhook idempotency: replay same event twice, ensure no double processing.
- [ ] Out-of-order webhooks: simulate and ensure state remains consistent.
- [ ] Double-click release: ensure only one release occurs.
- [ ] Ledger reconciliation: totals match and no negative balances.

Reference: `docs/plans/backlog/2026-02-04-testing-strategy.md`

---

## Dependencies

- Depends on: Phase 2 contracts and acceptance flow
- Informs: Phase 4 disputes and moderation

---

## Progress Log

### 2026-02-04
- Created phase plan emphasizing webhook idempotency and a real ledger model.
