# Execution Specification v1.0

> Stage 8 — Execution module, complete Enterprise Architecture Specification.
> This document is the permanent architectural reference for Execution in Hebun AI.
> It specifies the runtime engine — the bottom of the cognitive-to-execution hierarchy, beneath Commands. It adds no implementation. It defines boundaries.

**Status:** Definitive · **Scope:** Execution module only · **Grounded in:** the schema primitives in `src/db/schema/_base.ts` (`rootColumns`, `tenantColumns`) and `_enums.ts` (`lifecycleStatusEnum`, `approvalStateEnum`, `executionStatusEnum`, `commandStatusEnum`, `commandSourceEnum`, `providerStatusEnum`, `integrationStatusEnum`, `roleTypeEnum`, `permissionScopeEnum`), and the Identity (34), Mission (35), Goal (36), Plan (37), Task (38), Workflow (39), and Command (40) Specifications v1.0.

**Position in the cognitive hierarchy:**

```
Mission → Goal → Plan → Task → Workflow → Command
                                            → Execution   ← this document — the RUNTIME ENGINE that performs Commands
```

**Authority precedence (unchanged, absolute):**

```
Law → Security/Compliance → Approved Policy → Mission → Goals → Plans → Tasks → Workflows → Commands → Execution
```

Execution is the **runtime engine** of Hebun. Everything above it *describes, coordinates, and instructs*; Execution *performs*. It receives validated Commands, resolves the concrete Target and provider, safely runs the action, validates the outcome, records the effect, and emits events — deterministically, observably, auditable, replay-safe. Execution **performs**; it never creates Commands, never reasons, never plans, never changes business intent.

**Critical clarification — Execution is an engine, not a target:**

> Execution is **NOT** a Workflow. Execution is **NOT** Reasoning. Execution is **NOT** Planning. Execution is **NOT** Memory. Execution is **NOT** a Provider. Execution is **NOT** an LLM.
>
> Execution is the **runtime engine** that safely performs Commands against **any** target — Claude, ChatGPT, Gemini, OpenRouter, MCP servers, browsers, REST/GraphQL APIs, databases, email, file system, OS, scheduler, webhooks, humans, agents, robots, and future providers. Providers are *what Execution calls*; Execution is *the engine that calls them safely*.

---

## 1. Purpose

### Why the Execution layer exists

The Command layer (doc 40) produces the universal, immutable, provider-agnostic instruction. But an instruction is inert: something must actually *run* it — resolve which provider or human or robot performs it, acquire resources, dispatch it safely, honor timeouts and retries and rate limits, guarantee at-most-once effect, validate the result against the Command's contract, persist the resulting effect, and record every attempt for audit. And it must do all of this uniformly for *every* target kind, so that "call an LLM," "hit an API," "drive a browser," "run an MCP tool," and "ask a human" are all executed by one governed, observable, replay-safe engine. Execution is that engine.

Execution is the **system of record for how the company actually performs work at runtime.** It is the single, uniform runtime that turns instructions into effects — the only place the platform touches the outside world (providers, LLMs, browsers, databases, humans, robots). It is the terminal layer: nothing derives from Execution; everything terminates in it.

Without an Execution layer, six things break: heterogeneous runtimes (each target performed differently, untestable), unsafe retries (no central idempotency), no failure architecture (no circuit breaker, DLQ, failover), no uniform observability (no trace/cost/latency across targets), a blurred boundary (Workflows or Commands touching providers), and unenforceable safety (simulation, permissions, and posture not guaranteed at the point of effect). Execution closes that gap and holds the **effect boundary**: everything above *describes*; Execution *performs* — and it is the last line where Law/Compliance/Policy/Mission are enforced before the world changes.

### Business problem it solves

1. **Uniform, safe runtime for every target.** Every action, whatever the target, must be performed by one engine that guarantees idempotency, timeout, retry, rate-limit, concurrency, and posture — so the company's execution is uniformly safe and observable, not a patchwork of SDK calls.
2. **Provider resolution and resilience.** The engine must decide *which* concrete provider performs a Command, fail over when one is down, break circuits on repeated failure, and never lock the platform to a vendor — while never altering the Command.
3. **Deterministic effects, forever auditable.** Every performed action must be replay-safe (no double effect), simulatable (no side effect in dry-run), fully traced (correlation, cost, latency), and recorded immutably — so runtime is reproducible and every effect is accountable to Mission.

### Its responsibility

- Own the runtime lifecycle of every execution: `pending → accepted → preparing → executing → validating → committing → completed | failed | cancelled | timed-out | compensated → archived` (governed), separate from health `unknown → healthy / degraded / blocked` (observed).
- **Receive** validated Commands and their execution context, permissions/environment snapshots, provider constraints, simulation mode, policies, timeout/retry policy, correlation ID, and idempotency key.
- **Resolve** the concrete Target and provider (LLM, MCP, browser, API, database, human, agent, robot, …) via the registries; acquire resources; enforce queueing, scheduling, concurrency, and rate limits.
- **Perform** the Command's single action against the resolved Target — the only layer that contacts the outside world.
- **Validate** the outcome against the Command's `expectedResult`, **persist the effect**, and **emit events** (completion, failure, trace, metrics, audit).
- Own the **failure architecture**: retry, fallback provider, circuit breaker, timeout, dead-letter queue, rollback/compensation triggers (fired back to the Workflow), escalation, provider blacklist.
- Own **observability**: execution trace, timeline, provider metrics, latency, cost, retries, failures, correlation graph, distributed trace, audit timeline.
- Guarantee **idempotency** (at-most-once effect per idempotency key), **correlation propagation**, **simulation safety** (no real effect when non-`live`), and **replay safety** (no duplicated effect).
- Preserve an immutable, forever-auditable record of every attempt, failure, retry, timeout, and effect.

### What is explicitly NOT its responsibility

- **Execution never creates Commands.** It performs Commands emitted by Workflows. Generating an instruction is upstream; Execution only runs them.
- **Execution never reasons, decides, or plans.** No business logic, no branching decisions, no planning. It resolves *how to run* a fixed Command, not *whether or what* to do.
- **Execution never changes business intent, the Command, or the payload.** It binds a Command to a runtime; it never mutates the instruction. Provider choice is Execution's; the Command is untouched.
- **Execution is not the provider.** It *calls* providers; it is not Claude/ChatGPT/Gemini/an API. Providers are external runtimes Execution resolves and invokes.
- **Execution does not own business state semantics.** It *persists the effect* a Command produced and hands it to the owning business module; it does not define what that data *means*.
- **Execution never overrides the authority stack.** It is the final enforcement point of Law/Security/Compliance/Policy/Mission before an effect — it enforces, never overrides.

---

## 2. Mental Model

If a Command is a **sealed instruction card** in one universal notation, Execution is the **stagehand-and-machinery of the entire theatre** — the crew that reads each card, finds the right instrument or performer, checks the card is allowed tonight, plays it exactly once (even if handed the card twice), watches that it sounded right, logs what it cost and how long it took, and has a fire plan if an instrument breaks mid-note. The crew plays nothing of its own and writes no music; it *runs the performance safely*. It is the only part of the theatre that touches real instruments and real audiences.

