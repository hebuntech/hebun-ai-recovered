# Working Memory Specification v1.0

> Stage 10 — Working Memory module, complete Enterprise Architecture Specification.
> This document is the permanent architectural reference for Working Memory in Hebun AI.
> It specifies the temporary cognitive workspace an Agent uses while performing work. It adds no implementation. It defines boundaries.

**Status:** Definitive · **Scope:** Working Memory module only · **Grounded in:** the schema primitives in `src/db/schema/_base.ts` (`rootColumns`, `tenantColumns`) and `_enums.ts` (`lifecycleStatusEnum`, `approvalStateEnum`, `memoryKindEnum`, `providerStatusEnum`, `roleTypeEnum`, `permissionScopeEnum`), and the Identity (34), Mission (35), Goal (36), Plan (37), Task (38), Workflow (39), Command (40), Execution (41), and Agent (42) Specifications v1.0.

**Position in the cognitive hierarchy:**

```
Agent (doc 42)  — the digital employee
  → Working Memory   ← this document — the Agent's TEMPORARY active cognitive workspace
    → Reasoning        — thinks using the workspace
      → Workflow         — coordinates the resulting work
        → Command          — the executable instruction
          → Execution        — performs it
```

**Authority precedence (unchanged, absolute):**

```
Law → Security/Compliance → Approved Policy → Mission → Goals → Plans → Tasks → Workflows → Commands → Execution → Agent → Working Memory
```

Working Memory is the **active cognitive workspace of an Agent** — the scratchpad it thinks in while performing a unit of work. It exists **only while work is active**: temporary, contextual, isolated, deterministic, **disposable**. It assembles the context an Agent needs (mission/goal/plan/task/workflow context, retrieved knowledge and memories, tool/execution results, intermediate reasoning), supports reasoning and execution, and is **thrown away at expiration**. It **never** automatically becomes Long-term Memory or Knowledge.

**Critical clarification — Working Memory is a workspace, not a store:**

> Working Memory is **NOT** Knowledge. Working Memory is **NOT** Long-term Memory. Working Memory is **NOT** Reasoning.
>
> Working Memory is the **temporary cognitive workspace** an Agent uses *while performing work* — the RAM of a digital employee, not its disk (Long-term Memory) and not the company library (Knowledge), and not the thinking itself (Reasoning). It *holds* the context reasoning operates on; it does not *think*, *remember permanently*, or *own knowledge*.

---

## 1. Purpose

### Why the Working Memory layer exists

An Agent (doc 42) coordinates capabilities to perform delegated work. To reason about a Task, an Agent needs a coherent, bounded, current **context**: what mission/goal/plan/task it is serving, the conversation so far, the memories and knowledge it retrieved, the tool and execution results it has seen, the pending decisions and open questions, and the active constraints. That context must be assembled, held while the work runs, kept within a token budget, isolated from other work, made deterministic and replayable, and then **disposed of** when the work ends — so that transient thinking does not silently pollute permanent memory or the company's knowledge. Working Memory is that workspace.

Working Memory is the **system of record for an Agent's active cognitive context during a unit of work.** It is the RAM of the digital workforce: fast, temporary, per-session, bounded, isolated, and disposable. It is where retrieval, reasoning, and execution results converge into the working context an Agent acts from — and it is deliberately *not* durable, because durability belongs to Long-term Memory (permanent recollection) and Knowledge (the shared corpus), which are separate, governed, promotion-gated modules.

