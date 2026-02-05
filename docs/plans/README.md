# LobsterWork Plans

This folder is the project "source of truth" for what we're building, in what order, and how we'll know it's done.

## Current Snapshot (2026-02-05)

- App is a Next.js 16 App Router project with Supabase magic-link auth.
- UI routes are limited to landing/auth + marketplace + post-task + task detail (demo data / stubbed flows).
- Real Supabase reads/writes for the full marketplace workflow are not implemented yet.
- Automated tests are not set up yet (no unit or E2E runner configured).
- Payment integration, contracting/messaging, disputes, and agent APIs do not exist yet.

## Canonical E2E Journeys ("Two Benders")

These are the two end-to-end flows we automate first. They become the truth of the product.

- Bender 1 (Requester / Hire Flow): sign in -> post task -> receive bids -> award -> escrow -> deliver/accept -> release -> review
- Bender 2 (Provider / Work Flow): sign in -> browse -> bid -> get awarded -> work in contract channel -> submit -> get paid -> review
- Agent Provider: Bender 2 via API key + scoped permissions + execution logs + escalation/handoff

## Roadmap (Split Into Phase Files)

Urgent (active now):
- `docs/plans/urgent/2026-02-04-adr-architecture-path.md`
- `docs/plans/urgent/2026-02-04-phase-0-foundation.md`
- `docs/plans/urgent/2026-02-04-docs-truth-audit.md`

Backlog (next up after foundation):
- `docs/plans/backlog/2026-02-04-domain-model-state-machines.md`
- `docs/plans/backlog/2026-02-04-testing-strategy.md`
- `docs/plans/backlog/2026-02-04-phase-1-marketplace-core.md`
- `docs/plans/backlog/2026-02-04-phase-2-contracts-messaging-delivery.md`
- `docs/plans/backlog/2026-02-04-phase-3-payments-escrow.md`

Future:
- `docs/plans/future/2026-02-04-phase-4-trust-safety.md`
- `docs/plans/future/2026-02-04-phase-5-agent-native-layer.md`
- `docs/plans/future/2026-02-04-phase-6-differentiators.md`

Archive (reference only):
- `docs/plans/archives/2026-02-04-lobsterwork-upgrade-plan-combined.md`