The mental model in one line: **Execution is the uniform, deterministic, observable, replay-safe runtime engine that receives a validated Command, resolves its Target and provider, performs its single action against the outside world exactly once, validates and persists the effect, and records everything — without ever creating a Command, reasoning, planning, or altering intent.**

Eight properties define the model:

- **Terminal.** Execution is the bottom of the stack. Nothing derives from it; everything terminates in it. It is where description becomes effect.
- **Uniform.** One engine performs every target kind through one pipeline. LLM, API, browser, MCP, human, robot — same receive→resolve→execute→validate→persist→audit flow, different resolved runtime.
- **Performing, not deciding.** Execution runs a fixed Command; it never chooses *what* to do or *why*. Its only "choice" is *which provider/runtime* binds the Command — mechanical resolution, not business reasoning.
- **Idempotent by enforcement.** Execution is where the Command's idempotency key becomes a guarantee: it consults an effect ledger and performs at-most-once, making retries and replays safe.
- **Deterministic & replay-safe.** Given the same Command and resolved conditions, Execution produces the same effect; replay reproduces (or, guarded by the key, no-ops) — never a new uncontrolled effect.
- **Observable & auditable.** Every attempt emits trace, metrics, cost, and an immutable audit record. Runtime is transparent and forever-accountable to Mission via correlation.
- **Resilient.** Execution owns the failure architecture — retry, failover, circuit breaker, DLQ, timeout, rollback/compensation triggers, escalation — so a broken provider degrades gracefully, never silently corrupts.
- **Bounded and final-enforcing.** Execution is subordinate to every layer above and is the *final enforcement point* of Law/Security/Compliance/Policy/Mission/posture/permissions before an effect. It enforces the ceiling; it never raises it.

Execution sits **beneath Commands with nothing below it.** A Command hands Execution a complete instruction; Execution hands the world an effect and the platform an audited result. It is the hinge between *instruction* (Command) and *reality* (effect) — and it is exclusively about *safely performing*, never *creating, deciding, or meaning*.

---

## 3. Core Domain Objects

Execution introduces a small set of runtime entities. All reuse the existing column contracts from `_base.ts`:

- **`rootColumns`** / **`tenantColumns`** (as prior specs). `createdBy` resolves to an actor reference (Identity §3.9); every execution carries the acting actor and `commandSourceEnum` inherited from its Command.

Note on enums: the existing `executionStatusEnum` (`pending | running | completed | cancelled | failed | simulated`) is the coarse run-facing projection; this spec defines the richer governed `executionLifecycleStatusEnum` (§6) of which it is a projection. `commandStatusEnum` and `providerStatusEnum` project as noted.

---

### 3.1 Execution (Run)

- **Purpose.** One runtime attempt-context that performs exactly one Command instance. The primary object of this module.
- **Table.** `executions` (`tenantColumns`).
- **Conceptual fields.**
  - `id` — Execution (run) ID.
  - `tenantId` — owning company (Identity §3.1).
  - `commandRef` — `{commandId, commandVersion}` — the single Command this run performs. Required, singular.
  - `correlationId` — propagated from the Command (unchanged). Required.
  - `idempotencyKey` — propagated from the Command; the at-most-once guard. Required.
  - `resolvedTarget` — the concrete Target the engine resolved (provider/tool/human/agent handle).
  - `resolvedProvider` — the concrete provider/runtime bound (e.g. a specific LLM provider instance) — **selected by Execution, recorded here; the Command is unchanged.**
  - `executionType` — inherited from the Command (`local | remote | async | sync | event | scheduled | interactive | human`).
  - `simulationMode` — inherited (`live | dry-run | simulation`); Execution honors, never widens.
  - `executionContext` — the resolved runtime context (tenant, actor, environment, permissions snapshot ref).
  - `executionLifecycleStatus` — governed runtime lifecycle (`executionLifecycleStatusEnum`, §6).
  - `executionHealth` — health (`executionHealthEnum`, §6): `unknown | healthy | degraded | blocked`.
  - `attempts` — the ordered attempt records (§3.2).
  - `result` — the Execution Result (§3.4), on completion.
  - `effectRef` — reference to the persisted Effect (§3.5).
  - `metrics` — latency, cost, tokens, retries, etc. (§3.7).
  - `traceRef` — reference to the Execution Trace (§3.6).
  - base lifecycle/audit fields (forever-retained).
- **Required.** `tenantId`, `commandRef`, `correlationId`, `idempotencyKey`, `simulationMode`, `executionLifecycleStatus`.
- **Immutability.** A run's inputs (`commandRef`, keys, context snapshot) are frozen at accept; the run record is append-only thereafter.
- **Ownership.** Owned by exactly one company; performs exactly one Command instance.
- **Cardinality.** One Command → one *logical* execution (guarded by the idempotency key), which may contain **multiple attempts** (retries/failover). One run performs exactly one Command; it never batches Commands.

### 3.2 Execution Attempt

- **Purpose.** A single try at performing the Command against a resolved provider. Retries and failover create new attempts under the same run and idempotency key.
- **Realization.** Ordered append-only records `{attemptNo, resolvedProvider, startedAt, endedAt, outcome ∈ {success, failure, timeout, rate-limited, circuit-open}, providerResponseRef, cost, latency}`. **Every attempt, failure, retry, and timeout is recorded** (invariant).
- **Rule.** All attempts share the run's idempotency key; a successful attempt commits the single effect; subsequent duplicate attempts no-op against the effect ledger.

### 3.3 Execution Context

- **Purpose.** The resolved, frozen runtime environment a Command is performed within — the **Execution Context Architecture**.
- **Realization.** `{tenantId, actorRef, environment (posture via providerStatusEnum), permissionsSnapshotRef, policySnapshotRef, resourceGrant, correlationId}`. Captured at accept from the Command's `executionContext` + registries; **immutable for the run** so the performance is reproducible and the authorization basis is point-in-time auditable.
- **Rule.** Execution performs strictly within this context; it never elevates permissions or changes posture mid-run.

### 3.4 Execution Result & Validation Result

- **Purpose.** The outcome of performing the Command and its check against the Command's `expectedResult` contract.
- **Realization.** `result {status, output, providerResponseRef}`; `validationResult {passed, deviations}`. Execution **validates outcomes** against the contract before committing; a result failing validation is a failure, not a success — **Execution never skips validation.**
- **Rule.** Only a validated result commits an effect and completes the run.

### 3.5 Execution Effect

- **Purpose.** The persisted record of the real-world change the Command produced — the thing the idempotency ledger keys on and business modules consume.
- **Realization.** `{effectId, idempotencyKey, commandRef, targetType, effectData, committedAt}`, written to an **effect ledger** keyed by `idempotencyKey`. **Persisting the effect is transactional with completion** (§7). Execution records the effect; the *meaning* of the data belongs to the owning business module.
- **Rule.** At most one committed effect per idempotency key. **Simulation never creates a real effect; replay never duplicates an effect.**

### 3.6 Execution Trace (Observability)

