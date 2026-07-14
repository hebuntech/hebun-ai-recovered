# Plan Specification v1.0

> Stage 4 — Plan module, complete Enterprise Architecture Specification.
> This document is the permanent architectural reference for Plans in Hebun AI.
> It specifies the third layer of the cognitive hierarchy, beneath Goals and above Tasks. It adds no implementation. It defines boundaries.

**Status:** Definitive · **Scope:** Plan module only · **Grounded in:** the schema primitives in `src/db/schema/_base.ts` (`rootColumns`, `tenantColumns`) and `_enums.ts` (`lifecycleStatusEnum`, `approvalStateEnum`, `roleTypeEnum`, `permissionScopeEnum`), the Identity Specification v1.0 (doc 34), the Mission Specification v1.0 (doc 35), and the Goal Specification v1.0 (doc 36).

**Position in the cognitive hierarchy:**

```
Mission            ← the North Star of intent (doc 35)
  → Goals          ← measurable desired outcomes (doc 36)
    → Plans        ← this document — strategy that decomposes a Goal into executable intent
      → Milestones   — checkpoints along a Plan
        → Work Packages — the unit the Task layer consumes
          → Tasks        — decompose work packages into units of work
            → Workflows    — orchestrate Tasks into executable Commands
              → Execution    — the ONLY layer that dispatches Commands to providers/LLMs
```

**Authority precedence (unchanged, absolute):**

```
Law and Regulation
  → Security and Compliance Policy
    → Approved Company Policy
      → Mission
        → Goals
          → Plans          ← subordinate to everything above; never overrides Goals, Mission, or Policy
            → Tasks
              → Workflows
                → Execution
```

Plans are the **strategy layer**. A Goal says *what measurable outcome*; a Plan says *how we intend to reach it* — the approach, the milestones, the resources, the budget, the risks, the readiness — and then decomposes that intent into work the Task layer can pick up. A Plan describes strategy; **it never executes it.**

---

## 1. Purpose

### Why the Plan layer exists

Goals (doc 36) declare measurable desired outcomes. But an outcome is not a route. "Reach €5M DTC revenue by 2026-12-31" states the destination; it says nothing about *how* — through which markets, with what budget, on what milestones, under which risks and assumptions, needing which capabilities. Something must translate a measurable Goal into a concrete, reviewable, resourced strategy before any work is created. Plans are that layer.

Plans are the **system of record for every strategy a company commits to in pursuit of a Goal.** A Plan converts an outcome into an executable *intent*: a declared approach, milestones, work packages, dependencies, a budget, resource and capability requirements, approval gates, and an explicit execution-readiness verdict. The Plan is where a Goal becomes actionable — without yet becoming an action.

Without a Plan layer, the platform would jump from a measurable outcome straight to Tasks, and four things would break: strategy would be implicit (no reviewable approach to approve or challenge), resourcing would be invisible (no budget/capability gate before work starts), risk would be undeclared (no place to state what could go wrong), and execution would begin against unapproved intent (no readiness gate). Plans close that gap and hold the **approval boundary** that Execution depends on: *Execution consumes approved Plans only.*

### Business problem it solves

1. **Strategy made explicit and reviewable.** How a company pursues an outcome must be visible, challengeable, and approvable *before* resources are spent. Plans force the approach into a reviewable object with milestones, risks, and assumptions — not tribal knowledge in an operator's head.
2. **Resourcing and budget discipline.** No work should start without knowing what it needs and what it may cost. Plans declare required capabilities, required resources, and budget constraints, and gate activation on them.
3. **Execution readiness as a boundary.** Execution must never run against half-baked or unapproved intent. Plans compute an explicit execution-readiness verdict and hold the invariant that only *approved* Plans may be decomposed into Tasks and run.

### Its responsibility

- Own the lifecycle of every strategy: `draft → proposed → approved → active → completed → superseded → archived` (governed), separate from health `unknown → on-track / at-risk / blocked` (observed).
- Guarantee every Plan belongs to exactly one Goal (and transitively one Mission), is owned, measurable, reviewable, and carries explicit success criteria.
- Own the Plan's internal decomposition into **milestones** and **work packages**, plus declared **dependencies, assumptions, risks, required capabilities, required resources, budget, estimated duration, approval gates, and execution readiness**.
- **Produce Tasks, never Actions.** A Plan hands work packages to the Task layer; it never runs a Task, never dispatches a Command, never touches a provider or LLM.
- Emit Plan events so Governance, the Task layer, and dashboards react to strategy status, readiness, and drift.
- Preserve an immutable, versioned audit trail of every Plan, every version, and every state change.

### What is explicitly NOT its responsibility

- **Plans never execute work.** No command dispatch, no provider call, no LLM call, no Task run, no Workflow run. A Plan is intent, not action.
- **Plans never own runtime state.** Execution state (running/succeeded/failed, retries, live provider status) belongs to Tasks, Workflows, and Execution — never to the Plan. A Plan is a durable strategy object, not a live process.
- **Plans never schedule or orchestrate execution.** Sequencing of running work belongs to Workflows. A Plan declares milestones and dependencies as *intent*; it does not drive a scheduler.
- **Plans never set Goals or Mission.** A Plan references a Goal (and its Mission) and is bounded by them; it cannot create, amend, or reinterpret an outcome or a purpose.
- **Plans never override Goals, Mission, or Policy.** A Plan is subordinate to the whole authority stack; it may only propose approaches those layers permit.

---

## 2. Mental Model

If Mission is the **North Star** and Goals are the **waypoints**, a Plan is the **route chosen between two waypoints** — the declared way of getting there, with its stages, its fuel budget, its known hazards, and a go/no-go check before departure. Many routes can reach the same waypoint; a Goal may own several Plans. The chosen route is reviewed and approved before anyone sets sail — but the Plan is the *map and the flight plan*, never the sailing itself.

The mental model in one line: **A Plan is a versioned, owned, reviewable strategy that decomposes exactly one Goal into executable intent — approach, milestones, work packages, resources, budget, risks, and a readiness verdict — and hands that intent to the Task layer, without ever performing, scheduling, or dispatching the work.**

Six properties define the model:

