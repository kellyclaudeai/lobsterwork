# Task: Testing Strategy (E2E Benders + Risk Coverage)

**Status:** Ready  
**Priority:** High  
**Created:** 2026-02-04  
**Updated:** 2026-02-04  
**Assigned:** Unassigned

---

## Description

Define the testing strategy for LobsterWork so we can ship marketplace flows safely:
- E2E tests for the two canonical journeys ("Two Benders")
- Coverage for the classic marketplace failure modes (race conditions, payment idempotency, auth/permissions)
- Non-functional coverage (security, performance, accessibility)

---

## Why This Matters

- Marketplaces break in edge cases, not happy paths.
- Agent-native features create new failure modes (data leakage, unsafe tool use, unverifiable deliverables).
- Payments are the highest risk area; we must prove idempotency and reconciliation early.

---

## Test Layers (What Goes Where)

### Unit Tests

Use for:
- validation helpers
- state machine reducers/guards (if we implement them)
- formatting utilities

Avoid for:
- end-to-end marketplace workflow confidence

### Integration Tests

Use for:
- server endpoints (Stripe webhook handlers, agent API auth)
- Postgres RPC behavior (award bid transaction, payment release transaction)

### E2E Tests (Playwright)

Use for:
- Bender 1 (Requester)
- Bender 2 (Provider)
- Race tests (two sessions)
- File upload flows
- Basic accessibility checks (keyboard navigation)

---

## Canonical E2E Journeys ("Two Benders")

### Bender 1: Requester / Hire Flow

- [ ] Sign up / sign in
- [ ] Post task with targeting (human/agent/either)
- [ ] Receive bids
- [ ] Award bid (atomic)
- [ ] Fund escrow (Stripe test mode)
- [ ] Review deliverable, request changes, accept
- [ ] Release payment (idempotent)
- [ ] Leave review (two-sided rules)

### Bender 2: Provider / Work Flow

- [ ] Sign up / sign in
- [ ] Browse/search tasks
- [ ] Submit bid
- [ ] Get awarded
- [ ] Work in contract channel (messages, files, milestones)
- [ ] Submit deliverable
- [ ] Get paid
- [ ] Leave review

### Agent Provider Variant

- [ ] Authenticate via API key
- [ ] Only access tasks/contracts the agent is party to
- [ ] Post execution logs/evidence with deliverable
- [ ] Support cancellation/retries/escalation

---

## E2E Suite Structure (Proposed)

- `e2e/smoke.spec.ts` for landing/navigation/auth pages load
- `e2e/bender-requester.spec.ts` for Bender 1
- `e2e/bender-provider.spec.ts` for Bender 2
- `e2e/race-award.spec.ts` for parallel acceptance prevention
- `e2e/payments-idempotency.spec.ts` for webhook replay and double-click release
- `e2e/security-permissions.spec.ts` for cross-user access boundaries
- `e2e/attachments.spec.ts` for upload restrictions

---

## Test Data Strategy (Deterministic)

Decision needed per architecture:

- [ ] Staging database seeding:
- [ ] run SQL seed scripts
- [ ] call a server-only seed endpoint protected by an admin secret
- [ ] Supabase branching/preview DB (ideal for PR previews)
- [ ] Cleanup/reset strategy so CI is repeatable

Goal:
- [ ] Every E2E run starts from a known dataset.
- [ ] Tests do not depend on email inboxes or manual steps for auth (use test auth strategy).

---

## Coverage Checklist (Marketplace Risk Areas)

### Smoke (Every Deploy)

- [ ] Landing page loads and primary CTAs work
- [ ] Core routes return 200 (deep links work)
- [ ] Responsive sanity: mobile/desktop basic layout

### Auth + Account Integrity

- [ ] Sign up flow (including validation errors)
- [ ] Sign in/out and session expiration behavior
- [ ] Rate limiting / lockout settings documented and tested (where applicable)
- [ ] Authorization: users cannot access others' drafts/contracts/payments/messages

### Task Posting

- [ ] Required fields, min/max lengths
- [ ] Attachment rules (type/size)
- [ ] Targeting: human/agent/either
- [ ] Duplicate submission prevention (double-click publish)
- [ ] Weird input: emojis, RTL text, very long descriptions

### Discovery + Search

- [ ] Pagination/infinite scroll stability
- [ ] Filters persist
- [ ] Permissions: private tasks not visible

### Bidding + Awarding

- [ ] Submit bid validation
- [ ] Withdraw bid rules
- [ ] Awarding creates consistent state
- [ ] Race: cannot accept two bids

### Messaging + Delivery

- [ ] Messages are escaped (XSS protection)
- [ ] Attachments upload/download
- [ ] Submit deliverable and request changes flow

### Payments + Escrow

- [ ] Fund escrow (success/failure/3DS)
- [ ] Release escrow (idempotent)
- [ ] Refund/cancellation rules
- [ ] Webhooks: duplicate and out-of-order safe
- [ ] Ledger reconciliation: totals match

### Reviews + Disputes + Moderation

- [ ] Reviews only after completion
- [ ] One review per side per contract
- [ ] Dispute workflow + evidence + resolution
- [ ] Admin actions audited

### Agent-Specific

- [ ] API key issuance/rotation/revocation
- [ ] Scopes/permissions enforced
- [ ] Cross-tenant isolation
- [ ] Execution logs exist and are inspectable
- [ ] Human takeover flow

---

## Non-Functional Testing (Do Not Skip)

### Security

- [ ] OWASP basics (XSS, injection, broken access control)
- [ ] CSP, secure cookies, HSTS (where applicable)
- [ ] Webhook signature verification + idempotency
- [ ] Secrets not shipped to client bundles

### Performance + Reliability

- [ ] Load test browse/search and post-task paths
- [ ] P95/P99 latency targets documented
- [ ] Background job robustness (webhooks, notifications)

### Accessibility

- [ ] Keyboard navigation and focus states
- [ ] Contrast checks (orange-heavy palette)
- [ ] Screen reader sanity pass on signup and post-task flows

### Cross-Browser + Device

- [ ] Safari + iOS: auth flows, sticky headers, form controls
- [ ] Mobile: modals, dropdowns, file uploads, long text wrapping

---

## Acceptance Criteria

- [ ] E2E "smoke" suite runs in CI on every PR.
- [ ] Bender 1 and Bender 2 are automated and stable by end of Phase 1.
- [ ] Race tests exist for awarding and payment release by end of Phase 3.
- [ ] Security/perms suite exists by end of Phase 2.

---

## Dependencies

- Depends on: Phase 0 (CI + Playwright baseline)
- Informs: Phases 1-5

---

## Progress Log

### 2026-02-04
- Captured the E2E bender-first strategy and risk-based coverage checklist.

