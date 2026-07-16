# Runtime Projection Layer v1.0

## Why This Layer Exists

Persistence Contract Modernization exposed a correct architectural truth:

Product Runtime and UI require synchronous runtime state.

Persistence and repositories must become truthful asynchronous boundaries.

Those two facts are compatible only if Hebun introduces a Runtime Projection Layer between persistence-facing reads and runtime-facing reads.

The Runtime Projection Layer makes the architecture:

Persistence  
-> Projection Builders  
-> Runtime Projection Store  
-> Runtime Services  
-> Director Dashboard / Director AI / Organizational Intelligence

## Core Purpose

The Runtime Projection Layer exists to:

- isolate runtime from asynchronous persistence
- preserve synchronous runtime behavior
- give every runtime one in-memory projection source
- prevent Dashboard and Director AI from reaching CRUD or repositories
- prepare PostgreSQL cutover without changing product behavior

## Responsibilities

The layer owns:

- projection contracts
- projection store
- projection registry
- projection diagnostics
- projection versioning
- projection health
- projection refresh interfaces
- projection builders for runtime-owned domains

It does not own:

- persistence authority
- repository semantics
- product mutations
- provider switching
- background refresh
- projection persistence

## Projection Model

Each projection is:

- domain-scoped
- read-only
- in-memory
- versioned
- diagnosable
- refreshable manually

Each projection records:

- identity
- owner
- dependencies
- version
- health
- availability
- statistics

## Projection Store

The Projection Store is the runtime-facing state holder.

It does not know Memory Adapter.

It does not know PostgreSQL.

It does not know CRUD.

It stores only named runtime projections and exposes:

- `snapshot()`
- `replace()`
- `invalidate()`
- `clear()`
- `statistics()`
- `health()`

## Projection Registry

The Projection Registry is the coordination layer.

It owns:

- projection registration
- dependency ordering
- refresh dispatch
- diagnostics listing
- availability visibility

It is the single place that knows which projections exist.

## Builders

Builders translate lower-level records into runtime projections.

Initial builders:

- OrganizationProjectionBuilder
- AgentProjectionBuilder
- WorkflowProjectionBuilder
- GoalProjectionBuilder
- MissionProjectionBuilder
- KnowledgeProjectionBuilder
- MemoryProjectionBuilder
- DecisionProjectionBuilder
- ExecutiveTimelineProjectionBuilder

Builders are the only allowed place where runtime projections are assembled from lower-level records.

## Refresh Model

Refresh remains manual in this stage.

Supported interfaces:

- `refresh()`
- `refreshAll()`
- `invalidate()`
- `replace()`
- `clear()`

Not supported yet:

- background refresh
- event-driven refresh
- distributed refresh
- persistence-backed projection storage

## Boundaries

Required boundary:

Dashboard  
-> Runtime  
-> Projection  
-> Repository  
-> Persistence

Forbidden reverse paths:

- Projection -> Dashboard
- Projection -> UI
- Runtime -> Repository
- Runtime -> CRUD
- Runtime -> PostgreSQL

## Relationship to Persistence

Persistence remains authoritative only through Memory in the current phase.

PostgreSQL remains passive.

Projection does not change authority.

Projection makes future async persistence adoption safe by preventing async persistence concerns from leaking into runtime consumers.

## Relationship to Runtime

Runtime services now consume projection snapshots only.

This means:

- runtime stays synchronous
- runtime outputs remain stable
- runtime dependencies become narrower
- persistence modernization can continue without changing product semantics

## Relationship to Dashboard

Director Dashboard behavior should remain unchanged.

The Dashboard continues reading runtime services.

The only architectural change is beneath runtime:

runtime truth now comes from projections instead of direct CRUD/query access.

## Relationship to Director AI

Director AI continues reading runtime and organizational intelligence.

It does not need to understand projection internals.

Projection exists to preserve that separation.

## Future PostgreSQL Cutover

This layer is the prerequisite for a safe second attempt at Persistence Contract Modernization.

After this layer is stable:

1. repositories can become fully async
2. Memory can continue seeding projections synchronously into runtime
3. PostgreSQL can remain passive while projections compare, validate, and eventually support cutover planning

Projection is not the cutover.

Projection is the safety layer that makes cutover possible.

## Current Architectural Result

The Runtime Projection Layer converts Hebun from:

runtime directly reading low-level state

to:

runtime reading stable domain projections

That is the correct enterprise boundary for the next persistence phase.

## Phase 3C.0A Validation And Hardening

### Initialization Contract

- Builders are registered synchronously and idempotently before any build begins.
- Bootstrap is explicit through `ensureRuntimeProjectionRegistry()` and remains synchronous.
- The first successful bootstrap builds all registered projections in dependency order.
- Repeated bootstrap after success is a no-op.
- A failed builder stops that bootstrap attempt and leaves already-built projections available.
- A failed replacement preserves the last valid immutable data but marks that projection stale and unavailable.
- A runtime lookup accepts only a healthy, available snapshot; otherwise it retries the explicit build and propagates failure.
- Partial projection availability is diagnosable, but unavailable projections fail closed for runtime consumers.
- No timers, event subscriptions, queues, workers, or automatic refresh paths exist.

