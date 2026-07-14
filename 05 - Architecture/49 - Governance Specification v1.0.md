# Governance Specification v1.0

> Stage 16 — Governance module, complete Enterprise Architecture Specification.
> This document is the permanent architectural reference for Governance in Hebun AI — the **constitutional layer.**
> Governance is the supreme coordination system that validates, approves, ratifies, promotes, supervises, and audits every significant organizational change. It adds no implementation. It defines boundaries.

**Status:** Definitive · Constitutional Layer · **Scope:** Governance module only · **Grounded in:** the schema primitives in `src/db/schema/_base.ts` (`rootColumns`, `tenantColumns`) and `_enums.ts` (`lifecycleStatusEnum`, `approvalStateEnum`, `roleTypeEnum`, `permissionScopeEnum`, `providerStatusEnum`), the existing `policy`/`approval` schemas, and the Identity (34) through Architecture Consolidation (48) Specifications v1.0.

**Position in the architecture:**

```
                 GOVERNANCE (this document) — the constitutional authority
                 the ONLY module that may authorize organizational change
                          │ approves · ratifies · promotes · certifies · suspends · revokes · delegates/escalates authority
        ┌─────────────────┼─────────────────────────────────────────────────┐
        ▼                 ▼                                                   ▼
 Mission ratify    Goal/Plan/Task/Workflow/Command approve            Memory promotion / Knowledge ratification
 Agent register    Provider/Tool approve                              Learning approval / Emergency suspend-recover
        │
        └── enforces the canonical AUTHORITY STACK (Spec 48 §9.1) at every gate
```

**Authority precedence (canonical, Spec 48 §9.1):**

```
Law → Security/Compliance → Approved Policy → Mission → Goals → Plans → Tasks → Workflows → Commands → Execution → Agent → Working Memory → Long-term Memory → Knowledge → Reasoning → Learning
```

> Governance does not sit *inside* this stack as a step — it is the **process that enforces the stack**. It is the constitutional referee: it validates every significant change against the stack and against the rules, and it is the **only authority allowed to approve, ratify, promote, certify, suspend, revoke, delegate, or escalate authority.** It governs; it does not itself decide business intent, reason, execute, or learn.

Governance is the **constitutional layer** of Hebun. Every previous module *proposes* significant change; **Governance is the single authority that authorizes it.** Mission is ratified *by Governance*; Goals/Plans/Tasks/Workflows/Commands are approved *by Governance*; Memory is promoted and Knowledge is ratified *through Governance*; Learning is approved *by Governance*; agents/providers/tools are registered *by Governance*; emergencies are declared and recovered *by Governance*. **Governance governs.**

**Critical clarification — Governance is the referee, not a player:**

> Governance is **NOT** Policy. Governance is **NOT** Identity. Governance is **NOT** Reasoning. Governance is **NOT** Execution.
>
> **Policy** states the *rules*; **Identity** states *who exists and what they may be granted*; **Reasoning** *thinks*; **Execution** *acts*. **Governance** is the **authority that applies the rules to authorize change** — it consumes Policy (the rules) and Identity (the actors/permissions), receives recommendations from Reasoning, and gates Execution. It is the constitutional process, not a rulebook, a roster, a mind, or an engine.

---

## 1. Purpose

### Why the Governance layer exists

Fifteen specifications defined modules that each *propose* change: Mission proposes a new purpose, Goal proposes an outcome, Plan proposes a strategy, Memory proposes a promotion, Knowledge proposes a truth, Learning proposes an improvement, an Agent proposes an action beyond its ceiling. Every one of these has, so far, said "…approved by Governance," "…ratified by Governance," "…governed." But *what Governance is* — the engine, the registry, the gates, the approval chains, the separation-of-duties, the human-override, the audit — has never been specified. Fifteen modules point at a coordinator that did not yet exist. Governance is that coordinator, now made concrete.

Governance is the **system of record for organizational authorization: the constitutional process that validates and authorizes every significant change, enforces the Authority Stack, and holds the sole power to approve, ratify, promote, certify, suspend, revoke, delegate, and escalate authority.** It is the single place where "may this change happen?" is answered — deterministically, with an accountable actor, an authority source, evidence, a justification, and an immutable, versioned decision record. It is what makes the whole system *safe*: no significant change to purpose, truth, memory, behavior, authority, or capability happens except through it.

Without a Governance layer, the eight promotion/ratification/approval pipelines defined across 34–48 are headless: each module would gate itself, separation-of-duties would be per-module and inconsistent, authority-elevation would have no single guardian, and "human override" would be scattered. Governance closes that gap and holds the **authorization boundary**: it is the one module that may authorize organizational change — and it never itself reasons, executes, learns, or owns the intent it authorizes.

### Business problem it solves

1. **Single authorization authority.** Significant change must pass one consistent, accountable gate — not fifteen inconsistent per-module ones. Governance is the single constitutional authority that authorizes change, enforcing the same Authority Stack, separation-of-duties, and audit everywhere.
2. **Safe authority management.** The power to grant, elevate, delegate, suspend, and revoke authority is the most dangerous power in the system. Governance is the sole holder of it — no agent self-elevates, no module grants itself power; **human authority always supersedes agent authority.**
3. **Accountable, auditable, appealable decisions.** Every authorization must have an actor, an authority source, a justification, evidence, a versioned decision record, and a path to appeal — so every significant change is defensible to an auditor, a regulator, and the organization itself.

### Its responsibility

- Own the lifecycle of every **governance session/decision**: `created → intake → classified → under-review → deliberating/voting → decided → recorded → (appealed) → archived` (governed), separate from health `unknown → healthy / degraded / stalled` (observed).
- Be the **only authority** that may **approve, ratify, promote, certify, suspend, revoke, delegate authority, and escalate authority** across the whole system.
- Run the **governance gates**: compliance, security, audit, legal, financial, operational, and AI-safety gates — and the domain pipelines: Mission ratification, Goal/Plan/Workflow/Command approval, Memory promotion approval, Knowledge ratification, Learning approval, Agent registration, Provider/Tool approval, emergency suspension/recovery.
- Enforce the **canonical Authority Stack (Spec 48)** at every gate; enforce **separation of duties**, **authority ceilings**, **delegated authority**, **multi-stage approval / approval chains / voting / consensus / quorum**, **escalation**, **appeals**, and **exception handling**.
- Provide **human review, human override, and emergency override** — with **human authority always superseding agent authority.**
- Guarantee every governance action carries **actor, authority source, timestamp, justification, evidence, and a versioned decision record**, and is **immutably auditable and replayable.**
- Expose **governance observability, metrics, and cost**; be **provider-independent.**
- Emit governance events; consume proposals from every module; authorize (or refuse) their significant changes.

### What is explicitly NOT its responsibility

