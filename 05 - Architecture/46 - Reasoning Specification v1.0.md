# Reasoning Specification v1.0

> Stage 13 — Reasoning module, complete Enterprise Architecture Specification.
> This document is the permanent architectural reference for Reasoning in Hebun AI — the cognitive engine.
> It specifies the stateless engine that transforms context, experience, and truth into conclusions. It adds no implementation. It defines boundaries.

**Status:** Definitive · **Scope:** Reasoning module only · **Grounded in:** the schema primitives in `src/db/schema/_base.ts` (`rootColumns`, `tenantColumns`) and `_enums.ts` (`lifecycleStatusEnum`, `approvalStateEnum`, `providerStatusEnum`, `roleTypeEnum`, `permissionScopeEnum`), the existing `reasoning` schema, and the Identity (34) through Knowledge (45) Specifications v1.0.

**Position in the cognitive substrate:**

```
Working Memory (43) — transient CONTEXT   ┐
Long-term Memory (44) — retained EXPERIENCE ├──►  Reasoning (this doc) — the COGNITIVE ENGINE
Knowledge (45) — canonical TRUTH           ┘        │ produces CONCLUSIONS (recommendations, NOT decisions)
                                                     ▼
                                          Decision / Goals / Plans — the cognitive chain COMMITS (governed)
```

**Authority precedence (unchanged, absolute):**

```
Law → Security/Compliance → Approved Policy → Mission → Goals → Plans → Tasks → Workflows → Commands → Execution → Agent → Working Memory → Long-term Memory → Knowledge → Reasoning
```

> Reasoning sits at the bottom as a *process*, not a store or a commander. It **consumes** everything above about truth/experience/context/intent, **produces conclusions**, and **commits nothing**. Knowledge overrides Memory; Policy constrains; Mission guides; Identity and Permissions bound — Reasoning applies all of them and changes none.

Reasoning is the **cognitive engine** of Hebun. **Knowledge provides truth; Long-term Memory provides experience; Working Memory provides context; Reasoning transforms all of them into conclusions.** It is **stateless** — it owns nothing and stores nothing. It generates hypotheses, collects and weighs evidence, deliberates, reflects, self-critiques, verifies, and outputs **conclusions with full provenance** — but **a conclusion is a recommendation, never a decision.** **Reasoning never commits decisions.**

**Critical clarification — Reasoning is a process, not a store or a decider:**

> Reasoning is **NOT** Knowledge. Reasoning is **NOT** Memory. Reasoning is **NOT** Decision.
>
> Reasoning is the **stateless cognitive engine** that reads truth (Knowledge), experience (Memory), and context (Working Memory) and produces **conclusions** — recommendations carrying evidence, assumptions, uncertainty, confidence, citations, and a full reasoning trace. It **holds nothing durable**, **edits nothing**, and **commits nothing**. Deciding is the cognitive chain's (Goals/Plans/Decision under governance); Reasoning only *concludes*.

---

## 1. Purpose

### Why the Reasoning layer exists

The company now has context (Working Memory), experience (Long-term Memory), and canonical truth (Knowledge). But data does not act — something must *think*: take a question, assemble the relevant truth/experience/context, generate hypotheses, gather and weigh evidence, detect contradictions and ambiguity, estimate uncertainty and confidence, weigh alternatives and trade-offs, predict risks, and produce a well-founded, cited, auditable **conclusion** — without owning anything, storing anything, or committing anything. Reasoning is that engine.

Reasoning is the **system of record for how the platform thinks — while thinking, not after.** It is a **stateless** process: each reasoning session reads from the durable/transient stores, runs a bounded cognitive process (via LLM Commands performed by Execution), and emits a conclusion whose every claim is supported by cited evidence and whose uncertainty is explicit. Its transient state lives in Working Memory; its durable outputs, if any, become Memory (by promotion), Knowledge (by ratification), or Decisions (by governance) — never a Reasoning-owned store. And crucially, its output is a **recommendation**: the authority to *commit* a decision belongs to the cognitive chain and its humans, never to the engine that reasoned.

Without a Reasoning layer, six things break: no principled thinking (agents act on raw retrieval), no evidence discipline (conclusions without support), no uncertainty honesty (guesses presented as facts), no separation of thinking from deciding (the engine that reasons also commits — unsafe), no explainability (no trace of *why*), and no bounded cognition (runaway recursion/cost). Reasoning closes that gap and holds the **conclusion boundary**: it turns truth/experience/context into cited, uncertainty-bearing conclusions — and stops exactly there, committing nothing.

### Business problem it solves

1. **Principled, evidence-based thinking.** The company must reach conclusions grounded in truth and experience, with explicit evidence, assumptions, and uncertainty — not confident guesses. Reasoning enforces that discipline.
2. **Honest uncertainty and explainability.** Every conclusion must show its support, its conflicts, its assumptions, its confidence, its citations, and its full trace — so a human can see *why*, and "insufficient evidence" / "unknown" are valid, first-class outputs. **Hallucinations are never hidden; missing information is explicitly reported.**
3. **Separation of thinking from deciding.** The engine that reasons must never commit. Reasoning produces recommendations; the governed cognitive chain (and humans) decide. This separation makes powerful reasoning safe.

### Its responsibility

- Own the lifecycle of every **reasoning session**: `created → hydrated → reasoning → deliberating → verifying → concluded | escalated | failed → disposed → archived` (governed, transient), separate from health `unknown → healthy / degraded / stalled` (observed).
- Be **stateless**: own nothing, store nothing durably; hold transient state in Working Memory; read Knowledge/Memory/Working Memory; **edit none of them.**
- **Assemble reasoning context** and **resolve inputs**: Knowledge resolution (authoritative truth, overriding Memory), Memory resolution (experience), Working Memory integration (context), plus Goal/Mission/Policy/Identity/Permission awareness as constraints.
- Run the **cognitive process**: hypothesis generation/elimination, evidence collection/weighting, multi-step reasoning (chain-of-thought abstraction), deliberation, reflection, self-critique, verification, contradiction/ambiguity detection, uncertainty representation, confidence estimation, alternatives, trade-off/risk analysis, failure prediction, scenario simulation, counterfactual reasoning.
- Produce **conclusions** (recommendations) each carrying **supporting evidence, conflicting evidence, assumptions, uncertainty, confidence, citations, and a reasoning trace** — never decisions.
- Enforce **escalation/human-review triggers**; **human review always overrides Reasoning.**
- Guarantee **explainability, citation, reasoning trace, observability, auditability**; run under **time/token budgets, recursion guards, cost governance, provider independence, and multi-model/parallel reasoning**; support **reasoning cache and replay**.
- Emit Reasoning events; be consumed by the cognitive chain, agents, and Governance.

### What is explicitly NOT its responsibility

- **Reasoning never commits decisions.** A conclusion is a recommendation; the governed cognitive chain (Goals/Plans/Decision) and humans commit. Reasoning has no commit path.
- **Reasoning never edits Knowledge, Memory, Mission, Goals, Plans, or Policies.** It reads them; it changes none. Its outputs may *feed* governed changes elsewhere, but Reasoning itself mutates nothing.
- **Reasoning owns nothing and stores nothing durably.** It is stateless; durability belongs to Memory/Knowledge/the chain. Its transient work lives in Working Memory.
- **Reasoning never hides uncertainty or hallucination.** Unknown and insufficient-evidence are valid outputs; unsupported claims are flagged, never presented as fact.
- **Reasoning never exceeds the Agent's authority, Identity, or Permissions.** It reasons only within the acting Agent's ceiling and scope.
- **Reasoning is not the LLM/provider.** It coordinates model calls (as Commands via Execution); it is provider-independent and multi-model.

---

## 2. Mental Model