### Snapshot Isolation

Every successful snapshot is structured-cloned and deeply frozen before atomic replacement in the store. This prevents builder-owned references, callers, nested arrays, and nested objects from mutating canonical projection state. Failed builds never replace the last valid data.

### Diagnostics Contract

The development-only `/\_internal/runtime-projections` route exposes only sanitized metadata:

- registration and availability
- health and version
- record count and dependencies
- build timestamp and age
- last refresh result
- sanitized failure category

It exposes no raw records, credentials, refresh controls, or client-side projection payloads.

### Validation Result

Phase 3C.0A remains **NO-GO** for formal closure.

Passed:

- strengthened runtime import-boundary test
- snapshot immutability and failed-build isolation test
- missed Workflow Runtime dependency on `planning-queries` removed

Blocked:

- `src/features/memory/conversation.ts` and `src/features/memory/episodic.ts` do not complete filesystem reads in the current workspace
- projection foundation bootstrap blocks while importing those authoritative Memory seeds
- `tsc --noEmit`, ESLint, and Next build consequently do not terminate in bounded validation runs
- runtime parity and the complete regression suite cannot be proven while authoritative Memory input is unreadable

Memory remains authoritative. PostgreSQL remains passive. Persistence Contract Modernization must not restart until the Memory source files are readable and the entire validation gate passes.

### Closure Re-Validation — 2026-07-15

Recovery restored the authoritative Memory source modules and bootstrap dependency wiring. The closure implementation then:

- removed observational `generatedAt` and `retrievalTimeMs` values from Agent semantic projection state while retaining Memory Engine telemetry
- routed Organizational Intelligence memory evidence through Memory Runtime
- routed executive Dashboard summaries through runtime services and provider status through a diagnostics read boundary
- expanded boundary validation and added table-driven validation for all nine projection builders

Validation result:

- 9/9 builders bootstrap healthy and available
- 9/9 builders pass strict deterministic rebuild, deep immutability, and failed-rebuild preservation
- runtime, Director AI, Organizational Intelligence, and Director Dashboard semantic parity pass
- TypeScript, ESLint with zero errors, 36/36 regression tests, production build, and `git diff --check` pass

Phase 3C.0A final status: **COMPLETE WITH MINOR DEBT**. The remaining minor debt is the explicit file-level allowlist for mutation and live operational telemetry workspaces, which require a refresh model that this architecture explicitly does not introduce. Memory remains authoritative. PostgreSQL remains passive.

### Persistence Contract Modernization Closure — 2026-07-15

The post-projection persistence contract now preserves the intended split:

- persistence adapter, repository, domain query, validator, and mutation data operations are asynchronous
- `getSnapshot()` and `subscribe()` remain synchronous bridges for in-process Memory state
- projection builders and runtime read services remain synchronous and deterministic
- Dashboard and Director AI executive reads continue through Runtime-owned snapshots
- successful Memory transactions publish one committed notification; failed transactions restore the prior snapshot without exposing intermediate state to subscribers
- PostgreSQL advertises no read, write, transaction, tenant-isolation, soft-delete, or optimistic-versioning capability and rejects every data operation in passive mode

Focused persistence, Actor Shadow, and Runtime Projection verification passes alongside 36/36 regression tests, 9/9 deterministic projection builders, semantic parity, TypeScript, ESLint with zero errors, and the 192-page production build. Persistence Contract Modernization is **COMPLETE**. Memory remains authoritative and PostgreSQL remains passive. Activation, tenant isolation, real PostgreSQL transactions, hydration/refresh orchestration, and cutover are not part of this closure.

### Phase 3C.1 PostgreSQL Registry Foundation — 2026-07-15

The passive PostgreSQL adapter implements real persistence for `registries` only. Explicit tenant-scoped hydration may populate that adapter's synchronous immutable snapshot, but no automatic startup, background refresh, Runtime Projection hydration, dual write, or provider selection path was introduced.

Registry logical IDs remain slugs and physical PostgreSQL UUIDs remain internal. Supported rows require non-null `description` and `owner`; an invalid nullable row fails the complete hydration before snapshot replacement. Transaction commits publish one final snapshot notification, while rollback preserves the prior snapshot without notification or intermediate visibility.

Disposable PostgreSQL conformance passes 32/32 after applying all 11 migrations, the complete suite passes 38/38, all nine projection builders remain deterministic, semantic parity passes, and the production build generates 192/192 pages. Phase 3C.1 is **COMPLETE WITH MINOR DEBT**. Memory remains authoritative and PostgreSQL remains passive.
