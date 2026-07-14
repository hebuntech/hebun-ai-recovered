# Architecture Consolidation Specification v1.0

> Stage 15 — Master Reference Architecture for Hebun AI.
> This document consolidates the entire Hebun Core. It defines **no new domain**. It specifies how the fourteen existing modules (34–47) fit into one coherent operating system, and it replaces every duplicated architectural pattern with **one canonical definition.**

**Status:** Definitive · Master Reference · **Scope:** the whole Hebun Core (Specs 34–47) · **Grounded in:** the schema primitives in `src/db/schema/_base.ts` and `_enums.ts`, and the Identity (34), Mission (35), Goal (36), Plan (37), Task (38), Workflow (39), Command (40), Execution (41), Agent (42), Working Memory (43), Long-term Memory (44), Knowledge (45), Reasoning (46), and Learning (47) Specifications v1.0.

**What this document is / is not.**
- **Is:** the single map of the system — boundaries, flows, matrices, canonical stacks, and the one definition of each shared pattern. The place any engineer starts.
- **Is not:** a redefinition of any module. Where this document and a module spec agree, they agree by design; where a module spec has detail, it governs its own internals; where this document defines a *shared* pattern, **it is canonical and the module specs defer to it.**

---

## 1. Purpose

Fourteen specifications defined fourteen modules, each rigorous, each self-consistent. But fourteen rigorous specs are not an architecture until someone defines **how they fit** — the boundaries between them, the flows through them, the patterns they share, and the single authority that reconciles them. Read separately, the specs repeat the same patterns (lifecycle/health separation, immutable audit, promotion, ratification, approval, authority ceiling, tenant isolation, provenance, lineage, versioning, replay) fourteen times, each in its own prose. Repetition is drift waiting to happen: fourteen slightly-different "immutable audit" definitions become fourteen slightly-different implementations.

This specification is the **consolidation**: one canonical definition per shared pattern, one set of stacks, one responsibility matrix, one map of information/control/authority/data/event/decision/learning/memory/knowledge flow. It makes the Hebun Core **one operating system**, not fourteen adjacent ones. Its purpose is threefold:

1. **Coherence.** Define the boundaries and flows so the modules interoperate as one system with no gaps and no overlaps.
2. **Canonicalization.** Replace every duplicated pattern across 34–47 with a single canonical definition the modules inherit — eliminating drift.
3. **Buildability.** Turn the specification set into an implementable plan: the enum/schema backlog, the shared backbones (event/audit/governance/authority enforcement), and the sequencing to build them safely.

---

## 2. Mental Model

Hebun is a **digital company operating system**. The mental model is a company, rendered in software:

