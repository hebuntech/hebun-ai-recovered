# Command Specification v1.0

> Stage 7 — Command module, complete Enterprise Architecture Specification.
> This document is the permanent architectural reference for Commands in Hebun AI.
> It specifies the universal execution instruction, beneath Workflows and above Execution. It adds no implementation. It defines boundaries.

**Status:** Definitive · **Scope:** Command module only · **Grounded in:** the schema primitives in `src/db/schema/_base.ts` (`rootColumns`, `tenantColumns`) and `_enums.ts` (`lifecycleStatusEnum`, `approvalStateEnum`, `commandStatusEnum`, `commandSourceEnum`, `executionStatusEnum`, `providerStatusEnum`, `roleTypeEnum`, `permissionScopeEnum`), the Identity (doc 34), Mission (doc 35), Goal (doc 36), Plan (doc 37), Task (doc 38), and Workflow (doc 39) Specifications v1.0.

**Position in the cognitive hierarchy:**

```
Mission → Goal → Plan → Task → Workflow
                                  → Command   ← this document — universal EXECUTABLE INSTRUCTION; one action
                                    → Execution  — the ONLY layer that PERFORMS the action against a Target
```

**Authority precedence (unchanged, absolute):**

```
Law → Security/Compliance → Approved Policy → Mission → Goals → Plans → Tasks → Workflows → Commands → Execution
```

Commands are the **universal execution instruction** of Hebun. A Workflow *coordinates* work and emits Commands; a Command is the single, immutable, idempotent, provider-agnostic **expression of exactly one executable action** — and Execution is the only layer that *performs* it against a Target. A Command **describes one executable action**; it never orchestrates, never decides, never performs itself, and never carries business intent.

**Critical clarification — a Command is an abstraction, not a target action:**

> A Command is **NOT** an API call. A Command is **NOT** an LLM request. A Command is **NOT** a Browser action. A Command is **NOT** an MCP Tool call. A Command is **NOT** a Human task.
>
> Those are **Execution Targets**. A Command is the **universal abstraction** that names *a Target, a Target Type, and a payload*, and is **executed by the Execution layer** against that Target. The same Command shape expresses "call this API," "invoke this LLM," "click this browser element," "run this MCP tool," or "ask this human" — the difference is only the `target` / `targetType`, never a different kind of object.

---

## 1. Purpose

### Why the Command layer exists

Workflows (doc 39) coordinate Tasks into a deterministic orchestration and must, at each node, produce something concrete to be *performed*. But if each node reached directly for an API client, an LLM SDK, a browser driver, or an MCP tool, the platform would have as many execution shapes as there are targets — untestable, unreplayable, unauditable, provider-locked, and impossible to simulate uniformly. Something must express *one executable action* in a single, universal, provider-agnostic, immutable, idempotent shape — so that every action, regardless of target, is validated, queued, simulated, replayed, and audited identically. Commands are that layer.

Commands are the **system of record for every executable action the company will perform.** A Command is the atom of execution intent: one target, one action, one payload, one expected result, one idempotency key, one correlation to the orchestration that produced it. It is the last purely-descriptive object before pure performance — the universal instruction the Execution layer picks up and runs, whatever the target underneath.

Without a Command layer, six things break: heterogeneity (every target has a bespoke execution path), non-replayability (no immutable instruction to replay), non-idempotency (retries double-execute), non-simulatability (no uniform dry-run), provider lock-in (orchestration bound to SDKs), and audit gaps (no single atomic record of "what action was performed, against what, with what payload"). Commands close that gap and hold the **instruction boundary**: everything above (through Workflows) *coordinates*; a Command *expresses one action*; Execution *performs it*.

### Business problem it solves

1. **Universal executable abstraction.** Every action — API, LLM, browser, MCP tool, database, human ask, robot — must be expressible in one uniform, provider-agnostic instruction, so the platform reasons about, gates, and audits all execution identically.
2. **Determinism, idempotency, replay.** Execution must be safe to retry and reproducible for audit. Commands are deterministic (same payload ⇒ same intended effect), idempotent (an idempotency key makes re-delivery a no-op), and replayable (immutable instructions can be re-run or re-simulated).
3. **Simulation and correlation.** Any action must be dry-runnable without side effects, and every action must trace back to the exact Workflow node, Task, Plan, Goal, and Mission that produced it. Commands carry a simulation mode and a correlation ID for both.

### Its responsibility

- Own the lifecycle of every executable instruction: `created → validated → queued → released → accepted → executing → completed | failed | cancelled | expired → superseded → archived` (governed), separate from health `unknown → healthy / degraded / blocked` (observed).
- Guarantee every Command belongs to exactly one Workflow (and a Workflow node) and one Task, inheriting Plan/Goal/Mission context, and expresses **exactly one** executable action against **exactly one** Target.
- Guarantee every Command is immutable, idempotent (idempotency key), deterministic, serializable/transportable, provider-agnostic, correlated (correlation ID), and carries its execution/provider constraints, timeout/retry policy, expected result, simulation mode, and approval reference.
- Provide the **uniform instruction** the Execution layer consumes — Execution resolves the Target and performs the action; the Command never performs it.
- Emit Command events so Execution, Governance, and dashboards react to instruction status and drift.
- Preserve an immutable, versioned, forever-auditable trail of every Command.

### What is explicitly NOT its responsibility

- **Commands never perform themselves.** A Command is an instruction; the Execution layer performs it against the Target.
- **Commands never orchestrate.** No sequencing, branching, parallelism, or coordination — that is Workflows. A Command is exactly one action; it never contains another Command.
- **Commands never decide or reason.** No business rules, no planning, no branching logic. A Command expresses a fixed action; judgment lives in Reasoning and the layers above.
- **Commands never carry business intent.** Intent lives in Mission/Goal/Plan/Task/Workflow. A Command carries an *executable action and its payload*, correlated up the chain — not the *why*.
- **Commands never bind to a specific provider SDK.** `targetType` names a *kind* of target; Execution + the Provider/Tool Registry resolve the concrete provider. Commands are provider-agnostic by construction.
- **Commands never override the authority stack.** Subordinate to Workflow, Task, Plan, Goal, Mission, Approved Policy, Security/Compliance, and Law.

---

## 2. Mental Model

If a Workflow is the **conductor** cueing entrances, a Command is a **single, sealed instruction card** handed to the orchestra's runner — "play this exact note on this exact instrument" — written in one universal notation whether the instrument is a violin (API), a voice (human), or a synthesizer (LLM). The card is identical in form for every instrument; only the *addressee* differs. The card is sealed (immutable), stamped once (idempotency key), traceable to the score bar it came from (correlation ID), and can be handed again to reproduce the same note (replay) or mimed silently for rehearsal (simulation). The runner (Execution) plays it; the card plays nothing.