- **Purpose.** The distributed, correlated record of a run — the **Observability Strategy** substrate.
- **Realization.** `traceRef` → spans across resolve/execute/validate/commit, tagged with `correlationId`, provider, attempt, latency, cost. Feeds the **correlation graph** and **distributed trace** across all Commands of a Workflow run.

### 3.7 Execution Metrics & Cost

- **Purpose.** Quantitative runtime facts — the **Cost Tracking** and performance substrate.
- **Realization.** `{latency, cost, tokensIn/Out?, retries, provider, outcome}` per attempt and aggregated per run. Cost is attributed up the lineage (Command → … → Plan budget, Plan §14) via correlation.

### 3.8 Provider Binding (Provider Resolution)

- **Purpose.** The record of *which concrete provider/runtime* Execution bound a Command to — the **Provider Resolution Architecture**.
- **Realization.** `resolvedProvider` + resolution inputs `{targetType, providerConstraints, availability, health, cost/latency policy, failover order}`. **Execution decides which provider executes a Command; it never changes the Command or its payload; it only binds the Command to a runtime.**
- **Rule.** Resolution is mechanical (constraint + availability + policy), never business reasoning. A blacklisted/circuit-open provider is excluded; failover picks the next eligible.

---

## 4. Ownership

- **Owned by Company.** Every Execution run belongs to exactly one company via `tenantId`. No global runs.
- **Bound to one Command.** Every run carries exactly one `commandRef` and inherits its full lineage (Workflow node → Task → Plan → Goal → Mission) via correlation. **Execution executes exactly one Command instance** per run.
- **Accountable through the Command's actor.** A run has no separate strategic owner; it acts as the Command's acting actor within the frozen permissions snapshot (Execution Context, §3.3), bounded by that actor's authority (agent ceiling for agent-sourced Commands, Identity §6).
- **The engine is platform-operated, tenant-scoped.** The Execution engine itself is platform infrastructure (a system account, Identity §3.9), but every run is strictly tenant-scoped and performs only within the tenant's context, permissions, and posture. Cross-tenant effect is structurally impossible.
- **External effects attributed.** For external targets (SaaS/API/provider), the outward call is attributed to the tenant's actor/service account; the provider never sees a cross-tenant identity.

---

## 5. Execution Architecture

The engine's internal architecture, decomposed into the concerns the platform requires. All are runtime mechanics; none reasons or creates intent.

### 5.1 Execution Engine (the pipeline)

The engine performs each Command through a fixed, deterministic **pipeline**:

```
Receive Command → Validate → Resolve Target → Resolve Provider → Acquire Resources
  → Execute → Observe → Validate Result → Persist Effect → Emit Events → Complete
```

Each stage maps to a lifecycle transition (§6). The pipeline is uniform for every target kind; only *Resolve Target/Provider* and *Execute* vary by `targetType`. **Execution never skips Validate or Emit Events (audit)** (invariant).

### 5.2 Queue Architecture

- Validated Commands enter **priority queues** (per `commandPriorityEnum`) with **concurrency control** and **rate limiting** per tenant, provider, and target.
- **Scheduling** handles `scheduled`/`event`/`interactive` execution types (a scheduler and event bridge feed the queue).
- Back-pressure: when concurrency/rate limits saturate, Commands wait in-queue (run `pending`), never dropped; saturation surfaces as `degraded` health.
- **Dead-Letter Queue (DLQ):** Commands that exhaust retries or are un-performable land in a DLQ for inspection, manual intervention, or governed replay — never silently lost.

### 5.3 Provider Resolution Architecture

- Given `targetType` + `providerConstraints` + live provider **health/availability/cost/latency**, the engine selects a concrete provider from the **Provider/Tool/Agent Registry** (integration health via `integrationStatusEnum`).
- **Provider failover:** on failure/unavailability, the engine tries the next eligible provider in the failover order (a new attempt, same idempotency key).
- **Provider blacklist:** repeatedly failing providers are temporarily excluded from resolution.
- **The Command is never changed** — only the binding differs across attempts.

### 5.4 Execution Context Architecture

- At accept, the engine freezes the **Execution Context** (§3.3): tenant, actor, environment posture, permissions snapshot, policy snapshot, resource grant, correlation. The run performs strictly within this immutable context — point-in-time reproducible and auditable.

### 5.5 Runtime Isolation & Sandbox Strategy

- **Runtime isolation:** each run executes in an isolated runtime boundary (per-tenant, per-target) so one run cannot read or corrupt another's state, and a provider fault cannot cross tenants.
- **Sandbox strategy:** high-risk target types (OS, file-system, browser, code-running MCP tools) execute in a constrained sandbox honoring `executionConstraints` (allowed paths, network egress rules, resource caps). A `simulation`/`dry-run` posture forces a no-effect sandbox. The sandbox is the last containment before a real effect.

### 5.6 Resilience Patterns

- **Circuit Breaker:** per provider/target, repeated failures open the circuit; new resolutions skip the open circuit and fail over; a half-open probe reinstates on recovery.
- **Retry:** honors the Command's retry policy (idempotency-safe); attempts recorded.
- **Timeout:** honors the Command's timeout policy; `onTimeout` fires deterministically.
- **Rollback / Compensation Trigger:** on unrecoverable failure, Execution **fires the trigger back to the emitting Workflow** (Workflow §3.7 owns the recovery graph); Execution performs the individual rollback/compensation *Commands* the Workflow emits — it does not decide the recovery strategy.
- **Escalation & Manual Intervention:** DLQ items and unrecoverable states escalate to humans/Governance.

### 5.7 Simulation & Replay Strategy

- **Simulation strategy:** a `simulation` run contacts no target and returns synthetic results; a `dry-run` contacts the target read-only/validate-only. **No real effect is ever produced when non-`live`** (invariant).
- **Replay strategy:** replaying an immutable Command creates a **new run** referencing the original via correlation; a `live` replay is **idempotency-guarded** (finds the prior effect → no-op); a `simulation` replay reproduces the intended effect with no side effect. **Replay never duplicates effects** (invariant). Replay is always a new audited run, never an in-place re-run.

### 5.8 Observability Strategy

- Every run produces an **execution trace, timeline, provider metrics, latency, cost, retries, failures**, a **correlation graph** (all Commands of a run), a **distributed trace** (across hosts/providers), and an **audit timeline**. Observability is not optional — a run that cannot be traced/audited fails closed (§7).

### 5.9 The effect boundary (why nothing is below Execution)

- Execution is the **only** layer that contacts the outside world and produces effects. Above it, everything is description/coordination/instruction; at Execution, instruction becomes reality. This boundary is why Law/Security/Compliance/Policy/Mission/posture/permissions are all **finally enforced here**, immediately before an effect — the last gate before the world changes.

---

## 6. Lifecycle

An Execution run carries **two orthogonal state dimensions** (mirroring Command/Workflow) that must never be conflated:

- **Lifecycle** (`executionLifecycleStatusEnum`) — *where the run is in its governed existence.* Governed transitions only.
- **Health** (`executionHealthEnum`) — *how well an in-flight run is doing.* Auto-derived; never a lifecycle transition.

