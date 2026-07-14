# Task Specification v1.0

> Stage 5 — Task module, complete Enterprise Architecture Specification.
> This document is the permanent architectural reference for Tasks in Hebun AI.
> It specifies the fourth layer of the cognitive hierarchy, beneath Plans/Work Packages and above Workflows. It adds no implementation. It defines boundaries.

**Status:** Definitive · **Scope:** Task module only · **Grounded in:** the schema primitives in `src/db/schema/_base.ts` (`rootColumns`, `tenantColumns`) and `_enums.ts` (`lifecycleStatusEnum`, `approvalStateEnum`, `taskStatusEnum`, `commandStatusEnum`, `executionStatusEnum`, `providerStatusEnum`, `roleTypeEnum`, `permissionScopeEnum`), the Identity Specification v1.0 (doc 34), the Mission Specification v1.0 (doc 35), the Goal Specification v1.0 (doc 36), and the Plan Specification v1.0 (doc 37).

**Position in the cognitive hierarchy:**

```
Mission            ← the North Star of intent (doc 35)
  → Goal           ← measurable desired outcome (doc 36)
    → Plan         ← strategy that decomposes a Goal (doc 37)
      → Work Package ← unit of intent handed from the Plan
        → Task       ← this document — the smallest business unit of work; DESCRIBES work
          → Workflow   — orchestrates the described work into executable Commands
            → Commands   — the executable units
              → Execution  — the ONLY layer that dispatches Commands to providers/LLMs
```

**Authority precedence (unchanged, absolute):**

```
Law and Regulation
  → Security and Compliance Policy
    → Approved Company Policy
      → Mission
        → Goals
          → Plans
            → Tasks         ← subordinate to everything above; never overrides Plan, Goal, Mission, or Policy
              → Workflows
                → Commands
                  → Execution
```

Tasks are where **planning becomes executable description**. A Work Package says *what work is needed*; a Task is the smallest, deterministic, schedulable, assignable, observable, auditable **description of one unit of that work** — its inputs, expected outputs, acceptance criteria, retry/timeout policy, and constraints. A Task **describes** work; it **never performs it.** Performing happens strictly below, in Workflows → Commands → Execution.

---

## 1. Purpose

### Why the Task layer exists

Plans (doc 37) decompose Goals into strategy and hand the Task layer **work packages** — declarative descriptions of what work is needed. But a work package is still coarse: "localize storefront to German" is not yet a discrete, assignable, deterministic unit with defined inputs, outputs, acceptance criteria, and failure handling. Something must break a work package into the **smallest business units of work** that can be individually assigned, scheduled, tracked, retried, and audited — before any of that work is orchestrated or run. Tasks are that layer.

Tasks are the **system of record for every discrete unit of work the company intends to perform in pursuit of a Plan.** A Task is the atom of the work domain: one owner, one work package, one acceptance test, one retry policy, one timeout, one risk level. It is the finest granularity at which the business reasons about *work* — and the last purely descriptive layer before the executable layers (Workflows, Commands, Execution) take over.

Without a Task layer, the platform would jump from strategy (Plans) straight to orchestration (Workflows), and five things would break: work would be unassignable (no atomic unit to give to a person or agent), untrackable (no discrete status to observe), non-deterministic (no defined inputs/outputs/acceptance), unrecoverable (no per-unit retry/timeout policy), and unauditable (no atomic record of intended work). Tasks close that gap and hold the **description boundary**: everything above and including Tasks *describes*; everything below *executes*.

### Business problem it solves

1. **Atomicity of work.** Work must be divisible into the smallest units that can be independently owned, assigned, scheduled, and judged done. Tasks are that atom — one acceptance criterion per unit, one owner per unit.
2. **Determinism and observability.** Every unit of work must have defined inputs, expected outputs, and an acceptance test, so its success is a deterministic question and its progress is observable — not a matter of opinion.
3. **Recoverability and auditability.** Every unit must declare how it retries, when it times out, and what constraints bound it, and must leave an immutable trail — so failure is handled deterministically and every unit of intended work is fully traceable.

### Its responsibility

- Own the lifecycle of every unit of work: `draft → planned → ready → assigned → waiting → running → completed | cancelled | failed → superseded → archived` (governed), separate from health `unknown → healthy / at-risk / blocked` (observed).
- Guarantee every Task belongs to exactly one Plan and exactly one Work Package, and inherits Goal and Mission context.
- Guarantee every Task is owned, defines acceptance criteria, expected outputs, retry policy, timeout policy, dependencies, and execution constraints.
- Describe *how the work is to be judged and bounded* — inputs, outputs, acceptance, retry, timeout, constraints, risk — and hand that description to the Workflow layer as **workflow inputs**.
- **Produce Workflow inputs, never actions.** A Task never orchestrates, never dispatches a Command, never calls a provider or LLM, never owns Workflow execution.
- Emit Task events so Workflows, Governance, and dashboards react to work status, readiness, and drift.
- Preserve an immutable, versioned audit trail of every Task, every version, and every state change — fully traceable up the chain to Mission.

### What is explicitly NOT its responsibility

- **Tasks never execute themselves.** A Task is a description. The work it describes is performed by Workflows → Commands → Execution, never by the Task.
- **Tasks never call providers or LLMs.** No provider binding, no model call. Provider/LLM interaction happens only in Execution.
- **Tasks never dispatch Commands.** Commands are produced by Workflows and dispatched only by Execution.
- **Tasks never own Workflow execution or runtime state of the workflow engine.** A Task produces *inputs* to a Workflow; the Workflow owns its own orchestration and runtime.
- **Tasks never modify Mission, Goal, or Plan.** A Task references and inherits their context; it cannot create, amend, or reinterpret any of them.
- **Tasks never override the authority stack.** A Task is subordinate to its Plan, Goal, Mission, Approved Policy, Security/Compliance, and Law.

---

## 2. Mental Model

If Mission is the **North Star**, Goals the **waypoints**, and Plans the **chosen route**, then Work Packages are the **legs of the journey** and a Task is a **single, precisely-specified step** on a leg — small enough to hand to one traveller (human or agent), with a clear "done" test, a defined what-you-need and what-you-produce, and a rule for what to do if the step stumbles. The step is *specified* here; the *walking* happens below, in the Workflow/Command/Execution layers.

The mental model in one line: **A Task is the smallest business unit of work — a deterministic, assignable, observable, auditable *description* of one unit of work belonging to exactly one Work Package of exactly one Plan — that defines inputs, outputs, acceptance, retry, timeout, and constraints, and produces inputs for a Workflow, without ever executing, orchestrating, dispatching, or calling anything.**

Seven properties define the model:

