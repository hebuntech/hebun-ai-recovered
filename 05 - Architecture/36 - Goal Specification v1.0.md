# Goal Specification v1.0

> Stage 3 — Goal module, complete Enterprise Architecture Specification.
> This document is the permanent architectural reference for Goals in Hebun AI.
> It specifies the second layer of the cognitive hierarchy, directly beneath Mission. It adds no implementation. It defines boundaries.

**Status:** Definitive · **Scope:** Goal module only · **Grounded in:** the schema primitives in `src/db/schema/_base.ts` (`rootColumns`, `tenantColumns`) and `_enums.ts` (`lifecycleStatusEnum`, `approvalStateEnum`, `roleTypeEnum`, `permissionScopeEnum`), the Identity Specification v1.0 (doc 34), and the Mission Specification v1.0 (doc 35).

**Position in the cognitive hierarchy:**

```
Mission            ← the North Star of intent (doc 35)
  → Goals          ← this document — desired outcomes derived from Mission
    → Plans          — decompose Goals into approaches
      → Tasks          — decompose Plans into units of work
        → Workflows      — orchestrate Tasks
          → Execution      — runs Workflows against providers
```

**Authority precedence (unchanged, absolute):**

```
Law and Regulation
  → Security and Compliance Policy
    → Approved Company Policy
      → Mission
        → Goals            ← subordinate to everything above; never overrides Mission or Policy
          → Plans
            → Tasks
              → Workflows
                → Execution
```

Goals are the first *outcome-bearing* layer. Mission says what the company is for; Goals say what measurable outcomes the company intends to reach in service of that purpose. A Goal defines a **desired outcome only** — never the work, never the schedule, never the action.

---

## 1. Purpose

### Why the Goal layer exists

Mission (doc 35) is the immutable statement of purpose. But a purpose is not executable and not measurable — "bring authentic Anatolian craftsmanship to the world" cannot be scheduled, tracked, or reported on. Something must translate an unchanging North Star into concrete, measurable, time-bounded outcomes the company can actually pursue and be held accountable to. Goals are that layer.

Goals are the **system of record for every desired outcome the company commits to, each derived from and traceable to a Mission version, each measurable, each owned.** A Goal converts direction into a target: a metric, a target value, a review cadence, and an owner accountable for closing the gap.

Without a Goal layer, the platform would jump directly from immutable purpose to executable plans, and three things would break: outcomes would be unmeasurable (no target to compare against), accountability would be diffuse (no single owner per outcome), and Mission alignment would be unverifiable at the outcome level (nothing standing between "our purpose" and "this week's task"). Goals close that gap.

### Business problem it solves

1. **Measurability.** Purpose is qualitative; the business must be quantitative. Goals force every intended outcome to declare success criteria, target values, and a way to read current progress. An outcome you cannot measure is not a Goal.
2. **Accountability.** Every desired outcome must trace to exactly one accountable owner (a human, a department, or an agent under a human). "The company wants growth" is not accountable; "the Sales Director owns +30% qualified pipeline by Q4" is.
3. **Traceable alignment.** Every Goal cites the Mission version it serves. This makes it deterministic to check that what the company is *trying to achieve* still matches what it is *for* — and to detect drift the moment a Goal diverges.

### Its responsibility

- Own the lifecycle of every desired outcome: `draft → proposed → approved → active → {on-track | at-risk | blocked} → achieved → superseded → archived`.
- Guarantee every Goal is **measurable**: no Goal exists without success criteria, at least one success metric, and a target value.
- Guarantee every Goal is **owned** and carries a **review cadence**.
- Own the **Mission derivation edge**: every Goal carries `{missionId, missionVersion}` and is continuously validated for alignment against the active Mission.
- Own the **Goal hierarchy**: strategic → department → team → operational, with parent/child decomposition.
- **Produce Plans, not Actions.** A Goal is realized by handing off to the Plan layer; the Goal never plans the work itself and never schedules or runs it.
- Emit Goal events so Governance, dashboards, and downstream planning react to outcome status and drift.
- Preserve an immutable, versioned audit trail of every Goal, its progress history, and every state change.

### What is explicitly NOT its responsibility

- **Goals never execute work.** No command, no provider call, no task run. A Goal is a desired outcome, not an action.
- **Goals never schedule work.** Timing, sequencing, and orchestration belong to Plans, Tasks, and Workflows. A Goal carries a review cadence for *itself*, not a schedule for work.
- **Goals never own Tasks.** Tasks decompose Plans, not Goals. A Goal that reached down to own tasks would collapse the layer separation the whole hierarchy depends on.
- **Goals never author Plans' internal steps.** A Goal *produces* a Plan (declares the outcome a Plan must reach); the Plan module decides *how*.
- **Goals never override Mission or Policy.** A Goal is subordinate to Mission, Approved Policy, Security/Compliance, and Law. It may pursue only outcomes those layers permit.
- **Goals never set their own Mission.** Mission is authored and ratified in the Mission module. A Goal only *references* a ratified Mission version; it cannot create, amend, or reinterpret purpose.

---

## 2. Mental Model

If Mission is the **North Star**, Goals are the **waypoints** plotted toward it — concrete, reachable, measurable points on the route that each provably lie along the bearing the North Star sets. The star never moves; the waypoints are chosen, pursued, achieved, and replaced as the company advances.

The mental model in one line: **A Goal is a measurable, owned, Mission-derived commitment to a future outcome — nothing more and nothing less. It states what "better" looks like and how we will know we got there; it does not do the work, schedule the work, or own the work.**

Five properties define the model:

- **Derived.** Every Goal descends from exactly one Mission version. A Goal with no Mission is invalid — orphaned intent the company never authorized. The derivation is explicit (`{missionId, missionVersion}`) and continuously re-validated.
- **Measurable.** Every Goal declares success metrics, target values, and a readable current progress. "Improve customer happiness" is not a Goal; "raise NPS from 42 to 60 by 2026-06-30" is. Measurability is structural, not aspirational.
- **Owned.** Every Goal has exactly one accountable owner resolved through Identity — a human, a department, or an agent bounded by its human owner. Ownerless outcomes are governance failures.
- **Long-lived and strategic.** Goals are durable objects that persist across many Plans, Tasks, and review cycles. They are not to-do items. A Goal may live for quarters; the Plans beneath it churn.
- **Bounded, not sovereign.** A Goal is subordinate to Mission and to the entire authority stack above Mission. It expresses desired *outcomes* within the space those layers permit. It never expands that space.

