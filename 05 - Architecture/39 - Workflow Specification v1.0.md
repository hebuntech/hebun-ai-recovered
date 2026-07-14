# Workflow Specification v1.0

> Stage 6 — Workflow module, complete Enterprise Architecture Specification.
> This document is the permanent architectural reference for Workflows in Hebun AI.
> It specifies the orchestration layer, beneath Tasks and above Commands. It adds no implementation. It defines boundaries.

**Status:** Definitive · **Scope:** Workflow module only · **Grounded in:** the schema primitives in `src/db/schema/_base.ts` (`rootColumns`, `tenantColumns`) and `_enums.ts` (`lifecycleStatusEnum`, `approvalStateEnum`, `executionStatusEnum`, `commandStatusEnum`, `taskStatusEnum`, `providerStatusEnum`, `roleTypeEnum`, `permissionScopeEnum`), the Identity (doc 34), Mission (doc 35), Goal (doc 36), Plan (doc 37), and Task (doc 38) Specifications v1.0.

**Position in the cognitive hierarchy:**

```
Mission            ← the North Star of intent (doc 35)
  → Goal           ← measurable desired outcome (doc 36)
    → Plan         ← strategy decomposing a Goal (doc 37)
      → Work Package ← unit of intent from the Plan
        → Task       ← smallest business unit of work; DESCRIBES work (doc 38)
          → Workflow   ← this document — ORCHESTRATES the described work; produces Commands
            → Commands   — executable units the Workflow emits
              → Execution  — the ONLY layer that performs work / dispatches to providers/LLMs
```

**Authority precedence (unchanged, absolute):**

```
Law and Regulation
  → Security and Compliance Policy
    → Approved Company Policy
      → Mission
        → Goals
          → Plans
            → Tasks
              → Workflows        ← subordinate to everything above; never overrides Task, Plan, Goal, Mission, or Policy
                → Commands
                  → Execution
```

Workflows are the **orchestration layer**. Tasks *describe* discrete units of work; a Workflow *coordinates* those units — in sequence, in parallel, conditionally, with approval checkpoints, retries, rollbacks, and compensation — and emits **executable Commands** for the Execution layer. A Workflow defines **HOW work is coordinated**. **Execution defines HOW work is performed.** A Workflow orchestrates; it never executes business logic, never calls a provider or LLM, never owns business state.

---

## 1. Purpose

### Why the Workflow layer exists

Tasks (doc 38) are the smallest business units of work — deterministic, assignable, auditable *descriptions*. But a real outcome is rarely one Task: it is many Tasks that must run in a specific order, some in parallel, some only if a condition holds, some needing a human checkpoint mid-stream, some requiring that a failure half-way through be *undone* or *compensated*. Something must coordinate a set of Tasks into a coherent, deterministic, recoverable orchestration — and turn that orchestration into concrete executable Commands — without itself performing the work. Workflows are that layer.

Workflows are the **system of record for how the company coordinates work.** A Workflow takes one or more Tasks and arranges them into an **execution graph** (sequential, parallel, conditional, event-driven, scheduled, human-in-the-loop, multi-agent, hybrid), declares how the whole coordinated unit succeeds, fails, retries, rolls back, and compensates, and emits the **Commands** that the Execution layer performs. It is the last coordinating layer before pure execution — the conductor that reads the score (Tasks) and cues the players (Commands), while playing no instrument itself.

Without a Workflow layer, the platform would jump from discrete Task descriptions straight to Commands, and six things would break: coordination would be implicit (no declared order/parallelism/branching), recovery would be local-only (no cross-task rollback or compensation), human checkpoints would have nowhere to live (no mid-orchestration approval gates), multi-agent collaboration would be unstructured (no orchestration of several agents toward one outcome), concurrency would be ungoverned (no limits), and the description→execution boundary would blur (Tasks or Commands doing coordination). Workflows close that gap and hold the **orchestration boundary**: Tasks and above *describe*; Workflows *coordinate*; Execution *performs*.

### Business problem it solves

1. **Coordination made explicit and deterministic.** How multiple units of work combine — order, parallelism, conditions, concurrency — must be an explicit, deterministic, reviewable graph, not emergent behavior. Workflows are that graph.
2. **Recoverability across units.** When a multi-step effort fails partway, the company needs declared rollback and compensation — undo what was done, or run compensating actions — so the system returns to a consistent state. Workflows own that cross-Task recovery architecture.
3. **Human and multi-agent orchestration.** Real work mixes humans, agents, and external systems, with approval checkpoints and hand-offs. Workflows coordinate all of them toward one outcome without performing any of it themselves.

### Its responsibility

- Own the lifecycle of every orchestration: `draft → planned → approved → released → running → paused → completed | failed | cancelled → superseded → archived` (governed), separate from health `unknown → healthy / degraded / blocked` (observed).
- Guarantee every Workflow consumes one or more Tasks and belongs (transitively) to exactly one Plan, Goal, and Mission.
- Own the **execution graph** and its topology: sequential/parallel/conditional groups, approval gates, event triggers, concurrency limits, completion conditions.
- Own the **recovery architecture**: retry strategy, timeout strategy, rollback strategy, compensation strategy, escalation strategy.
- **Produce Commands, never perform work.** A Workflow emits executable Commands for the Execution layer; it never runs business logic, never calls a provider/LLM, never dispatches to a provider directly.
- Emit Workflow events so Execution, Governance, and dashboards react to orchestration status, readiness, and drift.
- Preserve an immutable, versioned audit trail of every Workflow, every version, and every orchestration run.

### What is explicitly NOT its responsibility

- **Workflows never execute business logic.** They coordinate; the actual doing is Execution performing Commands.
- **Workflows never call providers or LLMs, nor dispatch to providers directly.** Provider/LLM interaction is exclusively Execution's. A Workflow *emits a Command*; Execution *dispatches* it.
- **Workflows never own business state.** The outcome data, the domain records, the provider results belong to the business modules and Execution — never to the orchestrator. A Workflow owns *orchestration state* (which node ran, what to do next), not business state.
- **Workflows never own business intent.** Intent lives in Mission/Goal/Plan/Task. A Workflow coordinates the realization of intent; it holds none of its own.
- **Workflows never modify Mission, Goal, Plan, or Task.** They reference and consume them; they cannot create, amend, or reinterpret any.
- **Workflows never override the authority stack.** Subordinate to Task, Plan, Goal, Mission, Approved Policy, Security/Compliance, and Law.

---

## 2. Mental Model

If Mission is the **North Star**, Goals the **waypoints**, Plans the **route**, Work Packages the **legs**, and Tasks the **precisely-specified steps**, then a Workflow is the **conductor and the score-reading** — the coordinated arrangement that decides which steps happen when, which run together, which depend on a condition, where a human must nod before continuing, and what to undo if the performance breaks down. The conductor cues every entrance; the conductor plays nothing. The playing (performing the Commands) is Execution.

The mental model in one line: **A Workflow is a versioned, owned, deterministic orchestration that consumes one or more Tasks and arranges them into an execution graph — sequential, parallel, conditional, human-gated, multi-agent — with declared retry, rollback, compensation, and escalation, and emits executable Commands for the Execution layer, without ever performing work, calling a provider/LLM, or owning business state or intent.**

Seven properties define the model:

