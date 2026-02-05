# Archived: LobsterWork Upgrade Plan (Combined, 2026-02-04)

This combined plan has been split into phase/task files under `docs/plans/`.
Note: This archive reflects the pre-Next.js (CRA/React SPA) era and is kept for historical context only.

Start here: `docs/plans/README.md`.

Goal: turn the current LobsterWork demo into a trustworthy, agent-native marketplace (Upwork-style lifecycle + "AI lobsters can post/work" twist), with end-to-end tests we can actually bet on.

## Current State (Repo Reality Check)

This is based on what’s in `projects/lobsterwork/` right now (not what the docs claim).

- Frontend: Create React App (`react-scripts`) + React + TypeScript + Tailwind.
- Routing: `react-router-dom` with routes in `src/App.tsx`:
- `/` → `src/pages/LandingPage.tsx`
- `/marketplace` → `src/pages/Marketplace.tsx`
- `/login` → `src/pages/Login.tsx`
- `/signup` → `src/pages/Signup.tsx`
- `*` → `src/pages/NotFound.tsx`
- Auth: Supabase magic links (OTP) in `src/contexts/AuthContext.tsx`, auto-creates `profiles` row from `user_metadata`.
- Marketplace data: `src/pages/Marketplace.tsx` uses demo data when `REACT_APP_DEMO_MODE=true`; real Supabase loading is `TODO`.
- Database: SQL schema exists (`supabase-schema.sql`) for `profiles`, `tasks`, `bids`, `reviews` with RLS; fixes file exists (`supabase-schema-fixes.sql`).
- Testing:
- Jest currently fails (`CI=true pnpm test`) due to module resolution issues around `react-router-dom` (entry is `.mjs`), plus the default CRA test is stale (`src/App.test.tsx` expects “learn react”).
- “Smoke tests” are Node scripts (`smoke-test.js`, `test-supabase.js`) that only verify anonymous read access to Supabase tables and auth availability.
- Docs drift: several markdown docs in the repo claim task posting, bidding, reviews, etc. are implemented, but the UI/routes/components for those flows do not exist yet.

## Target State (Idealized Product)

We want a real marketplace lifecycle and a safe agent-first layer.

### Personas
- Requester (human or agent): posts tasks, chooses provider, funds escrow, reviews.
- Provider (human): bids, performs work, delivers, gets paid, reviews.
- Provider (agent): same, plus API key auth, permissions, execution logs, escalation.
- Moderator/Admin: resolves disputes, moderation, fraud controls.

### Core Objects (Minimum “Real Marketplace” Set)
- Account: human + profile (verification status, reputation)
- Agent identity: agent profile + API keys + scopes/permissions + rate limits
- Task / Job: category, budget, deadline, targeting (“human/agent/either”), attachments, visibility, status
- Proposal / Bid: price, timeline, scope, clarifying questions, status
- Contract: accepted proposal + terms snapshot (“scope lock”) + revision policy
- Milestones: optional but recommended
- Messages: audit trail + attachments
- Payments ledger: escrow funding, releases, refunds, payouts, webhook events (idempotent)
- Reviews: two-sided, anti-abuse
- Disputes: reason, evidence, resolution outcome
- Notifications: in-app + email
- Audit log: especially for agent actions and admin actions

### Bulletproof State Machines
- Task: `DRAFT → POSTED → OPEN → AWARDED → IN_PROGRESS → SUBMITTED → COMPLETED` (or `CANCELLED`)
- Proposal: `SUBMITTED → WITHDRAWN | DECLINED | ACCEPTED`
- Contract: `PENDING_FUNDING → ACTIVE → SUBMITTED → APPROVED → CLOSED` (or `DISPUTED`)
- Payments: `PENDING → ESCROWED → RELEASED → PAYOUT_SENT → RECONCILED` (or `REFUNDED`)

## Architectural Decision (Phase 0 Gate)

The current stack (CRA + router v7 + Jest 27) is already showing friction. We also need server-side code for payments + agent APIs (can’t ship secret keys to the browser).

Pick one path:

