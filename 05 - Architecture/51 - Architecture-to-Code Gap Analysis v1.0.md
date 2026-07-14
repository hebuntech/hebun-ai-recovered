# Architecture-to-Code Gap Analysis v1.0

> Implementation Stage 1 — analysis only. No code, schema, migration, or package changes.
> Grounds every conclusion in the actual `apps/dashboard` codebase (inspected) and Specifications 34–50 (all present in `05 - Architecture/`).

**Spec availability check:** all seventeen specifications (34 Identity → 50 Policy) are present and readable in `05 - Architecture/`. None missing. Proceeding.

**Inspection basis (what was actually read):** `package.json`, `drizzle.config.ts`, `src/db/index.ts`, `src/db/schema/*` (28 files incl. `_base.ts`, `_enums.ts`, all tables), `src/features/persistence/*`, `src/features/commands/*`, `src/features/events/mock.ts`, `src/features/{governance,policy,crud-core}/*` (listings), `src/app/(dashboard)/*` routes, `src/features` (51 dirs), storage-manager active provider.

---

## 1. Executive Summary

**The system is a schema-defined, in-memory, offline, Command-Bus-driven dashboard — not a persisted operating system.** The 34–50 specifications describe a full digital-company OS; the code is a **foundation and a UI shell** with a real offline Command pipeline and a storage-agnostic persistence abstraction, but **no live database, no migrations, and tables that predate the specs.**

Key grounded facts:

- **Stack:** Next.js 16.2, React 19.2, Drizzle ORM 0.45, Postgres/Supabase target. No DB client, no connection — `src/db/index.ts` exposes schema only.
- **Persistence:** active provider is **`memory`** (`storage-manager.ts` `ACTIVE_PROVIDER = "memory"`). `SupabasePostgresAdapter` is a **readiness skeleton** — every op `throw`s NotImplemented, not registered. **No `src/db/migrations` directory exists.**
- **Command Bus:** real, sophisticated, **offline** — dispatcher runs `create → validation → policy → authorization → queue → approval → simulation → audit → telemetry → history`. "Nothing executes. No providers, no database, no mutation of business data."
- **Events:** a **static mock array** (`features/events/mock.ts`) — no real event bus, no transactional emission.
- **Enums:** **14** in `_enums.ts` (lifecycleStatus, approvalState, commandStatus, commandSource, stageStatus, executionStatus, providerStatus, roleType, permissionScope, memoryKind, integrationStatus, taskStatus, notificationStatus). **~55 spec-defined enums are absent.**
- **Tables:** ~26 tables, all **minimal/foundational**. **Missing entirely:** missions, goals, plans, working-memory, learning, governance sessions/decisions. **Conflicting model:** knowledge (graph nodes/edges vs canonical-truth), policy (name/status text vs rich rule model), memory (flat vs episodic/semantic/procedural + provenance/lineage/scope).

**Bottom line:** the gap is **wide but clean.** The foundation (`_base.ts` columns, persistence adapter interface, Command Bus, CRUD-core) is well-architected and reusable. Almost nothing must be *destroyed*; most work is **additive** (new enums, new tables, extend existing) plus **reconciling three conflicting models** (knowledge, policy, memory). The dangerous debt is the **~55-enum backlog** and the **deferred `createdBy`/`updatedBy` actor FK** in `_base.ts`. **Recommendation: GO for a staged, reversible implementation — but build shared backbones first, do NOT attempt one giant migration, and start with foundation + Governance/Policy/Identity, not the cognitive layer.**

---

## 2. Current Implementation Inventory

Storage-agnostic layering (real): `UI → Service → Repository → PersistenceAdapter → Storage Provider`. Active provider = **memory**. Nothing is persisted to a DB.