- **Orchestrating, not performing.** A Workflow coordinates *how* work runs; it never does the work. The instant something is *performed* — a provider call, an LLM invocation, a state mutation — it is a Command executed by Execution, below the Workflow.
- **Task-consuming, Command-producing.** A Workflow consumes one or more Tasks (their descriptions and policies) and produces one or more Commands. That is its exact throughput: descriptions in, executable Commands out.
- **Deterministic.** Given the same Task inputs and the same conditions, a Workflow's orchestration decisions are deterministic — the same graph traversal, the same branch choices, the same Commands. Orchestration is reproducible, not improvised.
- **Graph-shaped.** A Workflow is an execution graph of nodes (Tasks/checkpoints/branches) and edges (dependencies/conditions), with parallel and sequential groups, gates, and completion conditions. The graph is the Workflow's core structure.
- **Recoverable by construction.** Every Workflow declares how it retries, times out, rolls back, compensates, and escalates. Cross-Task recovery is a first-class part of the orchestration, not an afterthought.
- **Coordinating humans, agents, and systems.** A Workflow orchestrates any mix of performers — humans (with approval checkpoints and hand-offs), agents (single or multi-agent), and external systems — toward one coordinated outcome.
- **Bounded, not sovereign.** A Workflow is subordinate to its Tasks, their Plan/Goal/Mission, Approved Policy, Security/Compliance, and Law. It coordinates only work those layers permit and every Task it consumes has already been authorized to describe.

Workflows sit **beneath Tasks in authority and above Commands in production.** Tasks hand a Workflow bounded descriptions to coordinate; the Workflow hands Execution the Commands to perform. Workflows are the hinge between *what work* (Tasks) and *performed work* (Commands/Execution) — and they are exclusively about *coordinating*, never *doing*.

---

## 3. Core Domain Objects

Workflows introduce one primary entity and a set of supporting objects. All reuse the existing column contracts from `_base.ts`:

- **`rootColumns`**: `id`, `createdAt`, `createdBy`, `updatedAt`, `updatedBy`, `version`, `lifecycleStatus` (`active | archived | deleted`), `deletedAt`.
- **`tenantColumns`** = `rootColumns` + `tenantId` (FK → `companies.id`, NOT NULL).

`createdBy` / `updatedBy` / `ownerRef` resolve to **actor references** per Identity §3.9. No Workflow mutates without a resolved actor.

Note on enums: the existing `executionStatusEnum` (`pending | running | completed | cancelled | failed | simulated`) and `commandStatusEnum` (`queued | running | completed | cancelled | failed | simulated`) describe *run* state below the Workflow. This specification defines the governed `workflowLifecycleStatusEnum` (§6) for the Workflow object; run-time projections onto the existing enums are noted in §6.

---

### 3.1 Workflow

- **Purpose.** A versioned, owned, deterministic orchestration that consumes Tasks and produces Commands. The primary object of this module.
- **Table.** `workflows` (`tenantColumns`).
- **Conceptual fields** (the full anatomy every Workflow carries):
  - `id` — Workflow ID.
  - `tenantId` — owning company (Identity §3.1).
  - `missionRef` — `{missionId, missionVersion}` — inherited apex context. Required.
  - `goalRef` — `{goalId, goalVersion}` — inherited outcome context. Required.
  - `planRef` — `{planId, planVersion}` — the Plan this orchestration serves. Required.
  - `taskRefs` — one or more `{taskId, taskVersion}` — the Tasks this Workflow consumes. Required, non-empty.
  - `ownerRef` — the single accountable actor for the orchestration.
  - `priority` — `workflowPriorityEnum`: `critical | high | medium | low`.
  - `workflowLifecycleStatus` — governed lifecycle position (`workflowLifecycleStatusEnum`, §6).
  - `workflowHealth` — health signal (`workflowHealthEnum`, §6): `unknown | healthy | degraded | blocked`. In-flight only; auto-derived; never triggers a lifecycle change.
  - `approvalState` — reuses `approvalStateEnum` for approval gates.
  - `executionStrategy` — `workflowExecutionStrategyEnum` (§3.2): `sequential | parallel | conditional | event-driven | scheduled | human-in-loop | multi-agent | hybrid`.
  - `executionGraph` — the node/edge graph of the orchestration (§3.3).
  - `parallelGroups` — sets of nodes that may run concurrently.
  - `sequentialGroups` — ordered chains of nodes.
  - `conditionalBranches` — condition → subgraph mappings (§3.4).
  - `dependencies` — prerequisite Workflows/conditions.
  - `approvalGates` — mid-orchestration human checkpoints (§3.5).
  - `retryStrategy` — orchestration-level retry rules (§3.6).
  - `timeoutStrategy` — orchestration-level time bounds.
  - `compensationStrategy` — compensating actions when steps cannot be rolled back (§3.7).
  - `rollbackStrategy` — undo of completed steps on failure (§3.7).
  - `escalationStrategy` — who/what is escalated to on failure/timeout/block.
  - `resourceConstraints` — bounds on resources the orchestration may use.
  - `concurrencyLimits` — max concurrent nodes/Commands.
  - `eventTriggers` — domain events that start or advance the Workflow.
  - `completionConditions` — the predicate defining Workflow success. Required.
  - `executionConstraints` — environment posture (`providerStatusEnum`: simulation/dry-run/read-only/blocked/live) the emitted Commands must honor.
  - `workflowVersion` — immutable version counter (distinct from row `version`).
  - `supersedesWorkflowId` — nullable FK → prior version.
  - base lifecycle/audit fields (audit metadata).
- **Required.** `tenantId`, `missionRef`, `goalRef`, `planRef`, `taskRefs` (≥1), `ownerRef`, `executionStrategy`, `executionGraph`, `retryStrategy`, `timeoutStrategy`, `rollbackStrategy`, `compensationStrategy`, `approvalGates`, `eventTriggers`, `completionConditions`, `workflowLifecycleStatus`. (`workflowHealth` defaults `unknown`.)
- **Optional.** `parallelGroups`/`sequentialGroups`/`conditionalBranches` (per strategy), `dependencies`, `escalationStrategy`, `resourceConstraints`, `concurrencyLimits`, `supersedesWorkflowId`.
- **Ownership.** Owned by exactly one company; accountable to one owner; bound to one Plan/Goal/Mission; consuming ≥1 Task.
- **Example.** Plan "EU launch" Tasks (translate, QA, publish, notify) → Workflow *"DE storefront go-live"*: strategy `hybrid`, graph (translate → QA → [human approval gate] → parallel(publish, index) → notify), rollback (unpublish on failure), compensation (send correction), `planRef {p1,v2}`.

### 3.2 Execution Strategy

- **Purpose.** Declares the coordination shape of the orchestration. Governs how the execution graph is traversed — not the performing of work.
- **Realization.** `workflowExecutionStrategyEnum` (specified): `sequential | parallel | conditional | event-driven | scheduled | human-in-loop | multi-agent | hybrid`.
  - **sequential** — nodes run strictly in order.
  - **parallel** — independent nodes run concurrently within limits.
  - **conditional** — branches taken by evaluated conditions.
  - **event-driven** — nodes advance on domain events.
  - **scheduled** — the orchestration (or nodes) advance on a schedule.
  - **human-in-loop** — one or more human approval checkpoints gate progress.
  - **multi-agent** — several agents are coordinated toward one outcome (hand-offs, voting, delegation).
  - **hybrid** — any composition of the above.