- **Smallest unit.** A Task is the atom of work. If something must be subdivided further to be independently owned and judged done, it is not yet a Task — it is still a Work Package or a parent Task with children.
- **Plan- and Work-Package-bound.** Every Task belongs to exactly one Plan and exactly one Work Package, and inherits the Goal and Mission context of that Plan. A Task with no Plan/Work Package is orphaned work the company never tied to a strategy.
- **Deterministic.** Given its defined inputs, a Task's success is judged by a fixed acceptance criterion. Determinism is what makes work trackable and retryable rather than a matter of interpretation.
- **Assignable.** A Task names who does it — an assigned agent, an assigned human, both (hybrid), an external system, or a scheduled/event/manual trigger. Assignment is explicit; unassignable work is not a Task.
- **Observable & auditable.** A Task's lifecycle and health are readable at all times, and every change is retained immutably. Every unit of intended work is fully traceable up to Mission.
- **Descriptive, not executional.** A Task *describes* work — what, for whom, with what inputs, to what acceptance, under what constraints. It never *performs* the work. The moment something runs, it is a Workflow/Command/Execution below the Task.
- **Bounded, not sovereign.** A Task is subordinate to its Plan, Goal, Mission, Approved Policy, Security/Compliance, and Law. It describes only work those layers permit.

Tasks sit **beneath Plans/Work Packages in authority and above Workflows in production.** A Work Package hands a Task a unit of work to specify; the Task hands the Workflow layer a complete, bounded description to orchestrate. Tasks are the hinge between *what work* (Plan/Work Package) and *how it runs* (Workflow/Command/Execution) — and they are exclusively about *specifying one unit of work*, never *running it*.

---

## 3. Core Domain Objects

Tasks introduce one primary entity and a set of supporting objects. All reuse the existing column contracts from `_base.ts`:

- **`rootColumns`**: `id`, `createdAt`, `createdBy`, `updatedAt`, `updatedBy`, `version`, `lifecycleStatus` (`active | archived | deleted`), `deletedAt`.
- **`tenantColumns`** = `rootColumns` + `tenantId` (FK → `companies.id`, NOT NULL).

`createdBy` / `updatedBy` / `ownerRef` / `assignedAgentRef` / `assignedHumanRef` resolve to **actor references** per Identity §3.9 (`{actorType, actorId}`). No Task mutates without a resolved actor.

Note on `taskStatusEnum`: the existing `_enums.ts` `taskStatusEnum` (`pending | running | blocked | completed | failed`) is the coarse runtime-reflecting subset. This specification defines the richer governed `taskLifecycleStatusEnum` (§6) of which the existing enum is a projection; the two are reconciled in §6.

---

### 3.1 Task

- **Purpose.** The smallest business unit of work — a deterministic, assignable description of one unit of a Work Package's work. The primary object of this module.
- **Table.** `tasks` (`tenantColumns`).
- **Conceptual fields** (the full anatomy every Task carries):
  - `id` — Task ID.
  - `tenantId` — owning company (Identity §3.1).
  - `planRef` — `{planId, planVersion}` — the Plan this Task serves. Required.
  - `workPackageRef` — `{planId, workPackageId}` — the Work Package this Task realizes. Required.
  - `goalRef` — `{goalId, goalVersion}` — inherited Goal context. Required.
  - `missionRef` — `{missionId, missionVersion}` — inherited Mission context. Required.
  - `parentTaskId` — nullable FK → `tasks.id`; a parent Task for nested decomposition (null for a top-level Task under a Work Package).
  - `ownerRef` — the single accountable actor for the Task's definition/outcome.
  - `assignedAgentRef` — the agent assigned to do the work (nullable; per execution type).
  - `assignedHumanRef` — the human assigned to do the work (nullable; per execution type).
  - `priority` — `taskPriorityEnum`: `critical | high | medium | low`.
  - `taskLifecycleStatus` — governed lifecycle position (`taskLifecycleStatusEnum`, §6).
  - `taskHealth` — health signal (`taskHealthEnum`, §6): `unknown | healthy | at-risk | blocked`. Applies only to in-flight lifecycle states; auto-derived; never triggers a lifecycle change.
  - `executionType` — `taskExecutionTypeEnum` (§3.2): `human | agent | hybrid | external-system | scheduled | event-driven | manual`.
  - `estimatedDuration` — expected time to complete the described work.
  - `dependencies` — explicit prerequisite Tasks/conditions (§3.3).
  - `requiredCapabilities` — capabilities the work needs (skills, agent types, integrations).
  - `requiredResources` — resources the work needs (compute, data, tools, budget slice).
  - `requiredInputs` — the inputs the work consumes (typed input descriptors). Required to reach `ready`.
  - `expectedOutputs` — the outputs the work must produce (typed output descriptors). Required.
  - `acceptanceCriteria` — the deterministic predicate defining "done". Required.
  - `retryPolicy` — how failures retry (max attempts, backoff, conditions). Required.
  - `timeoutPolicy` — when the work is considered timed out and what happens. Required.
  - `approvalRequirement` — whether the Task requires approval before it may become `ready`/run (reuses `approvalStateEnum`).
  - `executionConstraints` — bounds on how the work may run (environment posture via `providerStatusEnum` — simulation/dry-run/read-only/blocked/live — rate limits, windows, data-handling constraints). Declarative only.
  - `riskLevel` — `taskRiskLevelEnum`: `low | medium | high | critical`.
  - `taskVersion` — the Task's own immutable version counter (distinct from row `version`).
  - `supersedesTaskId` — nullable FK → prior Task version this supersedes.
  - base lifecycle/audit fields (audit metadata).
- **Required.** `tenantId`, `planRef`, `workPackageRef`, `goalRef`, `missionRef`, `ownerRef`, `executionType`, `requiredInputs`, `expectedOutputs`, `acceptanceCriteria`, `retryPolicy`, `timeoutPolicy`, `executionConstraints`, `taskLifecycleStatus`. (`taskHealth` defaults `unknown`.)
- **Optional.** `parentTaskId`, `assignedAgentRef`/`assignedHumanRef` (per execution type), `dependencies`, `requiredCapabilities`, `requiredResources`, `estimatedDuration`, `approvalRequirement` (may be `not-required`).
- **Ownership.** Owned by exactly one company; accountable to exactly one owner; bound to exactly one Plan and one Work Package.
- **Example.** Work Package "Localize storefront to German" → Task *"Translate checkout flow to de-DE,"* `executionType=agent`, assigned `LocalizationAgent`, inputs (source strings, glossary), outputs (de-DE bundle), acceptance "100% keys translated + QA-passed," retry (3×, exponential), timeout (2h → fail), risk `low`, `planRef {p1, v2}`.

### 3.2 Execution Type