| Domain | Current files (schema + notable features) | Current tables | Current enums used | Lifecycle | Health | Service/Repo/Store | Command Bus | UI | Persistence |
|---|---|---|---|---|---|---|---|---|---|
| **Identity** | `company,organization,department,user,role,permission,membership.ts`; `features/organization` | companies, organizations, departments, users, roles, permissions, memberships | roleType, permissionScope, lifecycleStatus | `lifecycleStatus` (active/archived/deleted) only | none | crud-core + repository-base | via commands | organization route | memory only |
| **Mission** | — | **none** | — | — | — | — | — | — | **absent** |
| **Goal** | — (UI: `goals.png`, planning components) | **none** | — | — | — | `features/planning` (partial) | — | goals view (mock) | **absent** |
| **Plan** | — | **none** | — | — | — | `features/planning`, `task-planning` | — | planning UI | **absent** |
| **Task** | `task.ts`; `features/task-planning` | tasks | taskStatus | `taskStatus` (pending/running/blocked/completed/failed) | none | crud | via commands | workflows view | memory |
| **Workflow** | `workflow.ts`; `features/workflows,workflow-crud,orchestration` | workflows | — (name/desc only) | none (no enum) | none | crud + orchestration | via commands | workflows route | memory |
| **Command** | `command.ts,command-audit.ts`; `features/commands` (dispatcher, pipeline, registry, history) | commands, command_audit | commandStatus, commandSource, approvalState, stageStatus | `commandStatus` + `lifecycle` jsonb | none | **full Command Bus** | **native** | command/live-dispatch | memory + audit |
| **Execution** | `execution.ts`; `features/execution,execution-engine,execution-bridge,execution-queue,execution-readiness,offline-execution,runtime-*` | executions | executionStatus | `executionStatus` | none | execution-engine (offline) | via commands | execution-queue route | memory |
| **Agent** | `agent.ts`; `features/agents,agent-crud,agent-context,agent-reasoning` | agents | — (name/role text) | none | none | agent-crud | via commands | agents route | memory |
| **Working Memory** | — (UI: `features/memory-engine`, `agent-context`) | **none** | — | — | — | memory-engine (partial/mock) | — | memory-engine UI | **absent** |
| **Long-term Memory** | `memory.ts`; `features/memory,memory-crud,memory-engine` | memories | memoryKind | none | none | memory-crud | via commands | memory route | memory |
| **Knowledge** | `knowledge.ts`; `features/knowledge,knowledge-crud,knowledge-graph` | knowledge_nodes, knowledge_edges | — (graph) | none | none | knowledge-crud | via commands | knowledge route | memory |
| **Reasoning** | `reasoning.ts`; `features/reasoning,agent-reasoning,intelligence` | reasoning_traces | — (confidence int) | none | none | reasoning services | via commands | reasoning UI | memory |
| **Learning** | — (UI: `features/intelligence`) | **none** | — | — | — | intelligence (partial) | — | intelligence UI | **absent** |
| **Governance** | `approval.ts`; `features/governance` (approvals, audit, compliance, risk, metrics, permissions, timeline) | approvals | approvalState | approvalState | none | governance services (in-memory) | via commands | approvals/governance UI | memory |
| **Policy** | `policy.ts`; `features/policy` (14 engines: policy/rule/decision/compliance/constraint/risk/permission/approval/audit) | policies | — (status text) | text `status` | none | **rich policy engines (in-memory)** | via commands | policy UI | memory |
| **Providers/Integrations** | `provider.ts,integration.ts,registry.ts`; `features/provider-*,providers,integrations,registries,registry-crud` | providers, integrations, registries | providerStatus, integrationStatus | providerStatus | registry.health int | registry-crud | via commands | providers/integrations/registries routes | memory |
| **Support tables** | `telemetry,conversation,document,notification.ts` | telemetry_events, conversations, messages, documents, notifications | notificationStatus | — | — | — | partial | events/tickets routes | memory |

**Cross-cutting current state:**
- **`_base.ts`:** `rootColumns` (id, createdAt, **createdBy uuid — NO FK**, updatedAt, **updatedBy uuid — NO FK**, version int, lifecycleStatus, deletedAt) + `tenantColumns` (adds tenantId FK → companies). Versioning + soft-delete + tenant already foundational. Actor FK **deferred** ("added when the identity domain is wired" — never wired).
- **Audit:** `command_audit` table exists (command-scoped, `simulation` boolean). No generic immutable audit sink.
- **Events:** mock only.
- **Migrations:** none generated.

---

## 3. Specification Coverage Matrix

| Spec | Domain | Classification | Evidence |
|---|---|---|---|
| 34 | Identity | **Partially Implemented** | Tables (company/org/dept/user/role/permission/membership) exist; roleType/permissionScope enums present; but no agent-as-full-actor, no actor-ref abstraction, no lifecycle state machine, no emergency/delegation, no audit trail per spec. |
| 35 | Mission | **Not Implemented** | No `missions` table, no `missionState` enum, no ratification. |
| 36 | Goal | **Not Implemented** | No `goals` table/enums; only UI mock + partial `planning`. |
| 37 | Plan | **Not Implemented** | No `plans` table/enums; partial `planning`/`task-planning` features. |
| 38 | Task | **Partially Implemented** | `tasks` table + `taskStatus` (5 states) exist, but coarse vs spec's 11-state lifecycle + health; no work-package/plan binding, no acceptance/retry/timeout. |
| 39 | Workflow | **Partially Implemented** | `workflows` table (name/desc) + `orchestration` feature; **no lifecycle/health enums**, no execution graph, no recovery model. |
| 40 | Command | **Partially Implemented / Strong** | Real Command Bus + `commands`/`command_audit` tables + commandStatus/Source/approvalState; but `lifecycle` is jsonb not typed, no idempotencyKey/correlationId columns (traceId only), no targetType enum, no provider-agnostic resolution model. |
| 41 | Execution | **Partially Implemented** | `executions` table + executionStatus + execution-engine (offline); no effect ledger, no idempotency store, no provider resolution/failover/circuit-breaker, no lifecycle/health per spec. |
| 42 | Agent | **Partially Implemented** | `agents` table (name/role/dept) + agent-crud/context/reasoning; **no ceiling, capabilities, limits, lifecycle/health, versioning** per spec. |
| 43 | Working Memory | **Not Implemented** | No table/enums; `memory-engine`/`agent-context` are UI/mock. |
| 44 | Long-term Memory | **Conflicting** | `memories` table exists but flat (kind/content/importance); spec requires scope/namespace/provenance/lineage/trust/lifecycle/health — a different model. |
| 45 | Knowledge | **Conflicting** | `knowledge_nodes`/`knowledge_edges` = **graph model**; spec 45 = **canonical-truth** (domain/scope/ratification/versioning/authority). Fundamentally different shape. |
| 46 | Reasoning | **Partially Implemented** | `reasoning_traces` (confidence/stages/evidence jsonb) roughly matches session-trace intent; no lifecycle/health, no conclusion contract, no escalation. |
| 47 | Learning | **Not Implemented** | No table/enums; `features/intelligence` is UI/partial. |
| 48 | Consolidation | **Not Implemented (by nature)** | Reference doc; its shared backbones (audit sink, event bus, lifecycle/health lib, governance-gate, authority-enforcement) are **not built**. |
| 49 | Governance | **Partially Implemented / Fragmented** | `approvals` table + `features/governance` (approvals/audit/compliance/risk/metrics/permissions) exist **in-memory**, but no `governance_sessions`/`decision_records`, no single authorization engine, no decision types/domains/gates enums. |
| 50 | Policy | **Partially Implemented / Fragmented** | `policies` table (name/status text) + **14 policy engines** exist in-memory; but no rule-type/domain/scope/authority enums, no ratification lifecycle, no enforcement-contract model, no anatomy fields. |