The mental model in one line: **A Command is the universal, immutable, idempotent, deterministic, provider-agnostic expression of exactly one executable action against exactly one Target — emitted by a Workflow node, correlated to its full cognitive lineage, carrying its own constraints, and performed only by the Execution layer.**

Eight properties define the model:

- **Universal.** One shape expresses every action — API, LLM, MCP tool, browser, database, queue, webhook, email, file system, OS, scheduler, external SaaS, human, robot. The Target and Target Type vary; the object does not.
- **Singular.** Exactly one action per Command. A Command never contains, nests, or sequences another Command. Composition is the Workflow's job, not the Command's.
- **Immutable.** Once created, a Command's instruction is frozen. Changing an action means a new Command (or a new version by supersession), never an in-place edit. This is what makes replay and audit trustworthy.
- **Idempotent.** Every Command carries an idempotency key. Re-delivery of the same key is a safe no-op — the action is performed at most once despite retries or duplicate dispatch.
- **Deterministic.** Given its payload and Target, a Command's intended effect is fixed and reproducible. No branching, no randomness, no hidden reasoning inside the Command.
- **Transportable & serializable.** A Command is a self-contained, serializable instruction that can cross process/host/queue boundaries unchanged — enabling remote and async execution.
- **Correlated.** Every Command carries a correlation ID and references its Workflow node, Task, Plan, Goal, and Mission — fully traceable up the cognitive chain and across a distributed run.
- **Bounded, not sovereign.** A Command is subordinate to its Workflow, Task, Plan, Goal, Mission, Approved Policy, Security/Compliance, and Law. It expresses only actions those layers permit and the emitting Workflow node was authorized to produce.

Commands sit **beneath Workflows in authority and above Execution in production.** A Workflow node hands a Command a single action to instruct; the Command hands Execution a complete, self-contained, provider-agnostic instruction to perform. Commands are the hinge between *coordinated intent* (Workflow) and *performed action* (Execution) — and they are exclusively about *expressing one executable action*, never *performing, coordinating, or deciding*.

---

## 3. Core Domain Objects

Commands introduce one primary entity and a set of supporting objects. All reuse the existing column contracts from `_base.ts`:

- **`rootColumns`**: `id`, `createdAt`, `createdBy`, `updatedAt`, `updatedBy`, `version`, `lifecycleStatus`, `deletedAt`.
- **`tenantColumns`** = `rootColumns` + `tenantId` (FK → `companies.id`, NOT NULL).

`createdBy` resolves to an **actor reference** per Identity §3.9 — for Commands this is typically the Workflow's owning/acting actor (`commandSourceEnum` records the source channel: `ui | voice | system | scheduler | api`). No Command is created without a resolved actor and an emitting Workflow node.

Note on enums: the existing `commandStatusEnum` (`queued | running | completed | cancelled | failed | simulated`) is the coarse run-facing projection. This specification defines the richer governed `commandLifecycleStatusEnum` (§6); the projection is noted in §6. `executionStatusEnum` describes the Execution run itself (Execution Specification, doc 41).

---

### 3.1 Command

- **Purpose.** The universal, immutable, single-action executable instruction. The primary object of this module.
- **Table.** `commands` (`tenantColumns`).
- **Conceptual fields** (the full anatomy — see §5):
  - `id` — Command ID.
  - `tenantId` — owning company (Identity §3.1).
  - `workflowRef` — `{workflowId, workflowVersion}` — the emitting Workflow. Required.
  - `workflowNodeRef` — the exact node that emitted this Command. Required.
  - `taskRef` — `{taskId, taskVersion}` — the Task realized. Required.
  - `planRef`, `goalRef`, `missionRef` — inherited cognitive lineage. Required.
  - `target` — the concrete addressee reference (an agent id, a human id, a provider/tool handle, an endpoint) resolved via registries. Required.
  - `targetType` — `commandTargetTypeEnum` (§3.2): `agent | human | llm | mcp-server | browser | api | database | queue | webhook | email | file-system | operating-system | scheduler | external-saas | robot`.
  - `executionType` — `commandExecutionTypeEnum` (§3.3): `local | remote | async | sync | event | scheduled | interactive | human`.
  - `payload` — the deterministic, serializable action data (typed). Required.
  - `expectedResult` — the typed result contract the action must satisfy. Required.
  - `executionConstraints` — bounds on how the action may run (rate, window, data-handling, environment posture).
  - `providerConstraints` — constraints on provider resolution (allowed/forbidden providers, region, model tier) — provider-agnostic selection rules, not a bound SDK.
  - `timeoutPolicy` — `{duration, onTimeout ∈ {fail, retry, escalate}}`. Required.
  - `retryPolicy` — `{maxAttempts, backoff, retryOn}` — safe because idempotent. Required.
  - `priority` — `commandPriorityEnum`: `critical | high | medium | low`.
  - `correlationId` — the correlation key threading this Command through its run and lineage. Required.
  - `idempotencyKey` — the key guaranteeing at-most-once effect. Required, unique per logical action.
  - `executionContext` — the resolved context Execution needs (tenant, actor, environment, permissions snapshot reference) — carried, not computed here.
  - `simulationMode` — whether this Command is `live | dry-run | simulation` (aligned to `providerStatusEnum`). Required.
  - `approvalRef` — reference to the approval that authorized this action, where required (reuses `approvalStateEnum`).
  - `commandLifecycleStatus` — governed lifecycle (`commandLifecycleStatusEnum`, §6).
  - `commandHealth` — health (`commandHealthEnum`, §6): `unknown | healthy | degraded | blocked`.
  - `commandVersion` — immutable version counter (distinct from row `version`).
  - `supersedesCommandId` — nullable FK → prior version.
  - base lifecycle/audit fields (audit metadata — forever-retained).
- **Required.** `tenantId`, `workflowRef`, `workflowNodeRef`, `taskRef`, `planRef`, `goalRef`, `missionRef`, `target`, `targetType`, `executionType`, `payload`, `expectedResult`, `timeoutPolicy`, `retryPolicy`, `correlationId`, `idempotencyKey`, `simulationMode`, `commandLifecycleStatus`. (`commandHealth` defaults `unknown`.)
- **Optional.** `executionConstraints`, `providerConstraints`, `priority` (defaults `medium`), `approvalRef` (where not required), `supersedesCommandId`.
- **Immutability.** Once `created`/`validated`, the instruction fields are frozen; correcting an action means a new Command version.
- **Ownership.** Owned by exactly one company; emitted by exactly one Workflow node; realizing exactly one Task; targeting exactly one Target.
- **Example.** Workflow node "translate checkout" → Command: `targetType=llm`, `target=<model-handle>`, `executionType=async`, payload `{system, prompt, glossary}`, expectedResult `{de-DE bundle schema}`, `simulationMode=live`, `idempotencyKey=wf42.n3.translate.v1`, `correlationId=run-88ac`, `taskRef {t7,v1}`.