- **Purpose.** Declares *who or what* is intended to perform the described work and *how it is triggered*. Governs assignment and downstream orchestration shape — not the execution itself.
- **Realization.** `taskExecutionTypeEnum` (specified): `human | agent | hybrid | external-system | scheduled | event-driven | manual`.
  - **human** — a person does the work; `assignedHumanRef` required.
  - **agent** — a digital employee does the work; `assignedAgentRef` required, bounded by its human owner.
  - **hybrid** — human + agent collaborate; both refs present.
  - **external-system** — an external integration/service account performs it (Identity service account).
  - **scheduled** — triggered on a schedule (the Task describes the schedule; a scheduler below fires it).
  - **event-driven** — triggered by a domain event.
  - **manual** — explicitly triggered by a human action.
- **Rule.** Execution type is a *descriptor*. It never means the Task runs; it means the Workflow/Execution layer, when it realizes the Task, does so in this shape.

### 3.3 Task Dependency

- **Purpose.** A declared prerequisite: Task B cannot become `ready` (or cannot start) until Task A reaches a state. Makes cross-task ordering explicit and detectable.
- **Realization.** Structured entries within `dependencies`, each `{dependsOnTaskId, type}` where `type ∈ {blocks-ready, blocks-start, informs}`. The dependency graph is acyclic (§7).
- **Example.** "Publish de-DE bundle" depends on "Translate checkout flow" (`blocks-start`).

### 3.4 Acceptance Criteria

- **Purpose.** The deterministic condition under which a Task is judged `completed`. What makes a Task's success a fact, not an opinion.
- **Realization.** A structured predicate over the Task's `expectedOutputs` and observable results. Required; a Task cannot reach `ready` without evaluable acceptance criteria. Evaluated (by the layer that reports work results) to decide `completed` vs `failed`; the Task defines the test, it does not run it.

### 3.5 Retry & Timeout Policy

- **Purpose.** Deterministic failure and time-bound handling for the described work. Recoverability made explicit per unit.
- **Realization.** `retryPolicy` `{maxAttempts, backoff, retryOn}`; `timeoutPolicy` `{duration, onTimeout ∈ {fail, retry, escalate}}`. Both required. They are *policies the executing layer honors*; the Task neither retries nor times itself out — it declares the rule.

### 3.6 Task Version (immutable lineage record)

- **Purpose.** The permanent record of a Task's redefinitions and supersessions. Answers "how did this unit of work's definition change, and what replaced it."
- **Realization.** A superseded Task is retained immutably; its successor carries `supersedesTaskId` and an incremented `taskVersion`. **Completed, cancelled, failed (terminal), superseded, and archived Tasks are immutable.** Workflows bind to a specific Task version.

---

## 4. Ownership

- **Owned by Company.** Every Task belongs to exactly one company via `tenantId`. No global tasks.
- **Bound to one Plan and one Work Package.** Every Task carries exactly one `planRef` and one `workPackageRef`, and inherits `goalRef`/`missionRef`. **No Task without a Plan; no Plan without a Goal; no Goal without a Mission** — the chain is mandatory and transitive.
- **Accountable to one owner.** Every Task carries exactly one `ownerRef` — the single accountable actor for the Task's definition and outcome (a human, a department/team, or an agent bounded by its human owner, Identity §3.8).
- **Assignment is distinct from ownership.** `ownerRef` is *who is accountable*; `assignedAgentRef`/`assignedHumanRef` is *who performs the work*. Owner and assignee may differ (a director owns; an agent is assigned). Assignment must respect the assignee's authority ceiling and required capabilities.
- **Agent assignment bounded.** An assigned agent may perform a Task only within its human owner's authority and only for work the Plan/Goal/Mission/Policy stack permits (agent ceiling, Identity §6, Mission §9).
- **Ownership/assignment transfer.** On owner/assignee departure or reassignment (Identity §11), refs are re-pointed to active in-tenant actors before the prior actor is archived. A Task is never left owner-less or (if in flight) assignee-less.
- **No cross-tenant tasks.** A Task never spans companies.

---

## 5. Task Hierarchy

Tasks form a decomposition rooted in a Work Package (and transitively Plan → Goal → Mission). Two orthogonal structures: the **cognitive-chain position** and the **parent/child decomposition**.

### 5.1 Cognitive-chain position

```
Mission (doc 35)
  → Goal (doc 36)
    → Plan (doc 37)
      → Work Package (Plan §3.3)
        → Task              (this document — smallest unit of work; DESCRIBES)
          → Workflow          — (Workflow Specification) orchestrates the described work
            → Commands          — executable units produced by Workflows
              → Execution         — the ONLY dispatcher
```

- **A Task belongs to exactly one Work Package** of exactly one Plan; a Work Package may spawn many Tasks.
- **A Task produces Workflow inputs** — the bottom edge of the Task module. Below Tasks the chain leaves this module: `Task → Workflow → Commands → Execution`. Tasks never reach past their Workflow-input hand-off into orchestration or runtime.

### 5.2 Parent/child decomposition

- **A Task may contain child Tasks** (`parentTaskId`), forming an acyclic tree per Work Package, when a unit of work needs sub-units that are still individually owned and judged done.
- **Children inherit the same Plan/Work Package/Goal/Mission context** and must align with the parent Task; contradiction is rejected at validation.
- **Completion rolls up; accountability does not.** A parent Task's completion may depend on its children, but each child keeps its own owner and acceptance criteria.

### 5.3 The description boundary (why Tasks stop at Workflow inputs)

- **Tasks produce Workflow inputs** — a complete, bounded description (inputs, outputs, acceptance, retry, timeout, constraints, assignment) the Workflow layer consumes.
- **Workflows orchestrate** the described work and **produce executable Commands.**
- **Commands are dispatched only by Execution.**

This separation keeps *description* (deterministic, assignable, auditable, immutable-once-done) cleanly divided from *execution* (orchestrated, provider-bound, runtime-stateful). A Task owning Workflow execution, dispatching a Command, or calling a provider collapses the boundary and is an architectural defect.

---

## 6. Lifecycle

A Task carries **two orthogonal state dimensions** (mirroring Goal doc 36 §6 and Plan doc 37 §6) that must never be conflated:

- **Lifecycle** (`taskLifecycleStatusEnum`) — *where the Task is in its governed existence.* Changes only via governance/rule-driven transitions.
- **Health** (`taskHealthEnum`) — *how well an in-flight Task is doing.* Auto-derived from signals; never a lifecycle transition.

Governing rule: **a Task is Plan/Work-Package-bound, owned, assignable, deterministic, and constraint-complete before it may become `ready`; lifecycle changes are governed; health merely observes; and once terminal, history and versions are immutable.**

### 6.1 Lifecycle dimension

**`taskLifecycleStatusEnum`** (specified): `draft | planned | ready | assigned | waiting | running | completed | cancelled | failed | superseded | archived`.