**Roll-up:** Implemented: 0 fully. Partially: 10 (34,38,39,40,41,42,46,49,50 + supporting). Not Implemented: 5 (35,36,37,43,47) + 48 (backbones). Conflicting: 2 (44 memory, 45 knowledge). Legacy/Superseded: knowledge-graph model is superseded-in-intent by spec 45 but still powers UI. Unknown: 0 (all grounded).

---

## 4. Enum Gap Analysis

**Current enums (14, in `_enums.ts`):** `lifecycle_status, approval_state, command_status, command_source, stage_status, execution_status, provider_status, role_type, permission_scope, memory_kind, integration_status, task_status, notification_status`. (14th is a duplicate-count artifact; 13 distinct + the base helper.)

**Canonical enum catalog (spec-required vs current):**

| Enum | Spec source | Current | Required | Conflict | Migration risk | Recommended action |
|---|---|---|---|---|---|---|
| `lifecycle_status` | _base | ✅ active/archived/deleted | keep (row-level soft-delete) | — | none | Keep; it is the base soft-delete, distinct from domain lifecycles |
| `approval_state` | 48/49/50 | ✅ not-required/pending/approved/rejected | keep — **canonical approval primitive** | — | low | Reuse everywhere (Goal/Plan/Task/WF/Command/Policy/Governance) |
| `command_status` | 40 | ✅ queued/running/completed/cancelled/failed/simulated | keep as coarse projection | overlaps new `command_lifecycle_status` | med | Keep as runtime projection; add `command_lifecycle_status` superset |
| `execution_status` | 41 | ✅ | keep as projection | overlaps `execution_lifecycle_status` | med | Same pattern — coarse projection + new governed enum |
| `provider_status` | 40/41 (posture) | ✅ simulation/dry-run/read-only/blocked/live | keep — **canonical posture** | — | low | Reuse as simulation-mode / environment posture everywhere |
| `role_type` | 34 | ✅ owner/director/operator/auditor/member | keep | — | low | Reuse for authority bands |
| `permission_scope` | 34/49/50 | ✅ command/registry/governance/finance/hr/legal/platform | extend? | maybe | low | Reuse; consider new scopes as needed |
| `memory_kind` | 44 | ✅ episodic/semantic/procedural | keep | — | low | Reuse in new LTM model |
| `stage_status` | 40 (pipeline) | ✅ passed/failed/skipped/done | keep (Command Bus internal) | — | none | Keep |
| `task_status` | 38 | ✅ 5 states | **superset needed** | yes | med | Add `task_lifecycle_status` (11 states) + `task_health`; keep old as projection |
| `notification_status`, `integration_status` | support | ✅ | keep | — | none | Keep |
| **`mission_state`** | 35 | ❌ | draft/proposed/ratified/superseded/archived | new | low | **Add** (+ note: naming `*_state` vs `*_lifecycle_status` — resolve convention) |
| **`goal_lifecycle_status` / `goal_health` / `goal_scope` / `goal_priority`** | 36 | ❌ | per spec | new | low | **Add** |
| **`plan_lifecycle_status` / `plan_health` / `plan_scope` / `plan_priority`** | 37 | ❌ | per spec | new | low | **Add** |
| **`task_lifecycle_status` / `task_health` / `task_execution_type` / `task_priority` / `task_risk_level`** | 38 | ❌ | per spec | new (vs old task_status) | med | **Add**; reconcile with `task_status` |
| **`workflow_lifecycle_status` / `workflow_health` / `workflow_execution_strategy` / `workflow_priority`** | 39 | ❌ | per spec | new | low | **Add** |
| **`command_lifecycle_status` / `command_health` / `command_target_type` / `command_execution_type` / `command_priority`** | 40 | ❌ | per spec | overlaps command_status | med | **Add**; keep command_status as projection |
| **`execution_lifecycle_status` / `execution_health`** | 41 | ❌ | per spec | overlaps execution_status | med | **Add**; keep execution_status as projection |
| **`agent_lifecycle_status` / `agent_health` / `agent_type` / `agent_capability` / `agent_risk_level`** | 42 | ❌ | per spec | new | low | **Add** |
| **`working_memory_lifecycle_status` / `working_memory_health`** | 43 | ❌ | per spec | new | low | **Add** |
| **`memory_lifecycle_status` / `memory_health` / `memory_scope`** | 44 | ❌ | per spec | new | med | **Add** (extends existing memory_kind) |
| **`knowledge_lifecycle_status` / `knowledge_health` / `knowledge_scope` / `knowledge_authority`** | 45 | ❌ | per spec | conflicts w/ graph model | **high** | **Add** + resolve knowledge model conflict |
| **`reasoning_lifecycle_status` / `reasoning_health` / `reasoning_strategy`** | 46 | ❌ | per spec | new | low | **Add** |
| **`learning_lifecycle_status` / `learning_health` / `learning_type` / `improvement_proposal_type`** | 47 | ❌ | per spec | new | low | **Add** |
| **`governance_lifecycle_status` / `governance_health` / `governance_domain` / `governance_decision_type` / `risk_class` / `voting_mode` / `governance_gate_type`** | 49 | ❌ | per spec | new | med | **Add** |
| **`policy_lifecycle_status` / `policy_health` / `policy_domain` / `rule_type` / `policy_scope` / `policy_authority`** | 50 | ❌ | policy `status` text today | **conflict (text→enum)** | med | **Add** + migrate policy.status text → enum |