Governing rule: **a run performs exactly one Command within a frozen, authorized context, at-most-once, validated, audited, and posture-honoring; lifecycle changes are governed; health merely observes; the run record is immutable and auditable forever.**

### 6.1 Lifecycle dimension

**`executionLifecycleStatusEnum`** (specified): `pending | accepted | preparing | executing | validating | committing | completed | failed | cancelled | timed-out | compensated | archived`.

| Lifecycle state | Pipeline stage | Mutable? | Carries health? |
|---|---|---|---|
| **pending** | Queued, awaiting capacity | No (queue only) | No |
| **accepted** | Received; idempotency-checked; context frozen | No | **Yes** |
| **preparing** | Target/provider resolved; resources acquired | No | **Yes** |
| **executing** | Performing the action against the Target | No (attempt progress) | **Yes** |
| **validating** | Checking result vs `expectedResult` | No | **Yes** |
| **committing** | Persisting the effect (transactional) | No | **Yes** |
| **completed** | Effect committed (or idempotent no-op) & audited | No (terminal-positive) | No (cleared) |
| **failed** | Unrecoverable after retries/failover | No (terminal) | No |
| **cancelled** | Governed withdrawal before effect | No (terminal) | No |
| **timed-out** | Timeout policy terminated the run | No (terminal) | No |
| **compensated** | Effect reversed/compensated via Workflow-triggered Commands | No (terminal) | No |
| **archived** | Retired; terminal | No (immutable) | No |

`pending/executing/completed/failed/cancelled` and `simulationMode` project onto the existing `executionStatusEnum` (`pending | running | completed | cancelled | failed | simulated`); this governed enum is the finer superset.

**Lifecycle transitions (governed):**

| Transition | From → To | Precondition | Effect | Emits |
|---|---|---|---|---|
| **Receive** | ∅ → pending | A validated, released Command arrives | run created; enqueued; `executionHealth=unknown` | `ExecutionPending` |
| **Accept** | pending → accepted | Capacity available; idempotency key checked (no prior committed effect); context frozen | context snapshot taken; `executionLifecycleStatus=accepted`; health tracking begins | `ExecutionAccepted` |
| **Idempotent no-op** | accepted → completed | Prior committed effect exists for the key | returns prior effect; no new effect | `ExecutionNoOp`, `ExecutionCompleted` |
| **Prepare** | accepted → preparing | Target + provider resolved; resources acquired; posture set | binding recorded (Command unchanged) | `ExecutionPreparing`, `ProviderResolved` |
| **Execute** | preparing → executing | Sandbox/isolation ready | attempt started against the Target | `ExecutionStarted`, `ExecutionAttemptStarted` |
| **Retry / Failover** | executing → executing | Attempt failed transiently / provider down; retry policy allows | new attempt (same key), possibly new provider | `ExecutionRetryScheduled` / `ProviderFailedOver` |
| **Validate** | executing → validating | Attempt returned a result | result checked vs `expectedResult` | `ExecutionValidating` |
| **Commit** | validating → committing | Validation passed | effect persisted transactionally to the ledger | `ExecutionCommitting`, `ExecutionEffectPersisted` |
| **Complete** | committing → completed | Effect committed & audit written | `executionLifecycleStatus=completed` (terminal); health cleared | `ExecutionCompleted` |
| **Fail** | executing/validating/preparing → failed | Retries+failover exhausted, validation failed unrecoverably, or resolution impossible | run `failed`; rollback/compensation trigger fired to Workflow; DLQ if applicable | `ExecutionFailed`, `RollbackTriggered?` |
| **Timeout** | any active → timed-out | Timeout policy elapsed | `timed-out` (terminal); `onTimeout` action | `ExecutionTimedOut` |
| **Cancel** | non-terminal (pre-commit) → cancelled | Governed withdrawal (Workflow cancel/rollback) | no effect committed; `cancelled` | `ExecutionCancelled` |
| **Compensate** | completed → compensated | Workflow-triggered compensation reverses the effect | compensating effect recorded; `compensated` (terminal) | `ExecutionCompensated` |
| **Archive** | terminal → archived | Governed retirement | `lifecycleStatus=archived` (terminal) | `ExecutionArchived` |

Every transition is governed and audited. **Health never appears in this table.** A run past `committing` cannot be un-committed except by a *new* compensating run (never an in-place undo).

### 6.2 Health dimension

**`executionHealthEnum`** (specified): `unknown | healthy | degraded | blocked`.

| Health state | Meaning | Set how |
|---|---|---|
| **unknown** | No sufficient signal yet (default; also for terminal runs) | default / on clear |
| **healthy** | Progressing within time/retry/resource bounds | auto |
| **degraded** | Impaired but progressing (retrying, failover, slow provider, rate-limited) | auto |
| **blocked** | Cannot progress (no eligible provider, circuit open, resource unavailable, approval pending) | auto |

**Health rules:**

- **Scope.** Health applies **only** to in-flight lifecycle states (`accepted | preparing | executing | validating | committing`). Before `accepted` it is `unknown`; terminal runs clear it to `unknown`, frozen — **terminal runs carry no active health.**
- **Automatic.** Derived from **attempt outcomes, provider health/latency, retry counts, elapsed vs timeout, queue/concurrency pressure, circuit state, resource availability.** Never manual.
- **No lifecycle effect.** **Health never changes lifecycle; lifecycle never derives from health.** A `degraded`/`blocked` run keeps its lifecycle state; only governed transitions move it.
- **Observability, not authority.** Health drives alerts/KPIs/Governance; humans/Reasoning may then act.

### 6.3 Terminal-state rules

- **completed / failed / cancelled / timed-out / compensated** are terminal. **Archived never reactivates; completed never reactivates** — re-performing is a new **replay** run (§5.7), never a resurrection.
- Terminal runs hold `executionHealth = unknown` (cleared, frozen).
- **Run history is immutable and fully traceable** to Mission — every attempt, failure, retry, timeout, provider binding, and effect retained append-only. **Execution never skips auditing.** No history deleted (except the legal-erasure exception, Identity §13).

---

## 7. Constraints

Structural and semantic constraints, enforced by the engine — not by convention.

**Structural / invariant (enforced):**

1. **Exactly one Command per run.** `commandRef` NOT NULL and singular. **Execution executes exactly one Command instance.** No batching of Commands in one run.
2. **The Command is never changed.** Execution has no write-path to the Command's instruction fields or payload. **Execution never changes the Command; it only binds it to a runtime.**
3. **Idempotency guaranteed.** At most one committed effect per `idempotencyKey`, enforced by the effect ledger at accept and commit. **Execution guarantees idempotency.**
4. **Correlation propagated.** `correlationId` is propagated unchanged to every attempt, provider call, trace, log, and audit record. **Execution guarantees correlation propagation.**
5. **Every attempt/failure/retry/timeout recorded.** Append-only; no silent attempt. **Execution records every attempt, failure, retry, and timeout.**
6. **Validation never skipped.** Every result is validated against `expectedResult` before commit. **Execution never skips validation.**
7. **Audit never skipped.** Every mutation and attempt writes an immutable audit record, transactional with the mutation. **Execution never skips auditing.**
8. **Simulation safety.** A non-`live` run produces **no real effect**. **Simulation never creates real effects.**
9. **Replay safety.** A replay **never duplicates an effect** (idempotency-guarded / no-side-effect simulation). **Replay never duplicates effects.**
10. **Effect–completion atomicity.** Effect persistence and run completion (and audit/event emission) are one transaction; a failed effect/audit write rolls back the completion. No half-committed effect.
11. **Tenant isolation & context immutability.** `tenantId` NOT NULL; the Execution Context is frozen at accept and never elevated mid-run.
12. **Terminal immutability.** Terminal/archived runs reject mutation; re-performing is a new replay run.

