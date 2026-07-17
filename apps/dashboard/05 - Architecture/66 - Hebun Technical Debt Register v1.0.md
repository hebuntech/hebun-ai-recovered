# 66 - Hebun Technical Debt Register v1.0

## Purpose

This document records the material technical debt discovered during product runtime consolidation review. It is intentionally architecture-first. These items are not bugs in isolation. They are structural debts that materially affect MVP launch readiness.

## 2026-07-13 Re-Assessment Update

### Resolved Debt

| ID | Previous Severity | New Status | Evidence |
| --- | --- | --- | --- |
| TD-001 | Critical | RESOLVED | Dashboard no longer imports low-level knowledge/memory CRUD. [src/features/director-dashboard/foundation.ts](/Users/senolsevim/Documents/Siteler/Hebun%20AI/apps/dashboard/src/features/director-dashboard/foundation.ts) |
| TD-002 | Critical | PARTIALLY RESOLVED | Runtime owners now exist for goals, missions, decisions, and timeline, but mission truth is still heuristic. [src/features/mission-runtime/mission-runtime-service.ts](/Users/senolsevim/Documents/Siteler/Hebun%20AI/apps/dashboard/src/features/mission-runtime/mission-runtime-service.ts) |
| TD-008 | High | RESOLVED | Knowledge and memory summaries now live in runtime surfaces. [src/features/knowledge-runtime/knowledge-runtime-service.ts](/Users/senolsevim/Documents/Siteler/Hebun%20AI/apps/dashboard/src/features/knowledge-runtime/knowledge-runtime-service.ts), [src/features/memory-runtime/memory-runtime-service.ts](/Users/senolsevim/Documents/Siteler/Hebun%20AI/apps/dashboard/src/features/memory-runtime/memory-runtime-service.ts) |

### Updated Severity Changes

| Debt | Updated Severity | Why |
| --- | --- | --- |
| TD-003 Organization Runtime mock-backed truth | Critical | Still blocks internal dogfooding because organization state is not real enough. |
| TD-004 Agent Runtime CRUD dependence | High | Architectural risk remains, but not the first dogfooding blocker. |
| TD-005 Workflow Runtime CRUD dependence | High | Architectural risk remains, but not the first dogfooding blocker. |
| TD-006 Director AI + Transformation overlap | Medium | Still real, but lower urgency than persistence and mission truth. |
| TD-007 Runtime loop incompleteness | Critical | Mission and persistence still break trusted closed-loop operation. |
| TD-009 Type-level circular coupling | Medium | Still present, not a dogfooding gate by itself. |
| TD-012 Mission Runtime truthfulness | Critical | Runtime now exists, but the inferred mission model is a dogfooding blocker. |
| TD-013 Timeline shallowness | Medium | Timeline is runtime-owned now, but still a projection rather than a first-class event domain. |

### New Debt

| ID | Severity | Area | Debt | Why It Matters | Recommended Permanent Owner |
| --- | --- | --- | --- | --- | --- |
| TD-015 | Critical | Persistence Gate | Active provider remains `memory`, and data is held only in-process. | Internal dogfooding cannot begin while core company state disappears on restart. | Persistence cutover |
| TD-016 | High | Mission Runtime | Mission Runtime projects `Organization` knowledge nodes with `goals` tags into mission state. | Strategic truth can be overstated or misclassified. | First-class mission runtime data source |

## Severity Definitions

- Critical: Must be resolved before onboarding the first real company.
- High: Should be resolved during MVP hardening.
- Medium: Important for scale, clarity, or maintainability.
- Low: Valuable cleanup, but not a launch gate.

## Debt Register

