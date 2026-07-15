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