**Semantic (engine-enforced):**

13. **Final enforcement of the authority stack.** Immediately before an effect, Execution enforces **Law, Security/Compliance, Approved Policy, Mission, Goal, Plan, Task, Workflow, and permissions/posture**. A Command that would violate any is **blocked at execution** and escalated for explicit human resolution — Execution enforces the ceiling, never overrides it. Protective operations (Mission §7.8) are the exception path that always runs.
14. **No creation, reasoning, planning, or intent change.** Execution has no path to emit a Command, make a business decision, plan, or alter intent. Such attempts are rejected as layer violations.
15. **Provider resolution is mechanical.** Resolution uses constraints + availability + policy only — never business judgment. A resolved provider never changes the Command.
16. **Posture honored to the effect.** `simulationMode`/`executionConstraints` posture (`providerStatusEnum`) is honored at the sandbox/provider boundary; a non-`live` posture cannot produce a live effect even on retry/failover.
17. **Lifecycle/health orthogonal; health scoped and derived.** Separate fields; health non-`unknown` only in-flight; auto-derived; never writes lifecycle.

---

## 8. Validation

Validation runs at gates across the pipeline. Execution fails closed: on any ambiguity it does not produce an effect.

**Intake validation (Receive → Accept):**

- The incoming Command is `validated`/`released` (Command §6), in the same tenant, with a resolvable lineage; `idempotencyKey` and `correlationId` present.
- **Idempotency check:** if a committed effect exists for the key, resolve to no-op (return prior effect) — never a second execution.
- Context freezable: permissions snapshot, policy snapshot, posture, and resource grant resolve.

**Authorization & posture validation (Accept → Preparing, re-checked before effect):**

- The frozen permissions snapshot permits the action (Identity §6, `permissionScopeEnum`); the authority stack (Law/Compliance/Policy/Mission/…) permits the effect. A violation blocks the run and escalates for human resolution.
- `simulationMode` ≤ environment posture; a live effect is refused under a non-`live` posture.
- Where the Command carries `approvalRef`, the approval is `approved`.

**Resolution validation (Preparing):**

- `targetType` resolves to at least one eligible provider/tool/human/agent via the registries respecting `providerConstraints`, circuit state, and blacklist; otherwise `blocked` health and no execution (DLQ if exhausted).

**Result validation (Validating):**

- The provider response satisfies the Command's `expectedResult` contract; deviations mark the attempt failed. **Validation is never skipped.**

**Effect validation (Committing):**

- The effect is idempotency-unique; commit is transactional with audit/event emission; a failed write rolls back — no partial effect.

**Observability validation (continuous):**

- A run that cannot emit trace/audit fails closed rather than performing untraced.

**Health validation (continuous):**

- `executionHealth` non-`unknown` only in-flight; unresolved health inputs yield `unknown`, never a stale `healthy`; a health update never moves lifecycle.

Only a run passing all applicable gates produces an effect. Failure holds or terminates the run with the violated rule recorded and the effect never produced.

---

## 9. Relationships

Execution points *up* at Commands and the authority stack, and *out* at providers/registries/observability. Nothing is below Execution.

| Module | Relationship to Execution |
|---|---|
| **Command** | **The sole input.** Execution performs exactly one Command per run (`commandRef`), never altering it. Command §9 names Execution "the performer"; this is that edge. Execution binds the Command to a runtime and produces its effect. |
| **Workflow** | The Command's emitter and the **owner of recovery**. Execution fires **rollback/compensation triggers** back to the Workflow (Workflow §3.7) and performs the individual rollback/compensation Commands the Workflow emits. Execution never orchestrates; it reports run outcomes the Workflow reacts to. |
| **Task** | Inherited lineage; the Command's `expectedResult` derives from the Task's acceptance — Execution validates against it. Never modified. |
| **Provider Registry** | Resolves concrete LLM/API/SaaS providers for `targetType` + `providerConstraints`; supplies health/availability for failover, circuit breaker, and blacklist. Providers are *what Execution calls*. |
| **Tool Registry** | Resolves MCP servers, browser sessions, and other tool runtimes. |
| **Agent Registry** | Resolves `targetType=agent` handles and capabilities/ceilings; an agent target performs within its bound (Identity §3.8/§6). |
| **Memory** | Execution performs memory read/write Commands (`memoryKindEnum`) and persists the resulting effect; it does not define memory semantics. |
| **Knowledge** | Execution performs knowledge retrieval/write Commands; retrieval semantics belong to Knowledge. |
| **Reasoning** | Reasoning may decide failover/retry/escalation *policy* and interpret failures — but Execution never reasons. Execution reports outcomes; Reasoning judges. |
| **Approval** | Where a Command requires it, Execution refuses to produce an effect until the `approvalRef` is `approved` (reuses `approvalStateEnum`). |
| **Governance** | Receives execution drift, blocked/escalated runs, DLQ items, and authority-stack conflicts; decides block/escalate/human-intervention. Execution enforces; Governance adjudicates. |
| **Audit** | Every run, attempt, and effect writes an immutable, forever-retained audit record (Identity §9). Execution never skips auditing. |
| **Observability** | Consumes traces, timelines, metrics, cost, correlation/distributed traces (§5.8). The runtime's transparency surface. |
| **Security** | Runtime isolation, sandbox, secrets handling, and egress control are enforced at Execution — the last gate before an effect. |
| **Policies** | The final point where approved policy/compliance is enforced before effect; Execution enforces, never overrides. |
| **Identity / Company** | Tenant scoping and the frozen actor/permissions context every run performs within. |

**The execution spine terminates here:** `Mission → Goal → Plan → Task → Workflow → Command → Execution → (effect on the world)`. Execution is the terminal node that turns a universal instruction into a safe, validated, audited, at-most-once effect — and nothing derives from it.

---

## 10. Events

Every Execution mutation and pipeline step emits exactly one domain event. Governance, Workflows, Observability, and dashboards subscribe; they never read Execution tables directly. Payloads carry `actorRef`, `tenantId`, `executionId`, `commandRef`, `correlationId`, `idempotencyKey`, `resolvedProvider?`, `attemptNo?`, and `occurredAt`.