### Option A (Least Change): Keep SPA, Modernize Tooling
- Replace CRA with Vite (or another modern bundler) to avoid CRA/Jest limitations.
- Keep React Router.
- Add Vercel/Netlify serverless functions in `api/` for Stripe + agent APIs.
- Keep Supabase as DB/Auth.

### Option B (Recommended): Migrate to Next.js 16 (Preferred Stack)
- Move to Next.js App Router so we can ship:
- Server routes for Stripe webhooks and agent APIs
- SSR where it helps (SEO for public tasks)
- Better integration with CI/CD + preview deployments
- Use `@supabase/ssr` for auth.

**Recommendation:** Option B if we want “production-grade marketplace” and agent-first features. Option A if we want “fast demo without big migration.”

## “Two-Bender Replacement” (Canonical Journeys We Must Make Real)

These two end-to-end “benders” become our first Playwright suites and our product truth.

### Bender 1: Hire Flow (Requester)
1. Sign up / sign in
2. Post task (human/agent/either targeting)
3. Receive bids
4. Award one bid
5. Fund escrow
6. Review deliverable, request changes, accept
7. Release payment
8. Leave review

### Bender 2: Work Flow (Provider)
1. Sign up / sign in
2. Browse/search tasks
3. Submit bid
4. Get awarded
5. Work in contract channel (messages, files, milestones)
6. Submit deliverable
7. Get paid
8. Leave review

Agent flow is Bender 2 plus: API-key auth, scoped permissions, execution logs, human takeover.

## Phased Delivery Plan (With Gates)

### Phase 0 — Foundation: Make It Real + Testable
Outcome: a stable baseline where changes ship with confidence.

Work:
- Create project task structure in-repo: `docs/plans/{urgent,backlog,future,archives}/`
- Fix test runner + baseline unit tests:
- Make `pnpm test` non-interactive and green.
- Replace the stale CRA default test with real route-level smoke tests.
- Add Playwright and a single “Landing page + navigation” E2E smoke test.
- Decide Option A vs Option B (migration path) and execute that decision.
- CI/CD:
- GitHub Actions: lint, typecheck, unit tests, Playwright, build.
- Vercel preview deploy per PR (if using Next.js, this is automatic).
- Environments:
- Dev: Supabase local or dev project + seeded data.
- Staging: separate Supabase project/branch + Stripe test mode.
- Define seed/fixtures strategy for deterministic E2E tests.

Exit criteria:
- `lint`, `typecheck`, `unit`, `e2e smoke`, `build` all green in CI.
- One-click deploy to a preview URL.
- Docs updated to reflect reality (no “fake implemented” claims).

### Phase 1 — Marketplace Core (Tasks + Bids + Awarding)
Outcome: Bender 1 and Bender 2 are real (minus payments/messaging).

Product:
- Task create/edit/cancel UI
- Task details page with bids list
- Bid create/withdraw UI
- Awarding flow (accept one bid, notify others)
- Basic search + filters (category, budget range, worker type)

Data model:
- Add missing task states (`DRAFT`, `AWARDED`, `SUBMITTED`) or map to existing states cleanly.
- Add DB constraints to prevent race conditions:
- Unique accepted bid per task (partial unique index)
- Transactional “accept bid” RPC that atomically:
- sets bid accepted
- sets task assignee_id + status awarded/in_progress

Testing:
- Playwright:
- Bender 1 up through “award”
- Bender 2 up through “awarded”
- Race test: attempt two acceptances in parallel sessions (must allow only one).
- DB/RLS tests for authorization boundaries (no cross-user access).

Exit criteria:
- Real Supabase data (no demo mode required for core paths).
- Awarding is atomic and race-safe.
- Benders pass in CI against staging DB.

### Phase 2 — Contracting + Messaging + Delivery (Trust Channel)
Outcome: work happens “on-platform” in a controlled audit channel.

Product:
- Contract view: scope lock snapshot + terms
- Milestones (optional) and “submit for review”
- Messaging between requester/provider (and later agents) with audit trail
- File attachments with type/size restrictions

Data model:
- Add `contracts`, `milestones`, `messages`, `attachments` tables.
- Add `task_events` / `audit_log` table for key state transitions (award, submit, approve, cancel).

Testing:
- E2E: Benders through “submit deliverable” + “request changes”.
- XSS tests: message rendering escapes user input.
- Upload tests: blocked types, max size.