### 3.2 Target & Target Type

- **Purpose.** Declares *what kind of addressee* performs the action and *the concrete addressee*. The Target Type is the sole thing that varies between "an API call," "an LLM request," "a browser action," "an MCP tool call," and "a human task" — the Command object is otherwise identical.
- **Realization.** `commandTargetTypeEnum` (specified): `agent | human | llm | mcp-server | browser | api | database | queue | webhook | email | file-system | operating-system | scheduler | external-saas | robot`. `target` is the concrete handle resolved via the **Provider Registry** / **Tool Registry** / **Agent Registry** / Identity (for human targets) at execution time.
- **Rule.** The Command names the Target Type and a *resolvable handle*; it never embeds a provider SDK or a concrete transport. Execution + the registries resolve the handle to a live provider/tool. This is the **provider / LLM / MCP / browser / human / external-API abstraction**: one Command shape, many target kinds, zero provider lock-in.

### 3.3 Execution Type

- **Purpose.** Declares the *shape of performance* Execution must use — local vs remote, sync vs async, event/scheduled/interactive/human — without the Command performing anything.
- **Realization.** `commandExecutionTypeEnum` (specified): `local | remote | async | sync | event | scheduled | interactive | human`.
- **Rule.** A descriptor consumed by Execution; it never means the Command runs.

### 3.4 Idempotency Key (idempotency architecture)

- **Purpose.** Guarantees a Command's action is performed **at most once** despite retries, duplicate dispatch, or replay. The core of safe recovery.
- **Realization.** `idempotencyKey` is unique per logical action (derived deterministically from `{workflowNodeRef, taskRef, payload-hash, attempt-scope}`). Execution consults the key before performing: if a completed effect already exists for the key, the perform is skipped and the prior result returned. Retries reuse the key; a *new intended effect* requires a *new key* (hence a new Command).
- **Rule.** No Command without an idempotency key. Retry safety is a property of the Command, not of Execution's luck.

### 3.5 Correlation ID (correlation architecture)

- **Purpose.** Threads a Command through its distributed run and its full cognitive lineage — so every performed action is traceable to the Workflow node, Task, Plan, Goal, and Mission that caused it, and to sibling Commands of the same run.
- **Realization.** `correlationId` is assigned at emission and propagated to Execution, provider calls, logs, and audit. Combined with `workflowRef`/`taskRef`/…/`missionRef`, it gives end-to-end traceability across processes and hosts.
- **Rule.** No Command without a correlation ID. Traceability is structural.

### 3.6 Simulation Mode (simulation architecture)

- **Purpose.** Lets any Command be **dry-run or fully simulated without side effects**, using the identical instruction that would run live. The seam for safe testing, previews, and progressive rollout.
- **Realization.** `simulationMode ∈ {live, dry-run, simulation}` (aligned to `providerStatusEnum` and projecting onto `commandStatusEnum.simulated`). `simulation` = no target contact, synthetic result; `dry-run` = target contacted read-only/validate-only; `live` = real effect. Execution honors the mode; a Command's mode is set at emission from the Workflow/Task/Plan environment posture and **can only be narrowed** (live→dry-run→simulation), never silently widened.
- **Rule.** A non-`live` Command never produces a live side effect. Environment posture propagates down the whole stack (Mission §6, Task §7.15, Workflow §7.17) and terminates here as the Command's `simulationMode`.

### 3.7 Replay (replay architecture)

- **Purpose.** Lets an immutable Command be **re-performed or re-simulated** deterministically for recovery, testing, or audit reconstruction.
- **Realization.** Because a Command is immutable, serializable, deterministic, and idempotent, replaying it is well-defined: a *live* replay is guarded by the idempotency key (no double effect); a *simulation* replay reproduces the intended effect with no side effect. Replay never mutates the original Command; it creates a new run (or a new versioned Command referencing the original via `supersedesCommandId`/correlation) with its own audit record.
- **Rule.** Replay is a first-class, audited operation — never an in-place re-execution that rewrites history.

### 3.8 Command Version (immutable lineage record)

- **Purpose.** The permanent record of a Command's supersessions. Answers "what corrected/replaced this instruction, and which one actually performed."
- **Realization.** A superseded Command is retained immutably; its successor carries `supersedesCommandId` and an incremented `commandVersion`. **Command history and versions are immutable and auditable forever.**

---

## 4. Ownership

- **Owned by Company.** Every Command belongs to exactly one company via `tenantId`. No global commands.
- **Emitted by one Workflow node, realizing one Task.** Every Command carries one `workflowRef`+`workflowNodeRef` and one `taskRef`, inheriting `planRef`/`goalRef`/`missionRef`. **Every Command belongs to one Workflow and one Task** — mandatory and transitive. A Command has no independent existence; it is always the product of an emitting node.
- **Accountable through its lineage.** A Command does not carry its own separate "owner" the way strategic objects do; its accountability is the **acting actor of its emitting Workflow node** (recorded in `createdBy` + `commandSourceEnum`), bounded by that actor's authority. The Workflow owns the coordination; the Command is its emitted instruction.
- **Agent-emitted Commands bounded.** A Command emitted for/by an agent node may express only actions within the agent's human owner's authority and the Plan/Goal/Mission/Policy stack (agent ceiling, Identity §6).
- **No cross-tenant commands.** A Command never spans companies; its Target, if internal, is in the same tenant; if external (SaaS/API), the call is attributed to the tenant's actor/service account (Identity §3.9).

---

## 5. Command Anatomy

The complete structure of a Command, grouped by concern. Every field is declarative; none performs.

### 5.1 Identity & lineage
`id`, `tenantId`, `commandVersion`, `supersedesCommandId?`, and the full upward reference chain: `workflowRef`, `workflowNodeRef`, `taskRef`, `planRef`, `goalRef`, `missionRef`. This chain makes every Command **fully traceable to Mission** and to the exact node that emitted it.

### 5.2 Action specification
`target`, `targetType`, `executionType`, `payload`, `expectedResult`. This is the *one action*: whom to address, what kind of addressee, how to perform, with what data, and the result contract that defines success. **Exactly one action; never a nested Command.**

### 5.3 Execution governance
`executionConstraints`, `providerConstraints`, `timeoutPolicy`, `retryPolicy`, `priority`, `simulationMode`, `approvalRef?`. These bound *how* Execution may perform the action, *which* providers are eligible, *how long/how often*, at *what urgency*, in *what environment*, and *under what authorization* — all declarative rules Execution honors.

### 5.4 Determinism & safety
`idempotencyKey`, `correlationId`, `executionContext`. These guarantee at-most-once effect, end-to-end traceability, and the resolved context needed to perform — the substrate for retry, replay, simulation, and audit.

### 5.5 State & audit
`commandLifecycleStatus`, `commandHealth`, base audit metadata. Governed state, observed health, and the forever-retained immutable trail.