| Event | Trigger | Payload (beyond envelope) | Consumers | Business impact |
|---|---|---|---|---|
| `ExecutionPending` | Validated Command enqueued | priority | Observability, Dashboard | Awaiting runtime capacity |
| `ExecutionAccepted` | Received; idempotency-checked; context frozen | idempotencyResult, contextRef | Workflow, Governance | Engine owns the run; health tracking begins |
| `ExecutionNoOp` | Duplicate key with prior effect | priorEffectRef | Workflow, Audit | At-most-once proven; no new effect |
| `ProviderResolved` | Concrete provider bound | resolvedProvider, targetType | Observability, Cost | Runtime chosen; Command unchanged |
| `ExecutionPreparing` | Resources acquired; sandbox ready | resourceGrant | Dashboard | Ready to perform |
| `ExecutionStarted` / `ExecutionAttemptStarted` | Attempt begins | attemptNo, provider | Observability, Dashboard | Action underway against the Target |
| `ExecutionRetryScheduled` | Retry per policy (idempotency-safe) | attemptNo, backoff | Observability | Safe re-attempt |
| `ProviderFailedOver` | Failover to next provider | fromProvider, toProvider | Observability, Governance | Resilience engaged |
| `CircuitOpened` / `CircuitHalfOpen` / `CircuitClosed` | Circuit breaker state | provider, target | Governance, Observability | Provider health managed |
| `ExecutionValidating` | Result checked vs contract | — | Dashboard | Outcome verification |
| `ExecutionEffectPersisted` | Effect committed to ledger | effectRef | **Business modules**, Audit | Real change recorded |
| `ExecutionCompleted` | Effect committed & audited | resultRef, metrics | Workflow (node completes), Reporting | Action done; health cleared |
| `ExecutionFailed` | Retries/failover exhausted / unrecoverable | reason, attempts | Workflow, Governance, Reasoning | Failure surfaced; recovery to Workflow |
| `ExecutionTimedOut` | Timeout policy elapsed | onTimeout | Governance, Notifications | Time bound hit |
| `ExecutionCancelled` | Governed pre-commit withdrawal | reason | Workflow, Dashboard | Withdrawn; no effect |
| `RollbackTriggered` / `CompensationTriggered` | Recovery fired to Workflow | targetEffectRef | **Workflow**, Governance, Audit | Cross-action recovery initiated |
| `ExecutionCompensated` | Compensating effect recorded | compensationEffectRef | Workflow, Audit | Effect reversed to consistency |
| `DeadLetterQueued` | Un-performable/exhausted Command | reason | Governance, Notifications | Manual intervention required |
| `ExecutionSimulated` | Dry-run/simulation run | syntheticResultRef | Dashboard, Governance | Effect previewed, no side effect |
| `ExecutionReplayed` | Replay run created | replaySourceId, mode | Governance, Audit | Deterministic, non-duplicating re-run |
| `ExecutionHealthChanged` | Health recomputed (in-flight only) | fromHealth, toHealth, drivers | Dashboard, Governance | Health moved; **no lifecycle change** |
| `ExecutionDegraded` / `ExecutionBlocked` | Health specializations | reason / blockingRef | Governance, Notifications | Alerts; lifecycle unchanged |
| `ExecutionMetricsRecorded` | Attempt/run metrics finalized | latency, cost, retries | Observability, Cost, Plan (budget) | Cost/perf attributed up lineage |
| `ExecutionArchived` | Retired | reason | Reporting | Run retired (no reactivation) |
| `ExecutionAuthorityBlocked` | Authority-stack/permission conflict at runtime | violatedRef | **Governance (high severity)**, Security, Audit | Effect blocked at the last gate; human resolves |

**Ordering and idempotency.** Events carry `correlationId`, `idempotencyKey`, and attempt indices; consumers discard stale/duplicate deliveries. Emission is **transactional with the mutation**; a failed audit/event write rolls back — no un-audited effect.

**Two independent streams.** Health events never accompany or cause a lifecycle change; lifecycle events never carry a health transition.

---

## 11. KPIs

Execution health and the company's runtime performance, measured deterministically from run records, attempts, and effects.

| KPI | Definition | Source |
|---|---|---|
| **Execution success rate** | % of runs `completed` vs `failed`+`timed-out`+`cancelled` | terminal states |
| **First-attempt success** | % completed without retry/failover | attempts |
| **Retry rate** | Avg attempts per run; % exhausting retries | attempts vs policy |
| **Failover rate** | % of runs using a fallback provider | provider bindings |
| **Idempotency no-op rate** | % of accepts resolving to a safe no-op | effect ledger |
| **Simulation ratio** | % runs in dry-run/simulation vs live | simulationMode |
| **Replay fidelity** | % replays reproducing the intended effect without duplication | replay outcomes |
| **Timeout rate** | % of runs timing out | timeout events |
| **DLQ rate** | % of Commands landing in the dead-letter queue | DLQ events |
| **Circuit-open incidence** | Count/duration of open circuits per provider | circuit events |
| **Provider availability** | % successful provider calls per provider | attempt outcomes |
| **Latency** | p50/p95/p99 `executing → completed` | metrics |
| **Cost per run / per lineage** | Aggregated provider cost, attributed to Plan budget | metrics + correlation |
| **Concurrency utilization** | Avg concurrent runs vs limits | queue telemetry |
| **Health distribution** | % in-flight runs `healthy` vs `degraded`/`blocked` | `executionHealth` |
| **Audit completeness** | % runs with a complete immutable trail to Mission (target 100%) | audit chain |
| **Posture conformance** | % of non-`live` runs with zero real effects (target 100%) | effect ledger vs mode |

These feed the Executive/Director/Department dashboards and the Observability surface (§5.8). All computed from Execution's own records — no external inference.

---

## 12. Failure Scenarios

At least the following failure modes and the engine's deterministic reaction. Governing rule: **Execution fails closed and at-most-once** — on ambiguity it produces no effect; on partial failure it recovers to a consistent, audited state.