Goals sit **beneath Mission in authority and above Plans in derivation.** Mission hands Goals a permissible direction; Goals hand Plans a measurable outcome to reach. Goals are the hinge between *why* (Mission) and *how* (Plans) — and they are exclusively about *what outcome*, never *what action*.

---

## 3. Core Domain Objects

Goals introduce one primary entity and a small set of supporting objects. All reuse the existing column contracts from `_base.ts`:

- **`rootColumns`**: `id`, `createdAt`, `createdBy`, `updatedAt`, `updatedBy`, `version`, `lifecycleStatus` (`active | archived | deleted`), `deletedAt`.
- **`tenantColumns`** = `rootColumns` + `tenantId` (FK → `companies.id`, NOT NULL).

`createdBy` / `updatedBy` / `ownerRef` resolve to an **actor reference** per Identity §3.9 (`{actorType, actorId}`, `actorType ∈ {human, agent, system, service}`). No Goal mutates without a resolved actor.

---

### 3.1 Goal

- **Purpose.** A measurable, owned, Mission-derived commitment to a future outcome. The primary object of this module.
- **Table.** `goals` (`tenantColumns`).
- **Conceptual fields** (the full anatomy every Goal carries):
  - `id` — Goal ID.
  - `tenantId` — owning company (Identity §3.1).
  - `missionRef` — `{missionId, missionVersion}` — the Mission version this Goal serves (Mission §3.5 Alignment Assertion). Required; version-aware.
  - `parentGoalId` — nullable FK → `goals.id`; the parent Goal in the hierarchy (null for a strategic Goal directly under Mission).
  - `ownerRef` — the accountable actor (human | department-scoped | agent-under-human).
  - `scope` — `goalScopeEnum` (§5): `strategic | department | team | operational`.
  - `priority` — `goalPriorityEnum`: `critical | high | medium | low`.
  - `goalLifecycleStatus` — the governed lifecycle position (`goalLifecycleStatusEnum`, §6): `draft | proposed | approved | active | achieved | superseded | archived`. Changes only via governance-ruled transitions.
  - `goalHealth` — the current health signal (`goalHealthEnum`, §6): `unknown | on-track | at-risk | blocked`. Applies **only** to `approved` or `active` Goals; auto-derived from metrics/risks/dependencies/review; **never** triggers a lifecycle change.
  - `approvalState` — reuses `approvalStateEnum` for the approval gate.
  - `successMetrics` — one or more named, measurable metrics (structured list). Required, non-empty.
  - `targetValues` — the target for each metric (with unit and direction of improvement).
  - `currentProgress` — the latest read value per metric; may never exceed the success criteria (clamped, §7).
  - `confidence` — the owner's/agent's confidence the target will be met (bounded 0–100 or a graded enum).
  - `reviewCycle` — the mandatory review cadence (e.g. weekly, monthly, quarterly). Required.
  - `dependencies` — other Goals this Goal depends on (structured references).
  - `risks` — declared risks to achievement (structured list).
  - `assumptions` — declared assumptions the Goal rests on (structured list).
  - `targetDate` / `horizon` — the intended time by which the outcome should be reached.
  - `goalVersion` — the Goal's own revision counter for material redefinition (distinct from row `version`).
  - base lifecycle/audit fields (audit metadata).
- **Required.** `tenantId`, `missionRef`, `ownerRef`, `scope`, `successMetrics` (≥1), `targetValues`, `reviewCycle`, `goalLifecycleStatus`. (`goalHealth` defaults to `unknown` and is set only while `approved`/`active`.)
- **Optional.** `parentGoalId` (null for strategic), `dependencies`, `risks`, `assumptions`, `confidence`, `targetDate`.
- **Ownership.** Owned by exactly one company; accountable to exactly one owner.
- **Example.** Company `Turkish Rug House` → Strategic Goal: *"Reach €5M direct-to-consumer revenue by 2026-12-31,"* metric `dtc_revenue_eur`, target `5,000,000`, review `monthly`, owner `Sales Director`, `missionRef {m1, v2}`.

### 3.2 Success Metric

- **Purpose.** A single named, measurable dimension by which a Goal's achievement is judged. What makes a Goal measurable rather than aspirational.
- **Realization.** Structured entries within `successMetrics` — each with `id`, `name`, `unit`, `direction` (increase | decrease | maintain), and a bound to a `targetValue`. A Goal with zero success metrics cannot leave `draft`.
- **Example.** Metric `qualified_pipeline`, unit `EUR`, direction `increase`, target `2,000,000`.

### 3.3 Success Criteria

- **Purpose.** The condition under which a Goal is considered **Achieved**. Binds metrics + targets into a pass condition.
- **Realization.** A structured predicate over the Goal's metrics and targets (e.g. `dtc_revenue_eur ≥ 5,000,000 AND churn_rate ≤ 0.05`). Required; a Goal cannot exist without a defined success condition.
- **Rule.** `currentProgress` is evaluated against success criteria; when satisfied, the Goal becomes eligible for `achieved`. Progress may never be recorded beyond the criteria (§7).

### 3.4 Goal Dependency

- **Purpose.** A declared prerequisite relationship: Goal B cannot progress (or cannot be achieved) until Goal A reaches a state. Makes cross-goal blocking explicit and detectable.
- **Realization.** Structured references within `dependencies`, each `{dependsOnGoalId, type}` where `type ∈ {blocks-start, blocks-completion, informs}`. Dependency graph must be acyclic (§7).
- **Example.** Operational Goal "launch EU webstore" depends on department Goal "obtain EU VAT registration" (`blocks-start`).

### 3.5 Progress Reading

- **Purpose.** An immutable, timestamped observation of a metric's current value. The append-only history behind `currentProgress` and every progress KPI.
- **Realization.** Append-only records `{goalId, metricId, value, confidence, observedAt, actorRef}`. `currentProgress` is the latest reading per metric; the full series is the Goal's progress history, never overwritten.
- **Rule.** A reading exceeding the success criteria is clamped and flagged; the recorded value never asserts more than 100% of target (§7, §8).

### 3.6 Goal Version (immutable lineage record)

- **Purpose.** The permanent record of a Goal's material redefinitions and supersessions. Answers "how did this outcome's definition change over time, and what replaced it."
- **Realization.** A superseded Goal is retained immutably; its successor carries `supersedesGoalId` and an incremented `goalVersion`. The chain is the Goal's lineage. No superseded Goal is ever edited or reactivated (§7).