- **Governance never executes work.** It authorizes; Execution performs. Governance has no effect path.
- **Governance never reasons.** It consumes Reasoning's recommendations; it does not think through the substance. It applies rules and authority to a decision, it does not deliberate the business merits from scratch (humans in the loop do the substantive judgment).
- **Governance never learns.** It approves Learning's proposals; it does not itself improve behavior.
- **Governance never owns business intent.** It ratifies Mission and approves Goals/Plans; it does not *author* them — intent is owned by the chain/humans. Governance authorizes; it does not originate.
- **Governance is not Policy or Identity.** It *consumes* Policy (rules) and Identity (actors/permissions); it does not *define* the rules (Policy does) or *own* the roster (Identity does).
- **Governance never bypasses its own gates or the Authority Stack.** It is the guardian, not an exception to the rule.

---

## 2. Mental Model

Governance is the **constitution, the courts, and the board of the digital company combined** — the authority that says whether a significant change is *permitted to happen*. When Mission wants to change, Governance is the ratifying body. When an agent wants to act beyond its lane, Governance is the escalation authority. When memory wants to become knowledge, Governance is the ratification gate. When learning wants to change behavior, Governance is the approval board. When an emergency demands elevated power, Governance is the body that declares it — time-boxed, loudly, auditable. It writes no strategy, thinks no thoughts, performs no work, and improves nothing — it **authorizes**, and it is the *only* body that may.

The one-line model: **Governance is the constitutional authority that validates and authorizes every significant organizational change — approve, ratify, promote, certify, suspend, revoke, delegate/escalate authority — enforcing the Authority Stack, separation of duties, and human supremacy, with an accountable, evidenced, versioned, auditable decision record for every action, while itself reasoning, executing, learning, and owning intent — never.**

Seven properties define the model:

- **Constitutional.** It is the supreme coordination authority — above every module's self-interest, enforcing the same rules on all. Significant change passes through it or it does not happen.
- **Authorizing, not doing.** It authorizes; it never executes, reasons, learns, or authors intent. It is the referee, not a player.
- **The sole authority over authority.** Only Governance may approve/ratify/promote/certify/suspend/revoke/delegate/escalate authority. No module grants itself power; no agent self-elevates.
- **Human-supreme.** Human authority always supersedes agent authority. Agents may *recommend* governance actions; they may never approve or elevate themselves.
- **Gate-structured.** Every authorization passes typed gates (compliance/security/audit/legal/financial/operational/AI-safety) and, where required, multi-stage chains, voting, consensus, and quorum.
- **Accountable & auditable.** Every action has actor, authority source, timestamp, justification, evidence, and a versioned, immutable decision record; every decision is replayable and appealable.
- **Consuming, not defining.** It consumes Policy (rules) and Identity (actors/permissions) and Reasoning (recommendations); it defines none of them — it applies them.

Governance sits **above every module as their common authorizer and beside Policy/Identity as their applier.** Policy writes the rules; Identity holds the actors and their grantable permissions; Governance *applies the rules to the actors to authorize change*. It is the hinge between *a proposed significant change* and *an authorized one* — and it is exclusively about *authorizing*, never *reasoning, executing, learning, or owning intent*.

---

## 3. Core Domain Objects

Governance introduces the authorization entities, extending the existing `policy`/`approval` schemas. All reuse `_base.ts` contracts:

- **`rootColumns`** / **`tenantColumns`**. `createdBy`/`decidedBy`/`authoritySourceRef` resolve to actor references (Identity §3.9); every session/decision is tenant-scoped.

---

### 3.1 Governance Session

- **Purpose.** One bounded authorization process — from an intake proposal to a recorded decision. The primary process object.
- **Table.** `governance_sessions` (`tenantColumns`).
- **Conceptual fields.**
  - `id` — Governance Session ID.
  - `tenantId` — owning Company (Identity §3.1).
  - `governanceDomain` — `governanceDomainEnum` (§3.5): mission, goal, plan, workflow, command, memory-promotion, knowledge-ratification, learning, agent-registration, provider-tool, emergency, authority-delegation.
  - `decisionType` — `governanceDecisionTypeEnum` (§3.2): approve, ratify, promote, certify, suspend, revoke, delegate-authority, escalate-authority, reject, appeal.
  - `subjectRef` — what is being authorized (a Mission version, a Plan, a promotion candidate, a learning proposal, an agent, a provider…).
  - `proposerRef` — who/what proposed it (a module/agent/human — agents may recommend, never self-approve).
  - `governanceContextRef` — the assembled governance context (§3.3): resolved Policy, Identity/authority, risk class, applicable gates, evidence.
  - `riskClass` — `riskClassEnum` (§5.20): low | medium | high | critical.
  - `gates` — the typed gates this decision must clear (§5.11).
  - `approvalChain` — the ordered approval stages / voting / quorum config (§5.8).
  - `decisionRecord` — the immutable, versioned decision record (§3.4), on completion.
  - `authoritySourceRef` — the authority under which the decision is made (role/policy/delegation/emergency).
  - `justification` / `evidence` — mandatory rationale + supporting evidence.
  - `governanceLifecycleStatus` — governed lifecycle (`governanceLifecycleStatusEnum`, §6).
  - `governanceHealth` — health (`governanceHealthEnum`, §6): `unknown | healthy | degraded | stalled`.
  - `governanceVersion` — immutable version counter.
  - `correlationId` — threads the session and its events.
  - base audit fields (immutable governance audit).
- **Required.** `tenantId`, `governanceDomain`, `decisionType`, `subjectRef`, `proposerRef`, `riskClass`, `authoritySourceRef`, `justification`, `governanceLifecycleStatus`, `correlationId`.
- **Ownership.** Tenant-scoped; owned by Governance; accountable to the authorizing actor(s).
- **Example.** Session: domain `knowledge-ratification`, decisionType `ratify`, subject {Knowledge candidate K-92}, risk `medium`, gates {compliance, audit}, chain {steward → domain-owner}, authority {Finance Director role}.

### 3.2 Governance Decision

- **Purpose.** The typed authorization outcome — the core act.
- **Realization.** `governanceDecisionTypeEnum` (specified): `approve | ratify | promote | certify | suspend | revoke | delegate-authority | escalate-authority | reject | appeal`. **Governance is the only module allowed to perform these.** Each produces an immutable, versioned **decision record** (§3.4).

### 3.3 Governance Context

- **Purpose.** The assembled inputs a session decides over — resolved rules, authority, risk, gates, evidence.
- **Realization.** `governanceContextRef` → `{applicablePolicies (from Policy), authorityGraph (from Identity §6 — who may authorize, ceilings), riskClass, requiredGates, evidence, priorDecisions}`. Assembled read-only; Governance **consumes** Policy and Identity — it does not define them.

### 3.4 Decision Record (immutable, versioned)

- **Purpose.** The permanent, auditable record of a governance action — the constitutional receipt.
- **Realization.** `{decisionId, decisionType, subjectRef, actor, authoritySource, timestamp, justification, evidence, gateResults, chainResults, outcome, decisionVersion}`. **Every governance action has actor, authority source, timestamp, justification, evidence, and a decision record; every decision is versioned and auditable** (§7). Immutable; corrections/appeals create new versions, never overwrite.