| Lifecycle state | Meaning | Mutable? | Carries health? |
|---|---|---|---|
| **draft** | Being authored; incomplete allowed | Yes (full edit) | No |
| **planned** | Fully specified and bound to a Work Package; not yet ready | Limited | No |
| **ready** | All prerequisites/inputs/approval satisfied; may be assigned | Limited | **Yes** |
| **assigned** | Assigned to an agent/human/system per execution type | Assignment only | **Yes** |
| **waiting** | Waiting on a dependency, window, or trigger | No (progress only) | **Yes** |
| **running** | The described work is in progress **below** (Workflow/Execution reflecting up) | No (progress only) | **Yes** |
| **completed** | Acceptance criteria satisfied | No (terminal-positive) | No (health cleared) |
| **cancelled** | Withdrawn before completion (governed) | No (terminal) | No |
| **failed** | Terminated unsuccessfully after retry/timeout policy exhausted | No (terminal) | No |
| **superseded** | Replaced by a new Task version | No (immutable) | No |
| **archived** | Retired; terminal | No (immutable) | No |

**`running` clarification:** `running` means *the work this Task describes is underway in the layers below* (Workflow → Command → Execution), and that state is **reflected up** onto the Task for observability. The Task itself performs nothing. This projects onto the existing `taskStatusEnum.running`.

**Lifecycle transitions (governed):**

| Transition | From → To | Precondition | Effect | Emits |
|---|---|---|---|---|
| **Draft** | ∅ → draft | Authoring actor resolved | Row created, `taskLifecycleStatus=draft`, `taskHealth=unknown` | `TaskDrafted` |
| **Plan** | draft → planned | Passes specification validation (§8: inputs/outputs/acceptance/retry/timeout/constraints present); Plan is approved | `taskLifecycleStatus=planned` | `TaskPlanned` |
| **Ready** | planned → ready | Dependencies `blocks-ready` satisfied; required inputs available; approval (if required) `approved`; parent Plan execution-ready | `taskLifecycleStatus=ready`; health tracking begins (`unknown`) | `TaskReady` |
| **Assign** | ready → assigned | Assignee resolves, has capability + authority | assignment refs set, `taskLifecycleStatus=assigned` | `TaskAssigned` |
| **Wait** | assigned → waiting | A `blocks-start` dependency/window/trigger not yet met | `taskLifecycleStatus=waiting` | `TaskWaiting` |
| **Start** | assigned/waiting → running | Prerequisites met; Workflow layer begins realizing the work | `taskLifecycleStatus=running` (reflects work underway below) | `TaskStarted` |
| **Complete** | running → completed | Acceptance criteria satisfied and verified | `taskLifecycleStatus=completed` (terminal); health cleared to `unknown`, frozen | `TaskCompleted` |
| **Fail** | running/waiting → failed | Retry policy exhausted or timeout `onTimeout=fail` | `taskLifecycleStatus=failed` (terminal); health frozen | `TaskFailed` |
| **Cancel** | any non-terminal → cancelled | Governed withdrawal | `taskLifecycleStatus=cancelled` (terminal) | `TaskCancelled` |
| **Supersede** | any non-terminal → superseded | A new Task version is approved | `taskLifecycleStatus=superseded`, immutable; `supersedesTaskId` set on successor | `TaskSuperseded` |
| **Archive** | terminal or non-terminal → archived | Governed retirement | `lifecycleStatus=archived`, `taskLifecycleStatus=archived` (terminal, no reactivation) | `TaskArchived` |
| **Version (revise)** | draft/planned → superseded (+ successor) | Material change to the specification | New `taskVersion` via supersession; prior retained immutable | `TaskRevised` |

Every lifecycle transition is governed and audited. **Health never appears in this table** — no health value causes any transition.

### 6.2 Health dimension

**`taskHealthEnum`** (specified): `unknown | healthy | at-risk | blocked`.

| Health state | Meaning | Set how |
|---|---|---|
| **unknown** | No sufficient signal yet (default; also the value for terminal Tasks) | default / on clear |
| **healthy** | Progressing normally within duration/retry/timeout bounds | auto |
| **at-risk** | Trending to miss (approaching timeout, retries mounting, duration overrun, materialized risk) | auto |
| **blocked** | Cannot progress (unresolved dependency, missing input/resource, pending approval) | auto |

**Health rules:**

- **Scope.** Health applies **only** to in-flight lifecycle states (`ready | assigned | waiting | running`; also permitted informationally on `planned`→`ready` onward). In `draft`/`planned` it is `unknown`; in `completed`/`cancelled`/`failed`/`superseded`/`archived` it is cleared to `unknown` and frozen — **terminal Tasks carry no active health.**
- **Automatic.** Health is derived automatically from **dependency states, input/resource availability, approval state, retry counts, elapsed vs estimated duration, timeout proximity, and materialized risks.** Never a manual lifecycle act.
- **No lifecycle effect.** **Health never changes lifecycle; lifecycle never derives from health.** A Task going `at-risk` or `blocked` keeps its lifecycle state; only governed transitions move lifecycle. (A `blocked` health does not equal lifecycle-`waiting` — a running Task can be health-`blocked` on a slow dependency while lifecycle stays `running` until a governed Fail/Cancel/Wait transition.)
- **Observability, not authority.** Health drives alerts, KPIs, and Governance signals; humans/agents may *then* choose a governed action. The signal never mutates lifecycle on its own.

### 6.3 Terminal-state rules

- **completed / cancelled / failed** are terminal lifecycle states. **Completed Tasks never reactivate; archived Tasks never reactivate** — redoing work is a *new* Task, not a resurrection.
- **superseded** Tasks are **immutable** and permanent — retained as lineage, never edited, never reactivated. **Task versions are immutable.**
- Terminal Tasks hold `taskHealth = unknown` (cleared, frozen).
- **Task history is immutable and fully traceable.** Every lifecycle transition, health change, assignment, retry, and version is retained append-only, traceable up to Mission. No Task history is ever deleted (except under the legal-erasure exception governing Identity, §13 there).

---

## 7. Constraints

Structural and semantic constraints, enforced by the schema and the module — not by convention.

**Structural (schema-enforced):**

1. **Plan & Work Package references mandatory.** `planRef` and `workPackageRef` NOT NULL. **No Task without a Plan and a Work Package.** `goalRef`/`missionRef` mandatory and must match the Plan's chain.
2. **Owner mandatory.** `ownerRef` NOT NULL — exactly one accountable owner.
3. **Specification completeness mandatory.** `requiredInputs`, `expectedOutputs`, `acceptanceCriteria`, `retryPolicy`, `timeoutPolicy`, `executionConstraints`, `executionType` present before a Task may leave `draft`.
4. **Tenant isolation.** `tenantId` NOT NULL, FK → `companies.id`. Cross-tenant leakage structurally impossible.
5. **Acyclic hierarchy & dependencies.** `parentTaskId ≠ id`; parent tree and dependency graph both acyclic (checked at write time).
6. **Terminal immutability.** Rows in `completed | cancelled | failed | superseded | archived` reject content mutation. **Completed/archived never reactivate; superseded stays immutable; versions immutable.**
7. **Version monotonicity.** `taskVersion` strictly increases along a `supersedesTaskId` chain; no self-supersession.
8. **Approval gate before run.** If `approvalRequirement` requires it, the Task cannot reach `ready` until `approvalState=approved`.