- **Identity** is the org chart and the employee roster — who and what exists, who owns whom.
- **Mission → Goals → Plans → Tasks → Workflows → Commands → Execution** is the chain of **intent becoming action** — why the company exists, down to the single performed effect.
- **Agents** are the digital employees who do the work, bounded by their human owners.
- **Working Memory (desk), Long-term Memory (files), Knowledge (handbook)** are what the workforce holds in mind, remembers, and accepts as true.
- **Reasoning** is thinking; **Learning** is getting better at it.
- **Governance** (cross-cutting, realized in Identity/Mission/Policy and each module's gates) is the authority that approves, ratifies, and adjudicates.

The one-line model: **Hebun turns ratified purpose into performed, audited effects through bounded digital employees who think, remember, and improve — with authority flowing strictly downward, truth and intent changed only by governance, and every effect traceable to Mission.**

Two orthogonal spines organize everything (both first defined in Identity, canonical here):
- **Ownership spine (vertical):** `Company → Organization → Department → Team → Human/Agent` — where things live.
- **Intent spine (the cognitive chain):** `Mission → Goal → Plan → Task → Workflow → Command → Execution` — how purpose becomes effect.

Everything else (Memory, Knowledge, Reasoning, Learning) is a **substrate** the spines draw on: context, experience, truth, thinking, improvement.

---

## 3. Global Architecture

### 3.1 Core Architecture Diagram (textual)

```
                          ┌──────────────────────────────────────────────┐
                          │  AUTHORITY STACK (top = absolute)            │
                          │  Law → Security/Compliance → Approved Policy │
                          │        → Mission → Goals → Plans → Tasks     │
                          │        → Workflows → Commands → Execution     │
                          └──────────────────────────────────────────────┘
                                             ▲ bounds everything below

 OWNERSHIP SPINE (Identity, doc 34)                 COGNITIVE / INTENT SPINE
 ─────────────────────────────────                  ──────────────────────────
 Company                                             Mission        (35)  ── intent (ratified)
   └ Organization                                      → Goal       (36)  ── outcome (measurable)
       └ Department                                      → Plan     (37)  ── strategy
           └ Team                                          → Task   (38)  ── unit of work (describe)
               └ Human ── owns ──►  Agent (42)               → Workflow (39) ── orchestrate
                                     │  (digital employee,       → Command (40) ── executable instruction
                                     │   bounded by human)          → Execution (41) ── PERFORM (only effect layer)
                                     │
                    ┌────────────────┴─────────────────┐
                    │   COGNITIVE SUBSTRATE (per agent/company)          │
                    │   Working Memory (43) ── context (transient)       │
                    │   Long-term Memory (44) ── experience (durable)    │
                    │   Knowledge (45) ── truth (canonical)              │
                    │   Reasoning (46) ── thinking (stateless)           │
                    │   Learning (47) ── improvement (propose-only)      │
                    └───────────────────────────────────────────────────┘

 CROSS-CUTTING BACKBONES (canonical, §5–§10):
   Governance gates · Immutable Audit · Event bus · Observability · Tenant isolation · Provider abstraction · Security/Sandbox
```

### 3.2 The six pipelines

| Pipeline | Path | Owner modules |
|---|---|---|
| **Cognitive Pipeline** | Mission → Goal → Plan → Task | 35–38 |
| **Execution Pipeline** | Task → Workflow → Command → Execution | 38–41 |
| **Organizational Pipeline** | Company → Org → Dept → Team → Human → Agent | 34, 42 |
| **Memory Pipeline** | Working Memory → (promotion) → Long-term Memory → (promotion+ratification) → Knowledge; Knowledge/Memory → (read-only) → Working Memory | 43–45 |
| **Governance Pipeline** | draft → propose → review → approve/ratify → apply (per module gate) → immutable audit | cross-cutting (34, 35, 45, all gates) |
| **Learning Pipeline** | outcomes/traces/feedback → analyze (safety suite) → propose → approve → target-module apply (reversible) | 46, 47 → 42/44/45/39 |

### 3.3 The twelve flows (what moves where)

| Flow | Definition | Direction |
|---|---|---|
| **Information flow** | Facts/context/results moving between modules | multi-directional (read) |
| **Control flow** | Which module drives the next step | downward along the intent spine |
| **Authority flow** | Permission/authorization to act | strictly **downward** (never up) |
| **Data flow** | Durable records (memory/knowledge/audit) | into stores (governed writes only) |
| **Event flow** | Domain events, transactional with mutations | producer → bus → consumers |
| **Decision flow** | Commitments (Goals/Plans/Decisions) | governed, chain-owned |
| **Learning flow** | Improvement proposals | Learning → Governance → target module |
| **Memory flow** | Context/experience | WM ↔ LTM (promotion up, retrieval down) |
| **Knowledge flow** | Truth | LTM → Knowledge (promotion+ratification); Knowledge → consumers (read) |
| **Reasoning flow** | Conclusions | stores → Reasoning → chain (recommendation) |
| **Effect flow** | Real-world changes | only through Execution |
| **Feedback flow** | Outcomes/human feedback | Execution/humans → Learning |

**Invariant across all flows:** authority never flows upward; effects flow only through Execution; truth/intent change only through governance; every flow is auditable.

---

## 4. Module Ownership

**Ownership matrix — what each module owns (and nothing else owns):**

| Module | Owns | Never owns |
|---|---|---|
| **Identity (34)** | Actors, containers, memberships, roles, permission catalog, the ownership graph | Business data, decisions, agent behavior |
| **Mission (35)** | The company's ratified purpose (one North Star) | Goals, execution, authority verdicts |
| **Goal (36)** | Measurable desired outcomes | Work, schedules, Tasks |
| **Plan (37)** | Strategy (approach, milestones, work packages) | Runtime state, Tasks, execution |
| **Task (38)** | Smallest units of work (descriptions) | Workflow execution, Commands, effects |
| **Workflow (39)** | Orchestration (execution graph, recovery) | Business state/intent, provider calls |
| **Command (40)** | The universal executable instruction | Performance, provider binding, orchestration |
| **Execution (41)** | Runtime engine, effects, effect ledger | Command creation, reasoning, intent |
| **Agent (42)** | The digital-employee actor + config | Company/Mission/Goal/Policy, its own authority |
| **Working Memory (43)** | Transient session context | Durable memory/knowledge |
| **Long-term Memory (44)** | Durable retained experience (may conflict) | Truth, intent, permissions |
| **Knowledge (45)** | Canonical organizational truth (conflict-free) | Experience, rules, intent, decisions |
| **Reasoning (46)** | **Nothing durable** (conclusions + trace) | Any store, any decision, any commit |
| **Learning (47)** | Improvement proposals + audit | Behavior, authority, any store |

**Responsibility boundaries (the "does / never" one-liners):**
- Identity says **who**; Mission says **why**; Goal says **what outcome**; Plan says **how (strategy)**; Task says **what work**; Workflow says **how coordinated**; Command says **what action**; Execution **performs**; Agent **does the work (bounded)**; Working Memory **holds context**; Long-term Memory **remembers**; Knowledge **states truth**; Reasoning **concludes (recommends)**; Learning **improves (proposes)**.

---

## 5. Cross-Module Architecture

### 5.1 Module dependency matrix (row depends on column: R=reads, W=writes-via-governance, E=emits-to, ⟂=none)

| ↓ depends on → | Ident | Miss | Goal | Plan | Task | WF | Cmd | Exec | Agent | WM | LTM | Know | Reas | Learn |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| **Mission** | R | — | E | ⟂ | ⟂ | ⟂ | ⟂ | ⟂ | R | ⟂ | ⟂ | R | ⟂ | ⟂ |
| **Goal** | R | R | — | E | ⟂ | ⟂ | ⟂ | ⟂ | R | ⟂ | ⟂ | R | ⟂ | ⟂ |
| **Plan** | R | R | R | — | E | ⟂ | ⟂ | ⟂ | R | ⟂ | ⟂ | R | ⟂ | ⟂ |
| **Task** | R | R | R | R | — | E | ⟂ | ⟂ | R | ⟂ | R | R | ⟂ | ⟂ |
| **Workflow** | R | R | R | R | R | — | E | E | R | ⟂ | R | R | R | ⟂ |
| **Command** | R | R | R | R | R | R | — | E | R | ⟂ | R | R | R | ⟂ |
| **Execution** | R | R | R | R | R | R | R | — | R | ⟂ | W* | R | R | E |
| **Agent** | R | R | R | R | R | R | ⟂ | R | — | R | R | R | R | R |
| **Working Mem** | R | R | R | R | R | R | ⟂ | R | R | — | R | R | ⟂ | ⟂ |
| **Long-term Mem** | R | ⟂ | ⟂ | ⟂ | ⟂ | ⟂ | ⟂ | R | R | R(promote) | — | E(promote) | ⟂ | ⟂ |
| **Knowledge** | R | R | ⟂ | ⟂ | ⟂ | ⟂ | ⟂ | ⟂ | R | ⟂ | R(promote) | — | ⟂ | ⟂ |
| **Reasoning** | R | R | R | R | ⟂ | ⟂ | E(llm) | E | R | R | R | R | — | E |
| **Learning** | R | R | R | R | R | R | ⟂ | R | R(propose) | R | R(propose) | R(propose) | R | — |

*W\* = Execution writes to LTM/Knowledge **only** as the performer of a governed promotion Command — never a direct authority.*

### 5.2 Producer/Consumer matrix (who produces the artifact, who consumes it)

| Artifact | Producer | Consumers |
|---|---|---|
| Ratified Mission | Mission (via Governance) | Goal, Plan, Task, Agent, Reasoning, Knowledge-context |
| Goal | Goal (Governance-approved) | Plan, Reasoning, dashboards |
| Plan | Plan (Governance-approved) | Task (work packages) |
| Task | Task (from Plan) | Workflow |
| Workflow | Workflow (approved) | Execution (via Commands) |
| Command | Workflow node | Execution |
| Effect | Execution | Business modules, Learning (as outcome) |
| Conclusion (recommendation) | Reasoning | Goal/Plan/Decision, Agent, human |
| Memory (durable) | LTM (via promotion) | Working Memory (retrieval), Reasoning, Learning |
| Knowledge (truth) | Knowledge (via promotion+ratification) | Reasoning, Policy, Mission, Working Memory, Execution |
| Improvement proposal | Learning | Governance → Agent/LTM/Knowledge/Workflow |
| Domain event | every module | bus → subscribers |

### 5.3 The five canonical bridges (the only ways content crosses a boundary)

1. **Cognitive derivation** (`Mission→Goal→Plan→Task`): each cites its parent by `{id, version}`; downward derivation, upward reference, no upward mutation.
2. **Execution production** (`Task→Workflow→Command→Execution`): work packages → orchestration → instructions → performed effects; effects only at Execution.
3. **Memory promotion** (`Working Memory→Long-term Memory→Knowledge`): governed promotion up; read-only retrieval down; no direct write.
4. **Reasoning consumption** (`stores→Reasoning→chain`): read-only in, recommendation out; commits nothing.
5. **Learning proposal** (`outcomes→Learning→Governance→target`): propose in, governed apply out; changes no authority.

No content crosses a module boundary except through one of these five bridges. This is the master consolidation of every "X → Y" edge across 34–47.

---

## 6. Shared Lifecycle Model (canonical)

**This section replaces the fourteen per-module lifecycle/health definitions with one canonical pattern. Every module inherits it.**

### 6.1 The two-axis rule (canonical)

Every stateful entity in Hebun carries **two orthogonal fields**:
- **Lifecycle** (`*LifecycleStatusEnum`) — governed existence; changes **only** via governed transitions.
- **Health** (`*HealthEnum`) — observed condition; **auto-derived**; **never** causes a lifecycle transition; scoped to in-flight/active states; cleared to `unknown` on terminal states.

**Canonical invariants (all modules):**
1. Health never writes lifecycle; lifecycle is never *triggered* by a health value (may *read* it as human input).
2. Health is non-`unknown` only in active/in-flight states; terminal states force `unknown`, frozen.
3. Lifecycle transitions are governed and audited; health changes are observed and audited separately.
4. Health and lifecycle are **two independent event streams** (§10); consumers never infer one from the other.

### 6.2 Canonical lifecycle shape

All module lifecycles are a specialization of:

```
draft/created → proposed → (review/approve/ratify) → active/ratified → [in-flight sub-states]
   → terminal-positive (completed/achieved/concluded/applied)
   | terminal-negative (failed/cancelled/rejected/rolled-back)
   → superseded → archived → (soft-deleted → purged, governed erasure only)
```

Per-module lifecycle enums (canonical catalog, §Technical Debt Register): `missionState`, `goalLifecycleStatus`, `planLifecycleStatus`, `taskLifecycleStatus`, `workflowLifecycleStatus`, `commandLifecycleStatus`, `executionLifecycleStatus`, `agentLifecycleStatus`, `workingMemoryLifecycleStatus`, `memoryLifecycleStatus`, `knowledgeLifecycleStatus`, `reasoningLifecycleStatus`, `learningLifecycleStatus`. All specialize the shape above.

### 6.3 Canonical health shape

Health = `unknown | <positive> | <degraded> | <blocked-variant>`. The blocked-variant is module-specific (canonical mapping):
- Chain/execution modules (Goal/Plan/Task/Workflow/Command/Execution/Agent): `blocked`.
- Working Memory: `overflow | corrupted` (budget/integrity).
- Long-term Memory: `conflicted` (trust/conflict).
- Knowledge: `stale | contested` (freshness/challenge).
- Reasoning: `stalled` (recursion/budget).
- Learning: `diverging` (drift/bias/overfit).

**Rule:** the *positive/degraded/unknown* triad is identical everywhere; only the failure-mode variant differs by the module's real failure semantics.

---

## 7. Cross-Cutting Constraints (canonical patterns)

**This section is the single source for every pattern the module specs each restated. Modules defer here.**

| # | Canonical pattern | One definition (all modules inherit) |
|---|---|---|
| 1 | **Lifecycle/health separation** | §6. Two orthogonal fields; health never moves lifecycle. |
| 2 | **Versioning** | Every durable entity carries an immutable `version` (from `_base.ts`) + a domain `*Version` for material change. Corrections create versions; nothing durable is silently overwritten. |
| 3 | **Immutable audit** | Every mutation writes an append-only audit record, **transactional with the mutation** (a failed audit write rolls back the mutation). No un-audited change commits, anywhere. |
| 4 | **Lineage** | Corrections/supersessions link predecessor↔successor via `supersedes*Id`/`supersededBy*Id`; the chain is immutable and replayable. |
| 5 | **Provenance** | Every promoted/derived entity records its origin (source + producing session/record). No anonymous durable content. |
| 6 | **Promotion** | The only write path into a durable store from a transient one (WM→LTM). Governed, validated, deduplicated, provenance-stamped. No direct write. |
| 7 | **Ratification** | The stronger gate for *authoritative* content (Mission truth-of-purpose, Knowledge truth-of-fact). Promotion + independent review + approval; canonical, conflict-free, atomic supersession. |
| 8 | **Approval** | The governed gate for *committed intent/action* (Goal/Plan/Task/Workflow/Command). Reuses `approvalStateEnum` (`not-required/pending/approved/rejected`). |
| 9 | **Authority ceiling** | An actor's effective authority = min(assigned permissions, its human owner's current authority). Agents ≤ their human. Recomputed continuously. **Canonical source: Agent §4 / Identity §6.** |
| 10 | **Separation of duties** | The proposer/author of a sensitive change cannot be its sole approver/ratifier. Applies to every gate. |
| 11 | **Tenant isolation** | `tenantId` NOT NULL FK on every tenant-owned row; cross-tenant access structurally impossible; cross-tenant sharing is a governed export only. |
| 12 | **Replay** | Deterministic assembly/derivation + immutable records make sessions/effects replayable read-only (bounded by retention); replay never re-commits or duplicates effects. |
| 13 | **Simulation** | Environment posture (`providerStatusEnum`: simulation/dry-run/read-only/blocked/live) propagates Mission→…→Command; non-`live` produces no real effect; posture only narrows, never silently widens. |
| 14 | **Provider independence** | No module binds a provider SDK; targets resolve via registries at Execution time; multi-model/failover behind the abstraction. |
| 15 | **Event-sourcing assumptions** | Events are transactional with mutations, carry version/correlation, are idempotent-consumable (discard stale/duplicate), and are the only cross-module reaction surface (no direct table reads). |
| 16 | **Governance gates** | Every state advance that commits intent, ratifies truth, promotes memory, or applies learning passes a governed gate with authority + separation-of-duties + audit. |