- **Rule.** Strategy is a *coordination descriptor*. It never means the Workflow performs work; it means the orchestration engine traverses the graph in this shape and emits Commands accordingly.

### 3.3 Execution Graph

- **Purpose.** The core structure of a Workflow: a directed acyclic graph of **nodes** (each mapping to a Task, an approval gate, a branch, or a compensation) and **edges** (dependencies/conditions). Makes coordination explicit and deterministic.
- **Realization.** A structured `{nodes, edges}` object. Each node `{id, type ∈ {task, gate, branch, compensation, join}, ref?, condition?}`; each edge `{from, to, guard?}`. The graph is acyclic (§7); parallel groups are sets of nodes with no path between them; sequential groups are ordered chains.
- **Determinism rule.** Given identical inputs and conditions, graph traversal yields an identical node ordering and identical emitted Commands. **Workflow orchestration is deterministic.**

### 3.4 Conditional Branch

- **Purpose.** A decision point where the traversed subgraph depends on an evaluated condition (a Task result, an event, an attribute).
- **Realization.** Entries in `conditionalBranches`, each `{id, condition, thenSubgraph, elseSubgraph?}`. The condition is evaluated over already-observed results (from completed nodes) — the Workflow *reads* results to branch; it does not *compute* business logic to produce them.
- **Example.** "if QA failed → compensation(rollback publish) else → notify."

### 3.5 Approval Gate (checkpoint)

- **Purpose.** A mid-orchestration human (or governance) checkpoint that must clear before the Workflow proceeds past that node. The seam for human-in-the-loop.
- **Realization.** Nodes of `type=gate` with `{requiredAuthority, approvalState}` (reuses `approvalStateEnum`). Traversal pauses at an unresolved gate (`paused` lifecycle or a waiting node) until `approved`; on `rejected`, the Workflow follows its rejection edge (typically compensation/rollback then fail).
- **Rule.** Governance evaluates the approver's authority; the Workflow records the gate state.

### 3.6 Retry & Timeout Strategy

- **Purpose.** Orchestration-level recovery for transient failures and time bounds — distinct from a Task's own retry/timeout policy.
- **Realization.** `retryStrategy` `{scope ∈ {node, group, workflow}, maxAttempts, backoff, retryOn}`; `timeoutStrategy` `{scope, duration, onTimeout ∈ {fail, retry, escalate, compensate}}`. A node retry re-emits that node's Command; a Workflow-level retry re-traverses per strategy. Composes with Task-level policy (§9): Task policy governs the unit; Workflow policy governs the coordination.

### 3.7 Rollback & Compensation Strategy

- **Purpose.** The cross-Task recovery architecture. **Rollback** undoes already-completed, reversible steps; **compensation** runs compensating actions for steps that cannot be undone (e.g. an email already sent → send a correction).
- **Realization.**
  - `rollbackStrategy` — an ordered set of inverse operations for reversible nodes, executed in reverse completion order on failure (a saga-style unwind). Each rollback step is itself emitted as a Command; the Workflow orchestrates the unwind, Execution performs it.
  - `compensationStrategy` — for irreversible nodes, a declared compensating node executed forward to counteract the effect. Compensation is *forward recovery*; rollback is *backward recovery*.
- **Rule.** Both are declarative graphs of Commands the Workflow emits; the Workflow never performs the undo/compensation itself. A Workflow that cannot fully roll back must compensate, and if it can do neither, it escalates and fails to a consistent, audited terminal state — never a silent partial state.

### 3.8 Workflow Version (immutable lineage record)

- **Purpose.** The permanent record of an orchestration's revisions and supersessions. Answers "how did this coordination change, and which version ran."
- **Realization.** A superseded Workflow is retained immutably; its successor carries `supersedesWorkflowId` and an incremented `workflowVersion`. Execution binds to a specific released Workflow version. **Workflow versions and history are immutable.**

---

## 4. Ownership

- **Owned by Company.** Every Workflow belongs to exactly one company via `tenantId`. No global workflows.
- **Bound to one Plan/Goal/Mission, consuming ≥1 Task.** Every Workflow carries one `planRef`, one `goalRef`, one `missionRef`, and one or more `taskRefs`. **No Workflow without Tasks; every Workflow belongs to one Plan, one Goal, one Mission** — mandatory and transitive.
- **Accountable to one owner.** Exactly one `ownerRef` — the accountable actor for the orchestration (human, department/team, or agent bounded by its human owner, Identity §3.8).
- **Ownership vs coordination.** `ownerRef` is *who is accountable* for the orchestration; the *performers* of the coordinated work are the Tasks' assignees and, ultimately, Execution. A Workflow owner owns the *coordination*, not the doing.
- **Agent-owned orchestration bounded.** An agent may own/author a Workflow only within its human owner's authority and only coordinating Tasks the Plan/Goal/Mission/Policy stack permits.
- **Ownership transfer.** On owner departure/reassignment (Identity §11), `ownerRef` re-points to an active in-tenant actor before archival. Never orphaned.
- **No cross-tenant workflows.** A Workflow never spans companies; every consumed Task is in the same tenant.

---

## 5. Workflow Topology

Workflows are structured by their **execution graph** (the topology of coordination) and positioned in the **cognitive chain** and a **composition hierarchy**.

### 5.1 Cognitive-chain position

```
Mission → Goal → Plan → Work Package → Task
                                          → Workflow      (this document — orchestrates Tasks)
                                            → Commands       — emitted executable units
                                              → Execution      — the ONLY performer/dispatcher
```

- **A Workflow consumes one or more Tasks** and **produces one or more Commands** — its exact throughput.
- **Commands are the bottom edge of the Workflow module.** Below Commands the chain leaves this module: `Workflow → Commands → Execution`. Workflows never perform, never dispatch to providers.

### 5.2 Execution-graph topology

The graph supports, in any composition:

- **Sequential groups** — ordered chains: node A → B → C.
- **Parallel groups** — concurrent sets: {A, B, C} run together within `concurrencyLimits`, joined at a `join` node.
- **Conditional branches** — condition-guarded subgraphs (§3.4).
- **Approval gates** — human/governance checkpoints that pause traversal (§3.5).
- **Event triggers** — nodes that wait for or are started by domain events.
- **Compensation/rollback subgraphs** — recovery paths attached to failure edges (§3.7).
- **Completion conditions** — the predicate over terminal nodes that marks the Workflow `completed`.

The graph is a DAG: acyclic, with well-defined entry and terminal nodes. Cycles are rejected (§7); iteration is modeled as bounded, versioned expansion, not a runtime loop in the graph.

### 5.3 Composition hierarchy (sub-workflows)

- A Workflow node may reference a **sub-workflow** (a nested orchestration), forming an acyclic composition tree, all under the same Plan (or a Plan and its nested Plans).
- Sub-workflows inherit the parent's Plan/Goal/Mission context and must align; contradiction rejected at validation.
- Health/status may roll up from sub-workflows to parent; accountability stays per-Workflow.

### 5.4 Multi-agent and human-in-the-loop topology