**Semantic (module-enforced):**

9. **Subordinate to the authority stack.** A Task — and every Workflow/Command/Execution derived from it — may never override **Law, Security/Compliance, Approved Policy, Mission, Goal, or Plan.** Precedence is fixed (header). A Task requiring a violation cannot reach `ready`; a conflict arising later blocks execution and escalates for explicit human resolution (mirrors Plan §7).
10. **Alignment/context inherited, continuously validated.** A Task inherits and re-checks `planRef`/`goalRef`/`missionRef` on Plan revision/supersession, Goal redefinition, and Mission ratification. Misalignment raises `TaskDriftDetected`.
11. **Children align with parent and context.** Contradiction rejected at validation.
12. **Lifecycle and health are orthogonal.** Separate fields, separate rules. A health change never writes lifecycle; a lifecycle transition is never *triggered* by a health value (may *read* it as input).
13. **Health is scoped and derived.** `taskHealth ∈ {healthy, at-risk, blocked}` only while in-flight (`ready`/`assigned`/`waiting`/`running`); otherwise forced `unknown`. Computed from dependencies, inputs/resources, approval, retries, duration, timeout, risks — never manual.
14. **Tasks never execute, dispatch, orchestrate, call providers/LLMs, or hold workflow runtime state.** Structurally, `tasks` has no command/dispatch edge, no provider/LLM binding, no workflow-runtime field. Realization is exclusively via Workflow inputs consumed by the Workflow layer.
15. **Execution constraints honor environment posture.** `executionConstraints` may declare a `providerStatusEnum` posture (simulation/dry-run/read-only/blocked/live); a Task marked non-`live` may only ever be realized in simulation by the layers below (mirrors agent live-action gating, Mission §6).

---

## 8. Validation

Validation runs at gates: **draft → planned** (specification), **planned → ready** (readiness), **assignment**, and **continuous** (standing re-validation while in-flight). Tasks fail closed: on any ambiguity the Task does not advance and no ill-specified work is realized.

**Binding & context validation (at specification and continuously):**

- `planRef` resolves to an **approved** (non-terminal) Plan in the same tenant; `workPackageRef` resolves to a real Work Package of that Plan; `goalRef`/`missionRef` match the Plan's chain.
- The Task does not contradict its Work Package's acceptance, its Plan's strategy, its Goal's criteria, or any Mission principle.
- **Standing re-check:** on Plan revision/supersession, Goal redefinition, or Mission ratification, in-flight Tasks are re-validated; new misalignment flags the Task and raises `TaskDriftDetected`.

**Specification validation (at draft → planned):**

- `requiredInputs`, `expectedOutputs` present and typed; `acceptanceCriteria` present and evaluable; `retryPolicy` and `timeoutPolicy` well-formed; `executionConstraints` well-formed; `executionType` set with consistent assignment fields (e.g. `human` requires an assignable human).

**Ownership & assignment validation (at specification / assignment):**

- `ownerRef` resolves to a live in-tenant actor. On assignment, the assignee resolves, holds the `requiredCapabilities`, and satisfies its authority ceiling (agent bounded by human).

**Readiness validation (planned → ready):**

- `blocks-ready` dependencies satisfied; required inputs available; required resources/capabilities available; approval (if required) `approved`; the parent **Plan is execution-ready** (Plan §3.5). Otherwise the Task stays `planned`.

**Authority-stack validation (at specification and re-checked at ready):**

- The Task's described work is checked against Law/Regulation markers, Security/Compliance policy, Approved Policy, and permissions (Identity §6). A Task requiring a violation **cannot reach `ready`**; the conflict is recorded and routed for **explicit human resolution**. Tasks never self-resolve.

**Approval validation (where required):**

- The approver satisfies the Task's `approvalRequirement` authority; separation of duties applies where required (reuses `approvalStateEnum`).

**Structural validation:**

- No cycle in parent tree or dependency graph; dependencies resolve to real, in-tenant Tasks/conditions.

**Health validation (continuous):**

- `taskHealth` non-`unknown` only while in-flight; any other case coerced to `unknown`.
- A health update carries no lifecycle change; a write attempting to move lifecycle "because health changed" is refused.
- Health inputs must resolve; a recompute with unresolved inputs yields `unknown`, never a stale `healthy`.

Only a Task passing all applicable gates advances. A failure returns it toward `draft`/`planned` with the violated rule recorded; ill-specified work is never realized.

---

## 9. Relationships

Tasks point *up* at Plan/Goal/Mission and the authority stack; *sideways* at other Tasks; and *down* at Workflows (via Workflow inputs). Tasks never dispatch Commands, never touch Execution's providers directly.

| Module | Relationship to Tasks |
|---|---|
| **Mission** | Inherited apex context (`missionRef`). A Task is continuously validated against the active Mission; it never modifies Mission. |
| **Goal** | Inherited outcome context (`goalRef`). A Task contributes to its Goal via its Plan; it never modifies the Goal. |
| **Plan** | **The binding parent.** Every Task belongs to exactly one Plan (`planRef`) and realizes one of the Plan's Work Packages. Plan §9 states Plans "produce Tasks"; this is that production edge. Tasks may be consumed only from an **approved, execution-ready** Plan (Plan §7.5). A Task never modifies its Plan. |
| **Work Package** | **The direct source.** A Task realizes exactly one Work Package (`workPackageRef`), inheriting its acceptance intent and capability needs (Plan §3.3). A Work Package may spawn many Tasks. |
| **Workflow** | **The downstream production edge.** A Task **produces Workflow inputs** — a complete, bounded work description the Workflow layer consumes to orchestrate. The Task defines *what work and how it's judged*; the Workflow decides *how to orchestrate and what Commands to emit*. **Tasks never own Workflow execution.** |
| **Execution** | **No direct relationship, one hard invariant:** Execution realizes work only via Workflows derived from Tasks; **Tasks never dispatch Commands** — Execution is the sole dispatcher, and it acts only on approved-Plan-derived Tasks. |
| **Agent Registry** | Supplies the assignable agents and their capabilities/skills for `assignedAgentRef` and `requiredCapabilities` matching. Assignment respects the agent's ceiling (Identity §3.8/§6). |
| **Human Approval** | Where `approvalRequirement` demands it, a human approval gates the Task reaching `ready` (reuses `approvalStateEnum`). |
| **Execution Readiness** | A Task reaches `ready` only if its parent Plan is execution-ready (Plan §3.5) and its own readiness validation passes. The two readiness gates compose: Plan-ready enables, Task-ready commits. |
| **Policies** | Constrain the *means* of the described work and rank above the Task. A Task cites policy/`executionConstraints` as inputs; it never overrides policy. |
| **Permissions** | The assignee's permitted actions (Identity §6, `permissionScopeEnum`) bound what the Task may describe as doable by that actor; over-ceiling work is rejected. |
| **Audit** | Every Task mutation writes an immutable audit record; Tasks are fully traceable up to Mission (Identity §9 audit strategy). |
| **Memory** | A Task may declare memory reads/writes as inputs/outputs (episodic/semantic/procedural, `memoryKindEnum`); the actual read/write happens in Execution, described here. |
| **Knowledge** | A Task may declare required knowledge inputs; retrieval happens below, described here. |
| **Reasoning** | Reasoning/Decisions choose *between Tasks*, resolve at-risk/blocked conditions, and decide retries/escalations per policy. The Reasoning layer computes; the Task supplies the described unit and its policies. A Task does not itself reason. |
| **Identity / Company / Departments** | Tenant ownership and every actor reference (owner, assignee, approver). Identity draws the boundary; Tasks fill it with described work. |