**Consolidation rule (hard requirement satisfied):** wherever a module spec (34–47) states one of the above patterns, **this table is the canonical definition**; the module spec's prose is an instance, not an independent definition. Any divergence is a defect resolved in favor of this table.

---

## 8. Validation Model (canonical)

Every module validates at the same canonical gate sequence (specialized per module):

```
1. Binding validation      — references resolve, same-tenant, consistent lineage
2. Structural validation   — required fields present, acyclic graphs, well-formed
3. Authority validation    — actor within ceiling; permissions permit; separation of duties
4. Authority-stack validation — no violation of Law/Compliance/Policy/Mission/parent; conflict → block + human resolution
5. Content/semantic validation — module-specific (measurability, determinism, canonical-consistency, safety-suite…)
6. Gate validation         — approval/ratification/promotion authority satisfied
7. Continuous re-validation — on parent change (Mission ratify, Goal redefine, Plan revise…), re-check; drift → Governance event
8. Health validation       — health scoped to active; unresolved inputs → unknown; never moves lifecycle
```

**Canonical fail-closed rule:** on any ambiguity, a module refuses to advance, surfaces nothing out-of-scope, commits nothing, and destroys nothing. Every module in 34–47 already states this; it is canonical here.

---

## 9. Relationships (the canonical stacks + responsibility matrix)