**Explicit findings:**
- **Duplicate enums:** none literal; but **lifecycle overlap** — `command_status`/`execution_status`/`task_status` are coarse; specs add governed supersets. Canonical resolution (Spec 48 §6.2): keep old as **runtime projection**, add governed `*_lifecycle_status`.
- **Naming inconsistencies:** Mission spec used `missionState`; all others use `*LifecycleStatus`. **Resolve to one convention before migration** (recommend `*_lifecycle_status`; Mission is the outlier).
- **Lifecycle/health mixing:** current tables mix them (e.g. `registry.health` is an int; `taskStatus` conflates). Canonical (Spec 48 §6): **two separate enum fields per stateful table.** Every new domain must split them.
- **Obsolete enums:** none to delete; all current enums have a canonical home.
- **Enums used by multiple domains (canonical, share — do NOT duplicate):** `approval_state`, `provider_status` (posture), `role_type`, `permission_scope`, `lifecycle_status`, `memory_kind`.
- **Enums missing from `_enums.ts`:** ~48 net-new (all `*_lifecycle_status`, `*_health`, `*_scope`, `*_type`, `*_domain`, `risk_class`, `voting_mode`, `rule_type`).

**Count:** current 13 distinct → target ~61 → **~48 net-new enums.**

---

## 5. Schema Gap Analysis (per affected table)

Legend: **+add**, **−remove**, **→rename**, **⚠conflict**.

| Table | Current | Required additions | Removals/renames | New indexes | New constraints | New relationships | Actor-ref | Tenant | Audit | Backward-compat risk |
|---|---|---|---|---|---|---|---|---|---|---|
| **_base (contract)** | rootColumns/tenantColumns; createdBy/updatedBy uuid **no FK** | + actor-ref resolution (`{actorType,actorId}` or FK) | wire deferred FK | — | FK on createdBy/updatedBy | actor domain | already | — | **P0 — affects every table** | Low (additive; NULLs today) |
| **companies/users/roles/permissions/memberships** (Identity) | present, minimal | + lifecycle state machine fields, + emergency/delegation grant records, + audit hooks | — | unique indexes present | — | agent-as-actor link | wire | ✅ | add audit | Low |
| **agents** | dept/name/role | + humanOwnerRef, managerRef, capabilities, skills, tools, limits, costLimits, agent_type, lifecycle+health, version | — | tenant/dept idx | ceiling constraint (app-level) | owner/manager/dept | wire | ✅ | add | Med |
| **missions** | ❌ | **new table** (statement, principles, missionState, ratifiedBy, supersedesId, effectiveFrom/Until, version) | — | partial-unique (one active/tenant) | single-active enforcement | company | wire | ✅ | add | None (new) |
| **goals** | ❌ | **new table** (missionRef, parentGoalId, ownerRef, scope, priority, lifecycle+health, successMetrics, targets, review) | — | tenant/parent idx | acyclic, progress-ceiling | mission/parent | wire | ✅ | add | None |
| **plans** | ❌ | **new table** (goalRef, ownerRef, strategy, milestones, workPackages, gates, readiness, lifecycle+health) | — | tenant/goal idx | acyclic | goal | wire | ✅ | add | None |
| **tasks** | workflowId/title/taskStatus | + planRef, workPackageRef, goalRef, missionRef, ownerRef, assigned refs, execution_type, inputs/outputs/acceptance/retry/timeout, lifecycle+health, version | keep taskStatus as projection | tenant/plan idx | acyclic deps | plan/wp/owner | wire | **⚠ add tenantId** | add | Med (existing rows) |
| **workflows** | name/desc | + goalRef/planRef/taskRefs, ownerRef, executionGraph, strategy, recovery, gates, lifecycle+health, version | — | tenant idx | acyclic DAG | plan/tasks | wire | **⚠ add tenantId** | add | Med |
| **commands** | traceId/type/source/actor/status/approvalState/context/payload/lifecycle jsonb | + workflowNodeRef, taskRef/…/missionRef, target/targetType, executionType, expectedResult, idempotencyKey, correlationId, simulationMode, command_lifecycle_status, command_health | typed `lifecycle` jsonb → structured | idempotency-unique idx, correlation idx | idempotency uniqueness | full lineage | actor→ref | **⚠ add tenantId** | link command_audit | **High (Command Bus depends on shape)** |
| **executions** | workflowId/status/retries/duration | + commandRef, correlationId, idempotencyKey, resolvedProvider, attempts, effectRef, execution_lifecycle_status+health | — | tenant/command idx | one-command-per-run | command | wire | **⚠ add tenantId** | effect ledger | Med |
| **command_audit** | commandId/action/entry/prev/new/simulation | generalize → **immutable audit sink** (all entities) OR keep + add generic sink | — | entity idx | append-only | all | actorRef | add tenant | **is the audit seed** | Low |
| **memories** (LTM) | agentId/kind/content/importance/sourceCommandId | ⚠ + scope, namespace, collection, provenance, sourceAttribution, confidence, trust, lineage, memory_lifecycle_status+health, ownerRef | keep kind | tenant/agent/scope idx | promotion-only write | agent/owner | add tenant | add | Med (model shift) |
| **working_memory** | ❌ | **new table** (agentRef, sessionRef, context frames, tokenBudget, expiration, wm_lifecycle+health) | — | agent/session idx | one-session | agent | ✅ | light | None |
| **knowledge_nodes/edges** | graph model | ⚠ **reconcile**: add canonical-truth `knowledge` table (domain/scope/statement/ratification/authority/lifecycle+health/lineage/provenance) **alongside** graph, OR migrate | possibly retire graph-as-truth (keep for viz) | tenant/domain idx | canonical-uniqueness, conflict-free | steward/mission | wire | add tenant | add | **High (UI uses graph)** |
| **reasoning_traces** | commandId/confidence/stages/evidence | + agentRef, workingMemoryRef, question, conclusion, reasoning_lifecycle_status+health, strategy, correlationId | — | tenant/agent idx | — | agent/wm | add tenant | add | Low |
| **learning** | ❌ | **new tables** (learning_sessions + improvement_proposals: type, subject, analysis, safety, proposals, lifecycle+health, reversible) | — | tenant/subject idx | reversibility, authority-preservation | subject/target | ✅ | add | None |
| **governance** | approvals (title/summary/risk/state) | + **governance_sessions + decision_records** (domain, decisionType, subject, gates, chain, riskClass, authoritySource, justification, evidence, lifecycle+health, version) | keep approvals or fold in | tenant/subject idx | separation-of-duties, sole-authority | all subjects | actorRef | add tenant | **central audit** | Med |
| **policies** | name/desc/status text | ⚠ + domain, category, ruleType, scope, statement, conditions, constraints, enforcementContract, owner/steward, authorityLevel, applicability, effective/expiration, lineage, provenance, rationale, references, review, policy_lifecycle_status+health | status text → policy_lifecycle_status enum | tenant/domain idx | scope-consistency, conflict-free, ratified-only | steward/knowledge refs | actorRef | add tenant | add | Med (status text→enum) |
| **providers/integrations/registries** | present | + certification (governance), lifecycle/health alignment | — | present | — | governance certification | — | — | add | Low |