If Knowledge is the **company handbook** (truth), Long-term Memory the **diary/archive** (experience), and Working Memory the **desk** (current context), then Reasoning is the **act of an analyst working at that desk** — reading the handbook and the diary, laying out hypotheses, weighing evidence for and against, noting what they're assuming and where they're unsure, sanity-checking themselves, and writing a **recommendation memo** that shows its work and its confidence. The analyst files nothing into the handbook, rewrites no diary entry, and does not sign the contract — they hand the memo up; someone with authority decides. When they don't have enough to conclude, they write "insufficient evidence," not a confident guess.

The mental model in one line: **Reasoning is the stateless cognitive engine that reads truth, experience, and context, runs a bounded, traceable, self-critiquing cognitive process, and emits conclusions — recommendations carrying evidence, assumptions, uncertainty, confidence, citations, and a full trace — while owning nothing, storing nothing, editing nothing, and committing nothing.**

Eight properties define the model:

- **Stateless.** Reasoning holds no durable state. Each session reads inputs, thinks, emits a conclusion, and is disposed. Transient state lives in Working Memory; nothing durable is Reasoning-owned.
- **Consuming, not owning.** It reads Knowledge (truth), Memory (experience), Working Memory (context) — and owns/edits none of them. It is a reader and a writer only of *its own transient conclusion*.
- **Conclusion-producing, not deciding.** Its output is a recommendation with provenance. Committing a decision is the governed cognitive chain's; Reasoning has no commit authority.
- **Evidence-disciplined.** Every conclusion carries supporting *and* conflicting evidence, assumptions, uncertainty, confidence, citations, and a trace. Claims without support are flagged, never asserted as fact.
- **Honest about the unknown.** "Unknown" and "insufficient evidence" are first-class outputs. Hallucinations are surfaced, not hidden; missing information is reported.
- **Truth-deferential and constrained.** Knowledge overrides Memory; Policy constrains; Mission guides; Identity and Permissions bound. Reasoning applies the hierarchy; it never overrides it.
- **Bounded cognition.** Time budget, token budget, recursion guards, and cost governance keep thinking finite and affordable; parallel and multi-model reasoning are available within bounds.
- **Human-supervised.** Escalation and human-review triggers are first-class; **human review always overrides Reasoning.**

Reasoning sits **above the stores as their consumer and beneath the decision as its input.** It reads truth/experience/context, produces a recommendation, and hands it to the chain/humans who decide. It is the hinge between *what is true/remembered/in-context* and *what the company concludes* — and it is exclusively about *thinking and concluding*, never *owning, storing, editing, deciding, or committing*.

---

## 3. Core Domain Objects

Reasoning introduces transient session objects, extending the existing `reasoning` schema. All reuse `_base.ts` contracts; but note Reasoning is stateless — its objects are transient/audit records, not durable stores:

- **`rootColumns`** / **`tenantColumns`**. `createdBy`/`agentRef` resolve to actor references (Identity §3.9); every session is tenant- and agent-scoped.

---

### 3.1 Reasoning Session

- **Purpose.** One bounded act of thinking about one question. The primary (transient) object of this module.
- **Table.** `reasoning_sessions` (`tenantColumns`) — a transient/audit record, not a durable store of content.
- **Conceptual fields.**
  - `id` — Reasoning Session ID.
  - `tenantId` — owning Company (Identity §3.1).
  - `agentRef` — the acting Agent (bounds authority/permissions/ceiling). Required.
  - `workingMemoryRef` — the Working Memory workspace holding this session's transient context/state. Required.
  - `question` — the reasoning objective/query.
  - `reasoningContextRef` — the assembled reasoning context (§3.2).
  - `constraints` — resolved constraints (policy/mission/identity/permission awareness; §5.6).
  - `hypotheses` — generated hypotheses and their status (§5.9).
  - `evidence` — collected evidence with weights and citations (§5.11).
  - `reasoningTraceRef` — the chain-of-thought/deliberation trace (§3.4, §5.20).
  - `conclusion` — the produced conclusion (§3.3), on completion.
  - `reasoningStrategy` — `reasoningStrategyEnum` (§3.5): deliberative / deterministic / multi-model / parallel / etc.
  - `timeBudget` / `tokenBudget` — hard cognition bounds (§5.24).
  - `recursionDepth` / `recursionGuard` — recursion controls (§5.23).
  - `cacheRef` — reasoning-cache reference (§5.25).
  - `reasoningLifecycleStatus` — governed lifecycle (`reasoningLifecycleStatusEnum`, §6).
  - `reasoningHealth` — health (`reasoningHealthEnum`, §6): `unknown | healthy | degraded | stalled`.
  - `correlationId` — threads the session through its Commands and lineage.
  - base audit fields (immutable audit of the session — the transient content itself lives in Working Memory).
- **Required.** `tenantId`, `agentRef`, `workingMemoryRef`, `question`, `reasoningLifecycleStatus`, `correlationId`. (`reasoningHealth` defaults `unknown`.)
- **Statelessness.** The session **owns and stores nothing durable**: its working content is in Working Memory (disposable); its audit trace is retained per policy; its conclusion is handed to the consumer (chain/agent) — Reasoning keeps no store of record.
- **Ownership.** Tenant-scoped; bound to one acting Agent; disposed when the thinking ends.
- **Example.** Session: agent `Atlas`, question "Should we offer lead #88 a discount?", context {Knowledge: pricing truth; Memory: prior interactions; WM: current conversation}, → conclusion "Recommend no discount (confidence 78%); assumptions/evidence/citations attached."

### 3.2 Reasoning Context

- **Purpose.** The assembled, resolved inputs the session reasons over — the **Context Assembly + Input Resolution** result.
- **Realization.** `reasoningContextRef` → a structured assembly (held in Working Memory) of: **Knowledge resolution** (authoritative truth, overriding memory), **Memory resolution** (experience), **Working Memory integration** (context), and **awareness** frames (Goal/Mission/Policy/Identity/Permission). Deterministic assembly + provenance per frame (Working Memory §5.1). **Knowledge overrides Memory** where they conflict.

### 3.3 Conclusion (Recommendation)

- **Purpose.** The output of a reasoning session — a **recommendation, never a decision.**
- **Realization.** `conclusion {statement, recommendationType, supportingEvidence[], conflictingEvidence[], assumptions[], uncertainty, confidence, citations[], reasoningTraceRef, alternatives[], tradeoffs[], risks[], escalationRequired?}`. **Every conclusion must contain supporting evidence, conflicting evidence, assumptions, uncertainty, confidence, citations, and a reasoning trace** (§7). A conclusion may be `unknown` / `insufficient-evidence` — **first-class valid outputs.**
- **Rule.** A conclusion is **consumed** by the cognitive chain/agent/human; it is **not** a commitment. Committing is elsewhere and governed.

### 3.4 Reasoning Trace

- **Purpose.** The explainable record of *how* the conclusion was reached — the **Chain-of-Thought abstraction, Explainability, Citation Model**.
- **Realization.** `reasoningTraceRef` → an ordered, cited record of steps (hypotheses, evidence, deliberation, self-critique, verification), each linking to the Knowledge/Memory it used **by id + version**. The trace makes "why did the agent conclude X" reconstructable and auditable. It is a *trace of process*, not a durable store of truth.

### 3.5 Reasoning Strategy

- **Purpose.** How the session reasons — the coordination shape.
- **Realization.** `reasoningStrategyEnum` (specified): `deliberative | deterministic | non-deterministic | multi-model | parallel | reflective | simulation | counterfactual`. Strategy governs model use, parallelism, and verification depth (§5). Deterministic strategies (rule/lookup) are reproducible; non-deterministic (LLM) strategies carry traced provenance for auditability despite model non-determinism.

---

## 4. Ownership