### 9.1 Canonical Authority Stack

```
Law and Regulation                     (external, absolute)
  → Security and Compliance Policy
    → Approved Company Policy
      → Mission
        → Goals
          → Plans
            → Tasks
              → Workflows
                → Commands
                  → Execution
                    → Agent  (performs within all above; bounded by human owner)
                      → Working Memory → Long-term Memory → Knowledge → Reasoning → Learning  (substrate; authoritative only within their concern)
```

**One enforcement mechanism (canonical):** the stack is enforced at **two canonical points** — (a) at every governance gate (nothing commits/ratifies/promotes that violates a higher layer), and (b) at **Execution's final gate**, immediately before any effect (the last line before the world changes). Protective operations (Mission §7.8) are the sole exemption path and always run. No module enforces the stack in isolation; these two points are the canonical checkpoints.

### 9.2 Canonical Cognitive Stack

`Mission → Goal → Plan → Task` — intent decomposed into describable work. Each node cites its parent `{id, version}`; downward derivation, upward reference, continuous alignment re-validation.

### 9.3 Canonical Execution Stack

`Task → Workflow → Command → Execution` — description → orchestration → instruction → performed effect. Effects only at Execution; at-most-once via idempotency; provider-independent.

### 9.4 Canonical Memory Stack

`Working Memory (transient) → Long-term Memory (durable, may conflict) → Knowledge (canonical truth)` — promotion up (governed), retrieval down (read-only). Knowledge overrides Memory in reasoning.

### 9.5 Canonical Governance Stack

`draft → propose → review → approve/ratify → apply → immutable audit` — the one shape for every governed change (approval for intent, ratification for truth/purpose, promotion for memory, learning-approval for improvement). Authority + separation of duties + audit at every gate.

### 9.6 Canonical Learning Stack

`outcomes/traces/feedback → analyze (safety suite, causation-tested) → propose (versioned/reversible) → approve → target-module apply → observe/rollback` — improve behavior, never authority.

### 9.7 Canonical Responsibility Matrix (RACI-style, one per module)