**Cross-cutting schema implications:**
- **Tenant boundary:** several core tables (tasks, workflows, commands, executions, memories, knowledge, reasoning, policies) currently **lack `tenantId`** (they use `rootColumns` not `tenantColumns`, or predate tenancy). **Spec 48 §7.11 requires tenantId NOT NULL on every tenant-owned row.** This is a significant, careful migration.
- **Audit:** `command_audit` is the only audit table and is command-scoped. Spec 48 §7.3 requires an **immutable audit sink for all entities**, transactional with mutation. Must be generalized/added.
- **Actor-ref:** the deferred `createdBy`/`updatedBy` FK (per `_base.ts` comment) touches **every table** — the single highest-fan-out change.

---

## 6. Shared Backbone Gap Analysis (Spec 48)

| Backbone | Current state | Gap | Priority |
|---|---|---|---|
| **Canonical actor reference** | `createdBy`/`updatedBy` uuid, **no FK**, no `{actorType,actorId}` | Define actor-ref (Identity §3.9) + wire FKs everywhere | **P0** |
| **Lifecycle/health shared contract** | Mixed per table; no shared lib; `registry.health` int, `taskStatus` conflates | Build one two-axis contract (Spec 48 §6) all domains inherit | **P0** |
| **Immutable audit sink** | `command_audit` only (command-scoped) | Generalize to all-entity append-only sink, transactional | **P0** |
| **Canonical event envelope** | none (mock events) | Define `{eventId,type,tenantId,actorRef,entityId,version,correlationId,causationId,occurredAt,payload}` | **P0** |
| **Event bus** | `features/events/mock.ts` static array | Real bus + transactional emission + idempotent consumption; **decide event-sourced vs state-with-events first** | **P0–P1** |
| **Governance gate contract** | fragmented (`features/governance`, `features/policy` engines, in-memory) | One governance-gate contract (Spec 49) all module gates route through | **P1** |
| **Policy enforcement contract** | `features/policy` engines (rich, in-memory) | Formalize enforcement-contract → Governance-gate/Execution mechanism | **P1** |
| **Human review inbox** | `features/human-approval`, `approvals` table | One canonical human-review/approval inbox (Governance-owned) | **P1** |
| **Authority stack enforcement** | scattered/implicit | Two canonical checkpoints (governance gate + Execution final gate, Spec 48 §9.1) | **P1** |
| **Provenance** | partial (`sourceCommandId` on memory) | Standard provenance fields on promoted/derived entities | **P2** |
| **Lineage** | `version` int exists; no supersedes edges | Add `supersedes*Id`/`supersededBy*Id` pattern | **P2** |
| **Versioning** | `version` int in `_base.ts` ✅ | Add domain `*Version` for material change; wire correction-creates-version | **P2** |
| **Replay** | Command Bus history exists | Extend to session/effect replay from immutable records | **P3** |
| **Simulation** | Command Bus `simulation` flag ✅; provider_status posture ✅ | Propagate posture Mission→Command→Execution; effect-free guarantee | **P2** |
| **Idempotency** | none (commands have traceId, no idempotencyKey/ledger) | Add idempotencyKey + effect ledger (Execution) | **P3 (Execution)** |
| **Correlation** | `traceId` on commands (partial) | Standard correlationId propagated through the chain | **P2** |

**Assessment:** the backbones are the **critical path.** Several are *seeded* (audit via command_audit, simulation flag, version int, traceId) but none is *canonical/general*. Building these first prevents 14 divergent reimplementations (Technical Debt TD-3).

---

## 7. Domain-by-Domain Gap Analysis

Format: exists / reuse / missing / conflicts / deprecate / dependencies / complexity / priority.