Without a Working Memory layer, six things break: context is unstructured (each capability sees a different partial view), token budgets are unmanaged (context overflows the model), isolation is absent (one task's context bleeds into another), determinism is lost (reasoning is unreplayable), promotion is uncontrolled (transient scratch silently becomes permanent memory/knowledge), and observability is impossible (no record of what the Agent actually knew when it decided). Working Memory closes that gap and holds the **workspace boundary**: temporary context that supports work and then disappears, never leaking into the durable stores except through an explicit, governed promotion.

### Business problem it solves

1. **Coherent, bounded context.** An Agent must reason from one assembled, current, token-budgeted context — not a pile of disconnected fragments. Working Memory assembles and bounds that context.
2. **Isolation and determinism.** Each unit of work must think in its own isolated workspace, and that thinking must be replayable for audit and debugging. Working Memory isolates per session and records deterministically.
3. **Safe disposability.** Transient thinking must not silently become permanent. Working Memory is disposable by default and **never auto-promotes** to Long-term Memory or Knowledge — promotion is an explicit, governed act.

### Its responsibility

- Own the lifecycle of every cognitive workspace: `created → hydrated → active → updated → compressed → expired → disposed → archived` (governed), separate from health `unknown → healthy / degraded / overflow / corrupted` (observed).
- Guarantee every Working Memory belongs to exactly one Agent and exactly one active session, with defined context boundaries, a token budget, and an expiration policy.
- **Assemble context** (context-assembly architecture) from its sources: conversation, task/workflow context, retrieved long-term memories, knowledge retrieval, execution results, human input, system events, tool/browser outputs.
- **Manage the token budget** via compression and summarization while preserving determinism and replayability.
- **Isolate** each workspace so no context bleeds across sessions/agents/tenants.
- **Support reasoning and execution** by exposing the assembled, current context — without itself reasoning or executing.
- **Dispose** at expiration; **never survive** past expiration unless explicitly, governedly promoted.
- Emit Working Memory events so Reasoning, the Agent, Governance, and observability react to workspace status and health.
- Preserve an immutable, replayable audit record of the workspace's assembly and evolution (for the retention the policy allows).

### What is explicitly NOT its responsibility

- **Working Memory never becomes Long-term Memory or Knowledge automatically.** Promotion is an explicit, governed, separate act (Long-term Memory / Knowledge modules own the durable stores); the workspace never self-persists.
- **Working Memory never modifies Long-term Memory or Knowledge.** It *reads* from them (retrieval); it never writes back into the durable stores. Any durable write is a governed promotion, not a Working Memory mutation.
- **Working Memory never reasons.** It holds the context reasoning uses; the thinking is Reasoning's (via LLM Commands performed by Execution).
- **Working Memory never executes.** It holds execution results; the performing is Execution's.
- **Working Memory never owns company knowledge or permanent memories.** It holds *retrieved copies/references* transiently; ownership stays with Knowledge and Long-term Memory.
- **Working Memory never survives its session.** It is disposable by design; persistence is the durable modules' job, gated by promotion.

---

## 2. Mental Model

If an Agent is a **digital employee**, Working Memory is the **desk they are working at right now** — the papers spread out, the notes scribbled, the reference books pulled off the shelf and opened to the relevant page, the half-finished calculation, the sticky notes of open questions. When the task is done, the desk is cleared: the scribbles are thrown away, the reference books go back on the shelf (Knowledge, untouched), and only what the employee *deliberately files* enters the permanent record (Long-term Memory, by promotion). The desk is fast, personal, messy, and temporary. It is where the work happens; it is not where the work is kept.

The mental model in one line: **Working Memory is an Agent's temporary, isolated, token-budgeted, deterministic, disposable cognitive workspace for one session of work — it assembles context from many sources, supports reasoning and execution, is compressed to fit its budget, and is thrown away at expiration, never auto-becoming Long-term Memory or Knowledge.**

Seven properties define the model:

- **Temporary.** Working Memory exists only while a unit of work is active. It has an expiration policy and is disposed when the session ends. It is the opposite of durable.
- **Contextual.** It holds the *assembled context* for one specific piece of work — mission/goal/plan/task/workflow context plus what was retrieved and produced. It is scoped to that work, not a general store.
- **Isolated.** Each workspace is isolated per session/agent/tenant. One task's desk never bleeds onto another's. Context isolation is structural.
- **Bounded.** It has a hard token budget. Context is compressed and summarized to fit; overflow is a managed health condition, not a silent truncation.
- **Deterministic & replayable.** Retrieval and assembly are deterministic; the workspace's construction is recorded so a session can be replayed for audit/debugging.
- **Disposable.** Disposal is the default terminal state. Nothing in Working Memory persists unless explicitly promoted through a governed path to Long-term Memory or Knowledge.
- **Bounded, not sovereign.** Working Memory is beneath the Agent and the entire authority stack. It reads only what the Agent's permissions/ceiling allow, and its context inherits the Agent's bounds.

Working Memory sits **beneath the Agent and above Reasoning as a substrate.** The Agent opens a workspace to perform work; Reasoning thinks over the workspace's context; the resulting Workflow/Command/Execution performs the work; the workspace is disposed. Working Memory is the hinge between *what the Agent has gathered* and *what it reasons and acts on* — and it is exclusively about *holding transient context*, never *thinking, remembering permanently, or owning knowledge*.

---

## 3. Core Domain Objects

Working Memory introduces one primary entity and supporting objects. All reuse the column contracts from `_base.ts`:

- **`rootColumns`** / **`tenantColumns`** (as prior specs). `createdBy`/`agentRef` resolve to actor references (Identity §3.9); every workspace is tenant- and agent-scoped.

---

### 3.1 Working Memory (Session Workspace)

- **Purpose.** An Agent's temporary cognitive workspace for one active session of work. The primary object of this module.
- **Table.** `working_memories` (`tenantColumns`).
- **Conceptual fields** (the full anatomy):
  - `id` — Working Memory (session) ID = **Memory Session ID**.
  - `tenantId` — owning Company (Identity §3.1).
  - `agentRef` — the owning Agent (Agent §3.1). **Exactly one.**
  - `sessionRef` — the one active session this workspace serves (§3.2). **Exactly one.**
  - `conversationContext` — the running conversation/interaction so far.
  - `missionContext`, `goalContext`, `planContext`, `taskContext`, `workflowContext` — the inherited cognitive-chain context references the work serves (read-only projections, not the objects).
  - `retrievedKnowledge` — knowledge retrieved for this work (transient copies/references; never owned).
  - `retrievedMemories` — long-term memories retrieved for this work (transient copies/references; never owned).
  - `temporaryNotes` — the Agent's scratch notes.
  - `intermediateReasoning` — intermediate reasoning traces (the workspace holds them; Reasoning produces them).
  - `executionContext` — the execution context/results relevant to the work (Execution §3.3 snapshot references).
  - `toolResults`, `browserResults`, `providerResponses` — results from tool/browser/provider Commands (held transiently).
  - `pendingDecisions` — decisions awaiting resolution.
  - `openQuestions` — unresolved questions the Agent is tracking.
  - `activeConstraints` — the constraints currently binding the work (policy/posture/permission snapshots).
  - `tokenBudget` — the hard token budget for this workspace (§5.4). Required.
  - `expirationPolicy` — when and how the workspace expires/disposes (§5.7). Required.
  - `workingMemoryLifecycleStatus` — governed lifecycle (`workingMemoryLifecycleStatusEnum`, §6).
  - `workingMemoryHealth` — health (`workingMemoryHealthEnum`, §6): `unknown | healthy | degraded | overflow | corrupted`.
  - `version` — the workspace's evolution counter (append-oriented, §3.4).
  - base lifecycle/audit fields.
- **Required.** `tenantId`, `agentRef`, `sessionRef`, `tokenBudget`, `expirationPolicy`, `workingMemoryLifecycleStatus`. (`workingMemoryHealth` defaults `unknown`.)
- **Optional.** All context/results fields (populated as the work proceeds).
- **Ownership.** Owned by exactly one Company; belongs to exactly one Agent and one active session.
- **Disposability.** Disposed at expiration by default; nothing persists unless explicitly promoted (§5.7, §7).
- **Example.** Agent `Atlas` performing Task "qualify lead #88" opens a Working Memory: taskContext {t88}, retrievedMemories {prior contact with this lead}, retrievedKnowledge {qualification playbook}, tokenBudget 32k, expiration on task completion.

### 3.2 Memory Session

- **Purpose.** The bounded unit of active work a workspace serves — one session = one active engagement of an Agent with a unit of work (a Task, a conversation turn-set, a workflow run). The **Memory Session Architecture**.
- **Realization.** `sessionRef` binds the workspace to exactly one active session. A session opens when the Agent begins the work, stays open while active, and closes (→ expire/dispose) when the work ends. **One workspace per active session; one active session per workspace.**
- **Rule.** A workspace never spans two sessions; concurrent work opens concurrent, isolated workspaces.

### 3.3 Context Frame (assembled context unit)

- **Purpose.** A structured slice of assembled context (one source's contribution) within the workspace — the unit the context-assembly and compression architectures operate on.
- **Realization.** Structured entries `{id, source ∈ memorySources, content, tokens, priority, addedAt}`. Frames are **append-oriented** (§7); compression/summarization replaces low-priority frames with summaries, never silently drops.
- **Example.** A frame `{source: knowledge-retrieval, content: playbook excerpt, tokens: 1200, priority: high}`.

### 3.4 Working Memory Version (append-oriented evolution)

- **Purpose.** The record of the workspace's evolution as context is added, compressed, and summarized — enabling replay.
- **Realization.** The workspace is **append-oriented**: additions and compressions are recorded as ordered deltas; `version` increments. The evolution is replayable up to the retention the expiration/audit policy allows. Working Memory is *not* immutable-forever (it is disposable), but its evolution is deterministic and replayable *while it exists*.

### 3.5 Promotion Candidate (explicit, governed)

- **Purpose.** The explicit, governed hand-off by which something in Working Memory is *promoted* to Long-term Memory or Knowledge — the **only** path out of disposability.
- **Realization.** A `promotionCandidate {contentRef, targetStore ∈ {long-term-memory, knowledge}, justification, approvalRef?}` submitted to the durable module, which owns acceptance. Working Memory **proposes**; the durable store **decides**. **Nothing is promoted automatically** (§7).

---

## 4. Ownership

- **Owned by Company.** Every Working Memory belongs to exactly one company via `tenantId`. No global workspaces.
- **Belongs to one Agent, one active session.** **Every Working Memory belongs to one Agent and one active session.** It has no independent existence; it is the Agent's desk for one job.
- **Not an owner of anything durable.** Working Memory **never owns company knowledge or permanent memories.** It holds transient retrieved copies/references; ownership stays with Knowledge and Long-term Memory. The workspace is a *borrower*, never an *owner*.
- **Bounded by the Agent's authority.** The workspace reads only what the Agent's permissions/ceiling permit (Agent §7 ceiling); its `activeConstraints` inherit the Agent's bounds and the frozen posture. A workspace can never surface context the Agent is not permitted to see.
- **Isolation of ownership.** One Agent's workspace is invisible to another Agent except through explicit, scoped, governed shared-context (Agent §5.7) — never by ambient access.
- **No cross-tenant workspace.** A workspace never spans companies; every context frame is same-tenant.
- **Disposal is owner-safe.** Disposing a workspace never affects the durable stores it read from; disposal clears the desk, not the library.

---

## 5. Working Memory Architecture

The workspace's internal architecture — how it assembles, bounds, isolates, and disposes context. All are workspace mechanics; none reasons, executes, or persists durably.

### 5.1 Context Assembly Architecture

- The workspace **assembles context** from its **memory sources**: conversation, task context, workflow context, retrieved long-term memories, knowledge retrieval, execution results, human input, system events, tool outputs, browser outputs.
- Assembly is **deterministic**: given the same sources, retrieval queries, and priorities, the assembled context is the same — enabling replay.
- Assembly is **priority-ordered**: high-priority frames (active task, hard constraints) are retained under budget pressure; low-priority frames are compressed/summarized first.
- Assembly respects the **Agent's permissions/ceiling** and the **active posture**: nothing the Agent may not see enters the workspace.

### 5.2 Retrieval Architecture

- The workspace **retrieves** from Long-term Memory and Knowledge via **read-only** retrieval (as Commands performed by Execution, or via the durable modules' read APIs). **Retrieval never writes back** to the durable stores.
- Retrieval is **deterministic** (same query + same store state → same result set) and **scoped** (only what the Agent may access).
- Retrieved content enters as transient **context frames** tagged with their source and provenance — so the workspace always knows what came from Knowledge vs Long-term Memory vs execution.

### 5.3 Compression Strategy

- When the workspace approaches its token budget, **compression** reduces frame size while preserving meaning: deduplication, reference-substitution (replace verbatim content with a reference to the source), and lossless structural compaction first.
- Compression is **recorded** (append-oriented delta) so the pre-compression state is replayable within retention. Compression **never silently drops** high-priority content.

### 5.4 Summarization Strategy

- When compression is insufficient, **summarization** replaces low-priority frames with a shorter summary frame (produced via a Reasoning/LLM Command performed by Execution — the workspace requests it, does not do it).
- Summaries carry provenance (what they summarize) so replay can distinguish summarized from original context. Summarization is a **managed, recorded** reduction, never a silent loss.

### 5.5 Token Budget Management

- Every workspace has a hard `tokenBudget`. The engine tracks current token usage across frames.
- Under pressure: retain by priority → compress → summarize → if still over budget, health → `overflow` and the workspace escalates (drops nothing critical silently; the Agent/Reasoning decides what to shed via a governed reduction).
- The budget is **inherited from the Agent's execution/context profile** (Agent §3.1 `contextWindow`) and the target model's limits.

### 5.6 Context Isolation

- Each workspace runs in an **isolated boundary** per session/agent/tenant. No frame is readable across workspaces except via explicit, scoped **shared-context** (Agent §5.7).
- Isolation prevents **context bleed** (one task's data influencing another) and **cross-tenant leakage** (structurally impossible). Isolation is the workspace analogue of Execution's runtime isolation (Execution §5.5).

### 5.7 Expiration & Disposal (the disposability architecture)

- Every workspace has an `expirationPolicy` (on task completion, session end, TTL, or explicit close).
- At expiration: the workspace transitions `expired → disposed`; its transient content is **cleared**; the durable stores it read are untouched.
- **Working Memory never survives expiration unless explicitly promoted** (§3.5): before disposal, the Agent may submit **promotion candidates** to Long-term Memory/Knowledge, which those modules govern and accept independently. Absent an accepted promotion, everything is disposed.
- **No automatic promotion.** Disposal is the default; persistence is the exception, always governed.

### 5.8 Replay Strategy

- Because assembly/retrieval are deterministic and evolution is append-oriented and recorded, a session's workspace construction is **replayable** (within retention): the exact context the Agent reasoned from can be reconstructed for audit or debugging.
- Replay is **read-only reconstruction** — it never re-performs work or re-writes durable stores.

### 5.9 Observability Strategy

- Every workspace exposes **observability**: current token usage, frame count/sources, compression/summarization events, retrieval provenance, health, and the correlation/session lineage. The workspace's state is transparent — what the Agent knew, when, and from where.

### 5.10 The workspace boundary

- Working Memory **holds** context and **supports** reasoning/execution but **performs neither**, and it **reads** durable stores but **writes none** (except via governed promotion). It is temporary substrate: assemble → support → dispose. This boundary is why transient thinking can be rich and fast without ever polluting the permanent record.

---

## 6. Lifecycle

A Working Memory carries **two orthogonal state dimensions** (mirroring prior specs) that must never be conflated:

- **Lifecycle** (`workingMemoryLifecycleStatusEnum`) — *where the workspace is in its governed existence.* Governed transitions only.
- **Health** (`workingMemoryHealthEnum`) — *how well an active workspace is doing.* Auto-derived; never a lifecycle transition.

Governing rule: **a workspace is agent/session-bound, budget-limited, isolated, and expiration-policied; it assembles and supports context while active; it is disposed at expiration; nothing persists without governed promotion; and its evolution is deterministic and replayable while it exists.**

### 6.1 Lifecycle dimension

**`workingMemoryLifecycleStatusEnum`** (specified): `created | hydrated | active | updated | compressed | expired | disposed | archived`.

| Lifecycle state | Meaning | Mutable? | Carries health? |
|---|---|---|---|
| **created** | Workspace opened for a session; empty | Yes (hydrating) | No |
| **hydrated** | Initial context assembled from sources | Append | **Yes** |
| **active** | In use by the Agent's reasoning/execution | Append | **Yes** |
| **updated** | New context appended (a recorded evolution step) | Append | **Yes** |
| **compressed** | Compressed/summarized to fit budget | Append (recorded) | **Yes** |
| **expired** | Expiration reached; pending disposal (promotion window) | No | No (clearing) |
| **disposed** | Transient content cleared; terminal | No (immutable stub) | No |
| **archived** | Retained stub/audit record retired; terminal | No (immutable) | No |

`updated`/`compressed` are **operational evolution states of active** — the workspace stays "active" in spirit; these mark recorded evolution steps.

**Lifecycle transitions (governed):**

| Transition | From → To | Precondition | Effect | Emits |
|---|---|---|---|---|
| **Create** | ∅ → created | Agent opens a session workspace | empty workspace; `workingMemoryHealth=unknown` | `WorkingMemoryCreated` |
| **Hydrate** | created → hydrated | Initial context assembled (deterministic, permissioned) | context frames added; health tracking begins | `WorkingMemoryHydrated` |
| **Activate** | hydrated → active | Agent begins using it | `workingMemoryLifecycleStatus=active` | `WorkingMemoryActivated` |
| **Update (append)** | active/updated → updated | New frame appended (source result, note, decision) | recorded delta; `version` increments | `WorkingMemoryUpdated` |
| **Compress** | active/updated → compressed | Approaching token budget | compression/summarization applied, recorded | `WorkingMemoryCompressed` |
| **Resume** | compressed → active | Post-compression continue | continues | `WorkingMemoryActivated` |
| **Propose promotion** | active/updated → active | Agent submits a promotion candidate | candidate sent to durable module (it decides) | `WorkingMemoryPromotionProposed` |
| **Expire** | any active state → expired | Expiration policy met (task done / session end / TTL / close) | enters disposal window; no new appends | `WorkingMemoryExpired` |
| **Dispose** | expired → disposed | Disposal executed | transient content cleared; durable stores untouched | `WorkingMemoryDisposed` |
| **Archive** | disposed → archived | Governed retirement of the audit stub | `lifecycleStatus=archived` (terminal) | `WorkingMemoryArchived` |

Every transition is governed and audited (to the retention the policy allows). **Health never appears in this table.** Disposal is the default terminal path; promotion is a *separate* governed act that does not itself change the workspace's disposal.

### 6.2 Health dimension

**`workingMemoryHealthEnum`** (specified): `unknown | healthy | degraded | overflow | corrupted`.

| Health state | Meaning | Set how |
|---|---|---|
| **unknown** | No sufficient signal (default; also for terminal workspaces) | default / on clear |
| **healthy** | Within budget, coherent, isolated, deterministic | auto |
| **degraded** | Approaching budget; heavy compression; slow retrieval | auto |
| **overflow** | Token budget exceeded despite compression/summarization | auto |
| **corrupted** | Context integrity compromised (inconsistent frames, failed retrieval, isolation breach detected) | auto |

**Health rules:**

- **Scope.** Health applies **only** to active lifecycle states (`hydrated | active | updated | compressed`). In `created` it is `unknown`; in `expired`/`disposed`/`archived` it is cleared to `unknown` and frozen — **terminal workspaces carry no active health.**
- **Automatic.** Derived from **token usage vs budget, compression/summarization pressure, retrieval success, frame consistency, isolation checks.** Never manual.
- **No lifecycle effect.** **Health never changes lifecycle.** An `overflow`/`corrupted` workspace does not auto-dispose; it escalates and the Agent/Reasoning takes a governed action (reduce, summarize, or close). Only governed transitions move lifecycle. (Distinct from prior specs' `blocked`: Working Memory adds `overflow` and `corrupted` because a workspace's failure modes are budget and integrity, not dependency.)
- **Observability, not authority.** Health drives alerts/KPIs; the Agent/Reasoning may then act.

### 6.3 Terminal-state rules

- **disposed / archived** are terminal. A disposed workspace's transient content is gone; **it never reactivates** — new work opens a new workspace.
- **Working Memory never survives expiration unless explicitly promoted** — and promotion moves *content* into a durable module, not the workspace itself.
- The workspace's **audit stub** (that a session existed, its lineage, its disposal) is retained per policy; the transient *content* is cleared at disposal (subject to the durable stores' own records for anything promoted).
- **Replayability holds only while the workspace exists** (pre-disposal) and via any retained audit; Working Memory is disposable, not forever-immutable — the deliberate contrast with the durable modules.

---

## 7. Constraints

Structural and semantic constraints, enforced by the schema and the module — not by convention.

**Structural (schema-enforced):**

1. **One Agent, one active session.** `agentRef` and `sessionRef` NOT NULL and singular. **Every Working Memory belongs to one Agent and one active session.**
2. **Expiration mandatory.** `expirationPolicy` NOT NULL. **Every Working Memory has expiration.** No perpetual workspace.
3. **Token budget mandatory.** `tokenBudget` NOT NULL. **Every Working Memory has token limits.**
4. **Context boundaries mandatory.** `activeConstraints` (posture/policy/permission scope) present; the workspace's readable scope is bounded. **Every Working Memory has context boundaries.**
5. **Append-oriented.** Content evolves by append + recorded compression/summarization; frames are not silently overwritten or dropped. **Working Memory is append-oriented.**
6. **Tenant & agent isolation.** `tenantId` FK → `companies.id`; isolated per session/agent/tenant.
7. **Terminal disposability.** `disposed`/`archived` are terminal; a disposed workspace never reactivates.

**Semantic (module-enforced) — the disposability & non-pollution guards:**

8. **Never auto-promote.** **Working Memory never automatically becomes Long-term Memory or Knowledge.** Promotion is explicit, governed, and accepted by the durable module — never a side effect of use or disposal.
9. **Never write durable stores.** **Working Memory never modifies Long-term Memory or Knowledge.** It reads (retrieval) only; the only durable write is a governed promotion the durable module performs.
10. **Never own durable content.** **Working Memory never owns company knowledge or permanent memories.** It holds transient copies/references; ownership stays with the durable modules.
11. **Never survive expiration (except promoted content).** **Working Memory is disposable**; nothing transient persists past disposal unless promoted.
12. **Deterministic retrieval & assembly.** **Working Memory has deterministic retrieval** — same sources/queries/state → same context; enabling replay.
13. **Never reason or execute.** The workspace holds context and requests reasoning/execution (as Commands via the Agent → Execution chain); it never thinks or performs itself.
14. **Bounded by the Agent's authority.** The workspace reads only what the Agent's permissions/ceiling and the active posture permit; it never surfaces out-of-scope context.
15. **Lifecycle/health orthogonal; health scoped and derived.** Separate fields; health non-`unknown` only active; auto-derived; never writes lifecycle.
16. **Isolation is absolute.** No cross-workspace/cross-tenant bleed except via explicit scoped shared-context; a detected isolation breach marks `corrupted` and escalates.

---

## 8. Validation

Validation runs at gates: **created → hydrated** (assembly), **during active** (append/compress), and **at expiration/promotion**. Working Memory fails closed: on ambiguity it does not surface out-of-scope context and does not persist.

**Binding validation (created → hydrated):**

- `agentRef` resolves to an active Agent in the same tenant; `sessionRef` resolves to exactly one active session; `tokenBudget` and `expirationPolicy` present and well-formed.

**Assembly & permission validation (hydration and each append):**

- Every source frame is within the Agent's permission/ceiling scope and the active posture; out-of-scope content is refused entry (never assembled).
- Retrieval is **read-only** against Long-term Memory/Knowledge; any attempted write is refused.
- Assembly is deterministic and provenance-tagged (source recorded).

**Budget validation (continuous):**

- Token usage tracked vs `tokenBudget`; approaching budget triggers compression → summarization; exceeding triggers `overflow` health and escalation — never a silent truncation of high-priority content.

**Isolation validation (continuous):**

- No frame is readable across workspaces except via explicit scoped shared-context; a detected breach marks `corrupted` and escalates.

**Integrity validation (continuous):**

- Frame consistency and retrieval success checked; inconsistency/failed retrieval marks `degraded`/`corrupted`; a corrupted workspace does not feed reasoning until resolved.

**Promotion validation (at promotion proposal):**

- A promotion candidate is submitted to the durable module with provenance and (where required) an approval; **Working Memory cannot self-accept a promotion** — the durable module governs acceptance. No auto-promotion path exists.

**Disposal validation (at expiration):**

- On expiration, transient content is cleared; the durable stores are verified untouched; only governed-accepted promotions persist.

**Health validation (continuous):**

- `workingMemoryHealth` non-`unknown` only active; unresolved inputs yield `unknown`; a health update never moves lifecycle.

Only a workspace passing all applicable gates supports reasoning. A failure holds/degrades it with the violated rule recorded; out-of-scope context is never surfaced and nothing persists unpromoted.

---

## 9. Relationships

Working Memory relates to the Agent (its owner), the durable stores (read-only sources), and Reasoning/Execution (which it supports). It reads durable stores; it never writes them.

| Module | Relationship to Working Memory |
|---|---|
| **Agent** | **The owner.** Every workspace belongs to one Agent (Agent §5.4 memory binding). The workspace inherits the Agent's permissions/ceiling and posture; it exists to support the Agent's active work and is disposed when that work ends. |
| **Long-term Memory** | **A read-only source and a promotion target.** The workspace **retrieves** long-term memories (read-only) into transient frames; it **never modifies** them. Content may move *into* Long-term Memory only via a governed **promotion** the Long-term Memory module accepts (forthcoming spec). |
| **Knowledge** | **A read-only source and a promotion target.** Same as Long-term Memory: retrieve read-only; promote only by governed acceptance. Working Memory never owns or writes Knowledge. |
| **Reasoning** | **The primary consumer.** Reasoning thinks over the workspace's assembled context and produces intermediate reasoning the workspace holds. The workspace **supports** reasoning; it does not reason. Summarization/compression that needs an LLM is a Reasoning/Execution Command the workspace requests. |
| **Workflow** | The workspace holds `workflowContext` for the work being coordinated; it supports the Agent driving the Workflow. It never orchestrates. |
| **Execution** | The workspace holds `executionContext` and execution/tool/browser/provider results (transient); it never performs. Retrieval/summarization it needs run as Commands performed by Execution. |
| **Commands** | Retrieval, tool, browser, and summarization actions the workspace needs are **Commands** (Command §3) performed by Execution — the workspace requests, never dispatches. |
| **Policies** | `activeConstraints` include policy snapshots bounding what the work may consider; the workspace enforces (surfaces only permitted context), never overrides. |
| **Permissions** | The Agent's permissions (Identity §6) bound what the workspace may retrieve/surface; out-of-scope content never enters. |
| **Audit** | The workspace's assembly/evolution/disposal is recorded (per retention) for replay; promotions are audited by the durable module. |
| **Observability** | Consumes token usage, frame provenance, compression/health signals (§5.9) — the workspace's transparency surface. |
| **Identity / Company** | Tenant scoping and the actor/permission basis every workspace inherits. |

**The workspace spine:** `Agent → Working Memory → Reasoning → Workflow → Command → Execution`. Working Memory is the transient substrate that turns retrieved and produced context into the working context an Agent reasons and acts from — and is disposed when the work ends, leaving the durable stores untouched.

---

## 10. Events

Every Working Memory mutation emits exactly one domain event. Reasoning, the Agent, Governance, and observability subscribe. Payloads carry `actorRef`, `tenantId`, `workingMemoryId`, `agentRef`, `sessionRef`, `version`, and `occurredAt`.

| Event | Trigger | Payload (beyond envelope) | Consumers | Business impact |
|---|---|---|---|---|
| `WorkingMemoryCreated` | Workspace opened for a session | agentRef, sessionRef | Observability, Agent | Desk opened |
| `WorkingMemoryHydrated` | Initial context assembled | frameCount, sources, tokens | Reasoning, Observability | Context ready; health tracking begins |
| `WorkingMemoryActivated` | In use | — | Agent, Observability | Reasoning may proceed |
| `WorkingMemoryUpdated` | Frame appended | source, tokensAdded, version | Reasoning, Observability | Context evolved (recorded) |
| `WorkingMemoryRetrieved` | Read-only retrieval from durable store | store, query, resultTokens, provenance | Observability, Audit | Durable source read (not modified) |
| `WorkingMemoryCompressed` | Compression/summarization applied | method, tokensBefore/After | Observability, Governance | Budget managed; no silent loss |
| `WorkingMemoryHealthChanged` | Health recomputed (active only) | fromHealth, toHealth, drivers | Observability, Governance | Health moved; **no lifecycle change** |
| `WorkingMemoryDegraded` / `WorkingMemoryOverflow` / `WorkingMemoryCorrupted` | Health specializations | reason | Governance, Notifications | Alerts; **lifecycle unchanged** |
| `WorkingMemoryPromotionProposed` | Agent submits a promotion candidate | contentRef, targetStore, justification | **Long-term Memory / Knowledge**, Governance, Audit | Explicit, governed persistence proposed |
| `WorkingMemoryPromotionAccepted` / `WorkingMemoryPromotionRejected` | Durable module decides | targetStore, decision | Agent, Audit | Persistence governed by the durable store, not Working Memory |
| `WorkingMemoryExpired` | Expiration policy met | reason | Agent, Observability | Disposal window opens |
| `WorkingMemoryDisposed` | Transient content cleared | promotedCount, clearedFrames | Governance, Audit | Desk cleared; durable stores untouched |
| `WorkingMemoryArchived` | Audit stub retired | — | Reporting | Session record retired |
| `WorkingMemoryIsolationBreachDetected` | Cross-workspace/tenant bleed detected | detail | **Security (high severity)**, Governance, Audit | Isolation guard fired; workspace corrupted/escalated |
| `WorkingMemoryScopeViolationAttempted` | Attempt to surface out-of-scope context | attemptedSource | Security, Governance, Audit | Permission boundary enforced |

**Ordering and idempotency.** Events carry `version`; consumers discard stale/duplicate deliveries. Emission is **transactional with the mutation**; a failed audit/event write rolls back — no un-audited workspace change (within retention).

**Two independent streams.** Health events never accompany or cause a lifecycle change; lifecycle events never carry a health transition.

---

## 11. KPIs

Working Memory health and the digital workforce's cognitive-workspace performance, measured deterministically from workspace records.

| KPI | Definition | Source |
|---|---|---|
| **Assembly completeness** | % of active workspaces with valid agent/session, budget, expiration, and constraints (target 100%) | fields + validation |
| **Context relevance** | % of assembled tokens actually used by reasoning (vs wasted) | frame usage |
| **Budget utilization** | Avg token usage vs `tokenBudget`; % of sessions hitting overflow | budget tracking |
| **Compression efficiency** | Avg tokens saved by compression/summarization; % meaning preserved | compression events |
| **Retrieval determinism** | % of retrievals reproducible on replay | replay checks |
| **Retrieval read-only conformance** | % of retrievals with zero durable writes (target 100% by construction) | retrieval audit |
| **Isolation integrity** | Count of isolation-breach detections (target 0) | isolation events |
| **Scope conformance** | % of frames within the Agent's permission scope (target 100%) | permission checks |
| **Disposal rate** | % of workspaces disposed at expiration (vs lingering) | lifecycle |
| **Promotion rate / acceptance** | % of sessions proposing promotion; % accepted by durable stores | promotion events |
| **Auto-promotion incidents** | Count of any automatic (non-governed) persistence (target 0) | promotion audit |
| **Health distribution** | % of active workspaces `healthy` vs `degraded`/`overflow`/`corrupted` | `workingMemoryHealth` |
| **Replay fidelity** | % of sessions whose context reconstructs deterministically (within retention) | replay outcomes |
| **Corruption rate** | Count of `corrupted` incidents | health events |

These feed the Executive/Director/Department and Observability surfaces (Identity §10 pattern). All computed from Working Memory's own records — no external inference.

---

## 12. Failure Scenarios

At least the following failure modes and the system's deterministic reaction. Governing rule: **Working Memory fails closed, isolated, and disposable** — on ambiguity it surfaces no out-of-scope context, persists nothing unpromoted, and never pollutes the durable stores.

1. **Workspace with no Agent/session.** Rejected — both mandatory; no orphaned desk.
2. **Workspace with no expiration policy.** Rejected — no perpetual workspace.
3. **Workspace with no token budget.** Rejected — budget mandatory.
4. **Token budget exceeded despite compression/summarization.** Health `overflow`; escalates; the Agent/Reasoning sheds low-priority context via a governed reduction — high-priority content is never silently dropped.
5. **Attempt to write Long-term Memory/Knowledge from the workspace.** Refused — retrieval is read-only; durable writes are governed promotions only.
6. **Automatic promotion attempted (transient → durable on disposal).** Refused — no auto-promotion; persistence requires an explicit, accepted governed promotion.
7. **Workspace surfaces content beyond the Agent's permission scope.** Refused at assembly; `WorkingMemoryScopeViolationAttempted`; out-of-scope content never enters.
8. **Cross-workspace context bleed.** Detected → `corrupted` + `WorkingMemoryIsolationBreachDetected` (security); the affected workspace is quarantined/escalated.
9. **Cross-tenant leakage attempt.** Structurally impossible — tenant isolation; refused.
10. **Retrieval returns inconsistent/failed results.** Health `degraded`/`corrupted`; a corrupted workspace does not feed reasoning until resolved; never reasons on broken context.
11. **Non-deterministic assembly.** Rejected/flagged — assembly must be deterministic for replay; a non-reproducible source is quarantined.
12. **Workspace survives past expiration.** Impossible by policy — expiration triggers disposal; lingering is a failure that forces disposal + alert.
13. **Disposal fails to clear transient content.** Retried; until cleared, the workspace is flagged; durable stores remain untouched regardless.
14. **Disposal affects a durable store.** Impossible — disposal clears the desk only; the library is never touched.
15. **Promotion proposed but durable module rejects.** Content is **not** persisted; disposed normally; `WorkingMemoryPromotionRejected` recorded.
16. **Promotion accepted but disposal races it.** Ordering guaranteed: accepted promotions complete (durable module owns them) before/independent of transient disposal; no accepted content is lost.
17. **Corrupted frame poisons reasoning.** A `corrupted` workspace is fenced from feeding reasoning; the Agent recovers (re-hydrate) or closes the session.
18. **Compression loses high-priority content.** Prevented — compression retains by priority; only low-priority frames are summarized; a would-be high-priority loss blocks and escalates.
19. **Summarization (LLM) fails.** Falls back to lossless compression/reference-substitution; if still over budget → `overflow` + escalation; never a silent drop.
20. **Two active sessions share one workspace.** Rejected — one active session per workspace.
21. **Workspace reasons or executes itself.** Structurally impossible — no reasoning/execution engine; it only holds context and requests Commands.
22. **Workspace owns/claims durable content.** Rejected — it holds transient copies/references only; ownership stays with the durable modules.
23. **Health set on a terminal workspace.** Rejected, coerced to `unknown`.
24. **Attempt to move lifecycle because health changed.** Refused — `overflow`/`corrupted` never auto-dispose; only governed transitions move lifecycle.
25. **Terminal workspace showing active health.** Structurally impossible — terminal clears health to `unknown`, frozen.
26. **Replay after disposal.** Only via retained audit stub within retention; the disposed transient content is gone (by design) — replay fidelity is bounded by retention, honestly reported.
27. **Agent suspended mid-session.** The workspace is expired/disposed with the agent's suspension; in-flight promotions are governed; no orphaned live desk under a suspended agent.
28. **Agent authority drops mid-session.** Context re-scoped immediately to the reduced ceiling; now-out-of-scope frames are fenced/removed; the workspace never over-surfaces after a ceiling drop.
29. **Posture change (live → simulation) mid-session.** Honored; the workspace's execution results reflect the new posture; no live artifacts assumed.
30. **Oversized single frame (one huge result).** Compressed/reference-substituted on entry; if irreducibly over budget, admitted as a reference with the content externalized (read-only), never silently truncated.
31. **Stale retrieval (durable store changed after retrieval).** The frame is provenance-tagged with retrieval time; determinism is per-retrieval; a re-retrieval is a new recorded frame — no silent staleness.
32. **Human input injected mid-session.** Admitted as a `human-input` frame within scope; treated as data, subject to the same permission/posture checks.
33. **Tool/browser output oversized or malformed.** Validated on entry; malformed output flagged `degraded`; oversized compressed/referenced.
34. **Concurrent appends race.** Append-oriented ordering with `version` resolves order; no lost frame; deterministic sequence recorded.
35. **Audit write fails on a workspace mutation.** Transactional emission rolls back the mutation (within retention); no un-audited workspace change.
36. **Isolation breach via shared-context abuse.** Shared-context is scoped and governed (Agent §5.7); an attempt to read beyond the shared scope is refused and flagged.

---

## 13. Enterprise Use Cases

Behavior of Working Memory in real situations. In every case the workspace assembles/holds context, supports reasoning/execution, and is disposed — durable stores untouched unless governed-promoted.

1. **Opening a desk for a task.** Agent `Atlas` starts "qualify lead #88"; a workspace hydrates with taskContext, the qualification playbook (knowledge retrieval), and prior contact (memory retrieval).
2. **Conversation context.** A `support` Agent holds the running customer conversation in `conversationContext`, appending each turn.
3. **Knowledge retrieval (read-only).** A `legal` Agent retrieves contract clauses into the workspace; Knowledge is never modified.
4. **Long-term memory recall (read-only).** A `sales` Agent recalls a customer's history into the workspace; Long-term Memory is untouched.
5. **Intermediate reasoning held.** A `research` Agent's step-by-step analysis accumulates as `intermediateReasoning` frames.
6. **Tool results.** A browser Command's output lands in `browserResults`; the workspace holds it transiently for the Agent to reason over.
7. **Token budget pressure → compression.** A long research session approaches budget; low-priority frames are compressed (reference-substituted); high-priority context retained.
8. **Summarization.** When compression is insufficient, older conversation turns are summarized (via an LLM Command); provenance recorded.
9. **Overflow escalation.** Despite compression, the budget is exceeded; health `overflow`; the Agent decides (governed) which context to shed.
10. **Isolation across concurrent tasks.** `Atlas` runs two tasks; each has its own isolated workspace; no context bleeds between them.
11. **Deterministic replay for audit.** An auditor replays a session's workspace assembly to see exactly what the Agent knew when it decided.
12. **Disposal on task completion.** Task done → workspace expires → disposed; scratch notes cleared; Knowledge/Long-term Memory untouched.
13. **Explicit promotion to Long-term Memory.** Before disposal, the Agent proposes "this lead prefers email" for promotion to Long-term Memory; the durable module accepts it; the rest is disposed.
14. **Explicit promotion to Knowledge.** A validated new FAQ answer is proposed for promotion to Knowledge (governed, approval-gated); accepted; the workspace disposed.
15. **Promotion rejected.** A proposed promotion is rejected by Governance; nothing persists; normal disposal.
16. **No auto-promotion.** A session ends with rich scratch; none of it becomes memory/knowledge because nothing was promoted — disposability by default.
17. **Ceiling drop mid-session.** The Agent's owner is demoted; the workspace re-scopes, fencing now-out-of-scope frames immediately.
18. **Posture change mid-session.** The work shifts to simulation posture; the workspace's execution results reflect no live effects.
19. **Human input mid-session.** A human adds a correction; it enters as a scoped `human-input` frame and informs reasoning.
20. **Corrupted context fenced.** A retrieval returns inconsistent data; health `corrupted`; the workspace is fenced from reasoning; re-hydrated.
21. **Multi-agent shared context.** Three agents on one campaign share a scoped context frame-set; sharing never exceeds the granted scope.
22. **Overnight expiry (TTL).** An idle workspace hits its TTL and disposes; a resumed task opens a fresh workspace, re-hydrating from durable sources.
23. **Large document analysis.** A `document-analysis` Agent references a huge doc (externalized, read-only) rather than loading it whole — budget respected.
24. **Pending decisions tracked.** The workspace holds `pendingDecisions`/`openQuestions` so the Agent doesn't lose track mid-work.
25. **Active constraints enforced.** A policy snapshot in `activeConstraints` prevents the workspace from surfacing restricted data.
26. **Observability of context.** An SRE inspects a workspace's token usage, sources, and compression events to tune the Agent's budget.
27. **Provider response held.** An LLM Command's response is held in `providerResponses` for the Agent to validate before acting.
28. **Replay-driven debugging.** A wrong agent decision is diagnosed by replaying the workspace to see the exact (perhaps stale) context.
29. **Session close by the Agent.** The Agent finishes and closes the session; expiration → disposal, with any promotions proposed first.
30. **Suspended agent's workspaces.** An agent is suspended; its live workspaces expire/dispose; no live desk persists under suspension.
31. **Cross-tenant attempt blocked.** A misconfigured retrieval targeting another tenant is refused; isolation holds.
32. **Reference-substitution.** Verbatim retrieved content is replaced with a reference to Knowledge, shrinking the workspace while preserving access.
33. **Compression preserves determinism.** A replayed compressed session reconstructs the same effective context (summaries provenance-tagged).
34. **Overflow with graceful shed.** Under overflow, the Agent sheds resolved sub-context (already-used frames) first, keeping active constraints and the current task.
35. **Promotion race handled.** An accepted promotion completes in the durable store independent of the transient disposal; no accepted content lost.
36. **Fresh workspace per run.** Each Workflow run for the Agent opens its own workspace; runs never share a desk implicitly.
37. **Knowledge stays canonical.** Many workspaces retrieve the same knowledge concurrently; none can alter it — the canonical corpus is read-only to workspaces.
38. **Learning input, not authority.** A workspace's session feeds the Agent's learning (Agent §5.6) via governed promotion of procedural insight — never an automatic authority change.
39. **Audit stub after disposal.** After disposal, the audit stub shows the session existed, its lineage, and what was promoted — transient content gone by design.
40. **M&A isolation.** Merged companies' agents keep per-tenant workspaces; no workspace spans tenants during or after integration.
41. **Emergency close.** A security event forces immediate disposal of a workspace; transient content cleared; durable stores untouched; incident audited.

---

## 14. Extensibility

How Working Memory absorbs future demands **without redesign**, because the core abstractions were chosen as extension points.

- **New memory sources.** The source set (conversation, task, workflow, retrieved memory/knowledge, execution, human, system, tool, browser) extends without structural change — new sources add as frame source types.
- **Smarter compression/summarization.** Strategies can evolve (semantic dedup, hierarchical summaries, learned prioritization) behind the same "no silent loss, provenance-preserved" contract.
- **Adaptive token budgets.** Budgets can become model-aware/cost-aware behind the same `tokenBudget` seam.
- **Richer retrieval.** Retrieval can gain relevance ranking, hybrid search, and multi-store fan-in — still read-only, still deterministic per retrieval.
- **Structured replay/time-travel.** Recorded evolution already enables session replay; richer time-travel debugging is a consumer, not a redesign.
- **Shared/collaborative workspaces.** Scoped shared-context extends multi-agent collaboration without breaking isolation defaults.
- **Promotion policies.** Governed promotion can gain richer policies (auto-suggest candidates for human approval) while remaining non-automatic to persist.
- **Streaming context.** Event-driven appends (live tool streams) fit the append-oriented model without change.

The invariant enabling all of the above: **the workspace is temporary, isolated, budget-bounded, deterministic, and disposable; it reads durable stores but never writes them; persistence happens only via governed promotion.** New demands plug into sources/compression/retrieval without touching the disposability or isolation guards.

---

## 15. Architectural Principles

The permanent design principles governing Working Memory. If a future request conflicts with one of these, the request is wrong, not the principle.

1. **Working Memory is a temporary workspace, not a store.** It is the Agent's RAM — fast, contextual, disposable — not the disk (Long-term Memory) or the library (Knowledge) or the thinking (Reasoning).
2. **It exists only while work is active and is disposable by default.** Every workspace has expiration; disposal is the terminal path; nothing transient survives it.
3. **It never auto-becomes durable.** No automatic promotion to Long-term Memory or Knowledge; persistence is an explicit, governed act the durable module accepts.
4. **It reads durable stores but never writes them.** Retrieval is read-only; the only durable write is a governed promotion performed by the durable module.
5. **It owns no durable content.** It holds transient copies/references; ownership of memories and knowledge stays with those modules.
6. **It is isolated and bounded.** One workspace per session, isolated per agent/tenant, hard token budget, scoped to the Agent's permissions and posture.
7. **It is deterministic and replayable while it exists.** Assembly/retrieval are deterministic; evolution is append-oriented and recorded; sessions can be replayed within retention.
8. **It supports reasoning and execution but performs neither.** It holds context and requests Commands; thinking is Reasoning's, performing is Execution's.
9. **It is subordinate.** Beneath the Agent and the whole authority stack; it surfaces only permitted context and never raises scope.
10. **Lifecycle and health are separate axes.** Lifecycle is governed existence; health is observed condition (with `overflow`/`corrupted` as workspace-specific modes), active-only, automatic, and never changes lifecycle.

---

## 16. What Working Memory will NEVER do

Explicit boundaries to prevent responsibility creep. If a future request asks Working Memory to do any of these, the answer is: it belongs to Long-term Memory, Knowledge, Reasoning, or the Agent.

- **Never become Long-term Memory or Knowledge automatically.** Persistence is an explicit, governed promotion the durable module accepts.
- **Never modify Long-term Memory or Knowledge.** Retrieval is read-only; it writes nothing durable.
- **Never own company knowledge or permanent memories.** It holds transient copies/references only.
- **Never survive its expiration (except governed-promoted content).** It is disposable by design.
- **Never reason or execute.** It holds context and requests Commands; thinking and performing happen elsewhere.
- **Never surface context beyond the Agent's permissions, ceiling, or posture.** Scope is enforced at assembly.
- **Never bleed across workspaces or tenants.** Isolation is absolute except via explicit scoped shared-context.
- **Never silently drop or truncate high-priority context.** Compression/summarization is managed, prioritized, and recorded.
- **Never be non-deterministic in assembly/retrieval.** Determinism is required for replay.
- **Never let health change lifecycle, and never mutate without an audit record (within retention).**

---

*End of Working Memory Specification v1.0. This document specifies the Working Memory module — the temporary, isolated, token-budgeted, deterministic, disposable cognitive workspace an Agent uses while performing work, which reads durable stores but never writes them and never auto-persists — in full and defines its permanent boundaries. No implementation code. No SQL. No TypeScript. No other specification modified.*