**The work spine:** `Mission → Goal → Plan → Work Package → Task → Workflow → Commands → Execution`. Tasks are the node that turns a work package into the smallest deterministic, assignable, auditable *descriptions* of work — and stop exactly at the Workflow-input edge.

---

## 10. Events

Every Task mutation emits exactly one domain event. Events are the module's public reaction surface — Workflows, Governance, and dashboards subscribe; they never read Task tables directly. Payloads carry `actorRef`, `tenantId`, `taskId`, `taskVersion`, `planRef`, `workPackageRef`, `goalRef`, `missionRef`, and `occurredAt`.

| Event | Trigger | Payload (beyond envelope) | Consumers | Business impact |
|---|---|---|---|---|
| `TaskDrafted` | New Task draft created | executionType, workPackageRef, parentTaskId? | Dashboard, Governance | Candidate unit of work; not binding |
| `TaskPlanned` | Fully specified & bound | spec summary | Governance, Dashboard | Work described and validated |
| `TaskReady` | Prerequisites/inputs/approval satisfied | readinessSnapshot | **Workflow layer**, Governance | Unit may be assigned/orchestrated |
| `TaskAssigned` | Assigned to actor | assignedAgentRef?/assignedHumanRef? | Workflow layer, Notifications | Performer designated |
| `TaskWaiting` | Waiting on dependency/window/trigger | blockingRef | Dashboard, Governance | Start deferred |
| `TaskStarted` | Work underway below (reflected up) | executionRef | Dashboard, Governance | Described work in progress |
| `TaskProgressReflected` | Progress signal from executing layer | percent?, lastSignalAt | Dashboard | Observability of underway work |
| `TaskCompleted` | Acceptance criteria satisfied | outputs, acceptanceResult | Workflow, Plan (informs), Reporting | Unit done; health cleared |
| `TaskFailed` | Retry/timeout exhausted | reason, attempts, timedOut | Governance, Notifications, Reasoning | Failure surfaced; retry/escalation decided above |
| `TaskCancelled` | Governed withdrawal | reason | Dashboard, Governance | Unit withdrawn |
| `TaskHealthChanged` | Health recomputed (in-flight only) | fromHealth, toHealth, driverInputs | Dashboard, Governance | Health moved; **no lifecycle change** |
| `TaskAtRisk` / `TaskBlocked` | Health specializations | trend / blockingRef | Governance, Notifications | Alerts; **lifecycle unchanged** |
| `TaskRetryScheduled` | A retry is queued per policy | attemptNo, backoff | Workflow, Dashboard | Recovery attempt described (executed below) |
| `TaskTimedOut` | Timeout policy triggered | onTimeout action | Governance, Notifications | Time bound hit; fail/retry/escalate per policy |
| `TaskRevised` | Material spec change | newTaskVersion, changedFields | Workflow, Governance, Audit | Downstream orchestration re-derives |
| `TaskSuperseded` | Replaced by a new version | successorTaskId | Workflow, Audit | Old unit retired; work re-anchors |
| `TaskArchived` | Retired | reason | Dashboard, Reporting | Unit retired permanently (no reactivation) |
| `TaskDriftDetected` | Context validation fails vs Plan/Goal/Mission | violatedRef, version | **Governance (high severity)**, Notifications, Audit | Work diverging; block/escalate |
| `TaskOwnershipReassigned` / `TaskReassigned` | Owner/assignee changed | fromRef, toRef | Governance, Dashboard | Accountability/assignment re-points |

**Ordering and idempotency.** Events carry `taskVersion`; consumers discard stale/duplicate deliveries. Emission is **transactional with the mutation** — no Task event fires unless the state change committed; a failed audit/event write rolls back the mutation.

**Two independent streams.** Health events (`TaskHealthChanged` + specializations) never accompany or cause a lifecycle change; lifecycle events (`TaskReady`, `TaskStarted`, `TaskCompleted`, `TaskFailed`, …) never carry a health transition. Consumers must not infer one from the other.

---

## 11. KPIs

Task health and the company's work-execution performance, measured deterministically from Task rows, transitions, and derivation.

| KPI | Definition | Source |
|---|---|---|
| **Task completeness** | % of `planned`+ Tasks with inputs, outputs, acceptance, retry, timeout, constraints (target 100% by construction) | task fields + validation |
| **Binding coverage** | % of Tasks with valid `planRef`+`workPackageRef` to an approved Plan + matching Goal/Mission (target 100%) | ref resolution |
| **Throughput** | Tasks reaching `completed` per window | terminal states |
| **Completion rate** | % `completed` vs (`failed`+`cancelled`) over a window | terminal states |
| **First-pass success** | % of Tasks completed without any retry | retry counts |
| **Retry rate** | Avg retries per Task; % of Tasks hitting `maxAttempts` | retry policy vs attempts |
| **Timeout rate** | % of Tasks hitting `timeoutPolicy` | timeout events |
| **Cycle time** | Median `ready → completed` duration; vs `estimatedDuration` | lifecycle timestamps |
| **On-time ratio** | % completed within `estimatedDuration` | duration vs estimate |
| **Health distribution** | % of in-flight Tasks `healthy` vs `at-risk`/`blocked` | `taskHealth` (in-flight only) |
| **Blocked exposure** | Count/% and weighted priority of `blocked` Tasks | `taskHealth` + priority |
| **Assignment latency** | Median `ready → assigned` | lifecycle timestamps |
| **Drift rate** | Rate/severity of `TaskDriftDetected` | drift events |
| **Traceability completeness** | % of Tasks with an unbroken audit chain to Mission (target 100%) | audit chain |
| **Ownership completeness** | % of Tasks with a live in-tenant owner (0 orphans = 100%) | `ownerRef` resolution |