- **Goal-bound.** Every Plan belongs to exactly one Goal (and transitively one Mission version). A Plan with no Goal is orphaned strategy the company never tied to an outcome. A Goal may own **many** Plans — competing or complementary routes to the same outcome.
- **Strategic, not executional.** A Plan describes *how we intend to act*, not the acting. It holds no runtime state, dispatches nothing, calls nothing. The moment something *runs*, it is below the Plan (Task/Workflow/Execution).
- **Versioned and immutable-in-lineage.** A Plan evolves by producing a new version that supersedes the prior; superseded versions are frozen forever. Execution always binds to a specific, approved Plan version.
- **Measurable and reviewable.** A Plan declares explicit success criteria and a review cadence. Strategy you cannot measure or review is not a Plan.
- **Resourced and gated.** A Plan declares required capabilities, resources, and budget, and carries approval gates and an execution-readiness verdict. It cannot be run until it is approved and ready.
- **Bounded, not sovereign.** A Plan is subordinate to its Goal, to Mission, to Approved Policy, to Security/Compliance, and to Law. It proposes approaches only within the space those layers permit; it never widens that space.

Plans sit **beneath Goals in authority and above Tasks in production.** A Goal hands a Plan a measurable outcome to reach; the Plan hands the Task layer work packages to realize. Plans are the hinge between *what outcome* (Goal) and *what work* (Tasks) — and they are exclusively about *what strategy*, never *what runs*.

---

## 3. Core Domain Objects

Plans introduce one primary entity and a set of supporting objects. All reuse the existing column contracts from `_base.ts`:

- **`rootColumns`**: `id`, `createdAt`, `createdBy`, `updatedAt`, `updatedBy`, `version`, `lifecycleStatus` (`active | archived | deleted`), `deletedAt`.
- **`tenantColumns`** = `rootColumns` + `tenantId` (FK → `companies.id`, NOT NULL).

`createdBy` / `updatedBy` / `ownerRef` resolve to an **actor reference** per Identity §3.9 (`{actorType, actorId}`, `actorType ∈ {human, agent, system, service}`). No Plan mutates without a resolved actor.

---

### 3.1 Plan

- **Purpose.** A versioned, owned strategy that decomposes one Goal into executable intent. The primary object of this module.
- **Table.** `plans` (`tenantColumns`).
- **Conceptual fields** (the full anatomy every Plan carries):
  - `id` — Plan ID.
  - `tenantId` — owning company (Identity §3.1).
  - `goalRef` — `{goalId, goalVersion}` — the Goal this Plan serves. Required.
  - `missionRef` — `{missionId, missionVersion}` — the Mission version the Goal derives from, carried for direct alignment checks. Required.
  - `parentPlanId` — nullable FK → `plans.id`; a parent Plan for nested strategy (null for a top-level Plan under a Goal).
  - `ownerRef` — the accountable actor (human | department-scoped | agent-under-human).
  - `scope` — `planScopeEnum`: `strategic | department | team | operational` (mirrors Goal scope; a Plan's altitude typically matches its Goal's).
  - `priority` — `planPriorityEnum`: `critical | high | medium | low`.
  - `planLifecycleStatus` — the governed lifecycle position (`planLifecycleStatusEnum`, §6): `draft | proposed | approved | active | completed | superseded | archived`.
  - `planHealth` — the current health signal (`planHealthEnum`, §6): `unknown | on-track | at-risk | blocked`. Applies only to `approved`/`active` Plans; auto-derived; never triggers a lifecycle change.
  - `approvalState` — reuses `approvalStateEnum` for the approval gates.
  - `strategy` — the declared approach/narrative: *how* this Plan intends to reach the Goal.
  - `successCriteria` — an explicit predicate defining Plan completion (distinct from Goal success; a Plan may complete without the Goal being achieved, and vice versa).
  - `milestones` — ordered checkpoints (§3.2).
  - `workPackages` — the units of intent the Task layer consumes (§3.3).
  - `dependencies` — explicit prerequisites (other Plans/Goals/external conditions).
  - `assumptions` — declared assumptions the strategy rests on.
  - `risks` — declared risks to the strategy.
  - `requiredCapabilities` — capabilities the Plan needs (skills, agent types, integrations).
  - `requiredResources` — resources the Plan needs (people, agents, compute, data, tools).
  - `budget` — budget constraints (cost ceiling, currency, allocation).
  - `estimatedDuration` — expected time to complete.
  - `reviewCycle` — mandatory review cadence. Required.
  - `approvalGates` — the ordered gates that must clear before activation/execution (§3.4).
  - `executionReadiness` — the explicit readiness verdict (§3.5).
  - `planVersion` — the Plan's own immutable version counter (distinct from row `version`).
  - `supersedesPlanId` — nullable FK → prior Plan version this supersedes.
  - base lifecycle/audit fields (audit metadata).
- **Required.** `tenantId`, `goalRef`, `missionRef`, `ownerRef`, `scope`, `strategy`, `successCriteria`, `reviewCycle`, `approvalGates`, `planLifecycleStatus`. (`planHealth` defaults `unknown`; set only while `approved`/`active`.)
- **Optional.** `parentPlanId`, `dependencies`, `assumptions`, `risks`, `budget` (may be zero-budget), `estimatedDuration`.
- **Ownership.** Owned by exactly one company; accountable to exactly one owner; bound to exactly one Goal.
- **Example.** Goal *"€5M DTC revenue by 2026-12-31"* → Plan *"EU direct channel launch"*: strategy "stand up localized webstores in DE/FR/NL, paid + influencer acquisition," milestones (storefront live, first €500k, break-even CAC), budget €400k, required capabilities (localization, payments, ads agent), `goalRef {g1, v3}`.

### 3.2 Milestone

- **Purpose.** A named checkpoint along a Plan marking meaningful progress toward the Plan's success criteria. Makes strategy progress measurable without touching execution.
- **Realization.** Ordered structured entries within `milestones`, each `{id, name, targetDate, completionCriteria, status}` where `status ∈ {pending, reached, missed}`. A milestone is *observed* reached from work-package/task completion signals; the milestone itself runs nothing.
- **Example.** Milestone "DE storefront live by 2026-03-01," completion "checkout reachable + first order placed."

### 3.3 Work Package

- **Purpose.** The unit of executable intent a Plan hands to the Task layer. The boundary object between strategy (Plan) and work (Tasks). A work package describes *what work is needed*; the Task layer decides *the tasks* that realize it.
- **Realization.** Structured entries within `workPackages`, each `{id, name, intent, requiredCapabilities, dependencies, milestoneRef, acceptanceCriteria}`. A work package is **consumed** by the Task layer to produce Tasks; the Plan neither creates nor runs those Tasks.
- **Rule.** Work packages are declarative intent only — no runtime fields, no dispatch, no provider binding. Their acceptance criteria let the Plan *observe* completion; they never *perform* it.
- **Example.** Work package "Localize storefront to German," capabilities (localization, CMS), acceptance "all pages + checkout in de-DE, QA-passed."

### 3.4 Approval Gate

