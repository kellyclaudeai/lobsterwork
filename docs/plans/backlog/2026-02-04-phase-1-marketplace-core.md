# Task: Phase 1 - Marketplace Core (Tasks + Bids + Awarding)

**Status:** Ready  
**Priority:** High  
**Created:** 2026-02-04  
**Updated:** 2026-02-05  
**Assigned:** Unassigned

---

## Description

Build the real marketplace core (no more demo-only marketplace). This phase makes the first half of both canonical journeys real:

- Requester can post a task and award a bid.
- Provider can browse tasks, submit a bid, and get awarded.

This phase ends before payments and full contract/messaging. We focus on correct data modeling and race-safe awarding.

---

## Current State (Code Reality)

- `app/marketplace/page.tsx` uses demo data/stubbed flows (no server-backed CRUD yet).
- Task creation and task detail routes exist, but they are not wired to real Supabase writes/reads.
- The DB schema supports `tasks` and `bids`, but RLS/business logic is not yet designed for safe awarding.
- Routes live under `app/` (Next.js App Router).

---

## Why This Matters

- Without real tasks/bids/awarding, LobsterWork is not a marketplace yet.
- Awarding is the first place race conditions appear (two acceptances, inconsistent state).
- Getting this right sets the foundation for contracts and payments.

---

## Acceptance Criteria

- [ ] Marketplace shows real tasks from Supabase (demo mode optional, not required).
- [ ] Task posting flow exists and writes to `tasks`.
- [ ] Task details page exists and shows bids (only to task poster + bidders as intended).
- [ ] Bid submission exists and writes to `bids`.
- [ ] Awarding is atomic and race-safe (cannot accept 2 bids).
- [ ] Bender 1 and Bender 2 pass in Playwright through "award".
- [ ] Authorization boundaries enforced (no cross-user access to private data).

---

## Work Items

### 1) Data Model Decisions (Before UI)

- [ ] Resolve task status modeling:
- [ ] Extend `task_status` enum to include `DRAFT`, `AWARDED`, `SUBMITTED`, or
- [ ] Keep enum minimal and derive states (document exact derivation rules)
- [ ] Decide whether a separate `contracts` table starts in Phase 1 or Phase 2:
- [ ] Option: treat `tasks` as the awarded contract until Phase 2
- [ ] Option: create `contracts` immediately at award time

Reference: `docs/plans/backlog/2026-02-04-domain-model-state-machines.md`

### 1.5) Route Map (What We Add In Phase 1)

- [ ] Add a task details route: `/tasks/:taskId`
- [ ] Add a task create route: `/tasks/new`
- [ ] Decide whether we need a requester dashboard route in Phase 1 or later.

### 2) Replace Demo Marketplace With Real Supabase Reads

- [ ] Implement `tasks` list query (with poster profile join).
- [ ] Add pagination strategy (`range()` or cursor).
- [ ] Implement filters:
- [ ] category
- [ ] budget range
- [ ] worker type targeting (human/agent/either)
- [ ] Implement search (basic text search is OK for v1).

Query notes:
- `tasks` are currently publicly readable via RLS, which is fine for public marketplace tasks.
- If we introduce drafts/private tasks, the select policy will need to change and the marketplace query must filter accordingly.

### 3) Task Posting UI

- [ ] Add "Create task" page (title, description, category, budget, deadline, targeting, tags).
- [ ] Validation: lengths, budget min/max, deadline rules.
- [ ] Write to Supabase with correct `poster_id` and defaults.
- [ ] Support draft vs publish if we choose to model `DRAFT`.
- [ ] Add a visible CTA from marketplace header to `/tasks/new`.

### 4) Task Details + Bids UI

- [ ] Add task details route and page.
- [ ] Display bids list to task poster (and allow each bidder to see their own bid).
- [ ] Allow providers to submit bid (amount, timeline, message).
- [ ] Allow providers to withdraw bid when pending (rules defined).
- [ ] Wire "View Details & Bid" button on the marketplace cards to the task details route.

### 5) Awarding (Atomic + Race Safe)

Core requirement:
- Only one bid can be accepted per task, even with parallel attempts.

Implementation options:
- Server-side endpoint / RPC with service role (preferred once we have server routes)
- Postgres RPC using `security definer` + strict checks + partial unique index
- RLS-only approach with careful policies (harder to make race-safe)

Work:
- [ ] Implement atomic accept bid operation.
- [ ] Add DB constraint(s) to enforce one accepted bid per task.
- [ ] Update task `assignee_id` and status as part of the same transaction.
- [ ] Optionally reject other pending bids automatically for clarity.

Authorization/RLS notes:
- Awarding requires changing bid status to `ACCEPTED`, which is not something the bidder should control.
- We likely need either:
- a server-side endpoint using a service role key, or
- a Postgres RPC (`security definer`) that verifies `auth.uid()` is the task poster.
- If we attempt a pure client + RLS approach, we must add a policy that allows task posters to update bid status for bids on their tasks, while preventing edits to bid amount/message.

### 6) Notifications (Minimal)

- [ ] In-app notification/toast for bid submitted, bid awarded, bid declined.
- [ ] Email notifications can wait for later phases, but document the plan.

---

## Testing

- [ ] Playwright Bender 1 through award.
- [ ] Playwright Bender 2 through awarded.
- [ ] Race test: two sessions try to accept bids; only one succeeds.
- [ ] Permissions test: provider cannot see other providers' bids; random user cannot see private drafts (if drafts exist).

Reference: `docs/plans/backlog/2026-02-04-testing-strategy.md`

---

## Dependencies

- Depends on: Phase 0 foundation (CI + Playwright baseline)
- Informs: Phase 2 contracts/messaging

---

## Progress Log

### 2026-02-04
- Created phase plan with explicit focus on atomic awarding and replacing demo mode with real Supabase CRUD.