- **Identity (34):** exists: 7 tables + roleType/permissionScope. reuse: all. missing: actor-ref, lifecycle state machine, emergency/delegation, per-entity audit. conflicts: none. deprecate: none. deps: _base actor FK. complexity: **Med**. priority: **P1**.
- **Mission (35):** exists: nothing. reuse: `approval_state`, `_base`. missing: whole table + `mission_state` + ratification (via Governance). conflicts: none. deps: Identity, Governance. complexity: **Low**. priority: **P2**.
- **Goal (36):** exists: UI/planning partial. missing: table + 4 enums + Mission binding. deps: Mission, Governance. complexity: **Low–Med**. priority: **P2**.
- **Plan (37):** exists: planning/task-planning features. missing: table + enums + Goal binding + readiness. deps: Goal. complexity: **Med**. priority: **P2**.
- **Task (38):** exists: `tasks`+taskStatus. reuse: table base. missing: 5 enums, plan/wp binding, acceptance/retry/timeout, health. conflicts: taskStatus coarse. deprecate: none (project taskStatus). deps: Plan. complexity: **Med**. priority: **P3**.
- **Workflow (39):** exists: `workflows`+orchestration. missing: enums, exec graph, recovery, health, tenantId. deps: Task. complexity: **Med–High** (graph). priority: **P3**.
- **Command (40):** exists: **strong Command Bus** + tables. reuse: bus, dispatcher, audit. missing: typed lifecycle, idempotencyKey, correlationId, targetType, full lineage, tenantId. conflicts: `lifecycle` jsonb vs typed. **deprecate: nothing — extend carefully.** deps: Workflow. complexity: **High (bus regression risk)**. priority: **P3**.
- **Execution (41):** exists: execution-engine (offline), `executions`. missing: effect ledger, idempotency store, provider resolution/failover/circuit-breaker, health. deps: Command, Providers. complexity: **High**. priority: **P3**.
- **Agent (42):** exists: `agents`+agent-crud/context. missing: ceiling, capabilities, limits, lifecycle/health, versioning, owner/manager. deps: Identity, Governance. complexity: **Med**. priority: **P2–P3**.
- **Working Memory (43):** exists: memory-engine UI. missing: whole table + enums. deps: Agent. complexity: **Low–Med**. priority: **P4**.
- **Long-term Memory (44):** exists: `memories` flat. reuse: memory_kind, table base. missing: scope/namespace/provenance/lineage/trust/lifecycle/health. **conflicts: flat model vs canonical.** deps: Working Memory, Governance (promotion). complexity: **Med**. priority: **P4**.
- **Knowledge (45):** exists: graph nodes/edges. **conflicts: graph vs canonical-truth — biggest model conflict.** reuse: graph for visualization. missing: canonical `knowledge` table + ratification. deprecate: graph-as-truth semantics (keep graph for viz). deps: LTM (promotion), Governance (ratification). complexity: **High**. priority: **P4**.
- **Reasoning (46):** exists: `reasoning_traces`. reuse: table. missing: session/conclusion contract, lifecycle/health, escalation, citations. deps: WM/LTM/Knowledge. complexity: **Med**. priority: **P4**.
- **Learning (47):** exists: intelligence UI. missing: whole tables + enums + safety suite. deps: Reasoning, Execution outcomes, Governance. complexity: **Med–High**. priority: **P5**.
- **Governance (49):** exists: approvals + `features/governance` (in-memory) + `features/policy` engines. reuse: **substantial engine code**. missing: sessions/decision_records tables, decision/domain/gate enums, single engine, sole-authority enforcement. conflicts: fragmented across two feature dirs. deps: Identity, Policy, audit/event backbones. complexity: **High**. priority: **P1**.
- **Policy (50):** exists: `policies` (thin) + **14 policy engines** (rich, in-memory). reuse: engines. missing: rich schema, 6 enums, ratification lifecycle, enforcement-contract model, anatomy. conflicts: status text vs enum. deps: Governance. complexity: **Med–High**. priority: **P1**.

---

## 8. Dependency Graph (implementation order)

```
[P0 FOUNDATION]
  _base actor-ref + FK wiring
  two-axis lifecycle/health shared contract
  immutable audit sink (generalize command_audit)
  canonical event envelope + bus (decide event-sourcing)
  canonical enum catalog (naming convention resolved)
        │
        ▼
[P1 CONSTITUTION]
  Identity reconciliation ──► Policy ──► Governance
  (Governance depends on Identity+Policy; Policy depends on Governance for ratification → co-build,
   bootstrap order: Identity → Policy(schema) → Governance(engine) → Policy ratification wired)
        │
        ▼
[P2 STRATEGIC SPINE]
  Mission ──► Goal ──► Plan        (each ratified/approved via Governance)
  Agent    (depends Identity+Governance; parallel to Mission/Goal)
        │
        ▼
[P3 EXECUTION SPINE]
  Task ──► Workflow ──► Command ──► Execution
  (Command extends existing bus carefully; Execution adds effect ledger + provider resolution)
        │
        ▼
[P4 COGNITIVE SUBSTRATE]
  Working Memory ──► Long-term Memory ──► Knowledge ──► Reasoning
  (promotion/ratification via Governance; Knowledge reconciles graph vs canonical)
        │
        ▼
[P5 IMPROVEMENT + PRODUCT]
  Learning (consumes Execution/Reasoning outcomes, proposes via Governance)
  UI reconciliation to new contracts
```