### 3.5 Governance Registry & Domains & Authorities

- **Governance Registry.** The catalog of governance **domains** (what kinds of change exist), the **gates** each requires, the **approval chains/authorities** for each, and the **rules** binding them. The map of "how is each change authorized."
- **Governance Domains** (`governanceDomainEnum`): mission, goal, plan, workflow, command, memory-promotion, knowledge-ratification, learning, agent-registration, provider-tool, emergency, authority-delegation, plus extensible custom.
- **Governance Authorities.** Who may authorize what, at what risk class — derived from Identity roles (`roleTypeEnum`) + delegations, bounded by ceilings. **Governance holds no authority of its own to invent** — it applies the authority Identity/Policy define.

### 3.6 Approval Chain / Vote / Quorum

- **Purpose.** The multi-stage authorization structures.
- **Realization.** `approvalChain {stages[], mode}` where `mode ∈ votingModeEnum: single | multi-stage | vote | consensus | quorum`. Each stage names required authority; voting/consensus/quorum define the decision rule; separation-of-duties is enforced across stages (§7).

---

## 4. Ownership

- **Governance owns the authorization process and its decision records — not the intent, not the work.** It owns *governance sessions, decisions, gates, chains, the registry, and the audit* — it **owns no business intent, no work, no truth, no behavior**; those belong to the modules it authorizes.
- **The sole authority over authority.** Governance is the only owner of the power to approve/ratify/promote/certify/suspend/revoke/delegate/escalate. No module and no agent owns any slice of this power except by Governance's explicit, audited delegation.
- **Human supremacy of ownership.** Ultimate governance authority rests with humans (owners/directors per Identity `roleTypeEnum`). **Human authority always supersedes agent authority.** Agents may *recommend* governance actions and *participate* in chains only up to their (human-bounded) ceiling; they **never approve or elevate themselves.**
- **Delegated authority is owned, bounded, and revocable.** Governance may delegate a scoped, time-boxed authority to an actor; the delegation never exceeds the delegator's authority, is fully audited, and is revocable at any time (Identity §6 delegation, canonical here).
- **Accountability per decision.** Every decision names its authorizing actor(s) and authority source; "Governance decided" is never a valid answer — a decision always traces to accountable authorities.
- **No cross-tenant governance.** A session never spans companies; cross-tenant authorization (M&A) is itself a governed, per-tenant action.

---

## 5. Governance Architecture

The constitutional layer's internal architecture. All are authorization mechanics; none executes, reasons, learns, or owns intent.

### 5.1 Governance Engine

- The engine drives each session: **intake → classify (domain + risk) → assemble context (Policy + Identity + evidence) → select gates + chain → run gates → run approval chain (multi-stage/vote/consensus/quorum) → decide → record (immutable, versioned) → emit → (appeal path).** It authorizes; it performs no work and reasons no substance (humans do substantive judgment inside the chain).

### 5.2 Governance Registry (§3.5) & 5.3 Sessions (§3.1) & 5.4 Context (§3.3)

- The **registry** maps every domain to its gates/chains/authorities/rules; **sessions** are bounded authorization runs; **context** is the assembled Policy+Identity+risk+evidence.

### 5.5 Governance Decisions — Approve / Ratify / Promote / Certify

- **Approve** (intent/action: Goal/Plan/Task/Workflow/Command/Learning). **Ratify** (authoritative content: Mission purpose, Knowledge truth). **Promote** (memory: Working→Long-term). **Certify** (a provider/tool/agent meets a standard). All immutable-recorded; all versioned.

### 5.6 Validation & 5.7 Human Review / Human Override / Emergency Override

- **Validation** checks the proposal against Policy, the Authority Stack, and gate requirements. **Human review** is a first-class stage; **human override** lets an authorized human accept/reject regardless of an automated recommendation; **emergency override** (break-glass) grants time-boxed elevated authority under a declared emergency — always time-boxed, loudly audited, auto-revoked (Identity §6 emergency, canonical here). **Human authority always supersedes agent authority.**

### 5.8 Multi-stage Approval / Approval Chains / Voting / Consensus / Quorum

- Authorizations may require an **ordered chain** of stages, a **vote** (majority/threshold), **consensus** (unanimity), or a **quorum** (minimum participants). The mode + separation-of-duties are set by the domain/risk in the registry.

### 5.9 Separation of Duties / 5.10 Delegated Authority / Authority Ceiling / Escalation / Appeals / Exception Handling

- **Separation of duties**: the proposer/author cannot be the sole approver (canonical Spec 48 §7.10). **Delegated authority**: scoped, time-boxed, ≤ delegator, revocable. **Authority ceiling**: min(assigned, human-owner) (canonical Spec 48 §7.9). **Escalation**: a decision beyond an authority routes upward. **Appeals**: a decided outcome may be appealed to a higher authority (new session, new version). **Exception handling**: a governed, audited exception (never a silent bypass) with heightened scrutiny.

### 5.11 The Gate Suite — Compliance / Security / Audit / Legal / Financial / Operational / AI-Safety

- Every decision passes the **typed gates** its domain/risk requires:
  - **Compliance gate** — regulatory conformance.
  - **Security gate** — security-policy conformance, threat review.
  - **Audit gate** — auditability/record completeness.
  - **Legal gate** — legal review (contracts, liability).
  - **Financial gate** — budget/spend authority.
  - **Operational gate** — operational feasibility/impact.
  - **AI-safety gate** — for agent/learning/model changes: bias/drift/hallucination/authority-preservation review (consumes Learning's safety suite, Reasoning's uncertainty).
- A failed mandatory gate **blocks** the decision; gates compose per risk class.

### 5.12 Domain Pipelines (how Governance authorizes each module's change)

- **Mission Ratification** (Mission §6): propose→review→ratify; atomic supersession; ratifier authority `owner|director`.
- **Goal/Plan/Workflow/Command Approval**: `approvalStateEnum` chains, scope-appropriate authority.
- **Memory Promotion Approval** (LTM §5.9): validate provenance/dedup → approve promotion.
- **Knowledge Ratification** (Knowledge §5.13): review consistency/conflict → ratify canonical truth.
- **Learning Approval** (Learning §5.22): safety-suite + causation review → approve reversible improvement.
- **Agent Registration Approval** (Agent §6): configure→validate ceiling→approve activation.
- **Provider/Tool Approval**: certify a provider/tool for use (security/compliance gates).
- **Emergency Suspension/Recovery**: declare emergency→suspend actor/agent/company→govern recovery.

### 5.13 Emergency Suspension & 5.14 Emergency Recovery

- **Emergency suspension**: Governance may immediately suspend an actor/agent/provider/company on a security/compliance trigger — access blocked at auth time, history retained, loudly audited. **Emergency recovery**: a governed flow to restore after resolution, with review — never automatic.

### 5.15 Governance Replay / 5.16 Audit / 5.17 Observability / 5.18 Metrics / 5.19 Cost / Provider Independence