- **Multi-agent orchestration.** A `multi-agent` Workflow coordinates several agents toward one outcome via graph patterns: **fan-out/fan-in** (parallel agent nodes joined), **hand-off** (sequential agent-to-agent), **delegation** (a coordinator node assigns sub-nodes to agent nodes), and **voting/consensus** (parallel agent nodes whose results a `join` node reconciles by a declared rule). Every agent node maps to an agent-typed Task; the Workflow coordinates, each agent's work is performed via its Command in Execution.
- **Human-in-the-loop orchestration.** Approval gates and human-typed Task nodes interleave with agent/system nodes. The Workflow pauses at a human node/gate, surfaces it for action (Notifications/Approval), and resumes on response — coordinating people exactly as it coordinates agents, without performing their work.

### 5.5 The orchestration boundary (why Workflows stop at Commands)

- **Workflows produce Commands** — the executable units the Execution layer performs.
- **Execution performs Commands** — the only layer that runs business logic, calls providers/LLMs, and mutates business state.

This separation keeps *coordination* (deterministic, graph-shaped, recoverable, immutable-in-lineage) cleanly divided from *performance* (provider-bound, side-effecting, runtime-stateful). A Workflow performing business logic, calling a provider, dispatching directly, or holding business state collapses the boundary and is an architectural defect.

---

## 6. Lifecycle

A Workflow carries **two orthogonal state dimensions** (mirroring Goal/Plan/Task) that must never be conflated:

- **Lifecycle** (`workflowLifecycleStatusEnum`) — *where the Workflow is in its governed existence.* Governed transitions only.
- **Health** (`workflowHealthEnum`) — *how well an in-flight orchestration is doing.* Auto-derived; never a lifecycle transition.

Governing rule: **a Workflow is Task-consuming, Plan/Goal/Mission-bound, graph-complete, recovery-complete, gated, and approved before it may be released to run; lifecycle changes are governed; health merely observes; history and versions are immutable; orchestration is deterministic.**

### 6.1 Lifecycle dimension

**`workflowLifecycleStatusEnum`** (specified): `draft | planned | approved | released | running | paused | completed | failed | cancelled | superseded | archived`.

| Lifecycle state | Meaning | Mutable? | Carries health? |
|---|---|---|---|
| **draft** | Being authored; incomplete allowed | Yes (full edit) | No |
| **planned** | Graph + strategies fully specified; not yet approved | Limited | No |
| **approved** | All mandatory approval gates cleared; orchestration committed | Limited | No |
| **released** | Deployed/available to run; awaiting trigger or start | No (config frozen) | **Yes** |
| **running** | Orchestration in progress; nodes emitting Commands below | No (progress only) | **Yes** |
| **paused** | Halted mid-run (gate, manual, or governed hold) | No (progress only) | **Yes** |
| **completed** | Completion conditions satisfied | No (terminal-positive) | No (health cleared) |
| **failed** | Terminated unsuccessfully after recovery exhausted | No (terminal) | No |
| **cancelled** | Withdrawn before completion (governed) | No (terminal) | No |
| **superseded** | Replaced by a new Workflow version | No (immutable) | No |
| **archived** | Retired; terminal | No (immutable) | No |

`running`/`paused`/recovery states project onto the existing `executionStatusEnum` for the run and `commandStatusEnum` for emitted Commands; the Workflow object holds the governed lifecycle above them.

**Lifecycle transitions (governed):**

| Transition | From → To | Precondition | Effect | Emits |
|---|---|---|---|---|
| **Draft** | ∅ → draft | Authoring actor resolved | Row created, `workflowLifecycleStatus=draft`, `workflowHealth=unknown` | `WorkflowDrafted` |
| **Plan** | draft → planned | Passes graph + recovery + binding validation (§8) | `workflowLifecycleStatus=planned` | `WorkflowPlanned` |
| **Approve** | planned → approved | All mandatory approval gates `approved`; consumed Tasks `ready`; Plan execution-ready | `workflowLifecycleStatus=approved` | `WorkflowApproved` |
| **Release** | approved → released | Deployment/readiness confirmed | `workflowLifecycleStatus=released`; health tracking begins (`unknown`) | `WorkflowReleased` |
| **Start** | released → running | Trigger fired (manual/scheduled/event) | traversal begins; nodes emit Commands | `WorkflowStarted` |
| **Pause** | running → paused | Approval gate hit, manual hold, or governed pause | traversal halts; in-flight Commands quiesce per policy | `WorkflowPaused` |
| **Resume** | paused → running | Gate cleared / hold released | traversal resumes deterministically from the paused node | `WorkflowResumed` |
| **Complete** | running → completed | Completion conditions satisfied | `workflowLifecycleStatus=completed` (terminal); health cleared to `unknown`, frozen | `WorkflowCompleted` |
| **Fail** | running/paused → failed | Recovery (retry/rollback/compensation) exhausted or unrecoverable | rollback/compensation orchestrated to a consistent state; `workflowLifecycleStatus=failed` (terminal) | `WorkflowFailed` |
| **Cancel** | non-terminal → cancelled | Governed withdrawal | in-flight quiesced, compensation as declared; `workflowLifecycleStatus=cancelled` (terminal) | `WorkflowCancelled` |
| **Supersede** | non-terminal → superseded | A new Workflow version is approved | `workflowLifecycleStatus=superseded`, immutable; `supersedesWorkflowId` set on successor | `WorkflowSuperseded` |
| **Archive** | terminal/non-terminal → archived | Governed retirement | `lifecycleStatus=archived`, `workflowLifecycleStatus=archived` (terminal, no reactivation) | `WorkflowArchived` |
| **Version (revise)** | draft/planned → superseded (+ successor) | Material change to graph/strategies | New `workflowVersion` via supersession; prior retained immutable | `WorkflowRevised` |

Every lifecycle transition is governed and audited. **Health never appears in this table** — no health value causes any transition. (A `degraded`/`blocked` health does not pause or fail the Workflow; only a governed transition does, though a human/Reasoning may *act* on the health signal.)

### 6.2 Health dimension

**`workflowHealthEnum`** (specified): `unknown | healthy | degraded | blocked`.

| Health state | Meaning | Set how |
|---|---|---|
| **unknown** | No sufficient signal yet (default; also for terminal Workflows) | default / on clear |
| **healthy** | Orchestration progressing within time/retry/resource bounds | auto |
| **degraded** | Partially impaired (some nodes retrying, slow, or a non-critical branch failed) but still progressing | auto |
| **blocked** | Cannot progress (unresolved gate, dependency, resource, or a critical node stalled) | auto |

**Health rules:**

- **Scope.** Health applies **only** to in-flight lifecycle states (`released | running | paused`). In `draft`/`planned`/`approved` it is `unknown`; in `completed`/`failed`/`cancelled`/`superseded`/`archived` it is cleared to `unknown` and frozen — **terminal Workflows carry no active health.**
- **Automatic.** Derived from **node statuses, emitted-Command outcomes, retry counts, elapsed vs timeout, concurrency saturation, gate/dependency states, and resource pressure.** Never a manual lifecycle act.
- **No lifecycle effect.** **Health never changes lifecycle; lifecycle never derives from health.** A `degraded`/`blocked` Workflow stays `running`/`paused`; only governed transitions move lifecycle.
- **Observability, not authority.** Health drives alerts, KPIs, and Governance signals; humans/Reasoning may then choose a governed action.

### 6.3 Terminal-state rules

