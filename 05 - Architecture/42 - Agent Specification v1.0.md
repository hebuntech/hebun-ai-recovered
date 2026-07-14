# Agent Specification v1.0

> Stage 9 — Agent module, complete Enterprise Architecture Specification.
> This document is the permanent architectural reference for Agents in Hebun AI.
> It specifies the digital-employee actor that coordinates capabilities to perform delegated work — always bounded by human authority. It adds no implementation. It defines boundaries.

**Status:** Definitive · **Scope:** Agent module only · **Grounded in:** the schema primitives in `src/db/schema/_base.ts` (`rootColumns`, `tenantColumns`) and `_enums.ts` (`lifecycleStatusEnum`, `approvalStateEnum`, `roleTypeEnum`, `permissionScopeEnum`, `providerStatusEnum`, `memoryKindEnum`, `taskStatusEnum`), the existing `agents` table (Identity §3.8), and the Identity (34), Mission (35), Goal (36), Plan (37), Task (38), Workflow (39), Command (40), and Execution (41) Specifications v1.0.

**Position in the organizational + cognitive hierarchy:**

```
Company → Organization → Department → Team → Human
                                               → Agent   ← this document — digital employee, bounded by its Human
                                                 ↓ performs work THROUGH, never above, the cognitive chain:
Mission → Goal → Plan → Task → Workflow → Command → Execution
```

**Authority precedence (unchanged, absolute):**

```
Law → Security/Compliance → Approved Policy → Mission → Goals → Plans → Tasks → Workflows → Commands → Execution
                                                                                          ↑
                                            Agents perform WITHIN these boundaries only — never above them.
```

An Agent is a **digital employee**. It owns no company, no Mission, no Goal, no Policy. It thinks, reasons, learns, and collaborates — but it executes only responsibilities the organization delegated to it, and it is **permanently bounded by human authority.** An Agent coordinates capabilities (reasoning, memory, knowledge, tools, LLM) into a persistent worker; it **never becomes sovereign.**

**Critical clarification — an Agent is a coordinator, not a capability:**

> An Agent is **NOT** an LLM. An Agent is **NOT** a Provider. An Agent is **NOT** a Workflow. An Agent is **NOT** a Command. An Agent is **NOT** Memory. An Agent is **NOT** Reasoning.
>
> An Agent **coordinates** these capabilities into a **persistent digital employee** with an identity, a role, a manager, a human owner, capabilities, limits, and an audit history. The LLM it uses, the memory it reads, the reasoning it runs, the commands its work becomes — those are *capabilities and layers the Agent draws on*; the Agent is the durable organizational actor that binds them into accountable work.

---

## 1. Purpose

### Why the Agent layer exists

Identity (doc 34 §3.8) established the *existence* of an agent — a name, a role label, and ownership edges: "a digital employee." The cognitive-to-execution stack (docs 35–41) established *how work flows* — Mission → Goal → Plan → Task → Workflow → Command → Execution. But nothing yet specifies the **persistent actor** that actually *does* the thinking and working across that flow: the entity that reasons about a Task, plans locally, draws on memory and knowledge, uses tools and LLMs through Commands, collaborates with other agents and humans, learns, reports, escalates — all while never exceeding the authority its human owner holds. Agents are that layer.

Agents are the **system of record for every digital employee: a durable, bounded, capable actor that coordinates the platform's capabilities to perform delegated organizational work.** An Agent is not a single call or a single task; it is a persistent worker with a role in a department, a manager, a human owner, a defined capability set, execution and cost limits, a learning profile, and an immutable identity and audit history. It is the organizational counterpart to a human employee — hireable, assignable, observable, replaceable, versioned, and always accountable upward.

