# Task: Docs Truth Audit (Kill Drift, Make Claims Accurate)

**Status:** Ready  
**Priority:** High  
**Created:** 2026-02-04  
**Updated:** 2026-02-05  
**Assigned:** Codex (Agent)

---

## Description

Several docs in `projects/lobsterwork/` currently claim features that are not implemented in the UI/routes yet (task posting, bidding flows, reviews, etc.). This is normal in fast MVPs, but it becomes dangerous as soon as we add testers or deploy previews.

We need to make documentation accurate, explicit about "demo vs real", and aligned with the roadmap in `docs/plans/`.

---

## Why This Matters

- Trust: testers and contributors will assume features exist if docs say so.
- Velocity: drift creates "phantom requirements" and wasted debugging.
- Launch readiness: "production ready" claims should be backed by tests and real flows.

---

## Scope (Files To Audit First)

- [ ] `README.md`
- [ ] `PRODUCTION-READY.md`
- [ ] `DESIGN-SYSTEM.md`
- [ ] `CREDENTIALS.md`
- [ ] Any new docs added under `docs/` or root that mention features/flows

---

## Acceptance Criteria

- [ ] Docs clearly state what is implemented today vs planned.
- [ ] Any "production ready" claim is removed or backed by:
- [ ] working CI
- [ ] working E2E benders (at least Phase 1)
- [ ] tested deployment process
- [ ] Each doc links to `docs/plans/README.md` for the authoritative roadmap.
- [ ] "Demo Mode" behavior is documented (if used, prefer `NEXT_PUBLIC_DEMO_MODE`).

---

## Work Items

### 1) Create a "Reality Check" Section in `README.md`

- [ ] Explicitly list implemented routes/pages.
- [ ] Explicitly list missing core marketplace flows (post task, bid, award, contracts, payments).
- [ ] Add a "Roadmap" link to `docs/plans/README.md`.

### 2) Normalize Environment/Ports/URLs

Right now, docs mention both `:3000` and `:3001`.

- [ ] Standardize on one dev port and update docs.
- [ ] Ensure smoke tests print the correct URL.

### 3) Remove/Adjust Overclaims

- [ ] Replace "Production Ready" language with "Demo / Staging" until Phase 0 exit criteria are met.
- [ ] If we keep any readiness claim, pin it to a specific checklist and date.

---

## Dependencies

- Depends on: none
- Blocks: external sharing / onboarding contributors

---

## Progress Log

### 2026-02-04
- Identified drift: UI is landing/auth + demo marketplace, while docs claim task posting/bidding/reviews are complete.