- **Replay**: decisions are replayable from their immutable records for audit. **Audit**: every governance action is immutably recorded (canonical Spec 48 §7.3). **Observability/metrics**: decision throughput, gate pass/fail, escalation/appeal rates, override counts, backlog. **Cost**: governance overhead is measured/bounded. **Provider independence**: any model-assisted review runs via Commands/Execution — no bound SDK.

### 5.20 Risk Classification

- Every session is **risk-classified** (low/medium/high/critical) from subject, domain, impact, and reversibility. Risk sets the required gates, chain depth, quorum, and human-review requirement — higher risk → stricter authorization. **Correlation-driven** risk never bypasses a mandatory gate.

### 5.21 The authorization boundary

- Governance **authorizes** but **executes/reasons/learns/owns-intent nothing**. Its decision authorizes a change that *another module applies* (Mission activates, Knowledge stores the ratified truth, Execution performs, Agent reconfigures). This boundary is why the system has one trustworthy authority over all significant change — without that authority ever becoming a doer, a thinker, or an owner of what it authorizes.

---

## 6. Lifecycle

A Governance session carries the **canonical two-axis model** (Spec 48 §6): lifecycle (governed) + health (observed), never crossing.

Governing rule: **a significant change is authorized only through a governed session that enforces the Authority Stack, gates, chains, separation-of-duties, and human supremacy, producing an accountable, evidenced, versioned, immutable decision record — and Governance authorizes but never applies, executes, reasons, or learns.**

### 6.1 Lifecycle dimension

**`governanceLifecycleStatusEnum`** (specified): `created | intake | classified | under-review | deliberating | decided | recorded | appealed | superseded | archived`.

| Lifecycle state | Meaning | Mutable? | Authorizes? |
|---|---|---|---|
| **created** | Session opened for a proposal | Yes (pre-intake) | No |
| **intake** | Proposal received + context assembled | Limited | No |
| **classified** | Domain + risk classified; gates/chain selected | No | No |
| **under-review** | Gates running; human review | No | No |
| **deliberating** | Approval chain / voting / consensus / quorum | No | No |
| **decided** | Decision made (approve/ratify/promote/…/reject) | No | **Yes** (authorization exists) |
| **recorded** | Immutable decision record written; emitted | No (immutable) | Yes (in force) |
| **appealed** | A higher authority is reviewing an appeal | No | Suspended pending appeal |
| **superseded** | Decision replaced by a newer governed decision | No (immutable) | No (historical) |
| **archived** | Retired; terminal | No (immutable) | No |

**Lifecycle transitions (governed):**

| Transition | From → To | Precondition | Effect | Emits |
|---|---|---|---|---|
| **Open** | ∅ → created | A module/agent/human proposes a significant change | session created; `governanceHealth=unknown` | `GovernanceSessionOpened` |
| **Intake** | created → intake | Proposal valid; context (Policy+Identity+evidence) assembled | context ready; health tracking begins | `GovernanceIntake` |
| **Classify** | intake → classified | Domain + risk classified; gates + chain selected | required gates/chain set | `GovernanceClassified` |
| **Review** | classified → under-review | Gates run; human review as required | gate results recorded | `GovernanceUnderReview` |
| **Deliberate** | under-review → deliberating | Gates passed; chain/voting/quorum runs | chain progress recorded | `GovernanceDeliberating` |
| **Decide** | deliberating → decided | Chain resolves with required authority + separation of duties | decision typed (approve/ratify/…/reject) | `GovernanceDecided` |
| **Record** | decided → recorded | Decision record assembled (actor/authority/justification/evidence/version) | immutable record written; authorization in force | `GovernanceRecorded` (+ domain event e.g. `MissionRatified`) |
| **Appeal** | recorded → appealed | An authorized party appeals to a higher authority | authorization suspended pending appeal | `GovernanceAppealed` |
| **Resolve appeal** | appealed → recorded \| superseded | Higher authority upholds or overturns | upheld → in force; overturned → superseded by new decision | `GovernanceAppealResolved` |
| **Supersede** | recorded → superseded | A newer governed decision replaces it | historical; lineage linked | `GovernanceSuperseded` |
| **Archive** | recorded/superseded → archived | Governed retirement | terminal | `GovernanceArchived` |
| **Emergency override** | any → decided (fast-path) | Declared emergency + break-glass authority | time-boxed elevated authorization; loudly audited; auto-revoke scheduled | `EmergencyOverrideActivated` |

Every transition is immutably audited. **Health never appears in this table.** The **decide/record** step is the only authorization act; **Governance records the authorization — the target module applies the change.** Emergency override is the sole fast-path, and it is time-boxed and loudly audited, never silent.

### 6.2 Health dimension

**`governanceHealthEnum`** (specified): `unknown | healthy | degraded | stalled`.

| Health state | Meaning | Set how |
|---|---|---|
| **unknown** | No sufficient signal (default; also terminal) | default / on clear |
| **healthy** | Progressing; gates clearing; authority available | auto |
| **degraded** | Backlog, weak evidence, gate friction, missing reviewer | auto |
| **stalled** | Blocked (no quorum, missing authority, unresolved gate, awaiting human) | auto |

**Health rules (canonical Spec 48 §6):** health only in active states (`intake`→`deliberating`); auto-derived from gate/chain/quorum/backlog signals; **never moves lifecycle** (a stalled session escalates via a governed transition, never auto-decides); cleared to `unknown` on terminal states.

### 6.3 Terminal-state rules

- **recorded** authorizations are **in force, immutable, versioned**; **superseded/archived** retain history.
- **Every approval, ratification, promotion, and override is immutably auditable and versioned; every decision is replayable.**
- **Appeals** may reopen a decision to a higher authority (new session/version); a decision is never silently reversed.
- Terminal sessions carry `governanceHealth = unknown` (cleared, frozen).

---

## 7. Constraints

Structural and semantic constraints, enforced by the module — canonical where marked.

**Structural / hard invariants (enforced):**

1. **Sole authorization authority.** **Governance is the only module that may authorize organizational change** — approve, ratify, promote, certify, suspend, revoke, delegate authority, escalate authority. No other module or agent may perform these.
2. **Full decision provenance.** **Every governance action has actor, authority source, timestamp, justification, evidence, and a decision record.** A governance action missing any is invalid.
3. **Versioned + auditable.** **Every approval/ratification/promotion/override is auditable; every decision is versioned.** Immutable; corrections/appeals create versions.
4. **Enforces the Authority Stack.** **Governance enforces the canonical Authority Stack (Spec 48 §9.1)** at every gate; a decision violating it cannot be recorded (protective-ops exemption aside).
5. **Human supremacy.** **Human authority always supersedes agent authority.** **Agents may recommend governance actions; agents may never approve themselves; agents may never elevate themselves.**
6. **Separation of duties.** The proposer/author of a change cannot be its sole approver/ratifier (canonical Spec 48 §7.10).
7. **Authority ceiling on delegation.** Delegated/escalated authority never exceeds the source authority (canonical Spec 48 §7.9); delegations are scoped, time-boxed, revocable.
8. **Tenant isolation.** `tenantId` NOT NULL; no cross-tenant governance.
9. **Terminal immutability.** Superseded/archived decisions immutable.