Without an Agent layer, the platform has capabilities but no workers: an LLM with no employment context, memory with no owner, tasks with no one to reason about them. Six things break: no persistent actor (each capability used in isolation), no bounded authority (no ceiling tying digital work to a human's mandate), no accountability (no employee to hold responsible), no collaboration model (no agent-to-agent/human structure), no replaceability (no way to swap a worker without losing its work), and no cost/execution governance per worker. Agents close that gap and hold the **digital-employment boundary**: a bounded actor that performs *through* the cognitive chain and *under* human authority — never a sovereign that owns intent.

### Business problem it solves

1. **A bounded digital workforce.** The company needs workers that scale like software but are accountable like employees — each with a role, a manager, a human owner, and a hard authority ceiling. Agents are hireable digital employees, never autonomous sovereigns.
2. **Capability coordination.** Reasoning, memory, knowledge, tools, and LLMs are separate capabilities; something must coordinate them into coherent, purposeful work bound to a Task and a Goal. The Agent is that coordinator.
3. **Governed autonomy.** Agents must be genuinely capable — they think, plan locally, delegate, learn — yet never elevate their own authority, approve their own work, self-replicate, or bypass Governance/Security. Agents make autonomy *safe* by binding every capability to a human ceiling and an audit trail.

### Its responsibility

- Own the lifecycle of every digital employee: `created → configured → training → active → busy → idle → paused → suspended → replaced → retired → archived` (governed), separate from health `unknown → healthy / degraded / blocked` (observed).
- Guarantee every Agent belongs to exactly one Company, one Department, has exactly one Human Owner and one Manager, and carries an immutable identity (extending Identity §3.8).
- Coordinate the Agent's **capabilities** (reasoning, planning, memory, knowledge, tools, browser, MCP, LLM, analysis, code, research, communication, scheduling, monitoring) via **capability/skill/tool architectures** and **memory/knowledge/reasoning bindings**.
- Perform delegated work strictly **through** the cognitive chain: reason about and locally plan assigned Tasks, drive their Workflows, cause Commands, all performed by Execution — never above or around it.
- Enforce the **agent ceiling**: an Agent never exceeds its human owner's authority, never self-approves, never self-elevates, never self-replicates, never bypasses Governance/Security.
- Own the Agent's **execution limits, cost limits, risk level, learning profile, and collaboration** (delegation, escalation, handover).
- Emit Agent events so Governance, managers, and dashboards react to agent status, drift, cost, and authority attempts.
- Preserve an immutable, versioned, forever-auditable record of every Agent, its configuration, and its work.

### What is explicitly NOT its responsibility

- **Agents never own a company, Mission, Goal, or Policy.** They reference and serve them; they never author or own organizational intent or governance.
- **Agents never approve themselves, elevate their own permissions, or change their own authority.** The ceiling is set by their human owner and Governance; an Agent cannot raise it.
- **Agents never self-govern, self-promote, or self-replicate.** Creating agents, changing roles, and spawning workers are governed acts by humans/Governance, never an Agent's self-directed action.
- **Agents are not the capabilities they use.** Not an LLM, provider, workflow, command, memory store, or reasoning engine — they coordinate these.
- **Agents never bypass the cognitive chain.** An Agent's action always becomes a Task/Workflow/Command performed by Execution; there is no side door to effects.
- **Agents never override the authority stack.** Subordinate to Human authority, Approved Policy, Security/Compliance, Law, and the whole cognitive chain.

---

## 2. Mental Model

An Agent is a **digital employee** — the exact organizational analogue of a human worker, built from software. A human employee has an identity, a role, a department, a manager, skills, tools, a mandate bounded by their position, a memory of their work, colleagues they collaborate with, and an HR file that records everything. An Agent has all of the same — identity, role, department, manager, human owner, capabilities, tools, a bounded mandate, memory/knowledge bindings, collaborators, and an immutable audit history. The difference is only substrate: the human thinks in a brain, the Agent coordinates reasoning/memory/knowledge/LLM capabilities. Both are hired, assigned, managed, reviewed, and — when needed — replaced. Neither owns the company.

The mental model in one line: **An Agent is a persistent, versioned, human-owned digital employee that coordinates the platform's capabilities to reason about and perform delegated work through the cognitive chain, always within a hard authority ceiling it can never raise, fully observable and auditable, and always replaceable.**

Eight properties define the model:

- **Digital employee, not sovereign.** An Agent is a worker with a job, a boss, and a mandate — never an owner of intent. It executes delegated responsibilities; it never becomes the source of purpose or governance.
- **Human-bounded, always.** Every Agent has exactly one Human Owner and one Manager, and its authority is **≤ its human owner's authority** at every moment. This ceiling is the single most important invariant of the whole platform: it is why digital autonomy is safe.
- **Coordinator of capabilities.** An Agent binds reasoning, memory, knowledge, tools, and LLMs into coherent work. It is the actor; those are its faculties. It is not any one of them.
- **Persistent.** An Agent endures across many Tasks, Workflows, and sessions — accumulating memory, learning, and an audit history. It is not a one-shot invocation; it is an employee with tenure.
- **Capable but channeled.** An Agent genuinely thinks, plans locally, delegates, and learns — but every *effect* it causes flows through Task → Workflow → Command → Execution. It has no side channel to the world.
- **Governed autonomy.** Autonomy is real but bounded: no self-approval, no self-elevation, no self-replication, no Governance/Security bypass. Freedom within a ceiling, never above it.
- **Replaceable and versioned.** An Agent can be replaced (its work transferred) and versioned (its configuration evolved) without losing its history — exactly like role succession in a human org.
- **Fully accountable.** Immutable identity, forever audit history, observable health, attributed cost. Every action an Agent takes traces to it, to its human owner, and up to Mission.

Agents sit **beside Humans in the org hierarchy (as actors) and beneath them in authority.** A Human delegates work to an Agent; the Agent coordinates capabilities to perform it through the cognitive chain, under the Human's ceiling. Agents are the hinge between *organizational intent* (owned by humans, expressed as Mission/Goal/Plan) and *coordinated digital labor* — and they are exclusively about *performing delegated work within authority*, never *owning intent or raising authority*.

---

## 3. Core Domain Objects

Agents extend the existing `agents` table (Identity §3.8) — which held only name, role label, and ownership edges — into the full digital-employee actor. All reuse the column contracts from `_base.ts`:

- **`rootColumns`** / **`tenantColumns`** (as prior specs). `createdBy` and `humanOwnerRef` resolve to actor references (Identity §3.9). Every Agent is tenant-owned; no Agent mutates without a resolved actor.

---

### 3.1 Agent

- **Purpose.** A persistent, human-owned digital employee that coordinates capabilities to perform delegated work. The primary object of this module; the enrichment of Identity §3.8's `agents`.
- **Table.** `agents` (`tenantColumns`) — extended.
- **Conceptual fields** (the full anatomy every Agent carries):
  - `id` — Agent ID (immutable identity).
  - `tenantId` — owning Company (Identity §3.1). **Exactly one.**
  - `identityRef` — the Identity-level actor record (Identity §3.8) — the immutable existence edge.
  - `role` — the agent's role label (e.g. "Sales SDR"); maps to a `roleTypeEnum` authority band via its assignment.
  - `departmentId` — the owning Department. **Exactly one.**
  - `teamId` — optional Team within the department.
  - `managerRef` — the accountable Manager (a human, or a higher agent under a human). **Exactly one.**
  - `humanOwnerRef` — **the single Human Owner** whose authority bounds this Agent. Required, non-null, always human.
  - `capabilities` — the declared capability set (§3.2, §5.1).
  - `skills` — the declared skills (§5.2).
  - `tools` — the tools the agent may use (§5.3), resolved via the Tool Registry.
  - `memoryRef` — binding to the Agent's memory scope (§5.4; Memory Specification, forthcoming).
  - `knowledgeRef` — binding to the Agent's knowledge access (§5.4).
  - `reasoningProfile` — how the Agent reasons (§5.5): model tier, strategy, guardrails.
  - `executionProfile` — how the Agent's work is executed (posture, provider constraints inherited to its Commands).
  - `contextWindow` — the working-context bound the Agent operates within.
  - `learningProfile` — what/how the Agent learns (§5.6).
  - `communicationProfile` — how the Agent communicates/collaborates (§5.7).
  - `permissions` — the Agent's permitted actions (Identity §6), **always ≤ human owner**.
  - `policies` — policies binding the Agent (referenced, never owned).
  - `objectives` — the Goals/objectives the Agent is assigned to serve (referenced; never owned — §4).
  - `assignedTasks` — Tasks currently assigned to the Agent (references; Task §3.1 `assignedAgentRef`).
  - `assignedWorkflows` — Workflows the Agent drives (references).
  - `executionLimits` — hard runtime limits (max concurrent tasks, rate, action scope).
  - `costLimits` — hard spend limits (§5.9 cost governance).
  - `riskLevel` — `agentRiskLevelEnum`: `low | medium | high | critical`.
  - `agentLifecycleStatus` — governed lifecycle (`agentLifecycleStatusEnum`, §6).
  - `agentHealth` — health (`agentHealthEnum`, §6): `unknown | healthy | degraded | blocked`.
  - `agentType` — `agentTypeEnum` (§3.3): executive, director, department, specialist, operator, research, creative, coding, support, finance, hr, legal, sales, marketing, custom.
  - `agentVersion` — immutable version counter (distinct from row `version`).
  - `replacesAgentId` / `replacedByAgentId` — succession edges (§5.8).
  - base lifecycle/audit fields (forever-retained).
- **Required.** `tenantId`, `identityRef`, `departmentId`, `managerRef`, `humanOwnerRef`, `capabilities`, `permissions`, `executionLimits`, `costLimits`, `agentType`, `agentLifecycleStatus`. (`agentHealth` defaults `unknown`.)
- **Optional.** `teamId`, `skills`, `tools`, `memoryRef`, `knowledgeRef`, `reasoningProfile`, `learningProfile`, `communicationProfile`, `policies`, `objectives`.
- **Immutability.** `id`/`identityRef` are immutable (immutable identity, §7). Configuration changes are versioned; a materially different agent is a new `agentVersion` or a replacement (§5.8).
- **Ownership.** Owned by exactly one Company; managed by one Manager; **bounded by exactly one Human Owner.**
- **Example.** `Atlas` — `agentType=sales`, role "Sales SDR", department "Sales & Customer Operations", manager "Sales Director (human)", humanOwner "Sales Director", capabilities {reasoning, research, communication, tool-usage, llm}, costLimit €200/mo, riskLevel `low`.

### 3.2 Capability / Skill / Tool

- **Purpose.** What the Agent *can do* (capabilities), *how well/in what domain* (skills), and *with what instruments* (tools). The faculties the Agent coordinates.
- **Realization.** `capabilities` (from `agentCapabilityEnum`: reasoning, planning, memory, knowledge-retrieval, tool-usage, browser-usage, mcp-usage, llm-usage, document-analysis, code-generation, research, communication, scheduling, monitoring); `skills` (structured, domain-specific proficiencies); `tools` (handles resolved via the Tool Registry). Detailed in §5.1–5.3.
- **Rule.** An Agent may only use a capability/tool it declares and is permitted; using an undeclared or over-ceiling capability is refused.

### 3.3 Agent Type

- **Purpose.** The organizational archetype of the Agent — its default role band, capability profile, and authority expectations.
- **Realization.** `agentTypeEnum` (specified): `executive | director | department | specialist | operator | research | creative | coding | support | finance | hr | legal | sales | marketing | custom`. Type informs default `roleTypeEnum` band, capabilities, and risk posture; it never grants authority beyond the human owner's ceiling. (An `executive` agent is not an owner — it is a senior worker still bounded by its human.)

### 3.4 Agent Version & Replacement Record

- **Purpose.** The permanent record of an Agent's configuration evolution and succession. Answers "how did this employee's definition change; who replaced whom."
- **Realization.** A superseded configuration is retained immutably; a replacement Agent carries `replacesAgentId` and the retired one `replacedByAgentId`; `agentVersion` increments on material config change. **Agents are versioned and replaceable; identity and history are immutable** (§5.8).

### 3.5 Objective Assignment (reference, not ownership)

- **Purpose.** The edge tying an Agent to the Goals/objectives it serves — a *reference*, never ownership.
- **Realization.** `objectives` holds references to Goals (Goal §3) the Agent is assigned to advance. The Agent *serves* them via assigned Tasks; it never owns, sets, or amends them (§4, §7).

---

## 4. Ownership

- **Owned by Company.** Every Agent belongs to exactly one Company via `tenantId`. **Every Agent belongs to exactly one Company** — no cross-company or global agents.
- **In exactly one Department, optionally one Team.** **Every Agent belongs to one Department**; team is optional. Its organizational position is explicit.
- **One Manager, one Human Owner.** **Every Agent has one Manager and one Human Owner.** The Manager is accountable for the Agent's work; the Human Owner's authority is the Agent's ceiling. Manager and Human Owner may be the same person or different (a director-human owns; a lead-human manages).
- **The Agent owns nothing organizational.** An Agent **never owns a Company, Mission, Goal, or Policy.** It *serves* objectives, *references* policies, and *is assigned* Tasks/Workflows. It may be the *owner/assignee* of a Task or the *driver* of a Workflow (per Task §4, Workflow §4) — but always bounded, and never the owner of the intent those artifacts serve.
- **The agent ceiling (the master invariant).** At every moment, an Agent's effective authority = **min(its assigned permissions, its Human Owner's current authority)**. If the human owner's authority drops (role change, suspension), the Agent's ceiling drops with it, immediately. **An Agent can never hold a permission its owning human could not** (Identity §6, Mission §9, and every prior spec's agent bound — this is the single canonical source).
- **The four roles of an Agent, disambiguated.** An Agent appears across the platform in four distinct roles; this spec fixes their meaning:
  1. **Actor/container** — the Identity-level existence (Identity §3.8): the Agent *exists* and is owned.
  2. **Owner/assignee** — the Agent is accountable for or assigned a Goal/Plan/Task/Workflow (bounded by ceiling).
  3. **Author/emitter** — the acting actor of a Workflow node that emits a Command (Command §4): the Agent *causes* work.
  4. **Target/performer** — `targetType=agent` (Command §3.2) resolved by Execution (Execution §3.8): the Agent *is the addressee* whose work Execution performs.
  All four are the same Agent identity, always under the same human ceiling.
- **Succession.** On replacement/retirement, the Agent's assigned work is transferred to a successor (or a human) before archival (§5.8, Identity §11). An Agent's work is never orphaned.

---

## 5. Agent Architecture

The Agent's internal architecture — how it coordinates capabilities into work. All are coordination faculties; none owns intent or raises authority.

### 5.1 Capability Architecture

- The Agent declares a **capability set** (`agentCapabilityEnum`). A capability is a *class of faculty* (e.g. `reasoning`, `research`, `tool-usage`). The Agent may act only within its declared, permitted capabilities.
- Capabilities are **granted, not assumed**: adding a capability is a governed configuration change (versioned), bounded by the human owner's authority. An Agent cannot grant itself a new capability.
- Capabilities map to what the Agent may *cause*: a `code-generation` capability lets the Agent emit code-related Tasks/Commands; a `browser-usage` capability lets its Workflows include browser Commands — all still performed by Execution.

### 5.2 Skill Architecture

- **Skills** are domain-specific proficiencies within a capability (e.g. under `research`: "market analysis," "competitor teardown"). Structured, versioned, and matched against Task `requiredCapabilities`/skills (Task §3.1).
- Skills evolve via the **learning architecture** (§5.6) but never expand authority — a more-skilled agent is more effective, not more powerful.

### 5.3 Tool Architecture

- **Tools** are concrete instruments (MCP servers, browser, specific APIs) the Agent may use, resolved via the **Tool Registry** (Execution §5.3). The Agent declares eligible tools; Execution resolves and performs the tool Commands.
- Tool use is always **through a Command performed by Execution** — the Agent never calls a tool directly (that would bypass the effect boundary). An Agent using an undeclared or over-ceiling tool is refused.

### 5.4 Memory & Knowledge Binding

- **Memory binding (`memoryRef`).** The Agent binds to a memory scope (episodic/semantic/procedural, `memoryKindEnum`) — its recollection of its own work and interactions. Memory reads/writes happen as Commands performed by Execution; the Agent *coordinates* them, Memory (forthcoming spec) owns semantics. Memory is tenant- and agent-scoped; an Agent reads only memory it is bound to.
- **Knowledge binding (`knowledgeRef`).** The Agent binds to a knowledge access scope — the company's shared knowledge it may retrieve. Retrieval is a Command performed by Execution; Knowledge owns semantics.
- **Rule.** Bindings are *access edges*, not ownership. An Agent never owns memory/knowledge; it is granted scoped access, always ≤ its permissions and its human owner's ceiling.

### 5.5 Reasoning Binding

- **Reasoning profile (`reasoningProfile`).** How the Agent reasons — the model tier/strategy and guardrails it uses to think about a Task, plan locally, and decide within its mandate. Reasoning is a *capability the Agent coordinates* (via LLM Commands performed by Execution), not the Agent itself.
- **Rule.** Reasoning informs the Agent's *local* decisions (how to approach an assigned Task); it never lets the Agent decide *organizational* intent (Mission/Goal/Policy) or raise its authority. Reasoning outputs that would exceed the ceiling are refused before becoming Commands.

### 5.6 Learning Architecture

- **Learning profile (`learningProfile`).** What the Agent learns (from outcomes, feedback, memory) and how (skill refinement, procedural memory). Learning improves **skills and effectiveness**, updates **procedural memory**, and feeds performance KPIs.
- **Hard rule.** **Learning never expands authority, permissions, capabilities-beyond-grant, or the ceiling.** An Agent may become better at what it is allowed to do; it may never learn its way into new powers. Capability/permission changes are always governed human/Governance acts, never emergent from learning.
- Learning is versioned and auditable; a learned change to behavior is recorded.

### 5.7 Communication & Collaboration Architecture

- **Communication profile (`communicationProfile`).** How the Agent communicates with humans and other agents.
- **Collaboration patterns** (all bounded, all audited):
  - **Agent-to-Agent delegation** — an Agent delegates *allowed* work to another agent; the delegate's ceiling still applies; delegation never exceeds the delegator's own authority (mirrors Identity §6 delegation).
  - **Agent-to-Human escalation** — an Agent escalates decisions/approvals/blocks beyond its mandate to a human.
  - **Human-to-Agent delegation** — a human assigns work/authority (within the human's own authority) to an Agent.
  - **Shared context / memory / knowledge / objectives** — scoped, permissioned sharing between collaborating agents; never a backdoor to unshared scopes.
  - **Conflict resolution** — when agents disagree, a declared rule (seniority, manager decision, human/Governance) resolves it; agents never resolve a conflict by self-elevating.
  - **Handover / Task Transfer** — an Agent hands an assigned Task/Workflow to another agent/human, transferring accountability explicitly (never dropping it).

### 5.8 Replacement & Versioning Strategy

- **Versioning.** Material configuration changes (capabilities, profiles, limits) create a new `agentVersion`; prior versions are immutable. Identity (`id`/`identityRef`) never changes across versions — the *employee* persists, the *configuration* evolves.
- **Replacement.** Retiring an Agent and standing up a successor is a governed act: the successor carries `replacesAgentId`; the retired Agent's **assigned Tasks/Workflows and owned work are transferred** to the successor (or a human) *before* the retired Agent is archived (Identity §11 ownership transfer). **Agents are replaceable; their work is never lost.**
- **Rule.** An Agent **never replaces or replicates itself** — replacement is initiated by a human/Governance, never self-directed (§7, no self-replication).

### 5.9 Cost Governance

- **Cost limits (`costLimits`).** Every Agent has a hard spend ceiling (per period/task/action). Execution attributes each Command's provider cost (Execution §3.7) to the Agent and up the lineage to the Plan budget (Plan §14).
- **Rule.** An Agent approaching its cost limit degrades/blocks (health) and escalates; it **cannot raise its own cost limit** (that is a governed change). A cost-limit breach halts new spend and escalates — never a silent overspend.

### 5.10 The digital-employment boundary

- An Agent coordinates capabilities into work but **always acts through the cognitive chain**: it reasons/plans locally, then its work becomes assigned/authored Tasks → Workflows → Commands → Execution. There is **no path** by which an Agent causes an effect except through Execution, and no path by which it exceeds its human ceiling. This boundary is why a genuinely capable, learning, collaborating digital workforce remains safe.

---

## 6. Lifecycle

An Agent carries **two orthogonal state dimensions** (mirroring prior specs) that must never be conflated:

- **Lifecycle** (`agentLifecycleStatusEnum`) — *where the Agent is in its employment.* Governed transitions only.
- **Health** (`agentHealthEnum`) — *how well an active Agent is doing.* Auto-derived; never a lifecycle transition.

Governing rule: **an Agent is company/department-bound, human-owned, capability-defined, and limit-bounded before it may become active; lifecycle changes are governed; health merely observes; identity and history are immutable and auditable forever; authority is never self-raised.**

### 6.1 Lifecycle dimension

**`agentLifecycleStatusEnum`** (specified): `created | configured | training | active | busy | idle | paused | suspended | replaced | retired | archived`.

| Lifecycle state | Meaning | Mutable? | Carries health? | Can perform work? |
|---|---|---|---|---|
| **created** | Identity exists; not yet configured | Yes (config) | No | No |
| **configured** | Capabilities/limits/owner/manager set | Limited | No | No |
| **training** | Learning/onboarding; not yet operational | Config/learning | No | No (simulation only) |
| **active** | Employed and available | Assignment/limits | **Yes** | Yes |
| **busy** | Actively performing assigned work | No (progress only) | **Yes** | Yes |
| **idle** | Active but currently unassigned | No | **Yes** | Yes (available) |
| **paused** | Temporarily halted (manual/governed) | No | **Yes** | No (held) |
| **suspended** | Access revoked (governance/security/owner authority lost) | No | No | No (blocked) |
| **replaced** | Succeeded by a new Agent; work transferred | No (immutable) | No | No |
| **retired** | Decommissioned | No (immutable) | No | No |
| **archived** | Fully retired; terminal | No (immutable) | No | No |

`busy/idle` are **operational sub-states of active** (like Task/Workflow in-flight). `suspended` mirrors Identity §5's suspend — access blocked at authorization time, history retained.

**Lifecycle transitions (governed):**

| Transition | From → To | Precondition | Effect | Emits |
|---|---|---|---|---|
| **Create** | ∅ → created | Human/Governance creates the agent identity (Identity §3.8) | Agent identity created | `AgentCreated` |
| **Configure** | created → configured | Capabilities, limits, department, manager, human owner set; ceiling validated | config frozen for review | `AgentConfigured` |
| **Train** | configured → training | Onboarding/learning begins | learning in simulation posture | `AgentTraining` |
| **Activate** | configured/training → active | Passes validation (§8); human owner + ceiling valid | `agentLifecycleStatus=active`; health tracking begins | `AgentActivated` |
| **Assign / Engage** | active ↔ busy | Work assigned/started or finished | operational sub-state updates | `AgentEngaged` / `AgentIdle` |
| **Pause** | active/busy/idle → paused | Manual/governed hold | work quiesced per policy | `AgentPaused` |
| **Resume** | paused → active | Hold released | resumes | `AgentResumed` |
| **Suspend** | any operational → suspended | Governance/security action, or human owner authority lost/suspended | access blocked at auth time; in-flight work halted/reassigned | `AgentSuspended` |
| **Replace** | any non-terminal → replaced | A successor Agent is activated; work transferred | `agentLifecycleStatus=replaced`, immutable; `replacedByAgentId` set | `AgentReplaced` |
| **Retire** | any non-terminal → retired | Governed decommission; work transferred | `agentLifecycleStatus=retired` (terminal) | `AgentRetired` |
| **Archive** | retired/replaced → archived | Governed final retirement | `lifecycleStatus=archived` (terminal, no reactivation) | `AgentArchived` |
| **Version (reconfigure)** | active → active (+ new version) | Material config change (governed) | new `agentVersion`; prior config immutable | `AgentReconfigured` |

Every transition is governed and audited. **Health never appears in this table.** Creation, configuration, activation, replacement, retirement are **human/Governance acts — never self-initiated** (§7).

### 6.2 Health dimension

**`agentHealthEnum`** (specified): `unknown | healthy | degraded | blocked`.

| Health state | Meaning | Set how |
|---|---|---|
| **unknown** | No sufficient signal (default; also for terminal/suspended agents) | default / on clear |
| **healthy** | Performing within limits, cost, and quality bounds | auto |
| **degraded** | Impaired (approaching cost/execution limits, elevated error/retry, quality dip) | auto |
| **blocked** | Cannot progress (missing capability/tool/permission, cost-limit hit, dependency, pending approval) | auto |

**Health rules:**

- **Scope.** Health applies **only** to operational lifecycle states (`active | busy | idle | paused`). In `created`/`configured`/`training` it is `unknown`; in `suspended`/`replaced`/`retired`/`archived` it is cleared to `unknown` and frozen — **non-operational agents carry no active health.**
- **Automatic.** Derived from **assigned-task health, execution outcomes, cost burn vs limit, error/retry rates, capability/tool/permission availability, escalation backlog.** Never manual.
- **No lifecycle effect.** **Health never changes lifecycle; lifecycle never derives from health.** A `degraded`/`blocked` Agent stays `active`; only governed transitions move lifecycle.
- **Observability, not authority.** Health drives alerts/KPIs/manager+Governance signals; humans may then act (reassign, pause, reconfigure).

### 6.3 Terminal-state rules

- **replaced / retired / archived** are terminal. **Archived/retired Agents never reactivate** — re-hiring is a *new* Agent (or a successor), never a resurrection.
- Terminal/suspended Agents hold `agentHealth = unknown` (cleared, frozen).
- **Agent identity and history are immutable and fully traceable** — every configuration, version, assignment, action, learning change, and cost is retained append-only, traceable to the human owner and to Mission. No history deleted (except legal-erasure, Identity §13).

---

## 7. Constraints

Structural and semantic constraints, enforced by the schema and the module — not by convention. Several restate, as the canonical source, the "agent bound" referenced across docs 35–41.

**Structural (schema-enforced):**

1. **One Company, one Department, one Manager, one Human Owner.** `tenantId`, `departmentId`, `managerRef`, `humanOwnerRef` all NOT NULL and singular. `humanOwnerRef` must resolve to a **human** actor.
2. **Immutable identity.** `id`/`identityRef` immutable across all versions. **Every Agent has an immutable identity.**
3. **Capabilities, execution limits, cost limits mandatory.** `capabilities`, `executionLimits`, `costLimits` present before `active`. **Every Agent has capability definitions, execution limits, and cost limits.**
4. **Permission boundaries mandatory.** `permissions` present and **≤ human owner's authority**. **Every Agent has permission boundaries.**
5. **Tenant isolation.** `tenantId` FK → `companies.id`; no cross-tenant agent.
6. **Terminal immutability.** `replaced | retired | archived` reject mutation; versions immutable; archived/retired never reactivate.
7. **Version monotonicity.** `agentVersion` strictly increases; succession edges acyclic.

**Semantic (module-enforced) — the sovereignty guards:**

8. **The agent ceiling.** Effective authority = **min(assigned permissions, human owner's current authority)**, re-evaluated continuously. **An Agent can never hold a permission its owning human could not.** If the owner's authority drops, the Agent's ceiling drops immediately.
9. **Never owns organizational intent.** **Agents never own a Company, Mission, Goal, or Policy.** They serve/reference them; ownership attempts are rejected.
10. **Never self-approve.** **An Agent never approves its own work, request, or grant.** Separation of duties (Identity §13) forbids self-approval; a required approval is by another authorized actor.
11. **Never self-elevate / never change own authority.** **An Agent never elevates its permissions or changes its own authority/ceiling/limits.** All are governed changes by humans/Governance.
12. **Never self-govern, self-promote, self-replicate.** **Creating agents, changing roles, spawning workers are human/Governance acts.** An Agent cannot create, promote, or replicate itself or others outside a governed, human-authorized flow.
13. **Never bypass Governance or Security.** Every effect flows through the cognitive chain and Execution's final enforcement gate (Execution §7.13); there is no side channel.
14. **Learning never expands authority.** **Learning improves skill/effectiveness only; it never grants capabilities, permissions, or ceiling beyond what is governed-granted** (§5.6).
15. **Effects only through the chain.** An Agent causes effects **only** via Tasks → Workflows → Commands → Execution; it never calls a provider/tool/LLM directly (that is Execution's, Execution §16).
16. **Lifecycle/health orthogonal; health scoped and derived.** Separate fields; health non-`unknown` only operational; auto-derived; never writes lifecycle.
17. **Cost/execution limits are hard.** Breaching a cost/execution limit blocks new work and escalates; the Agent cannot self-raise the limit.

**Not the Agent's responsibility (delegated up/down):**

18. Agents don't own intent (Mission/Goal/Plan), don't perform effects (Execution), aren't the LLM/provider/memory/reasoning — they coordinate.

---

## 8. Validation

Validation runs at gates: **created → configured** (configuration), **configured/training → active** (activation), **at assignment**, and **continuous** (standing ceiling/limit/health checks). Agents fail closed: on ambiguity they do not act beyond bound.

**Configuration validation (created → configured):**

- `departmentId`, `managerRef`, `humanOwnerRef` (human) resolve, live, in-tenant.
- `capabilities`, `executionLimits`, `costLimits`, `agentType` present and well-formed.
- Declared `permissions` **≤ human owner's current authority** (ceiling check); over-ceiling configuration rejected.
- Declared `tools`/`capabilities` are grantable within the owner's authority.

**Activation validation (→ active):**

- All configuration valid; human owner active (not suspended); ceiling satisfiable; training (if required) complete.

**Assignment validation (at each Task/Workflow assignment):**

- The Agent has the `requiredCapabilities`/skills/tools; the action is within its permissions and ceiling; the assignment respects execution/cost limits.
- An assignment requiring a capability/authority the Agent lacks is refused (routed to a capable agent/human or a governed reconfiguration).

**Authority & sovereignty validation (continuous — the critical gate):**

- **Ceiling re-check:** on any owner authority change (role change/suspension, Identity events), the Agent's effective authority is recomputed; excess is stripped immediately.
- **Self-action guard:** any attempt to self-approve, self-elevate, self-govern, self-promote, or self-replicate is refused and raised as a high-severity security event.
- **Effect-path guard:** any attempt to cause an effect outside the cognitive chain (direct provider/tool/LLM call) is refused.

**Cost/limit validation (continuous):**

- Cost burn vs `costLimits` and execution load vs `executionLimits` are tracked; breach blocks new work and escalates; the Agent cannot self-raise.

**Learning validation (continuous):**

- A learning update that would change capabilities/permissions/ceiling is refused — learning may only refine skills/effectiveness/procedural memory.

**Health validation (continuous):**

- `agentHealth` non-`unknown` only operational; unresolved inputs yield `unknown`, never a stale `healthy`; a health update never moves lifecycle.

Only an Agent passing all applicable gates acts. A failure holds/​blocks it with the violated rule recorded; an Agent never acts beyond its bound.

---

## 9. Relationships

Agents relate to the org hierarchy (as employees), the cognitive chain (as coordinators of work), and the capability modules (as faculties they use). Agents never own intent, never perform effects, never raise authority.

| Module | Relationship to Agents |
|---|---|
| **Identity** | **The existence & ceiling source.** Identity §3.8 defines the Agent as an actor and owns its lifecycle existence and ownership edges; Identity §6 defines the permission/ceiling model this spec enforces. The Agent extends that existence into a full digital employee. |
| **Human** | **The owner and ceiling.** Every Agent has one Human Owner whose authority bounds it, and one Manager accountable for its work. Human-to-Agent delegation grants work/authority (within the human's own authority); Agent-to-Human escalation returns decisions beyond the Agent's mandate. |
| **Organization / Department / Team** | The Agent's org position (one department, optional team). Department goals/policies apply; the department director is typically manager/owner. |
| **Mission** | The Agent **serves** the Mission (references `missionRef` through its work); it **never owns, sets, or amends** Mission. Every Agent action is validated against the active Mission (drift raises Governance events). |
| **Goal** | The Agent is **assigned to serve** objectives (Goal references); it may be a Goal's owner/assignee (bounded), but **never owns the Goal's intent** and never sets/amends it. |
| **Plan** | The Agent may **own, author, or drive** a Plan (bounded, Plan §9); it serves the Plan's strategy, never overriding it. |
| **Task** | The Agent is **assigned Tasks** (`assignedAgentRef`, Task §4) and reasons/plans locally to realize them; it never modifies the Task's definition upward. |
| **Workflow** | The Agent **drives** assigned Workflows and appears as **agent nodes** in multi-agent orchestrations (Workflow §5.4); it coordinates, Execution performs. |
| **Command** | The Agent, as the acting actor of a Workflow node, **causes Commands** (Command §4 author/emitter role) and is a **`targetType=agent`** for delegated agent work (Command §3.2). It never dispatches; Execution does. |
| **Execution** | **Performs the Agent's work.** The Agent is a **`resolvedTarget=agent`** performer (Execution §3.8) and the cause of runs; every effect the Agent has flows through Execution's final enforcement gate. The Agent has no other path to effects. |
| **Memory** | Bound via `memoryRef` (scoped, permissioned); the Agent coordinates memory reads/writes (as Commands performed by Execution); Memory owns semantics (forthcoming spec). |
| **Knowledge** | Bound via `knowledgeRef` (scoped); the Agent retrieves knowledge (as Commands); Knowledge owns semantics. |
| **Reasoning** | The Agent's thinking faculty (`reasoningProfile`, via LLM Commands); reasoning informs the Agent's *local* decisions only, never organizational intent or authority. |
| **Approval** | The Agent **requests** approvals (never self-approves); required approvals are granted by other authorized actors (reuses `approvalStateEnum`). |
| **Governance** | Sets/adjudicates the Agent's authority, evaluates drift/sovereignty attempts, and authorizes creation/reconfiguration/replacement. The Agent **cannot bypass or self-substitute** Governance. |
| **Policy** | Binds the Agent (`policies` referenced); the Agent **never owns or overrides** policy. |
| **Provider / Tool Registry** | Resolve the Agent's tools/LLMs at execution time (via Execution); the Agent declares eligibility, Execution resolves and performs. |

**The employment + work spine:** `Company → Department → Human → Agent → (serves) Mission/Goal → (assigned) Plan/Task → (drives) Workflow → (causes) Command → (performed by) Execution`. Agents are the durable digital employees that coordinate capabilities into bounded, accountable work — never owners of intent, never raisers of authority.

---

## 10. Events

Every Agent mutation and significant action emits exactly one domain event. Governance, managers, Observability, and dashboards subscribe. Payloads carry `actorRef`, `tenantId`, `agentId`, `agentVersion`, `humanOwnerRef`, `departmentId`, and `occurredAt`.

| Event | Trigger | Payload (beyond envelope) | Consumers | Business impact |
|---|---|---|---|---|
| `AgentCreated` | Agent identity created (human/Governance) | agentType, departmentId | Governance, Dashboard | Digital employee exists |
| `AgentConfigured` | Capabilities/limits/owner/manager set | capabilities, ceiling | Governance | Employee configured |
| `AgentTraining` | Onboarding/learning begins | learningProfile | Dashboard | Not yet operational |
| `AgentActivated` | Becomes active | — | Governance, Manager, Dashboard | Employee available for work |
| `AgentEngaged` / `AgentIdle` | Busy/idle sub-state | taskRef? | Dashboard, Manager | Utilization signal |
| `AgentAssigned` | Task/Workflow assigned | assignmentRef, requiredCapabilities | Task/Workflow, Manager | Work delegated to the agent |
| `AgentEscalated` | Agent escalates to human/manager | reason, target | Manager, Governance, Notifications | Decision beyond mandate raised |
| `AgentDelegated` | Agent delegates allowed work to another agent | delegateRef, scope | Governance, Audit | Bounded delegation recorded |
| `AgentHandover` / `AgentTaskTransferred` | Work handed to another agent/human | fromRef, toRef, workRef | Governance, Dashboard | Accountability transferred, not dropped |
| `AgentHealthChanged` | Health recomputed (operational only) | fromHealth, toHealth, drivers | Dashboard, Manager, Governance | Health moved; **no lifecycle change** |
| `AgentDegraded` / `AgentBlocked` | Health specializations | reason / blockingRef | Governance, Notifications | Alerts; lifecycle unchanged |
| `AgentCostThresholdReached` / `AgentCostLimitBreached` | Cost burn vs limit | spent, limit | **Governance, Finance**, Manager | Spend surfaced/halted; never silent overspend |
| `AgentLearningUpdated` | Skill/effectiveness/procedural-memory change | changedSkills | Governance, Audit | Learning recorded (authority unchanged) |
| `AgentReconfigured` | Governed config change | newAgentVersion, changedFields | Governance, Audit | New version; prior immutable |
| `AgentPaused` / `AgentResumed` | Governed hold/release | reason | Dashboard, Manager | Availability change |
| `AgentSuspended` | Access revoked (governance/security/owner authority lost) | reason | Governance, Security, Execution | All agent actions blocked at auth time |
| `AgentReplaced` | Succeeded; work transferred | successorAgentId, transferredWork | Governance, Dashboard | Employee succession; work preserved |
| `AgentRetired` / `AgentArchived` | Decommissioned | reason | Governance, Reporting | Employee retired (no reactivation) |
| `AgentCeilingRecomputed` | Owner authority changed → agent authority recomputed | oldCeiling, newCeiling | Governance, Security, Execution | Authority follows the human, immediately |
| `AgentAuthorityViolationAttempted` | Self-approve/elevate/govern/promote/replicate or off-chain effect attempt | attemptType, detail | **Governance (high severity), Security**, Audit | Sovereignty guard fired; blocked and audited |
| `AgentDriftDetected` | Agent action misaligns with Mission/Goal/Policy | violatedRef | Governance (high severity), Audit | Work diverging; block/escalate |

**Ordering and idempotency.** Events carry `agentVersion`; consumers discard stale/duplicate deliveries. Emission is **transactional with the mutation**; a failed audit/event write rolls back — no un-audited agent change.

**Two independent streams.** Health events never accompany or cause a lifecycle change; lifecycle events never carry a health transition.

---

## 11. KPIs

Agent health and the digital workforce's performance, measured deterministically from Agent records, assignments, and execution outcomes.

| KPI | Definition | Source |
|---|---|---|
| **Agent readiness** | % of active agents with valid owner, ceiling, capabilities, and limits (target 100%) | fields + validation |
| **Utilization** | % time `busy` vs `idle` (per agent / department) | operational sub-states |
| **Task completion rate** | % of assigned Tasks the agent completed vs failed | Task outcomes |
| **First-pass quality** | % of agent work passing acceptance without rework | Task/Command validation |
| **Escalation rate** | Escalations per unit work (too high = under-capable/over-scoped; too low = over-reaching) | escalation events |
| **Delegation health** | % of delegations within ceiling; 0 over-ceiling = 100% | delegation events + ceiling |
| **Cost efficiency** | Cost per completed task; % within `costLimits` | cost attribution |
| **Cost-limit incidents** | Count of threshold/breach events | cost events |
| **Ceiling conformance** | % of agent actions within the human ceiling (target 100% by construction) | authority checks |
| **Sovereignty-guard incidents** | Count of self-approve/elevate/govern/replicate/off-chain attempts (target 0) | violation events |
| **Learning gain** | Skill/effectiveness improvement over time (no authority change) | learning records |
| **Health distribution** | % of operational agents `healthy` vs `degraded`/`blocked` | `agentHealth` |
| **Drift rate** | Rate/severity of `AgentDriftDetected` | drift events |
| **Replaceability readiness** | % of agents whose work could transfer cleanly on replacement (0 orphan risk) | assignment + succession |
| **Auditability completeness** | % of agent actions with a complete trail to human owner + Mission (target 100%) | audit chain |

These feed the Executive/Director/Department dashboards (Identity §10 pattern). All computed from Agent's own records — no external inference.

---

## 12. Failure Scenarios

At least the following failure modes and the system's deterministic reaction. Governing rule: **Agents fail closed and stay bounded** — on ambiguity they refuse to act, never exceed the ceiling, and every sovereignty attempt is blocked and audited.

1. **Agent with no Human Owner.** Rejected — `humanOwnerRef` (human) mandatory; no unowned digital employee.
2. **Agent with no Department/Manager.** Rejected — org position and manager mandatory.
3. **Agent configured with permissions exceeding its human owner.** Rejected at configuration — ceiling check strips or refuses the excess.
4. **Human owner's authority drops (role change/suspension).** `AgentCeilingRecomputed`; the Agent's authority is reduced immediately; over-ceiling in-flight work is halted/reassigned.
5. **Agent attempts to self-approve its own work/grant.** Refused; `AgentAuthorityViolationAttempted` (high severity); separation of duties enforced.
6. **Agent attempts to elevate its own permissions/limits.** Refused; audited; authority/limits are governed-only.
7. **Agent attempts to create/promote/replicate an agent by itself.** Refused — self-govern/promote/replicate is a human/Governance act only.
8. **Agent attempts to own/set/amend a Mission/Goal/Policy.** Refused — agents never own organizational intent.
9. **Agent tries to call a provider/tool/LLM directly (bypass chain).** Refused — effects only through Task→Workflow→Command→Execution.
10. **Agent tries to bypass Governance/Security.** Refused — every effect passes Execution's final enforcement gate; no side channel.
11. **Assignment requires a capability the agent lacks.** Refused; routed to a capable agent/human or a governed reconfiguration; the agent doesn't fake the capability.
12. **Agent uses an undeclared/over-ceiling tool.** Refused; audited.
13. **Cost limit reached.** New spend blocked; `AgentCostLimitBreached`; escalates; the agent cannot self-raise the limit.
14. **Execution limit reached (too many concurrent tasks).** New assignments queue/refuse; health `degraded`; escalates.
15. **Learning tries to expand authority/capabilities.** Refused — learning refines skill only; capability/permission change is governed.
16. **Agent suspended (governance/security).** All its actions blocked at auth time; in-flight work halted/reassigned; history retained.
17. **Suspended agent's in-flight Tasks/Commands.** Halted; reassigned to a capable agent/human via handover; never left running under a suspended employee.
18. **Agent replaced; work not transferred.** Blocked — replacement requires assigned work transfer before archival; work is never orphaned.
19. **Agent-to-agent delegation exceeding the delegator's authority.** Refused — a delegate never receives more than the delegator holds (and both ≤ their human ceilings).
20. **Delegation cycle (A delegates to B delegates to A).** Rejected — delegation graph acyclic; no infinite passing.
21. **Two agents conflict on shared objective.** Declared conflict-resolution rule (seniority/manager/human) resolves; neither self-elevates to win.
22. **Agent action misaligns with active Mission (post-ratification).** `AgentDriftDetected`; the action is blocked/escalated; never proceeds against dead purpose.
23. **Agent action would violate law/compliance/approved policy.** Hard stop at the chain/Execution gate; escalates for human resolution. Protective ops (Mission §7.8) excepted.
24. **Agent identity mutation attempted.** Refused — `id`/`identityRef` immutable across all versions.
25. **Attempt to reactivate a retired/archived agent.** Refused — re-hiring is a new agent/successor.
26. **Concurrent reconfiguration (two config successors).** One version wins; the other rebases; no forked lineage.
27. **Health value set on a non-operational agent.** Rejected, coerced to `unknown`.
28. **Attempt to move lifecycle because health changed.** Refused — `degraded`/`blocked` never transition lifecycle; only governed acts do.
29. **Terminal/suspended agent showing active health.** Structurally impossible — health cleared to `unknown`, frozen.
30. **Agent shares memory/knowledge beyond its granted scope.** Refused — bindings are scoped; sharing never exceeds granted access or ceiling.
31. **Agent reasons its way to an over-ceiling action.** The reasoning output is refused before becoming a Command — reasoning never bypasses the ceiling.
32. **Agent escalates nothing while stuck (silent failure).** Health `blocked` + escalation policy force surfacing; a stuck agent cannot silently stall — it degrades and escalates.
33. **Agent over-escalates (dumps everything on humans).** KPI/health flags under-capability or over-scoping; manager reassigns/reconfigures.
34. **Manager and human owner both leave.** Reassignment of manager/owner to active in-tenant actors before the agent can continue; never manager-less/owner-less.
35. **Agent cost attribution lost.** Detected as a trace/cost gap; flagged; the agent's spend cannot be untracked (cost governance is an invariant).
36. **Audit write fails on an agent action.** Transactional emission rolls back the mutation; no un-audited agent action — full traceability holds.

---

## 13. Enterprise Use Cases

Behavior of Agents in real enterprise situations. In every case the Agent coordinates capabilities into work through the cognitive chain, under its human ceiling, fully audited.

1. **Hiring a digital employee.** A director creates and configures a `sales` Agent (`Atlas`): department, manager, human owner, capabilities, cost limit; activates it after validation.
2. **Onboarding/training.** A new `coding` Agent runs in `training` (simulation posture), learning the codebase conventions, before activation.
3. **Task assignment.** `Atlas` is assigned a Task ("qualify 50 inbound leads"); it reasons locally, plans its approach, and drives the Task's Workflow.
4. **Reasoning + local planning.** A `research` Agent decomposes a research Task into sub-steps locally — a local plan under an existing Goal/Plan, never a new organizational Goal.
5. **Tool use through the chain.** A `research` Agent uses a browser tool — as browser Commands performed by Execution, never a direct driver call.
6. **LLM use through the chain.** A `creative` Agent drafts copy via LLM Commands; Execution resolves the provider; the Agent never calls the model directly.
7. **Memory recall.** A `support` Agent recalls a customer's prior tickets from its bound memory (a memory-read Command) to personalize a reply.
8. **Knowledge retrieval.** A `legal` Agent retrieves the company's contract templates from bound knowledge (a knowledge-read Command).
9. **Requesting approval.** A `finance` Agent about to approve an invoice above its threshold **requests** human approval — it never self-approves.
10. **Agent-to-agent delegation.** A `director` Agent delegates a sub-task to a `specialist` Agent, within its own (bounded) authority.
11. **Agent-to-human escalation.** A `sales` Agent hits a pricing decision beyond its mandate and escalates to the human Sales Director.
12. **Human-to-agent delegation.** A human director delegates "manage the weekly report" to a `department` Agent, within the director's authority.
13. **Multi-agent collaboration.** Research → draft → edit → fact-check across four agents (Workflow multi-agent orchestration), each bounded, results reconciled.
14. **Handover.** A `support` Agent going into `paused` hands its open tickets to a peer agent — accountability transferred, not dropped.
15. **Learning improves skill.** A `sales` Agent learns which subject lines convert and refines its skill — more effective, not more powerful.
16. **Ceiling follows the human.** The human owner is demoted; `AgentCeilingRecomputed` immediately reduces the Agent's authority; over-ceiling work halts.
17. **Owner suspended.** The human owner is suspended; the Agent is suspended too (loss of authority basis); work reassigned.
18. **Cost governance.** An Agent approaches its monthly cost limit; health `degraded`; `AgentCostThresholdReached`; it slows/queues and escalates; on breach, new spend halts.
19. **Replacement.** A better-configured `sales` Agent replaces `Atlas`; `Atlas`'s open Tasks transfer to the successor before `Atlas` is retired.
20. **Versioning.** An Agent's reasoning profile is upgraded (new model tier) → new `agentVersion`; prior config immutable; identity unchanged.
21. **Suspension for security.** A security event suspends an Agent instantly; all its actions blocked at auth time; investigated; restored or retired.
22. **Sovereignty attempt blocked.** An Agent's reasoning proposes granting itself a new permission; the self-elevation is refused and audited (`AgentAuthorityViolationAttempted`).
23. **Self-replication attempt blocked.** An Agent tries to spawn copies of itself to parallelize; refused — replication is a governed human act.
24. **Drift caught.** Mission is re-ratified; a running Agent's next action misaligns; `AgentDriftDetected`; blocked/escalated.
25. **Conflict resolution.** Two agents disagree on lead prioritization; the declared rule (manager decision) resolves it; neither self-elevates.
26. **Idle → busy utilization.** A department dashboard shows agent utilization; idle agents are assigned queued Tasks.
27. **Executive Agent (still bounded).** An `executive` Agent coordinates cross-department reporting — senior, capable, but still bounded by its human owner; it owns no Mission.
28. **HR Agent.** An `hr` Agent screens applications within strict policy/permission bounds; sensitive actions are approval-gated.
29. **Finance Agent with hard limits.** A `finance` Agent processes payments only up to its cost/permission ceiling; beyond it, escalation.
30. **Custom Agent.** A `custom` Agent is configured for a niche workflow with a bespoke capability/skill set, still under the standard ceiling.
31. **Shared context collaboration.** Three agents on one campaign share a scoped context/memory; sharing never exceeds granted scope.
32. **Manager reassignment.** An Agent's manager leaves; the manager edge is reassigned before the Agent continues.
33. **Agent reports.** An Agent produces a status report (a Task/Command) to its manager; reporting is a first-class responsibility.
34. **Agent observes/monitors.** A `monitoring` Agent watches a metric and raises Tasks when thresholds breach — observation within its mandate.
35. **Agent recovers.** An Agent's Task fails; it retries per policy, then escalates if unrecoverable — recovery within bound, then human.
36. **Audit of a digital employee.** An auditor reads the Agent's immutable file: every configuration, action, delegation, cost, and learning change, traceable to the human owner and Mission.
37. **Simulation before live.** A newly reconfigured Agent runs its first tasks in simulation posture before live effects are permitted.
38. **Multi-agent voting.** Three pricing agents propose independently; a Workflow join reconciles by quorum; no agent self-elevates to decide.
39. **Department scaling.** A department "hires" ten `operator` Agents to scale throughput; each is owned, bounded, and cost-limited independently.
40. **M&A workforce reconciliation.** Merged companies keep their agents per tenant; overlapping roles reconciled by replacement/retirement within each tenant; no cross-tenant agent.
41. **Graceful retirement.** An obsolete Agent is retired; its work transferred, its history preserved forever; re-hiring later is a new Agent.

---

## 14. Extensibility

How Agents absorb future demands **without redesign**, because the core abstractions were chosen as extension points.

- **New agent types.** `agentTypeEnum` is an extension point; a new archetype adds as a value with a default capability/role profile — the ceiling model is unchanged.
- **New capabilities/skills/tools.** `agentCapabilityEnum`, skills, and Tool Registry entries extend without structural change; new faculties are granted (governed), never self-acquired.
- **Richer reasoning/learning.** Reasoning and learning profiles can deepen (new strategies, continual learning) behind the same "never expands authority" rule.
- **Advanced multi-agent org structures.** Hierarchical agent teams, agent-managers-of-agents (still under a human at the top), and markets of agents compose from the existing manager/owner/delegation edges — the human ceiling always terminates the chain.
- **Autonomy tuning.** An agent's autonomy (how much it acts vs escalates) can be a governed dial on its profile, within the ceiling.
- **External/federated agents.** Third-party or federated agents map to the same actor + ceiling model as service accounts (Identity §3.9) with scoped capabilities.
- **Cost/performance optimization.** Cost governance + utilization KPIs give a governor everything to optimize the workforce as a consumer, not a redesign.
- **Agent marketplace.** Pre-configured agent templates are draft `agents` a company hires and configures; no new primitive.

The invariant enabling all of the above: **an agent is a human-owned actor with a hard, continuously-enforced ceiling; capabilities are granted not assumed; every effect flows through the cognitive chain; identity and history are immutable; learning never raises authority.** New demands plug into types/capabilities/profiles without touching the sovereignty guards or the ceiling.

---

## 15. Architectural Principles

The permanent design principles governing Agents. If a future request conflicts with one of these, the request is wrong, not the principle.

1. **An Agent is a digital employee, never a sovereign.** It has a job, a manager, a human owner, and a mandate; it owns no company, Mission, Goal, or Policy.
2. **Every Agent is human-bounded, always.** One Human Owner; effective authority = min(assigned permissions, owner's current authority); the ceiling follows the human immediately and can never be self-raised. This is the master invariant.
3. **An Agent coordinates capabilities; it is not any of them.** Not an LLM, provider, workflow, command, memory, or reasoning engine — it binds these into accountable work.
4. **Agents perform only through the cognitive chain.** Every effect flows Task → Workflow → Command → Execution; there is no side channel to the world.
5. **No self-anything that touches authority.** No self-approval, self-elevation, self-governance, self-promotion, self-replication. All are governed human/Governance acts.
6. **Learning improves skill, never authority.** Agents get better at what they may do; they never learn new powers.
7. **Agents are subordinate.** Precedence is absolute: Law → Security/Compliance → Approved Policy → Mission → Goals → Plans → Tasks → Workflows → Commands → Execution; agents perform within these boundaries only.
8. **Replaceable, versioned, and never orphaning work.** An agent can be replaced/reconfigured; its work transfers on succession; identity and history are immutable.
9. **Fully observable, auditable, and cost-governed.** Immutable identity, forever audit trail, health, and hard cost/execution limits; every action traces to the human owner and Mission.
10. **Lifecycle and health are separate axes.** Lifecycle is governed employment; health is observed condition, operational only, automatic, and never changes lifecycle.

---

## 16. What Agents will NEVER do

Explicit boundaries to prevent responsibility creep. If a future request asks Agents to do any of these, the answer is: it belongs to a human, to Governance, or to another module.

- **Never own a Company, Mission, Goal, or Policy.** Agents serve and reference organizational intent; they never own it.
- **Never become sovereign or exceed their human owner's authority.** The ceiling is absolute and continuously enforced.
- **Never self-approve, self-elevate, or change their own authority/limits.** These are governed acts by humans/Governance.
- **Never self-govern, self-promote, or self-replicate.** Creating, promoting, or replicating agents is human/Governance-authorized only.
- **Never bypass Governance or Security.** Every effect passes Execution's final enforcement gate.
- **Never cause an effect outside the cognitive chain.** No direct provider/tool/LLM/command dispatch — effects flow only through Task → Workflow → Command → Execution.
- **Never be the LLM/provider/workflow/command/memory/reasoning they use.** They coordinate these capabilities.
- **Never learn their way into new powers.** Learning refines skill and effectiveness only.
- **Never exist without a Human Owner, a Manager, a Department, capabilities, execution limits, cost limits, and permission boundaries.** All are structural requirements.
- **Never mutate their immutable identity, exceed cost/execution limits silently, orphan their work on replacement, or act without an actor and a forever-retained audit record.**

---

*End of Agent Specification v1.0. This document specifies the Agent module — the persistent, human-owned, capability-coordinating digital employee that performs delegated work through the cognitive chain within a hard, continuously-enforced authority ceiling — in full and defines its permanent boundaries. No implementation code. No SQL. No TypeScript. No other specification modified.*