- **Purpose.** An ordered checkpoint that must clear before a Plan advances (typically to `approved`, and before Execution may consume it). Encodes "who must sign off on this strategy, and on what."
- **Realization.** Ordered structured entries within `approvalGates`, each `{id, name, requiredAuthority, approvalState}` (reusing `approvalStateEnum`). Gates may include strategy sign-off, budget sign-off, risk/compliance sign-off. Governance evaluates authority; the Plan records the gate state.
- **Rule.** A Plan is not `approved` until all mandatory gates are `approved`. **Execution consumes approved Plans only** — an unapproved or gate-pending Plan is never decomposed into runnable Tasks.

### 3.5 Execution Readiness

- **Purpose.** The explicit, computed verdict of whether a Plan is ready to be decomposed and run: approved, resourced, budgeted, dependency-clear, and risk-accepted. The final boundary before work begins.
- **Realization.** A derived structure `{ready: boolean, blockers: [...], checkedAt}` over: all approval gates cleared; required capabilities/resources available; budget allocated; dependencies satisfied; no unresolved authority-stack conflict. A Plan may be `active` in lifecycle yet not execution-ready (e.g. awaiting a resource) — readiness gates *decomposition into runnable work*, not lifecycle.
- **Rule.** The Task layer/Execution may only consume a Plan whose `executionReadiness.ready = true`. Readiness is re-evaluated on relevant changes and never assumed.

### 3.6 Plan Version (immutable lineage record)

- **Purpose.** The permanent record of a Plan's strategy revisions and supersessions. Answers "how did this strategy change, and what replaced it — and which version did we execute against."
- **Realization.** A superseded Plan is retained immutably; its successor carries `supersedesPlanId` and an incremented `planVersion`. Execution binds to a specific approved `planVersion`; changing strategy produces a new version, never an in-place edit. **Plan versions are immutable.**

---

## 4. Ownership

- **Owned by Company.** Every Plan belongs to exactly one company via `tenantId`. No global plans.
- **Bound to one Goal.** Every Plan carries exactly one `goalRef`. **No Plan without a Goal; no Goal without a Mission** — the chain `Plan → Goal → Mission` is mandatory and transitive.
- **Accountable to one owner.** Every Plan carries exactly one `ownerRef` — the single accountable actor:
  - a **human** accountable for the strategy,
  - a **department/team** (accountability held by its director), or
  - an **agent**, always **bounded by its owning human** (Identity §3.8): an agent may own a Plan only within its human owner's authority and only for strategies the Goal/Mission/Policy stack permit.
- **Ownership vs authorship.** Anyone authorized may author/propose a Plan; `ownerRef` is who is accountable for it. A Goal owner and a Plan owner may differ (a director owns the Goal; a strategist owns one of its Plans).
- **Multiple Plans per Goal.** A Goal may own several Plans (alternative strategies, phased strategies, or contingency plans). Each Plan is independently owned, versioned, and approved. At most one Plan per Goal is typically `active` at a time, but the model permits parallel active Plans where the Goal's decomposition warrants it (governed).
- **Ownership transfer.** On owner departure/reassignment (Identity §11), `ownerRef` is re-pointed to an active in-tenant actor before the prior owner is archived. A Plan is never orphaned.
- **No cross-tenant plans.** A Plan never spans companies; cross-company strategy in a holding is separate Plans per tenant.

---

## 5. Plan Hierarchy

Plans form a decomposition rooted in a Goal (and transitively a Mission). Two orthogonal structures: the **scope hierarchy** (organizational altitude) and the **decomposition hierarchy** (Plan → Milestones → Work Packages).

### 5.1 Cognitive-chain position

```
Mission (doc 35)
  → Goal (doc 36)
    → Plan            (this document)
      → Milestones      — checkpoints along the Plan
        → Work Packages   — units of intent handed to the Task layer
          → Tasks           — (Task Specification) decompose work packages
            → Workflows       — orchestrate Tasks into Commands
              → Execution       — dispatches Commands (the ONLY dispatcher)
```

- **A Plan belongs to exactly one Goal**; a Goal may own many Plans.
- **A Plan decomposes into Milestones and Work Packages** — its internal strategy structure.
- **Work Packages are the bottom edge of the Plan module.** Below them the chain leaves Plans entirely: `Work Package → Tasks → Workflows → Execution`. Plans never reach past their work packages into Tasks or runtime.

### 5.2 Scope hierarchy

```
Strategic Plan      (scope=strategic)    — company-level strategy for a strategic Goal
  Department Plan   (scope=department)    — a department's strategy for a department Goal
    Team Plan       (scope=team)          — a team's strategy for a team Goal
      Operational Plan (scope=operational)— a concrete near-term strategy for an operational Goal
```

- A Plan's scope typically matches its Goal's scope; it may be narrower where a Goal is decomposed into several scoped Plans.
- Every Plan at every scope carries its own `goalRef` and `missionRef`; alignment is checked at each level.

### 5.3 Nested Plans

- A Plan may have a `parentPlanId`, forming an acyclic tree of nested strategy (a program Plan with sub-Plans), all under the same Goal or a Goal and its child Goals.
- Nested Plans must align with their parent Plan, their Goal, and Mission; contradiction is rejected at validation.
- Progress/health may roll up from child Plans to parent; accountability stays per-Plan.

### 5.4 The production boundary (why Plans stop at work packages)

- **Plans produce Tasks** — by handing work packages to the Task layer, which decomposes them.
- **Tasks produce Workflows** — the Task layer composes tasks into orchestrations.
- **Workflows produce executable Commands.**
- **Commands are dispatched only by the Execution layer.**

This separation keeps strategy (durable, versioned, approved) cleanly divided from runtime (transient, orchestrated, provider-bound). A Plan owning a Task, holding runtime state, or dispatching a Command collapses the boundary and is an architectural defect.

---

## 6. Lifecycle

A Plan carries **two orthogonal state dimensions** (mirroring the Goal model, doc 36 §6) that must never be conflated:

- **Lifecycle** (`planLifecycleStatusEnum`) — *where the Plan is in its governed existence.* Changes only via governance-ruled transitions.
- **Health** (`planHealthEnum`) — *how well an in-flight Plan is doing.* Auto-derived from signals; never a lifecycle transition.

Governing rule: **a Plan is Goal-bound, owned, measurable, resourced, gated, and ready before Execution may consume it; lifecycle changes are governed; health merely observes; history and versions are immutable.**

### 6.1 Lifecycle dimension

**`planLifecycleStatusEnum`** (specified): `draft | proposed | approved | active | completed | superseded | archived`.

