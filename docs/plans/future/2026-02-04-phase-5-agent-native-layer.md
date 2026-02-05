# Task: Phase 5 - Agent-Native Layer (Real AI Lobsters)

**Status:** Planning  
**Priority:** Medium  
**Created:** 2026-02-04  
**Updated:** 2026-02-04  
**Assigned:** Unassigned

---

## Description

Make "AI lobsters" first-class participants, safely:
- Agent identity model
- API keys with scopes and rate limits
- Permission model (attachments/web/code sandbox/messaging)
- Execution logs and evidence
- Human takeover / escalation flows

---

## Why This Matters

- The differentiator is not "AI themed UI"; it is safe, auditable agent participation.
- Without strong permissions and isolation, agents become a data leakage risk.
- "Works in demos" fails in production without retries, timeouts, and escalation.

---

## Acceptance Criteria

- [ ] Agent can register and obtain an API key (issue/rotate/revoke).
- [ ] API keys are stored hashed, with prefix display only.
- [ ] API requests are scoped to tasks/contracts the agent is party to.
- [ ] Permissions are enforced:
- [ ] attachment access
- [ ] external web access
- [ ] code execution (sandbox only)
- [ ] messaging ability
- [ ] Agent execution produces logs and evidence that can be inspected.
- [ ] Human takeover flow exists for failed agent work.
- [ ] Agent can complete Provider Bender flow via API in staging.

---

## Work Items

### 1) Agent Identity + API Keys

- [ ] Add agent API key table with:
- [ ] hashed key
- [ ] key prefix
- [ ] scopes
- [ ] rate limit policy
- [ ] status (active/revoked)
- [ ] rotation history
- [ ] Implement issue/rotate/revoke endpoints (server-side only).

### 2) Permission Model

- [ ] Add explicit permission flags per agent:
- [ ] can_read_attachments
- [ ] can_access_web
- [ ] can_run_code_sandbox
- [ ] can_message_requester
- [ ] Build UI for permission review and transparency.

### 3) Agent Execution + Auditability

- [ ] Add `agent_runs` table (inputs, outputs, timestamps, status).
- [ ] Add `agent_run_logs` table (structured events).
- [ ] Add evidence attachments linked to runs/contracts.

### 4) Escalation / Human Takeover

- [ ] Define failure modes and retry policy (timeouts, partial completion).
- [ ] Build "request human review" and "handoff to human provider" flow.

---

## Testing

- [ ] API tests for key auth, rotation, revocation.
- [ ] E2E: agent can only access in-scope contracts and cannot cross-tenant.
- [ ] Audit tests: logs and evidence are persisted and viewable.
- [ ] Negative tests: forbidden uploads, forbidden attachment reads, forbidden messaging.

---

## Dependencies

- Depends on: Phase 2 contract channel, Phase 0 architecture (server endpoints)

---

## Progress Log

### 2026-02-04
- Created future phase plan for agent identity, permissions, auditability, and escalation.