**Anatomy invariant:** a Command is *complete and self-contained* — Execution needs nothing beyond the Command (and the registries to resolve `target`) to perform the action. It is *serializable and transportable* — the whole instruction can cross a queue/host boundary unchanged. And it is *provider-agnostic* — no field binds a concrete SDK; only `targetType` + `providerConstraints` guide resolution.

---

## 6. Lifecycle

A Command carries **two orthogonal state dimensions** (mirroring Task/Workflow) that must never be conflated:

- **Lifecycle** (`commandLifecycleStatusEnum`) — *where the Command is in its governed existence.* Governed transitions only.
- **Health** (`commandHealthEnum`) — *how well an in-flight Command is doing.* Auto-derived; never a lifecycle transition.

Governing rule: **a Command is Workflow/Task-bound, single-action, idempotent, correlated, constraint-complete, and (where required) approved before it is released to Execution; lifecycle changes are governed; health merely observes; history and versions are immutable and auditable forever.**

### 6.1 Lifecycle dimension

**`commandLifecycleStatusEnum`** (specified): `created | validated | queued | released | accepted | executing | completed | failed | cancelled | expired | superseded | archived`.

| Lifecycle state | Meaning | Mutable? | Carries health? |
|---|---|---|---|
| **created** | Emitted by a Workflow node; instruction assembled | Limited (pre-validate) | No |
| **validated** | Passed all validation (§8); instruction frozen | No | No |
| **queued** | Enqueued for Execution per priority | No | No |
| **released** | Handed to Execution (dispatch boundary) | No | **Yes** |
| **accepted** | Execution acknowledged receipt (idempotency-checked) | No | **Yes** |
| **executing** | Execution is performing the action against the Target | No (progress only) | **Yes** |
| **completed** | Expected result satisfied (or idempotent no-op returned prior result) | No (terminal-positive) | No (health cleared) |
| **failed** | Performance failed after retry/timeout policy | No (terminal) | No |
| **cancelled** | Withdrawn before completion (governed) | No (terminal) | No |
| **expired** | Not executed within its validity window | No (terminal) | No |
| **superseded** | Replaced by a corrected Command version | No (immutable) | No |
| **archived** | Retired; terminal | No (immutable) | No |

`queued`/`released`/`executing`/`completed`/`failed`/`cancelled` and `simulationMode` project onto the existing `commandStatusEnum` (`queued | running | completed | cancelled | failed | simulated`); this governed enum is the finer superset.

**Lifecycle transitions (governed):**

| Transition | From → To | Precondition | Effect | Emits |
|---|---|---|---|---|
| **Create** | ∅ → created | Emitted by a valid, authorized Workflow node | Row created, `commandLifecycleStatus=created`, `commandHealth=unknown` | `CommandCreated` |
| **Validate** | created → validated | Passes anatomy + lineage + authority + idempotency validation (§8) | instruction frozen, `commandLifecycleStatus=validated` | `CommandValidated` |
| **Queue** | validated → queued | Execution capacity/priority resolved | `commandLifecycleStatus=queued` | `CommandQueued` |
| **Release** | queued → released | Approval (if required) `approved`; environment posture set; readiness confirmed | `commandLifecycleStatus=released`; health tracking begins | `CommandReleased` |
| **Accept** | released → accepted | Execution acknowledges; idempotency key checked (no prior effect) | `commandLifecycleStatus=accepted` | `CommandAccepted` |
| **Execute** | accepted → executing | Execution begins performing | `commandLifecycleStatus=executing` (reflects performance below) | `CommandExecuting` |
| **Complete** | executing → completed | `expectedResult` satisfied, or idempotent no-op returns prior result | `commandLifecycleStatus=completed` (terminal); health cleared to `unknown`, frozen | `CommandCompleted` |
| **Fail** | executing/accepted → failed | Retry exhausted or timeout `onTimeout=fail`; unrecoverable | `commandLifecycleStatus=failed` (terminal) | `CommandFailed` |
| **Cancel** | non-terminal → cancelled | Governed withdrawal (e.g. parent Workflow cancelled/rolled back) | `commandLifecycleStatus=cancelled` (terminal) | `CommandCancelled` |
| **Expire** | created/validated/queued/released → expired | Validity window elapsed before execution | `commandLifecycleStatus=expired` (terminal) | `CommandExpired` |
| **Supersede** | non-terminal → superseded | A corrected Command version is created | `commandLifecycleStatus=superseded`, immutable; `supersedesCommandId` set on successor | `CommandSuperseded` |
| **Archive** | terminal/non-terminal → archived | Governed retirement | `lifecycleStatus=archived`, `commandLifecycleStatus=archived` (terminal, no reactivation) | `CommandArchived` |

Every lifecycle transition is governed and audited. **Health never appears in this table** — no health value causes any transition.

### 6.2 Health dimension

**`commandHealthEnum`** (specified): `unknown | healthy | degraded | blocked`.

| Health state | Meaning | Set how |
|---|---|---|
| **unknown** | No sufficient signal yet (default; also for terminal Commands) | default / on clear |
| **healthy** | Progressing within time/retry bounds | auto |
| **degraded** | Impaired but progressing (retrying, slow provider, partial result) | auto |
| **blocked** | Cannot progress (unresolved approval, provider unavailable, dependency, rate-limited) | auto |

**Health rules:**

- **Scope.** Health applies **only** to in-flight lifecycle states (`released | accepted | executing`). Before `released` it is `unknown`; in `completed`/`failed`/`cancelled`/`expired`/`superseded`/`archived` it is cleared to `unknown` and frozen — **terminal Commands carry no active health.**
- **Automatic.** Derived from **retry counts, elapsed vs timeout, provider availability/latency, approval state, rate-limit signals.** Never manual.
- **No lifecycle effect.** **Health never changes lifecycle; lifecycle never derives from health.** A `degraded`/`blocked` Command keeps its lifecycle state; only governed transitions move it.
- **Observability, not authority.** Health drives alerts/KPIs/Governance signals; humans/Reasoning may then act.

### 6.3 Terminal-state rules

- **completed / failed / cancelled / expired** are terminal. **Archived never reactivates; completed never reactivates** — re-performing is a **replay** (new run/version, §3.7), never a resurrection of a terminal instance.
- **superseded** Commands are **immutable** and permanent. **Command versions and history are immutable and auditable forever.**
- Terminal Commands hold `commandHealth = unknown` (cleared, frozen).
- **Command history is immutable and fully traceable** to Mission — every transition, attempt, and result reference retained append-only. No history deleted (except the legal-erasure exception, Identity §13).

---

## 7. Constraints

Structural and semantic constraints, enforced by the schema and the module — not by convention.

**Structural (schema-enforced):**