| Lifecycle state | Meaning | Mutable? | Carries health? | Execution-consumable? |
|---|---|---|---|---|
| **draft** | Being authored; incomplete allowed | Yes (full edit) | No | No |
| **proposed** | Submitted for approval gates; frozen for review | No | No | No |
| **approved** | All mandatory gates cleared; strategy committed | Limited | **Yes** | Yes (if execution-ready) |
| **active** | In pursuit; work packages being realized below | Progress/readiness only | **Yes** | Yes (if execution-ready) |
| **completed** | Plan success criteria satisfied | No (terminal-positive) | No (health cleared) | No |
| **superseded** | Replaced by a new Plan version | No (immutable) | No | No |
| **archived** | Retired (abandoned/obsolete); terminal | No (immutable) | No | No |

**Lifecycle transitions (governance-ruled):**

| Transition | From → To | Precondition (governance rule) | Effect | Emits |
|---|---|---|---|---|
| **Draft** | ∅ → draft | Authoring actor resolved | Row created, `planLifecycleStatus=draft`, `planHealth=unknown` | `PlanDrafted` |
| **Propose** | draft → proposed | Passes measurability + ownership + resourcing + alignment validation (§8) | `planLifecycleStatus=proposed`, gates → `pending`; content frozen | `PlanProposed` |
| **Approve** | proposed → approved | All mandatory approval gates `approved` by authorized approvers | `planLifecycleStatus=approved`; `planHealth` begins tracking (`unknown`) | `PlanApproved` |
| **Reject** | proposed → draft \| archived | A gate rejects | Back to draft, or archived if abandoned | `PlanRejected` |
| **Activate** | approved → active | Owner confirms; `executionReadiness.ready=true` recommended (readiness gates work dispatch, not activation) | `planLifecycleStatus=active`, baseline captured | `PlanActivated` |
| **Complete** | active → completed | Plan success criteria satisfied and verified | `planLifecycleStatus=completed` (terminal); health cleared to `unknown`, frozen | `PlanCompleted` |
| **Supersede** | draft/proposed/approved/active → superseded | A new Plan version is approved | `planLifecycleStatus=superseded`, immutable; `supersedesPlanId` set on successor; health frozen | `PlanSuperseded` |
| **Archive** | draft/proposed/approved/active → archived | Abandoned/obsolete; governed retirement | `lifecycleStatus=archived`, `planLifecycleStatus=archived` (terminal, no reactivation); health frozen | `PlanArchived` |
| **Version (revise)** | approved/active → superseded (+ new successor) | Material change to strategy/milestones/budget | New `planVersion` via supersession; prior retained immutable | `PlanRevised` |

Every lifecycle transition is gated by a governance rule and produces an audited event. **Health never appears in this table** — no health value causes any lifecycle transition.

### 6.2 Health dimension

**`planHealthEnum`** (specified): `unknown | on-track | at-risk | blocked`.

| Health state | Meaning | Set how |
|---|---|---|
| **unknown** | No sufficient signal yet (default; also the value for terminal Plans) | default / on clear |
| **on-track** | Milestones/work-package progress trending to meet success criteria on time and on budget | auto |
| **at-risk** | Progress/budget/risk/review trending to miss | auto |
| **blocked** | Cannot progress (unresolved dependency, gate, resource, or decision) | auto |

**Health rules:**

- **Scope.** Health applies **only** to `approved` or `active` Plans. In `draft`/`proposed` it is `unknown` and inert; in `completed`/`superseded`/`archived` it is cleared to `unknown` and frozen — **terminal Plans carry no active health.** A **Completed Plan has Health = Unknown.**
- **Automatic.** Health is derived automatically from **milestone status, work-package/task-completion signals, budget burn, materialized risks, dependency states, and review state.** It is never set as a manual lifecycle act.
- **No lifecycle effect.** **Health never changes lifecycle; lifecycle never derives from health.** A Plan going `at-risk` or `blocked` stays lifecycle-`active` — **Plans may be Active while At-Risk.** Only governance-ruled transitions move lifecycle.
- **Observability, not authority.** Health drives alerts, KPIs, and Governance signals; humans/agents may *then* choose a governed action (revise, archive, re-resource). The signal never mutates lifecycle on its own.

### 6.3 Terminal-state rules

- **Completed** and **archived** are terminal lifecycle states. **Archived Plans never reactivate** — reviving a strategy is a *new* Plan, not a resurrection.
- **Superseded** Plans are **immutable** and permanent — retained as lineage, never edited, never reactivated. **Plan versions are immutable.**
- Terminal Plans hold `planHealth = unknown` (cleared, frozen).
- **Plan history is immutable.** Every lifecycle transition, health change, version, and readiness verdict is retained append-only. No Plan history is ever deleted (except under the legal-erasure exception governing Identity, §13 there).

---

## 7. Constraints

Structural and semantic constraints, enforced by the schema and the module — not by convention.

**Structural (schema-enforced):**

1. **Goal reference mandatory.** `goalRef` NOT NULL on every Plan. **No Plan without a Goal.** A Plan whose `goalRef` cannot resolve is rejected. `missionRef` is likewise mandatory and must match the Goal's Mission.
2. **Owner mandatory.** `ownerRef` NOT NULL — every Plan has one accountable owner.
3. **Measurability & review mandatory.** `successCriteria` present; `reviewCycle` NOT NULL. A Plan missing either cannot leave `draft`.
4. **Approval gates mandatory.** `approvalGates` present and non-empty; a Plan cannot reach `approved` until all mandatory gates are `approved`.
5. **Execution-readiness mandatory before dispatch.** No work package is consumed by the Task layer unless `executionReadiness.ready = true` **and** `planLifecycleStatus ∈ {approved, active}`. **Execution consumes approved Plans only.**
6. **Tenant isolation.** `tenantId` NOT NULL, FK → `companies.id`. Cross-tenant leakage structurally impossible.
7. **Acyclic hierarchy.** `parentPlanId ≠ id`; nested-Plan tree and dependency graph both acyclic (checked at write time).
8. **Terminal immutability.** Rows in `completed | superseded | archived` reject content mutation. **Archived never reactivates; superseded stays immutable; versions are immutable.**
9. **Version monotonicity.** `planVersion` strictly increases along a `supersedesPlanId` chain; no self-supersession.

**Semantic (module-enforced):**