| Module | Responsible for | Accountable to | Consults | Informs |
|---|---|---|---|---|
| Identity | Actors/containers/permissions | Company/Governance | — | all |
| Mission | Purpose | Owner/Governance | Knowledge | Goals, all |
| Goal | Outcomes | Director/Governance | Mission, Knowledge | Plans |
| Plan | Strategy | Owner/Governance | Goal, Knowledge | Tasks |
| Task | Units of work | Plan owner | Plan, Agent | Workflow |
| Workflow | Orchestration | Owner | Tasks, Reasoning | Execution |
| Command | Instruction | Workflow node actor | — | Execution |
| Execution | Effects | Platform/tenant | Registries, Policy | Business, Learning |
| Agent | Doing work | Human owner/Manager | Reasoning, Memory, Knowledge | Governance |
| Working Memory | Context | Agent | LTM, Knowledge | Reasoning |
| Long-term Memory | Experience | Company/Agent | Governance | Working Memory, Learning |
| Knowledge | Truth | Company/Steward | Governance, LTM | all consumers |
| Reasoning | Conclusions | Agent | WM, LTM, Knowledge | chain, human |
| Learning | Improvement proposals | Governance | outcomes, traces | target modules |

---

## 10. Global Events (canonical event backbone)

### 10.1 Canonical event envelope

Every event, every module, carries: `{eventId, eventType, tenantId, actorRef, entityId, entityVersion, correlationId, causationId?, occurredAt, payload}`. Emission is **transactional with the mutation**; consumers dedup by `entityVersion`/`eventId`; events are the **only** cross-module reaction surface (no direct table reads).

### 10.2 Event producer table (canonical roll-up)

| Producer | Representative events |
|---|---|
| Identity | `Identity*`, `Membership*`, `Role/Permission*`, `EmergencyAccessActivated` |
| Mission | `MissionRatified/Superseded/Amendment*`, `MissionAlignmentViolationDetected` |
| Goal | `Goal{Drafted,Approved,Activated,Achieved,Superseded,DriftDetected}`, `GoalHealthChanged` |
| Plan | `Plan{Approved,Activated,ReadinessChanged,Completed,DriftDetected,BudgetBreached}` |
| Task | `Task{Ready,Assigned,Started,Completed,Failed,DriftDetected}`, `TaskHealthChanged` |
| Workflow | `Workflow{Released,Started,CommandEmitted,Rollback*,Compensation*,Completed,Failed}` |
| Command | `Command{Created,Validated,Released,Completed,Failed,Simulated,Replayed}` |
| Execution | `Execution{Accepted,EffectPersisted,Completed,Failed,Compensated}`, `Provider*`, `Circuit*`, `DeadLetterQueued` |
| Agent | `Agent{Activated,Assigned,Escalated,Suspended,Replaced}`, `AgentCeilingRecomputed`, `AgentAuthorityViolationAttempted` |
| Working Memory | `WorkingMemory{Hydrated,Compressed,PromotionProposed,Disposed}`, `*IsolationBreachDetected` |
| Long-term Memory | `Memory{Promoted,Corrected,Superseded,SoftDeleted,Purged,PromotedToKnowledge}` |
| Knowledge | `Knowledge{Ratified,Superseded,Corrected,Deprecated,Contested}`, `*AccessViolationAttempted` |
| Reasoning | `Reasoning{Concluded,InsufficientEvidence,Escalated,ContradictionDetected}` |
| Learning | `Learning{Proposed,Approved,Applied,RolledBack,SafetyFlagRaised}` |

### 10.3 Event consumer table (canonical roll-up)

| Consumer | Subscribes to (representative) |
|---|---|
| Governance | all `*DriftDetected`, `*ViolationAttempted`, `*SafetyFlagRaised`, ratification/approval/promotion events |
| Execution | `CommandReleased`, `WorkflowCommandEmitted`, `PlanReadinessChanged` |
| Workflow | `TaskReady`, `ExecutionCompleted/Failed`, `RollbackTriggered` |
| Task | `PlanApproved/Revised`, `WorkflowNode*` |
| Goal/Plan | `MissionRatified/Superseded` (re-anchor) |
| Working Memory | `MemoryRetrieved`, `KnowledgeRatified` |
| Learning | `Execution*`, `Reasoning*`, human feedback, `*Completed/Failed` |
| Dashboards/Observability | all lifecycle + health + metrics events |
| Audit | **all events** (immutable sink) |

### 10.4 Canonical stream separation

Two independent event streams everywhere: **lifecycle events** (governed transitions) and **health events** (observed condition). A consumer never infers lifecycle from health or vice-versa. (Consolidates the identical note in every module spec.)

---

## 11. System KPIs

| KPI | Definition | Rolls up from |
|---|---|---|
| **End-to-end traceability** | % of effects traceable Execution→…→Mission (target 100%) | audit chain (all) |
| **Authority conformance** | % of actions within the authority stack + ceilings (target 100%) | Agent/Execution/Governance |
| **Sovereignty-guard incidents** | Count of authority-change / self-* attempts (target 0) | Agent, Learning |
| **Mission alignment** | % of active Goals/Plans/Tasks aligned to current Mission | Mission/Goal/Plan drift |
| **Decision integrity** | % of decisions committed via governance (no Reasoning self-commit) | chain + Reasoning |
| **Truth consistency** | Active Knowledge contradictions (target 0) | Knowledge |
| **Memory governance** | % of durable memory via governed promotion (target 100%) | LTM |
| **Improvement safety** | % of applied learning that is reversible + causation-tested (target 100%) | Learning |
| **Effect safety** | % of non-live runs with zero real effects; idempotency no-op correctness | Execution |
| **Audit completeness** | % of mutations with an immutable trail (target 100%) | all |
| **System health** | Composite of per-module health distributions | all `*HealthChanged` |
| **Cost governance** | Cost attributed per lineage vs budgets | Execution → Plan/Agent |

---

## 12. Failure Scenarios (system-level, 50)

Cross-module failures and the system's canonical reaction. Governing rule: **the system fails closed, bounded, and auditable** — no gap, no overlap, no silent authority change, no un-audited effect.

