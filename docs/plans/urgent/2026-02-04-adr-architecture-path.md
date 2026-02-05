# Task: Decide Architecture Path (Next.js vs Modern SPA)

**Status:** Completed  
**Priority:** Critical  
**Created:** 2026-02-04  
**Updated:** 2026-02-05  
**Assigned:** Codex (Agent)

---

## Description

LobsterWork now ships as a Next.js 16 App Router project with direct Supabase client calls. That removes the CRA test/tooling blockers, but still leaves core requirements (payments, agent APIs, CI, and E2E) to implement.

- Payments require server-side Stripe secret keys + webhook endpoints.
- Agent APIs require server-side auth (API keys, scopes) and rate limiting.
- The current repo has no unit/E2E test runner configured yet.

We need to decide the architecture path before implementing Phase 0/1 work, because the decision changes how we build payments, APIs, auth, CI, and tests.

---

## Why This Matters

- Shipping payments or agent APIs in a pure browser app is a footgun (secrets + security).
- Testing infrastructure and CI/CD become wildly simpler once the platform choice is stable.
- The migration cost goes up the longer we build on the "wrong" foundation.

---

## Options

### Option A: Keep SPA, Modernize Tooling

What it means:
- Replace CRA with Vite (or equivalent) to unblock ESM/testing.
- Use serverless functions (Vercel/Netlify) for Stripe + agent APIs.
- Keep Supabase for DB/Auth, keep React Router.

Pros:
- Smaller migration surface area.
- Faster if the only goal is a "better demo".

Cons:
- Split brain between frontend and serverless API folder.
- More custom wiring for auth/session + RLS + server/serverless boundaries.

### Option B (Recommended): Migrate to Next.js 16 (Preferred Stack)

What it means:
- Move to Next.js App Router.
- Implement Stripe + agent APIs as server routes.
- Use `@supabase/ssr` for auth/session handling.

Pros:
- Natural home for Stripe webhooks, server-side auth, and agent APIs.
- Better CI/CD + preview deployments.
- Cleaner path to "production-grade marketplace".

Cons:
- Migration work now.
- Need to re-think routing and data fetching (client vs server components).

---

## Decision Drivers (How We Choose)

- Speed to a trustworthy Bender 1 + Bender 2 (not just a demo).
- Ability to safely implement Stripe webhooks + idempotency.
- Ability to implement agent API keys/scopes without leaks.
- CI reliability (unit + e2e).
- Deploy previews + staging environments.

---

## Recommendation

Choose **Option B (Next.js 16)** if the goal is a real marketplace with payments, disputes, and agents.

Choose **Option A** only if we explicitly want to avoid a migration and keep this as a fast, mostly-client demo.

---

## Decision Checklist (Quick Filter)

Pick **Option B** if:
- [x] We want Stripe webhooks and agent APIs implemented cleanly on the server.
- [x] We want preview deployments and staging to be first-class.
- [x] We expect to ship disputes/moderation and agent permissions, not just "tasks + bids".

Pick **Option A** if:
- [ ] We want the smallest change set and accept a split frontend/serverless structure.
- [ ] We want to keep React Router and a SPA mental model for now.
- [ ] We are okay treating payments/agent APIs as "later" work behind serverless endpoints.

---

## Migration Outline (What Actually Changes)

### Option A Outline (Vite SPA + Serverless API)

- [ ] Replace CRA build tooling with Vite.
- [ ] Replace Jest with Vitest (or another ESM-friendly runner).
- [ ] Keep React Router.
- [ ] Create serverless endpoints for:
- [ ] Stripe checkout/payment intent creation
- [ ] Stripe webhook handler
- [ ] Agent API key auth and scoped endpoints
- [ ] Ensure browser never receives service role keys.

### Option B Outline (Next.js 16 App Router)

- [x] Migrate pages/components into `app/` routes.
- [x] Replace React Router navigation with Next routing.
- [ ] Implement server routes for:
- [ ] Stripe endpoints + webhooks
- [ ] Agent APIs + rate limiting
- [ ] Use `@supabase/ssr` for auth/session, keep client components minimal.
- [ ] Decide which pages should be public/SEO (marketplace listing) vs private (contracts/payments).

--- 

## Acceptance Criteria

- [x] Decision recorded in this file under "Completion Notes" (Option A or B, and why).
- [ ] "Hello world" deployed preview for the chosen architecture.
- [ ] Test baseline works in CI for the chosen architecture (unit + e2e smoke).

---

## Dependencies

- Depends on: none
- Blocks: `docs/plans/urgent/2026-02-04-phase-0-foundation.md`

---

## Progress Log

### 2026-02-04
- Repo audit: CRA SPA + Supabase magic links; real marketplace CRUD not implemented; Jest failing with `react-router-dom` ESM/module resolution.

### 2026-02-05
- Decision: Option B (Next.js 16 App Router). App now lives in `app/` with Next routing.

---

## Completion Notes

Decision: **Option B (Next.js 16)**.
Reason: We need server routes for Stripe + agent APIs, and Next gives us a clean, unified surface for server/client concerns and reliable CI + preview deploys.