1. **Workflow, node & Task references mandatory.** `workflowRef`, `workflowNodeRef`, `taskRef` NOT NULL. **Every Command belongs to one Workflow and one Task.** `planRef`/`goalRef`/`missionRef` mandatory and consistent (same chain).
2. **Exactly one Target.** `target` + `targetType` NOT NULL and singular. **Every Command has exactly one Target.**
3. **Single action; no nesting.** A Command's `payload` expresses exactly one action; a Command **never contains another Command** (no command-in-command field). Composition is rejected.
4. **Idempotency key mandatory & effect-unique.** `idempotencyKey` NOT NULL; at most one completed effect per key. **Every Command has one idempotency key.**
5. **Correlation ID mandatory.** `correlationId` NOT NULL. **Every Command has one correlation ID.**
6. **Determinism & serializability.** `payload` is deterministic and serializable; no non-serializable handles, no runtime closures, no randomness embedded.
7. **Constraint completeness.** `timeoutPolicy`, `retryPolicy`, `executionConstraints`/`simulationMode`, `expectedResult` present before `validated`.
8. **Tenant isolation.** `tenantId` NOT NULL, FK → `companies.id`.
9. **Terminal immutability.** Rows in `completed | failed | cancelled | expired | superseded | archived` reject mutation. Versions immutable; archived/completed never reactivate.
10. **Version monotonicity.** `commandVersion` strictly increases along `supersedesCommandId`; no self-supersession.

**Semantic (module-enforced):**

11. **Subordinate to the authority stack.** A Command — and its performance by Execution — may never override **Law, Security/Compliance, Approved Policy, Mission, Goal, Plan, Task, or Workflow.** Precedence fixed (header). A Command expressing a forbidden action is not validated/released; a conflict detected later blocks execution and escalates for explicit human resolution.
12. **Provider-agnostic.** No field binds a concrete provider SDK; `targetType`+`providerConstraints` guide resolution by Execution + registries. Provider lock-in is rejected.
13. **No business rules / no reasoning / no orchestration / no planning.** A Command carries an action and its payload — never conditional business logic, decisions, sequencing, or plans. Such content is rejected.
14. **Simulation cannot be widened silently.** `simulationMode` may only be narrowed relative to the emitting environment posture (live→dry-run→simulation), never widened to `live` without a governed change. A non-`live` Command never causes a live side effect.
15. **Lifecycle and health orthogonal; health scoped and derived.** Separate fields; health non-`unknown` only in-flight (`released`/`accepted`/`executing`); auto-derived; never writes lifecycle.
16. **Commands never perform, dispatch, or self-execute.** Structurally, the Command has no execution runtime, no provider transport, no self-run edge. Performance is exclusively Execution's, against the resolved Target.
17. **Replay is non-destructive.** A replay never mutates the original Command; it is a new audited run/version. Live replay is idempotency-guarded.

---

## 8. Validation

Validation runs at gates: **created → validated** (instruction), **validated → queued/released** (dispatch readiness), and **continuous** (standing checks in-flight). Commands fail closed: on ambiguity they do not advance and no ill-formed or unauthorized instruction is performed.

**Anatomy validation (created → validated):**

- Exactly one `target`+`targetType`; `executionType` consistent with `targetType` (e.g. `human` target ⇒ `human`/`interactive` execution).
- `payload` present, typed, deterministic, serializable; `expectedResult` contract present.
- `timeoutPolicy`, `retryPolicy`, `simulationMode`, `executionConstraints` well-formed.
- **No nested Command; no business rule/decision/plan content** in the payload — rejected as a layer violation.

**Lineage & context validation (created → validated and continuously):**

- `workflowRef`/`workflowNodeRef` resolve to a **released/running** Workflow and a real node that legitimately emits this Command; `taskRef` resolves; `planRef`/`goalRef`/`missionRef` match the chain.
- **Standing re-check:** on Workflow/Task/Plan/Goal/Mission change, in-flight Commands re-validate; new misalignment flags and raises `CommandDriftDetected`.

**Idempotency & correlation validation:**

- `idempotencyKey` present and effect-unique; a duplicate key with a prior completed effect resolves to no-op (returns prior result) rather than a second execution.
- `correlationId` present and consistent with the run.

**Authority-stack & permission validation (created → validated, re-checked at release):**

- The action is checked against Law/Regulation, Security/Compliance, Approved Policy, and the acting actor's permissions (Identity §6, `permissionScopeEnum`). A forbidden action **cannot be validated/released**; conflict recorded and routed for **explicit human resolution**.
- Where `approvalRef` is required, the approval is `approved` before `released`; separation of duties where required.

**Provider-constraint validation (at release):**

- `providerConstraints` resolvable to at least one eligible provider/tool via the registries for `targetType`; otherwise `blocked` health and not released.

**Simulation validation:**

- `simulationMode` is ≤ the emitting environment posture (never wider); a live-posture Command in a dry-run environment is coerced to dry-run, never the reverse.

**Health validation (continuous):**

- `commandHealth` non-`unknown` only in-flight; otherwise coerced to `unknown`.
- A health update carries no lifecycle change; unresolved health inputs yield `unknown`, never a stale `healthy`.

Only a Command passing all applicable gates advances. Failure holds it at `created`/`validated` with the violated rule recorded; ill-formed or unauthorized instructions are never performed.

---

## 9. Relationships

Commands point *up* at Workflow/Task/Plan/Goal/Mission and the authority stack; and *down* at Execution. Commands never point sideways at other Commands (no composition), never at providers directly.

| Module | Relationship to Commands |
|---|---|
| **Workflow** | **The emitter.** Every Command is produced by exactly one Workflow node (`workflowNodeRef`); Workflow §9 says Workflows "produce Commands" — this is that edge. The Workflow coordinates; the Command is its single emitted action. A Command never orchestrates or modifies its Workflow. |
| **Execution** | **The performer.** Execution consumes released Commands and performs them against the resolved Target — the only layer that runs the action, contacts a provider/LLM, and produces real effects. A Command **never performs, never dispatches**; it is the instruction Execution executes (doc 41). |
| **Task** | Bound realized unit (`taskRef`); the Command carries the Task's acceptance intent as its `expectedResult`. Never modified by the Command. |
| **Plan / Goal / Mission** | Inherited lineage (`planRef`/`goalRef`/`missionRef`) for traceability and authority; never modified. |
| **Agent Registry** | Resolves `target` for `targetType=agent` and the agent's capabilities/ceiling; a Command targeting an agent respects its bound (Identity §3.8/§6). |
| **Provider Registry** | Resolves `targetType ∈ {llm, api, external-saas, …}` + `providerConstraints` to a concrete provider **at execution time**. The Command names the *kind*; the registry + Execution pick the *instance* — the provider-agnostic seam. |
| **Tool Registry** | Resolves `targetType ∈ {mcp-server, browser, …}` to a concrete tool/transport. Same abstraction: Command names the tool kind; registry resolves it. |
| **Reasoning** | Reasoning may decide *whether/which* Command a Workflow emits and how to handle failures — but a Command itself never reasons. The Command is the fixed output of a decision, not a decision. |
| **Memory / Knowledge** | A Command may target memory/knowledge reads or writes (`targetType` + payload); the actual read/write is performed by Execution. The Command expresses it; it does not perform it. |
| **Approval** | Where required, `approvalRef` gates `released` (reuses `approvalStateEnum`); the human-authorization seam for a specific action. |
| **Execution Readiness** | A Command releases only when its lineage is ready (Workflow released, Task ready, Plan execution-ready) and its own validation passes — readiness composes down the whole chain and terminates here. |
| **Policies** | Constrain the *action's means* and rank above the Command; cited via `executionConstraints`/`providerConstraints`, never overridden. |
| **Permissions** | The acting actor's permitted actions (Identity §6) bound what a Command may express; over-ceiling actions are rejected at validation. |
| **Audit** | Every Command and every attempt writes an immutable, forever-retained audit record; fully traceable to Mission. |