1. **Command not validated/released.** Refused at intake — Execution performs only validated Commands.
2. **Duplicate idempotency key with a prior committed effect.** Resolves to no-op returning the prior effect — **at-most-once**, never a second effect.
3. **Uncertain outcome (provider succeeded, ack lost).** On retry/replay the effect ledger reveals the prior effect → no-op; never a blind double-perform.
4. **No eligible provider for the target type.** `blocked` health; not executed; DLQ if unresolved; escalates.
5. **Provider down mid-attempt.** Failover to the next eligible provider (new attempt, same key); if all exhausted → `failed` + rollback/compensation trigger.
6. **Provider repeatedly failing.** Circuit opens; resolutions skip it; blacklist temporarily; half-open probe reinstates on recovery.
7. **Provider rate-limits.** `degraded`; retry with backoff; never a silent drop; escalates if persistent.
8. **Timeout.** `timed-out` deterministically; `onTimeout` action; no indefinite hang.
9. **Retries exhausted.** `failed`; rollback/compensation trigger fired to Workflow; DLQ for inspection.
10. **Result fails `expectedResult` validation.** Attempt marked failed; not committed; retried or failed — **validation never skipped**, an invalid result never becomes a success.
11. **Effect persist fails after provider success.** Commit is transactional; the failure rolls back completion and leaves the run recoverable via idempotency — never a silent lost effect or a double effect on retry.
12. **Audit write fails.** Transactional emission rolls back the mutation — **no un-audited effect commits.**
13. **Non-`live` posture, provider contacted live (attempted).** Refused at the sandbox/provider boundary — simulation/dry-run never produces a live effect, even on failover.
14. **Attempt to widen posture to live mid-run.** Refused — posture is frozen in context; widening requires a new Command.
15. **Permission revoked between emit and execute.** The frozen permissions snapshot is re-checked at the effect gate against current revocations; a revoked permission blocks the effect and escalates.
16. **Authority-stack conflict detected at runtime.** `ExecutionAuthorityBlocked`; effect blocked at the last gate; human resolves. Protective ops (Mission §7.8) excepted.
17. **Command mutation attempted by the engine.** Structurally impossible — no write path to the Command. Rejected as a layer violation.
18. **Execution tries to create a Command / reason / plan.** Structurally impossible — no emit path, no decision logic. Rejected.
19. **Two Commands in one run.** Rejected — exactly one Command per run.
20. **Runtime isolation breach attempt.** Blocked by isolation/sandbox; one run cannot read/corrupt another's state or cross tenants.
21. **Sandbox escape attempt (OS/file/browser/code tool).** Contained by the sandbox honoring `executionConstraints`; egress/paths beyond the grant are denied; effect blocked.
22. **Secret leakage risk in trace/logs.** Secrets are redacted in observability; correlation is propagated, credentials are not.
23. **DLQ item never handled.** Escalates to Governance/human; never silently expires; governed replay or cancellation resolves it.
24. **Replay attempts to duplicate an effect.** Idempotency-guarded no-op / no-side-effect simulation — **replay never duplicates effects.**
25. **Replay tries to rewrite the original run.** Refused — replay is a new audited run, non-destructive.
26. **Concurrency/rate limit saturated.** New runs wait `pending`; `degraded` health; never dropped or over-dispatched.
27. **Cancellation after effect committed.** Cannot un-commit; resolved by a Workflow-triggered **compensation** run → `compensated`, never an in-place undo.
28. **Partial multi-attempt effect.** The idempotency key ensures only one attempt commits the effect; other attempts no-op — no partial double effect.
29. **Provider returns malformed/oversized response.** Validation fails; attempt failed; contained (no partial effect); retried/failed.
30. **Human target never responds.** Interactive/human run stays in-flight with `blocked` health, honoring its timeout; `timed-out`/escalation per policy; never silently completed.
31. **Robot/actuation fault mid-effect.** Reported as attempt failure; physical-world compensation is a Workflow-triggered compensating Command; the run reflects the true partial state, never a false success.
32. **Scheduler/event double-fire.** Idempotency key dedups; the action performs at most once despite duplicate triggers.
33. **Cost ceiling exceeded (Plan budget).** `degraded`/escalation; runs may be held pending a governed decision; cost is attributed and surfaced, never hidden.
34. **Observability backend unavailable.** Run fails closed rather than performing untraced (or degrades to a guaranteed local audit that must still commit).
35. **Terminal run mutation attempted.** Refused — terminal/archived runs are immutable; re-performing is a replay.
36. **Correlation lost across a hop.** Detected as a trace gap; the run flags a traceability failure and escalates — correlation propagation is an invariant, not best-effort.

---

## 13. Enterprise Use Cases

Behavior of Execution in real enterprise situations. In every case Execution performs one Command, produces at-most-one effect, and records everything; it never creates Commands or reasons.

1. **LLM run with provider resolution.** An `llm` Command resolves to Claude via the registry per `providerConstraints`; the prompt runs; the result is validated against the schema and persisted.
2. **Provider failover.** The primary LLM provider is down; Execution fails over to a secondary (OpenRouter) under the same idempotency key; the translation completes once.
3. **Circuit breaker.** A flaky API provider fails repeatedly; its circuit opens; subsequent Commands route to a fallback until a half-open probe recovers it.
4. **Idempotent payment.** A payment API Command retries after a transient error; the idempotency key ensures the charge happens exactly once.
5. **Lost-ack recovery.** A provider succeeded but the ack was lost; a replay finds the committed effect and no-ops — no double charge.
6. **MCP tool run.** An `mcp-server` Command resolves the MCP server via the Tool Registry, runs the tool in a sandbox, validates output, persists the effect.
7. **Browser automation.** A `browser` Command drives an isolated browser session under a sandbox with egress rules; the DOM actions run; the result is captured.
8. **Human task.** A `human` Command is surfaced to the assigned person (via Approval/Notifications bridge); Execution waits with honored timeout; completion on their response.
9. **Robot actuation.** A `robot` Command drives a pick-and-place; a mid-action fault is reported truthfully; a compensating Command re-shelves the item.
10. **Database write.** A `database` Command runs a parameterized upsert transactionally; the effect is the committed rows.
11. **Email send with dry-run.** A `dry-run` email Command validates recipients/content without sending; promoted to a `live` Command after review.
12. **Full simulation rehearsal.** A migration Workflow runs entirely in `simulation`; every Execution produces synthetic results, zero effects, for rehearsal.
13. **Deterministic replay for audit.** An auditor replays a completed run in `simulation` and reproduces the intended effect from the immutable Command + context.
14. **Scheduled batch.** A `scheduled` Command fires nightly via the scheduler into the queue; concurrency-limited parallel runs process accounts.
15. **Event-driven fulfillment.** An `event` Command performs on "order placed"; a double-fire is deduped by the idempotency key.
16. **Rate-limit backoff.** A SaaS Command hits a limit; `degraded`; backoff retry; completes without loss.
17. **Timeout fallback.** A slow external API times out with `onTimeout=escalate`; Reasoning selects a fallback (a new Command); the original is `timed-out`.
18. **DLQ + manual intervention.** A Command exhausts retries and failover; it lands in the DLQ; an operator inspects and governed-replays after fixing the root cause.
19. **Rollback saga.** A booking Workflow's car step fails; Execution fires the rollback trigger; the Workflow emits inverse Commands; Execution performs them to unwind flight then hotel.
20. **Compensation for irreversible send.** An email batch already sent cannot be un-sent; a Workflow-triggered compensating Command sends a correction; the run is `compensated`.
21. **Cost tracking to budget.** Each run's provider cost is attributed via correlation to the Plan's budget; a breach surfaces on the Plan dashboard (Plan §14).
22. **Distributed trace.** A support engineer follows one `correlationId` across LLM, API, and DB runs on different hosts to diagnose a failed order end-to-end.
23. **Runtime isolation across tenants.** Two tenants' runs execute in isolated runtimes; a provider fault in one never affects the other.
24. **Sandbox containment.** An OS Command that tries to write outside its granted paths is denied by the sandbox; no effect; escalation.
25. **Permission revoked mid-flight.** A user's permission is revoked between emit and execute; the effect gate re-checks and blocks the action; escalates.
26. **Compliance block at the last gate.** A Command that would export restricted data is blocked at Execution's authority gate; `ExecutionAuthorityBlocked`; human resolves.
27. **Protective operation exemption.** A security-containment Command runs even during a Mission amendment (Mission §7.8) — protection is never gated.
28. **Priority preemption.** A `critical` incident-response run preempts `medium` runs in the queue without altering any Command.
29. **Provider swap without change.** The default LLM provider is switched in the registry; existing `llm` Commands run against the new provider unchanged.
30. **Concurrency-limited migration.** "Migrate 100k records" runs capped at the concurrency limit; back-pressure holds excess `pending`; `degraded`, never a breach.
31. **Multi-agent fan-out.** A Workflow's three agent Commands run as three isolated Execution runs, correlated, results reconciled by the Workflow.
32. **Human-to-LLM handoff.** A human review run completes; an LLM run follows automatically — both correlated, both audited, neither reasoning done by Execution.
33. **Knowledge retrieval run.** A knowledge-read Command is performed; retrieved documents returned; effect recorded; semantics owned by Knowledge.
34. **Memory-write run.** An episodic-memory write Command persists the interaction; effect recorded; meaning owned by Memory.
35. **Observability-driven ops.** SREs watch latency/cost/failure dashboards from Execution metrics to tune providers and limits.
36. **Time-travel audit.** Years later, a terminal run's immutable record shows the exact provider bound, attempts, cost, result, and effect, traceable to Mission.
37. **Governed cancellation.** A running Command is cancelled pre-commit by a Workflow cancel; no effect; `cancelled`.
38. **Half-open recovery.** A recovered provider passes a half-open probe; the circuit closes; normal routing resumes.
39. **Simulation-to-live promotion.** A validated `dry-run` run's evidence supports promoting a new `live` Command; the dry-run stays immutable.
40. **M&A reconciliation.** Merged companies' runs stay tenant-scoped; overlapping effects reconciled per tenant; no cross-tenant effect.
41. **Forever audit for regulators.** A regulator requests the complete execution trail for a decision; the immutable, correlated records reconstruct every effect and its authorization basis.