10. **Subordinate to the authority stack.** A Plan — and every Task/Workflow/Execution derived from it — may never override **Law, Security/Compliance Policy, Approved Company Policy, Mission, or the Goal.** Precedence is fixed (header). A Plan requiring a violation cannot be approved; a conflict arising later blocks execution and escalates for explicit human resolution (mirrors Mission §7, Goal §7).
11. **Alignment continuously validated.** A Plan's `goalRef`/`missionRef` is re-checked on Goal redefinition/supersession and on Mission ratification/supersession, and on review. Misalignment raises `PlanDriftDetected` to Governance.
12. **Nested Plans align with parent, Goal, and Mission.** Contradiction is rejected at validation.
13. **Lifecycle and health are orthogonal.** `planLifecycleStatus` and `planHealth` are separate fields with separate rules. A health change never writes lifecycle; a lifecycle transition is never *triggered* by a health value (it may *read* health as input).
14. **Health is scoped and derived.** `planHealth ∈ {on-track, at-risk, blocked}` only while `planLifecycleStatus ∈ {approved, active}`; otherwise forced to `unknown`. Computed from milestones, work-package signals, budget, risks, dependencies, review — never manual.
15. **Plans never execute, dispatch, schedule, hold runtime state, or call providers/LLMs.** Structurally, `plans` has no runtime-state field, no command/dispatch edge, no provider/LLM binding, no scheduler. Realization is exclusively via work packages consumed by the Task layer.

---

## 8. Validation

Validation runs at three gates: **draft → proposed** (submission), **proposed → approved** (approval gates), and **continuous** (standing re-validation while approved/active). Plans fail closed: on any ambiguity the Plan does not advance and no unready strategy is executed.

**Goal-binding & alignment validation (at submission and continuously):**

- `goalRef` resolves to a non-terminal Goal in the same tenant; `missionRef` matches that Goal's Mission version.
- The Plan's strategy does not contradict the Goal's success criteria, any Mission principle, or a parent Plan (if nested).
- **Standing re-check:** on Goal redefinition/supersession or Mission ratification/supersession, active Plans are re-validated; new misalignment flags the Plan and raises `PlanDriftDetected`.

**Measurability & review validation (at submission):**

- Explicit `successCriteria` predicate present and evaluable.
- `reviewCycle` present and resolvable.
- At least one milestone with completion criteria; work packages (if present) carry acceptance criteria.

**Ownership validation (at submission):**

- `ownerRef` resolves to a live, in-tenant actor. If an agent, its human owner holds the required authority (agent ceiling, Identity §6).

**Resourcing & budget validation (at submission and at readiness):**

- Required capabilities and resources are declared and resolvable; budget constraints are well-formed (ceiling, currency).
- At readiness evaluation, declared resources/capabilities are *available* and budget is *allocated*; otherwise `executionReadiness.ready=false` with blockers listed.

**Structural validation (at submission):**

- No cycle in nested-Plan tree or dependency graph; dependencies resolve to real, in-tenant Plans/Goals/conditions.

**Authority-stack validation (at submission and re-checked at approval):**

- The Plan's strategy is checked against Law/Regulation markers, Security/Compliance policy, and Approved Company Policy. A Plan requiring a violation **cannot be approved**; the conflict is recorded and routed for **explicit human resolution**. Plans never self-resolve in their own favor.

**Approval-gate validation (at approval):**

- Each mandatory gate's approver satisfies its `requiredAuthority` (Governance-computed from Identity `roleTypeEnum`).
- **Separation of duties:** where a gate requires independence, the sole author/proposer may not be the sole approver (reuses `approvalStateEnum`).

**Execution-readiness validation (before any dispatch):**

- All mandatory approval gates cleared; resources/capabilities available; budget allocated; dependencies satisfied; no unresolved authority-stack conflict → `ready=true`. Otherwise `ready=false` with explicit blockers. **The Task layer/Execution may consume the Plan only when `ready=true`.**

**Health validation (continuous):**

- `planHealth` may be non-`unknown` only when `planLifecycleStatus ∈ {approved, active}`; any other case is coerced to `unknown`.
- A health update carries no lifecycle change; a write attempting to move lifecycle "because health changed" is refused.
- Health inputs must resolve; a recompute with unresolved inputs yields `unknown`, never a stale positive.

Only a Plan passing all applicable gates advances. A failure returns it to `draft` with the violated rule recorded; it never partially activates and its unready intent is never executed.

---

## 9. Relationships

Plans point *up* at Goals, Mission, and the authority stack; *sideways* at other Plans; and *down* at Tasks (via work packages). Plans never point at Workflows, Execution, providers, or LLMs.

| Module | Relationship to Plans |
|---|---|
| **Law & Regulation** | Absolute ceiling. A Plan may propose only strategies law permits; a Plan requiring illegality cannot be approved. |
| **Security & Compliance Policy** | Ranks above Plans (and Mission). A Plan conflicting with security/compliance policy is blocked and escalated for human resolution. |
| **Approved Company Policy** | Ranks above Plans. Where an approved policy and a Plan conflict, the policy prevails, execution blocks, a human resolves it. Plans never silently override approved policy. |
| **Mission** | The apex intent. Every Plan carries `missionRef` and is continuously validated against the active Mission. A Plan never sets, amends, or overrides Mission. |
| **Goals** | **The parent and binding source.** Every Plan belongs to exactly one Goal (`goalRef`), decomposing that Goal's outcome into strategy. A Goal may own many Plans (Goal §9 states Goals "produce Plans, never Actions"). Plans supply the *how*; Goals supply the *what outcome*. A Plan never redefines or overrides its Goal. |
| **Company / Organization / Departments** | A Plan is tenant-owned (Identity §3.1) and scoped to a container; department Plans localize department Goals. Directors are typical Plan owners within their scope. |
| **Agents** | An Agent (Identity §3.8) may **own, author, or drive** a Plan, bounded by its human owner's authority and the Goal/Mission/Policy stack. An agent may propose Plans and drive their work packages *through the Task layer* — it never executes the Plan directly and never dispatches Commands from the Plan. |
| **Decisions** | Decisions choose *between Plans* (which strategy to pursue), approve gate sign-offs, and resolve at-risk/blocked conditions. The Reasoning/Decision layer computes the choice using Plans as inputs; a Plan does not itself decide. |
| **Policies** | Policy constrains the *means* a Plan may employ and ranks above the Plan. A Plan cites policy as a constraint input; it never overrides it. |
| **Tasks** | **The downstream production edge.** A Plan **produces Tasks** by handing work packages to the Task layer, which decomposes them into Tasks. The Plan declares *what work is needed and its acceptance criteria*; the Task layer decides *the tasks*. Plans never own, run, or hold state for Tasks. |
| **Workflows** | **No direct relationship.** Workflows orchestrate Tasks; they are two layers below the Plan. A Plan never orchestrates or references a live Workflow. |
| **Execution** | **No direct relationship, one hard invariant:** Execution **consumes approved, execution-ready Plans only** — indirectly, through the Tasks/Workflows derived from a Plan's work packages. Plans never dispatch Commands; Execution is the sole dispatcher. |
| **Governance** | Evaluates approval-gate authority, authority-stack conformance, readiness sign-off, and **drift enforcement**. Plan drift, budget breaches, and alignment violations route to Governance for block/escalate/human-resolution. |
| **Identity** | Supplies every actor reference (author, owner, gate approver) and scope target. Identity draws the boundary; Plans fill it with strategy. |