These feed the Executive/Director/Department dashboards (Identity §10 pattern). All computed from Task's own records — no external inference.

---

## 12. Failure Scenarios

At least the following failure modes and the system's deterministic reaction. Governing rule: **Tasks fail closed** — on ambiguity they refuse to advance, preserve state, and never let ill-specified or unauthorized work be realized.

1. **Task with no Plan / Work Package.** Rejected at specification — both refs mandatory; orphaned work never advances.
2. **Task bound to an unapproved / not-ready Plan.** Cannot reach `ready` — a Task is realizable only from an approved, execution-ready Plan.
3. **Task referencing a terminal/other-tenant Plan or a non-existent Work Package.** Rejected — refs must resolve in the same tenant to live objects.
4. **Task missing acceptance / outputs / retry / timeout / constraints.** Cannot leave `draft` — all are structural requirements.
5. **Task requires a capability the assignee lacks.** Assignment refused until an assignee with the capability is found; Task stays `ready`.
6. **Agent assigned work beyond its human owner's authority.** Rejected — assignment bounded by the agent ceiling.
7. **Task requires violating law/compliance/approved policy/permissions.** Hard stop — cannot reach `ready`; if arising later, execution blocks and a human must resolve. Protective operations (Mission §7.8) continue regardless.
8. **Task contradicts its Work Package / Plan / Goal / Mission.** `TaskDriftDetected`; blocked at readiness (or execution blocked later); never auto-resolved in the Task's favor.
9. **Plan revised/superseded under an in-flight Task.** Task flagged, re-validated against the new Plan version; not silently realized against dead strategy.
10. **Dependency never resolves.** Task holds health-`blocked` while lifecycle stays `waiting`/`running`; escalates via Governance; never silently completed. Retiring it requires a governed Cancel/Fail.
11. **Retry policy exhausted.** After `maxAttempts`, the Task transitions `failed` (terminal); `TaskFailed` raised; the retry/escalation *decision* is made above (Reasoning/Plan), not by the Task.
12. **Timeout hit.** `timeoutPolicy.onTimeout` applies deterministically (`fail`/`retry`/`escalate`); `TaskTimedOut` raised. No indefinite hang.
13. **Required input unavailable.** Task stays `planned`/`ready`, health `blocked`; not started; input availability re-checked.
14. **Circular Task dependency or parent tree.** Rejected by acyclicity check at write time.
15. **Attempt to edit a completed/cancelled/failed/superseded/archived Task.** Refused — terminal and superseded Tasks are immutable; versions immutable.
16. **Attempt to reactivate a completed/archived Task.** Refused — redoing work is a new Task, not a resurrection.
17. **Concurrent revision (two successors).** Only one supersession wins the atomic flip; the second finds the base no longer current and is refused, rebased. No forked lineage.
18. **Health value set on a draft/planned/terminal Task.** Rejected, coerced to `unknown` — health exists only in-flight.
19. **Attempt to move lifecycle because health changed.** Refused — `at-risk`/`blocked` never transition lifecycle; only governed actions move it.
20. **Terminal Task showing active health.** Structurally impossible — completion/failure/cancellation clears health to `unknown`, frozen.
21. **Task attempts to dispatch a Command / call a provider / call an LLM.** Structurally impossible — Tasks have no dispatch edge, no provider/LLM binding. Rejected as a layer violation.
22. **Task attempts to own or run Workflow execution.** Structurally impossible — Tasks produce Workflow inputs only; orchestration/runtime is the Workflow layer's.
23. **Task tries to modify Mission/Goal/Plan.** Refused — Tasks reference and inherit context; they never mutate upward.
24. **Non-`live` constrained Task realized live.** Refused — `executionConstraints` posture (`simulation`/`dry-run`/etc.) forces the layers below to simulation; a live realization of a non-`live` Task is blocked.
25. **Assignee leaves mid-flight.** `TaskReassigned` to an active in-tenant assignee before the prior actor is archived; in-flight Task never left assignee-less.
26. **Approval required but never granted.** Task cannot reach `ready`; stays gated; `blocked` health; escalated.
27. **Audit/event write failure on a Task mutation.** Transactional emission rolls back the mutation; no un-audited Task change commits — traceability is never broken.

---

## 13. Enterprise Use Cases

Behavior of Tasks in real enterprise situations. In every case Tasks mutate only description/assignment/status edges and emit events; Workflows and below react.

1. **Work-package decomposition.** A Plan's "Localize storefront to German" work package is decomposed into Tasks (translate checkout, translate catalog, QA de-DE), each owned, specified, and independently trackable.
2. **Agent-assigned Task.** A translation Task is `executionType=agent`, assigned to `LocalizationAgent` bounded by its human director; the agent performs it via the Workflow below — the Task only describes it.
3. **Human Task.** A "legal review of ToS translation" Task is `executionType=human`, assigned to a lawyer; completion is judged by its acceptance criteria.
4. **Hybrid Task.** "Draft + human-approve product copy" is `hybrid`: an agent drafts, a human approves; both refs present.
5. **External-system Task.** "Push catalog to ERP" is `external-system`, performed by a service account integration; every action attributed to the service actor.
6. **Scheduled Task.** "Nightly inventory sync" is `scheduled`; the Task describes the cadence; a scheduler below fires the Workflow.
7. **Event-driven Task.** "On new order, send confirmation" is `event-driven`; a domain event triggers realization.
8. **Manual Task.** "Founder signs off on brand launch" is `manual`; a human explicitly triggers it.
9. **Dependency chain.** "Publish de-DE bundle" `blocks-start`-depends on "Translate checkout"; it waits until the dependency completes.
10. **Retry on transient failure.** A "call payment provider setup" Task (realized below) fails transiently; `retryPolicy` retries 3× with backoff; `TaskRetryScheduled` each attempt; succeeds on attempt 2.
11. **Timeout escalation.** A long-running data import overruns; `timeoutPolicy.onTimeout=escalate`; `TaskTimedOut`; Reasoning decides to extend or fail.
12. **At-risk Task.** Retries mounting and duration overrunning flip health to `at-risk`; owner/director alerted; lifecycle stays `running` until a governed decision.
13. **Blocked Task.** A required knowledge input is missing; health `blocked`; work not started; resolved when the input lands.
14. **Approval-gated Task.** A "delete customer data (GDPR)" Task requires human approval before `ready`; without it, it never runs.
15. **Simulation-constrained Task.** A high-risk "bulk email send" Task carries `executionConstraints.posture=dry-run`; the layers below can only simulate until promoted to `live` by a governed change.
16. **Task revision.** Acceptance criteria were mis-specified; the owner revises the Task in `planned` → new `taskVersion` supersedes; the old is frozen.
17. **Plan revised under Tasks.** The Plan's approach changes; affected in-flight Tasks are flagged and re-validated; misaligned ones are superseded/cancelled.
18. **Parent/child Tasks.** "Migrate 10k SKUs" is a parent Task with per-batch child Tasks; parent completes when children's acceptance rolls up.
19. **Cross-department Tasks.** A launch Plan spawns Tasks owned by Sales, Ops, and Legal, each assigned within its department, all under the same Plan.
20. **Reassignment on leave.** An assigned human goes on leave; the Task is reassigned to a covering actor before archival of the prior assignment; no gap.
21. **Executive work dashboard.** The dashboard reads throughput, completion rate, retry/timeout rates, blocked exposure, and cycle time across all Tasks — work health at a glance.
22. **Failed Task, governed recovery.** A Task exhausts retries → `failed`; Reasoning/Plan decides whether a *new* Task is created to recover; the failed Task stays immutable.
23. **Audit of work.** An auditor reads the immutable Task trail: every unit of work, its assignee, its retries, its outcome, traceable to Mission — permanent and exportable.
24. **M&A task reconciliation.** Merged companies keep Tasks per tenant; overlapping work is reconciled by superseding within each tenant, never shared across tenants.
25. **Priority preemption.** A `critical` incident-response-related Task (from an exempt protective Plan) is prioritized for assignment ahead of `medium` Tasks without editing their definitions.
26. **Memory/Knowledge-bound Task.** A Task declares an episodic-memory write and a knowledge read as its I/O; the actual read/write occurs in Execution, precisely as the Task described.
27. **Drift caught mid-flight.** Mission is re-ratified; an in-flight Task's `missionRef` no longer aligns; `TaskDriftDetected`; the Task is blocked and escalated rather than silently completing against dead purpose.

