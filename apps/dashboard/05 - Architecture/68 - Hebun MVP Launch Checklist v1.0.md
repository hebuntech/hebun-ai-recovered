# 68 - Hebun MVP Launch Checklist v1.0

## Purpose

This checklist defines what must be true before Hebun can onboard its first real company as an MVP.

It is intentionally strict. A real-company launch should happen only when executive surfaces are trustworthy, runtime ownership is clear, and the operating loop is sufficiently closed to support real decision-making.

## 2026-07-13 Re-Assessment Update

### Updated Gate Verdicts

| Gate | Verdict | Reason |
| --- | --- | --- |
| Visual demo readiness | GO | Executive runtime surfaces are now coherent enough for truthful demos. |
| Internal read-only evaluation readiness | CONDITIONAL GO | Strong enough for observation and critique, but not for operational dependence. |
| Internal dogfooding readiness | NO-GO | Persistence cutover is incomplete, mission truth is heuristic, and organization truth is still mock-backed. |
| First external customer readiness | NO-GO | Runtime truth and persistence are not yet strong enough. |
| Production readiness | NO-GO | Active provider remains in-memory and restart durability is absent. |

### Updated Critical Blockers

### Runtime Authority

- [x] Every Director Dashboard section has a single runtime or intelligence owner.
- [x] Knowledge Overview is no longer assembled directly from low-level page reads.
- [x] Memory Overview is no longer assembled directly from low-level page reads.
- [x] Recent Decisions has a dedicated runtime owner.
- [x] Executive Timeline has a dedicated runtime owner.
- [x] Active Goals has a dedicated runtime owner.
- [ ] Active Missions is backed by a real, first-class runtime source rather than a heuristic projection.

### Runtime Isolation

- [x] Director Dashboard consumes product runtimes only.
- [ ] Organization Runtime no longer depends on mock-backed sources for MVP-critical truth.
- [ ] Agent Runtime no longer behaves like a decorated CRUD facade.
- [ ] Workflow Runtime no longer behaves like a decorated CRUD facade.

### Organizational Truth

- [ ] Company, department, role, membership, and reporting relationships are sourced from real runtime truth.
- [ ] Agent ownership and management relationships are consistently resolved through non-mock runtime services.
- [ ] Workflow ownership and workflow responsibility are consistently resolved through non-heuristic runtime services.

### Operating Loop Integrity

- [ ] Workflow state produces trustworthy executive signals.
- [x] Knowledge and memory signals are represented through runtime-owned product surfaces.
- [ ] Learning is represented strongly enough to support intelligence claims.
- [ ] The executive loop from organization to intelligence to recommendation is coherent and explainable.

### Persistence Gate

- [ ] Active provider is PostgreSQL.
- [ ] Memory adapter is fallback-only.
- [ ] Core company data survives process restart.
- [ ] Backup and recovery are available for company runtime data.

### Dogfooding Rule

The existing milestone rule remains valid:

Internal Dogfooding starts only after:

- Persistence Cutover complete
- Runtime Activation complete
- PostgreSQL active
- Memory adapter fallback-only

Current evidence does not justify weakening that rule. In fact, the current code strengthens it:

- `ACTIVE_PROVIDER` is still `"memory"` in [src/features/persistence/storage-manager.ts](/Users/senolsevim/Documents/Siteler/Hebun%20AI/apps/dashboard/src/features/persistence/storage-manager.ts)
- the in-memory adapter explicitly states there is no database, localStorage, filesystem, or network durability in [src/features/persistence/memory-adapter.ts](/Users/senolsevim/Documents/Siteler/Hebun%20AI/apps/dashboard/src/features/persistence/memory-adapter.ts)

### Updated Final Gate

Current result: **NO-GO for internal dogfooding and external onboarding**

Current result: **CONDITIONAL GO for visual demos and internal read-only evaluation**

## Launch Recommendation Today

**Do not launch to the first real company yet.**

Use this checklist as the minimum go/no-go gate.

## Critical Blockers

### Runtime Authority

- [ ] Every Director Dashboard section has a single runtime or intelligence owner.
- [ ] Knowledge Overview is no longer assembled directly from low-level page reads.
- [ ] Memory Overview is no longer assembled directly from low-level page reads.
- [ ] Recent Decisions has a dedicated runtime owner.
- [ ] Executive Timeline has a dedicated runtime owner.
- [ ] Active Goals has a dedicated runtime owner.
- [ ] Active Missions is backed by a real runtime surface or intentionally removed from MVP scope.

