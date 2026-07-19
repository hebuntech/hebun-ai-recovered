# Baseline Metadata (S0)

**S0 baseline generated** by `drizzle-kit generate` (offline, no DB connection):
`20260711173046_foundation_baseline.sql` + `meta/20260711173046_snapshot.json`,
journal entry idx 0. **Not applied** — no `migrate`, no `push`, no database. S1
(inert canonical enums) is **absorbed into S0** (no prior migration history).

This `BASELINE.md` lives in the migrations **root**, not in `meta/` — Drizzle
scans `meta/` strictly for JSON snapshots and rejects non-JSON files there.

## Baseline snapshot (generated S0)

- **ORM / tooling:** drizzle-orm 0.45, drizzle-kit 0.31 (config: `drizzle.config.ts`).
- **Dialect:** postgresql (Supabase target). **No live connection.**
- **Schema entry:** `src/db/schema/index.ts` (barrel of all tables + enums).
- **Migrations generated:** **1** (`0000` foundation baseline) — 538 lines,
  27 `CREATE TABLE`, 72 `CREATE TYPE`, 38 FKs, 6 unique, 6 indexes, **0 DROP**,
  **0 destructive ALTER**, **0 credentials/RLS**.

### Tables present at baseline (~26)

companies, organizations, departments, users, roles, permissions, memberships,
providers, agents, workflows, tasks, executions, registries, integrations,
commands, command_audit, telemetry_events, approvals, policies, memories,
knowledge_nodes, knowledge_edges, reasoning_traces, conversations, messages,
documents, notifications.

### Enums present at baseline (Tier 1, 13 distinct)

lifecycle_status, approval_state, command_status, command_source, stage_status,
execution_status, provider_status, role_type, permission_scope, memory_kind,
integration_status, task_status, notification_status.

### Enums added P0 (Tier 2, inert — not wired to any table)

Canonical governed enums for Specs 35–50 — see `src/db/schema/_enums.ts` Tier 2.
Convention: `<domain>_lifecycle_status`, `<domain>_health`, `<domain>_scope`,
`<domain>_type`, `<domain>_priority`, plus governance/policy domain/decision/gate
enums and `risk_class`, `voting_mode`, `rule_type`.

### Base column contract (`_base.ts`) — UNCHANGED at P0

`rootColumns` (id, createdAt, createdBy uuid **no FK**, updatedAt, updatedBy uuid
**no FK**, version, lifecycleStatus, deletedAt) + `tenantColumns` (adds tenantId
FK → companies). The deferred `createdBy`/`updatedBy` actor FK is wired in **S2**,
not P0 — leaving `_base.ts` untouched keeps every existing table backward
compatible.

## Current chain extension (S12, 2026-07-18)

`20260719124600_auth_identity_schema_foundation.sql` extends the historical S0
baseline additively. The chain now contains 12 migrations. S12 adds four inert
authentication enums, `auth_identities`, `invitations`, `user_session_contexts`,
and `role_permissions`, plus nullable membership, company, and audit lookup
fields. It performs no backfill, authentication activation, provider setup, RLS,
tenant provisioning, runtime hydration, or storage-provider change.