**The execution spine:** `Mission → Goal → Plan → Task → Workflow → Command → Execution`. Commands are the node that turns a coordinated Workflow node into a single, universal, provider-agnostic executable instruction — stopping exactly at the Execution edge.

---

## 10. Events

Every Command mutation emits exactly one domain event. Events are the module's public reaction surface — Execution, Governance, and dashboards subscribe; they never read Command tables directly. Payloads carry `actorRef`, `tenantId`, `commandId`, `commandVersion`, `correlationId`, `idempotencyKey`, `workflowNodeRef`, `taskRef`, and `occurredAt`.

| Event | Trigger | Payload (beyond envelope) | Consumers | Business impact |
|---|---|---|---|---|
| `CommandCreated` | Emitted by a Workflow node | targetType, executionType, simulationMode | Governance, Dashboard | Executable instruction assembled |
| `CommandValidated` | Passed validation; frozen | — | Dashboard | Instruction safe to queue |
| `CommandQueued` | Enqueued for Execution | priority | Execution, Dashboard | Awaiting execution capacity |
| `CommandReleased` | Handed to Execution | executionContextRef | **Execution** | Dispatch boundary crossed; health tracking begins |
| `CommandAccepted` | Execution ack; idempotency-checked | idempotencyResult (fresh/no-op) | Execution, Dashboard | Execution owns the run |
| `CommandExecuting` | Performance underway | targetResolved (provider/tool) | Dashboard, Governance | Action being performed below |
| `CommandCompleted` | Expected result satisfied / idempotent no-op | resultRef, wasNoOp | Workflow (node completes), Reporting | Action done; health cleared |
| `CommandFailed` | Retry/timeout exhausted / unrecoverable | reason, attempts | Workflow, Governance, Reasoning | Failure surfaced; Workflow handles recovery |
| `CommandCancelled` | Governed withdrawal | reason | Workflow, Dashboard | Instruction withdrawn |
| `CommandExpired` | Validity window elapsed | window | Governance, Dashboard | Not executed in time; terminal |
| `CommandHealthChanged` | Health recomputed (in-flight only) | fromHealth, toHealth, drivers | Dashboard, Governance | Health moved; **no lifecycle change** |
| `CommandDegraded` / `CommandBlocked` | Health specializations | reason / blockingRef | Governance, Notifications | Alerts; **lifecycle unchanged** |
| `CommandRetryScheduled` | Retry queued per policy (idempotency-safe) | attemptNo, backoff | Execution, Dashboard | Safe re-attempt (idempotent) |
| `CommandTimedOut` | Timeout policy triggered | onTimeout action | Governance, Notifications | Time bound hit |
| `CommandSimulated` | Executed in dry-run/simulation | syntheticResultRef | Dashboard, Governance | Effect previewed, no live side effect |
| `CommandReplayed` | Replay run created | replaySourceId, mode | Governance, Audit | Deterministic re-run/re-sim, non-destructive |
| `CommandSuperseded` | Replaced by a corrected version | successorCommandId | Execution, Audit | Old instruction retired |
| `CommandArchived` | Retired | reason | Dashboard, Reporting | Instruction retired (no reactivation) |
| `CommandDriftDetected` | Lineage validation fails vs Workflow/Task/…/Mission | violatedRef | **Governance (high severity)**, Audit | Instruction diverging; block/escalate |

**Ordering and idempotency.** Events carry `commandVersion`, `correlationId`, and `idempotencyKey`; consumers discard stale/duplicate deliveries. Emission is **transactional with the mutation** — no event fires unless the state change committed; a failed audit/event write rolls back the mutation.

**Two independent streams.** Health events (`CommandHealthChanged` + specializations) never accompany or cause a lifecycle change; lifecycle events never carry a health transition.

---

## 11. KPIs

Command health and the company's execution-instruction performance, measured deterministically from Command rows and runs.

| KPI | Definition | Source |
|---|---|---|
| **Instruction completeness** | % of `validated`+ Commands with target, payload, expectedResult, idempotency key, correlation id, policies (target 100%) | fields + validation |
| **Lineage coverage** | % with valid workflow/node/task/plan/goal/mission refs, all consistent (target 100%) | ref resolution |
| **Execution success rate** | % `completed` vs `failed`+`cancelled`+`expired` | terminal states |
| **First-attempt success** | % completed without retry | retry counts |
| **Retry rate** | Avg retries per Command; % hitting `maxAttempts` | retry policy vs attempts |
| **Idempotency no-op rate** | % of accepts resolving to a safe no-op (duplicate detection working) | idempotency checks |
| **Timeout / expiry rate** | % hitting timeout / expiring before execution | timeout/expiry events |
| **Dispatch latency** | Median `queued → released → accepted` | lifecycle timestamps |
| **Execution latency** | Median `executing → completed` | run timestamps |
| **Simulation ratio** | % of Commands run in dry-run/simulation vs live | simulationMode |
| **Provider-agnosticism conformance** | % of Commands with no provider-bound field (target 100% by construction) | field audit |
| **Health distribution** | % of in-flight Commands `healthy` vs `degraded`/`blocked` | `commandHealth` |
| **Replay fidelity** | % of replays reproducing the original intended effect deterministically | replay outcomes |
| **Drift rate** | Rate/severity of `CommandDriftDetected` | drift events |
| **Traceability completeness** | % of Commands with an unbroken audit chain to Mission (target 100%) | audit chain |

These feed the Executive/Director/Department dashboards (Identity §10 pattern). All computed from Command's own records — no external inference.

---

## 12. Failure Scenarios

At least the following failure modes and the system's deterministic reaction. Governing rule: **Commands fail closed and at-most-once** — on ambiguity they refuse to advance, and idempotency guarantees no double effect.