---

## 14. Extensibility

How Tasks absorb future demands **without redesign**, because the core abstractions were chosen as extension points.

- **Richer I/O typing.** `requiredInputs`/`expectedOutputs` can gain schemas/contracts without structural change — typed descriptors the Task versions with.
- **Smart retry/timeout.** `retryPolicy`/`timeoutPolicy` can evolve from static to adaptive (policy-driven, learned) behind the same policy contract.
- **Predictive health.** `at-risk` classification can move from thresholds to forecasting; health states/events stay stable.
- **Capability marketplace.** `requiredCapabilities` can resolve against an agent/skill registry; matching improves with no model change.
- **New execution types.** The `taskExecutionTypeEnum` is an extension point; new performer shapes (e.g. `federated-agent`) add as enum values, not new modules.
- **Task templates.** Standard task specs are draft `tasks` rows adopted per Work Package; no new primitive.
- **Cost attribution.** Tasks can carry a budget slice bound to the Plan's budget and finance ledger for per-unit cost; the field is the seam.
- **AI-authored Tasks.** Agents already author Tasks as first-class actors; the author/owner/assignee split keeps AI-authored work safe by construction.
- **Environment promotion.** `executionConstraints` posture (simulation → live) is the seam for progressive rollout of a Task across environments.

The invariant enabling all of the above: **work is described deterministically and versioned immutably; binding to Plan/Work Package is explicit; readiness and approval gate realization; the produce-Workflow-inputs-only boundary isolates description from execution.** New demands plug into these seams without touching the layer boundaries.

---

## 15. Architectural Principles

The permanent design principles governing Tasks. If a future request conflicts with one of these, the request is wrong, not the principle.

1. **No Task without a Plan and a Work Package; no Plan without a Goal; no Goal without a Mission.** The chain is mandatory and transitive. Orphaned work is forbidden.
2. **Tasks describe work; they never execute it.** No self-execution, no Command dispatch, no provider/LLM call, no Workflow ownership. Tasks produce Workflow inputs; the chain runs below.
3. **A Task is the smallest business unit of work.** Deterministic, assignable, observable, auditable — one owner, one acceptance test, one retry/timeout policy.
4. **Every Task is fully specified before it runs.** Inputs, outputs, acceptance, retry, timeout, constraints, and execution type are structural requirements to leave `draft`.
5. **Realization requires an approved, ready Plan.** A Task reaches `ready` only atop an approved, execution-ready Plan and its own readiness gates. Ill-specified or unauthorized work is never realized.
6. **Tasks are subordinate.** Precedence is absolute: Law → Security/Compliance → Approved Policy → Mission → Goals → Plans → Tasks → Workflows → Commands → Execution. Tasks never override Plan, Goal, Mission, or Policy; conflicts block and require explicit human resolution.
7. **Determinism and recoverability are declared, not improvised.** Acceptance is a fixed test; retry and timeout are explicit policies the executing layer honors.
8. **Versions and history are immutable; terminal states are final.** Completed/cancelled/failed/archived never reactivate; superseded stays immutable; every change is retained and fully traceable to Mission.
9. **Lifecycle and health are separate axes.** Lifecycle is governed existence; health is observed condition, in-flight only, automatic, and **never** changes lifecycle.
10. **Ownership and assignment are distinct.** One accountable owner; a possibly-different performer, always within capability and authority ceilings.

---

## 16. What Tasks will NEVER do

Explicit boundaries to prevent responsibility creep. If a future request asks Tasks to do any of these, the answer is: it belongs to another module.

- **Never execute themselves.** A Task is a description; the work runs in Workflows → Commands → Execution.
- **Never call providers or LLMs.** No provider/LLM binding. That is Execution's job only.
- **Never dispatch Commands.** Commands are produced by Workflows and dispatched only by Execution.
- **Never own Workflow execution or the workflow engine's runtime state.** Tasks produce Workflow inputs; the Workflow owns orchestration and runtime.
- **Never modify Mission, Goal, or Plan.** Tasks reference and inherit context; they never mutate upward.
- **Never override Law, Security/Compliance, Approved Policy, Mission, Goal, or Plan.** Tasks are subordinate to the whole authority stack; conflicts block and escalate to a human.
- **Never exist without a Plan, a Work Package, an owner, acceptance criteria, expected outputs, retry policy, timeout policy, dependencies declaration, or execution constraints.** All are structural requirements.
- **Never run while ill-specified, unauthorized, or atop an unapproved/not-ready Plan.** The specification + approval + readiness boundary is absolute.
- **Never mutate a terminal/superseded version, nor reactivate a completed/archived Task.** Versions and history are immutable; redoing work is a new Task.
- **Never let health change lifecycle, and never mutate without an actor and an audit record.** Full traceability is non-negotiable.

---

*End of Task Specification v1.0. This document specifies the Task module — the smallest business unit of work, a deterministic, assignable, observable, auditable description that turns Work Packages into Workflow inputs — in full and defines its permanent boundaries. No implementation code. No SQL. No TypeScript. No other specification modified.*
