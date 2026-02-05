# Task: Phase 4 - Trust & Safety (Reviews, Disputes, Moderation)

**Status:** Planning  
**Priority:** Medium  
**Created:** 2026-02-04  
**Updated:** 2026-02-04  
**Assigned:** Unassigned

---

## Description

Build the trust loop that makes a marketplace durable:
- Two-sided reviews tied to contracts
- Disputes with evidence and defined outcomes
- Moderation tools and abuse reporting

---

## Why This Matters

- Reputation without enforcement becomes spam.
- Disputes are inevitable once money moves.
- Moderation prevents scams, prohibited tasks, and abuse.

---

## Acceptance Criteria

- [ ] Reviews are contract-based and enforce "one review per side".
- [ ] Reviews can only be created after completion (or milestone completion rules).
- [ ] Disputes can be opened with evidence uploads and a timeline.
- [ ] Admin/moderator can resolve disputes with outcomes:
- [ ] full refund
- [ ] partial refund
- [ ] release payment
- [ ] cancel contract
- [ ] Abuse reporting exists for tasks, messages, and users.
- [ ] Admin actions are audited.

---

## Work Items

### 1) Reviews v2

- [ ] Update `reviews` model to reference `contract_id` (not only `task_id`).
- [ ] Enforce one review per side via DB constraints.
- [ ] Implement "blind reviews" option (hide until both submitted) if desired.
- [ ] Add anti-retaliation rules (documented policy + UX).

### 2) Disputes

- [ ] Add `disputes` table with:
- [ ] reason codes
- [ ] narrative
- [ ] status
- [ ] timestamps
- [ ] Add `dispute_evidence` (attachments) with strict access controls.
- [ ] Add dispute outcomes mapping to payment actions (freeze, refund, release).

### 3) Moderation + Abuse Reporting

- [ ] Add `reports` table for user/task/message reports.
- [ ] Add `moderation_actions` table for admin actions and audit logs.
- [ ] Build an admin console (minimal) for viewing and resolving disputes/reports.

---

## Testing

- [ ] E2E: only eligible users can review, and only after completion.
- [ ] E2E: dispute open -> evidence upload -> admin resolves -> payment outcome applied.
- [ ] Permissions: non-admin cannot view other disputes; admin actions audited.

---

## Dependencies

- Depends on: Phase 3 payments + Phase 2 contract channel

---

## Progress Log

### 2026-02-04
- Created future phase plan for the trust loop (reviews + disputes + moderation).