### Runtime Isolation

- [ ] Director Dashboard consumes product runtimes only.
- [ ] Organization Runtime no longer depends on mock-backed sources for MVP-critical truth.
- [ ] Agent Runtime no longer behaves like a decorated CRUD facade.
- [ ] Workflow Runtime no longer behaves like a decorated CRUD facade.

### Organizational Truth

- [ ] Company, department, role, membership, and reporting relationships are sourced from real runtime truth.
- [ ] Agent ownership and management relationships are consistently resolved through runtime services.
- [ ] Workflow ownership and workflow responsibility are consistently resolved through runtime services.

### Operating Loop Integrity

- [ ] Workflow state produces trustworthy executive signals.
- [ ] Knowledge and memory signals are represented through runtime-owned product surfaces.
- [ ] Learning is represented strongly enough to support intelligence claims.
- [ ] The executive loop from organization to intelligence to recommendation is coherent and explainable.

## Important Improvements

- [ ] Director AI recommendation ownership is clearly separated from Transformation recommendation ownership.
- [ ] Director AI and Transformation do not share circular type coupling.
- [ ] Governance is surfaced more explicitly in the product runtime stack.
- [ ] Dashboard projections are reduced to presentation assembly only.
- [ ] Mission and goal alignment are strengthened enough for executive use.

## Nice-To-Have Before Broader Expansion

- [ ] Richer historical change views
- [ ] Stronger department drilldown narratives
- [ ] More complete strategic timeline surfaces
- [ ] Expanded transformation storytelling inside the dashboard

## Domain Readiness Gate

| Domain | Required For MVP Launch | Current State |
| --- | --- | --- |
| Organization Runtime | Yes | Partial |
| Agent Runtime | Yes | Partial |
| Workflow Runtime | Yes | Partial |
| Knowledge Runtime Surface | Yes | Partial |
| Memory Runtime Surface | Yes | Partial |
| Organizational Intelligence | Yes | Ready |
| Director Dashboard | Yes | Partial |
| Director AI Runtime | No for first launch, but helpful | Partial |
| Enterprise Transformation Runtime | No for first launch, but strategic | Partial |
| Governance Runtime Depth | Yes | Partial |

## Go / No-Go Criteria

### Go

Launch is acceptable only when all critical blockers are complete and no executive surface bypasses runtime authority.

### No-Go

Do not launch if any of the following remain true:

- Dashboard still reads low-level domain records directly for critical executive surfaces.
- Core organizational truth still depends on development mock sources.
- Knowledge and memory do not have runtime-owned product surfaces.
- Executive summaries are materially derived from incomplete workflow or ownership truth.

## Minimum Launch Narrative

Before launch, Hebun must be able to truthfully say:

1. The Dashboard reflects the live operating state of the company.
2. Every executive surface is backed by runtime-owned truth.
3. Organizational Intelligence is derived from real runtime evidence.
4. Memory is the authoritative active source.
5. PostgreSQL remains inactive and non-authoritative.

## Final Gate

Current result: **NO-GO**

Reason:

The architecture is directionally strong, but the MVP still needs one focused consolidation phase before it can responsibly support the first real company.

## Runtime Projection Layer Update

A new pre-launch requirement is now explicit:

runtime-owned executive surfaces must be backed by projection-owned synchronous runtime state rather than direct CRUD or repository reads.

This is now part of the MVP safety gate for persistence modernization and first-company readiness.

## Phase 3C.0A Projection Gate

- [x] Runtime projection snapshots are cloned, deeply immutable, and atomically replaced.
- [x] Failed rebuilds preserve last valid data and mark it unavailable/stale.
- [x] Runtime projection import boundaries pass focused validation.
- [x] Projection diagnostics are development-only and sanitized.
- [ ] Authoritative Memory seed files complete normal filesystem reads.
- [ ] Projection foundation bootstrap passes.
- [ ] Typecheck, lint, and build pass.
- [ ] Runtime, Dashboard, and Director AI parity is proven.

Current result: **NO-GO**. Do not restart Persistence Contract Modernization.

### Phase 3C.0A Projection Gate Re-Validation — 2026-07-15

- [x] Authoritative Memory seed files complete normal filesystem reads.
- [x] Projection foundation bootstrap passes for all nine builders.
- [x] All nine builders rebuild deterministically and preserve immutable last-valid data on failure.
- [x] Dashboard and Organizational Intelligence boundary tests pass.
- [x] Runtime, Director AI, Organizational Intelligence, and Director Dashboard semantic parity is proven.
- [x] Typecheck, lint, 36 regression tests, production build, and `git diff --check` pass.