- **completed / failed / cancelled** are terminal. **Archived Workflows never reactivate; completed never reactivates** — re-running is a new run of a released version or a new Workflow, never a resurrection of a terminal instance.
- **superseded** Workflows are **immutable** and permanent. **Workflow versions and history are immutable.**
- Terminal Workflows hold `workflowHealth = unknown` (cleared, frozen).
- **Workflow history is immutable and fully traceable** up to Mission — every transition, node run, emitted Command reference, retry, rollback, and compensation retained append-only. No history deleted (except the legal-erasure exception, Identity §13).

---

## 7. Constraints

Structural and semantic constraints, enforced by the schema and the module — not by convention.

**Structural (schema-enforced):**

1. **Task references mandatory & non-empty.** `taskRefs` ≥ 1. **No Workflow without Tasks.** `planRef`/`goalRef`/`missionRef` mandatory and mutually consistent (same chain).
2. **Owner mandatory.** `ownerRef` NOT NULL.
3. **Graph & recovery completeness mandatory.** `executionGraph`, `retryStrategy`, `timeoutStrategy`, `rollbackStrategy`, `compensationStrategy`, `approvalGates`, `eventTriggers`, `completionConditions` present before a Workflow may leave `draft`.
4. **Acyclic graph & composition.** `executionGraph` is a DAG; sub-workflow composition and dependency graph acyclic (checked at write time). `supersedesWorkflowId ≠ id`.
5. **Tenant isolation.** `tenantId` NOT NULL, FK → `companies.id`. Every consumed Task in the same tenant.
6. **Terminal immutability.** Rows in `completed | failed | cancelled | superseded | archived` reject content mutation. Versions immutable; archived/completed never reactivate.
7. **Version monotonicity.** `workflowVersion` strictly increases along the supersession chain.
8. **Approval before release.** A Workflow cannot reach `released` until all mandatory approval gates are `approved` and consumed Tasks are `ready`.

**Semantic (module-enforced):**

9. **Subordinate to the authority stack.** A Workflow — and every Command/Execution it drives — may never override **Law, Security/Compliance, Approved Policy, Mission, Goal, Plan, or Task.** Precedence fixed (header). A Workflow requiring a violation cannot be approved/released; a conflict arising later halts and escalates for explicit human resolution.
10. **Determinism.** Orchestration is deterministic: identical inputs/conditions ⇒ identical traversal and identical emitted Commands. Non-determinism (unbounded loops, race-dependent order without a declared reconciliation) is rejected.
11. **Alignment/context inherited, continuously validated.** Re-checked on Task revision/supersession, Plan revision, Goal redefinition, Mission ratification. Misalignment raises `WorkflowDriftDetected`.
12. **Sub-workflows align with parent and context.** Contradiction rejected.
13. **Lifecycle and health orthogonal.** Separate fields, separate rules; health never writes lifecycle.
14. **Health scoped and derived.** `workflowHealth ∈ {healthy, degraded, blocked}` only while in-flight (`released`/`running`/`paused`); otherwise `unknown`. Auto-derived; never manual.
15. **Workflows never perform work, call providers/LLMs, dispatch directly, or own business state.** Structurally, `workflows` has no provider/LLM binding, no direct-dispatch edge, no business-state field. Output is exclusively Commands consumed by Execution.
16. **Recovery closure.** Every reversible node has a rollback path or a compensation; a Workflow that can neither roll back nor compensate a failed node must escalate and terminate to a consistent, audited state — never a silent partial commit.
17. **Environment posture honored.** `executionConstraints` posture (`providerStatusEnum`) propagates to every emitted Command; a non-`live` Workflow emits only simulate/dry-run Commands.

---

## 8. Validation

Validation runs at gates: **draft → planned** (specification), **planned → approved** (approval), **approved → released** (release readiness), and **continuous** (standing re-validation while in-flight). Workflows fail closed: on ambiguity they refuse to advance and no ill-formed orchestration runs.

**Binding & context validation (at specification and continuously):**

- `planRef` resolves to an **approved, execution-ready** Plan (Plan §3.5) in the same tenant; `goalRef`/`missionRef` match; every `taskRef` resolves to a real, in-tenant Task of that Plan.
- The Workflow does not contradict its Tasks' acceptance, the Plan's strategy, the Goal's criteria, or any Mission principle.
- **Standing re-check:** on Task/Plan/Goal/Mission change, in-flight Workflows re-validate; new misalignment flags and raises `WorkflowDriftDetected`.

**Graph validation (at specification):**

- `executionGraph` is a well-formed DAG with defined entry/terminal nodes; every node references a valid Task/gate/branch/compensation; parallel/sequential groups consistent with edges; no cycles.
- Every consumed Task appears as at least one node; no node references a Task outside `taskRefs`.

**Recovery validation (at specification):**

- `retryStrategy`, `timeoutStrategy`, `rollbackStrategy`, `compensationStrategy`, `escalationStrategy` well-formed; every reversible node has rollback or compensation (recovery closure, §7.16); completion conditions evaluable.

**Determinism validation (at specification):**

- No unbounded loops; parallel joins declare a reconciliation rule; conditional branches have exhaustive, deterministic guards. Non-deterministic constructs rejected.

**Ownership & authority validation (at specification / approval):**

- `ownerRef` live and in-tenant; agent owner within ceiling. Approval-gate approvers satisfy `requiredAuthority`; separation of duties where required.

**Authority-stack validation (at specification and re-checked at release):**