1. **Command with no Workflow node / Task.** Rejected — a Command cannot exist without an emitting node and a Task.
2. **Command with zero or multiple Targets.** Rejected — exactly one Target is mandatory.
3. **Nested Command (command-in-command).** Rejected — a Command never contains another Command.
4. **Command missing idempotency key.** Rejected — no Command without a key; retry safety is structural.
5. **Duplicate delivery of the same idempotency key with a prior completed effect.** Resolved to a safe no-op returning the prior result — **at-most-once effect**, never a second execution.
6. **Command missing correlation id.** Rejected — traceability is structural.
7. **Non-deterministic / non-serializable payload.** Rejected — embedded randomness, closures, or non-serializable handles violate determinism/transportability.
8. **Payload contains business rules / decisions / orchestration / a plan.** Rejected as a layer violation — Commands express one action only.
9. **Command expresses a forbidden action (law/compliance/policy/permission).** Hard stop — cannot validate/release; if detected later, execution blocked and a human resolves. Protective operations (Mission §7.8) continue regardless.
10. **Provider-bound field present.** Rejected — Commands are provider-agnostic; provider resolution is Execution's via registries.
11. **No eligible provider/tool for the target type.** `blocked` health; not released; escalates until a provider is available.
12. **Non-`live` Command attempts a live side effect.** Refused — `simulationMode` caps effect; a simulation/dry-run Command never contacts the target live.
13. **Attempt to widen simulation to live without governance.** Refused — mode may only be narrowed; widening requires a governed change (new Command).
14. **Retry exhausted.** After `maxAttempts` the Command `fail`s (terminal); each retry reuses the idempotency key so no partial double effect; `CommandFailed`; the Workflow decides recovery.
15. **Timeout hit.** `timeoutPolicy.onTimeout` applies deterministically; `CommandTimedOut`; no indefinite hang.
16. **Validity window elapses before execution.** `expired` (terminal); never executed late/stale.
17. **Provider succeeds but ack lost (uncertain outcome).** Idempotency key + expected-result check on replay resolves it: a replay finds the prior effect and no-ops, or safely completes — never a blind double-perform.
18. **Partial provider failure mid-action.** Execution reports failure; the Command `fail`s; the Workflow's rollback/compensation handles cross-action consistency (Workflow §3.7) — the Command itself never half-commits business state (it holds none).
19. **Attempt to edit a validated/terminal/superseded Command.** Refused — immutable once validated; versions immutable.
20. **Attempt to reactivate a completed/archived Command.** Refused — re-performing is a replay (new run/version), never a resurrection.
21. **Concurrent supersession (two successors).** One wins the atomic flip; the second rebases; no forked lineage.
22. **Health set on a non-in-flight Command.** Rejected, coerced to `unknown`.
23. **Attempt to move lifecycle because health changed.** Refused — health never transitions lifecycle.
24. **Terminal Command showing active health.** Structurally impossible — terminal clears health to `unknown`, frozen.
25. **Command attempts to perform/dispatch itself.** Structurally impossible — no execution runtime, no transport, no self-run edge. Rejected as a layer violation.
26. **Command attempts to orchestrate / sequence / branch.** Rejected — orchestration is the Workflow's; a Command is one action.
27. **Command attempts to modify Workflow/Task/Plan/Goal/Mission.** Refused — Commands reference and inherit; never mutate upward.
28. **Workflow/Task revised under an in-flight Command.** `CommandDriftDetected`; the Command is blocked/cancelled and re-emitted from the new version rather than performing stale.
29. **Agent-emitted Command exceeds the agent's ceiling.** Rejected — bounded by the agent's human owner's authority.
30. **Replay attempts to rewrite the original.** Refused — replay is non-destructive; it creates a new audited run/version.
31. **Rate-limit from the provider.** `degraded`/`blocked` health; retry per policy with backoff; never a silent drop; escalates if persistent.
32. **Audit/event write failure on a Command mutation.** Transactional emission rolls back the mutation; no un-audited Command change commits — the forever-audit guarantee holds.

---

## 13. Enterprise Use Cases

Behavior of Commands in real enterprise situations. In every case the Command expresses one action and Execution performs it; upstream is never mutated. **Every example is the same object — only `target`/`targetType` differ.**

1. **LLM Command.** `targetType=llm`: "generate de-DE translation" — payload is the prompt+schema; Execution resolves a model provider via the registry; the Command names no SDK.
2. **API Command.** `targetType=api`: "POST order to ERP" — payload is the request contract; Execution resolves the concrete endpoint/credentials.
3. **MCP tool Command.** `targetType=mcp-server`: "run `search_customers` tool" — payload is the tool input; Execution resolves the MCP server via the Tool Registry.
4. **Browser Command.** `targetType=browser`: "click checkout, fill form" — payload is the action script; Execution drives the browser tool.
5. **Human Command.** `targetType=human`, `executionType=human`: "review and sign the translated ToS" — Execution surfaces it to the assigned human; completion by their action.
6. **Database Command.** `targetType=database`: "upsert product rows" — payload is the parameterized operation; Execution performs it transactionally.
7. **Queue Command.** `targetType=queue`: "enqueue fulfillment message."
8. **Webhook Command.** `targetType=webhook`: "notify partner endpoint."
9. **Email Command.** `targetType=email`: "send order confirmation."
10. **File-system Command.** `targetType=file-system`: "write export bundle."
11. **OS Command.** `targetType=operating-system`: "run backup script" (constrained, approval-gated).
12. **Scheduler Command.** `targetType=scheduler`: "register nightly job."
13. **External-SaaS Command.** `targetType=external-saas`: "create HubSpot contact" — via a service account.
14. **Robot Command.** `targetType=robot`: "pick SKU from bin 12" — the same abstraction reaches physical actuation.
15. **Agent Command.** `targetType=agent`: "delegate research to `ResearchAgent`" — bounded by the agent's ceiling.
16. **Idempotent retry.** A transient API failure retries with the same idempotency key; the order is created exactly once despite three attempts.
17. **Uncertain outcome recovered.** A payment Command's ack is lost; replay finds the prior effect via the idempotency key and no-ops — no double charge.
18. **Dry-run preview.** A `bulk-email` Command runs `dry-run`: recipients validated, nothing sent; the operator reviews before promoting to a new `live` Command.
19. **Full simulation.** A migration Workflow runs entirely in `simulation`: every Command produces synthetic results, zero side effects, for rehearsal.
20. **Deterministic replay for audit.** An auditor replays a completed Command in `simulation` and reproduces the identical intended effect from the immutable instruction.
21. **Approval-gated action.** A "delete customer data (GDPR)" Command carries `approvalRef`; without an `approved` approval it never reaches `released`.
22. **Correlation across a distributed run.** One Workflow's Commands share a `correlationId`; a support engineer traces a failed order end-to-end across providers, hosts, and logs.
23. **Provider swap without change.** The LLM provider is switched in the registry; existing `targetType=llm` Commands run against the new provider unchanged — provider-agnosticism proven.
24. **Priority preemption.** A `critical` incident-response Command is dispatched ahead of `medium` Commands without editing any of them.
25. **Rate-limit backoff.** A SaaS Command hits a rate limit; health `degraded`; retried with backoff; completes without loss.
26. **Timeout fallback.** A slow external API Command times out with `onTimeout=escalate`; Reasoning decides a fallback provider (a new Command).
27. **Expiry.** A time-sensitive "send flash-sale email" Command not executed before its window `expires` rather than firing late.
28. **Compensation Command.** A Workflow emits a compensating `email` Command ("correction notice") after an irreversible send — same object, recovery role.
29. **Rollback Command.** A Workflow emits an inverse `database` Command to undo a reversible write during a saga unwind.
30. **Human-to-LLM handoff in one Workflow.** A human `Command` (review) precedes an LLM `Command` (summarize) — different `targetType`, identical object shape, one correlation.
31. **Multi-agent fan-out.** A Workflow emits three agent `Commands` in parallel; each idempotency-keyed and correlated; results reconciled by the Workflow's join.
32. **Simulation-to-live promotion.** A validated `dry-run` Command is superseded by a `live` version through a governed change; the dry-run stays immutable as evidence.
33. **Memory-write Command.** `targetType=agent`/memory: "persist episodic memory of this interaction" — expressed here, performed by Execution.
34. **Knowledge-read Command.** "retrieve policy documents for this query" — a read Command; retrieval performed by Execution.
35. **M&A reconciliation.** Merged companies keep Commands per tenant; overlapping actions reconciled by superseding within each tenant, never shared across tenants.
36. **Audit forever.** Years later, an auditor reads a terminal Command's immutable record: exact target, payload, result, attempts, correlation to Mission — intact and exportable.