- **Reasoning owns nothing.** This is the defining ownership statement. **Reasoning owns nothing, stores nothing durable.** Working Memory owns transient context; Long-term Memory owns retained experience; Knowledge owns organizational truth; the cognitive chain owns decisions and intent. **Reasoning only consumes them.**
- **Session accountability.** A reasoning session is *accountable to* the acting Agent (and its human owner) — it reasons within that Agent's authority, permissions, and ceiling (Agent §7). The session's conclusion is attributed to the Agent that reasoned, for audit.
- **No durable store of record.** The session record is a transient/audit artifact; the *content* it reasons over lives in Working Memory (disposable) and the durable stores (read-only). Reasoning never becomes a shadow store.
- **Bounded by Identity/Permissions.** **Identity constrains Reasoning; Permissions constrain Reasoning.** A session may read only Knowledge/Memory/context the Agent's permissions and tenant scope allow; out-of-scope inputs never enter the reasoning context.
- **Human supervision.** **Human review always overrides Reasoning.** A conclusion is subordinate to human judgment; escalation triggers hand the question to a human whose decision supersedes any conclusion.
- **No cross-tenant reasoning.** A session never spans companies; every input frame is same-tenant.

---

## 5. Reasoning Architecture

The cognitive engine's internal architecture. All are thinking/consuming mechanics; none owns, stores durably, edits a store, or commits a decision.

### 5.1 Reasoning Engine

- The engine drives each session through a bounded cognitive pipeline: **assemble context → resolve inputs → generate hypotheses → collect/weigh evidence → deliberate (multi-step) → reflect/self-critique → verify → conclude (or escalate/insufficient-evidence)**. It runs via **LLM Commands performed by Execution** (Command/Execution layers), under the Agent's ceiling — the engine coordinates the thinking; it does not call providers directly.

### 5.2 Reasoning Session & 5.3 Reasoning Context

- A **session** (§3.1) is one bounded act of thinking; **context** (§3.2) is its assembled inputs. Sessions are stateless and disposable; context lives in Working Memory.

### 5.4 Context Assembly & 5.5 Input Resolution

- **Context assembly** gathers frames from all sources (Working Memory §5.1). **Input resolution** resolves each input to its authoritative form: **Knowledge resolution** (canonical truth), **Memory resolution** (experience), **Working Memory integration** (context). When Knowledge and Memory disagree on a fact, **Knowledge overrides** (Knowledge §5.7); the memory is retained as experience, flagged.

### 5.6 Goal/Mission/Policy/Identity/Permission Awareness & Constraint Resolution