**Circular-dependency note (resolved):** Policy↔Governance appears circular (Policy ratified by Governance; Governance applies Policy). Bootstrap linearly: build **Identity → Policy schema (rules as data) → Governance engine → then wire Policy ratification through Governance.** No runtime cycle if ratification is a Governance decision bound by Law/Security (above Policy), per Spec 50 §Failure #48.

---

## 9. Migration Strategy (staged, reversible, dependency-ordered)

**Principle: never one giant migration. Each stage is a small, forward-only-but-reversible Drizzle migration with its own validation.** No `src/db/migrations` exists yet — Stage 0 creates the baseline.

| Stage | Prerequisites | Affected tables | Data migration | Rollback | Validation | Risk |
|---|---|---|---|---|---|---|
| **S0 — Baseline** | none | (snapshot current schema) | none | drop generated baseline | `drizzle-kit generate` produces clean baseline; app still uses memory adapter | **Low** |
| **S1 — Shared enums + base contract** | S0; naming convention decided | `_enums.ts` (+~48 enums), `_base.ts` (actor-ref) | none (additive) | drop new enums | typecheck passes; enums unused-but-defined; no table change yet | **Low** |
| **S2 — Actor-reference wiring** | S1 | all (createdBy/updatedBy FK) | backfill NULLs allowed | drop FK constraints | FK constraints valid; existing NULLs tolerated | **Med** (fan-out) |
| **S3 — Audit + event foundations** | S1 | generalize `command_audit` → audit sink; add event log | migrate command_audit rows | revert to command-scoped | audit writes transactional; event envelope validates | **Med** |
| **S4 — Governance + Policy** | S2,S3 | add `governance_sessions`,`decision_records`; extend `policies` (+enums, status→enum) | migrate policy.status text→enum | drop new tables; enum→text | ratification pipeline runs in-memory→schema; separation-of-duties enforced | **Med** |
| **S5 — Identity reconciliation** | S2,S4 | identity tables (lifecycle, delegation/emergency, audit hooks) | none (additive) | drop additions | identity graph resolves; ceiling computable | **Med** |
| **S6 — Mission/Goal/Plan/Task** | S4,S5 | +missions,+goals,+plans; extend tasks (+tenantId,+enums,+binding) | add tenantId to tasks (careful) | drop new; drop task cols | cognitive chain derivation valid; alignment re-validation | **Med** |
| **S7 — Workflow/Command/Execution** | S6 | extend workflows(+tenantId,graph); extend commands(+idempotency,correlation,typed lifecycle,+tenantId); extend executions(+ledger) | migrate command `lifecycle` jsonb→structured (dual-write window) | keep jsonb; revert cols | **Command Bus regression suite green**; idempotency no-op works | **High** |
| **S8 — Agent** | S5,S6 | extend agents(+owner/ceiling/capabilities/limits/enums) | none (additive) | drop cols | ceiling enforced; no self-elevation | **Med** |
| **S9 — Memory/Knowledge/Reasoning/Learning** | S6,S7,S8 | extend memories(+scope/provenance); add working_memory; add canonical knowledge (alongside graph); extend reasoning; add learning | knowledge graph→canonical (dual-model window) | drop new; keep graph | promotion/ratification flows; Knowledge overrides Memory; graph UI still works | **High** |

**Reversibility rule:** every stage additive-first; destructive changes (task tenantId, command lifecycle typing, knowledge model) use **dual-write/dual-read windows** before removing the old shape. No stage removes a working feature before its replacement is validated.

---

## 10. Risk Register

| Risk | Likelihood | Impact | Grounded cause | Mitigation |
|---|---|---|---|---|
| **Schema lock** | Med | High | ~48 enums + tenantId on core tables in one shot | Stage; additive-first; S1 enums-only |
| **Data-loss** | Low | High | knowledge graph→canonical, command lifecycle typing | Dual-model/dual-write windows; never drop before validate |
| **Enum incompatibility** | Med | Med | task_status/command_status/execution_status vs new supersets; `missionState` naming outlier | Keep old as projection; resolve naming in S1 |
| **Hydration/runtime breakage** | Med | High | UI + Command Bus depend on current `commands`/`lifecycle` shape; app runs on **memory adapter** | Keep memory adapter active; schema changes are inert until adapter wired |
| **Command Bus regression** | Med | **High** | dispatcher pipeline tightly coupled to command shape (S7) | Regression suite before/after; extend not replace; dual-shape window |
| **Audit inconsistency** | Med | High | generalizing command_audit; transactional emission not yet real | Build audit sink before domain tables (S3); test transactionality |
| **Tenant isolation failure** | Med | High | tasks/workflows/commands/executions/memories/knowledge/policies **lack tenantId today** | S2/S6/S7 add tenantId with NOT NULL + FK; backfill company; test cross-tenant refusal |
| **Circular dependency** | Low | Med | Policy↔Governance | Linear bootstrap (Identity→Policy schema→Governance→wire ratification) |
| **Migration rollback failure** | Med | High | forward-only drizzle prefix; no baseline yet | S0 baseline; keep each stage small + reversible; test down-path |
| **UI contract breakage** | Med | Med | components bound to current mock/feature shapes | UI reconciliation deferred to P5; keep feature adapters stable |
| **Stale seed data** | Med | Low | `features/events/mock.ts` + in-memory seeds | Mark seeds; migrate to schema-shaped fixtures gradually |
| **Adapter semantic drift** | Med | Med | memory adapter vs future Supabase adapter (sync vs async; Supabase = NotImplemented) | Freeze adapter interface; implement Supabase behind same contract; snapshot cache for sync surface |

---

## 11. Recommended Implementation Roadmap