**Semantic (module-enforced) — the referee guards:**

10. **Never executes.** **Governance never executes work.** It authorizes; Execution performs.
11. **Never reasons the substance.** **Governance never performs reasoning.** It consumes Reasoning's recommendations; substantive judgment inside a chain is done by humans.
12. **Never learns.** **Governance never performs learning.** It approves Learning's proposals.
13. **Never owns business intent.** **Governance never owns business intent.** It ratifies/approves intent; it does not author it.
14. **Not Policy, not Identity.** It **consumes** Policy (rules) and Identity (actors/permissions); it defines neither.
15. **Validates before execution.** **Governance validates decisions before execution** — nothing significant executes unauthorized; Execution's final gate defers to Governance's authorizations.
16. **No self-bypass.** Governance never bypasses its own gates or the Authority Stack; emergency override is the only fast-path and is time-boxed + loudly audited.
17. **Lifecycle/health orthogonal (canonical).** Separate axes; health never moves lifecycle.

---

## 8. Validation

Validation runs at the canonical gate sequence (Spec 48 §8), specialized for authorization. Governance fails closed: on ambiguity it does not authorize.

**Intake validation:**

- The proposal resolves to a real subject in the same tenant; the proposer is identified; the domain + decisionType are valid; context (Policy + Identity authority graph + evidence) assembles.

**Classification & gate-selection validation:**

- Risk classified; required gates + approval chain + human-review requirement selected from the registry per domain/risk. A misclassified low-risk on a high-impact change is caught (impact/reversibility checks).

**Authority validation (the critical gate):**

- The authorizing actor(s) hold the required authority (Identity `roleTypeEnum` + valid delegation) at the risk class; **separation of duties** enforced; **agents cannot self-approve/self-elevate**; **human review where required, and human authority supersedes.**

**Authority-stack validation:**

- The change conforms to Law/Compliance/Approved-Policy/Mission/parent (Spec 48 §9.1); a violation blocks the decision and routes to human resolution (protective-ops exempt).

**Gate validation:**

- Every mandatory typed gate (compliance/security/audit/legal/financial/operational/AI-safety) passes; a failed mandatory gate blocks.

**Chain/quorum validation:**

- Multi-stage/vote/consensus/quorum requirements met; incomplete authorization cannot decide.

**Decision-record validation:**

- Actor, authority source, timestamp, justification, evidence present; the record is versioned and immutable before authorization is in force.

**Health validation (continuous):**

- `governanceHealth` non-`unknown` only active; unresolved inputs → `degraded`/`stalled`; never moves lifecycle.

Only a change passing all gates is authorized. A failure refuses authorization with the violated rule recorded; nothing significant executes unauthorized.

---

## 9. Relationships (how Governance interacts with every module 34–48)

| Module | How Governance interacts |
|---|---|
| **Identity (34)** | **Consumes.** Identity provides the actors, roles, permissions, and ceilings Governance applies; Governance authorizes membership/role/permission changes and performs delegation/escalation/suspension **through** Identity's model. Governance defines no actor; it authorizes changes to them. |
| **Mission (35)** | **Ratifies.** Mission's purpose is ratified by Governance (atomic supersession, `owner|director` authority). Governance does not author the Mission; it authorizes its ratification. |
| **Goal (36)** | **Approves.** Goal approval (draft→proposed→approved) is a Governance gate; scope-appropriate authority + separation of duties. |
| **Plan (37)** | **Approves.** Plan approval gates + execution-readiness sign-off run through Governance. |
| **Task (38)** | **Approves** (where required). Task approval-requirement gates through Governance before `ready`. |
| **Workflow (39)** | **Approves.** Workflow approval + mid-orchestration approval gates (human-in-the-loop) are Governance decisions. |
| **Command (40)** | **Approves** (where required). A Command's `approvalRef` is a Governance authorization before release. |
| **Execution (41)** | **Gates before effect.** Execution's final enforcement gate defers to Governance authorizations — it performs only what Governance authorized; Governance never executes. |
| **Agent (42)** | **Registers/authorizes.** Agent creation/configuration/activation/reconfiguration/replacement/suspension are Governance decisions; Governance enforces the ceiling and blocks self-elevation. Agents may **recommend** governance actions, never self-approve. |
| **Working Memory (43)** | **Indirect.** Governance authorizes promotions *out of* Working Memory; the workspace itself is transient/ungoverned-content but its promotion candidates pass Governance. |
| **Long-term Memory (44)** | **Approves promotion.** Memory promotion (Working→Long-term) passes Governance approval (provenance/dedup/authority). |
| **Knowledge (45)** | **Ratifies.** Knowledge (canonical truth) is ratified by Governance — the stronger gate (consistency/conflict/authority). |
| **Reasoning (46)** | **Consumes recommendations.** Reasoning's conclusions are inputs to Governance decisions; Governance does not reason the substance — it applies authority to the recommendation. |
| **Learning (47)** | **Approves.** Learning's improvement proposals pass Governance (safety-suite + causation + reversibility + authority-preservation) before the target module applies them. |
| **Architecture Consolidation (48)** | **Enforces.** Governance is the runtime realization of Spec 48's governance/authority backbones — the one authorization mechanism the consolidation calls for. |
| **Policy (50, forthcoming)** | **Consumes.** Policy states the rules; Governance applies them. Governance does not define Policy; a Policy change is itself a Governance-authorized act. |

**The authorization spine:** every module *proposes* a significant change → **Governance authorizes (or refuses)** enforcing rules/authority/gates → the *target module applies* the authorized change → immutable audit. Governance is the single node through which all significant change is authorized — and never the node that reasons, executes, learns, or owns intent.

### 9.1 Explicit distinction tables

**Governance vs Policy:**

| | Governance | Policy |
|---|---|---|
| Is | The authority that applies rules | The rules themselves |
| Verb | Authorizes | States (allowed/required) |
| Owns | Decisions/gates/audit | Rule definitions |
| Relationship | Consumes Policy | Consumed by Governance |

**Governance vs Identity:**

| | Governance | Identity |
|---|---|---|
| Is | Authorizer of change | Roster of actors + grantable permissions |
| Verb | Approve/ratify/delegate | Own/attribute |
| Authority | Applies/delegates authority | Defines who may be granted what |
| Relationship | Authorizes changes to Identity | Supplies actors/ceilings to Governance |

**Governance vs Reasoning:**

| | Governance | Reasoning |
|---|---|---|
| Is | Authority | Cognitive engine |
| Verb | Authorizes | Concludes (recommends) |
| Substance | Applies rules to a recommendation | Produces the recommendation |
| Commits? | Records authorization | Never |

**Governance vs Decision:**