| ID | Severity | Area | Debt | Why It Matters | Recommended Permanent Owner |
| --- | --- | --- | --- | --- | --- |
| TD-001 | Critical | Director Dashboard | Dashboard reads knowledge and memory query layers directly. | Breaks runtime isolation and makes executive surfaces depend on low-level data assembly. | Product runtime consolidation layer |
| TD-002 | Critical | Dashboard Surfaces | Goals, missions, recent decisions, and executive timeline do not yet have clear runtime ownership. | Executive UI cannot be considered authoritative while key sections are page-owned projections. | Dedicated product runtime services |
| TD-003 | Critical | Organization Runtime | Core organizational projection still depends on mock-backed and low-level sources. | Real-company onboarding requires real operational truth, not development scaffolding. | Organization Runtime |
| TD-004 | High | Agent Runtime | Agent runtime is still a direct consumer of CRUD/query layers. | Agents appear runtime-native but are not yet isolated from lower-level storage shapes. | Agent Runtime |
| TD-005 | High | Workflow Runtime | Workflow runtime still consumes low-level workflow, knowledge, memory, and planning records directly. | Reduces future maintainability and weakens runtime authority. | Workflow Runtime |
| TD-006 | High | Director AI + Transformation | Executive recommendations are partially duplicated across Director AI and Transformation. | Weakens separation of responsibilities and increases future drift risk. | Director AI Runtime |
| TD-007 | High | Runtime Loop | Execution and learning are not fully realized as runtime loop participants. | The operating system loop is conceptually present but not fully closed. | Workflow Runtime and future execution/learning runtimes |
| TD-008 | High | Product Modeling | Knowledge and memory summaries are not owned by a dedicated runtime surface. | Two of Hebun’s most important enterprise assets still leak into presentation composition. | Product runtime data surfaces |
| TD-009 | Medium | Type Boundaries | Director AI and Transformation have a type-level circular coupling. | Not yet a runtime failure, but it erodes clean layering. | Director AI Runtime and Enterprise Transformation Runtime |
| TD-010 | Medium | Governance | Governance is visible to intelligence, but not yet fully expressed as a product runtime domain. | Limits explainability and decision support depth. | Governance runtime surface |
| TD-011 | Medium | Dashboard Intelligence Packaging | Some section projection logic remains inside the Dashboard assembly layer. | Presentation layer owns logic that should live in reusable runtime or intelligence services. | Director Dashboard integration layer |
| TD-012 | Medium | Mission Runtime | Active mission surfaces are still placeholders. | Strategic alignment cannot yet be displayed as a complete operational truth. | Mission/goal runtime surfaces |
| TD-013 | Medium | Historical Context | Executive timeline and recent decisions are useful but still shallow and low-level. | Limits the Director’s ability to understand what changed and why. | Executive runtime surfaces |
| TD-014 | Low | Repository Adoption | Product runtimes are not yet consistently lifted onto canonical repository abstractions. | Future multi-provider discipline will be harder without convergence. | Canonical repository adoption effort |

## Duplicate Responsibility Notes

### Health

Current state:

- Operational health belongs to Organizational Intelligence.
- Local health summaries are echoed downstream in dashboard assembly and transformation narratives.

Permanent home:

- Organizational Intelligence

### Recommendations

Current state:

- Director AI produces executive recommendations.
- Enterprise Transformation produces transformation recommendations.

Permanent home:

- Director AI should own executive recommendation delivery.
- Enterprise Transformation should own transformation findings and initiatives.

### Knowledge and Memory Summaries

Current state:

- Dashboard currently owns low-level summarization.
- Organizational Intelligence derives partial observation metrics.

Permanent home:

- Dedicated runtime-facing summary services

## Debt Themes

### 1. Boundary Debt

The most serious debt is not missing features. It is layers reading below their intended abstraction level.

### 2. Authority Debt

Several executive surfaces do not yet have a single authoritative runtime owner.

### 3. Realism Debt

The platform models a living company well conceptually, but some runtime inputs still resemble development scaffolding.

### 4. Loop Debt

The operating loop is visible, but execution, learning, and strategic feedback are not yet equally mature participants.

## Debt Prioritization For MVP Hardening

### Must Resolve Before First Real Company

- TD-001
- TD-002
- TD-003
- TD-007
- TD-008

### Should Resolve During MVP Hardening

- TD-004
- TD-005
- TD-006
- TD-009
- TD-010

### Can Follow Initial Hardening

- TD-011
- TD-012
- TD-013
- TD-014

## Final Note

The current debt profile is healthy for a product that has just crossed from infrastructure into product runtime. The important point is that the highest-severity debt is now clearly visible and mostly architectural, which means it can be resolved deliberately without undoing the platform’s direction.

## Runtime Projection Layer Update

Projection Layer introduction resolves the architectural direction behind the earlier runtime boundary debt.

It does not erase the debt register, but it converts the biggest remaining persistence/runtime mismatch into a tractable implementation program.

## Phase 3C.0A Validation Debt

- **TD-PROJ-001 — Authoritative Memory source readability:** `memory/conversation.ts` and `memory/episodic.ts` block filesystem reads and projection bootstrap. Severity: blocking.
- **TD-PROJ-002 — Full projection parity proof:** blocked by TD-PROJ-001; no normalization or seed omission is permitted.
- **TD-PROJ-003 — Async migration residue:** the earlier persistence contract modernization remains incomplete and must not resume until projection validation closes.

### Phase 3C.0A Debt Re-Validation — 2026-07-15

- **TD-PROJ-001 — RESOLVED:** both authoritative Memory source modules complete normal reads and projection bootstrap passes.
- **TD-PROJ-002 — RESOLVED:** 9/9 builders pass strict deterministic rebuild and semantic parity validation.
- **TD-PROJ-003 — UNBLOCKED, NOT IMPLEMENTED:** projection validation is closed; persistence modernization remains a separate future workstream.
- **TD-PROJ-004 — MINOR:** mutation and live operational telemetry workspaces use a narrow file-level boundary allowlist until a later supported refresh model exists.

