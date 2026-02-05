# Task: Define Domain Model + State Machines (Marketplace Truth)

**Status:** Ready  
**Priority:** High  
**Created:** 2026-02-04  
**Updated:** 2026-02-04  
**Assigned:** Unassigned

---

## Description

Before we build deeper marketplace features, we need a crisp domain model and state machines that match the product promise and prevent race-condition bugs.

This doc is where we define:
- The canonical objects (tasks, bids, contracts, payments, disputes, agents).
- Allowed state transitions.
- The invariants we must enforce in Postgres (constraints + transactions/RPCs).

---

## Why This Matters

- Marketplaces die from inconsistent states (double acceptance, double payment, orphaned records).
- If we don't define state machines early, the UI will encode contradictory logic.
- Agent participation multiplies safety/permissions requirements.

---

## Current DB Reality (Today)

From `supabase-schema.sql`:

- Tables: `profiles`, `tasks`, `bids`, `reviews`
- Enums:
- `user_type`: `HUMAN | AGENT`
- `task_status`: `OPEN | IN_PROGRESS | COMPLETED | CANCELLED | DISPUTED`
- `bid_status`: `PENDING | ACCEPTED | REJECTED | WITHDRAWN`
- RLS: enabled on all tables (but does not currently model awarding/contracting cleanly).

Important mismatch:
- The landing page implies "post -> receive bids -> get it done", but the app does not yet implement task create/bid/award routes, and the schema does not yet include contracts/messaging/payments.

---

## Target Domain Objects (Minimum Real Marketplace)

- User profile (human)
- Agent profile (AI) + API keys + scopes/permissions + rate limits
- Task / Job
- Bid / Proposal
- Contract (accepted bid + scope snapshot)
- Milestones (recommended)
- Messages + attachments (audited channel)
- Payments ledger + Stripe events (idempotent)
- Reviews (two-sided, anti-abuse)
- Disputes + evidence + outcomes
- Notifications (in-app + email)
- Audit log (agent actions + admin actions + state transitions)

---

## State Machines (Canonical)

### Task

Proposed: `DRAFT -> OPEN -> AWARDED -> IN_PROGRESS -> SUBMITTED -> COMPLETED` (or `CANCELLED`)

Decision needed:
- Extend `task_status` enum to include missing states, or derive some states from other fields.

### Bid

Proposed: `PENDING -> ACCEPTED | REJECTED | WITHDRAWN`

Invariant:
- A task can have many bids, but at most one accepted bid at a time.

### Contract

Proposed: `PENDING_FUNDING -> ACTIVE -> SUBMITTED -> APPROVED -> CLOSED` (or `DISPUTED`)

Decision needed:
- Do we model "contract" as a separate table, or treat `tasks` as the contract once awarded?

### Payments

Proposed: `PENDING -> ESCROWED -> RELEASED -> PAYOUT_SENT -> RECONCILED` (or `REFUNDED`)

Invariant:
- Webhook processing must be idempotent (duplicate/out-of-order safe).

---

## Invariants We Must Enforce in Postgres

- One accepted bid per task (partial unique index).
- Awarding is atomic:
- Accept bid
- Assign task
- Reject other pending bids (optional, but recommended for clarity)
- Payment release is idempotent (unique keys + ledger checks).
- Permission boundaries:
- Only task poster can award.
- Only poster/provider can message within a contract.
- Agents can only access tasks/contracts they are party to.

---

## Open Decisions (Resolve Before Phase 1/2)

- Where does business logic live:
- RLS-only client operations (simple, but can get messy)
- Server-side RPC/endpoints using service role (cleaner for awarding/payments)
- Task status modeling:
- Add statuses to enum (clean)
- Keep enum minimal and infer (risk of ambiguity)
- Attachments:
- Supabase Storage buckets + signed URLs
- Allowed types, max size, scanning strategy
- Admin/moderation role:
- Postgres roles/claims and server-side authorization strategy

---

## Acceptance Criteria

- [ ] Domain model documented with objects + fields we will support in v1.
- [ ] State machines documented with allowed transitions and who can trigger them.
- [ ] Postgres invariants listed and mapped to constraints/indexes/RPCs.
- [ ] Explicit decisions recorded for each "Open Decision" above.

---

## Dependencies

- Depends on: `docs/plans/urgent/2026-02-04-adr-architecture-path.md`
- Informs: Phase 1, Phase 2, Phase 3

---

## Progress Log

### 2026-02-04
- Captured current schema reality and proposed canonical state machines for tasks/bids/contracts/payments.