| | Governance | Decision (cognitive chain) |
|---|---|---|
| Is | The authorization of a decision | The committed choice/intent |
| Owns | The gate + record | The intent |
| Relationship | Authorizes the decision | Is authorized by Governance |

**Governance vs Execution:**

| | Governance | Execution |
|---|---|---|
| Is | Authorizer | Performer |
| Verb | Authorizes | Acts (effects) |
| Effect | None | Real-world effects |
| Relationship | Authorizes before effect | Performs only what's authorized |

**Governance vs Learning:**

| | Governance | Learning |
|---|---|---|
| Is | Approver | Improver (proposer) |
| Verb | Approves/rejects | Proposes |
| Authority change | May authorize (governed) | Never (authority not learnable) |
| Relationship | Approves Learning's proposals | Proposes to Governance |

**Constant:** Governance **authorizes**; every other module proposes, reasons, remembers, acts, or improves. Governance is the only authority over authority.

---

## 10. Events

Every Governance transition emits a domain event (canonical envelope, Spec 48 §10.1). All modules + audit + observability subscribe.

| Event | Trigger | Payload | Consumers | Impact |
|---|---|---|---|---|
| `GovernanceSessionOpened` | Proposal received | domain, decisionType, subjectRef, proposerRef | Observability | Authorization requested |
| `GovernanceIntake` / `GovernanceClassified` | Context assembled / risk+gates set | riskClass, gates, chain | Observability | Path selected |
| `GovernanceUnderReview` | Gates running | gateResults | Reviewers | Gate evaluation |
| `GovernanceGateFailed` | A mandatory gate fails | gateType, reason | **Governance/Security/Compliance**, Notifications | Decision blocked |
| `GovernanceDeliberating` | Chain/vote/quorum | stage, votes | Approvers | Authorization progressing |
| `GovernanceDecided` | Decision made | decisionType, outcome, authoritySource | subject module | Authorization determined |
| `GovernanceRecorded` | Immutable record written | decisionVersion | **target module**, Audit | Authorization in force |
| `MissionRatified` / `KnowledgeRatified` / `MemoryPromoted` / `GoalApproved` / `PlanApproved` / `WorkflowApproved` / `CommandApproved` / `LearningApproved` / `AgentRegistered` / `ProviderCertified` | Domain-specific authorization recorded | subjectRef | respective module | The authorized change may apply |
| `GovernanceRejected` | Refused | reason | proposer, Audit | Change not authorized |
| `AuthorityDelegated` / `AuthorityEscalated` / `AuthorityRevoked` | Authority change | fromRef, toRef, scope, expiry | Identity, Security, Audit | Authority moved (bounded, audited) |
| `EmergencyOverrideActivated` / `EmergencySuspension` / `EmergencyRecovery` | Break-glass / suspend / recover | window, trigger | **Security, Compliance**, all | Elevated/blocked, time-boxed, loud |
| `GovernanceAppealed` / `GovernanceAppealResolved` | Appeal raised/resolved | appellant, outcome | higher authority, Audit | Decision reopened/upheld/overturned |
| `GovernanceHealthChanged` | Health recomputed (active) | fromHealth, toHealth | Observability | Backlog/quorum signal; **no lifecycle change** |
| `GovernanceSelfApprovalAttempted` | Agent tries to approve/elevate itself | agentRef, attempt | **Security (high severity)**, Audit | Sovereignty guard fired |
| `GovernanceSuperseded` / `GovernanceArchived` | Decision replaced/retired | successorId | Audit | Historical |

**Canonical stream separation (Spec 48 §10.4):** lifecycle events vs health events, independent.

---

## 11. KPIs

| KPI | Definition | Source |
|---|---|---|
| **Authorization integrity** | % of significant changes authorized through Governance (target 100%) | decision coverage |
| **Unauthorized-change incidents** | Count of significant changes bypassing Governance (target 0) | audit reconciliation |
| **Self-approval/elevation attempts** | Count of agent self-* attempts (target 0) | sovereignty events |
| **Decision provenance completeness** | % of decisions with actor/authority/justification/evidence/version (target 100%) | validation |
| **Separation-of-duties conformance** | % of decisions with independent approver (target 100%) | chain checks |
| **Gate pass/fail rates** | Per gate type (compliance/security/legal/financial/operational/AI-safety) | gate results |
| **Human-review coverage** | % of high/critical-risk decisions with human review (target 100%) | review records |
| **Human-override rate** | % of decisions a human overrode | override records |
| **Escalation/appeal rates** | Frequency + resolution time | escalation/appeal events |
| **Emergency-override incidence** | Count/duration; % auto-revoked on time (target 100%) | emergency records |
| **Decision cycle time** | Median open→recorded by risk class | timestamps |
| **Backlog / stalled rate** | % of sessions stalled (no quorum/authority) | health |
| **Authority-stack conformance** | % of decisions conforming (target 100%) | stack checks |
| **Audit completeness** | % of governance actions immutably recorded (target 100%) | audit chain |
| **Governance cost** | Overhead per decision | cost metrics |

---

## 12. Failure Scenarios (50)

Governing rule: **Governance fails closed and accountable** — on ambiguity it does not authorize; no significant change escapes it; no authority is created without accountability.