- **P0 Foundation:** enum catalog + naming convention; `_base.ts` actor-ref + FK; two-axis lifecycle/health shared contract; immutable audit sink; canonical event envelope; **decision: event-sourced vs state-with-events**. (Stages S0–S3.)
- **P1 Governance & Identity:** Policy schema + Governance sessions/decisions + engine consolidation (`features/governance` + `features/policy` → one authorization engine); Identity reconciliation; single human-review inbox; authority-stack enforcement checkpoints. (S4–S5.)
- **P2 Strategic Spine:** Mission → Goal → Plan; Agent (owner/ceiling/capabilities). (S6, S8.)
- **P3 Execution Spine:** Task → Workflow → Command (extend bus carefully) → Execution (effect ledger, provider resolution, idempotency). (S7.)
- **P4 Cognitive Layer:** Working Memory → Long-term Memory → Knowledge (reconcile graph/canonical) → Reasoning. (S9.)
- **P5 UI & Product Integration:** rebind components to real schema-backed services; Supabase adapter implementation; Learning; observability surfaces. (Post-S9.)

---

## 12. Explicit Non-Actions (do NOT do yet)

- **No giant migration.** One migration for all 17 domains = schema lock + rollback failure. Stage it.
- **No UI redesign.** Components stay on current feature adapters until P5.
- **No new domains.** The 17 specs are the complete set; build them, invent nothing.
- **No provider integration.** No real LLM/API/tool calls; Execution stays offline until P3+ and even then gated.
- **No Supabase cutover.** Keep `ACTIVE_PROVIDER = "memory"`; Supabase adapter stays NotImplemented until its contract + schema are ready and validated.
- **No business-data mutation.** Command Bus stays offline ("nothing executes"); no real effects.
- **No removal of working features before replacement exists.** Knowledge graph, policy engines, governance features stay live until their schema-backed replacements are validated (dual-model windows).
- **No dropping of `command_status`/`task_status`/`execution_status`** — they become projections, not deletions.
- **No `missionState`→rename churn mid-stream** — decide the convention once, in S1.
- **No live DB connection** until S0 baseline + a validated stage need it.

---

## 13. Final Recommendation

**First phase to build: P0 Foundation (Stages S0–S1), then S2 actor-ref.** Nothing domain-specific until the shared backbones and enum catalog exist — otherwise 14 domains reimplement lifecycle/health/audit/events divergently (TD-3).

**Exact files likely to change (P0/S0–S2):**
- `src/db/schema/_enums.ts` (+~48 enums, one convention)
- `src/db/schema/_base.ts` (actor-ref + FK wiring)
- `src/db/schema/command-audit.ts` (generalize toward audit sink) — *or new `audit.ts`*
- new `src/db/schema/event.ts` (event envelope/log)
- `src/db/migrations/*` (created fresh — S0 baseline, S1, S2)
- `drizzle.config.ts` (unchanged; already points at migrations out-dir)

**Exact files that MUST remain untouched (P0):**
- `src/features/commands/*` (dispatcher, pipeline, registry, history) — Command Bus; do not touch until S7, and then extend-only
- `src/features/persistence/storage-manager.ts` — keep `ACTIVE_PROVIDER = "memory"`
- `src/features/persistence/memory-adapter.ts`, `adapter.ts`, `repository-base.ts` — freeze the interface
- `src/features/persistence/supabase-postgres-adapter.ts` — leave NotImplemented
- all `src/app/(dashboard)/*` routes and `src/components/*` — UI untouched until P5
- `src/features/events/mock.ts` — leave until real bus replaces it (P0 adds the real one alongside)

**Migration count estimate:** **~9 staged migrations (S0–S9)**, each small. Not 1, not 50. S1 (enums) is large-but-inert; S7 (Command/Execution) and S9 (Knowledge/Memory) are the two high-risk stages needing dual-shape windows.

**Top 10 blockers:**
1. Naming convention undecided (`missionState` vs `*_lifecycle_status`) — must resolve before any enum migration.
2. Event-sourcing decision (source-of-truth vs state+events) — gates the event/audit backbone design.
3. Deferred `createdBy`/`updatedBy` actor FK — highest fan-out; blocks per-entity audit.
4. Core tables lack `tenantId` (tasks/workflows/commands/executions/memories/knowledge/policies) — tenant-isolation invariant unmet.
5. Command Bus coupling to `commands.lifecycle` jsonb — S7 regression risk.
6. Knowledge graph vs canonical-truth model conflict — needs a reconciliation decision.
7. Memory flat vs scoped/provenanced model — model shift.
8. Governance/Policy logic fragmented across two feature dirs + thin schema — needs consolidation into one engine + real schema.
9. No immutable audit sink / transactional emission — a Spec-48 hard invariant currently unmet.
10. No `src/db/migrations` baseline + Supabase adapter NotImplemented — no persistence path exists yet.

**Go / No-Go:** **GO — with strict staging.** The architecture is coherent and the codebase foundation (base columns, persistence abstraction, Command Bus, CRUD-core, rich policy/governance engines) is genuinely reusable, so this is **mostly additive construction, not rewrite.** The two conditions for GO: (1) build P0 shared backbones **before** any domain, and (2) treat S7 (Command/Execution) and S9 (Knowledge/Memory) as high-risk dual-shape migrations. **No-Go only if** the team attempts a single all-domain migration or cuts over to Supabase before the staged path is validated — both are explicitly out of scope here.

---

*End of Architecture-to-Code Gap Analysis v1.0. Analysis only — no code, schema, migration, or package changes were made. Every classification is grounded in the inspected `apps/dashboard` codebase and Specifications 34–50.*