---

## 4. Ownership

- **Owned by Company.** Every Goal belongs to exactly one company via `tenantId`. No global goals; every outcome is a tenant's own.
- **Accountable to one owner.** Every Goal carries exactly one `ownerRef` — the single accountable actor. The owner may be:
  - a **human** (a person accountable for the outcome),
  - a **department/team** (accountability held by that container's director), or
  - an **agent** (a digital employee), always **bounded by its owning human** (Identity §3.8, Mission §9): an agent may own a Goal only within the authority its human owner holds and only for outcomes the Mission and Policy stack permit.
- **Ownership vs authorship.** Anyone authorized may *author/propose* a Goal; the `ownerRef` is who is *accountable* for achieving it. These may differ (a strategist drafts, a director owns).
- **Ownership follows the hierarchy but is not inherited silently.** A parent Goal's owner does not automatically own child Goals; each child names its own accountable owner. Directors have visibility down their scope; accountability is always explicit per Goal.
- **Ownership transfer.** When an owner leaves or is reassigned (Identity ownership transfer, §11 there), the Goal's `ownerRef` is re-pointed to an active in-tenant actor before the prior owner is archived. A Goal is never left owner-less.
- **No cross-tenant goals.** A Goal never spans companies. Cross-company objectives in a holding are separate Goals per tenant, linked only by explicit governed references, never shared ownership.

---

## 5. Goal Hierarchy

Goals form a strict decomposition tree rooted in a Mission version. Two orthogonal structures: the **scope hierarchy** (organizational altitude of the outcome) and the **derivation/parent chain** (which Goal a Goal refines).

### 5.1 Scope hierarchy

```
Mission (doc 35)
  └── Strategic Goal      (scope=strategic)    — company-wide outcome, parent = Mission
        └── Department Goal  (scope=department)   — a department's contribution to a strategic Goal
              └── Team Goal      (scope=team)        — a team's contribution to a department Goal
                    └── Operational Goal (scope=operational) — a concrete near-term outcome
```

Rules of the scope hierarchy:

- **Strategic Goals derive directly from Mission.** Their `parentGoalId` is null; their `missionRef` is the active Mission version. They are the top outcomes.
- **Lower scopes decompose higher ones.** A department Goal refines a strategic Goal; a team Goal refines a department Goal; an operational Goal refines a team (or department) Goal. Each names its `parentGoalId`.
- **Every Goal at every scope still carries its own `missionRef`.** Alignment is checked at every level, not only at the top — a mis-derived operational Goal is caught even if its parent is aligned.
- **Optional depth.** A small company may run strategic → operational directly. Team scope is used only where a department subdivides.
- **The tree bottoms out at Goals, then hands off.** Below the lowest Goal, the hierarchy leaves the Goal module entirely: `Goal → Plan → Task → Workflow → Execution`. Goals never reach past their own bottom edge.

### 5.2 Parent/child decomposition rules

- **A Goal may contain child Goals** (`parentGoalId`), forming an acyclic tree per company.
- **Children must align with their parent and with Mission.** A child Goal may narrow or contribute to its parent's outcome; it may never contradict it (checked at validation, §8).
- **Progress rolls up, accountability does not.** A parent Goal's progress may be derived from its children's, but each child keeps its own owner. Roll-up is a reporting relationship; accountability stays per-Goal.
- **Achievement is bottom-supported.** A parent Goal is typically achieved when its success criteria are met, which usually depends on children being achieved — but the parent's success is judged by *its own* criteria, not merely by counting children.

### 5.3 The four-layer boundary (why Goals stop where they stop)

- **Goals produce Plans, never Actions.** The lowest Goal's job is to hand the Plan layer a measurable outcome. It does not enumerate steps.
- **Plans decompose Goals** into approaches/strategies to reach the outcome.
- **Tasks decompose Plans** into units of work.
- **Workflows orchestrate Tasks.**
- **Execution executes Workflows.**

This four-layer separation is the invariant that keeps strategy (durable, measurable, Mission-aligned) cleanly divided from execution (transient, scheduled, provider-bound). Collapsing any boundary — a Goal owning a Task, a Plan setting an outcome — is an architectural defect.

---

## 6. Goal Lifecycle

A Goal carries **two orthogonal state dimensions** that must never be conflated:

- **Lifecycle** (`goalLifecycleStatusEnum`) — *where the Goal is in its governed existence.* Changes only via governance-ruled transitions.
- **Health** (`goalHealthEnum`) — *how well an in-flight Goal is doing.* Auto-derived from signals; never a lifecycle transition.

The governing rule: **a Goal is measurable, owned, and Mission-aligned before it may become Active; lifecycle changes are governed; health merely observes; and history is permanent thereafter.**

### 6.1 Lifecycle dimension

**`goalLifecycleStatusEnum`** (specified): `draft | proposed | approved | active | achieved | superseded | archived`.

| Lifecycle state | Meaning | Mutable? | Carries health? |
|---|---|---|---|
| **draft** | Being authored; incomplete allowed | Yes (full edit) | No |
| **proposed** | Submitted for approval; frozen for review | No | No |
| **approved** | Approved, not yet activated | Limited | **Yes** |
| **active** | In pursuit; baseline recorded | Progress only | **Yes** |
| **achieved** | Success criteria satisfied | No (terminal-positive) | No (health cleared) |
| **superseded** | Replaced by a redefined successor Goal | No (immutable) | No |
| **archived** | Retired (abandoned/obsolete); terminal | No (immutable) | No |

**Lifecycle transitions (governance-ruled):**

| Transition | From → To | Precondition (governance rule) | Effect | Emits |
|---|---|---|---|---|
| **Draft** | ∅ → draft | Authoring actor resolved | Row created, `goalLifecycleStatus=draft`, `goalHealth=unknown` | `GoalDrafted` |
| **Propose** | draft → proposed | Passes measurability + ownership + alignment validation (§8) | `goalLifecycleStatus=proposed`, `approvalState=pending`; content frozen | `GoalProposed` |
| **Approve** | proposed → approved | `approvalState=approved` by an authorized approver | `goalLifecycleStatus=approved`; `goalHealth` begins tracking (starts `unknown`) | `GoalApproved` |
| **Reject** | proposed → draft \| archived | Approver rejects | Back to draft, or archived if abandoned | `GoalRejected` |
| **Activate** | approved → active | Owner confirmed active; baseline progress recorded | `goalLifecycleStatus=active`, baseline reading captured | `GoalActivated` |
| **Achieve** | active → achieved | Success criteria satisfied and verified | `goalLifecycleStatus=achieved` (terminal); `goalHealth` cleared to `unknown` and frozen | `GoalAchieved` |
| **Supersede** | draft/proposed/approved/active → superseded | A redefined successor Goal is approved | `goalLifecycleStatus=superseded`, immutable; `supersedesGoalId` set on successor; health frozen | `GoalSuperseded` |
| **Archive** | draft/proposed/approved/active → archived | Abandoned/obsolete; governed retirement | `lifecycleStatus=archived`, `goalLifecycleStatus=archived` (terminal, no reactivation); health frozen | `GoalArchived` |
| **Redefine (version)** | approved/active → superseded (+ new successor) | Material change to metrics/targets | New `goalVersion` via supersession; prior retained immutable | `GoalRedefined` |

Every lifecycle transition is gated by a governance rule and produces an audited event. **Health never appears in this table** — no health value causes any of these transitions.

### 6.2 Health dimension

**`goalHealthEnum`** (specified): `unknown | on-track | at-risk | blocked`.

| Health state | Meaning | Set how |
|---|---|---|
| **unknown** | No sufficient signal yet (default; also the value for terminal Goals) | default / on clear |
| **on-track** | Progress + confidence trending to meet target on time | auto |
| **at-risk** | Progress/confidence/review trending to miss | auto |
| **blocked** | Cannot progress (unresolved dependency, decision, or resource) | auto |

**Health rules:**

- **Scope.** Health applies **only** to Goals in `approved` or `active` lifecycle. In `draft`/`proposed` it is `unknown` and inert; in `achieved`/`superseded`/`archived` it is cleared to `unknown` and frozen — **terminal Goals carry no active health.**
- **Automatic.** Health is derived automatically from **metrics** (progress vs target/time), **risks** (materialized declared risks), **dependencies** (blocking dependency states), and **review state** (missed/overdue reviews). It is not set by hand as a lifecycle act.
- **No lifecycle effect.** A health change **never** creates a lifecycle transition. A Goal going `at-risk` or `blocked` stays lifecycle-`active`; it does not become a different lifecycle state. Only governance-ruled transitions move lifecycle.
- **Observability, not authority.** Health drives alerts, KPIs, and Governance signals; it informs humans/agents who may *then* choose a governed action (redefine, archive, re-plan). The signal never mutates lifecycle on its own.

### 6.3 Terminal-state rules

- **Achieved** and **archived** are terminal lifecycle states. **Archived Goals never reactivate** — reviving an outcome is a *new* Goal, not a resurrection.
- **Superseded** Goals are **immutable** and permanent — retained as lineage, never edited, never reactivated.
- Terminal Goals hold `goalHealth = unknown` (cleared, frozen); health is meaningless once a Goal is no longer in flight.
- **Goal history is permanent.** Every lifecycle transition, health change, progress reading, and redefinition is retained in the append-only audit trail. No Goal history is ever deleted (except under the same legal-erasure exception that governs Identity, §13 there).

---

## 7. Constraints

Structural and semantic constraints, enforced by the schema and the module — not by convention.

**Structural (schema-enforced):**

1. **Mission reference mandatory.** `missionRef` NOT NULL on every Goal. **No Goal without a Mission.** A Goal whose `missionRef` cannot resolve to a real Mission version is rejected.
2. **Owner mandatory.** `ownerRef` NOT NULL. Every Goal has an accountable owner.
3. **Measurability mandatory.** `successMetrics` non-empty and each bound to a `targetValue`; `reviewCycle` NOT NULL. A Goal missing metrics, targets, or cadence cannot leave `draft`.
4. **Tenant isolation.** `tenantId` NOT NULL, FK → `companies.id`. Cross-tenant leakage structurally impossible.
5. **Acyclic hierarchy.** `parentGoalId ≠ id`; the parent chain and the dependency graph are both acyclic (checked at write time).
6. **Progress ceiling.** **`currentProgress` may never exceed the success criteria.** Readings above target are clamped to 100%-of-target and flagged for review; the stored progress never asserts over-achievement beyond the defined criteria.
7. **Terminal immutability.** Rows in `achieved | superseded | archived` reject content mutation. **Archived never reactivates; superseded stays immutable.**
8. **Version monotonicity.** `goalVersion` strictly increases along a `supersedesGoalId` chain; no self-supersession.

**Semantic (module-enforced):**

9. **Subordinate to the authority stack.** A Goal — and every Plan/Task/Workflow/Execution derived from it — may never override **Law, Security/Compliance Policy, Approved Company Policy, or Mission.** Precedence is fixed (see header). A Goal that would require violating any higher layer cannot be approved; a conflict arising later blocks downstream execution and escalates for explicit human resolution (mirrors Mission §7).
10. **Alignment continuously validated.** A Goal's `missionRef` is re-checked against the *active* Mission on Mission ratification/supersession and on Goal review. Misalignment raises `GoalDriftDetected` to Governance.
11. **Children align with parent and Mission.** A child Goal may not contradict its parent's outcome or the Mission; contradiction is rejected at validation.
12. **Review cadence enforced.** A Goal past its `reviewCycle` without a review is flagged (stale); repeated misses degrade its health and raise Governance signals.
13. **Goals never schedule, execute, or own Tasks.** Structurally, `goals` has no edge to `tasks`, no scheduler, no execution field. Realization is exclusively via produced Plans.
14. **Lifecycle and health are orthogonal.** `goalLifecycleStatus` and `goalHealth` are separate fields with separate transition rules. A health change never writes `goalLifecycleStatus`, and a lifecycle transition never depends on a specific health value (a lifecycle move may *read* health as human/governance input, but is not *triggered* by it).
15. **Health is scoped and derived.** `goalHealth ∈ {on-track, at-risk, blocked}` is permitted **only** while `goalLifecycleStatus ∈ {approved, active}`. In every other lifecycle state `goalHealth` is forced to `unknown`. Health is computed from metrics, risks, dependencies, and review state — never set as a manual lifecycle act.

---

## 8. Validation

Validation runs at three gates: **draft → proposed** (submission), **proposed → approved** (approval), and **continuous** (standing re-validation while active). Goals fail closed: on any ambiguity the Goal does not advance and no invalid outcome is committed.

**Measurability validation (at submission):**

- At least one `successMetric`, each with a name, unit, direction, and a bound `targetValue`.
- A defined success criteria predicate over the metrics.
- A `reviewCycle` present and resolvable.
- `currentProgress` (if seeded) does not already exceed the criteria.

**Ownership validation (at submission):**

- `ownerRef` resolves to a live, in-tenant actor (Identity).
- If the owner is an agent, the agent's owning human holds the authority the Goal requires (agent ceiling, Identity §6 / Mission §9).

**Derivation & alignment validation (at submission and continuously):**

- `missionRef` resolves to a real Mission version in the same tenant.
- The Goal's declared outcome does not contradict any Mission principle (alignment check, Mission §3.5 validator).
- For a child Goal, `parentGoalId` resolves to a non-terminal Goal in the same tenant, and the child does not contradict the parent.
- **Standing re-check:** on Mission ratification/supersession, active Goals are re-validated; a newly-created misalignment flags the Goal and raises `GoalDriftDetected`.

**Authority-stack validation (at submission and re-checked at approval):**

- The Goal's outcome is checked against Law/Regulation markers, Security/Compliance policy, and Approved Company Policy. A Goal that would require violating any higher layer **cannot be approved**; the conflict is recorded and routed for **explicit human resolution**. Goals never self-resolve in their own favor.

**Structural validation (at submission):**

- No cycle in the parent chain or dependency graph.
- Dependencies resolve to real, in-tenant Goals; declared dependency types are valid.

**Approval validation (at approval):**

- The approver's resolved authority satisfies the company's Goal-approval policy (Governance-computed from Identity `roleTypeEnum`; typically the owning scope's director or above).
- **Separation of duties:** where policy requires independence, the sole author/proposer may not be the sole approver (reuses `approvalStateEnum`).

**Progress validation (continuous):**

- Each progress reading is ≤ success criteria; over-target readings are clamped and flagged, never stored as > 100%.
- Readings are append-only; a reading never overwrites history.

**Health validation (continuous):**

- `goalHealth` may be `on-track | at-risk | blocked` **only** when `goalLifecycleStatus ∈ {approved, active}`; any attempt to set health on a `draft`, `proposed`, or terminal Goal is rejected and coerced to `unknown`.
- A health update carries no lifecycle change; a write that tries to move `goalLifecycleStatus` "because health changed" is refused. Lifecycle moves only through §6.1's governed transitions.
- Health inputs (metrics, risks, dependencies, review state) must resolve; a health recomputation with unresolved inputs yields `unknown`, never a stale positive.

Only a Goal passing all applicable gates advances. A failure returns it to `draft` with the violated rule recorded; it never partially activates.

---

## 9. Relationships

Goals point *up* at Mission and the authority stack, *sideways* at other Goals, and *down* at Plans. Goals never point at Tasks, Workflows, or Execution.

| Module | Relationship to Goals |
|---|---|
| **Law & Regulation** | Absolute ceiling. A Goal may pursue only outcomes law permits; a Goal requiring illegality cannot be approved. Goals never outrank law. |
| **Security & Compliance Policy** | Ranks above Goals (and above Mission). A Goal conflicting with security/compliance policy is blocked and escalated for human resolution; protective operations are never gated by a Goal. |
| **Approved Company Policy** | Ranks above Goals. Where an approved policy and a Goal conflict, the policy prevails, downstream execution blocks, and a human resolves it. Goals never silently override approved policy. |
| **Mission** | **The parent authority and derivation source.** Every Goal carries `{missionId, missionVersion}` and is continuously validated against the active Mission (Mission §9 lists Goals as its primary derivation edge). Mission supplies the permissible direction and the checkable principles; Goals supply the measurable outcomes within it. A Goal never sets, amends, or overrides Mission. |
| **Company** | A Goal belongs to exactly one company (`tenantId`, Identity §3.1). Company-wide (strategic) Goals derive directly from the company Mission. |
| **Organization** | Organization-scoped strategic/department Goals localize company outcomes to a division/brand/country, always aligned beneath the company Mission and any organization sub-mission (Mission §5). |
| **Departments** | Department Goals (`scope=department`) are the primary contribution unit — each department's measurable share of a strategic Goal. Departments *receive* Goals; the department director is the typical accountable owner. |
| **Agents** | An Agent (Identity §3.8) may **own or pursue** a Goal, always bounded by its human owner's authority and the Mission/Policy stack. An agent may propose Goals and record progress, but its Goal ownership never exceeds its ceiling, and it never executes the Goal — it drives the *produced Plan*, which drives Tasks/Workflows/Execution. |
| **Decisions** | Decisions are made *in service of* Goals: choosing between approaches, reprioritizing, resolving at-risk conditions. The Reasoning/Decision layer computes decisions using the Goal (and Mission) as inputs; Goals supply the desired outcome, Decisions supply the choice. A Goal does not itself decide. |
| **Policies** | Policy constrains the *means* by which a Goal may be pursued and ranks above the Goal in authority (see above). A Goal cites policy as a constraint input; it never overrides it. |
| **Plans** | **The downstream production edge.** A Goal **produces Plans, never Actions.** The Plan layer decomposes the Goal's outcome into approaches. The Goal declares *what outcome*; the Plan declares *how to approach it*. Goals never author a Plan's internal steps and never schedule them. |
| **Tasks / Workflows / Execution** | **No direct relationship.** Goals never own Tasks, never orchestrate Workflows, never execute. The chain is strictly `Goal → Plan → Task → Workflow → Execution`; Goals touch only the first hop. |
| **Governance** | Governance evaluates Goal-approval authority, authority-stack conformance, and **drift enforcement**. Goal drift and alignment violations are routed to Governance, which decides block/escalate/human-resolution. Same input/decision split: Goals supply the standard and the progress; Governance renders verdicts. |
| **Identity** | Supplies every actor reference (author, owner, approver) and every scope target (company, organization, department, team). Identity draws the boundary; Goals fill it with measurable outcomes. |

**The outcome spine:** `Mission → Goals → Plans → Tasks → Workflows → Execution`. Goals are the node that turns permissible purpose into measurable, owned, accountable outcomes — and stop exactly there.

---

## 10. Events

Every Goal mutation emits exactly one domain event. Events are the module's public reaction surface — Governance, planning, and dashboards subscribe; they never read Goal tables directly. Payloads carry `actorRef` (`{actorType, actorId}`), `tenantId`, `goalId`, `goalVersion`, `missionRef`, `scope`, and `occurredAt`.

| Event | Trigger | Payload (beyond envelope) | Consumers | Business impact |
|---|---|---|---|---|
| `GoalDrafted` | New Goal draft created | scope, parentGoalId?, missionRef | Dashboard, Governance | Candidate outcome exists; not binding |
| `GoalProposed` | Draft submitted for approval | proposedBy, approvalRef | Governance, Notifications | Approval workflow begins |
| `GoalApproved` | Approval granted | approverRef | Planning, Dashboard | Outcome committed; may activate |
| `GoalRejected` | Approval denied | reason, approverRef | Dashboard, Notifications | No committed outcome |
| `GoalActivated` | Approved → active | baselineReadings | **Plans**, Governance, Dashboard | Pursuit begins; Plan layer may derive |
| `GoalProgressRecorded` | New progress reading | metricId, value, confidence | Dashboard, Governance | Outcome trajectory updated |
| `GoalHealthChanged` | Health recomputed to a new value (approved/active only) | fromHealth, toHealth, driverInputs | Dashboard, Governance | Health signal moved; **no lifecycle change** |
| `GoalOnTrack` | Health → on-track (specialization of `GoalHealthChanged`) | trend | Dashboard | Trending to meet target; lifecycle unchanged |
| `GoalAtRisk` | Health → at-risk (specialization) | trend, gap, confidence | Governance, Notifications | Owner + director alerted to intervene; lifecycle unchanged |
| `GoalBlocked` | Health → blocked (specialization) | blockingRef (dependency/decision/resource) | Governance, Notifications | Pursuit halted pending resolution; **still lifecycle-active** |
| `GoalAchieved` | Success criteria satisfied | finalReadings | Governance, Dashboard, Reporting | Outcome reached; terminal-positive |
| `GoalRedefined` | Material metric/target change | newGoalVersion, changedFields | Planning, Governance, Audit | Downstream Plans must re-derive |
| `GoalSuperseded` | Replaced by a successor | successorGoalId | Planning, Audit | Old outcome retired; plans re-anchor |
| `GoalArchived` | Abandoned/obsolete | reason | Dashboard, Reporting | Outcome retired permanently (no reactivation) |
| `GoalDriftDetected` | Alignment check fails vs active Mission | violatedPrincipleId?, missionVersion | **Governance (high severity)**, Notifications, Audit | Outcome diverging from purpose; block/escalate |
| `GoalReviewDue` / `GoalReviewMissed` | Review cadence reached / missed | reviewCycle, lastReviewedAt | Owner, Governance | Cadence enforcement; stale-goal signal |
| `GoalOwnershipReassigned` | Owner changed | fromOwnerRef, toOwnerRef | Governance, Dashboard | Accountability re-points |

**Ordering and idempotency.** Events carry `goalVersion`; consumers discard stale/duplicate deliveries. Emission is **transactional with the mutation** — no Goal event fires unless the state change committed, and a failed audit/event write rolls back the mutation (mirrors Identity §7, Mission §10).

**Two independent streams.** Health events (`GoalHealthChanged` and its `GoalOnTrack`/`GoalAtRisk`/`GoalBlocked` specializations) never accompany or cause a lifecycle change; lifecycle events (`GoalApproved`, `GoalActivated`, `GoalAchieved`, `GoalSuperseded`, `GoalArchived`) never carry a health transition. A consumer must not infer lifecycle from a health event, or vice versa.

---

## 11. KPIs

Goal health and the company's outcome performance, measured deterministically from Goal rows, progress history, and Mission derivation.

| KPI | Definition | Source |
|---|---|---|
| **Goal measurability** | % of active Goals with ≥1 metric, a target, success criteria, and a review cadence (target 100% by construction) | goal fields + validation |
| **Mission-alignment coverage** | % of active Goals carrying a valid `missionRef` to the *current* Mission version (target 100%) | `missionRef` vs active Mission |
| **Goal attainment rate** | % of Goals reaching `achieved` vs archived-unachieved over a window | terminal states |
| **On-track ratio** | % of approved/active Goals with `goalHealth=on-track` (vs at-risk/blocked/unknown) | `goalHealth` (approved/active only) |
| **At-risk / blocked exposure** | Count/% and weighted priority of Goals with `goalHealth ∈ {at-risk, blocked}` | `goalHealth` + priority |
| **Health observability** | % of approved/active Goals with a resolved (non-`unknown`) health signal | `goalHealth` vs lifecycle |
| **Progress fidelity** | % of Goals whose recorded progress is within criteria bounds (0 over-target = 100%) | progress readings vs criteria |
| **Review adherence** | % of Goals reviewed within their cadence (no missed cycles) | review events vs cadence |
| **Goal drift** | Rate/severity of `GoalDriftDetected` over a window | drift event stream |
| **Stale-derivation ratio** | % of active Goals still citing a superseded Mission version after ratification (trend → 0) | `missionRef` vs supersession |
| **Ownership completeness** | % of Goals with a live, in-tenant owner (0 orphans = 100%) | `ownerRef` resolution |
| **Dependency risk** | Count of blocked-by-dependency Goals and longest blocking chain | dependency graph + health |

These feed the Executive/Director/Department dashboards (Identity §10 pattern). All computed from Goal's own records, progress history, and Mission references — no external inference.

---

## 12. Failure Scenarios

At least the following failure modes and the system's deterministic reaction. Governing rule: **Goals fail closed** — on ambiguity they refuse to advance, preserve state, and never assert an outcome they cannot support.

1. **Goal with no Mission reference.** Rejected at submission. `missionRef` is mandatory; orphaned intent never activates.
2. **Goal citing a non-existent/other-tenant Mission.** Rejected — `missionRef` must resolve in the same tenant.
3. **Goal with no success metric.** Cannot leave `draft`. Measurability is structural.
4. **Goal with no owner.** Rejected — `ownerRef` mandatory; no unaccountable outcomes.
5. **Goal with no review cadence.** Rejected — `reviewCycle` mandatory.
6. **Progress recorded beyond target.** Clamped to 100%-of-target and flagged; over-achievement is never stored as > criteria. Owner prompted to redefine the Goal if the target is truly exceeded.
7. **Goal contradicts Mission principle.** `GoalDriftDetected` raised; approval blocked (at submission) or execution blocked and escalated (if arising later). Never auto-resolved in the Goal's favor.
8. **Goal requires violating law/compliance/approved policy.** Hard stop. Cannot approve; if arising later, downstream execution blocks and a human must resolve. Protective operations continue regardless.
9. **Mission superseded under an active Goal.** Goal flagged for re-derivation (`stale-derivation`); it is not silently honored against dead purpose, nor auto-invalidated — re-validated against the new Mission version.
10. **Child Goal contradicts parent.** Rejected at validation; a child may refine but never contradict its parent.
11. **Circular Goal hierarchy or dependency.** Rejected by acyclicity check at write time.
12. **Blocked dependency never resolves.** Goal holds `goalHealth=blocked` while remaining `goalLifecycleStatus=active`; dependency-risk KPI and Governance signals escalate. Health-`blocked` never auto-archives or auto-supersedes — retiring it requires a governed lifecycle transition.
13. **Owner leaves with Goal still active.** `GoalOwnershipReassigned` to an active in-tenant owner before the prior owner is archived; Goal never orphaned.
14. **Agent owns a Goal beyond its human owner's authority.** Rejected — agent Goal ownership is bounded by the human ceiling.
15. **Attempt to reactivate an archived Goal.** Refused. Reviving an outcome is a new Goal, not a resurrection; archived is terminal.
16. **Attempt to edit a superseded Goal.** Refused — superseded Goals are immutable.
17. **Concurrent redefinition (two successors).** Only one supersession wins the atomic flip; the second finds the base no longer current and is refused, rebased on the new version. No forked lineage.
18. **Goal past review cadence, never reviewed.** `GoalReviewMissed` raised; health degrades; repeated misses escalate to Governance. Stale outcomes are surfaced, not tolerated.
19. **Goal claims achievement without meeting criteria.** Refused — `achieved` requires the success criteria predicate to be satisfied and verified; unverified achievement is blocked.
20. **Goal tries to schedule or own a Task.** Structurally impossible — no such edge exists. Realization is only via produced Plans.
21. **Goal tries to execute directly.** Structurally impossible — Goals have no execution surface; the request is rejected as a layer violation.
22. **Progress reading with no actor.** Rejected — every reading carries an `actorRef`; anonymous progress is impossible.
23. **Dependency on an archived/achieved Goal.** Allowed only as `informs`; a `blocks-*` dependency on a terminal Goal is resolved or flagged, never leaves the dependent perpetually blocked.
24. **Audit/event write failure on a Goal mutation.** Transactional emission rolls back the mutation; no un-audited Goal change commits.
25. **Strategic Goal with a non-null parent.** Rejected — `scope=strategic` requires `parentGoalId = null` (derives directly from Mission).
26. **Health value set on a draft/proposed/terminal Goal.** Rejected and coerced to `unknown` — health exists only for `approved`/`active` Goals.
27. **Attempt to move lifecycle because health changed.** Refused. `at-risk`/`blocked` do not transition lifecycle; only a governance-ruled action (redefine, archive, achieve) moves `goalLifecycleStatus`. Auto-archiving an at-risk Goal, or auto-achieving an on-track one, is a layer violation.
28. **Terminal Goal still showing active health.** Structurally impossible — reaching `achieved`/`superseded`/`archived` clears `goalHealth` to `unknown` and freezes it. A stale `on-track` on a closed Goal cannot occur.
29. **Health recompute with unresolved inputs.** Yields `unknown`, never a stale positive; a missing metric/dependency signal never silently reads as `on-track`.

---

## 13. Enterprise Use Cases

Behavior of Goals in real enterprise situations. In every case Goals mutate only outcome/hierarchy/progress edges and emit events; Plans and downstream layers react.

1. **Annual strategy setting.** Leadership ratifies Mission (doc 35), then approves a set of strategic Goals deriving from it (revenue, market, quality). Each is measurable, owned, review-cadenced.
2. **Cascading a strategic Goal.** "€5M DTC revenue" cascades into department Goals (Sales pipeline, Marketing acquisition, Ops fulfillment), each a measurable contribution with its own owner.
3. **Department planning.** A department director owns a department Goal and hands its outcome to the Plan layer, which decomposes it into approaches — the Goal never plans the work.
4. **Team-level objective.** A Sales team Goal ("book 200 qualified demos/quarter") refines the department Goal; the team lead owns it.
5. **Operational near-term outcome.** "Launch EU webstore by 2026-03-31" — an operational Goal that produces a Plan; Tasks and Workflows live below the Plan, never under the Goal.
6. **Agent-owned Goal.** An SDR agent owns "raise reply rate to 12%," bounded by its human director's authority; it records progress and drives the produced Plan, never executing the Goal itself.
7. **Mid-year pivot.** Mission is re-ratified; active Goals are re-validated against the new version. Aligned Goals continue; misaligned ones raise drift and are redefined or archived.
8. **Goal at risk.** Progress trend and falling confidence flip a Goal to `at-risk`; `GoalAtRisk` alerts owner and director to intervene via new Plans/Decisions.
9. **Goal blocked by dependency.** "Launch webstore" is blocked until "EU VAT registration" (a dependency Goal) is achieved; the block is explicit and tracked.
10. **Goal achieved.** Success criteria met and verified → `achieved`; the outcome is closed and reported; its Plans wind down.
11. **Goal redefined.** A target proves mis-set; the owner redefines metrics/targets → new `goalVersion` by supersession; downstream Plans re-derive.
12. **Goal abandoned.** A strategy is dropped; the Goal is `archived` (terminal). A later revival is a brand-new Goal, not a reactivation.
13. **Cross-department dependency.** A Marketing Goal `informs` a Sales Goal; the dependency is declared, visible, and drift-checked.
14. **Multi-organization company.** Each organization holds scoped strategic Goals localizing company Goals under its sub-mission, all aligned beneath the one company Mission.
15. **Quarterly review cadence.** Every Goal's `reviewCycle` drives `GoalReviewDue`; a missed review degrades health and signals Governance.
16. **Regulatory constraint on an outcome.** A Goal ("expand to market X") is checked against compliance/policy; if it would require violating an approved policy, it cannot approve until a human resolves the conflict.
17. **Executive rollup.** The Executive Dashboard reads attainment, on-track ratio, at-risk exposure, and drift across all Goals — the company's outcome health at a glance.
18. **Ownership handoff.** A director departs; their Goals' ownership is reassigned to an active in-tenant owner before archival; nothing is orphaned.
19. **Confidence-driven escalation.** Owner-reported confidence drops below threshold even while raw progress looks fine; the Goal flips to `at-risk` and escalates — leading indicators are honored, not just lagging ones.
20. **Over-achievement.** A Goal's metric blows past target; progress is clamped at 100%-of-criteria and the owner is prompted to set a new, higher Goal rather than record impossible over-completion.
21. **Portfolio prioritization.** Goals carry `priority`; Governance and leadership rebalance which Goals get Plan/execution capacity, without editing the Goals' definitions.
22. **Long-lived strategic Goal.** A multi-year Goal persists across many superseded Plans and review cycles; the Goal endures while the Plans beneath it churn.
23. **Assumption invalidated.** A declared assumption fails; the risk materializes; the Goal flips to `at-risk` and is redefined or re-planned. Assumptions and risks were declared up front, so the failure is anticipated, not surprising.
24. **Simulation before commitment.** Before a Mission exists (or for what-if planning), Goals may be drafted and modeled but not drive live execution — mirrors Mission's no-North-Star posture.
25. **Audit of outcomes.** An auditor reads the full, permanent Goal history: every outcome the company pursued, its progress series, who owned it, and how it ended — immutable and exportable.
26. **M&A goal reconciliation.** Two merged companies keep their own Goals per tenant; overlapping outcomes are reconciled by redefining/superseding within each tenant, never by sharing Goal ownership across tenants.
27. **Board-mandated outcome.** A new board target enters as a strategic Goal under the current Mission, measurable and owned, and cascades down like any other.

---

## 14. Extensibility

How Goals absorb future demands **without redesign**, because the core abstractions were chosen as extension points.

- **Richer metrics.** Success metrics can gain weighting, composite formulas, or externally-sourced values without schema change — they are structured entries the Goal versions with.
- **Automated progress.** Progress readings can move from manual to system-fed (telemetry, integrations) behind the same append-only reading contract; the model is unchanged.
- **Predictive health.** `on-track/at-risk` classification can evolve from threshold rules to forecasting models; the health sub-states and events stay stable.
- **OKR / framework mapping.** Objectives-and-Key-Results, KPIs, or other frameworks map onto Goal + Success Metrics as a presentation over the same primitives; no new module.
- **Goal templates / marketplace.** Standard industry Goals are draft `goals` rows a company adopts and approves; no new primitive.
- **Portfolio optimization.** Priority + dependency + confidence already give a solver everything needed to optimize allocation; the optimizer is a consumer, not a schema change.
- **Cross-tenant goal alignment (holdings).** Explicit, governed reference links between per-tenant Goals can be added as typed edges — never shared ownership — preserving isolation.
- **AI-driven goal proposal.** Agents already propose Goals as first-class actors; the author/owner/approver split keeps AI-proposed outcomes safe by construction.

The invariant enabling all of the above: **outcomes are measurable and versioned; derivation to Mission is explicit; progress is append-only and clamped; the produce-Plans-only boundary isolates strategy from execution.** New demands plug into these seams without touching the layer boundaries.

---

## 15. Architectural Principles

The permanent design principles governing Goals. If a future request conflicts with one of these, the request is wrong, not the principle.

1. **No Goal without a Mission.** Every Goal derives from exactly one Mission version. Orphaned intent is forbidden.
2. **Every Goal is measurable.** Metrics, targets, success criteria, and a review cadence are structural requirements, not aspirations.
3. **Every Goal is owned.** Exactly one accountable owner per Goal. Ownerless outcomes are governance failures.
4. **Goals define outcomes, never work.** Goals never execute, never schedule, never own Tasks. They produce Plans; Plans decompose into Tasks; Workflows orchestrate; Execution runs.
5. **Goals are subordinate.** Precedence is absolute: Law → Security/Compliance → Approved Policy → Mission → Goals → Plans → Tasks → Workflows → Execution. Goals never override Mission or Policy; conflicts block and require explicit human resolution.
6. **Alignment is continuous.** A Goal's Mission alignment is re-validated on Mission change and on review; drift raises Governance events, never silent divergence.
7. **Progress cannot exceed success criteria.** Over-target readings are clamped and flagged. A Goal reports at most the achievement it was defined to reach.
8. **History is permanent and terminal states are final.** Archived Goals never reactivate; superseded Goals stay immutable; every state change and reading is retained forever.
9. **Author proposes, authority approves, owner is accountable.** These three roles are distinct and, where policy requires, independent.
10. **Long-lived and strategic.** Goals endure across many Plans and cycles. They are durable objects, not tasks — the churn lives below them.
11. **Lifecycle and health are separate axes.** Lifecycle is *governed existence* (draft→…→archived) and moves only by governance-ruled transitions. Health is *observed condition* (unknown/on-track/at-risk/blocked), applies only to approved/active Goals, updates automatically from metrics/risks/dependencies/review, and **never** causes a lifecycle transition. Observation informs; governance decides.

---

## 16. What Goals will NEVER do

Explicit boundaries to prevent responsibility creep. If a future request asks Goals to do any of these, the answer is: it belongs to another module.

- **Never execute work.** No command, no provider call, no run. Goals are desired outcomes, not actions.
- **Never schedule work.** No timing, sequencing, or orchestration of work. That is Plans/Tasks/Workflows.
- **Never own Tasks.** Tasks decompose Plans, never Goals. There is no Goal→Task edge.
- **Never produce Actions — only Plans.** A Goal hands the Plan layer an outcome; it never enumerates or runs steps.
- **Never set, amend, or override Mission.** A Goal only references a ratified Mission version.
- **Never override Law, Security/Compliance, or Approved Policy.** Goals are subordinate to the whole authority stack; conflicts block and escalate to a human.
- **Never exist without a Mission, an owner, a metric, or a review cadence.** All four are structural requirements.
- **Never record progress beyond its success criteria.** Over-achievement is clamped and flagged, never stored as > 100% of target.
- **Never reactivate once archived, nor mutate once superseded.** Terminal states are final; revival is a new Goal.
- **Never mutate without an actor and an audit record.** Anonymous or un-audited outcome change is structurally impossible.

---

*End of Goal Specification v1.0. This document specifies the Goal module — the measurable, owned, Mission-derived outcome layer beneath Mission and above Plans — in full and defines its permanent boundaries. No implementation code. No SQL. No TypeScript. No other specification modified.*