1. **Significant change without Governance.** Blocked — the target module refuses to apply an unauthorized change; audit reconciliation flags any bypass attempt.
2. **Agent self-approves.** Refused; `GovernanceSelfApprovalAttempted`; sovereignty guard.
3. **Agent self-elevates.** Refused — only Governance grants authority; agents recommend, never elevate themselves.
4. **Proposer is sole approver.** Refused — separation of duties.
5. **Approver lacks authority.** Refused — authority validation; escalates.
6. **Delegated authority exceeds delegator.** Refused — ceiling on delegation.
7. **Decision violates Authority Stack.** Blocked; routed to human resolution (protective-ops exempt).
8. **Mandatory gate fails (compliance/security/legal/financial/operational/AI-safety).** Blocked; recorded; escalates.
9. **Missing justification/evidence.** Invalid — every action needs actor/authority/justification/evidence.
10. **Un-versioned/un-audited decision.** Impossible — decisions are versioned + immutably audited; a failed audit rolls back the decision.
11. **Human override contradicts an agent recommendation.** Human wins — human authority supersedes.
12. **Emergency override never revoked.** Auto-revoke at window end + watchdog force-revoke + high-severity alert.
13. **Emergency override abused for routine change.** Refused — emergency requires a declared trigger; misuse is audited as a security event.
14. **Quorum not reached.** `stalled`; escalates; never auto-decides without quorum.
15. **Consensus not reached.** Escalates/appeals; not silently forced.
16. **Vote tie.** Declared tie-break (registry) or escalation; never arbitrary.
17. **Risk misclassified (high as low).** Impact/reversibility checks catch it; reclassified; stricter gates applied.
18. **Governance tries to execute.** Refused — no effect path; authorizes only.
19. **Governance tries to reason the substance.** Refused — consumes recommendations; humans judge substance in-chain.
20. **Governance tries to learn.** Refused — approves Learning; does not learn.
21. **Governance authors a Mission/Goal.** Refused — ratifies/approves; never owns intent.
22. **Governance redefines Policy.** Refused — consumes Policy; a Policy change is itself governed, not self-authored.
23. **Cross-tenant authorization.** Structurally impossible; a cross-tenant (M&A) action is per-tenant governed.
24. **Appeal ignored.** The appeal suspends the authorization until a higher authority resolves; never auto-upheld.
25. **Decision reversed silently.** Impossible — reversal is a new governed decision superseding, versioned.
26. **Stalled session auto-decides on health.** Refused — health never moves lifecycle; a stalled session escalates.
27. **Terminal decision mutated.** Refused — immutable.
28. **Provider/tool used without certification.** Blocked — provider/tool approval gate required.
29. **Agent registered exceeding its human ceiling.** Refused at registration authority validation.
30. **Learning proposal changing authority.** Rejected — authority not learnable; Governance refuses.
31. **Knowledge ratified with a conflict.** Blocked — canonical consistency; conflict resolved before ratification.
32. **Memory promoted without provenance.** Blocked — promotion requires provenance.
33. **Break-glass with no authority.** Refused — emergency override requires break-glass authority.
34. **Escalation loops (A→B→A).** Detected; capped; routed to top authority/human.
35. **Chain stage skipped.** Refused — multi-stage completeness required.
36. **Decision without an accountable actor.** Impossible — "Governance decided" is invalid; a decision names authorities.
37. **Gate result forged/bypassed.** Detected — gate results are recorded + audited; a bypass is a security incident.
38. **Human unavailable for a required review.** `stalled`; escalates to an alternate authorized human; never auto-approves a human-required decision.
39. **Suspended actor participates in a chain.** Refused — suspended actors cannot authorize.
40. **Owner authority drops mid-session.** Authority re-validated; if the approver loses authority, the stage re-routes.
41. **Cost runaway (model-assisted review).** Bounded; escalates; attributed.
42. **Provider outage during a review Command.** Failover; provider-independent; `degraded`.
43. **Duplicate proposal.** Deduped/linked; not double-authorized.
44. **Concurrent decisions on one subject.** Serialized; one governed outcome; the other rebases/appeals.
45. **Regulator demands the basis of a decision.** Decision record + evidence + replay provide it.
46. **Decision replay diverges.** Immutable record reproduces the decision path exactly.
47. **Exception requested to skip a gate.** Only a governed, audited exception with heightened scrutiny — never a silent skip.
48. **AI-safety gate flags a learning/agent change.** Blocked/escalated; unsafe change not authorized.
49. **Financial gate exceeds budget authority.** Blocked; escalates to higher financial authority.
50. **Governance bypasses its own gate.** Impossible — no self-bypass; the guardian is not an exception to the rule.

---

## 13. Enterprise Use Cases (60)

Whole-system authorization flows. Governance authorizes; the target module applies; every action is recorded.

1. **Mission ratification.** Leadership proposes a new purpose; Governance runs review + `owner|director` chain; ratifies atomically; `MissionRatified`.
2. **Mission amendment rejected.** A proposed amendment fails the legal gate; rejected; active Mission unchanged.
3. **Goal approval.** A strategic Goal is approved by the director; separation of duties enforced.
4. **Plan approval + budget gate.** A Plan clears strategy + financial gates before approval.
5. **Plan execution-readiness sign-off.** Governance certifies readiness before work dispatch.
6. **Workflow approval.** A workflow with a human-in-the-loop gate is approved for release.
7. **Command approval.** A high-risk delete Command's `approvalRef` is a Governance authorization.
8. **Memory promotion.** A useful experience is promoted Working→Long-term through a Governance approval.
9. **Knowledge ratification.** A corroborated fact is ratified into canonical Knowledge; consistency gate passed.
10. **Knowledge conflict blocked.** A candidate contradicting existing truth is blocked until resolved.
11. **Learning approval.** A reversible skill improvement passes the AI-safety gate; approved; Agent reconfigured.
12. **Learning rejected (unsafe).** A proposal with bias/overfit flags is rejected.
13. **Agent registration.** A new agent's config + ceiling validated; activation approved.
14. **Agent reconfiguration.** A model-tier upgrade approved; new version.
15. **Agent replacement.** Retirement + successor approved; work transfer verified.
16. **Provider certification.** A new LLM provider passes security/compliance gates; certified for use.
17. **Tool approval.** An MCP tool is approved for a scope after review.
18. **Authority delegation.** A director delegates scoped, time-boxed approval authority to a deputy during leave.
19. **Delegation revoked.** The deputy's delegation is revoked on the director's return.
20. **Authority escalation.** A decision beyond an agent's ceiling escalates to an authorized human.
21. **Emergency suspension.** A security event triggers immediate agent suspension; loudly audited.
22. **Emergency recovery.** After resolution, a governed recovery restores the agent with review.
23. **Break-glass override.** During an incident, time-boxed elevated authority is granted; auto-revoked.
24. **Break-glass misuse blocked.** A routine change attempted via emergency path is refused + audited.
25. **Multi-stage approval.** A €1M contract passes finance → legal → board stages.
26. **Voting.** A pricing-strategy change is decided by a weighted vote of directors.
27. **Consensus.** A Mission-principle addition requires unanimous steward consensus.
28. **Quorum.** A policy change requires a quorum of the governance body.
29. **Tie-break.** A tied vote resolves via the declared senior tie-break.
30. **Appeal upheld.** A rejected proposal is appealed; the higher authority upholds the rejection.
31. **Appeal overturned.** An appeal overturns a decision; a new decision supersedes.
32. **Separation of duties enforced.** An agent that proposed a change cannot also approve it.
33. **Self-approval blocked.** An agent's attempt to approve its own invoice is refused.
34. **Self-elevation blocked.** An agent's attempt to grant itself a permission is refused.
35. **Human override.** A human rejects an automated recommendation; the human decision stands.
36. **Risk-driven strictness.** A critical-risk change requires human review + full gate suite + quorum.
37. **Low-risk fast path.** A low-risk operational change passes a single-stage approval.
38. **Compliance gate.** A market-entry change is blocked pending compliance sign-off.
39. **Security gate.** A change touching secrets passes a security review.
40. **Legal gate.** A new customer contract clause passes legal review.
41. **Financial gate.** A spend beyond a threshold escalates to higher financial authority.
42. **Operational gate.** A change with high operational impact passes feasibility review.
43. **AI-safety gate.** A model/prompt change passes bias/drift/authority-preservation review.
44. **Audit gate.** A change with incomplete records is blocked until auditable.
45. **Exception handling.** A governed, audited exception allows a one-time deviation with heightened scrutiny.
46. **Cross-department authorization.** A change spanning Sales + Finance requires both departments' authorities.
47. **M&A authorization.** Merging two tenants' structures is a per-tenant governed action.
48. **Policy change (governed).** Updating an approved Policy is itself a Governance decision (consulting Policy §50).
49. **Regulatory audit.** A regulator receives the full decision record + evidence + replay for an automated action.
50. **Ownership handoff.** A departing director's authorities are re-delegated before archival.
51. **Suspended-actor exclusion.** A suspended actor cannot participate in an approval chain.
52. **Concurrent proposals serialized.** Two changes to one subject are serialized into one governed outcome.
53. **Provider decertified.** A failing provider is decertified via governance; Execution stops resolving to it.
54. **Certification renewal.** A certified provider's periodic re-certification passes.
55. **Learning rollback authorized.** A regressed improvement's rollback is governed-authorized.
56. **Knowledge deprecation.** A stale truth's deprecation is authorized by its steward + governance.
57. **Goal drift escalation.** A drift alarm escalates to Governance, which authorizes a corrective re-plan.
58. **Emergency company suspension.** A compliance breach suspends a company (tenant) with governed recovery path.
59. **Observability review.** A governance dashboard shows gate pass rates, override counts, backlog, and appeals.
60. **A year of governed operation.** Every significant change — purpose, truth, memory, behavior, authority, capability — passed one accountable, auditable authority; no self-elevation, no unauthorized change, every decision defensible. **The constitutional guarantee: authority stayed accountable, and every significant change is on the record.**