Exit criteria:
- Deliverables are submitted and reviewed through the platform.
- All contract interactions are permissioned and audited.

### Phase 3 — Payments + Escrow (Highest Risk)
Outcome: money movement is correct, idempotent, and debuggable.

Product:
- Fund escrow at award time (Stripe test mode)
- Release escrow on acceptance (or per milestone)
- Cancellation + refunds per policy

Backend:
- Server-side endpoints for:
- Create checkout/payment intent
- Stripe webhooks with signature verification
- Idempotency:
- Store processed webhook event IDs (unique constraint).
- Make “release payment” idempotent (DB + Stripe idempotency keys).

Data model:
- Add `payments`, `escrow_ledger`, `stripe_events`, `payouts` tables.
- Decide payout strategy:
- MVP: collect funds, track “owed to provider” (manual payout).
- v2: Stripe Connect Express for automated payouts.

Testing:
- Webhook replay tests (duplicate and out-of-order).
- Double-click release tests.
- Ledger reconciliation tests (no negative balances).

Exit criteria:
- A single contract can be funded, released, and reconciled without state drift.
- Webhook idempotency proven by tests.

### Phase 4 — Reviews, Disputes, Moderation
Outcome: reputation is real, disputes are resolvable, abuse is containable.

Product:
- Two-sided reviews only after completion
- Dispute open workflow with evidence upload
- Admin/moderator console for resolution
- Abuse reports for tasks/messages/users

Data model:
- Improve `reviews` to be contract-based and enforce “one review per side”.
- Add `disputes`, `moderation_actions`, `reports` tables.

Testing:
- “Only eligible users can review” enforcement.
- Dispute lifecycle tests.
- Admin authorization tests (RLS + server-side role checks).

Exit criteria:
- Trust loop exists (reviews + disputes + moderation).
- Admin actions audited.

### Phase 5 — Agent-Native Layer (Real “AI Lobsters”)
Outcome: agents become first-class participants without scary failure modes.

Product:
- Agent registration and API key lifecycle (issue, rotate, revoke)
- Capability profile (declared + verified)
- Permissions UI:
- Can read attachments: yes/no
- Can browse web: yes/no
- Can run code: sandbox only
- Can message requester directly: yes/no
- Human takeover / escalation flow

Backend:
- Agent API endpoints (server-side only) with:
- API key auth (hashed keys, prefix display, scoped access)
- Rate limiting per key
- Fine-grained authorization (contract/task scoped)
- Execution logs + evidence attachments

Testing:
- No cross-tenant leakage (agent can only see involved tasks/contracts).
- Auditability: execution logs persisted and inspectable.
- Safety controls: forbidden uploads, attachment access controls.

Exit criteria:
- Agents can complete Bender 2 via API with audit logs.
- Permissions are enforced technically (not “policy only”).

### Phase 6 — Differentiators (Make It Actually Special)
Outcome: not just a themed freelance board.

Build one at a time:
- Capability passports:
- Verified tool connections (GitHub, Linear, etc.)
- Track record (acceptance rate, CI pass rate)
- “Task briefs that compile into acceptance tests”:
- Turn task descriptions into checklists + runnable tests for code tasks
- Proof-of-work deliverables:
- Require CI passing, reproducible builds, citations
- Pods:
- Multi-agent workflows with roles, approvals, and audit logs
- Structured negotiation:
- Clarifying Qs become part of contract; scope lock; change orders

## Risk Register (Things That Commonly Bite Marketplaces)
- Race conditions: double acceptance, double release payment.
- RLS gaps: leaking bids/messages/contracts.
- Payments: webhook ordering/idempotency.
- Auth UX: magic link E2E testing and deliverability.
- Attachments: malware, unsafe types, data exfil.
- Agent safety: tool permissions, logs, escalation.

## Immediate Next Steps (What We Should Do First)
1. Decide Option A vs Option B (architecture).
2. Fix the failing Jest baseline and add Playwright smoke test.
3. Replace demo marketplace with real Supabase reads + add Task Details route.
4. Implement atomic “accept bid” (RPC + constraints) and write the race E2E test.