### Persistence Contract Modernization Closure — 2026-07-15

- **TD-PROJ-003 — RESOLVED:** persistence adapters, repositories, domain CRUD services, validators, and mutation consumers use truthful asynchronous data-operation contracts while Runtime, Projection, Dashboard, and Director AI retain synchronous snapshot semantics.
- Memory remains the active authoritative provider. PostgreSQL remains available, passive, and fail-closed for every unsupported data operation.
- The synchronous `getSnapshot()` and `subscribe()` bridge, transaction commit notification, failed-transaction rollback isolation, actor-shadow async query consumption, and all five domain CRUD consumer boundaries are verified.
- PostgreSQL activation, tenant isolation, real PostgreSQL transactions, projection hydration/refresh orchestration, and provider cutover remain separate workstreams.

### Phase 3C.1 PostgreSQL Registry Foundation — 2026-07-15

- The passive PostgreSQL adapter now supports real, tenant-scoped persistence for the `registries` collection only.
- Registry logical IDs map to `registries.slug`; physical PostgreSQL UUIDs remain internal and never replace application IDs.
- Supported rows require non-null `description` and `owner`. Schema-valid nullable rows fail closed as invalid mappings, and failed hydration preserves the last valid snapshot atomically.
- Explicit hydration, synchronous snapshots/subscriptions, CRUD, tenant-scoped clear, and adapter-level transaction commit/rollback isolation are verified on a disposable migrated PostgreSQL database.
- Memory remains active and authoritative. PostgreSQL remains passive. RLS, tenant provisioning, additional collections, Unit of Work, provider activation, projection cutover, backup, and recovery remain future work.

### Phase 3C.2 PostgreSQL Knowledge Nodes Foundation — 2026-07-16

- The passive PostgreSQL adapter now supports tenant-scoped persistence for `knowledge-nodes` in addition to `registries`.
- Knowledge node logical IDs map to `knowledge_nodes.ref_id`; physical PostgreSQL UUIDs remain internal. Fields without canonical columns use the versioned `provenance.hebunKnowledgeCrudV1` envelope.
- Null required fields, malformed or unknown envelopes, duplicate logical IDs, and cross-tenant operations fail closed. Failed hydration preserves the previous immutable snapshot without notification.
- CRUD, deterministic hydration, transaction commit/rollback isolation, Knowledge Shadow identity/content parity, and complete Runtime Projection regression are verified on a disposable migrated PostgreSQL database.
- Memory remains active and authoritative. PostgreSQL remains passive. Database-enforced logical-ID uniqueness, canonical-governance lifecycle convergence, knowledge relationships, RLS, tenant provisioning, runtime hydration/cutover, backup, and recovery remain future work.

### Phase 3C.3 PostgreSQL Agent Foundation — 2026-07-16

- The passive PostgreSQL adapter now supports explicit tenant-scoped persistence for `agents` in addition to `registries` and `knowledge-nodes`.
- Agent application IDs remain logical IDs in the versioned `provider_profile.hebunAgentCrudV1` envelope; physical PostgreSQL UUIDs remain internal and continue to serve canonical actor references.
- Supported rows require a valid envelope and exactly one same-tenant department-name resolution. Invalid, ambiguous, cross-tenant, or duplicate logical rows fail closed and preserve the previous immutable snapshot without notification.
- CRUD, deterministic hydration, transaction commit/rollback isolation, canonical Actor Read compatibility, Actor Shadow field parity, and complete Runtime Projection, Dashboard, Director AI, and Organizational Intelligence parity are verified on a disposable migrated PostgreSQL database.
- Memory remains active and authoritative. PostgreSQL remains passive. Database-enforced logical-ID uniqueness, canonical Agent profile convergence, relationship persistence, RLS, tenant provisioning, runtime hydration/cutover, backup, and recovery remain future work.

### Phase 3C.4 PostgreSQL Workflow Foundation — 2026-07-16

- The passive PostgreSQL adapter now supports explicit tenant-scoped persistence for `workflows` in addition to `registries`, `knowledge-nodes`, and `agents`.
- Workflow application IDs remain logical IDs in `orchestration_metadata.hebunWorkflowCrudV1`; physical PostgreSQL UUIDs remain internal and preserve canonical execution-lineage references.
- Adapter-owned rows are isolated by the versioned envelope. Canonical-only rows and canonical Mission, Goal, Plan, ownership, lifecycle, health, execution, rollback, and compensation fields remain untouched.
- Invalid, unknown-version, or duplicate logical rows fail closed. Save and clear reconcile only adapter-owned rows, and inbound foreign-key failures roll back without replacing the previous immutable snapshot or notifying subscribers.
- Memory remains active and authoritative. PostgreSQL remains passive. Database-enforced tenant-level logical-ID uniqueness, RLS, tenant provisioning, runtime hydration/cutover, backup, and recovery remain future work.