1. **Effect without Mission trace.** Blocked — every effect must trace to a ratified Mission; a lineage break refuses execution.
2. **Two active Missions.** Impossible — canonical single North Star; second ratification supersedes/rejects.
3. **Goal with no Mission ref.** Rejected at Goal gate.
4. **Plan atop unapproved Goal.** Cannot approve.
5. **Task atop unapproved/not-ready Plan.** Cannot reach ready.
6. **Workflow consuming unready Task.** Cannot release.
7. **Command from un-released Workflow.** Cannot validate.
8. **Execution of unvalidated Command.** Refused at intake.
9. **Direct provider call from Workflow/Command/Agent.** Refused — effects only at Execution.
10. **Double effect on retry.** Idempotency no-op; at-most-once.
11. **Live effect under non-live posture.** Refused at Execution's final gate + Command posture.
12. **Authority stack violation at runtime.** Blocked at Execution final gate; escalated to human.
13. **Agent exceeds human ceiling.** Refused; `AgentAuthorityViolationAttempted`.
14. **Owner authority drops.** `AgentCeilingRecomputed`; agent authority reduced immediately; over-ceiling work halted.
15. **Agent self-approves/self-elevates/self-replicates.** Refused; sovereignty guard.
16. **Working Memory writes LTM directly.** Refused — promotion only.
17. **LTM writes Knowledge directly.** Refused — promotion+ratification only.
18. **Knowledge holds a contradiction.** Impossible — conflict resolved before ratification.
19. **Memory redefines Knowledge.** Refused — Knowledge overrides Memory.
20. **Reasoning commits a decision.** Refused — no commit path; conclusion is a recommendation.
21. **Reasoning edits a store.** Refused — consume-only.
22. **Reasoning hides uncertainty.** Impossible — mandatory evidence/uncertainty/citations; unknown is valid.
23. **Learning changes authority/permissions.** Invalid — not learnable; refused.
24. **Learning self-applies.** Refused — Governance approves, target applies.
25. **Failed learning becomes behavior.** Blocked — sandbox/shadow/validation gate.
26. **Correlation treated as causation.** Blocked — causation-tested before proposal.
27. **Cross-tenant access (any module).** Structurally impossible.
28. **Un-audited mutation (any module).** Rolled back — audit transactional with mutation.
29. **Health drives lifecycle (any module).** Refused — orthogonal axes.
30. **Terminal entity mutated (any module).** Refused — immutability.
31. **Silent overwrite (any durable).** Refused — versioned, corrections create versions.
32. **Mission superseded, stale Goals.** Goals flagged for re-derivation; not silently honored.
33. **Knowledge superseded, stale consumers.** Consumers re-anchor on `KnowledgeRatified`.
34. **Plan/Goal drift mid-execution.** `*DriftDetected` → halt/escalate; never proceeds against dead intent.
35. **Provider outage.** Failover → circuit breaker → DLQ; graceful, audited.
36. **Rollback fails.** Compensation → escalation → consistent, flagged terminal; never silent partial state.
37. **Escalation with no human.** Waits escalated; never self-resolves.
38. **Event bus lag / duplicate.** Idempotent consumption; version-dedup.
39. **Audit backend down.** Fail closed — no untraced effect.
40. **Simulation leaks a real effect.** Impossible — posture propagated to the effect boundary.
41. **Replay duplicates an effect.** Impossible — idempotency-guarded.
42. **Recursion/loop in reasoning/learning.** Guards trip → escalate/insufficient.
43. **Cost runaway.** Budget breach → halt/escalate; attributed.
44. **Secret leaked to trace/memory/knowledge.** Redacted/refused; secrets never plain-stored.
45. **Suspended agent's in-flight work.** Halted/reassigned; nothing runs under suspension.
46. **Bias/overfit/hallucination reinforced.** Learning safety suite blocks.
47. **Metric gaming (goodhart).** Drift detection blocks; intent protected.
48. **Circular derivation/citation/dependency.** Acyclicity checks reject.
49. **Legal hold vs erasure.** Erasure refused under hold; escalated.
50. **A module tries to do another's job** (e.g. Knowledge reasons, Reasoning stores, Learning applies). Refused — canonical responsibility matrix enforced; layer violation audited.

---

## 13. Enterprise Use Cases (end-to-end, 50)

Whole-system flows, showing modules interoperating. Each is a path across the stacks.