- The orchestration (and its emitted Commands' intent) checked against Law/Regulation, Security/Compliance, Approved Policy, and permissions. A Workflow requiring a violation **cannot be approved/released**; conflict recorded and routed for **explicit human resolution**.

**Release-readiness validation (approved → released):**

- All mandatory gates cleared; consumed Tasks `ready`; resources/concurrency budget available; parent Plan execution-ready; environment posture consistent. Otherwise stays `approved`.

**Health validation (continuous):**

- `workflowHealth` non-`unknown` only while in-flight; otherwise coerced to `unknown`.
- A health update carries no lifecycle change; a write moving lifecycle "because health changed" is refused.
- Health inputs must resolve; unresolved inputs yield `unknown`, never a stale `healthy`.

Only a Workflow passing all applicable gates advances. Failure returns it toward `draft`/`planned`; ill-formed orchestration never runs.

---

## 9. Relationships

Workflows point *up* at Task/Plan/Goal/Mission and the authority stack; *sideways* at other Workflows; and *down* at Commands. Workflows never perform work or touch providers directly.

| Module | Relationship to Workflows |
|---|---|
| **Mission** | Inherited apex context (`missionRef`); continuously validated; never modified by the Workflow. |
| **Goal** | Inherited outcome context (`goalRef`); never modified. |
| **Plan** | Bound context (`planRef`); a Workflow may be released only atop an approved, execution-ready Plan (Plan §3.5); never modified. |
| **Task** | **The consumed input.** A Workflow consumes one or more Tasks (`taskRefs`), mapping each to graph nodes and honoring each Task's retry/timeout/acceptance/constraints. Task §9 says Tasks "produce Workflow inputs"; this is the consuming edge. **Workflows never modify Tasks.** Task-level policy governs the unit; Workflow-level strategy governs the coordination. |
| **Commands** | **The produced output.** A Workflow **produces one or more Commands** — the executable units the Execution layer performs. The Workflow decides *what to run and when*; the Command is the *executable instruction*. Workflows emit Commands; they never dispatch them. |
| **Execution** | **The performer.** Execution consumes the Workflow's Commands and performs them — the only layer that runs business logic, calls providers/LLMs, and mutates business state. A Workflow **never dispatches to providers directly**; it emits Commands, Execution dispatches. |
| **Agent Registry** | Supplies the agents coordinated by agent/multi-agent nodes and their capabilities; assignment/coordination respects each agent's ceiling (Identity §3.8/§6). |
| **Reasoning** | Reasoning/Decisions resolve `degraded`/`blocked` conditions, choose branches where a decision (not a fixed guard) is required, and decide escalations/retries beyond declared policy. The Workflow supplies the graph and observed results; Reasoning supplies judgment. A Workflow does not itself reason. |
| **Memory** | A Workflow may coordinate nodes that read/write memory (`memoryKindEnum`); the actual read/write is a Command performed by Execution, coordinated here. |
| **Knowledge** | Same: knowledge retrieval nodes are coordinated; retrieval performed in Execution. |
| **Human Approval** | Approval-gate nodes gate traversal on human sign-off (reuses `approvalStateEnum`); the human-in-the-loop seam. |
| **Execution Readiness** | A Workflow releases only if consumed Tasks are `ready` and the parent Plan is execution-ready; the readiness gates compose up the chain (Plan-ready → Task-ready → Workflow-released). |
| **Policies** | Constrain the *means* of coordinated work and rank above the Workflow; cited as constraints, never overridden. |
| **Permissions** | The performers' permitted actions (Identity §6) bound what Commands a Workflow may emit for them; over-ceiling coordination rejected. |
| **Audit** | Every Workflow mutation and every run writes an immutable audit record; fully traceable to Mission. |

**The orchestration spine:** `Mission → Goal → Plan → Task → Workflow → Commands → Execution`. Workflows are the node that turns discrete Task descriptions into a deterministic, recoverable coordination and emits the Commands to perform it — stopping exactly at the Command edge.

---

## 10. Events

Every Workflow mutation and orchestration step emits exactly one domain event. Events are the module's public reaction surface — Execution, Governance, and dashboards subscribe; they never read Workflow tables directly. Payloads carry `actorRef`, `tenantId`, `workflowId`, `workflowVersion`, `planRef`, `goalRef`, `missionRef`, and `occurredAt`.

| Event | Trigger | Payload (beyond envelope) | Consumers | Business impact |
|---|---|---|---|---|
| `WorkflowDrafted` | New draft created | strategy, taskRefs | Dashboard, Governance | Candidate orchestration; not binding |
| `WorkflowPlanned` | Graph + strategies specified | graph summary | Governance, Dashboard | Coordination described and validated |
| `WorkflowApproved` | Mandatory gates cleared | approverRefs | Dashboard, Governance | Orchestration committed |
| `WorkflowReleased` | Deployed/available to run | releaseSnapshot | **Execution**, Governance | Orchestration runnable; health tracking begins |
| `WorkflowStarted` | Traversal begins | triggerRef | Execution, Dashboard | Coordination underway |
| `WorkflowNodeStarted` / `WorkflowNodeCompleted` / `WorkflowNodeFailed` | Node state change | nodeId, taskRef?, commandRef? | Execution, Dashboard, Governance | Per-node coordination observability |
| `WorkflowCommandEmitted` | A Command is produced for Execution | commandRef, nodeId | **Execution** | Executable unit handed to the performer |
| `WorkflowGateReached` / `WorkflowGateResolved` | Approval gate hit/cleared | gateId, approvalState | Human Approval, Notifications | Human-in-the-loop checkpoint |
| `WorkflowPaused` / `WorkflowResumed` | Traversal halt/continue | reason / resumeNode | Dashboard, Governance | Deterministic pause/resume |
| `WorkflowHealthChanged` | Health recomputed (in-flight only) | fromHealth, toHealth, drivers | Dashboard, Governance | Health moved; **no lifecycle change** |
| `WorkflowDegraded` / `WorkflowBlocked` | Health specializations | impairedNodes / blockingRef | Governance, Notifications | Alerts; **lifecycle unchanged** |
| `WorkflowRetryTriggered` | Node/group/workflow retry per strategy | scope, attemptNo | Execution, Dashboard | Recovery attempt (performed below) |
| `WorkflowRollbackStarted` / `WorkflowRollbackCompleted` | Backward recovery | unwoundNodes | Execution, Governance, Audit | Reversible steps undone to consistency |
| `WorkflowCompensationTriggered` | Forward recovery for irreversible step | compensationNode | Execution, Governance, Audit | Compensating action orchestrated |
| `WorkflowEscalated` | Escalation strategy fired | target, reason | Governance, Notifications | Human/authority pulled in |
| `WorkflowCompleted` | Completion conditions satisfied | outcomeSummary | Plan (informs), Governance, Reporting | Coordination done; health cleared |
| `WorkflowFailed` | Recovery exhausted/unrecoverable | reason, finalState | Governance, Reasoning, Notifications | Terminal, consistent, audited failure |
| `WorkflowCancelled` | Governed withdrawal | reason | Dashboard, Governance | Orchestration withdrawn |
| `WorkflowRevised` / `WorkflowSuperseded` | Version change | newWorkflowVersion / successorId | Execution, Governance, Audit | Downstream binds to new version |
| `WorkflowArchived` | Retired | reason | Dashboard, Reporting | Orchestration retired (no reactivation) |
| `WorkflowDriftDetected` | Context validation fails vs Task/Plan/Goal/Mission | violatedRef, version | **Governance (high severity)**, Notifications, Audit | Coordination diverging; halt/escalate |
| `WorkflowOwnershipReassigned` | Owner changed | fromOwnerRef, toOwnerRef | Governance, Dashboard | Accountability re-points |

**Ordering and idempotency.** Events carry `workflowVersion` (and `nodeId`/`attemptNo` where relevant); consumers discard stale/duplicate deliveries. Emission is **transactional with the mutation** — no event fires unless the state change committed; a failed audit/event write rolls back the mutation.

**Two independent streams.** Health events (`WorkflowHealthChanged` + specializations) never accompany or cause a lifecycle change; lifecycle events never carry a health transition. Consumers must not infer one from the other.

---

## 11. KPIs

Workflow health and the company's orchestration performance, measured deterministically from Workflow rows, runs, and derivation.

| KPI | Definition | Source |
|---|---|---|
| **Workflow completeness** | % of `planned`+ Workflows with graph, recovery strategies, gates, triggers, completion conditions (target 100%) | fields + validation |
| **Binding coverage** | % with valid `taskRefs`+`planRef`+`goalRef`+`missionRef`, all consistent (target 100%) | ref resolution |
| **Orchestration success rate** | % of runs reaching `completed` vs `failed`+`cancelled` | terminal states |
| **First-pass success** | % of runs completing without any retry/rollback/compensation | recovery counts |
| **Retry rate** | Avg retries per run; % hitting strategy `maxAttempts` | retry strategy vs attempts |
| **Rollback rate** | % of runs invoking rollback; avg nodes unwound | rollback events |
| **Compensation rate** | % of runs invoking compensation | compensation events |
| **Recovery success** | % of failures that reached a consistent state via rollback/compensation (target 100%) | recovery outcomes |
| **Cycle time** | Median `started → completed`; vs `timeoutStrategy` | run timestamps |
| **Gate latency** | Median time an approval gate stays unresolved | gate events |
| **Concurrency utilization** | Avg concurrent nodes vs `concurrencyLimits` | run telemetry |
| **Health distribution** | % of in-flight runs `healthy` vs `degraded`/`blocked` | `workflowHealth` (in-flight only) |
| **Determinism conformance** | % of runs whose traversal matched the deterministic expectation for their inputs | run vs graph |
| **Drift rate** | Rate/severity of `WorkflowDriftDetected` | drift events |
| **Traceability completeness** | % of runs with an unbroken audit chain to Mission (target 100%) | audit chain |

These feed the Executive/Director/Department dashboards (Identity §10 pattern). All computed from Workflow's own records — no external inference.

---

## 12. Failure Scenarios

At least the following failure modes and the system's deterministic reaction. Governing rule: **Workflows fail closed and consistent** — on ambiguity or partial failure they refuse to advance, recover to a consistent state, and never leave a silent partial commit.

1. **Workflow with no Tasks.** Rejected — `taskRefs` mandatory and non-empty.
2. **Workflow bound to an unapproved/not-ready Plan or terminal/other-tenant Plan.** Cannot reach `released` — a Workflow releases only atop an approved, execution-ready Plan in the same tenant.
3. **Node references a Task outside `taskRefs` / a non-existent Task.** Rejected at graph validation.
4. **Cyclic execution graph.** Rejected — the graph must be a DAG.
5. **Missing recovery for a reversible node.** Rejected — recovery closure requires rollback or compensation for every reversible node.
6. **Non-deterministic construct (unbounded loop, unreconciled race).** Rejected at determinism validation.
7. **Workflow requires violating law/compliance/approved policy/permissions.** Hard stop — cannot approve/release; if arising later, run halts and a human resolves. Protective operations (Mission §7.8) continue regardless.
8. **Node fails, retry exhausted.** Per `retryStrategy` scope; on exhaustion the failure edge triggers rollback/compensation; if recovery succeeds → consistent state, run may `fail` cleanly; `WorkflowFailed` with `finalState`.
9. **Irreversible node fails (cannot roll back).** Compensation strategy runs forward; if compensation also fails → escalate + terminate to the most consistent audited state; never a silent partial commit.
10. **Rollback itself fails.** Escalation strategy fires; `WorkflowEscalated`; the run holds in a clearly-flagged inconsistent-pending state for human resolution — never auto-declared complete.
11. **Approval gate never resolved.** Workflow `paused`; health `blocked`; escalates; does not proceed past the gate.
12. **Approval gate rejected.** Follows the rejection edge (compensation/rollback → fail); the rejected path never executes downstream nodes.
13. **Timeout hit.** `timeoutStrategy.onTimeout` applies deterministically (`fail`/`retry`/`escalate`/`compensate`); no indefinite hang.
14. **Concurrency limit exceeded (attempted).** New parallel nodes queue within `concurrencyLimits`; the limit is never breached; saturation surfaces as `degraded` health.
15. **Dependency Workflow never completes.** Dependent Workflow stays `released`/`waiting` at that node; health `blocked`; escalates; not silently started.
16. **Task revised/superseded mid-run.** Affected nodes flagged; run re-validated against the new Task version; misaligned coordination halts and escalates rather than running stale.
17. **Plan/Goal/Mission changed under a running Workflow.** `WorkflowDriftDetected`; run halts and escalates; never continues against dead context.
18. **Attempt to edit a terminal/superseded/archived Workflow.** Refused — immutable.
19. **Attempt to reactivate a completed/archived Workflow.** Refused — re-running is a new run of a released version or a new Workflow.
20. **Concurrent revision (two successors).** One supersession wins the atomic flip; the second rebases; no forked lineage.
21. **Health value set on a non-in-flight Workflow.** Rejected, coerced to `unknown`.
22. **Attempt to move lifecycle because health changed.** Refused — `degraded`/`blocked` never transition lifecycle; only governed actions do.
23. **Terminal Workflow showing active health.** Structurally impossible — terminal states clear health to `unknown`, frozen.
24. **Workflow attempts to perform business logic / call a provider / call an LLM / dispatch directly.** Structurally impossible — no provider/LLM binding, no dispatch edge. Rejected as a layer violation.
25. **Workflow attempts to own or mutate business state.** Structurally impossible — no business-state field; the Workflow owns only orchestration state.
26. **Workflow tries to modify Mission/Goal/Plan/Task.** Refused — Workflows reference and consume; they never mutate upward.
27. **Non-`live` posture Workflow emits a live Command.** Refused — `executionConstraints` posture propagates to every Command; a non-`live` Workflow emits only simulate/dry-run Commands.
28. **Partial parallel-group failure.** The `join` node applies its declared reconciliation (fail-fast, best-effort, quorum); the group never silently half-completes.
29. **Pause/resume non-determinism.** Resume must continue from the exact paused node with preserved state; a resume that cannot deterministically continue fails to compensation rather than guessing.
30. **Audit/event write failure on a Workflow mutation or node step.** Transactional emission rolls back the step; no un-audited orchestration change commits — traceability unbroken.

---

## 13. Enterprise Use Cases

Behavior of Workflows in real enterprise situations. In every case Workflows coordinate and emit Commands; Execution performs; upstream is never mutated.

1. **Sequential go-live.** "DE storefront go-live" runs translate → QA → publish → notify in order; each node emits a Command; Execution performs.
2. **Parallel fan-out.** "Localize to DE, FR, NL" runs three localization subgraphs in parallel within concurrency limits, joined before a shared publish node.
3. **Conditional branch.** "If QA fails → rollback publish + notify owner; else → announce" — the branch is guarded by the observed QA result.
4. **Human-in-the-loop.** A "publish pricing change" Workflow pauses at a human approval gate; a director approves; traversal resumes deterministically.
5. **Multi-agent hand-off.** "Research → draft → edit → fact-check" hands off across four agents sequentially; each agent node maps to an agent Task.
6. **Multi-agent fan-in/voting.** Three pricing agents propose independently in parallel; a `join` node reconciles by a declared quorum rule.
7. **Multi-agent delegation.** A coordinator node delegates sub-tasks to specialist agent nodes and aggregates results.
8. **Event-driven order fulfillment.** "On order placed → reserve stock → charge → ship → confirm," each node advanced by domain events.
9. **Scheduled batch.** "Nightly reconciliation" starts on schedule, runs a parallel group of per-account nodes, completes on a rollup condition.
10. **Saga rollback.** A booking Workflow reserves hotel + flight + car; the car step fails; rollback unwinds flight then hotel in reverse order to a consistent state.
11. **Compensation for irreversible step.** An email campaign Workflow already sent batch 1 when batch 2 fails; the sent batch cannot be un-sent → compensation sends a correction to batch 1 recipients.
12. **Retry on transient provider error.** A node's Command fails transiently; `retryStrategy{scope:node}` retries 3× with backoff; succeeds on attempt 2 without re-running upstream nodes.
13. **Escalation on unrecoverable failure.** Rollback and compensation both fail; escalation pulls in a human owner; the run holds flagged, never auto-completed.
14. **Paused for compliance review.** A high-risk data-migration Workflow pauses at a compliance gate; without sign-off it never proceeds.
15. **Degraded but progressing.** A non-critical enrichment node keeps failing; health → `degraded`; the critical path continues; the Workflow completes with the enrichment compensated later.
16. **Blocked on dependency.** A "quarterly close" Workflow blocks on an upstream "data-lock" Workflow; health `blocked`; resumes when the dependency completes.
17. **Simulation posture.** A "bulk refund" Workflow carries `executionConstraints.posture=dry-run`; every emitted Command is simulate-only until promoted to `live` by a governed change.
18. **Workflow revision.** A better orchestration is designed; the owner revises → new `workflowVersion` supersedes; the old version's completed runs stay immutable; new runs use the successor.
19. **Sub-workflow composition.** A "product launch" Workflow composes sub-workflows (content, pricing, logistics, marketing), each independently owned, rolled up.
20. **Cross-department orchestration.** A Workflow coordinates Sales, Ops, and Legal Tasks across departments toward one Plan outcome.
21. **Hybrid strategy.** A Workflow mixes scheduled start, parallel processing, a human gate, and event-driven completion — `hybrid`.
22. **Concurrency-limited processing.** "Migrate 100k records" runs batches parallel but capped at `concurrencyLimits=10`; saturation shows as `degraded`, never a breach.
23. **Deterministic replay for audit.** An auditor replays a completed run's traversal from the immutable graph + inputs and gets the identical node ordering and Commands.
24. **Incident-response orchestration.** A `critical` protective Workflow (from an exempt Plan) runs containment → revoke access → notify, prioritized ahead of routine Workflows.
25. **Timeout-driven fallback.** A slow external-system node times out; `onTimeout=compensate` runs a fallback path; the Workflow still completes consistently.
26. **Multi-agent consensus with tie-break.** Parallel agent votes tie; the `join` node's declared tie-break (senior agent / human gate) resolves deterministically.
27. **Human hand-off to agent.** A human completes a review node, then an agent node takes over automatically — coordinated, not performed, by the Workflow.
28. **Ownership handoff.** The orchestration owner departs; `ownerRef` reassigned to an active in-tenant actor before archival.
29. **Drift caught mid-run.** Mission re-ratified; a running Workflow's `missionRef` no longer aligns; `WorkflowDriftDetected`; the run halts and escalates rather than completing against dead purpose.
30. **M&A orchestration reconciliation.** Merged companies keep Workflows per tenant; overlapping orchestrations are reconciled by superseding within each tenant, never shared across tenants.
31. **Pause-and-resume across a maintenance window.** A long Workflow pauses for a maintenance window and resumes deterministically from the exact paused node afterward.

---

## 14. Extensibility

How Workflows absorb future demands **without redesign**, because the core abstractions were chosen as extension points.

- **Richer graph semantics.** `executionGraph` can gain node/edge types (map-reduce, dynamic fan-out over a collection) without structural change — versioned graph structures.
- **Adaptive recovery.** Retry/rollback/compensation strategies can evolve from static to learned/policy-driven behind the same strategy contracts.
- **Predictive health.** `degraded` classification can move from thresholds to forecasting; states/events stay stable.
- **New execution strategies.** `workflowExecutionStrategyEnum` is an extension point; new coordination shapes add as enum values, not new modules.
- **Workflow templates / marketplace.** Standard orchestrations are draft `workflows` rows adopted per Plan; no new primitive.
- **Advanced multi-agent patterns.** New patterns (auction, blackboard, hierarchical teams) are graph compositions over agent nodes — no schema change.
- **Distributed orchestration.** Sub-workflows and concurrency limits already give the seam to distribute a Workflow across engines/regions as consumers, not a redesign.
- **Deterministic replay & simulation.** The immutable graph + inputs already enable replay; simulation is the `dry-run` posture, a first-class seam.
- **AI-designed orchestration.** Agents already author Workflows as first-class actors; author/owner/gate-approver split keeps AI-designed coordination safe by construction.

The invariant enabling all of the above: **coordination is a deterministic, versioned, immutable-in-lineage graph; binding to Tasks/Plan is explicit; recovery is closed by construction; the produce-Commands-only boundary isolates coordination from performance.** New demands plug into these seams without touching the layer boundaries.

---

## 15. Architectural Principles

The permanent design principles governing Workflows. If a future request conflicts with one of these, the request is wrong, not the principle.

1. **No Workflow without Tasks; every Workflow belongs to one Plan, Goal, and Mission.** The chain is mandatory and transitive. Orphaned orchestration is forbidden.
2. **Workflows coordinate; they never perform.** No business logic, no provider/LLM call, no direct dispatch, no business-state ownership. Workflows produce Commands; Execution performs them.
3. **Orchestration is deterministic.** Identical inputs and conditions yield identical traversal and identical Commands. Non-determinism is rejected.
4. **Recovery is closed by construction.** Every Workflow declares retry, timeout, rollback, compensation, and escalation; partial failure always resolves to a consistent, audited state — never a silent partial commit.
5. **Workflows consume Tasks and produce Commands.** That is the exact throughput; the layer boundaries above (Tasks) and below (Commands/Execution) are absolute.
6. **Workflows are subordinate.** Precedence is absolute: Law → Security/Compliance → Approved Policy → Mission → Goals → Plans → Tasks → Workflows → Commands → Execution. Workflows never override Task, Plan, Goal, Mission, or Policy; conflicts halt and require explicit human resolution.
7. **Versions and history are immutable; terminal states are final.** Completed/failed/cancelled/archived never reactivate; superseded stays immutable; every run and step is retained and fully traceable to Mission.
8. **Lifecycle and health are separate axes.** Lifecycle is governed existence; health is observed condition, in-flight only, automatic, and **never** changes lifecycle.
9. **Coordinate any performer.** Humans, agents (single and multi-agent), and external systems are all coordinated by the same graph, with approval gates for human-in-the-loop — none performed by the Workflow.
10. **Ownership is coordination-accountability, not doing.** One accountable owner for the orchestration; performers are the Tasks' assignees realized through Execution.

---

## 16. What Workflows will NEVER do

Explicit boundaries to prevent responsibility creep. If a future request asks Workflows to do any of these, the answer is: it belongs to another module.

- **Never execute business logic.** Workflows coordinate; Execution performs Commands.
- **Never call providers or LLMs, nor dispatch to providers directly.** A Workflow emits a Command; Execution dispatches it.
- **Never own business state or business intent.** Orchestration state only; intent lives in Mission/Goal/Plan/Task.
- **Never modify Mission, Goal, Plan, or Task.** Workflows reference and consume; they never mutate upward.
- **Never override Law, Security/Compliance, Approved Policy, Mission, Goal, Plan, or Task.** Subordinate to the whole authority stack; conflicts halt and escalate to a human.
- **Never exist without Tasks, a Plan/Goal/Mission binding, an execution graph, completion conditions, or recovery strategies.** All are structural requirements.
- **Never run non-deterministically or leave a silent partial commit.** Determinism and recovery closure are absolute.
- **Never run while unapproved, un-released, or atop an unapproved/not-ready Plan.** The specification + approval + release boundary is absolute.
- **Never mutate a terminal/superseded version, nor reactivate a completed/archived Workflow.** Versions and history are immutable; re-running is a new run or a new Workflow.
- **Never let health change lifecycle, and never mutate without an actor and an audit record.** Full traceability is non-negotiable.

---

*End of Workflow Specification v1.0. This document specifies the Workflow module — the deterministic orchestration layer that consumes Tasks, coordinates humans/agents/systems, and produces executable Commands — in full and defines its permanent boundaries. No implementation code. No SQL. No TypeScript. No other specification modified.*