**The strategy spine:** `Mission → Goal → Plan → (Work Packages) → Tasks → Workflows → Execution`. Plans are the node that turns a measurable outcome into resourced, gated, ready strategy — and stop exactly at the work-package edge.

---

## 10. Events

Every Plan mutation emits exactly one domain event. Events are the module's public reaction surface — Governance, the Task layer, and dashboards subscribe; they never read Plan tables directly. Payloads carry `actorRef`, `tenantId`, `planId`, `planVersion`, `goalRef`, `missionRef`, `scope`, and `occurredAt`.

| Event | Trigger | Payload (beyond envelope) | Consumers | Business impact |
|---|---|---|---|---|
| `PlanDrafted` | New Plan draft created | scope, goalRef, parentPlanId? | Dashboard, Governance | Candidate strategy exists; not binding |
| `PlanProposed` | Draft submitted to approval gates | proposedBy, gates | Governance, Notifications | Approval workflow begins |
| `PlanApproved` | All mandatory gates cleared | approverRefs, gates | **Task layer**, Governance, Dashboard | Strategy committed; may activate/execute when ready |
| `PlanRejected` | A gate rejects | reason, gateId, approverRef | Dashboard, Notifications | No committed strategy |
| `PlanActivated` | Approved → active | baseline, readinessSnapshot | Task layer, Governance, Dashboard | Pursuit begins; work packages may be consumed if ready |
| `PlanReadinessChanged` | Execution-readiness recomputed | ready, blockers | **Task layer**, Governance | Gate for work dispatch flips; readiness is the execution boundary |
| `PlanMilestoneReached` / `PlanMilestoneMissed` | Milestone status change | milestoneId, targetDate | Dashboard, Governance | Strategy progress observed |
| `PlanHealthChanged` | Health recomputed (approved/active only) | fromHealth, toHealth, driverInputs | Dashboard, Governance | Health signal moved; **no lifecycle change** |
| `PlanOnTrack` / `PlanAtRisk` / `PlanBlocked` | Health specializations | trend / gap / blockingRef | Governance, Notifications | Alerts; **lifecycle unchanged** (Active-while-At-Risk allowed) |
| `PlanBudgetBreached` | Budget burn exceeds constraint | spent, ceiling | Governance (high severity), Finance, Notifications | Overspend surfaced; strategy re-evaluated |
| `PlanCompleted` | Success criteria satisfied | finalMilestones | Governance, Goal (informs), Reporting | Strategy done; health cleared |
| `PlanRevised` | Material strategy change | newPlanVersion, changedFields | Task layer, Governance, Audit | Downstream work must re-derive against new version |
| `PlanSuperseded` | Replaced by a new version | successorPlanId | Task layer, Audit | Old strategy retired; work re-anchors to successor version |
| `PlanArchived` | Abandoned/obsolete | reason | Dashboard, Reporting | Strategy retired permanently (no reactivation) |
| `PlanDriftDetected` | Alignment fails vs active Goal/Mission | violatedRef, version | **Governance (high severity)**, Notifications, Audit | Strategy diverging; block/escalate |
| `PlanReviewDue` / `PlanReviewMissed` | Review cadence reached/missed | reviewCycle, lastReviewedAt | Owner, Governance | Cadence enforcement; stale-plan signal |
| `PlanOwnershipReassigned` | Owner changed | fromOwnerRef, toOwnerRef | Governance, Dashboard | Accountability re-points |

**Ordering and idempotency.** Events carry `planVersion`; consumers discard stale/duplicate deliveries. Emission is **transactional with the mutation** — no Plan event fires unless the state change committed; a failed audit/event write rolls back the mutation.

**Two independent streams.** Health events (`PlanHealthChanged` + specializations) never accompany or cause a lifecycle change; lifecycle events (`PlanApproved`, `PlanActivated`, `PlanCompleted`, `PlanSuperseded`, `PlanArchived`) never carry a health transition. Consumers must not infer one from the other.

---

## 11. KPIs

Plan health and the company's strategy performance, measured deterministically from Plan rows, milestones, budget, and derivation.

| KPI | Definition | Source |
|---|---|---|
| **Plan completeness** | % of approved/active Plans with success criteria, review cadence, ≥1 milestone, approval gates, and a readiness verdict (target 100% by construction) | plan fields + validation |
| **Goal-binding coverage** | % of Plans with a valid `goalRef` to a non-terminal Goal + matching `missionRef` (target 100%) | `goalRef`/`missionRef` resolution |
| **Approval throughput** | Median time draft → approved; % of Plans clearing all gates | lifecycle timestamps + gates |
| **Execution readiness** | % of approved/active Plans with `executionReadiness.ready=true` | readiness verdicts |
| **Plan completion rate** | % of Plans reaching `completed` vs archived-incomplete over a window | terminal states |
| **On-track ratio** | % of approved/active Plans with `planHealth=on-track` | `planHealth` (approved/active only) |
| **At-risk / blocked exposure** | Count/% and weighted priority of Plans with `planHealth ∈ {at-risk, blocked}` | `planHealth` + priority |
| **Budget adherence** | % of Plans within budget; total variance; count of `PlanBudgetBreached` | budget vs burn |
| **Milestone hit rate** | % of milestones reached on/before target date | milestone status |
| **Plan drift** | Rate/severity of `PlanDriftDetected` over a window | drift event stream |
| **Review adherence** | % of Plans reviewed within cadence | review events vs cadence |
| **Ownership completeness** | % of Plans with a live, in-tenant owner (0 orphans = 100%) | `ownerRef` resolution |

These feed the Executive/Director/Department dashboards (Identity §10 pattern). All computed from Plan's own records — no external inference.

---

## 12. Failure Scenarios

At least the following failure modes and the system's deterministic reaction. Governing rule: **Plans fail closed** — on ambiguity they refuse to advance, preserve state, and never let unready or unapproved strategy execute.