---

## 14. Extensibility

How Execution absorbs future demands **without redesign**, because the core abstractions were chosen as extension points.

- **New runtime targets.** Claude, ChatGPT, Gemini, OpenRouter, MCP, browser, REST/GraphQL, DB, email, FS, OS, scheduler, webhooks, humans, agents, robots, and **future providers** all resolve through the same registries and pipeline; a new target adds a resolver/adapter, not a new engine.
- **New providers behind a target type.** Provider resolution + failover already abstract vendors; adding/swapping providers is registry data, not code paths in orchestration.
- **Smarter resolution.** Cost/latency-aware, region-aware, or model-tier routing evolves inside Provider Resolution behind the same "bind, never change the Command" contract.
- **Advanced resilience.** Circuit-breaker tuning, adaptive retry, hedged requests, bulkheads add within the failure architecture without touching upstream.
- **Distributed & multi-region execution.** Runtime isolation + correlation already support distributing runs across hosts/regions as a deployment concern, not a redesign.
- **Richer sandboxes.** New sandbox profiles (WASM, microVM) plug into the sandbox strategy per target type.
- **Structured simulation fidelity.** Mock / record-replay / shadow modes extend the simulation strategy behind `simulationMode`.
- **Cost governance.** Budget-aware admission control extends the queue using existing cost metrics + Plan budgets.
- **Deterministic replay & time-travel debugging.** Immutable runs + effect ledger + correlation already enable replay and reconstruction as consumers.

The invariant enabling all of the above: **one uniform pipeline; one Command per run, never changed; idempotent at-most-once effects; frozen authorized context; posture honored to the effect; everything traced and audited forever.** New demands plug into resolvers/adapters/registries and the failure/observability architectures without touching the effect boundary.

---

## 15. Architectural Principles

The permanent design principles governing Execution. If a future request conflicts with one of these, the request is wrong, not the principle.

1. **Execution performs; it never creates, reasons, plans, or means.** It runs Commands; instruction and intent live above, effects happen here.
2. **The runtime engine is uniform and terminal.** One pipeline performs every target kind; nothing derives from Execution — it is where description becomes effect.
3. **The Command is never changed.** Execution binds a Command to a runtime and selects a provider; it never mutates the instruction or payload.
4. **At-most-once by enforcement.** Idempotency is guaranteed via the effect ledger; retries, failover, replay, and double-fires never produce a second effect.
5. **Simulation and replay are safe by construction.** Non-`live` runs produce no real effect; replay never duplicates an effect; both use the identical instruction.
6. **Deterministic, observable, auditable, replay-safe.** Every run is reproducible, traced (correlation/cost/latency), and recorded immutably forever; validation and audit are never skipped.
7. **Resilient by architecture.** Retry, failover, circuit breaker, DLQ, timeout, rollback/compensation triggers, escalation — failure degrades gracefully, never silently corrupts, and cross-action recovery is the Workflow's, performed by Execution.
8. **Execution is the final enforcement gate.** Law/Security/Compliance/Policy/Mission/permissions/posture are enforced immediately before an effect; Execution enforces the ceiling and never raises it. Protective operations are never gated.
9. **Isolated and sandboxed.** Runs are tenant-isolated and target-sandboxed; one run cannot corrupt another or cross tenants; high-risk targets are contained before any real effect.
10. **Lifecycle and health are separate axes; context is frozen.** Lifecycle is governed existence; health is observed condition, in-flight only, automatic, never changing lifecycle; the authorization context is frozen at accept and never elevated mid-run.

---

## 16. What Execution will NEVER do

Explicit boundaries to prevent responsibility creep. If a future request asks Execution to do any of these, the answer is: it belongs to another module.

- **Never create Commands.** Commands are emitted by Workflows; Execution only performs them.
- **Never reason, decide, or plan.** No business logic, no branching decisions, no planning; provider resolution is mechanical, not judgment.
- **Never change the Command, its payload, or business intent.** It binds to a runtime; the instruction is immutable to it.
- **Never be the provider.** It calls Claude/ChatGPT/Gemini/APIs/tools; it is not them.
- **Never produce a real effect when non-`live`, duplicate an effect on replay/retry, or perform more than once per idempotency key.** Simulation caps, idempotency guarantees at-most-once.
- **Never skip validation or auditing, and never perform untraced.** Result validation, audit, and correlation are mandatory; a run that cannot audit fails closed.
- **Never override Law, Security/Compliance, Approved Policy, Mission, Goal, Plan, Task, Workflow, or Command.** It is the final enforcement point of the ceiling, never above it.
- **Never elevate permissions or widen posture mid-run.** The Execution Context is frozen at accept.
- **Never cross tenants or escape isolation/sandbox.** Every effect is tenant-scoped and contained.
- **Never mutate a terminal/archived run, and never lose or hide an effect, attempt, failure, retry, or cost.** History is immutable and auditable forever; re-performing is a non-destructive replay.

---

*End of Execution Specification v1.0. This document specifies the Execution module — the uniform, deterministic, observable, replay-safe runtime engine that performs Commands against any target, resolves providers, validates and persists effects, and records everything — in full and defines its permanent boundaries. It is the terminal layer of the Hebun cognitive-to-execution hierarchy. No implementation code. No SQL. No TypeScript. No other specification modified.*
