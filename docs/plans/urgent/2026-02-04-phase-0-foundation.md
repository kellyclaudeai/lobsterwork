# Task: Phase 0 - Foundation (Testable + Shippable Baseline)

**Status:** In Progress  
**Priority:** Critical  
**Created:** 2026-02-04  
**Updated:** 2026-02-05  
**Assigned:** Codex (Agent)

---

## Description

Before we add marketplace features, we need a baseline that reliably ships and can be trusted:

- Tests run locally and in CI without hacks.
- A minimal Playwright E2E smoke suite exists.
- Preview deployments exist (so we can test real flows).
- We have a deterministic seed/fixtures story for E2E.
- Documentation reflects reality.

This phase is where we remove the "demo fragility" and set up the rails we will build on for the rest of the roadmap.

---

## Why This Matters

- Marketplace products fail on race conditions and inconsistent state. We need CI and E2E from day one.
- Payments and agent APIs require server-side code and strong environment hygiene.
- Right now, automated tests are not configured and the UI doesn't match the docs; that destroys trust fast.

---

## Acceptance Criteria

- [x] Architecture path chosen and recorded: `docs/plans/urgent/2026-02-04-adr-architecture-path.md`
- [ ] CI pipeline exists and is green on main:
- [ ] lint
- [ ] typecheck
- [ ] unit tests
- [ ] Playwright smoke
- [ ] build
- [ ] Preview deploy exists for each PR (or an equivalent staging URL workflow).
- [ ] A deterministic seed/fixtures approach exists for E2E (no "click around manually" dependency).
- [ ] Docs are reconciled with reality (no claims about flows that don't exist yet): `docs/plans/urgent/2026-02-04-docs-truth-audit.md`

---

## Work Items

### 1) Choose Architecture (Gate)

- [x] Decide Option A vs B and document the reasoning: `docs/plans/urgent/2026-02-04-adr-architecture-path.md`
- [ ] Execute the decision to the point of having a deployable preview.

Implementation note:
- Option B (Next.js 16) is selected. We’ll use the App Router + server routes for Stripe/webhooks/agent APIs + `@supabase/ssr`.

### 2) Establish Testing Baseline

Current problem:
- No unit test runner is configured in the Next.js repo.

Work:
- [ ] Choose a unit test runner (Vitest or Jest) and make it green in CI.
- [ ] Add a route/navigation sanity test (App Router pages + key CTAs).
- [ ] Add a "headless" test command that is stable in CI (no watch mode).

Notes (context-driven):
- Keep tests aligned with real user journeys (route smoke and benders).

### 3) Add Playwright E2E (Smoke First)

- [ ] Add Playwright with a single smoke spec:
- [ ] landing page loads
- [ ] primary CTAs navigate correctly
- [ ] login/signup pages load
- [ ] marketplace route loads
- [ ] Add a CI-friendly way to run it (start server, run tests, stop server).

Selectors strategy:
- Prefer accessible queries (role + name) for stability.
- Add `data-testid` for any flaky UI elements (forms, dynamic lists).

### 4) CI/CD Pipeline + Preview Environments

- [ ] Add GitHub Actions workflow that runs the full suite on PRs and on main.
- [ ] Add preview deploys (Vercel recommended) with environment variables wired safely.
- [ ] Define dev vs staging vs prod configuration and secrets handling.

Proposed workflow gates:
- Fail if lint fails.
- Fail if typecheck fails.
- Fail if unit tests fail.
- Fail if Playwright smoke fails.
- Fail if build fails.

### 5) Seed/Fixtures Strategy (For Deterministic E2E)

- [ ] Decide how we seed test data:
- [ ] SQL seed script executed in staging
- [ ] API-based seeding helpers (server-side only)
- [ ] Supabase branching/preview DB strategy (if we adopt it)
- [ ] Cleanup/reset strategy so CI is repeatable
- [ ] Add "seed reset" commands for local and CI use.

Seed requirements for benders:
- At minimum, be able to create a requester, provider, one task, and one bid deterministically without email inbox dependency.

---

## Technical Notes

- Payments and agent APIs cannot live in the browser; they require server-side endpoints.
- We are on Next.js 16 App Router; use server routes for Stripe webhooks + agent APIs.
- Keep Supabase client usage limited to safe operations; privileged actions go through server routes.

---

## Dependencies

- Depends on: `docs/plans/urgent/2026-02-04-adr-architecture-path.md`
- Blocks: Phase 1 and beyond

---

## Progress Log

### 2026-02-04
- Created `docs/plans/` structure and split the combined roadmap into phase/task files.
- Verified current repo reality: marketplace uses demo data; tests not configured.

### 2026-02-05
- Architecture decision completed (Next.js 16 App Router).