1. **Company founding.** Identity creates company + owner → Mission ratified → first strategic Goals approved → the OS is operational.
2. **Strategy to effect.** Goal → Plan (approved, ready) → Tasks → Workflow (released) → Commands → Execution performs → effect audited to Mission.
3. **Hiring an agent.** Identity+Agent create `Atlas` (bounded) → configured → activated → assigned Tasks.
4. **Agent does work.** Agent opens Working Memory → retrieves Memory+Knowledge → Reasoning concludes → drives Workflow → Commands → Execution.
5. **Reasoning defers to truth.** Memory conflicts with Knowledge; Knowledge overrides; conclusion cites both.
6. **Insufficient evidence.** Reasoning returns `insufficient-evidence`; escalates; human decides.
7. **Governed decision.** Reasoning recommends; the chain commits a Goal/Plan change under governance.
8. **Memory promotion.** A useful experience is promoted from Working Memory to Long-term Memory (governed).
9. **Knowledge ratification.** A corroborated semantic memory is promoted+ratified into Knowledge; consumers re-anchor.
10. **Learning improves an agent.** Outcomes → Learning proposes a skill improvement → Governance approves → Agent reconfigured (no ceiling change).
11. **Mission pivot.** Mission re-ratified atomically; Goals/Plans/Tasks re-validated; misaligned ones flagged.
12. **Policy change strands intent.** Approved policy conflicts with a Goal; execution blocks; human resolves.
13. **Idempotent payment.** Command retried; Execution effect-ledger no-ops the duplicate; charged once.
14. **Provider failover.** LLM provider down; Execution fails over; unchanged Command.
15. **Rollback saga.** Workflow step fails; Execution fires rollback trigger; inverse Commands unwind to consistency.
16. **Compensation.** Irreversible send fails downstream; compensating Command corrects; run `compensated`.
17. **Human-in-the-loop.** Workflow pauses at approval gate; human approves; resumes deterministically.
18. **Multi-agent collaboration.** Workflow coordinates agents; each bounded; results reconciled.
19. **Simulation rehearsal.** A whole workflow runs in simulation; zero effects; evidence for go-live.
20. **Emergency access.** Break-glass grants time-boxed elevation; loudly audited; auto-revoked.
21. **GDPR erasure.** Customer memory purged via governed flow; tombstone; Knowledge mostly retired not erased.
22. **Auditor replay.** An effect is reconstructed end-to-end: Execution→Command→Workflow→Task→Plan→Goal→Mission, with reasoning trace and citations.
23. **Drift alarm.** Company action diverges from Mission; drift events surface to leadership.
24. **Contested truth.** A Knowledge fact is challenged; `contested`; reasoning weighs cautiously; governance resolves.
25. **Confidence calibration.** Learning closes the loop; Reasoning's future confidence improves (governed config).
26. **Cross-agent learning.** A discovered procedure is distilled and governed-shared to peers.
27. **Cost governance.** A pricey run nears the Plan budget; breach escalates; cost attributed.
28. **Suspended agent.** Security suspends an agent; work halts/reassigns; memory retained.
29. **Department scaling.** Ten operator agents hired; each bounded, cost-limited; utilization tracked.
30. **Subsidiary/organization.** New org under the company; scoped sub-missions/goals aligned beneath the North Star.
31. **M&A.** Two tenants merged; everything stays per-tenant; reconciliation by governed supersession within each.
32. **Regulatory market entry.** Plan carries a compliance gate; without sign-off, no execution.
33. **Failure learning.** A costly failure is root-caused; a reversible fix proposed and governed-applied.
34. **Hallucination blocked.** A model fabricates a "fact"; Reasoning flags it; Learning refuses to reinforce it.
35. **Metric-gaming blocked.** A change improves a vanity metric while harming the Goal; drift detection blocks.
36. **Ownership handoff.** A departing human's agents/goals/plans re-owned before archival; nothing orphaned.
37. **Portfolio rebalance.** Governance shifts execution capacity across approved Plans by priority; definitions unchanged.
38. **Knowledge-driven execution.** Execution reads the canonical tax rate to bill correctly; never writes Knowledge.
39. **Working-memory overflow.** A long session hits its token budget; compress→summarize→overflow→governed shed.
40. **Reasoning replay for a dispute.** "Why did the agent recommend X?" reconstructed from the trace + citations.
41. **Learning rollback.** An applied improvement regresses; governed rollback restores the prior version.
42. **Break-glass in an incident.** Protective operations run even mid-Mission-amendment (exempt).
43. **Cross-domain knowledge link.** Finance truth references legal truth; consistency-checked.
44. **Event-driven fulfillment.** Order event → Workflow → Commands → Execution; idempotent against double-fire.
45. **Scheduled batch.** Nightly reconciliation scheduled; concurrency-limited; audited.
46. **Sandbox learning.** A risky procedure change evaluated in sandbox before any proposal.
47. **Steward review.** Stale Knowledge flagged; steward re-ratifies or corrects.
48. **Human override.** A human rejects a conclusion/improvement; the human decision stands.
49. **Full observability.** Ops watches health/cost/drift/escalation across all 14 modules on one surface.
50. **A year of operation.** The workforce measurably improves — skills, procedures, calibration, truth coverage — while authority, identity, and permissions remain exactly what governance set. **Better behavior, unchanged authority, every effect auditable to Mission.**

---

## 14. Extensibility

- **New modules** attach via the five canonical bridges (§5.3) and inherit §6–§10 patterns — no bespoke integration.
- **New enums/targets/strategies** extend their module's enum without touching the canonical patterns.
- **New pipelines** compose from existing stacks (§9).
- **Federation / multi-region / marketplace** are deployment/governance concerns behind the tenant + provider + governance boundaries — not architecture changes.
- The **canonical patterns (§7)** are the stable core; modules and features plug into them. The architecture scales by adding instances of known patterns, never new pattern definitions.

---

## 15. Architectural Principles (the canonical ten)

1. **Authority flows down, never up.** Law→…→Execution→Agent→substrate; nothing raises its own authority.
2. **Intent becomes effect only through the chain.** Mission→Goal→Plan→Task→Workflow→Command→Execution; effects only at Execution; every effect traces to Mission.
3. **Truth and intent change only through governance.** Ratification (Mission/Knowledge), approval (chain), promotion (memory), learning-approval (behavior) — never silent, never self.
4. **Lifecycle is governed; health is observed; they never cross.** One canonical two-axis model.
5. **Everything durable is versioned, provenanced, lineaged, and immutably audited.** Nothing silently overwrites; nothing un-audited commits.
6. **Memory remembers, Knowledge is true, Reasoning concludes, Learning improves — and none of them decides or acts.** Deciding is the chain's; acting is Execution's.
7. **Agents are digital employees, never sovereigns.** Bounded by their human, forever; improvement never becomes authority.
8. **Fail closed, bounded, and auditable.** On ambiguity: refuse, surface, escalate; never guess, leak, or destroy.
9. **Tenant-isolated, provider-independent, simulation-safe.** Structural isolation; no SDK lock-in; non-live never affects the world.
10. **One canonical definition per pattern.** No pattern is defined twice; modules inherit from this master reference.

---

## 16. What Hebun Core NEVER does