Phase 3C.0A result: **COMPLETE WITH MINOR DEBT**. Memory remains authoritative and PostgreSQL remains passive.

### Persistence Contract Modernization Closure — 2026-07-15

- [x] Persistence adapter and repository data operations expose asynchronous contracts.
- [x] Agent, Workflow, Memory, Knowledge, Registry, and Actor Shadow consumers handle persistence promises explicitly.
- [x] Runtime services, projection builders, executive Dashboard reads, and Director AI retain synchronous snapshot semantics.
- [x] Memory snapshot subscriptions and transaction rollback isolation pass focused verification.
- [x] PostgreSQL remains available, passive, non-authoritative, and fail-closed for unsupported operations.
- [x] Typecheck, ESLint with zero errors, 36 regression tests, five Runtime Projection tests, 9/9 deterministic builders, semantic parity, and the 192-page production build pass.

Persistence Contract Modernization is **COMPLETE**. This does not complete the Persistence Cutover gate: PostgreSQL activation, restart durability, tenant isolation, real PostgreSQL transaction support, projection hydration/refresh orchestration, backup, and recovery remain incomplete.

### Phase 3C.1 PostgreSQL Registry Foundation — 2026-07-15

- [x] `registries` has a collection-specific, lossless supported-row codec.
- [x] Every PostgreSQL registry data operation requires explicit tenant context and fails closed before SQL when it is absent.
- [x] Registry CRUD, explicit atomic hydration, synchronous snapshot/subscription behavior, and adapter-level transaction rollback isolation pass against a fresh disposable database with all 11 migrations.
- [x] PostgreSQL provider capabilities and diagnostics report only the implemented `registries` scope.
- [x] Memory remains active and authoritative; PostgreSQL remains passive and is not connected to Runtime Projection startup.
- [x] TypeScript, ESLint with zero errors, 38 regression tests, 32/32 PostgreSQL conformance checks, Runtime Projection parity, and the 192-page production build pass.

Phase 3C.1 is **COMPLETE WITH MINOR DEBT**. The supported-row invariant rejects nullable registry `description` or `owner` values until a future registry domain contract explicitly represents those nullable schema states. This phase does not complete PostgreSQL activation, RLS, tenant provisioning, additional collection support, Unit of Work, projection refresh/cutover, backup, or recovery.

### Phase 3C.2 PostgreSQL Knowledge Nodes Foundation — 2026-07-16

- [x] `knowledge-nodes` has a collection-specific, lossless supported-row codec using `ref_id` as the application logical ID.
- [x] Every PostgreSQL knowledge-node operation requires explicit tenant context and fails closed for invalid rows, duplicate logical IDs, or unsupported collections.
- [x] CRUD, deterministic atomic hydration, immutable snapshots, and transaction commit/rollback isolation pass against a fresh disposable database with all 11 migrations.
- [x] Knowledge Shadow verification confirms canonical identity and content parity without making PostgreSQL authoritative.
- [x] PostgreSQL provider capabilities and diagnostics report only the implemented `registries` and `knowledge-nodes` scope.
- [x] Memory remains active and authoritative; PostgreSQL remains passive and disconnected from Runtime Projection startup.
- [x] TypeScript, ESLint with zero errors, 40 regression tests, PostgreSQL conformance, Runtime Projection parity, and the 192-page production build pass.

Phase 3C.2 is **COMPLETE WITH MINOR DEBT**. Database-enforced `ref_id` uniqueness, convergence with canonical-governance lifecycle state, knowledge relationships, RLS, tenant provisioning, runtime hydration/cutover, backup, and recovery remain outside this foundation.

### Phase 3C.3 PostgreSQL Agent Foundation — 2026-07-16

- [x] `agents` has a lossless supported-row codec with a versioned metadata envelope and internal-only physical UUIDs.
- [x] Tenant context, supported-row validation, department resolution, deterministic hydration, immutable snapshots, and transaction rollback isolation pass against a fresh database with all 11 migrations.
- [x] Canonical Actor Read and Actor Shadow preserve the physical actor boundary while matching supported Agent name and department fields.
- [x] Runtime Projection, Director Dashboard, Director AI, and Organizational Intelligence remain isolated and retain semantic parity.
- [x] PostgreSQL diagnostics report `registries`, `knowledge-nodes`, and `agents`; Memory remains active and PostgreSQL remains passive.
- [x] TypeScript, ESLint with zero errors, 42 regression tests, 9/9 deterministic projection builders, and the 192-page production build pass.

