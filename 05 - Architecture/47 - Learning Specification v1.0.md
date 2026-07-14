# Learning Specification v1.0

> Stage 14 — Learning module, complete Enterprise Architecture Specification.
> This document is the permanent architectural reference for Learning in Hebun AI.
> It specifies how the platform improves over time **without ever changing organizational authority.** It adds no implementation. It defines boundaries.

**Status:** Definitive · **Scope:** Learning module only · **Grounded in:** the schema primitives in `src/db/schema/_base.ts` (`rootColumns`, `tenantColumns`) and `_enums.ts` (`lifecycleStatusEnum`, `approvalStateEnum`, `providerStatusEnum`, `roleTypeEnum`, `permissionScopeEnum`, `memoryKindEnum`), and the Identity (34) through Reasoning (46) Specifications v1.0.

**Position in the cognitive substrate:**

```
Reasoning (46) — THINKS (produces conclusions)
Execution (41) — ACTS (produces effects/outcomes)
       │  outcomes + traces + human feedback
       ▼
Learning (this doc) — IMPROVES future behavior — PROPOSES governed changes; commits NONE itself
       │  improvement proposals
       ▼
Governance / Agent-reconfig / Memory-promotion / Knowledge-ratification — APPLY (governed)
```

**Authority precedence (unchanged, absolute):**

```
Law → Security/Compliance → Approved Policy → Mission → Goals → Plans → Tasks → Workflows → Commands → Execution → Agent → Working Memory → Long-term Memory → Knowledge → Reasoning → Learning
```

> Learning sits at the very bottom as an *improvement process*, not a store, a decider, or a commander. It **consumes** traces/outcomes/feedback and the stores, **proposes** improvements, and **changes nothing on its own**. Every improvement is governed, versioned, reversible, and provenanced. **Learning proposes; Governance approves.**

Learning is the module that lets Hebun **get better over time — while its authority stays exactly where it was.** **Reasoning thinks; Execution acts; Learning improves future behavior.** It compares expected vs actual, analyzes outcomes and root causes, calibrates confidence, and proposes improvements to skills, procedures, workflows, and prompts — but it **never changes permissions, authority, Identity, Mission, Goals, Plans, or Policies, and never edits Knowledge or Long-term Memory directly.** It **proposes**; Governance **approves**.

**Critical clarification — Learning is an improvement process, not a store, a mind, or a decider:**

> Learning is **NOT** Memory. Learning is **NOT** Knowledge. Learning is **NOT** Reasoning. Learning is **NOT** Decision.
>
> Learning is the **improvement engine**: it reads what happened (outcomes), what was thought (reasoning traces), what humans said (feedback), and the stores, then **proposes governed improvements** to future behavior. It **remembers nothing durably of record** (Memory does), **holds no truth** (Knowledge does), **draws no conclusions to act on now** (Reasoning does), and **commits nothing** (the governed chain does). It only makes the *next* time better — safely, reversibly, and with approval.

---

## 1. Purpose

### Why the Learning layer exists

The platform now thinks (Reasoning), acts (Execution), remembers (Memory), and holds truth (Knowledge). But a system that never improves repeats its mistakes: an agent mis-qualifies leads the same way forever, a workflow keeps failing at the same step, a prompt keeps producing weak output, confidence stays miscalibrated. Something must close the loop — observe outcomes, compare them to what was expected, find why, and **improve future behavior** — without becoming a backdoor that silently changes what the company is, what it's allowed to do, or what it holds true. Learning is that loop.

Learning is the **system of record for how Hebun improves: the governed process that turns outcomes, traces, and feedback into versioned, reversible, provenanced improvement proposals** to skills, procedures, workflows, prompts, and confidence calibration. It is the improvement engine that makes the digital workforce better tomorrow than today — and it is deliberately **powerless to change authority**: it can propose that an agent get better at what it already may do; it can never propose (or effect) that an agent be *allowed* more. Every improvement it proposes is applied only by governance, only after review, and can always be rolled back.