1. **Plan with no Goal.** Rejected at submission — `goalRef` mandatory; orphaned strategy never activates.
2. **Plan citing a terminal/other-tenant Goal.** Rejected — `goalRef` must resolve to a non-terminal Goal in the same tenant.
3. **`missionRef` mismatched with the Goal's Mission.** Rejected — a Plan must align to the same Mission version its Goal derives from.
4. **Plan with no success criteria / no review cadence / no approval gates.** Cannot leave `draft` — all are structural requirements.
5. **Execution attempted against an unapproved Plan.** Refused — Execution consumes approved Plans only; the Task layer will not decompose a non-`approved` Plan.
6. **Execution attempted against an approved-but-not-ready Plan.** Refused — `executionReadiness.ready=false` blocks work dispatch even in `active` lifecycle; blockers listed.
7. **Plan contradicts its Goal / Mission principle.** `PlanDriftDetected` raised; approval blocked (at submission) or execution blocked and escalated (later). Never auto-resolved in the Plan's favor.
8. **Plan requires violating law/compliance/approved policy.** Hard stop — cannot approve; if arising later, execution blocks and a human must resolve. Protective operations (Mission §7.8) continue regardless.
9. **Goal superseded under an active Plan.** Plan flagged for re-derivation; re-validated against the new Goal version; not silently honored against a dead outcome.
10. **Budget exceeded mid-execution.** `PlanBudgetBreached` (high severity) to Governance/Finance; health → `at-risk`/`blocked`; the Plan does not silently overspend — a governed decision (revise budget, re-scope, archive) is required. Lifecycle unchanged by the health signal alone.
11. **Required resource/capability unavailable.** `executionReadiness.ready=false` with the missing resource as a blocker; work is not dispatched until resolved. Plan may stay `active` but non-executing.
12. **Nested Plan contradicts parent.** Rejected at validation.
13. **Circular nested-Plan or dependency graph.** Rejected by acyclicity check at write time.
14. **Attempt to edit a superseded/completed/archived Plan.** Refused — terminal and superseded Plans are immutable; versions are immutable.
15. **Attempt to reactivate an archived Plan.** Refused — reviving a strategy is a new Plan, not a resurrection.
16. **Concurrent revision (two successors).** Only one supersession wins the atomic flip; the second finds the base no longer current and is refused, rebased on the new version. No forked lineage.
17. **Health value set on a draft/proposed/terminal Plan.** Rejected, coerced to `unknown` — health exists only for approved/active Plans.
18. **Attempt to move lifecycle because health changed.** Refused — `at-risk`/`blocked` never transition lifecycle; only governed actions move it. Auto-archiving an at-risk Plan is a layer violation.
19. **Completed Plan showing active health.** Structurally impossible — completion clears `planHealth` to `unknown` and freezes it.
20. **Plan attempts to dispatch a Command / call a provider / hold runtime state.** Structurally impossible — Plans have no dispatch edge, no provider/LLM binding, no runtime-state field. The request is rejected as a layer violation.
21. **Plan attempts to own or run a Task/Workflow.** Structurally impossible — Plans reach only to work packages; Tasks/Workflows/Execution are below and separate.
22. **Approval gate approved by an unauthorized actor.** Refused at the gate authority check; logged as a governance/security event.
23. **Author self-approves a gate requiring independence.** Refused by separation-of-duties.
24. **Plan past review cadence, never reviewed.** `PlanReviewMissed` raised; health degrades; repeated misses escalate. Stale strategy is surfaced, not tolerated.
25. **Readiness recompute with unresolved inputs.** Yields `ready=false`, never a stale `true`; missing signals never read as ready.
26. **Audit/event write failure on a Plan mutation.** Transactional emission rolls back the mutation; no un-audited Plan change commits.

---

## 13. Enterprise Use Cases

Behavior of Plans in real enterprise situations. In every case Plans mutate only strategy/decomposition/readiness edges and emit events; the Task layer and below react.

1. **Strategy for a strategic Goal.** A director authors a Plan for "€5M DTC revenue," declaring approach, milestones, €400k budget, required capabilities, and approval gates; leadership clears the gates → `approved`.
2. **Multiple competing Plans per Goal.** The same Goal owns two Plans — "paid-acquisition-led" and "partnership-led." A Decision chooses one to activate; the other stays `approved` as a contingency.
3. **Phased program with nested Plans.** A program Plan owns sub-Plans (DE launch, FR launch, NL launch), each nested, each with its own milestones and readiness.
4. **Work-package handoff.** An `active`, ready Plan's work packages are consumed by the Task layer, which produces Tasks — the Plan never runs them.
5. **Budget gate.** A Plan cannot reach `approved` until the budget approval gate is signed by Finance authority; strategy sign-off and budget sign-off are separate gates.
6. **Execution readiness fails on resource.** A Plan is `active` but the "ads agent" capability is unavailable; `executionReadiness.ready=false`; work is not dispatched until the capability is provisioned.
7. **Plan at risk from budget burn.** Spend trends over ceiling; health → `at-risk`; `PlanBudgetBreached` alerts Governance/Finance; owner revises the Plan (new version) — lifecycle stays `active` until the governed revision.
8. **Plan blocked by dependency.** "FR launch" Plan depends on "EU VAT" (a Goal/Plan); health → `blocked` while lifecycle stays `active`; resolution is governed.
9. **Milestone missed.** A storefront-live milestone slips; `PlanMilestoneMissed`; health → `at-risk`; review triggers a re-plan decision.
10. **Plan revision.** Market data invalidates the approach; the owner revises → new `planVersion` supersedes the old; downstream Tasks re-derive against the new version; the old version is frozen.
11. **Goal redefined under a Plan.** The Goal's target changes; the Plan is flagged and re-validated; if still aligned it continues, else it is revised or archived.
12. **Mission re-ratified.** Active Plans are re-validated against the new Mission version; misaligned Plans raise drift and are revised/archived.
13. **Agent-authored Plan.** A strategy agent drafts a Plan bounded by its human director's authority; a human clears the approval gates before it can execute.
14. **Compliance gate.** A Plan to expand into a regulated market carries a compliance approval gate; without it, the Plan cannot be approved or executed.
15. **Contingency plan.** A "supply disruption" Plan sits `approved` but inactive; if the risk materializes, a Decision activates it — readiness is re-checked before any work.
16. **Cross-department program.** A company Plan coordinates department Plans (Sales, Ops, Marketing), each owned by its director, all under the same strategic Goal.
17. **Zero-budget Plan.** A pure-internal strategy declares a zero budget explicitly; the budget gate still records the sign-off that no spend is authorized.
18. **Plan completion without Goal achievement.** A Plan completes its success criteria (e.g. "storefronts live") though the Goal ("€5M revenue") is not yet achieved; the Plan is `completed`, the Goal continues with other Plans.
19. **Executive strategy review.** The dashboard reads completion rate, readiness, budget adherence, at-risk exposure, and drift across all Plans — the company's strategy health at a glance.
20. **Ownership handoff.** A strategist departs; Plan ownership is reassigned to an active in-tenant owner before archival; nothing is orphaned.
21. **Assumption invalidated.** A declared assumption fails; the risk materializes; health → `at-risk`; a governed revision follows. The assumption was declared up front, so the failure is anticipated.
22. **Simulation / what-if planning.** Draft Plans are modeled for scenarios without ever being approved or executed — no readiness, no dispatch.
23. **Audit of strategy.** An auditor reads the immutable Plan lineage: every strategy version, its gates, its budget, its readiness verdicts, and which version executed — permanent and exportable.
24. **M&A plan reconciliation.** Merged companies keep Plans per tenant; overlapping strategies are reconciled by revising/superseding within each tenant, never by sharing Plan ownership.
25. **Portfolio rebalancing.** Governance shifts execution capacity between approved Plans by priority without editing their definitions; only which Plans are `active`/consumed changes.
26. **Readiness restored.** A previously blocked Plan's dependency resolves; `PlanReadinessChanged{ready:true}`; the Task layer resumes consuming its work packages.
27. **Board-mandated strategy.** A board directive enters as a Plan under the relevant Goal, gated and budgeted like any other, and cascades to Tasks once approved and ready.