- The session resolves and holds **awareness** of the active Goal (what outcome), Mission (what we're for), applicable Policy (what's allowed/required), Identity + Permissions (who's acting, within what authority). **Constraint resolution** turns these into hard bounds on the reasoning: **Policies constrain Reasoning; Mission guides Reasoning; Identity/Permissions bound Reasoning.** A conclusion that would require violating a constraint is flagged/escalated, never quietly recommended.

### 5.7 Assumption Tracking

- Every assumption the reasoning rests on is **explicitly tracked** and attached to the conclusion. Unstated assumptions are a defect; the engine surfaces them.

### 5.8 Hypothesis Generation & 5.9 Elimination

- The engine **generates** candidate hypotheses and **eliminates** them via evidence and contradiction — a structured search, not a single guess. Surviving hypotheses become the conclusion's basis; eliminated ones are recorded (with why) in the trace.

### 5.10 Evidence Collection & 5.11 Weighting

- **Evidence collection** gathers support from Knowledge (authoritative), Memory (experiential), and context. **Evidence weighting** ranks by source authority (Knowledge > Memory), freshness, corroboration, and relevance. Both supporting **and conflicting** evidence are collected and attached.

### 5.12 Multi-step Reasoning & Chain-of-Thought Abstraction

- **Multi-step reasoning** decomposes a hard question into steps; the **chain-of-thought abstraction** captures the ordered, cited steps as the reasoning trace — explainable, not a black box.

### 5.13 Deliberation, 5.14 Reflection, 5.15 Self-Critique, 5.16 Verification

- **Deliberation** weighs alternatives; **reflection** reviews the reasoning so far; **self-critique** actively looks for flaws in the drawn conclusion; **verification** checks the conclusion against Knowledge/constraints and for internal consistency before emitting it. A conclusion failing verification is revised or downgraded (lower confidence / escalate).

### 5.17 Contradiction & 5.18 Ambiguity Detection

- **Contradiction detection** finds conflicts (Memory vs Knowledge, evidence vs evidence, hypothesis vs constraint) and surfaces them — never silently picks a side. **Ambiguity detection** flags under-specified questions/inputs and reports what is unclear rather than guessing.

### 5.19 Uncertainty Representation & Confidence Estimation

- **Uncertainty** is represented explicitly (what is unknown/assumed/contested). **Confidence** is estimated for the conclusion from evidence strength, source authority, contradiction, and completeness. **Unknown / insufficient-evidence** are valid conclusions; confidence is never inflated to hide doubt.

### 5.20 Alternatives, Trade-off, Risk, Failure Prediction, Scenario/Counterfactual

- The engine produces **alternative solutions**, **trade-off analysis**, **risk analysis**, **failure prediction**, **scenario simulation**, and **counterfactual reasoning** ("what if X were different") — so the consumer sees options and consequences, not a single opaque answer.

### 5.21 Escalation & Human-Review Trigger

- **Escalation rules** fire when confidence is too low, constraints conflict, contradictions are unresolved, risk/impact is high, or the question exceeds the Agent's authority — routing to a **human review**. **Human review always overrides Reasoning.** Escalation is a first-class, expected outcome, not a failure.

### 5.22 Reasoning Trace, Explainability, Citation, 5.26 Observability, Auditability

- The **reasoning trace** + **citation model** (every claim → Knowledge/Memory id+version) deliver **explainability**: "why did the agent conclude X" is reconstructable. **Observability** exposes step counts, model use, budget/cost, confidence, contradiction/escalation rates. **Every reasoning session is fully auditable** — the trace and inputs are retained per policy even though the engine is stateless.

### 5.23 Recursive Reasoning Guards & 5.24 Time/Token Budget & Cost Governance

- **Recursion guards** cap depth/self-invocation (a session cannot infinitely re-reason). **Time budget** and **token budget** bound each session; exceeding → `stalled` health → escalate/insufficient-evidence, never an unbounded run. **Cost governance** attributes reasoning cost (LLM Commands, Execution §3.7) to the Agent and up the lineage; a cost breach halts/escalates.

### 5.25 Reasoning Cache & 5.27 Replay

- **Reasoning cache**: identical (question + resolved-context + strategy) may reuse a cached conclusion (invalidated when underlying Knowledge/Memory versions change) — bounded, versioned. **Replay**: because inputs are versioned and the trace is recorded, a session is **replayable** for audit/debugging (deterministic strategies reproduce exactly; non-deterministic ones reproduce the traced path and citations). Replay is read-only; it re-derives, it never commits.

### 5.28 Provider Independence & Multi-model / Parallel Reasoning

- **Provider independence**: model calls are Commands (Command §3.2 `targetType=llm`) resolved by Execution — the engine binds no SDK. **Multi-model reasoning**: several models may be consulted (ensemble/verification); **parallel reasoning**: independent hypotheses/branches run concurrently within budget and are reconciled. **Deterministic vs non-deterministic**: deterministic reasoning (rules/lookups over Knowledge) is reproducible; non-deterministic (LLM) reasoning carries the trace/citations that make it auditable despite model variability.

### 5.29 The conclusion boundary

- Reasoning **reads and concludes** but **owns/stores/edits nothing and commits nothing**. Its conclusion is a recommendation handed up; the durable effect of that conclusion (a memory, a knowledge ratification, a decision, a plan) happens in *other* governed modules. This boundary is why the platform can think powerfully — hypothesize, deliberate, self-critique, simulate — without that thinking ever silently changing truth, memory, intent, or committing an action.

---

## 6. Lifecycle

A Reasoning session carries **two orthogonal state dimensions** (mirroring prior specs) that must never be conflated:

- **Lifecycle** (`reasoningLifecycleStatusEnum`) — *where the session is in its bounded existence.* Governed transitions only.
- **Health** (`reasoningHealthEnum`) — *how well the in-flight thinking is going.* Auto-derived; never a lifecycle transition.

Governing rule: **a session reasons within the Agent's authority, over resolved inputs (Knowledge overriding Memory), under time/token/recursion/cost bounds; it emits a fully-provenanced conclusion or escalates or reports insufficient-evidence; it stores nothing durable and commits nothing.**

### 6.1 Lifecycle dimension

**`reasoningLifecycleStatusEnum`** (specified): `created | hydrated | reasoning | deliberating | verifying | concluded | escalated | failed | disposed | archived`.

| Lifecycle state | Meaning | Mutable? | Carries health? |
|---|---|---|---|
| **created** | Session opened for a question | Yes (pre-hydrate) | No |
| **hydrated** | Context assembled + inputs resolved | Append (in WM) | **Yes** |
| **reasoning** | Hypotheses generated, evidence collected | Append | **Yes** |
| **deliberating** | Weighing alternatives, reflecting, self-critiquing | Append | **Yes** |
| **verifying** | Checking conclusion vs Knowledge/constraints/consistency | Append | **Yes** |
| **concluded** | Conclusion emitted (may be `unknown`/`insufficient-evidence`) | No (terminal-positive) | No (cleared) |
| **escalated** | Routed to human review (terminal for the engine) | No (terminal) | No |
| **failed** | Could not complete (budget/guard/error) | No (terminal) | No |
| **disposed** | Transient content disposed (with Working Memory) | No (immutable audit stub) | No |
| **archived** | Audit stub retired; terminal | No (immutable) | No |

`reasoning/deliberating/verifying` are the active cognitive phases; `concluded/escalated/failed` are terminal outcomes; `disposed/archived` retire the session (its content disposes with the Working Memory workspace, its audit trace retained per policy).

**Lifecycle transitions (governed):**

| Transition | From → To | Precondition | Effect | Emits |
|---|---|---|---|---|
| **Create** | ∅ → created | Agent opens a session for a question | session created; `reasoningHealth=unknown` | `ReasoningSessionCreated` |
| **Hydrate** | created → hydrated | Context assembled; inputs resolved (Knowledge overrides Memory); constraints resolved; within permissions | context ready; health tracking begins | `ReasoningHydrated` |
| **Reason** | hydrated → reasoning | Hypotheses generated; evidence collection begins | steps run via LLM Commands (bounded) | `ReasoningStarted` |
| **Deliberate** | reasoning → deliberating | Evidence gathered; alternatives/trade-offs/risks evaluated; self-critique | deliberation recorded in trace | `ReasoningDeliberating` |
| **Verify** | deliberating → verifying | Candidate conclusion formed | verification vs Knowledge/constraints/consistency | `ReasoningVerifying` |
| **Conclude** | verifying → concluded | Verification passed (or `insufficient-evidence`/`unknown` reached honestly) | conclusion emitted with full provenance (§3.3) | `ReasoningConcluded` |
| **Escalate** | any active → escalated | Escalation rule fires (low confidence, conflict, high risk, over-authority) | routed to human review; **human overrides** | `ReasoningEscalated` |
| **Fail** | any active → failed | Time/token/recursion/cost bound hit, or unrecoverable error | terminal; reports why; no conclusion committed | `ReasoningFailed` |
| **Dispose** | concluded/escalated/failed → disposed | Working Memory disposed / session closed | transient content disposed; audit stub retained | `ReasoningDisposed` |
| **Archive** | disposed → archived | Governed retirement of the audit stub | terminal | `ReasoningArchived` |

Every transition is audited (the trace/inputs retained per policy). **Health never appears in this table.** No transition **commits a decision** — the terminal `concluded` emits a *recommendation*, consumed elsewhere.

### 6.2 Health dimension

**`reasoningHealthEnum`** (specified): `unknown | healthy | degraded | stalled`.

| Health state | Meaning | Set how |
|---|---|---|
| **unknown** | No sufficient signal (default; also terminal) | default / on clear |
| **healthy** | Progressing within budgets, evidence sufficient, coherent | auto |
| **degraded** | Weak/conflicting evidence, high uncertainty, budget pressure | auto |
| **stalled** | Recursion guard tripped, budget exhausted, blocked on missing input | auto |

**Health rules:**

- **Scope.** Health applies **only** to active phases (`hydrated | reasoning | deliberating | verifying`). Before hydrate it is `unknown`; terminal states clear it to `unknown`, frozen.
- **Automatic.** Derived from **evidence sufficiency, contradiction level, uncertainty, budget/recursion pressure, missing-input signals.** Never manual.
- **No lifecycle effect.** **Health never changes lifecycle.** A `stalled`/`degraded` session does not auto-conclude with a guess; it escalates or reports insufficient-evidence via a governed transition. Only governed transitions move lifecycle.
- **Observability, not authority.** Health flags cognition quality; it never fabricates a conclusion.

### 6.3 Terminal-state rules

- **concluded / escalated / failed** are the three honest outcomes; **disposed/archived** retire the session. There is **no "committed" terminal** — Reasoning never commits.
- The **conclusion is handed to the consumer**; the transient reasoning content disposes with the Working Memory workspace; the **reasoning trace + inputs are retained per policy** so **every reasoning session is fully auditable** and replayable.
- **Escalated** sessions are subordinate to the human decision that follows; **human review always overrides** the conclusion.
- Terminal sessions carry `reasoningHealth = unknown` (cleared, frozen).

---

## 7. Constraints

Structural and semantic constraints, enforced by the module — not by convention.

**Structural / hard invariants (enforced):**

1. **Stateless; owns/stores nothing durable.** **Reasoning is stateless. Reasoning owns nothing. Reasoning stores nothing.** Transient state lives in Working Memory; durable content is Memory/Knowledge/chain's.
2. **Consume-only of the stores.** **Working Memory owns transient context; Long-term Memory owns retained experience; Knowledge owns organizational truth; Reasoning only consumes them.**
3. **Edits nothing.** **Reasoning never edits Knowledge, Memory, Mission, Goals, Plans, or Policies.** It has no write path to any of them.
4. **Conclusions, not decisions.** **Reasoning produces conclusions. Conclusions are not decisions. Conclusions are recommendations.** Reasoning has no commit authority.
5. **Full conclusion provenance mandatory.** **Every conclusion must contain supporting evidence, conflicting evidence, assumptions, uncertainty, confidence, citations, and a reasoning trace.** A conclusion missing any is invalid.
6. **Fully auditable.** **Every reasoning session is fully auditable** — trace + inputs retained per policy; citations reference Knowledge/Memory by id+version.
7. **Honest uncertainty.** **Hallucinations are never hidden; missing information is explicitly reported; unknown is a valid output; "insufficient evidence" is a first-class result.** Unsupported claims are flagged, never asserted as fact.
8. **Bounded cognition.** Time budget, token budget, recursion guards, cost governance are mandatory; a session cannot run unbounded or recurse infinitely.
9. **Tenant isolation.** `tenantId` NOT NULL; no cross-tenant reasoning; inputs same-tenant.

**Semantic (module-enforced) — the hierarchy guards:**

10. **Knowledge overrides Memory.** When they conflict on a fact, Reasoning uses Knowledge; Memory is experience, flagged.
11. **Policies constrain; Mission guides; Identity/Permissions bound.** Reasoning applies the authority hierarchy; a conclusion requiring a violation is flagged/escalated, never quietly recommended. Reasoning never exceeds the Agent's authority.
12. **Human review always overrides.** A conclusion is subordinate to human judgment; escalation hands the question to a human whose decision supersedes.
13. **Provider-independent, multi-model.** No bound SDK; model calls are Commands via Execution; provider swap changes nothing in the reasoning model.
14. **Contradictions/ambiguity surfaced, never silently resolved.** Reasoning reports conflicts and asks/escalates rather than guessing a side.
15. **Lifecycle/health orthogonal; health scoped/derived.** Separate fields; health non-`unknown` only active; auto-derived; never writes lifecycle.
16. **No commit path.** Structurally, Reasoning has no edge that commits a Decision, mutates a store, or performs an effect (effects are Execution's, via Commands the *chain* — not Reasoning — authorizes).

---

## 8. Validation

Validation runs at gates: **hydration** (input resolution), **during reasoning** (evidence/contradiction/budget), **verification** (pre-conclusion), and **conclusion emission**. Reasoning fails closed: on ambiguity it does not fabricate; it reports unknown/insufficient-evidence or escalates.

**Input-resolution validation (hydration):**

- Inputs resolve within the Agent's permissions + tenant scope; out-of-scope Knowledge/Memory is refused entry. **Knowledge overrides Memory** on conflicts; the override is recorded.
- Constraints (Policy/Mission/Identity/Permissions) are resolved; the reasoning is bounded by them.

**Evidence & reasoning validation (during):**

- Every claim under construction is tied to cited evidence (Knowledge/Memory id+version); an unsupported claim is flagged as a hypothesis, not a fact.
- Both supporting and conflicting evidence are collected; assumptions are tracked; contradictions/ambiguities are surfaced.
- Budgets/recursion tracked; exceeding → `stalled` → escalate/insufficient-evidence, never a rushed guess.

**Verification validation (pre-conclusion):**

- The candidate conclusion is checked against Knowledge (consistency with truth), constraints (no violation), and internal consistency; self-critique looks for flaws. A conclusion failing verification is revised, downgraded (lower confidence), or escalated.

**Conclusion validation (emission):**

- The conclusion carries **all mandatory fields** (evidence for/against, assumptions, uncertainty, confidence, citations, trace); a conclusion missing any is invalid and not emitted.
- Confidence is justified by evidence, not inflated; `unknown`/`insufficient-evidence` are emitted honestly when warranted.
- If the conclusion would require a constraint violation or exceeds the Agent's authority → **escalate to human**, never recommend the violation.

**Commit-boundary validation (continuous):**

- Any attempt by Reasoning to edit a store, commit a decision, or perform an effect is refused as a layer violation — Reasoning has no such path.

**Health validation (continuous):**

- `reasoningHealth` non-`unknown` only active; unresolved inputs yield `unknown`/`stalled`; a health update never moves lifecycle.

Only a conclusion passing all gates is emitted. A failure escalates or reports insufficient-evidence with the reason recorded; a guess is never emitted as a fact.

---

## 9. Relationships

Reasoning consumes the stores and intent-layers (read-only), produces conclusions for the cognitive chain, and runs via Execution. It edits nothing and commits nothing.

| Module | Relationship to Reasoning |
|---|---|
| **Knowledge** | **Authoritative input.** Reasoning consumes canonical truth; **Knowledge overrides Memory**; Reasoning **never edits Knowledge** (Knowledge §9). Citations reference Knowledge by id+version. |
| **Long-term Memory** | **Experiential input.** Reasoning consumes retained experience (may conflict; not authoritative); it **never edits Memory**. A conclusion may later be *promoted* to Memory by the Agent — a governed act elsewhere, not a Reasoning write. |
| **Working Memory** | **Transient state substrate.** The session's context/intermediate reasoning live in Working Memory (Working Memory §3.1); Reasoning holds nothing durable of its own. Working Memory is disposed; the reasoning trace is retained per audit policy. |
| **Mission** | **Guides.** Mission awareness bounds reasoning toward purpose; Reasoning **never edits Mission**; a conclusion conflicting with Mission is flagged/escalated. |
| **Goals / Plans** | **Consumers and constraints.** Reasoning reasons *in service of* a Goal/Plan and its conclusions feed them; it **never edits Goals or Plans**. Committing a goal/plan change is the chain's, governed. |
| **Policies** | **Constrain.** Policy awareness bounds what may be recommended; Reasoning **never edits Policies**; a conclusion requiring a policy violation is escalated. |
| **Decision / cognitive chain** | **The consumer that commits.** Reasoning hands a conclusion (recommendation) to the decision/chain, which **commits** under governance. Reasoning has no commit path; conclusion ≠ decision. |
| **Agent** | **The reasoner's principal.** A session runs under the acting Agent's authority/permissions/ceiling (Agent §5.5 reasoning binding); it never exceeds them. The conclusion is attributed to the Agent. |
| **Execution / Commands** | **The performer of model calls.** Reasoning runs via LLM Commands performed by Execution (provider-independent, multi-model); Reasoning **never calls providers directly** and never performs effects. |
| **Human review** | **The override.** Escalation routes to a human whose decision **always overrides** the conclusion. |
| **Governance** | Adjudicates escalations, contradiction/constraint conflicts, and reasoning-quality policy. Reasoning surfaces; Governance/humans decide. |
| **Identity / Permissions** | **Bound.** Constrain what a session may read and conclude; enforced at input resolution. |
| **Audit / Observability** | Retain the trace + inputs (auditable) and expose cognition metrics (§5.26). |

**The cognition spine:** `Knowledge (truth) + Memory (experience) + Working Memory (context) → Reasoning (concludes) → Decision/Goals/Plans (commit, governed)`, all under the Agent's ceiling, with human review overriding. Reasoning is the thinking node that turns truth/experience/context into cited, uncertainty-bearing recommendations — and stops exactly at the conclusion.

### 9.1 Explicit distinction table (Working Memory · Long-term Memory · Knowledge · Reasoning · Decision)

| Layer | Owns | Durable? | Mutable by whom | Question it answers | Commits? |
|---|---|---|---|---|---|
| **Working Memory** | Transient context for one session | No (disposable) | The owning Agent (transient) | "What context am I working with now?" | No |
| **Long-term Memory** | Retained experiences (may conflict) | Yes | Governed promotion only | "What happened / what did we learn?" | No |
| **Knowledge** | Canonical organizational truth (conflict-free) | Yes | Governed promotion + ratification | "What is true?" | No |
| **Reasoning** | **Nothing** (stateless process) | **No** | N/A — edits nothing | "What should we conclude (recommend)?" | **No** |
| **Decision** (cognitive chain) | Committed choices/intent | Yes | Governed decision + humans | "What have we committed to do?" | **Yes** |

**What each layer owns, precisely:** Working Memory owns the *desk* (context, transient). Long-term Memory owns the *diary* (experience, durable, may conflict). Knowledge owns the *handbook* (truth, durable, canonical). **Reasoning owns nothing** — it is the *analyst thinking*, holding no store, editing none, producing a *memo* (recommendation). Decision owns the *signed commitment* — the only layer that commits.

**Authority when they disagree:** Knowledge overrides Memory (truth beats experience); Policy/Law/Compliance bound what may be recommended; Mission guides; the Agent's ceiling and Permissions bound the reasoner; and **human review overrides everything Reasoning concludes.**

---

## 10. Events

Every Reasoning transition emits exactly one domain event. The cognitive chain, agents, Governance, and observability subscribe. Payloads carry `actorRef`(agent), `tenantId`, `reasoningSessionId`, `correlationId`, `workingMemoryRef`, and `occurredAt`.

| Event | Trigger | Payload (beyond envelope) | Consumers | Business impact |
|---|---|---|---|---|
| `ReasoningSessionCreated` | Session opened | question, agentRef | Observability | Thinking begins |
| `ReasoningHydrated` | Context assembled; inputs resolved | knowledgeRefs, memoryRefs, constraints | Observability | Inputs ready (Knowledge overrides recorded) |
| `ReasoningStarted` | Hypotheses/evidence begin | strategy | Observability | Cognitive process underway |
| `ReasoningStepRecorded` | A traced reasoning step | stepId, citations | Observability, Audit | Explainable trace grows |
| `ReasoningContradictionDetected` | Conflict found (Memory vs Knowledge, evidence vs evidence) | conflictRefs | **Governance**, Observability | Surfaced, not silently resolved |
| `ReasoningAmbiguityDetected` | Under-specified input/question | ambiguityDetail | Agent, Observability | Reported; may ask/escalate |
| `ReasoningHealthChanged` | Health recomputed (active only) | fromHealth, toHealth, drivers | Observability, Governance | Cognition-quality signal; **no lifecycle change** |
| `ReasoningDegraded` / `ReasoningStalled` | Health specializations | reason | Governance, Notifications | Weak evidence / budget-recursion pressure |
| `ReasoningConcluded` | Conclusion emitted (incl. unknown/insufficient-evidence) | conclusionRef, confidence, isInsufficient | **Cognitive chain / Agent**, Audit | Recommendation available (not a decision) |
| `ReasoningInsufficientEvidence` | Honest "cannot conclude" | missingInfo | Agent, Governance | First-class result; no guess emitted |
| `ReasoningEscalated` | Escalation rule fired | reason (low-confidence/conflict/high-risk/over-authority) | **Human review**, Governance, Notifications | Human decides; **overrides Reasoning** |
| `ReasoningFailed` | Budget/recursion/error | reason | Governance, Observability | No conclusion committed |
| `ReasoningCitationsAttached` | Citations finalized on a conclusion | knowledge/memory id+version list | Audit | Explainability/traceability complete |
| `ReasoningReplayed` | Replay run created | replaySourceId | Governance, Audit | Deterministic re-derivation; non-committing |
| `ReasoningDisposed` / `ReasoningArchived` | Session retired | — | Reporting | Transient content disposed; trace retained |
| `ReasoningAuthorityViolationAttempted` | Attempt to edit a store / commit / exceed ceiling | attemptType | **Security, Governance**, Audit | Boundary enforced; blocked and audited |

**Ordering and idempotency.** Events carry `correlationId` + step indices; consumers discard stale/duplicate deliveries. Emission is **transactional with the mutation** (of the audit record); a failed audit/event write rolls back — no un-audited reasoning step (within retention).

**Two independent streams.** Health events never accompany or cause a lifecycle change; lifecycle events never carry a health transition.

---

## 11. KPIs

Reasoning quality and the cognitive engine's performance, measured deterministically from session records/traces.

| KPI | Definition | Source |
|---|---|---|
| **Conclusion completeness** | % of conclusions with all mandatory fields (evidence/assumptions/uncertainty/confidence/citations/trace) — target 100% | conclusion validation |
| **Citation coverage** | % of conclusion claims backed by a cited Knowledge/Memory reference | trace/citations |
| **Grounding rate** | % of claims grounded in Knowledge/Memory vs ungrounded (hallucination) — target: ungrounded flagged 100% | grounding checks |
| **Insufficient-evidence rate** | % of sessions honestly returning insufficient-evidence/unknown | conclusion types |
| **Escalation rate** | % of sessions escalated to human review | escalation events |
| **Human-override rate** | % of escalated/consumed conclusions a human overrode | human decisions |
| **Confidence calibration** | Agreement between stated confidence and actual outcome correctness | outcome feedback |
| **Contradiction surfacing** | % of input contradictions detected and surfaced (vs silently resolved) — target 100% | contradiction events |
| **Knowledge-override application** | % of Memory-vs-Knowledge conflicts where Knowledge was correctly applied | resolution telemetry |
| **Constraint conformance** | % of conclusions within Policy/Mission/Identity/permission bounds (target 100%) | constraint checks |
| **Determinism/replay fidelity** | % of sessions reproducing their traced path on replay | replay checks |
| **Budget conformance** | % of sessions within time/token/recursion budgets | budget tracking |
| **Cost per conclusion** | Reasoning LLM cost per session, attributed to Agent/lineage | Execution cost |
| **Cache hit rate** | % of sessions served from a valid reasoning cache | cache telemetry |
| **Health distribution** | % of active sessions healthy vs degraded/stalled | `reasoningHealth` |
| **Auditability completeness** | % of sessions with a complete, replayable trace (target 100%) | audit chain |

These feed the Executive/Director and Observability surfaces (Identity §10 pattern). All from Reasoning's own session records — no external inference.

---

## 12. Failure Scenarios

At least the following failure modes and the engine's deterministic reaction. Governing rule: **Reasoning fails closed and honest** — on ambiguity it never fabricates; it reports unknown/insufficient-evidence or escalates, and it commits/edits nothing.

1. **Insufficient evidence.** Emits `insufficient-evidence` (first-class), not a guess.
2. **Unknown answer.** Emits `unknown` honestly; never invents a fact.
3. **Hallucination risk (ungrounded claim).** The claim is flagged as unsupported hypothesis, not asserted as fact; grounding is required for a factual conclusion.
4. **Memory conflicts with Knowledge.** Knowledge overrides; the memory is flagged as experience; the override is recorded — never silently pick the memory.
5. **Two Knowledge dependencies conflict.** Contradiction surfaced; `contested`-style flag; escalates to Governance/human rather than choosing.
6. **Ambiguous question.** Ambiguity detected and reported; the engine asks/escalates rather than guessing an interpretation.
7. **Conclusion would violate a Policy/Law/Compliance.** Flagged/escalated; never recommended; protective/authority hierarchy honored.
8. **Conclusion conflicts with Mission.** Flagged/escalated; Mission guides; not quietly recommended.
9. **Question exceeds the Agent's authority.** Escalated to a human with the authority; the agent's reasoning never self-authorizes beyond its ceiling.
10. **Attempt to edit Knowledge/Memory/Mission/Goals/Plans/Policies.** Refused — Reasoning has no write path; layer violation, audited.
11. **Attempt to commit a decision.** Refused — conclusions are recommendations; committing is the chain's; no commit path exists.
12. **Attempt to perform an effect / call a provider directly.** Refused — model calls are Commands via Execution; effects are Execution's.
13. **Recursion guard tripped (infinite self-reasoning).** `stalled`; halts; escalates/insufficient-evidence; never an unbounded loop.
14. **Time budget exceeded.** `stalled` → `failed`/escalate with partial trace; no rushed fabricated conclusion.
15. **Token budget exceeded.** Same — bounded; escalate/insufficient-evidence; compress context (via Working Memory) if possible first.
16. **Cost limit exceeded.** Halts/escalates; cost attributed; never a silent overspend.
17. **Provider outage mid-reasoning.** Failover to another model (Execution); if none, `degraded`→escalate; the reasoning model is provider-independent.
18. **Non-deterministic model gives inconsistent steps.** The trace + citations preserve auditability; verification/self-critique catches inconsistency; low-confidence or escalate rather than emit a shaky conclusion.
19. **Overconfident conclusion (confidence not justified).** Verification/self-critique downgrades confidence to match evidence; inflated confidence is refused.
20. **Missing citation on a claim.** The claim cannot be part of a factual conclusion without grounding; flagged; conclusion incomplete → revise or downgrade.
21. **Out-of-scope input attempted.** Refused at input resolution; permission/tenant scope enforced.
22. **Cross-tenant reasoning.** Structurally impossible; refused.
23. **Stale Knowledge used.** The Knowledge's `stale` health is surfaced in the citation; the conclusion notes reliance on stale truth; steward review may be flagged.
24. **Contested Knowledge used.** The conclusion notes reliance on contested truth and lowers confidence/escalates as warranted.
25. **Human overrides the conclusion.** The human decision supersedes; the conclusion is recorded as recommendation-not-taken; no conflict — Reasoning never had commit authority.
26. **Self-critique finds a flaw post-conclusion.** Verification catches it before emission; if found after, the conclusion is retractable as a recommendation (not a committed decision) and re-reasoned.
27. **Parallel branches disagree.** Reconciled by a declared rule (evidence weight/verification); if irreconcilable, surfaced/escalated, not silently merged.
28. **Multi-model ensemble disagrees.** Disagreement surfaced; confidence lowered; verification/human as needed — never a hidden pick.
29. **Cache serves a stale conclusion.** Cache invalidated on underlying Knowledge/Memory version change; a stale cache hit is refused/re-derived.
30. **Replay diverges (non-deterministic).** Replay reproduces the traced path + citations (not necessarily identical tokens); divergence beyond the trace is flagged; deterministic strategies reproduce exactly.
31. **Working Memory disposed mid-session.** The session fails/escalates (its transient state is gone); no fabricated continuation.
32. **Agent suspended mid-session.** Session halts/escalates; no reasoning under a suspended agent's blocked authority.
33. **Agent authority drops mid-session.** Inputs re-scoped; out-of-scope frames fenced; the conclusion respects the reduced ceiling.
34. **Assumption left implicit.** Assumption tracking surfaces it; an unstated assumption is a validation failure — assumptions must be explicit.
35. **Conflicting-evidence omitted.** Refused — conclusions must include conflicting evidence; omitting it is invalid.
36. **Reasoning asked to be the source of truth.** Refused — truth is Knowledge's; a conclusion is a recommendation, never canonical truth (it may be *promoted* to Knowledge elsewhere, governed).
37. **Scenario simulation mistaken for reality.** Counterfactual/simulation outputs are labeled as such; never presented as actual fact or a committed outcome.
38. **Audit write fails on a reasoning step.** Transactional emission rolls back the step; no un-audited reasoning — the fully-auditable guarantee holds (within retention).
39. **Escalation ignored / no human available.** The session stays escalated (not auto-concluded); the question waits for human review — Reasoning never self-resolves an escalation.
40. **Circular citation (A cites B cites A as support).** Detected; the circular support is invalidated; grounding must bottom out in Knowledge/Memory, not self-reference.
41. **Confidence requested as certainty on inherently uncertain input.** Uncertainty is represented explicitly; forced certainty is refused — honest uncertainty over false precision.

---

## 13. Enterprise Use Cases

Behavior of Reasoning in real situations. In every case Reasoning reads truth/experience/context, produces a cited recommendation, and commits/edits nothing.

1. **Discount decision support.** Agent reasons "should we discount lead #88?": consults pricing Knowledge (no exception), prior-interaction Memory, current context; concludes "recommend no discount, confidence 78%," with evidence/assumptions/citations — a human/agent decides.
2. **Knowledge overrides memory.** An agent remembers a customer as Net-60; Knowledge says Net-30 canonical; reasoning uses Net-30 and notes the memory conflict.
3. **Insufficient evidence.** Asked to conclude a customer's budget with no data, reasoning returns `insufficient-evidence`, listing what's missing — not a guess.
4. **Unknown is valid.** Asked an unanswerable question, reasoning returns `unknown` honestly.
5. **Hallucination surfaced.** A model proposes an unsupported "fact"; grounding check flags it as unsupported; it does not enter the conclusion as fact.
6. **Hypothesis elimination.** Diagnosing a failed campaign, reasoning generates several causes and eliminates them by evidence, concluding the surviving one with confidence.
7. **Trade-off analysis.** For a market-entry question, reasoning lays out alternatives with trade-offs/risks; a human decides.
8. **Risk & failure prediction.** Before a bulk action, reasoning predicts failure modes and risks, recommending safeguards.
9. **Scenario simulation.** Reasoning simulates "what if we raise prices 10%?" as a labeled counterfactual, not a committed plan.
10. **Contradiction escalated.** Two Knowledge truths strain; reasoning surfaces the contradiction and escalates to Governance rather than picking.
11. **Ambiguity reported.** A vague task ("improve things") is flagged ambiguous; reasoning asks for clarification.
12. **Low confidence → escalate.** A high-impact conclusion at 40% confidence escalates to a human.
13. **Over-authority → escalate.** A question requiring authority beyond the agent's ceiling escalates to an authorized human.
14. **Policy constraint honored.** A recommendation that would breach an approved policy is flagged/escalated, never recommended.
15. **Mission-guided reasoning.** Reasoning weighs an option against the Mission and notes alignment/conflict.
16. **Multi-step reasoning traced.** A complex analysis is decomposed into cited steps; the trace explains "why X."
17. **Self-critique catches a flaw.** Verification finds the draft conclusion ignored conflicting evidence; it's revised/downgraded before emission.
18. **Multi-model verification.** A critical conclusion is checked across two models; agreement raises confidence, disagreement lowers it.
19. **Parallel hypotheses.** Independent hypotheses run concurrently within budget and are reconciled by evidence weight.
20. **Deterministic reasoning.** A rules-over-Knowledge computation (e.g. eligibility) is deterministic and reproducible.
21. **Citation-backed recommendation.** Every claim in a recommendation links to Knowledge/Memory id+version for audit.
22. **Explainability for a human.** A manager asks "why did the agent recommend X?"; the reasoning trace reconstructs it.
23. **Replay for audit.** An auditor replays a session to verify the basis of a recommendation.
24. **Reasoning cache hit.** An identical question with unchanged inputs reuses a cached conclusion; a Knowledge version bump invalidates it.
25. **Budget-bounded.** A runaway analysis hits its token budget, `stalled`, and escalates with partial findings rather than looping.
26. **Recursion guarded.** A self-referential question can't infinitely re-reason; the guard trips; escalates.
27. **Cost governance.** A pricey multi-model session nears the agent's cost limit; it halts/escalates; cost attributed.
28. **Provider swap.** The LLM provider is swapped in the registry; reasoning runs unchanged (provider-independent).
29. **Human overrides.** A human disagrees with a conclusion and decides otherwise; the override supersedes; recorded.
30. **Conclusion promoted to Memory.** A useful conclusion ("this segment responds to email") is *promoted* (governed) to Long-term Memory by the agent — not written by Reasoning.
31. **Conclusion promoted to Knowledge.** A well-corroborated conclusion becomes a Knowledge candidate (governed ratification) — Reasoning proposes via the agent; it never ratifies.
32. **Conclusion feeds a Decision.** A recommendation is handed to the cognitive chain, which commits a governed Decision.
33. **Stale-truth caveat.** Reasoning uses a `stale` Knowledge and flags the reliance, prompting steward review.
34. **Contested-truth caution.** Reasoning uses `contested` Knowledge, lowers confidence, and notes the dispute.
35. **Assumptions explicit.** A market recommendation lists its assumptions (demand steady, no regulation change) so the decider sees the ground.
36. **Conflicting evidence shown.** A recommendation includes the evidence against it, not just for — the decider sees both sides.
37. **Counterfactual for planning.** "If the top competitor exits, what changes?" is reasoned as a labeled counterfactual to inform a plan.
38. **Escalation waits for human.** No human is available; the escalated question waits; Reasoning does not self-resolve.
39. **Suspended agent.** An agent is suspended mid-session; reasoning halts; no conclusion under blocked authority.
40. **Ceiling drop mid-session.** The agent's authority drops; reasoning re-scopes and respects the reduced ceiling.
41. **Observability tuning.** Ops watches escalation/insufficient-evidence/override rates to tune agent capabilities and thresholds.
42. **Ensemble disagreement escalates.** Two models strongly disagree on a high-stakes conclusion; reasoning escalates to a human.
43. **Simulation not reality.** A simulated outcome is clearly labeled; no one mistakes it for a committed result.
44. **Grounded refusal.** Asked to justify a predetermined answer without evidence, reasoning refuses to fabricate support and reports insufficient grounding.
45. **Audit for a regulator.** A regulator asks the basis of an automated recommendation; the trace + citations + version-pinned Knowledge provide a full, reconstructable account.
46. **M&A isolation.** Reasoning sessions stay per tenant; no cross-tenant inputs during integration.

---

## 14. Extensibility

How Reasoning absorbs future demands **without redesign**, because the core abstractions were chosen as extension points.

- **New reasoning strategies.** `reasoningStrategyEnum` extends (tree-of-thought, debate, tool-augmented) behind the same conclusion+trace contract.
- **New models/providers.** Multi-model + provider independence make new models a registry/Execution concern, not a reasoning-model change.
- **Richer uncertainty/confidence.** Calibrated/probabilistic representations extend behind the "honest uncertainty" contract.
- **Advanced verification.** Formal verification, adversarial self-critique, and cross-checking against Knowledge extend the verification phase.
- **Tool-augmented reasoning.** Reasoning that invokes tools does so via Commands/Execution — same boundary, no direct calls.
- **Learning integration.** Reasoning outcomes feed Learning (doc 47) — which improves agents — via governed promotion, never a Reasoning-owned mutation.
- **Reasoning-cache sophistication.** Semantic caching and partial-result reuse extend behind version-invalidated cache.
- **Deterministic cores.** More reasoning can be made deterministic (rules over Knowledge) for reproducibility where stakes demand it.

The invariant enabling all of the above: **stateless; consumes truth/experience/context; produces cited, uncertainty-bearing conclusions; owns/edits/commits nothing; human overrides.** New demands plug into strategies/models/verification without touching the statelessness, commit-boundary, or honesty guards.

---

## 15. Architectural Principles

The permanent design principles governing Reasoning. If a future request conflicts with one of these, the request is wrong, not the principle.

1. **Reasoning is stateless and owns nothing.** It stores nothing durable; transient state is Working Memory's; durable content is Memory/Knowledge/the chain's.
2. **Reasoning consumes; it never edits.** It reads Knowledge, Memory, Working Memory, Mission, Goals, Plans, Policies — and mutates none of them.
3. **Conclusions are recommendations, never decisions.** Reasoning concludes; the governed cognitive chain and humans commit. Reasoning has no commit path.
4. **Every conclusion is fully provenanced.** Supporting and conflicting evidence, assumptions, uncertainty, confidence, citations, and a reasoning trace — always.
5. **Honesty over confidence.** Hallucinations are surfaced, missing info reported, unknown and insufficient-evidence are first-class; confidence is calibrated to evidence.
6. **The hierarchy is applied, never overridden.** Knowledge overrides Memory; Policy constrains; Mission guides; Identity/Permissions bound; human review overrides all.
7. **Bounded cognition.** Time, token, recursion, and cost budgets keep thinking finite and affordable; guards prevent runaway reasoning.
8. **Fully auditable and explainable.** Every session's trace + inputs are retained and replayable; "why X" is always reconstructable.
9. **Provider-independent and multi-model.** No bound SDK; model calls are Commands via Execution; reasoning survives provider changes.
10. **Lifecycle and health are separate axes.** Lifecycle is the bounded thinking process; health is observed cognition quality (`healthy`/`degraded`/`stalled`), active-only, automatic, and never changes lifecycle.

---

## 16. What Reasoning will NEVER do

Explicit boundaries to prevent responsibility creep. If a future request asks Reasoning to do any of these, the answer is: it belongs to Memory, Knowledge, the cognitive chain, or Execution.

- **Never store anything durable or own any state.** It is stateless; transient state is Working Memory's.
- **Never edit Knowledge, Memory, Mission, Goals, Plans, or Policies.** It consumes them; it changes none.
- **Never commit a decision.** Conclusions are recommendations; committing is the governed chain's/humans'.
- **Never hide uncertainty or hallucination.** Unknown and insufficient-evidence are valid; unsupported claims are flagged, never asserted as fact.
- **Never omit evidence, assumptions, uncertainty, confidence, citations, or the trace from a conclusion.**
- **Never override Knowledge with Memory, or the authority hierarchy.** Knowledge overrides Memory; Policy/Mission/Identity/Permissions bind; human review overrides Reasoning.
- **Never exceed the acting Agent's authority, permissions, or tenant scope.**
- **Never call a provider directly or perform an effect.** Model calls are Commands via Execution; effects are Execution's.
- **Never run unbounded or recurse infinitely.** Time/token/recursion/cost bounds and guards are mandatory.
- **Never be the source of truth, self-resolve an escalation, or emit an unaudited reasoning step.**

---

## Implementation Assumptions

- **New enums (specification-level, not yet migrated):** `reasoningLifecycleStatusEnum` (`created | hydrated | reasoning | deliberating | verifying | concluded | escalated | failed | disposed | archived`), `reasoningHealthEnum` (`unknown | healthy | degraded | stalled`), `reasoningStrategyEnum` (`deliberative | deterministic | non-deterministic | multi-model | parallel | reflective | simulation | counterfactual`). Joins the accumulated unimplemented enum backlog from specs 35–45.
- **Existing `reasoning` schema:** the repo already has a `reasoning` schema; this spec assumes Reasoning extends/realizes it as **transient/audit session records** (not a durable content store), consistent with statelessness — reconciled at implementation.
- **Statelessness in a persisted world:** the session row and trace are retained for **audit/replay**, not as a store of record for content; the reasoned-over content lives in Working Memory (disposable) and the durable stores (read-only). Implementation must not let the reasoning trace become a shadow durable store of truth/experience.
- **Reasoning runs via Commands:** model calls are `targetType=llm` Commands performed by Execution under the Agent's ceiling; Reasoning binds no provider SDK.
- **Conclusion output paths:** a conclusion becomes durable only elsewhere — promoted to Memory (governed), ratified into Knowledge (governed), or committed as a Decision (governed). Implementation must route these so Reasoning itself writes nothing durable.
- **No code, SQL, migrations, or schema changes produced** — architecture specification only, per instruction.

## Open Questions for 47 - Learning Specification v1.0

- **Learning's inputs & the Reasoning boundary.** Learning improves agents from outcomes; Reasoning produces conclusions. Define what Learning consumes: reasoning traces, conclusion-vs-outcome feedback, memory, execution results — and confirm Learning (like Reasoning) never edits Knowledge/Mission/Policy directly, only proposes governed promotions.
- **What Learning owns vs where improvements land.** Agent §5.6 says learning refines skill/procedural memory and never expands authority. Define exactly where a learned improvement is written: procedural Long-term Memory (governed promotion), the Agent's skill profile (governed reconfiguration), or a Learning-owned model — and confirm none of it raises the ceiling.
- **Confidence calibration loop.** Reasoning emits confidence; outcomes reveal correctness. Define how Learning closes the calibration loop (Reasoning KPI "confidence calibration") without letting Learning mutate Reasoning at runtime.
- **Learning statefulness.** Is Learning a stateless process (like Reasoning) that proposes governed changes, or does it own a durable model/artifact? Clarify ownership vs the "agents are versioned, governed-reconfigured" model (Agent §5.8).
- **Human-in-the-loop for learning.** Given "human review overrides Reasoning" and "learning never expands authority," define the governance gate for accepting learned changes (who ratifies a skill/procedure update).
- **Feedback provenance & anti-drift.** Learning from outcomes risks reinforcing bias/hallucination. Define provenance/quality gates so Learning doesn't promote a well-remembered mistake into procedure or (worse) toward Knowledge.
- **Accumulated enum + migration backlog** across specs 35–46 remains unimplemented; Learning will add more. An implementation/migration consolidation stage is overdue — flag explicitly for planning before the backlog compounds further.