Without a Learning layer, six things break: no improvement (mistakes repeat), no calibration (confidence stays wrong), no drift/regression detection (behavior degrades silently), no safe improvement path (changes happen ad-hoc or not at all), no reversibility (a bad change can't be undone), and — the dangerous failure — improvement blurs into authority change (a "learned" behavior silently expands what an agent does). Learning closes that gap and holds the **improvement boundary**: it makes future behavior better through governed, reversible, provenanced proposals — and it **never** touches authority, identity, intent, truth, or permissions.

### Business problem it solves

1. **Continuous, safe improvement.** The workforce must improve from experience — better skills, procedures, workflows, prompts, calibration — without ad-hoc, unreviewed, irreversible changes. Learning provides a governed, reversible improvement path.
2. **Authority-preserving learning.** Improvement must never become authority creep. Learning strictly separates *getting better at allowed work* (proposable) from *being allowed more* (never). It **never changes permissions, authority, Identity, Mission, Goals, Plans, or Policies.**
3. **Anti-drift, anti-bias safety.** Learning from outcomes risks reinforcing bias, overfitting, or hallucinations, and forming feedback loops. Learning must **detect drift, regression, bias, overfitting, hallucination reinforcement, and feedback loops** — and never treat correlation as causation or let failed learning silently become behavior.

### Its responsibility

- Own the lifecycle of every **learning session** and **improvement proposal**: `created → collecting → analyzing → proposing → under-review → approved → applied → rolled-back → archived` (governed), separate from health `unknown → healthy / degraded / diverging` (observed).
- **Consume** reasoning traces, execution outcomes, human feedback, Working Memory, Long-term Memory, and Knowledge — read-only.
- Run the **improvement analysis**: feedback collection, expected-vs-actual comparison, outcome analysis, root-cause analysis, confidence calibration, pattern discovery, trend/drift/regression/bias detection, safe/sandbox/shadow evaluation.
- **Produce** improvement proposals: skill improvements, procedure improvements, workflow improvements, prompt improvements, confidence calibration, and optimization recommendations — each **versioned, reversible, provenanced, auditable.**
- **Propose, never apply.** **Learning proposes; Governance approves.** Applied improvements land only via governed acceptance (Agent reconfiguration, Memory promotion, Knowledge ratification, Workflow revision) — Learning writes none of them directly.
- Enforce **safe learning**: never change authority/identity/intent/truth/permissions; detect and refuse **drift, regression, bias, overfitting, hallucination reinforcement, and feedback loops**; never treat **correlation as causation**; **failed learning never becomes organizational behavior automatically.**
- Support **learning validation, human review, approval, rollback, versioning, provenance, auditability, replay, quality, cost governance, and provider independence.**
- Emit Learning events; be consumed by Governance, agents, and the improvement-applying modules.

### What is explicitly NOT its responsibility

- **Learning never changes authority, permissions, Identity, Mission, Goals, Plans, or Policies.** It can propose better *behavior within* authority; it can never change *authority itself*.
- **Learning never edits Knowledge or Long-term Memory directly.** It proposes promotions/corrections; Knowledge ratification and Memory promotion are governed, owned by those modules.
- **Learning never applies its own proposals.** It proposes; Governance approves; the target module applies. There is no self-apply path.
- **Learning is not Memory, Knowledge, Reasoning, or Decision.** It stores no truth/experience of record, draws no act-now conclusions, commits no decisions.
- **Learning never treats correlation as causation, nor reinforces hallucination/bias.** It must actively detect and refuse these; unsafe learning is rejected.
- **Learning never makes a change irreversible.** Every applied improvement is versioned and rollback-able.

---

## 2. Mental Model

Learning is **the training, coaching, and continuous-improvement function of the digital company** — the equivalent of an HR-plus-QA loop for human employees, but for agents, procedures, and prompts. It watches how work turned out, compares it to what was expected, figures out *why* it went well or badly, and writes up **improvement proposals**: "coach this agent on this skill," "fix this step in this procedure," "recalibrate this confidence," "revise this prompt." It files nothing into the handbook itself (Knowledge), rewrites no diary (Memory), signs no contract (Decision) — it hands proposals to management (Governance), which approves and rolls them out. And it is bound by a hard rule human HR shares: **coaching makes you better at your job; it never gives you more authority.** A promotion is a governed decision, never an automatic result of doing well.

The mental model in one line: **Learning is the governed improvement engine that consumes outcomes, reasoning traces, and feedback, discovers what to improve, and produces versioned, reversible, provenanced improvement proposals — while changing no authority, identity, intent, truth, or permission itself, applying nothing on its own, and actively guarding against drift, bias, overfitting, hallucination reinforcement, and false causation.**

Eight properties define the model:

- **Improving, not deciding or storing.** Learning makes the *next* action better. It stores no truth/experience of record and commits no decision — it proposes improvements.
- **Proposing, not applying.** Its output is a proposal. Application is governed and owned by the target module. **Learning proposes; Governance approves.**
- **Authority-preserving.** It can improve behavior within authority; it can never change authority, permissions, identity, or intent. This is the defining safety property.
- **Consuming, not editing.** It reads traces/outcomes/feedback/Memory/Knowledge/Working Memory; it edits none of them directly.
- **Versioned, reversible, provenanced.** Every improvement it proposes (and any applied) is versioned, rollback-able, and traceable to the evidence that motivated it.
- **Safety-first.** It actively detects drift, regression, bias, overfitting, hallucination reinforcement, and feedback loops; it never treats correlation as causation; it evaluates in sandbox/shadow before proposing risky changes.
- **Human-supervised.** Human review and approval gate every improvement; failed or unsafe learning never becomes behavior automatically.
- **Bounded.** Cost-governed, provider-independent, tenant-isolated; it improves within the same authority stack it can never alter.

Learning sits **beneath everything as the improvement loop and above nothing.** It reads the outputs of thinking (Reasoning), acting (Execution), and remembering (Memory), plus human feedback and truth (Knowledge), and it feeds **proposals** into governance and the improvement-applying modules. It is the hinge between *what happened* and *how we do better next time* — and it is exclusively about *proposing governed improvement to behavior*, never *changing authority, storing truth, committing decisions, or applying itself*.

---

## 3. Core Domain Objects

Learning introduces session and proposal objects. All reuse `_base.ts` contracts; Learning is a process — its durable artifacts are proposals and audit records, not a store of truth/experience:

- **`rootColumns`** / **`tenantColumns`**. `createdBy` resolves to an actor reference (Identity §3.9); every session/proposal is tenant-scoped.

---

### 3.1 Learning Session

- **Purpose.** One bounded improvement analysis — from a feedback/outcome window to a set of improvement proposals. The primary process object.
- **Table.** `learning_sessions` (`tenantColumns`) — a process/audit record.
- **Conceptual fields.**
  - `id` — Learning Session ID.
  - `tenantId` — owning Company (Identity §3.1).
  - `learningType` — `learningTypeEnum` (§3.3): `personal | organizational | cross-agent`.
  - `subjectRef` — what is being improved (an agent, a procedure, a workflow, a prompt, a calibration target).
  - `inputs` — the consumed evidence (reasoning traces, execution outcomes, human feedback, Memory, Knowledge, Working Memory) — read-only references.
  - `analysis` — expected-vs-actual, outcome, root-cause, pattern/trend results (§5).
  - `safetyChecks` — drift/regression/bias/overfitting/hallucination-reinforcement/feedback-loop detection results (§5.20).
  - `proposals` — the produced Improvement Proposals (§3.2).
  - `learningLifecycleStatus` — governed lifecycle (`learningLifecycleStatusEnum`, §6).
  - `learningHealth` — health (`learningHealthEnum`, §6): `unknown | healthy | degraded | diverging`.
  - `costBudget` — cost bound (§5.24).
  - `correlationId` — threads the session and its Commands.
  - base audit fields (auditable; stores no truth/experience of record).
- **Required.** `tenantId`, `learningType`, `subjectRef`, `inputs`, `learningLifecycleStatus`, `correlationId`.
- **Statelessness of record.** The session **owns no durable truth/experience**; it produces proposals (durable, governed) and an audit trail. Improvements land in *other* modules by governed acceptance.
- **Example.** Session: type `personal`, subject `Atlas` (agent), inputs {100 lead-qualification outcomes, reasoning traces, a human correction}, → proposal "improve `qualify-lead` procedure step 3; recalibrate confidence downward 8%."

### 3.2 Improvement Proposal

- **Purpose.** A governed, versioned, reversible proposal to improve future behavior. The primary output.
- **Realization.** `improvementProposal {id, proposalType, target, change, provenance, evidence, expectedEffect, risk, rollbackPlan, sandboxResult?, shadowResult?, approvalRef, decision}`. `proposalType ∈ {skill | procedure | workflow | prompt | calibration | optimization}`. **Every proposal is versioned, auditable, reversible, and has provenance** (§7). It targets a module that *applies* it under governance (Agent reconfig, Memory promotion, Knowledge ratification, Workflow revision) — Learning never applies it.
- **Rule.** A proposal that would change authority/identity/intent/truth/permissions is **invalid** — Learning cannot even propose those (§7).

### 3.3 Learning Type (personal / organizational / cross-agent)

- **Personal Learning.** Improves a single agent's skills/procedures/prompts/calibration; scoped to that agent (bounded by its ceiling — improvement never raises it).
- **Organizational Learning.** Improves company-wide behavior (shared procedures, standard workflows/prompts, org-level calibration); higher governance bar.
- **Cross-Agent Learning.** Distills an improvement discovered in one agent for governed sharing to others (within scope/permissions) — never ambient propagation.

### 3.4 Feedback Record & 3.5 Reinforcement Signal

- **Feedback Record.** A unit of input evidence: human feedback, an execution outcome, a reasoning-trace-vs-outcome comparison, a success/failure/counterexample.
- **Reinforcement Signal.** The derived positive/negative signal from a feedback record — **positive learning** (reinforce what worked), **negative learning** (avoid what failed), **counterexamples**, **failure learning**, **success learning**. Signals are provenance-tagged and quality-gated; a signal from a mistaken success (a bad outcome that looked good) is caught by anti-bias/anti-drift checks (§5.20).

### 3.6 Learning Version & Rollback Record

- **Purpose.** The immutable record of an improvement's versions and any rollback.
- **Realization.** Each applied improvement has a `learningVersion` and a `rollbackPlan`/`rollbackRecord`. **Every learned improvement is versioned and reversible**; rollback restores the prior behavior version, audited.

---

## 4. Ownership

- **Learning owns proposals and its audit trail — not behavior, not authority.** Learning owns the *improvement proposals* and *session records*; the *behavior* it improves is owned by the target module (Agent, Memory, Knowledge, Workflow), and **authority is owned by Identity/Governance — never by Learning.**
- **Personal learning is scoped to the agent + its human ceiling.** Improving an agent never raises its authority; a proposal is accountable to the agent's human owner and the steward of the improved artifact.
- **Organizational/cross-agent learning is governed at scope.** Company-wide improvements require scope-appropriate governance; cross-agent sharing is explicit and permissioned (never ambient).
- **Application ownership stays with the target.** When a proposal is approved, the *target module applies it* under its own governance (Agent §5.8 reconfiguration; Memory §5.9 promotion; Knowledge §5.13 ratification; Workflow §6 revision). Learning never owns the applied change.
- **Bounded by Identity/Permissions.** A learning session reads only inputs the subject's scope/permissions allow; it proposes only within the authority stack — it can never propose an authority change.
- **Human supervision.** Every improvement is human-reviewable and approval-gated; **failed learning never becomes organizational behavior automatically.** Humans own the acceptance.
- **No cross-tenant learning.** A session never spans companies; cross-tenant improvement sharing is a governed export, never ambient.

---

## 5. Learning Architecture

The improvement engine's internal architecture. All are analysis/proposal mechanics; none changes authority, edits a store, applies itself, or commits a decision.

### 5.1 Learning Engine

- The engine drives each session: **collect feedback → compare expected vs actual → analyze outcomes → root-cause → detect patterns/trends → run safety checks → propose improvements (versioned, reversible) → submit for governed approval.** It runs analysis via Commands performed by Execution (LLM/analytics) under bounds; it applies nothing.

### 5.2 Learning Sessions (§3.1) & 5.3 Feedback Collection

- **Feedback collection** gathers reasoning traces, execution outcomes, human feedback, and store references into a session's input set — read-only, provenance-tagged.

### 5.4 Expected vs Actual Comparison & 5.5 Outcome Analysis

- Compares what was **expected** (a conclusion's predicted outcome, a task's acceptance, a plan's target) against what **actually** happened (execution results, human judgment). Outcome analysis classifies success/failure/partial and quantifies the gap.

### 5.6 Root Cause Analysis

- For gaps, finds the **root cause** (a weak procedure step, a bad prompt, a miscalibrated confidence, a wrong assumption) — using Reasoning-style analysis, but producing an *improvement proposal*, not an act-now conclusion. **Correlation is never treated as causation** (§5.20): a correlation is a hypothesis to test (sandbox/shadow), not a proven cause.

### 5.7 Confidence Calibration

- Closes the loop on Reasoning's confidence: compares stated confidence to actual correctness over many sessions and proposes **calibration** adjustments — improving future confidence estimates without mutating Reasoning at runtime (a governed calibration update).

### 5.8 Skill / 5.9 Procedure / 5.10 Workflow / 5.11 Prompt Improvement

- Produces targeted proposals: **skill** (agent proficiency), **procedure** (procedural-memory steps), **workflow** (orchestration structure), **prompt** (reasoning/LLM prompts). Each is a versioned, reversible proposal to the owning module — applied only by governance.

### 5.12 Organizational / 5.13 Personal / 5.14 Cross-Agent Learning

- Realizes `learningTypeEnum` (§3.3): personal (one agent), organizational (company-wide), cross-agent (governed distillation/sharing). Higher scope → higher governance bar.

### 5.15 Reinforcement Signals — Positive / Negative / Counterexamples / Failure / Success

- Derives **reinforcement signals** (§3.5): positive (reinforce), negative (avoid), counterexamples (boundary cases), failure learning (what broke and why), success learning (what worked and why). All provenance-tagged and quality-gated against bias/drift.

### 5.16 Pattern Discovery & 5.17 Trend Detection

- Discovers **patterns** (recurring success/failure shapes) and **trends** (behavior changing over time) across many sessions — the basis for improvement, always validated before proposal.

### 5.18 Drift / 5.19 Regression / 5.20 Bias / Overfitting / Hallucination-Reinforcement / Feedback-Loop Detection (Safety Suite)

- **Learning must detect** and refuse: **drift** (behavior wandering from intent/baseline), **regression** (an improvement making things worse), **bias** (systematic skew in feedback/outcomes), **overfitting** (learning to a small/unrepresentative sample), **hallucination reinforcement** (learning to repeat a fabricated "success"), and **feedback loops** (the system learning from its own unvalidated outputs). A detected unsafe condition **blocks the proposal** and escalates. **Correlation is never treated as causation.**

### 5.21 Safe Learning: Sandbox & Shadow

- **Sandbox learning**: a proposed improvement is evaluated in an isolated sandbox (no real effect) before proposal/approval. **Shadow learning**: the improvement runs in shadow (alongside current behavior, results compared, no live effect) to measure real impact safely. **Failed sandbox/shadow evaluation blocks the improvement** — it never becomes behavior.

### 5.22 Learning Validation, 5.23 Human Review, Approval, Rollback

- **Validation** checks a proposal for safety (safety suite), authority-preservation (no authority/permission/identity/intent/truth change), reversibility, and provenance. **Human review + approval** (governed) gate acceptance. **Rollback**: every applied improvement can be reversed to the prior version, audited. **Failed learning never becomes organizational behavior automatically.**

### 5.24 Learning Versioning, Provenance, Auditability, Replay, Quality, Cost Governance, Provider Independence

- **Versioning/provenance/auditability**: every proposal and applied improvement is versioned, provenanced (to the evidence), and immutably audited. **Replay**: a learning session is replayable from its inputs for audit. **Quality**: proposal quality scored (evidence strength, sandbox/shadow result, safety). **Cost governance**: analysis cost attributed and bounded. **Provider independence**: analysis LLM/model calls are Commands via Execution; no bound SDK; multi-model where useful.

### 5.25 The improvement boundary

- Learning **analyzes and proposes** but **changes no authority, edits no store, applies nothing, commits no decision.** Its proposals become behavior only through the target module's governance. This boundary is why the company can continuously improve — coaching agents, fixing procedures, recalibrating confidence — without that improvement ever silently expanding authority, corrupting truth, or acting on its own.

---

## 6. Lifecycle

A Learning session/proposal carries **two orthogonal state dimensions** (mirroring prior specs):

- **Lifecycle** (`learningLifecycleStatusEnum`) — *where the learning is in its governed existence.* Governed transitions only.
- **Health** (`learningHealthEnum`) — *how sound the in-flight learning is.* Auto-derived; never a lifecycle transition.

Governing rule: **learning consumes evidence read-only, analyzes safely (anti-drift/bias/overfitting/hallucination/loop, no false causation), proposes versioned reversible improvements, and applies nothing — Governance approves and the target module applies.**

### 6.1 Lifecycle dimension

**`learningLifecycleStatusEnum`** (specified): `created | collecting | analyzing | proposing | under-review | approved | applied | rolled-back | rejected | archived`.

| Lifecycle state | Meaning | Mutable? | Changes behavior? |
|---|---|---|---|
| **created** | Session opened for a subject/window | Yes (pre-collect) | No |
| **collecting** | Gathering feedback/outcomes/traces (read-only) | Append | No |
| **analyzing** | Expected-vs-actual, root-cause, patterns, safety checks | Append | No |
| **proposing** | Improvement proposals formed (sandbox/shadow evaluated) | Append | No |
| **under-review** | Human/Governance review of proposals | No | No |
| **approved** | Proposal approved (not yet applied) | No | No |
| **applied** | Target module applied the improvement (governed) | No (versioned) | **Yes** (governed, reversible) |
| **rolled-back** | Applied improvement reversed | No (immutable) | Reverted |
| **rejected** | Proposal rejected | No (terminal) | No |
| **archived** | Session/proposal retired | No (immutable) | No |

**Lifecycle transitions (governed):**

| Transition | From → To | Precondition | Effect | Emits |
|---|---|---|---|---|
| **Create** | ∅ → created | Learning opened for a subject/window | session created; `learningHealth=unknown` | `LearningSessionCreated` |
| **Collect** | created → collecting | Inputs identified within scope/permissions | feedback/outcomes/traces gathered (read-only); health tracking begins | `LearningCollecting` |
| **Analyze** | collecting → analyzing | Inputs sufficient | expected-vs-actual, root-cause, patterns, **safety suite** run | `LearningAnalyzing` |
| **Propose** | analyzing → proposing | Analysis safe (no unresolved drift/bias/overfit/hallucination/loop; causation tested) | versioned reversible proposals formed; sandbox/shadow evaluated | `LearningProposed` |
| **Submit for review** | proposing → under-review | Proposals valid (authority-preserving, reversible, provenanced) | routed to Governance/human | `LearningUnderReview` |
| **Approve** | under-review → approved | Governance/human approves | proposal accepted (application authorized) | `LearningApproved` |
| **Reject** | proposing/under-review → rejected | Unsafe/invalid/rejected | nothing applied | `LearningRejected` |
| **Apply** | approved → applied | Target module applies under its governance | improvement live (versioned, reversible) | `LearningApplied` |
| **Rollback** | applied → rolled-back | Regression detected or governed reversal | prior behavior version restored | `LearningRolledBack` |
| **Archive** | rejected/rolled-back/applied → archived | Governed retirement of the record | terminal | `LearningArchived` |

Every transition is governed and audited. **Health never appears in this table.** **`applied` is performed by the target module under governance — never by Learning itself.** No transition changes authority.

### 6.2 Health dimension

**`learningHealthEnum`** (specified): `unknown | healthy | degraded | diverging`.

| Health state | Meaning | Set how |
|---|---|---|
| **unknown** | No sufficient signal (default; also terminal) | default / on clear |
| **healthy** | Sufficient representative evidence, safety checks passing, causation tested | auto |
| **degraded** | Weak/biased/insufficient evidence, low proposal quality | auto |
| **diverging** | Drift/regression/overfitting/hallucination-reinforcement/feedback-loop detected | auto |

**Health rules:**

- **Scope.** Health applies **only** to active phases (`collecting | analyzing | proposing | under-review`). Before collecting it is `unknown`; terminal states clear it to `unknown`, frozen.
- **Automatic.** Derived from **evidence representativeness/quality, safety-suite results, causation-test outcomes, proposal quality.** Never manual.
- **No lifecycle effect.** **Health never changes lifecycle.** A `diverging` session does not auto-apply or auto-reject on its own signal; it blocks proposal/escalates via a governed transition. Only governed transitions move lifecycle.
- **Observability, not authority.** Health flags learning quality/safety; it never applies or reverses on its own.

### 6.3 Terminal-state rules

- **rejected / rolled-back / archived** are terminal. **applied** improvements are live but **versioned and reversible** — never irreversible.
- **Every learned improvement is versioned, auditable, reversible, and provenanced**; rollback restores the prior behavior version.
- **Failed learning never becomes organizational behavior automatically** — rejection/rollback are the safety terminals; nothing applies without approval.
- Terminal sessions carry `learningHealth = unknown` (cleared, frozen); the session audit + provenance retained for replay.

---

## 7. Constraints

Structural and semantic constraints, enforced by the module — not by convention.

**Structural / hard invariants (enforced):**

1. **Never changes authority/permissions/identity/intent/truth.** **Learning never changes permissions, authority, Identity, Mission, Goals, Plans, or Policies.** No such proposal is even valid; no such write path exists.
2. **Never edits Knowledge or Long-term Memory directly.** **Learning never edits Knowledge or Long-term Memory directly** — it proposes governed promotions/corrections those modules own.
3. **Proposes, never applies.** **Learning proposes; Governance approves.** Application is the target module's under governance; Learning has no self-apply path.
4. **Every improvement versioned, auditable, reversible, provenanced.** No un-versioned, un-audited, irreversible, or provenance-less improvement.
5. **Consume-only inputs.** Learning **consumes** reasoning traces, execution outcomes, human feedback, Working Memory, Long-term Memory, Knowledge — read-only; it edits none.
6. **Produces improvement artifacts only.** Its outputs are improvement proposals, confidence calibration, skill/procedure/workflow/prompt improvements, and optimization recommendations — nothing that acts, decides, or stores truth.
7. **Tenant isolation.** `tenantId` NOT NULL; no cross-tenant learning; inputs same-tenant.

**Semantic (module-enforced) — the safety guards:**

8. **Correlation ≠ causation.** **Correlation is never treated as causation**; a correlation is a hypothesis to test (sandbox/shadow), never an applied cause.
9. **Failed learning never auto-applies.** **Failed learning never becomes organizational behavior automatically**; sandbox/shadow/validation failures block application.
10. **Must detect and refuse unsafe learning.** **Learning must detect drift, regression, bias, overfitting, hallucination reinforcement, and feedback loops** — a detected unsafe condition blocks the proposal and escalates.
11. **Authority-preservation of proposals.** Any proposal that would change authority/identity/intent/truth/permissions is **invalid** — improvement is only ever *better behavior within* authority, never *more* authority.
12. **Human review + approval gate.** Every improvement is human-reviewable and governance-approved; humans own acceptance and can always override.
13. **Reversibility mandatory.** Every applied improvement has a rollback plan and can be reversed; nothing learned is irreversible.
14. **Provider-independent, bounded.** Analysis via Commands/Execution; cost-governed; no bound SDK.
15. **Lifecycle/health orthogonal; health scoped/derived.** Separate fields; health non-`unknown` only active; auto-derived; never writes lifecycle.
16. **No commit/effect path.** Learning has no edge that commits a decision, mutates a store, changes authority, or performs an effect.

---

## 8. Validation

Validation runs at gates: **collection**, **analysis (safety suite)**, **proposal**, **review/approval**, and **application/rollback**. Learning fails closed: on ambiguity it does not propose an unsafe change and never applies.

**Collection validation:**

- Inputs are within the subject's scope/permissions and same-tenant; provenance-tagged; representative enough to avoid overfitting (small/biased samples flagged `degraded`).

**Analysis / safety validation (the critical gate):**

- **Safety suite** runs: drift, regression, bias, overfitting, hallucination-reinforcement, feedback-loop detection. Any positive → `diverging` health → block proposal/escalate.
- **Causation test:** a correlation must be validated (sandbox/shadow/controlled comparison) before it can motivate a proposal; unproven causation → hypothesis only, not a proposal.
- **Feedback-loop check:** the session must not be learning primarily from the system's own unvalidated outputs (self-reinforcement) — flagged and blocked.

**Proposal validation:**

- **Authority-preservation:** the proposal changes no authority/permission/identity/intent/truth — else invalid and rejected.
- **Reversibility:** a rollback plan exists.
- **Provenance:** the proposal traces to the evidence that motivated it.
- **Sandbox/shadow:** risky proposals carry a sandbox/shadow evaluation showing safe, positive impact; a failed evaluation blocks the proposal.

**Review/approval validation:**

- Governance/human with scope-appropriate authority approves; organizational/cross-agent proposals carry a higher bar; separation of duties (the proposer's evidence is reviewed independently).

**Application/rollback validation:**

- Application is performed by the *target module* under its governance (Learning does not apply). On regression detection post-application, rollback restores the prior version; the reversal is audited.

**Health validation (continuous):**

- `learningHealth` non-`unknown` only active; unresolved/unsafe signals yield `degraded`/`diverging`; a health update never moves lifecycle.

Only a safe, authority-preserving, reversible, provenanced, approved proposal is applied (by the target). A failure blocks/escalates with the violated rule recorded; failed learning never becomes behavior.

---

## 9. Relationships

Learning consumes outputs and stores (read-only), proposes improvements to the improvement-applying modules, and runs via Execution. It changes no authority, edits no store, applies nothing.

| Module | Relationship to Learning |
|---|---|
| **Reasoning** | **A consumed input.** Learning reads reasoning traces + conclusion-vs-outcome to improve future reasoning (prompts, calibration) — it **never mutates Reasoning at runtime**; a calibration/prompt improvement is a governed change applied to the reasoning configuration, not a live edit. |
| **Execution** | **A consumed input and the analysis performer.** Learning reads execution outcomes; its analysis runs via Commands performed by Execution; it **performs no effect** itself. |
| **Long-term Memory** | **Consumed input and a proposal target (governed).** Learning reads experience; it **never edits Memory directly** — an improved procedure is proposed for governed **promotion** to procedural memory (Memory §5.9), owned by Memory. |
| **Knowledge** | **Consumed input and a proposal target (governed).** Learning reads truth; it **never edits Knowledge directly** — a validated fact is proposed for governed **ratification** (Knowledge §5.13), owned by Knowledge. |
| **Working Memory** | **Consumed input.** Learning reads context/traces from sessions; it stores nothing there of record. |
| **Agent** | **A subject and a proposal target (governed).** Personal learning proposes **skill/procedure improvements** applied via governed **Agent reconfiguration** (Agent §5.8) — **never raising the ceiling** (Agent §5.6: learning refines skill, never authority). |
| **Workflow** | **A proposal target (governed).** Workflow improvements are proposed for governed **Workflow revision** (Workflow §6); Learning never edits a Workflow directly. |
| **Mission / Goals / Plans / Policies** | **Consumed as context; never changed.** Learning may inform these (via proposals to their governance) but **never edits** them; changing intent/rules is those modules' governed acts. |
| **Governance** | **The approver.** Every improvement is reviewed/approved by Governance/humans; **Learning proposes, Governance approves.** Governance owns acceptance, rollback authorization, and safety adjudication. |
| **Identity / Permissions** | **Bound and never changed.** Constrain what a session reads and proposes; **Learning never changes them.** |
| **Human review** | **The override and acceptance authority.** Humans review/approve/reject/rollback; failed learning never auto-applies. |
| **Audit / Observability** | Retain proposal/version/provenance and expose learning quality/safety metrics (§5.24). |

**The improvement loop:** `Reasoning (thinks) + Execution (acts) + human feedback + Memory/Knowledge → Learning (proposes governed improvements) → Governance approves → target module applies (versioned, reversible)`. Learning is the improvement node that makes future behavior better — and never the node that changes authority, truth, intent, or applies itself.

### 9.1 Explicit distinction tables

**Reasoning vs Learning:**

| | Reasoning | Learning |
|---|---|---|
| Time horizon | Now (this question) | Future (next time) |
| Output | Conclusion (recommendation) | Improvement proposal |
| Consumes | Truth/experience/context | Outcomes/traces/feedback |
| Commits/applies? | No (chain commits) | No (Governance approves, target applies) |
| Stateful? | Stateless | Process; owns proposals+audit, not behavior |

**Knowledge vs Learning:**

| | Knowledge | Learning |
|---|---|---|
| Holds | Canonical truth | Nothing of record (proposals + audit) |
| Role | States what is true | Proposes how to do better |
| Mutates truth? | Is truth (ratified) | **Never edits Knowledge**; proposes ratification |
| Authority | Authoritative (about truth) | No authority; proposes only |

**Memory vs Learning:**

| | Long-term Memory | Learning |
|---|---|---|
| Holds | Retained experience | Nothing of record |
| Direction | What happened | How to improve from it |
| Writes? | Governed promotion (owns experience) | **Never edits Memory**; proposes promotion |
| Conflict | May conflict | N/A (proposes, doesn't store) |

**Execution vs Learning:**

| | Execution | Learning |
|---|---|---|
| Acts? | Yes (performs Commands) | No (proposes) |
| Effect | Real-world effects | No effect; improvement proposals |
| Time | Now | Future behavior |
| Runtime | The engine that acts | Reads Execution's outcomes; runs analysis *via* Execution |

**Personal Learning vs Organizational Learning:**

| | Personal Learning | Organizational Learning |
|---|---|---|
| Subject | One agent's skills/procedures/prompts | Company-wide procedures/workflows/prompts/calibration |
| Scope | The agent (bounded by its ceiling) | The company / department |
| Governance bar | Agent-steward + governance | Higher (org-scope governance) |
| Authority effect | None (never raises the agent's ceiling) | None (never changes org authority/policy) |
| Sharing | May be distilled cross-agent (governed) | Applies broadly (governed) |

**Constant across all:** Learning improves *behavior within authority*; it never changes *authority*, edits a store, applies itself, or commits.

---

## 10. Events

Every Learning transition emits exactly one domain event. Governance, target modules, agents, and observability subscribe. Payloads carry `actorRef`, `tenantId`, `learningSessionId`, `learningType`, `subjectRef`, `correlationId`, and `occurredAt`.

| Event | Trigger | Payload (beyond envelope) | Consumers | Business impact |
|---|---|---|---|---|
| `LearningSessionCreated` | Session opened | subjectRef, learningType | Observability | Improvement analysis begins |
| `LearningCollecting` | Inputs gathered | inputRefs (traces/outcomes/feedback) | Observability | Evidence assembled (read-only) |
| `LearningAnalyzing` | Analysis running | analysisScope | Observability | Root-cause/patterns in progress |
| `LearningSafetyFlagRaised` | Drift/regression/bias/overfit/hallucination/loop detected | flagType, detail | **Governance (high severity)**, Notifications | Unsafe learning blocked/escalated |
| `LearningCausationUntested` | Correlation lacking causation proof | correlationDetail | Governance, Observability | Not promoted to a proposal |
| `LearningHealthChanged` | Health recomputed (active only) | fromHealth, toHealth, drivers | Observability, Governance | Learning-quality signal; **no lifecycle change** |
| `LearningDegraded` / `LearningDiverging` | Health specializations | reason | Governance, Notifications | Weak evidence / unsafe pattern |
| `LearningProposed` | Improvement proposals formed | proposals, sandbox/shadow results | **Governance**, target modules | Versioned reversible proposals available |
| `LearningUnderReview` | Sent for review | reviewers | Governance, Human review | Approval workflow begins |
| `LearningRejected` | Proposal rejected | reason | Audit | Nothing applied |
| `LearningApproved` | Proposal approved | approverRef | **Target module** | Application authorized (governed) |
| `LearningApplied` | Target module applied improvement | targetModule, learningVersion | Observability, Audit | Behavior improved (versioned, reversible) |
| `LearningRolledBack` | Applied improvement reversed | reason (regression/governed) | Governance, Audit | Prior behavior restored |
| `LearningCalibrationProposed` | Confidence calibration adjustment | calibrationDelta | Reasoning-config governance | Future confidence better calibrated |
| `LearningCrossAgentShared` | Governed cross-agent improvement share | fromAgent, toAgents, scope | Governance, Audit | Improvement distilled within scope |
| `LearningReplayed` | Replay run created | replaySourceId | Governance, Audit | Deterministic re-derivation; non-applying |
| `LearningArchived` | Record retired | — | Reporting | Session/proposal retired |
| `LearningAuthorityViolationAttempted` | Proposal/attempt to change authority/permissions/identity/intent/truth, or self-apply | attemptType | **Security, Governance**, Audit | Boundary enforced; blocked and audited |

**Ordering and idempotency.** Events carry `correlationId` + version; consumers discard stale/duplicate deliveries. Emission is **transactional with the mutation**; a failed audit/event write rolls back — no un-audited learning step.

**Two independent streams.** Health events never accompany or cause a lifecycle change; lifecycle events never carry a health transition.

---

## 11. KPIs

Learning quality/safety and the platform's improvement performance, measured deterministically from session/proposal records.

| KPI | Definition | Source |
|---|---|---|
| **Improvement acceptance rate** | % of proposals approved vs rejected | review events |
| **Applied-improvement impact** | Measured performance gain of applied improvements (vs baseline) | outcome comparison |
| **Rollback rate** | % of applied improvements rolled back (regression) | rollback events |
| **Safety-flag rate** | Rate of drift/regression/bias/overfit/hallucination/loop detections | safety events |
| **Unsafe-blocked rate** | % of proposals blocked by the safety suite (target: 100% of unsafe blocked) | safety + proposal |
| **Causation-tested rate** | % of proposals with validated causation (vs correlation-only) — target 100% | causation checks |
| **Auto-apply incidents** | Count of any improvement applied without governance (target 0) | apply audit |
| **Authority-change incidents** | Count of any proposal/attempt to change authority (target 0) | violation events |
| **Confidence-calibration gain** | Improvement in Reasoning confidence calibration over time | calibration outcomes |
| **Reversibility coverage** | % of applied improvements with a valid rollback plan (target 100%) | proposal fields |
| **Provenance completeness** | % of proposals traced to motivating evidence (target 100%) | provenance |
| **Evidence representativeness** | % of sessions with representative (non-overfit) samples | sample analysis |
| **Cross-agent share governance** | % of cross-agent shares governed + scoped (target 100%) | share events |
| **Replay fidelity** | % of sessions reproducing their analysis on replay | replay checks |
| **Cost per improvement** | Analysis cost per accepted proposal | Execution cost |
| **Health distribution** | % of active sessions healthy vs degraded/diverging | `learningHealth` |
| **Audit completeness** | % of learning steps with an immutable trail (target 100%) | audit chain |

These feed the Executive/Director and Observability surfaces (Identity §10 pattern). All from Learning's own records — no external inference.

---

## 12. Failure Scenarios

At least the following failure modes and the engine's deterministic reaction. Governing rule: **Learning fails closed and authority-preserving** — on ambiguity it proposes nothing unsafe, applies nothing, changes no authority, and never lets failed learning become behavior.

1. **Proposal would change authority/permissions.** Invalid — rejected; `LearningAuthorityViolationAttempted`; authority is never learnable.
2. **Proposal would change Identity/Mission/Goals/Plans/Policies.** Invalid — rejected; those are governed elsewhere, not learnable.
3. **Attempt to edit Knowledge/Memory directly.** Refused — Learning proposes governed promotion/ratification; it has no direct write path.
4. **Attempt to self-apply a proposal.** Refused — application is the target module's under governance; no self-apply path.
5. **Correlation treated as causation.** Blocked — a correlation must be causation-tested (sandbox/shadow); un-tested correlation cannot motivate a proposal.
6. **Overfitting to a small/biased sample.** Detected → `diverging`/`degraded`; proposal blocked; more representative evidence required.
7. **Bias in feedback/outcomes.** Bias detection flags it; proposal blocked/escalated; biased learning never applied.
8. **Hallucination reinforcement.** A fabricated "success" is caught by hallucination-reinforcement detection; not learned; escalated.
9. **Feedback loop (learning from own unvalidated outputs).** Detected; blocked — the system must not self-reinforce unvalidated behavior.
10. **Drift from intent/baseline.** Drift detection flags; proposal blocked; alignment restored via governed correction.
11. **Regression after application.** Regression detection triggers rollback to the prior version; audited; the improvement is reversed.
12. **Failed sandbox evaluation.** The proposal is blocked — it never becomes behavior.
13. **Failed shadow evaluation.** Same — shadow-negative improvements are not applied.
14. **Irreversible change proposed.** Invalid — every improvement must be reversible; no rollback plan → rejected.
15. **Provenance-less proposal.** Rejected — every proposal must trace to motivating evidence.
16. **Un-versioned improvement.** Impossible — every improvement is versioned.
17. **Unapproved application attempt.** Refused — nothing applies without governance approval.
18. **Out-of-scope input.** Refused — inputs bounded by the subject's scope/permissions and tenant.
19. **Cross-tenant learning.** Structurally impossible; refused.
20. **Cross-agent share beyond scope/permissions.** Refused — cross-agent sharing is governed and scoped, never ambient.
21. **Personal learning tries to raise an agent's ceiling.** Refused — learning refines skill, never authority (Agent §5.6).
22. **Organizational learning tries to change a Policy.** Refused — Policy is governed elsewhere; Learning may inform, never change.
23. **Success learning from a bad outcome that looked good.** Anti-bias/anti-drift catches the mislabeled success; not reinforced.
24. **Negative learning over-generalizes from one failure.** Overfitting detection flags; counterexamples required before proposing avoidance.
25. **Confidence calibration overcorrects.** Sandbox/shadow bounds the calibration change; a destabilizing overcorrection is blocked.
26. **Prompt improvement degrades other tasks.** Shadow evaluation across tasks catches the regression; blocked/rolled back.
27. **Workflow improvement breaks a dependency.** Sandbox/consistency check catches it; blocked.
28. **Procedure improvement conflicts with Knowledge.** Validated against Knowledge; a conflict blocks the proposal (truth wins).
29. **Learning from a contested/stale Knowledge.** The input's health is surfaced; learning on shaky truth is flagged/lowered-quality.
30. **Cost budget exceeded.** Analysis halts/escalates; cost attributed; never a silent overspend.
31. **Provider outage during analysis.** Failover (Execution); if none, `degraded`→escalate; provider-independent.
32. **Human rejects an improvement.** Not applied; recorded; Learning never overrides the human.
33. **Applied improvement later shows harm.** Rollback (governed); prior version restored; harm bounded by reversibility.
34. **Two proposals conflict.** Governance reconciles; not silently merged; only one governed application.
35. **Learning session replays differently.** Deterministic analysis reproduces; non-deterministic (LLM) reproduces the traced path/evidence; divergence flagged.
36. **Subject agent suspended mid-session.** Session halts/escalates; no learning applied to a suspended agent.
37. **Subject authority drops mid-session.** Inputs/proposals re-scoped; a proposal exceeding the reduced ceiling is invalid.
38. **Learning proposes a "shortcut" that skips a control.** Refused — an improvement that weakens a control/safety/permission is invalid, not an efficiency.
39. **Metric gaming (improving a metric while harming intent).** Drift/goodhart detection flags a metric improving while true intent degrades; blocked.
40. **Learning from insufficient evidence.** `degraded`; no proposal — improvement requires sufficient representative evidence.
41. **Feedback provenance missing.** A feedback record with no provenance is quality-gated out; not used to motivate a proposal.
42. **Auto-promotion of a well-remembered mistake to procedure.** Caught by safety suite (the "mistake looked routine" case); blocked from procedural promotion.
43. **Health drives lifecycle (attempted).** Refused — `diverging` never auto-rejects/applies; only governed transitions.
44. **Terminal session mutation.** Refused — terminal records immutable.
45. **Audit write fails on a learning step.** Transactional rollback; no un-audited learning — auditability guarantee holds.
46. **Learning tries to become the source of truth or a decider.** Refused — it proposes; truth is Knowledge's, deciding is the chain's.

---

## 13. Enterprise Use Cases

Behavior of Learning in real situations. In every case Learning consumes evidence, proposes governed improvements, and changes no authority, edits no store, applies nothing itself.

1. **Agent skill coaching.** After 100 lead-qualification outcomes, Learning proposes improving `Atlas`'s qualification skill; approved; applied via Agent reconfiguration — no ceiling change.
2. **Procedure fix.** A recurring failure at step 3 of a procedure is root-caused; Learning proposes a fixed step; governed-promoted to procedural memory.
3. **Workflow improvement.** A workflow consistently stalls at an approval node; Learning proposes restructuring; governed Workflow revision applies it.
4. **Prompt improvement.** A reasoning prompt yields weak output; Learning proposes a better prompt; shadow-tested; approved.
5. **Confidence calibration.** Reasoning's 80%-confidence conclusions are right only 60% of the time; Learning proposes a calibration adjustment; applied to reasoning config.
6. **Positive learning.** A successful outreach pattern is reinforced (proposed as a procedure improvement) after causation is validated.
7. **Negative learning.** A repeated failure mode is turned into an avoidance rule — with counterexamples to prevent over-generalization.
8. **Counterexample handling.** A boundary case is added so the improvement doesn't overfit.
9. **Failure learning.** A costly failure is analyzed to root cause; the fix proposed and governed-applied.
10. **Success learning.** A win is analyzed to extract the repeatable driver; proposed for broader use.
11. **Pattern discovery.** Across many sessions, a recurring success shape is discovered and proposed as a standard procedure.
12. **Trend detection.** A slow decline in a workflow's success rate is detected before it becomes a crisis; investigated.
13. **Drift detection.** An agent's behavior drifts from its intended profile; drift is flagged and corrected via governed reconfiguration.
14. **Regression detection + rollback.** An applied prompt improvement later regresses another task; rollback restores the prior version.
15. **Bias detection.** Feedback skewed by a non-representative sample is caught; the biased "improvement" is blocked.
16. **Overfitting detection.** A proposal fit to 5 cases is flagged; more evidence required before proposing.
17. **Hallucination-reinforcement detection.** A fabricated "fact" that once looked useful is caught before it's learned into procedure or proposed to Knowledge.
18. **Feedback-loop detection.** The system is about to learn from its own unvalidated outputs; the loop is detected and blocked.
19. **Sandbox learning.** A risky procedure change is evaluated in a sandbox (no effect) before proposal.
20. **Shadow learning.** An improved workflow runs in shadow alongside the current one; results compared; only applied if better.
21. **Human review approves.** A steward reviews and approves a skill improvement; applied, versioned.
22. **Human review rejects.** A human rejects a proposed change; not applied; recorded.
23. **Rollback on harm.** An applied change causes a subtle harm; governed rollback reverses it.
24. **Cross-agent learning.** A procedure `Atlas` discovered is distilled and governed-shared to peer sales agents.
25. **Personal vs organizational.** A personal calibration for one agent stays personal; a company-wide procedure improvement goes through org-scope governance.
26. **Provenance for audit.** Every proposal traces to the outcomes/feedback that motivated it; an auditor can see why.
27. **Replay a learning session.** An auditor replays the analysis to verify the improvement's basis.
28. **Cost governance.** A pricey multi-model analysis nears budget; halts/escalates; cost attributed.
29. **Provider swap.** The analysis model is swapped; Learning runs unchanged (provider-independent).
30. **Authority-change refused.** A proposal that would let an agent approve its own invoices is refused — authority is not learnable.
31. **Policy-change refused.** A proposal to relax an approval threshold is refused — Policy is governed, not learned.
32. **Knowledge-edit refused.** Learning proposes ratifying a validated fact to Knowledge (governed), never edits Knowledge directly.
33. **Memory-edit refused.** Learning proposes promoting a procedure to memory (governed), never writes memory directly.
34. **Metric-gaming caught.** A change improves a vanity metric while harming the real Goal; drift/goodhart detection blocks it.
35. **Insufficient evidence.** With too few outcomes, Learning proposes nothing and reports insufficient evidence.
36. **Contested-truth input.** Learning notes it's analyzing over contested Knowledge and lowers proposal confidence.
37. **Calibration loop closes.** Over quarters, confidence calibration improves measurably — a KPI Learning drives.
38. **Failure never auto-behavior.** A failed shadow test's "improvement" never reaches production.
39. **Reversible by construction.** Every applied improvement carries a rollback plan; ops can revert any of them.
40. **Cross-agent share scoped.** A shared improvement reaches only permitted agents; never ambient.
41. **Suspended-agent subject.** Learning halts for a suspended agent; nothing applied.
42. **Ceiling-drop mid-session.** The subject's authority drops; proposals re-scope; over-ceiling proposals invalidated.
43. **Human overrides everything.** A human disagrees with the analysis; the human decision stands; Learning proposes, never overrides.
44. **Optimization recommendation.** Learning recommends reallocating which agents handle which tasks (an optimization) — a recommendation for governance, not an applied change.
45. **Regulatory audit of improvement.** A regulator asks how an automated behavior changed; version + provenance + approval records provide a full account.
46. **Observability-driven tuning.** Ops watches safety-flag and rollback rates to tune learning thresholds.
47. **Bad-success reinforcement blocked.** A lucky outcome from a wrong process is not reinforced — causation testing catches that the process wasn't the cause.
48. **Consolidation input.** Learning's cross-cutting findings (recurring cross-module patterns) feed the upcoming Architecture Consolidation review.
49. **M&A isolation.** Learning stays per tenant; improvements aren't shared across merged tenants except by governed export.
50. **Continuous improvement, constant authority.** Over a year the workforce measurably improves — skills, procedures, calibration — while its authority, identity, and permissions are exactly what governance set. The defining outcome: **better behavior, unchanged authority.**

---

## 14. Extensibility

How Learning absorbs future demands **without redesign**, because the core abstractions were chosen as extension points.

- **New improvement types.** The proposal `proposalType` extends (e.g. `tool-selection`, `routing`) behind the same propose→approve→apply→reversible contract.
- **Richer safety detection.** Drift/bias/overfitting/loop detectors can deepen (formal fairness, causal inference) behind the safety suite.
- **Advanced causal testing.** Controlled experiments / A-B / uplift modeling extend sandbox/shadow without touching the "correlation ≠ causation, propose-only" boundary.
- **New learning types.** Beyond personal/organizational/cross-agent (e.g. federated learning across tenants) add as governed types, never ambient.
- **Meta-learning.** Learning about learning (which improvements stick) extends as a higher-order session — still propose-only, still authority-preserving.
- **Human-feedback pipelines.** Richer feedback capture integrates as new feedback sources with provenance.
- **Provider/model evolution.** Analysis models evolve behind Commands/Execution; provider-independent.
- **Optimization engines.** Portfolio/allocation optimizers consume Learning's recommendations as governance inputs, never auto-applied.

The invariant enabling all of the above: **propose, never apply; improve behavior, never authority; versioned, reversible, provenanced; detect and refuse unsafe learning; correlation ≠ causation; human/Governance approves.** New demands plug into proposal types/safety/testing without touching the authority-preservation or propose-only boundaries.

---

## 15. Architectural Principles

The permanent design principles governing Learning. If a future request conflicts with one of these, the request is wrong, not the principle.

1. **Learning improves behavior, never authority.** It can propose better skill/procedure/workflow/prompt/calibration; it can never change permissions, authority, identity, or intent.
2. **Learning proposes; Governance approves; the target applies.** It never applies its own proposals; there is no self-apply or self-authorize path.
3. **Never edits Knowledge or Memory directly.** It proposes governed ratification/promotion; those modules own the write.
4. **Every improvement is versioned, auditable, reversible, and provenanced.** Nothing learned is irreversible, un-audited, or un-sourced.
5. **Safety-first.** It must detect and refuse drift, regression, bias, overfitting, hallucination reinforcement, and feedback loops; correlation is never causation.
6. **Failed learning never becomes behavior automatically.** Sandbox/shadow/validation failures block application; humans own acceptance.
7. **Consumes, never mutates.** It reads reasoning traces, execution outcomes, human feedback, Working Memory, Long-term Memory, and Knowledge; it edits none.
8. **Human-supervised.** Every improvement is human-reviewable and governance-approved; humans override.
9. **Bounded and provider-independent.** Cost-governed, tenant-isolated, analysis via Commands/Execution; no bound SDK.
10. **Lifecycle and health are separate axes.** Lifecycle is governed existence; health is observed learning quality/safety (`healthy`/`degraded`/`diverging`), active-only, automatic, and never changes lifecycle.

---

## 16. What Learning will NEVER do

Explicit boundaries to prevent responsibility creep. If a future request asks Learning to do any of these, the answer is: it belongs to Governance, Identity, the target module, or the cognitive chain.

- **Never change permissions, authority, Identity, Mission, Goals, Plans, or Policies.** Improvement is never authority change.
- **Never edit Knowledge or Long-term Memory directly.** It proposes governed ratification/promotion.
- **Never apply its own proposals or self-authorize.** Governance approves; the target module applies.
- **Never make an improvement irreversible, un-versioned, un-audited, or un-provenanced.**
- **Never treat correlation as causation, or reinforce bias/hallucination/drift/overfitting/feedback loops.** It must detect and refuse these.
- **Never let failed learning become organizational behavior automatically.**
- **Never store organizational truth or experience of record, draw act-now conclusions, or commit decisions.** It is not Knowledge, Memory, Reasoning, or Decision.
- **Never exceed the subject's authority/permissions or cross tenants.**
- **Never propose weakening a control, permission, or safety as an "efficiency."**
- **Never let health change lifecycle, or emit an unaudited learning step.**

---

## Implementation Assumptions

- **New enums (specification-level, not yet migrated):** `learningLifecycleStatusEnum` (`created | collecting | analyzing | proposing | under-review | approved | applied | rolled-back | rejected | archived`), `learningHealthEnum` (`unknown | healthy | degraded | diverging`), `learningTypeEnum` (`personal | organizational | cross-agent`), `improvementProposalTypeEnum` (`skill | procedure | workflow | prompt | calibration | optimization`). Joins the accumulated unimplemented enum backlog from specs 35–46.
- **Learning is a process; improvements land elsewhere.** Learning owns proposals + audit, not behavior. Applied improvements are written by the *target* module under its governance (Agent reconfig / Memory promotion / Knowledge ratification / Workflow revision). Implementation must route application through those modules — Learning must have no direct write path to behavior, stores, or authority.
- **Safety suite is mandatory, not optional.** Drift/regression/bias/overfitting/hallucination-reinforcement/feedback-loop detection and causation testing gate every proposal; implementation must not allow a "fast path" that skips them.
- **Analysis via Commands/Execution:** model/analytics calls are Commands performed by Execution under bounds; Learning binds no provider SDK.
- **Reversibility is a build requirement:** every applied improvement must carry a rollback plan the target module can execute; irreversibility is a rejection.
- **No code, SQL, migrations, or schema changes produced** — architecture specification only, per instruction.

## Open Questions for 48 - Architecture Consolidation Specification v1.0

- **The consolidation mandate.** Spec 48 should reconcile the full stack (34–47): the complete module map, the cross-cutting invariants (lifecycle/health separation, propose-vs-apply, authority ceiling, tenant isolation, immutable audit, promotion/ratification gates), and the exact boundaries between every pair of adjacent modules.
- **The enum + schema backlog (now urgent).** Specs 35–47 defined ~40+ new enums (mission/goal/plan/task/workflow/command/execution/agent/working-memory/memory/knowledge/reasoning/learning lifecycle+health+scope+type) and several extended tables — **none implemented**. Spec 48 must define the consolidated enum catalog, the migration plan, and the schema-extension map, and flag the sequencing so the backlog is retired safely.
- **Cross-module governance.** Promotion (Memory), ratification (Knowledge, Mission), approval (Plan/Task/Workflow/Command), and learning-approval all touch Governance. Consolidation should define one coherent Governance contract these share, rather than repeating it per spec.
- **The unified event bus & audit.** Every spec emits events transactionally with an immutable audit. Consolidation should define the shared event/audit backbone (envelope, correlation, ordering, retention) so the 13 modules interoperate.
- **The authority stack as one enforced object.** `Law → … → Execution → Agent → … → Learning` is restated in every spec; consolidation should define the single enforcement mechanism (where each layer is checked) rather than per-module prose.
- **The lifecycle/health pattern as a shared contract.** Every module has governed-lifecycle + observed-health with identical rules; consolidation should factor this into one reusable pattern/spec to avoid drift.
- **Naming/versioning conventions** across all `*LifecycleStatusEnum` / `*HealthEnum` / provenance / lineage / version fields — consolidate to one convention before implementation.
