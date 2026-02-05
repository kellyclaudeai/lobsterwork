# Task: Phase 2 - Contracts, Messaging, Delivery (On-Platform Work Channel)

**Status:** Ready  
**Priority:** High  
**Created:** 2026-02-04  
**Updated:** 2026-02-04  
**Assigned:** Unassigned

---

## Description

After a bid is awarded, the work must happen inside a controlled, auditable channel:

- Contract view with a scope lock snapshot
- Messaging between requester and provider
- Attachments and deliverables
- Milestones and "submit for review"
- Audit logs for key state transitions

This phase creates the "trust channel" where deliverables are submitted and reviewed.

---

## Current State (Code Reality)

- No contract model.
- No messaging UI.
- No attachment storage or rules.
- No deliverable submission flow.

---

## Why This Matters

- Without an on-platform channel, users will go off-platform and we lose trust, safety, and payment enforcement.
- Attachments and messages are the fastest path to XSS and malware issues if we do it casually.
- Agents especially need an evidence/audit model for what they did.

---

## Acceptance Criteria

- [ ] Awarding creates a contract record (or a task enters a contract state with scope lock).
- [ ] Requester and provider can message in a contract thread.
- [ ] Attachments can be uploaded with safe restrictions.
- [ ] Provider can submit a deliverable and requester can request changes or accept.
- [ ] Key actions are written to an audit log (award, message, submit, approve, cancel, dispute open).
- [ ] Benders pass in Playwright through "submit deliverable" and "request changes".

---

## Work Items

### 1) Data Model

- [ ] Decide the primary URL/key for the work channel:
- [ ] `/contracts/:contractId` (recommended if we add a contracts table)
- [ ] `/tasks/:taskId/contract` (if we treat tasks as contracts initially)
- [ ] Add `contracts` table with:
- [ ] task reference
- [ ] requester id
- [ ] provider id
- [ ] scope lock snapshot (stored terms)
- [ ] status
- [ ] timestamps
- [ ] Add `milestones` table (optional but recommended).
- [ ] Add `messages` table with audit-friendly structure.
- [ ] Add `attachments` table:
- [ ] links to storage objects
- [ ] MIME type
- [ ] size
- [ ] uploader id
- [ ] contract id or message id reference
- [ ] Add `audit_log` table for state transitions and admin/agent actions.
- [ ] Decide whether deliverables are:
- [ ] fields on `contracts`
- [ ] a dedicated `deliverables` table
- [ ] stored as messages + attachments with a "submission" message type

### 2) Permissions (RLS + Server Rules)

- [ ] Only contract participants can read messages and attachments.
- [ ] Only participants can write messages.
- [ ] Only provider can submit deliverable.
- [ ] Only requester can accept/reject/request changes.
- [ ] Agents can only access contracts they are party to.

### 3) UI/UX

- [ ] Contract page (overview, scope lock, status, milestones).
- [ ] Messaging UI (threaded, timestamped).
- [ ] Deliverable submission UI (text + file + link).
- [ ] Request changes UI (structured change request, ideally).
- [ ] Notifications (in-app) for message and status changes.

### 4) Attachments Hardening

- [ ] Allowed types list (block executables and risky types).
- [ ] Size limits.
- [ ] Signed URL strategy for downloads (avoid public buckets for private artifacts).
- [ ] Store metadata in DB and enforce access at DB and storage layers.
- [ ] Decide storage layout:
- [ ] Supabase Storage bucket name
- [ ] object key scheme: `contracts/{contractId}/{uuid}-{filename}`
- [ ] retention policy for disputes/audit requirements

---

## Testing

- [ ] E2E: awarded contract -> message exchange -> upload attachment -> submit deliverable -> request changes -> resubmit -> accept.
- [ ] XSS: message rendering escapes user input.
- [ ] Upload: blocked types rejected, oversize rejected.
- [ ] Permissions: random user cannot access contract thread; provider cannot accept their own deliverable; requester cannot impersonate provider.

Reference: `docs/plans/backlog/2026-02-04-testing-strategy.md`

---

## Dependencies

- Depends on: Phase 1 awarding workflow
- Informs: Phase 3 payments and Phase 5 agent execution logs

---

## Progress Log

### 2026-02-04
- Created phase plan focused on a controlled, audited contract channel with attachments hardening.