---

## 14. Extensibility

How Plans absorb future demands **without redesign**, because the core abstractions were chosen as extension points.

- **Richer strategy modeling.** `strategy`, milestones, and work packages can gain structure (Gantt semantics, scenario branches) without schema change — they are structured entries the Plan versions with.
- **Automated readiness.** `executionReadiness` can move from rule-checked to continuously-monitored (live resource/capability/budget feeds) behind the same verdict contract.
- **Predictive health.** `on-track/at-risk` classification can evolve from thresholds to forecasting; health states and events stay stable.
- **Cost/finance integration.** Budget can bind to a real finance ledger (Identity §permission scope `finance`) for live burn; the budget field and `PlanBudgetBreached` event are the seam.
- **Capability marketplace.** `requiredCapabilities` can resolve against an agent/skill marketplace; capability availability feeds readiness with no model change.
- **Plan templates.** Standard strategy templates are draft `plans` rows adopted and gated per company; no new primitive.
- **Portfolio optimization.** Priority + dependencies + budget + readiness give a solver everything to optimize capacity allocation as a consumer, not a schema change.
- **AI-driven planning.** Agents already author Plans as first-class actors; the author/owner/gate-approver split keeps AI-authored strategy safe by construction.
- **Cross-tenant program alignment (holdings).** Explicit governed reference links between per-tenant Plans can be added as typed edges — never shared ownership.

The invariant enabling all of the above: **strategy is versioned and immutable-in-lineage; binding to a Goal is explicit; readiness and approval gate execution; the produce-Tasks-only boundary isolates strategy from runtime.** New demands plug into these seams without touching the layer boundaries.

---

## 15. Architectural Principles

The permanent design principles governing Plans. If a future request conflicts with one of these, the request is wrong, not the principle.

1. **No Plan without a Goal; no Goal without a Mission.** Every Plan binds to exactly one Goal and transitively one Mission. Orphaned strategy is forbidden.
2. **Plans describe strategy, never execution.** A Plan holds no runtime state, dispatches no Command, calls no provider/LLM, runs no Task/Workflow. It produces Tasks; the chain runs below it.
3. **Every Plan is owned, measurable, reviewable, resourced, and gated.** Owner, success criteria, review cadence, budget/resources, approval gates, and an execution-readiness verdict are structural requirements.
4. **Execution consumes approved, ready Plans only.** Unapproved or not-ready strategy is never decomposed into runnable work. Readiness is the execution boundary.
5. **Plans are subordinate.** Precedence is absolute: Law → Security/Compliance → Approved Policy → Mission → Goals → Plans → Tasks → Workflows → Execution. Plans never override Goals, Mission, or Policy; conflicts block and require explicit human resolution.
6. **Alignment is continuous.** A Plan's binding to Goal and Mission is re-validated on change and on review; drift raises Governance events, never silent divergence.
7. **Versions and history are immutable.** Superseded Plans are frozen; completed/archived are terminal; archived never reactivates; every change is retained forever. Execution always binds to a specific approved version.
8. **Lifecycle and health are separate axes.** Lifecycle is *governed existence* and moves only by governance-ruled transitions. Health is *observed condition*, applies only to approved/active Plans, updates automatically, and **never** changes lifecycle. Plans may be Active while At-Risk; completed Plans have Health = Unknown.
9. **A Goal may own many Plans; a Plan serves one Goal.** Alternative and contingency strategies are first-class; the binding is always one-directional and singular upward.
10. **Author proposes, gates approve, owner is accountable.** These roles are distinct and, where a gate requires it, independent.

---

## 16. What Plans will NEVER do

Explicit boundaries to prevent responsibility creep. If a future request asks Plans to do any of these, the answer is: it belongs to another module.

- **Never execute work.** No command dispatch, no Task run, no Workflow run. Plans are strategy, not action.
- **Never own runtime state.** Running/succeeded/failed, retries, live provider status belong to Tasks/Workflows/Execution — never the Plan.
- **Never dispatch commands.** Commands are dispatched only by the Execution layer. A Plan has no dispatch edge.
- **Never execute Tasks or Workflows.** Plans reach only to work packages; Tasks/Workflows/Execution are below and separate.
- **Never call providers or LLMs.** A Plan has no provider/LLM binding. Provider calls happen only in Execution.
- **Never schedule or orchestrate running work.** Sequencing of live work is Workflows' job; Plans declare milestones/dependencies as intent only.
- **Never set, amend, or override its Goal or Mission.** A Plan references and is bounded by them.
- **Never override Law, Security/Compliance, or Approved Policy.** Plans are subordinate to the whole authority stack; conflicts block and escalate to a human.
- **Never be executed while unapproved or not execution-ready.** The approval + readiness boundary is absolute.
- **Never mutate a superseded/completed/archived version, nor reactivate an archived Plan.** Versions and history are immutable; revival is a new Plan.
- **Never let health change lifecycle, or mutate without an actor and an audit record.**

---

*End of Plan Specification v1.0. This document specifies the Plan module — the versioned, owned, reviewable strategy layer that decomposes Goals into executable intent and hands work packages to the Task layer — in full and defines its permanent boundaries. No implementation code. No SQL. No TypeScript. No other specification modified.*