---

## 14. Extensibility

How Commands absorb future demands **without redesign**, because the core abstractions were chosen as extension points.

- **New target types.** `commandTargetTypeEnum` is an extension point; a new addressee kind (e.g. `voice-channel`, `iot-device`, `blockchain`) adds as an enum value — the object shape is unchanged. This is the whole point of the universal abstraction.
- **New execution shapes.** `commandExecutionTypeEnum` extends similarly (e.g. `streaming`).
- **Richer provider selection.** `providerConstraints` can grow (cost, latency SLO, region, model tier, fallback chains) without structural change; resolution logic lives in Execution/registries.
- **Advanced idempotency.** Keys can evolve (windowed, content-addressed) behind the same at-most-once contract.
- **Distributed replay & time-travel audit.** Immutable, serializable, correlated Commands already enable cross-host replay and point-in-time reconstruction as consumers, not a redesign.
- **Structured simulation.** `simulationMode` can gain fidelity levels (mock/record-replay/shadow) behind the same seam.
- **Command templates.** Standard actions are draft `commands` shapes emitted per Workflow node; no new primitive.
- **AI-emitted Commands.** Agents/Reasoning already cause Commands via Workflow nodes as first-class actors; the emit-through-node + ceiling model keeps AI-caused actions safe by construction.

The invariant enabling all of the above: **one universal, immutable, idempotent, deterministic, serializable, provider-agnostic instruction; exactly one action; correlated to full lineage; the perform-only-in-Execution boundary isolates instruction from performance.** New demands plug into `targetType`/`providerConstraints`/registries without touching the object or the boundaries.

---

## 15. Architectural Principles

The permanent design principles governing Commands. If a future request conflicts with one of these, the request is wrong, not the principle.

1. **A Command is the universal execution instruction.** One object shape expresses every action; the Target and Target Type vary, the object does not. A Command is NOT an API/LLM/browser/MCP/human action — those are Targets.
2. **Exactly one action; never nested.** One Command = one executable action against one Target. Composition and sequencing are the Workflow's, never the Command's.
3. **Immutable, idempotent, deterministic, serializable, provider-agnostic.** These five properties are structural, making Commands safe to retry, replay, simulate, transport, and audit.
4. **Commands express; Execution performs.** A Command never performs, dispatches, or self-executes; the Execution layer alone contacts Targets and produces effects.
5. **No intent, no reasoning, no orchestration, no planning, no business rules.** A Command carries an action and a payload — nothing that decides, sequences, or means. Judgment lives above; performance lives below.
6. **Correlated and fully traceable.** Every Command carries a correlation ID and its full lineage to Mission; every action is auditable forever.
7. **Idempotency guarantees at-most-once effect.** The idempotency key makes retries, duplicate dispatch, and replay safe by construction.
8. **Simulation is first-class and never widens silently.** Any Command can be dry-run/simulated with the identical instruction; a non-`live` Command never causes a live effect.
9. **Commands are subordinate.** Precedence is absolute: Law → … → Workflows → Commands → Execution. Commands never override Workflow, Task, Plan, Goal, Mission, or Policy; conflicts block and require explicit human resolution.
10. **Versions and history are immutable and auditable forever; terminal states are final.** Completed/failed/cancelled/expired/archived never reactivate; re-performing is an audited replay. Lifecycle and health are separate axes; health never changes lifecycle.

---

## 16. What Commands will NEVER do

Explicit boundaries to prevent responsibility creep. If a future request asks Commands to do any of these, the answer is: it belongs to another module.

- **Never perform, dispatch, or execute themselves.** Execution performs the action against the Target.
- **Never contain another Command, or orchestrate/sequence/branch.** One action only; coordination is the Workflow's.
- **Never decide, reason, plan, or carry business rules.** A Command is a fixed action, not a judgment.
- **Never carry business intent.** Intent lives in Mission/Goal/Plan/Task/Workflow; a Command carries an action correlated to that intent, not the intent.
- **Never bind to a concrete provider SDK.** `targetType` + registries resolve providers; Commands are provider-agnostic.
- **Never mutate Mission, Goal, Plan, Task, or Workflow.** Commands reference and inherit; they never mutate upward.
- **Never override Law, Security/Compliance, Approved Policy, or any layer above.** Subordinate to the whole authority stack; conflicts block and escalate to a human.
- **Never exist without a Workflow node, a Task, exactly one Target, an idempotency key, a correlation id, deterministic payload, and execution constraints.** All are structural requirements.
- **Never cause a live effect while non-`live`, be double-performed for one idempotency key, or execute after expiry.** Simulation caps, idempotency guarantees at-most-once, expiry prevents stale runs.
- **Never mutate once validated/terminal/superseded, nor reactivate — and never mutate without an actor and a forever-retained audit record.** Replay is the only re-perform, and it is non-destructive.

---

*End of Command Specification v1.0. This document specifies the Command module — the universal, immutable, idempotent, deterministic, provider-agnostic single-action execution instruction that Workflows emit and Execution performs — in full and defines its permanent boundaries. No implementation code. No SQL. No TypeScript. No other specification modified.*