- **Never lets authority flow upward or be self-raised.**
- **Never produces an effect outside Execution, or an untraceable effect.**
- **Never changes truth, intent, memory, or authority without governance.**
- **Never lets a module do another module's job** (the responsibility matrix is enforced).
- **Never lets Reasoning commit, Learning apply, Knowledge conflict, Memory be authoritative, or an Agent become sovereign.**
- **Never overwrites durable content silently, or commits an un-audited change.**
- **Never leaks across tenants, locks to a provider, or lets a non-live run affect the world.**
- **Never defines a shared pattern twice** — divergence from this master reference is a defect.

---

## Implementation Assumptions

- This document is the **master reference**; module specs 34–47 govern their internals and defer to §6–§10 for shared patterns. On conflict about a shared pattern, this document wins.
- The Hebun Core is implemented on the existing `src/db/schema` foundation (`_base.ts` `rootColumns`/`tenantColumns`, `_enums.ts`). Existing tables (`company`, `user`, `agent`, `memory`, `knowledge`, `reasoning`, `workflow`, `command`, `execution`, `task`, `policy`, `permission`, …) are **extended** to realize the specs, not replaced.
- Shared backbones must be built **once**: the event envelope + bus (§10.1), the immutable audit sink (§7.3), the governance-gate contract (§9.5), and the two authority-enforcement checkpoints (§9.1). Modules consume these; they do not each reimplement them.
- The two-axis lifecycle/health pattern (§6) should be a **shared library/contract**, not copied per module.

## Open Questions

- **Decision module.** The specs reference a "cognitive chain commits decisions" but no standalone Decision spec exists (it's distributed across Goal/Plan + Governance). Is a dedicated Decision Specification needed, or is it canonically the Goal/Plan approval + Governance gate?
- **Governance module.** Governance is cross-cutting (Identity permissions + each module's gate) but has no single spec. Should a Governance Specification consolidate approval/ratification/promotion/learning-approval authority into one contract?
- **Policy module depth.** Policy is referenced as authoritative-rules (above Mission) but its own full spec (like Knowledge for truth) is not in 34–47. A Policy Specification may be owed.
- **Event bus semantics.** Event-sourcing is *assumed*; is the system truly event-sourced (events as source of truth) or state-with-events? This must be decided before implementation.
- **Human-review surface.** "Human review overrides" appears in Mission/Reasoning/Learning/Execution; is there one canonical human-review/approval inbox, or per-module?

## Implementation Priorities

1. **Foundation (P0):** shared backbones — audit sink, event envelope/bus, governance-gate contract, authority-enforcement checkpoints, two-axis lifecycle/health library, tenant-isolation enforcement.
2. **Identity (P0):** actors/containers/permissions/ceiling — everything depends on it.
3. **Cognitive + Execution spine (P1):** Mission→Goal→Plan→Task→Workflow→Command→Execution — the value-producing path.
4. **Agent (P1):** the digital employee that drives the spine.
5. **Memory substrate (P2):** Working Memory → Long-term Memory → Knowledge (promotion/ratification pipelines).
6. **Reasoning (P2):** thinking over the substrate.
7. **Learning (P3):** improvement, once there are outcomes to learn from.

## Migration Priorities

1. **Enum catalog (P0):** define + migrate the ~40 new enums (all `*LifecycleStatusEnum`, `*HealthEnum`, `*ScopeEnum`, `*TypeEnum`) as one consolidated batch with a single naming convention.
2. **Base extensions (P0):** wire `_base.ts` `createdBy`/`updatedBy` actor FKs (deferred since foundation), add lineage/provenance/version columns per the shared pattern.
3. **Table extensions (P1):** extend existing module tables to realize their specs (namespace/provenance/scope for memory/knowledge; graph/recovery for workflow; anatomy for command/execution; capabilities/limits for agent).
4. **Governance/audit/event tables (P0):** the shared backbones' storage.
5. **Sequencing rule:** never migrate a module's tables before its dependencies' (follow §5.1 + Implementation Priorities); never ship a lifecycle enum without its health enum.

## Technical Debt Register

| # | Debt | Origin | Severity | Resolution |
|---|---|---|---|---|
| TD-1 | ~40 new enums defined across specs 35–47, **none migrated** | all module specs | **High** | Migration P0 — one consolidated enum batch |
| TD-2 | `_base.ts` `createdBy`/`updatedBy` actor FK still deferred ("added when identity wired") | Identity §3 / `_base.ts` | High | Migration P0 — wire actor refs |
| TD-3 | Shared patterns (audit/event/lifecycle-health/governance) restated 14× in prose | all specs | **High** | This doc §6–§10 canonicalizes; build once as shared libs |
| TD-4 | No standalone Decision, Governance, or Policy spec | 34–47 | Medium | Open Questions — decide if owed |
| TD-5 | Event-sourcing is assumed, not decided | §7.15, §10 | Medium | Decide state-vs-event-sourced before P0 |
| TD-6 | Naming conventions vary (`*LifecycleStatus` vs `*State`) e.g. Mission uses `missionState` | Mission vs others | Low | Consolidate to one convention pre-migration |
| TD-7 | Existing tables (`memory`, `knowledge`, `reasoning`, `workflow`, `command`, `execution`) predate the specs; reconciliation unspecified | repo vs specs | Medium | P1 — extension map per module |
| TD-8 | Human-review surface fragmented across modules | Mission/Reasoning/Learning/Execution | Low | Open Questions — one inbox vs per-module |
| TD-9 | Cross-tenant export/federation flows referenced, never specified | LTM/Knowledge/Learning | Low | Future spec |
| TD-10 | Cost-governance attribution spans Execution→Plan→Agent but no single ledger spec | Execution/Plan/Agent/Learning | Medium | Define a cost-attribution backbone |

---

*End of Architecture Consolidation Specification v1.0 — the Master Reference Architecture for Hebun AI. It defines no new domain; it consolidates the fourteen modules (34–47) into one coherent operating system, replaces every duplicated pattern with one canonical definition, and specifies the boundaries, flows, stacks, matrices, and the plan to build it. No implementation code. No SQL. No TypeScript. No module specification modified.*