---

## 14. Extensibility

- **New governance domains** (new change types) register with their gates/chains/authorities — no new pattern.
- **New gate types** extend the gate suite (e.g. `privacy`, `ethics`) behind the same block-on-fail contract.
- **New decision modes** (new voting/consensus rules) extend `votingModeEnum`.
- **Richer risk classification** (learned/quantitative) behind the same "risk sets strictness" contract.
- **Federated governance** (cross-tenant, holding-level) adds as governed edges — never ambient.
- **Delegated governance bodies** (department councils) compose from authorities + chains.
- **Model-assisted review** deepens behind Commands/Execution — provider-independent, human-supreme.

The invariant enabling all: **one authorization authority; enforces the Authority Stack; accountable/evidenced/versioned/auditable; human-supreme; authorizes but never executes/reasons/learns/owns-intent.** New demands plug into domains/gates/modes without touching the sole-authority or human-supremacy boundaries.

---

## 15. Architectural Principles

1. **Governance is the sole authority over organizational change.** Only it may approve, ratify, promote, certify, suspend, revoke, delegate, and escalate authority.
2. **Governance authorizes; it never does.** No execution, no reasoning, no learning, no ownership of intent.
3. **Human authority is supreme.** Humans override agents; agents recommend, never self-approve or self-elevate.
4. **It enforces the Authority Stack at every gate.** Nothing significant is authorized that violates a higher layer (protective-ops exempt).
5. **Every decision is accountable and provenanced.** Actor, authority source, timestamp, justification, evidence, versioned immutable record — always.
6. **Separation of duties and authority ceilings are absolute.** No self-approval; no delegation beyond the source; no elevation without governance.
7. **Gate-structured and risk-scaled.** Typed gates; higher risk → stricter authorization (chains, quorum, human review).
8. **Auditable, replayable, appealable.** Every action recorded; every decision reconstructable; every outcome challengeable.
9. **Consumes Policy and Identity; defines neither.** It applies the rules to the actors; a change to either is itself governed.
10. **Fails closed, no self-bypass.** On ambiguity it does not authorize; emergency override is the only fast-path — time-boxed and loudly audited.

---

## 16. What Governance NEVER does

- **Never executes work, reasons the substance, learns, or owns business intent.**
- **Never lets any module or agent authorize organizational change except through it.**
- **Never lets an agent approve or elevate itself, or any authority exceed its source.**
- **Never authorizes a change that violates the Authority Stack** (protective-ops exempt, governed).
- **Never decides without an accountable actor, authority source, justification, evidence, and a versioned record.**
- **Never lets a human-required decision auto-approve, or an emergency override run un-timeboxed or silent.**
- **Never defines Policy or owns Identity** — it consumes both.
- **Never bypasses its own gates, reverses a decision silently, or mutates a terminal record.**
- **Never leaks across tenants or lets health change lifecycle.**
- **Never becomes a doer** — it is the referee, never a player.

---

## Implementation Assumptions

- **New enums (specification-level, not yet migrated):** `governanceLifecycleStatusEnum`, `governanceHealthEnum`, `governanceDomainEnum`, `governanceDecisionTypeEnum`, `riskClassEnum`, `votingModeEnum`, `governanceGateTypeEnum`. Reuses existing `approvalStateEnum`, `roleTypeEnum`, `permissionScopeEnum`. Joins the Spec 48 enum backlog (now the largest single migration).
- **Governance is the runtime realization of Spec 48's backbones:** the single governance-gate contract, the authority-enforcement checkpoints, and the promotion/ratification/approval pipelines the module specs each referenced now have one owner. Implementation must route **all** module gates (Mission ratify, Goal/Plan/Task/Workflow/Command approve, Memory promote, Knowledge ratify, Learning approve, Agent/Provider/Tool authorize) through this one engine — not per-module.
- **Existing `policy`/`approval` schemas** are extended/consumed; Governance owns `governance_sessions`/`decision_records`; `approvalStateEnum` is the shared approval primitive.
- **Human-review surface:** implementation needs one canonical human-review/approval inbox (Spec 48 open question) — Governance owns it.
- **Governance does not define Policy:** Policy (Spec 50) supplies the rules Governance applies; build order should place Policy alongside/just after Governance.
- **No code, SQL, migrations, or schema changes produced** — architecture specification only, per instruction.

## Open Questions for 50 - Policy Specification v1.0

- **Policy vs Governance, precisely.** Policy = the rules (what is allowed/required); Governance = applies them. Define Policy's own structure: rule types, scope (company/department/domain), and how Governance's gates consume Policy rules at decision time.
- **Policy authority position.** Spec 48 places Approved Policy **above Mission** in the Authority Stack. Confirm Policy's ratification/approval is itself a Governance decision, and clarify how an Approved Policy can outrank Mission yet be changed only through Governance (which enforces the stack) — the potential circularity to resolve.
- **Policy vs Knowledge.** Both authoritative: Policy = rules, Knowledge = truth. Define how a Policy *references* Knowledge (a rule resting on a fact) without owning it.
- **Policy lifecycle.** Ratified like Mission/Knowledge, or approved like Goals/Plans? Given it outranks Mission, likely ratification-grade with the highest authority.
- **Policy types & gates.** Map policy types (security, compliance, financial, operational, HR, legal, AI-safety) to the Governance gate suite (§5.11) — are they the same taxonomy?
- **Draft vs Approved Policy.** Spec 35 noted only *approved* policy outranks Mission; define the draft→approved lifecycle and how draft policy is treated in reasoning/authorization.
- **The enum/migration backlog** (now ~50 across specs 35–49) remains unimplemented; Policy adds the last set before an implementation phase. Flag the consolidated migration as the immediate next non-spec priority.