Phase 3C.3 is **COMPLETE WITH MINOR DEBT**. Database-enforced logical-ID uniqueness, canonical Agent profile convergence, relationships, RLS, tenant provisioning, runtime hydration/cutover, backup, and recovery remain outside this foundation.

### Phase 3C.4 PostgreSQL Workflow Foundation — 2026-07-16

- [x] `workflows` has a lossless supported-row codec using the versioned `orchestration_metadata.hebunWorkflowCrudV1` envelope and internal-only physical UUIDs.
- [x] Adapter ownership excludes and preserves canonical-only Workflow rows, metadata siblings, relationships, lifecycle, health, and execution strategy.
- [x] CRUD, deterministic hydration, adapter-owned save/clear reconciliation, immutable snapshots, and transaction commit/rollback isolation pass against a fresh database with all 11 migrations.
- [x] Foreign-key-protected reconciliation rolls back atomically without snapshot replacement or notification.
- [x] Execution Lineage, Execution Shadow, all nine Runtime Projection builders, Director Dashboard, Director AI, and Organizational Intelligence retain compatibility and semantic parity.
- [x] PostgreSQL diagnostics report `registries`, `knowledge-nodes`, `agents`, and `workflows`; Memory remains active and PostgreSQL remains passive.
- [x] TypeScript, ESLint with zero errors, 44 regression tests, and the 192-page production build pass.

Phase 3C.4 is **COMPLETE WITH MINOR DEBT**. Tenant-level Workflow logical-ID uniqueness remains application-enforced while PostgreSQL is passive. RLS, tenant provisioning, automatic hydration, dual write, provider activation, runtime cutover, backup, and recovery remain outside this foundation.

### Phase 3C.5 PostgreSQL Memory Foundation — 2026-07-18

- [x] `memories` has a lossless supported-row codec using the versioned `storage_metadata.hebunMemoryCrudV1` envelope and internal-only physical UUIDs.
- [x] Adapter ownership excludes and preserves canonical-only Memory rows, metadata siblings, canonical kind, integer importance, ownership, provenance, lineage, trust, quality, lifecycle, health, and version.
- [x] CRUD, deterministic hydration, adapter-owned save/clear reconciliation, immutable snapshots, and transaction commit/rollback isolation pass against a fresh database with all 11 migrations.
- [x] Foreign-key and self-supersession-protected reconciliation rolls back atomically without snapshot replacement or notification.
- [x] All nine Runtime Projection snapshots, Director Dashboard, Director AI, and Organizational Intelligence retain semantic parity.
- [x] PostgreSQL diagnostics report `registries`, `knowledge-nodes`, `agents`, `workflows`, and `memories`; Memory remains active and PostgreSQL remains passive.
- [x] TypeScript, ESLint with zero errors, 46 regression tests, and the 192-page production build pass.

Phase 3C.5 is **COMPLETE WITH MINOR DEBT**. Tenant-level Memory logical-ID uniqueness remains application-enforced, canonical kind and integer importance remain isolated, and polymorphic ownership remains envelope-only. RLS, tenant provisioning, automatic hydration, dual write, provider activation, runtime cutover, backup, and recovery remain outside this foundation.

### Phase 3D.2B.2 Additive Authentication Schema Foundation — 2026-07-18

- [x] Four provider-neutral authentication enums and four additive security/authorization tables are represented in the Drizzle schema and S12 migration.
- [x] Existing users remain compatible; `users.auth_id` is unchanged and explicitly transitional.
- [x] Membership, company, and audit extensions are nullable and contain no legacy-data backfill or authority-enabling defaults.
- [x] The complete 12-migration chain, second-run no-op, new-table constraints, tenant-safe new-table relationships, old-shape inserts, and disposable database cleanup are verified.
- [x] Memory remains authoritative and PostgreSQL remains passive; Runtime Projection and executive surfaces are unchanged.
- [ ] Legacy identity and membership inventory/backfill, restrictive constraints, permission seeds, Supabase integration, session/TenantContext resolvers, route protection, RLS, tenant provisioning, and authentication activation remain required.

Phase 3D.2B.2 establishes schema only. It does not make Hebun authentication-ready or unblock PostgreSQL activation by itself.
