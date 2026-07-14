# Policy Specification v1.0

> Stage 17 — Policy module, complete Enterprise Architecture Specification.
> This document is the permanent architectural reference for Policy in Hebun AI — the **organizational rule system.**
> Policy is the authoritative definition of what is allowed, required, forbidden, constrained, and enforced across the organization. It adds no implementation. It defines boundaries.

**Status:** Definitive · **Scope:** Policy module only · **Grounded in:** the schema primitives in `src/db/schema/_base.ts` (`rootColumns`, `tenantColumns`) and `_enums.ts` (`lifecycleStatusEnum`, `approvalStateEnum`, `roleTypeEnum`, `permissionScopeEnum`, `providerStatusEnum`), the existing `policy` schema (Identity §3.11), and the Identity (34) through Governance (49) Specifications v1.0.

**Position in the architecture:**

```
                        POLICY (this document) — the RULES (what is allowed/required/forbidden/constrained)
                             │  ratified rules become AUTHORITATIVE
                             ▼
   Authority Stack:  Law → Security/Compliance → APPROVED POLICY → Mission → Goals → … → Execution
                             ▲                                        │
                             │ Policy CONSTRAINS Mission               │ Governance AUTHORIZES policy changes;
                             │ (rules bound purpose)                   │ Execution ENFORCES runtime effects
                        consumes Knowledge (facts) — references, never replaces
```

**Authority precedence (canonical, Spec 48 §9.1):**

```
Law → Security/Compliance → Approved Policy → Mission → Goals → Plans → Tasks → Workflows → Commands → Execution → Agent → … → Learning
```

> **Policy defines the rules; it does not enforce them.** Governance authorizes policy *changes*; Governance gates and Execution's final gate *apply* policy at decision and effect time. Only **ratified (approved) policy** enters the Authority Stack — where it **outranks Mission** (rules bound purpose). Policy is authoritative about *rules*, exactly as Knowledge is authoritative about *truth* — and it owns neither truth, nor intent, nor enforcement.

Policy is the **organizational rule system** of Hebun. It is the authoritative definition of **what is allowed, required, forbidden, constrained, and enforced** — security rules, compliance rules, financial rules, operational rules, legal rules, HR rules, data-governance rules, privacy rules, AI-safety rules, and risk controls. It **defines** rules; **Governance authorizes** changes to them; **Execution enforces** their runtime effects. It applies **equally to humans, agents, workflows, commands, and execution.**

**Critical clarification — Policy is the rulebook, not the referee, the purpose, the truth, or the roster:**

> Policy is **NOT** Governance. Policy is **NOT** Mission. Policy is **NOT** Knowledge. Policy is **NOT** Identity.
>
> **Governance** applies rules and authorizes change; **Mission** is the company's purpose; **Knowledge** is what is true; **Identity** is who exists. **Policy** is *the rules themselves* — what may, must, and must-not happen. It states the rules; it does not enforce them (Governance/Execution do), does not set purpose (Mission does), does not hold truth (Knowledge does), and does not own actors (Identity does).

---

## 1. Purpose

### Why the Policy layer exists

Every prior module refers to "Policy" as a constraint above it: Mission is subordinate to Approved Policy (Mission §7.9); Goals/Plans/Tasks/Workflows/Commands may not violate it; Execution enforces it at the effect boundary; Governance consumes it to authorize; Reasoning is constrained by it; Learning may never change it. Sixteen specifications lean on Policy as *the authoritative rules* — yet what a Policy *is* (its structure, scope, hierarchy, lifecycle, how a rule is stated, versioned, ratified, and referenced) has never been specified. The rules that bound the entire system had no definition. Policy is that definition, now made concrete — the last module of the Hebun Core.

Policy is the **system of record for the organization's rules: the authoritative, ratified, versioned, scoped definition of what is allowed, required, forbidden, and constrained, that binds every actor and layer equally.** It is the rulebook the whole operating system obeys — separate from the referee that applies it (Governance), the runtime that enforces it (Execution), the purpose it bounds (Mission), and the truth it references (Knowledge). Only *ratified* policy is authoritative; only *authoritative* policy enters the Authority Stack; and every rule carries an owner, steward, authority level, scope, applicability, effective/expiration dates, version, lineage, provenance, rationale, references, and a review cadence — so the rules are accountable, current, and defensible.

Without a Policy layer, the Authority Stack has a hole where "Approved Policy" sits: rules would be implicit, inconsistent, un-versioned, un-scoped, and unenforceable-by-contract; "what is allowed" would be scattered across code and prose. Policy closes that gap and holds the **rule boundary**: it is the one place organizational rules live — defined here, authorized by Governance, enforced by Execution, referencing Knowledge, constraining Mission — and it never enforces itself, approves itself, owns intent, or holds truth.

### Business problem it solves

1. **Authoritative, consistent rules.** "What is allowed/required/forbidden" must be a single, ratified, scoped, versioned source that binds everyone equally — not tribal knowledge or scattered checks. Policy is that source.
2. **Separation of rule from enforcement.** The module that *defines* a rule must not be the one that *enforces* or *approves* it — otherwise rules become self-serving. Policy defines; Governance authorizes changes; Execution enforces effects; the separation makes rules trustworthy.
3. **Accountable, current, testable rules.** Every rule must have an owner/steward, a rationale, a review cadence, an expiry, and a way to be simulated/tested before it binds — so rules stay accountable, current, and safe to change.

### Its responsibility

- Own the lifecycle of every rule: `draft → proposed → under-review → ratified → superseded → deprecated → expired → retired → archived` (governed), separate from health `unknown → current / stale / conflicted` (observed).
- Be the **authoritative definition** of rules across all domains: security, compliance, financial, operational, legal, HR, data-governance, privacy, AI-safety, risk controls.
- Organize rules into a **Policy Registry** of **domains, categories, sets, bundles, scope, and hierarchy**, with **inheritance, composition, overrides, exceptions, conditions, constraints, and enforcement contracts.**
- Guarantee every policy carries the **mandatory anatomy** (owner, steward, authority level, scope, applicability, effective/expiration dates, version, lineage, provenance, rationale, references, review cadence).
- Provide **policy validation, simulation, testing, and dry-run** — where **simulation never creates organizational effects.**
- **Define, never enforce.** Rules are enforced by Governance (at decision time) and Execution (at effect time); Policy states the **enforcement contract**, it never runs it.
- Ensure **only ratified policy is authoritative**, **only authoritative policy participates in the Authority Stack**, policy changes are **versioned, auditable, and reproducible**, and **Governance authorizes every policy change.**
- Support **policy provenance, references (to Knowledge/other policy), source attribution, audit, observability, metrics, cost, and provider independence.**
- Emit policy events; be consumed by Governance (to authorize/apply), Execution (to enforce), and every constrained module.

### What is explicitly NOT its responsibility

- **Policy never enforces rules.** It defines them; Governance applies them at gates; Execution enforces their runtime effects. Policy has no enforcement path.
- **Policy never approves or authorizes itself.** A policy change is authorized by **Governance** (the sole authority). Policy proposes; Governance ratifies.
- **Policy never owns organizational intent.** It **constrains** Mission (rules bound purpose); it never **defines** Mission or any Goal/Plan.
- **Policy never owns truth.** It **references** Knowledge (a rule may rest on a fact); it never **replaces** or **defines** truth.
- **Policy is not Identity.** It **applies to** actors; it does not **own** them or their permissions (Identity does).
- **Policy never executes, reasons, or learns.** It is inert rules; it acts, thinks, and improves nothing.

---

## 2. Mental Model

Policy is the **rulebook and the bylaws of the digital company** — the written body of what may, must, and must-not happen. It is not the referee who applies the rules during play (Governance), not the players who act (Execution/agents), not the mission statement on the wall (Mission), not the encyclopedia of facts (Knowledge), and not the employee roster (Identity). It is the *rules themselves*: "spend over €10k requires director approval," "customer PII may not leave the EU region," "an agent may never send bulk email without a compliance gate," "backups run nightly." The rulebook is written, reviewed, ratified by the board (Governance), and then binds everyone equally — the CEO, the newest agent, every workflow, every command. When the rulebook and the mission conflict, the rulebook wins (an approved rule outranks purpose); when a rule needs a fact, it cites the encyclopedia (Knowledge) without copying it.

The one-line model: **Policy is the authoritative, ratified, versioned, scoped rulebook of the organization — what is allowed, required, forbidden, and constrained — binding humans, agents, workflows, commands, and execution equally; defined here, authorized by Governance, enforced by Execution; referencing Knowledge and constraining Mission; owning neither truth, nor intent, nor enforcement.**

Eight properties define the model:

- **Authoritative about rules.** Policy is the single source of what is allowed/required/forbidden — as Knowledge is the single source of truth. Only *ratified* policy is authoritative.
- **Defining, not enforcing.** It states rules and their enforcement contracts; enforcement is Governance's (decisions) and Execution's (effects). Policy runs nothing.
- **Governance-authorized.** A policy change is authorized only by Governance. Policy never approves itself.
- **Universally binding.** Rules apply equally to humans, agents, workflows, commands, and execution. No actor is above the rules.
- **Scoped & hierarchical.** Rules live in domains/categories/sets/bundles, at company/department/domain scope, with inheritance, composition, overrides, and governed exceptions — narrower rules refine, never contradict, broader ones.
- **Referencing truth, bounding purpose.** Policy references Knowledge (facts a rule rests on) without owning it, and constrains Mission (an approved rule outranks purpose) without defining it.
- **Versioned, accountable, testable.** Every rule is versioned, provenanced, owner/steward-accountable, review-cadenced, and simulatable/testable before it binds — with simulation producing no real effect.
- **Bounded, not sovereign.** Beneath Law/Security/Compliance in the stack, above Mission; it defines rules within the higher legal/security ceiling and is changed only through Governance.

Policy sits **above Mission in the Authority Stack (as approved rules) and beside Knowledge/Governance as their distinct sibling.** It supplies the rules Governance applies and Execution enforces, references the truth Knowledge holds, and bounds the purpose Mission sets. It is the hinge between *what the organization permits* and *everything that then happens within those permissions* — and it is exclusively about *defining the rules*, never *enforcing, approving, executing, reasoning, or owning truth/intent*.

---

## 3. Core Domain Objects

Policy extends the existing `policy` schema (Identity §3.11). All reuse `_base.ts` contracts:

- **`rootColumns`** / **`tenantColumns`**. `createdBy`/`ownerRef`/`stewardRef`/`ratifiedBy` resolve to actor references (Identity §3.9); every policy is tenant-scoped.

---

### 3.1 Policy Object

- **Purpose.** A single authoritative rule (or coherent rule statement) — what is allowed/required/forbidden/constrained. The primary object.
- **Table.** `policies` (`tenantColumns`) — extended.
- **Conceptual fields (the mandatory anatomy — every policy must carry all).**
  - `id` — Policy ID.
  - `tenantId` — owning Company (Identity §3.1).
  - `policyDomain` — `policyDomainEnum` (§3.4): security | compliance | financial | operational | legal | hr | data-governance | privacy | ai-safety | risk-control.
  - `categoryRef` — category within the domain (§3.4).
  - `ruleType` — `ruleTypeEnum` (§3.2): allow | require | forbid | constrain | obligation.
  - `statement` — the rule content (condition → requirement/prohibition/constraint).
  - `conditions` — when the rule applies (§5.10).
  - `constraints` — the bounds the rule imposes (§5.10).
  - `enforcementContract` — how the rule is to be enforced (by whom, at which gate/effect — §5.12). Declarative; Policy never runs it.
  - `owner` (`ownerRef`) / `steward` (`stewardRef`) — accountable owner + maintaining steward. **Mandatory.**
  - `authorityLevel` — `policyAuthorityEnum` (§5.15): authoritative | provisional. Only `ratified` + `authoritative` participates in the Authority Stack.
  - `scope` — `policyScopeEnum` (§3.3): company-wide | department | domain.
  - `applicability` — to whom/what it applies (humans, agents, workflows, commands, execution — **equally**).
  - `effectiveDate` / `expirationDate` — validity window. **Mandatory.**
  - `reviewCadence` — mandatory periodic review. **Mandatory.**
  - `version` (base) + `policyVersion` — versioning. **Mandatory.**
  - `lineageRef` — correction/supersession chain. **Mandatory.**
  - `provenance` / `sourceAttribution` — origin (law, regulation, board decision, standard). **Mandatory.**
  - `rationale` — why the rule exists. **Mandatory.**
  - `references` — links to Knowledge (facts), Law, and other policies (§5.9). **Mandatory (may be empty set but present).**
  - `dependencies` — other policies this depends on (§5.9).
  - `policyLifecycleStatus` — governed lifecycle (`policyLifecycleStatusEnum`, §6).
  - `policyHealth` — health (`policyHealthEnum`, §6): `unknown | current | stale | conflicted`.
  - `approvalState` / `ratifiedAt` / `ratifiedBy` — ratification (via Governance).
  - base audit fields (immutable audit).
- **Required.** All mandatory-anatomy fields above.
- **Immutability.** Ratified policy is **versioned, never silently overwritten**; corrections create versions, re-ratified.
- **Ownership.** Tenant-scoped; owner + steward accountable; ratified by Governance.
- **Example.** `financial` domain, `require` rule: "Any spend > €10,000 requires Director approval." scope company-wide, applies to humans+agents+commands, authority `authoritative`, references Knowledge {"approval thresholds"}, steward Finance Director.

### 3.2 Rule Type

- **Purpose.** The deontic class of the rule.
- **Realization.** `ruleTypeEnum` (specified): `allow` (permit), `require` (mandate), `forbid` (prohibit), `constrain` (bound), `obligation` (duty). Every policy statement is one of these — the primitive of "what is allowed/required/forbidden/constrained."

### 3.3 Policy Scope

- **Purpose.** The breadth a rule binds.
- **Realization.** `policyScopeEnum` (specified): `company-wide | department | domain`. Narrower scope must be **consistent with** broader scope (a department rule may tighten, never relax, a company-wide rule — canonical scope-consistency, like Knowledge/Mission).

### 3.4 Policy Domain & Category & Registry

- **Policy Registry.** The catalog of all policy domains, categories, sets, bundles, hierarchy, and enforcement contracts — the map of the organization's rules.
- **Policy Domains** (`policyDomainEnum`): security, compliance, financial, operational, legal, hr, data-governance, privacy, ai-safety, risk-control (extensible). These map onto Governance's gate suite (§9) — the same taxonomy.
- **Categories** group rules within a domain (e.g. financial → "spend approval," "budget limits").

### 3.5 Policy Set & Policy Bundle

- **Policy Set.** A named collection of related policies applied together (e.g. "EU Data Handling Set").
- **Policy Bundle.** A composed, versioned package of sets/policies deployed as a unit (e.g. "GDPR Compliance Bundle") — the unit of composition and rollout.

### 3.6 Policy Version & Lineage & Provenance

- Every policy is **versioned**; corrections/supersessions link **lineage** (`supersedesPolicyId`/`supersededByPolicyId`); **provenance** records origin (law/regulation/board/standard). **Policy changes are versioned, auditable, and reproducible; superseded policy remains historically accessible.**

### 3.7 Enforcement Contract

- **Purpose.** The declarative statement of *how* a rule is enforced — by which enforcer, at which point (Governance gate / Execution effect), with what action on violation (block/escalate/require-approval).
- **Realization.** `enforcementContract {enforcer ∈ {governance-gate, execution-gate, both}, trigger, onViolation ∈ {block, escalate, require-approval, log}}`. **Policy states the contract; it never executes it** — Governance and Execution honor it (§9).

---

## 4. Ownership

- **Owned by Company; owner + steward accountable.** Every policy belongs to exactly one company via `tenantId`, with an accountable **owner** (the container whose rule it is) and a **steward** (responsible for accuracy, currency, review, conflict resolution). A policy without a steward is unmaintained and disallowed (§7).
- **Policy owns the rules — not their enforcement, not intent, not truth.** Policy owns the *rule definitions*; **enforcement is Governance/Execution's**, **intent is Mission/chain's**, **truth is Knowledge's**. Policy never owns any of those.
- **Ratification authority is Governance's.** A policy becomes authoritative only when **Governance ratifies** it (§9). Policy proposes; it **never approves itself.** The owner/steward propose and maintain; Governance authorizes.
- **Scope ownership.** company-wide rules owned by the Company; department rules by the department; domain rules by the domain owner — always with a steward, always scope-consistent.
- **Applies equally, owned by none it binds.** A rule applies to humans, agents, workflows, commands, and execution equally; none of those "own" the rule or may exempt themselves — exceptions are governed (§5.11).
- **No cross-tenant policy.** Rules are per-tenant; a cross-tenant (holding/M&A) rule alignment is a governed, per-tenant action.

---

## 5. Policy Architecture

The rule system's internal architecture. All are rule-definition/organization mechanics; none enforces, approves, executes, reasons, or owns truth/intent.

### 5.1 Policy Registry (§3.4) & 5.2 Policy Engine

- The **registry** catalogs all rules/domains/sets/bundles/hierarchy. The **Policy Engine** manages rule definition, versioning, composition, validation, simulation, and the *evaluation contract* Governance/Execution consume — but the engine **evaluates for definition/simulation only; it does not enforce** live effects (Execution does).

### 5.3 Policy Objects (§3.1) & 5.4 Sets/Bundles (§3.5) & 5.5 Domains/Categories (§3.4)

- Realize the rule anatomy, grouping, and taxonomy.

### 5.6 Policy Scope & 5.7 Hierarchy & Inheritance & Composition

- **Hierarchy**: company-wide → department → domain. **Inheritance**: narrower scopes inherit broader rules and may tighten (never relax). **Composition**: sets/bundles compose multiple rules; composition resolves to a consistent effective rule-set (conflicts flagged, §5.14).

### 5.8 Overrides & Exceptions & 5.11 Exception Handling

- **Overrides**: a higher-authority or more-specific rule overrides a broader one (governed, consistency-checked — never a silent relaxation of a higher rule). **Exceptions**: a governed, time-boxed, audited deviation from a rule for a named case — heightened scrutiny, never a silent bypass (mirrors Governance §5.9 exception handling).

### 5.9 Dependencies, References, Source Attribution

- **Dependencies**: a rule may depend on other rules (consistency-checked). **References**: a rule references **Knowledge** (facts it rests on — read-only, never owning/replacing truth), **Law**, and other policies. **Source attribution**: origin recorded (which law/regulation/board decision). A change to a referenced fact/law flags dependent policies for review.

### 5.10 Conditions & Constraints & 5.12 Enforcement Contracts

- **Conditions** (when a rule applies) and **constraints** (what it bounds) are structured, evaluable predicates. The **enforcement contract** (§3.7) declares how/where/by-whom the rule is enforced. Policy defines all three; **Governance evaluates conditions at decision time; Execution enforces constraints at effect time.**

### 5.13 Policy Validation & 5.14 Consistency / Conflict

- **Validation** checks a policy for anatomy completeness, scope-consistency, dependency consistency, and non-contradiction with higher/broader policy and Law. **Consistency**: the effective rule-set must be conflict-free at any scope; a conflict (two rules contradicting) is flagged `conflicted` and **resolved before ratification** — an authoritative contradiction can never bind.

### 5.15 Policy Authority Level & 5.16 Ratification (via Governance)

- **Authority level**: `authoritative` (ratified, binding) | `provisional` (ratified-but-time-boxed pending review). **Only ratified + authoritative policy participates in the Authority Stack.** **Ratification is a Governance decision** (§9) — Policy proposes; Governance ratifies; separation of duties (proposer ≠ sole ratifier).

### 5.17 Policy Simulation & 5.18 Testing & Dry Run

- **Simulation**: evaluate a proposed rule-set against scenarios/history to see its effect **before it binds** — **simulation never creates organizational effects** (no real block/approval/effect; posture-safe, mirrors Command/Execution simulation). **Testing**: rule test-cases (given input → expected allow/deny). **Dry run**: run a rule in shadow (log what it *would* do) without enforcing — safe rollout.

### 5.19 Policy Review, Expiration, Retirement, Supersession

- **Review**: every policy has a review cadence; stale rules (past cadence/expiry) flag `stale` and route to steward review. **Expiration**: past `expirationDate` a rule is no longer authoritative (flagged, governed). **Retirement**: governed removal from active authority. **Supersession**: a new ratified version replaces the old; superseded remains historical.

### 5.20 Policy Audit, Observability, Metrics, Cost, Provider Independence

- **Audit**: every policy change immutably recorded (canonical Spec 48 §7.3). **Observability/metrics**: rule count by domain, violation rates (from enforcers), exception counts, staleness, conflict rate, simulation coverage. **Cost**: policy-evaluation overhead measured/bounded. **Provider independence**: any model-assisted policy analysis runs via Commands/Execution — no bound SDK.

### 5.21 The rule boundary

- Policy **defines** rules and their enforcement contracts but **enforces/approves/executes/reasons nothing and owns no truth/intent.** A ratified rule *binds* only because Governance applies it at decision gates and Execution enforces it at the effect boundary. This boundary is why the organization can have one authoritative, consistent, testable rulebook — without that rulebook ever becoming the enforcer, the approver, the purpose, or the truth.

---

## 6. Lifecycle

A Policy carries the **canonical two-axis model** (Spec 48 §6): lifecycle (governed) + health (observed), never crossing. Ratification-centric (like Mission/Knowledge), because policy is authoritative.

Governing rule: **a rule becomes authoritative only through Governance-ratification, is scope-consistent and conflict-free, is versioned never overwritten, binds equally, and is enforced by Governance/Execution — Policy defines it, never enforces or approves it.**

### 6.1 Lifecycle dimension

**`policyLifecycleStatusEnum`** (specified): `draft | proposed | under-review | ratified | superseded | deprecated | expired | retired | archived`.

| Lifecycle state | Meaning | Mutable? | Authoritative? (in stack) |
|---|---|---|---|
| **draft** | Rule being authored | Yes (pre-review) | No |
| **proposed** | Submitted to Governance for ratification; frozen | No | No |
| **under-review** | Governance review + gates (consistency/conflict) | No | No |
| **ratified** | Approved by Governance — authoritative, binding | Version-only (correction) | **Yes** |
| **superseded** | Replaced by a newer ratified version | No (immutable) | No (historical) |
| **deprecated** | Marked outdated; retained, use-discouraged | No | Waning (flagged) |
| **expired** | Past expiration date — no longer authoritative | No | No |
| **retired** | Governed removal from active authority | No (immutable) | No |
| **archived** | Terminal | No (immutable) | No |

**Lifecycle transitions (governed — ratification via Governance §5.12):**

| Transition | From → To | Precondition | Effect | Emits |
|---|---|---|---|---|
| **Draft** | ∅ → draft | Owner/steward authors a rule | rule drafted; `policyHealth=unknown` | `PolicyDrafted` |
| **Propose** | draft → proposed | Anatomy complete; scope-consistency + dedup validation pass | submitted to Governance; frozen | `PolicyProposed` |
| **Review** | proposed → under-review | Governance session (domain gates, conflict check) | consistency/conflict evaluated | `PolicyUnderReview` |
| **Ratify** | under-review → ratified | **Governance ratifies**; no conflict; scope-consistent; authority satisfied | authoritative; predecessor (if correction) superseded atomically; `ratifiedAt/By` set | `PolicyRatified` (+ `PolicySuperseded` for predecessor) |
| **Reject** | proposed/under-review → draft \| archived | Governance rejects | back to draft or archived; **active rules unchanged** | `PolicyRejected` |
| **Correct** | ratified → superseded (+ new ratified) | A correction is ratified (Governance) | new version supersedes; history preserved | `PolicyCorrected` |
| **Supersede** | ratified → superseded | Newer ratified version replaces | historical; lineage linked | `PolicySuperseded` |
| **Deprecate** | ratified → deprecated | Steward marks outdated | use-discouraged, retained | `PolicyDeprecated` |
| **Expire** | ratified → expired | Past `expirationDate` | no longer authoritative | `PolicyExpired` |
| **Retire** | ratified/deprecated/expired → retired | Governed removal | removed from active authority | `PolicyRetired` |
| **Restore** | deprecated/retired/expired → ratified | Governed re-ratification | re-authoritative | `PolicyRestored` |
| **Archive** | retired/superseded → archived | Governed retirement | terminal | `PolicyArchived` |

Every transition is Governance-authorized and immutably audited. **Health never appears in this table.** Ratification/supersession are **atomic** — the effective rule-set is never, for an instant, inconsistent (mirrors Mission/Knowledge continuity). **Policy proposes each transition; Governance authorizes it.**

### 6.2 Health dimension

**`policyHealthEnum`** (specified): `unknown | current | stale | conflicted`.

| Health state | Meaning | Set how |
|---|---|---|
| **unknown** | No sufficient signal (default; also non-ratified/terminal) | default / on clear |
| **current** | Ratified, fresh, consistent, uncontested | auto |
| **stale** | Past review cadence / near expiry / referenced fact changed | auto |
| **conflicted** | Contradicts another policy or a referenced fact/law | auto |

**Health rules (canonical Spec 48 §6):** health only for `ratified`/`deprecated`; auto-derived from freshness/expiry/reference-changes/consistency; **never moves lifecycle** (a `conflicted`/`stale` rule stays authoritative until governed-corrected, but signals cautious application / steward review); cleared to `unknown` on terminal.

### 6.3 Terminal-state rules

- **retired / archived** terminal; **superseded/deprecated/expired** retained historically. **Superseded policy remains historically accessible.**
- **Policy changes are versioned, auditable, and reproducible; never silently overwritten.**
- **Immutable audit history**; policy erasure (rare) via the explicit governed erasure flow (Identity §5), tombstoned.
- **Restore** re-ratifies (governed) from deprecated/retired/expired; a superseded version is not "restored" — reinstating old rules is a new ratification.

---

## 7. Constraints

Structural and semantic constraints, enforced by the module — canonical where marked.

**Structural / hard invariants (enforced):**

1. **Defines, never enforces.** **Policy defines rules; Policy never executes rules; Policy never enforces itself.** Enforcement is Governance (decisions) + Execution (effects).
2. **Never self-approves.** **Policy never approves itself; Governance is the only module that authorizes policy changes.**
3. **Only ratified is authoritative.** **Only ratified policies become authoritative; only authoritative policies participate in the Authority Stack.**
4. **Mandatory anatomy.** Every policy carries owner, steward, authority level, scope, applicability, effective/expiration dates, version, lineage, provenance, rationale, references, review cadence — else invalid.
5. **Versioned, auditable, reproducible.** **Policy changes are versioned and auditable; policy decisions are reproducible.** Corrections create versions; superseded retained.
6. **Scope-consistent & conflict-free.** Narrower scope may tighten, never relax, broader; the authoritative rule-set is conflict-free (conflicts resolved before ratification).
7. **Applies equally.** **Policy applies equally to humans, agents, workflows, commands, and execution.** No actor is above the rules; exemptions are governed exceptions only.
8. **Tenant isolation & immutable audit.** `tenantId` NOT NULL; every change immutably audited.
9. **Terminal immutability.** Superseded/deprecated/expired/retired/archived immutable.

**Semantic (module-enforced) — the boundary guards:**

10. **Not enforcement, execution, approval.** Policy runs no rule, performs no effect, authorizes no change.
11. **Never owns intent.** **Policy never owns organizational intent; Policy constrains Mission but never defines Mission.** (An approved rule bounds purpose; it does not author it.)
12. **Never owns truth.** **Policy never owns truth; Policy references Knowledge but never replaces it.** A rule may rest on a fact (reference), it does not become the fact.
13. **Not Identity.** Applies to actors; does not own actors/permissions (Identity does).
14. **Simulation is effect-free.** **Policy simulation must never create organizational effects.**
15. **Governed change only.** Every ratification/correction/retirement is a Governance decision; Policy has no self-authorization path.
16. **Lifecycle/health orthogonal (canonical).** Separate axes; health never moves lifecycle.

---

## 8. Validation

Validation runs at the canonical gate sequence (Spec 48 §8), specialized for rules. Policy fails closed: on ambiguity it does not ratify, over-apply, or contradict.

**Anatomy validation (draft → proposed):**

- All mandatory-anatomy fields present and well-formed; `ruleType`, `policyDomain`, `scope` valid; `statement`/`conditions`/`constraints`/`enforcementContract` evaluable; `owner`/`steward` resolve.

**Consistency & conflict validation (proposed → under-review → ratified):**

- **Scope consistency:** the rule does not relax a broader-scope rule; a department rule tightening company-wide is allowed, contradicting is rejected.
- **Conflict:** the rule does not contradict another authoritative policy or Law; a conflict must be resolved (supersede/reject/reconcile) before ratification — no authoritative contradiction binds.
- **Dependency/reference consistency:** referenced Knowledge/Law/policies resolve and are consistent; a rule resting on retired/contested truth is flagged.

**Authority validation (ratification, via Governance):**

- Ratifier holds scope-appropriate authority (Governance decision); **separation of duties** (proposer ≠ sole ratifier); higher-domain/risk → stricter (Governance gate suite §9).

**Authority-stack validation:**

- The rule conforms to Law/Security/Compliance (above it in the stack); a rule violating a higher legal/security layer cannot ratify.

**Simulation validation (before ratification of impactful rules):**

- Simulation/dry-run evaluated with **no organizational effect**; a rule with harmful simulated impact is revised/blocked.

**Applicability validation:**

- Applies equally to the declared actor classes (humans/agents/workflows/commands/execution); no actor is silently exempted; exemptions are governed exceptions.

**Health validation (continuous):**

- `policyHealth` non-`unknown` only ratified/deprecated; unresolved inputs → `unknown`; never moves lifecycle.

Only a rule passing all gates becomes authoritative. A failure refuses ratification with the violated rule recorded; a non-authoritative or conflicting rule never binds.

---

## 9. Relationships (how Policy interacts with every module 34–49)

| Module | How Policy interacts |
|---|---|
| **Law (external)** | **Above Policy.** Law/regulation is the absolute ceiling; Policy implements/references law and may never contradict it. A law change flags dependent policies for review. |
| **Identity (34)** | **Applies to; does not own.** Policy applies to actors (humans/agents/service/system) and references roles/permissions, but Identity owns the actors and grantable permissions; Policy never grants/changes them. |
| **Mission (35)** | **Constrains; never defines.** Approved Policy **outranks Mission** in the stack — a Mission may pursue only purposes the rules permit; Policy never authors or owns the Mission. |
| **Goal (36) / Plan (37) / Task (38)** | **Constrains.** Rules bound what outcomes/strategies/work may be pursued; a Goal/Plan/Task violating a policy is blocked (Governance) or escalated. |
| **Workflow (39) / Command (40)** | **Constrains + enforcement contract.** Policy's enforcement contract declares which gates a workflow/command must pass; Governance evaluates at approval, Execution enforces at effect. **Applies to workflows and commands equally.** |
| **Execution (41)** | **The runtime enforcer.** **Execution is the only module that enforces runtime effects** — it applies policy constraints at the effect boundary (Spec 48 §9.1). Policy states the contract; Execution enforces it; Policy never enforces. |
| **Agent (42)** | **Binds equally.** Rules apply to agents exactly as to humans; an agent's actions are policy-bound; a policy may forbid/require agent behaviors. Agents may propose policy (recommend) but never ratify. |
| **Working/Long-term Memory (43/44)** | **Governs data.** Data-governance/privacy/retention policies bind memory (what may be stored/retained/forgotten); Policy references, Governance authorizes, the memory module enforces retention per policy. |
| **Knowledge (45)** | **References; never replaces.** A rule may rest on a canonical fact (reference to Knowledge); **Policy references Knowledge but never replaces or defines truth.** Rules (Policy) and facts (Knowledge) are distinct authoritative layers. |
| **Reasoning (46)** | **Constrains.** Reasoning is policy-constrained (Reasoning §5.6); a conclusion requiring a policy violation is flagged/escalated. Policy is an input to reasoning, never reasoned-away. |
| **Learning (47)** | **Constrains; unlearnable.** Learning is policy-bound and **may never change a policy** (authority not learnable, Learning §7.11); a learned "efficiency" that weakens a rule is refused. A policy change is a Governance decision, never a learning outcome. |
| **Architecture Consolidation (48)** | **Realizes the "Approved Policy" layer** of the canonical Authority Stack; Policy is the module the stack's "Approved Policy" node refers to. |
| **Governance (49)** | **Authorizes.** **Governance is the only module that authorizes policy changes** (ratify/correct/retire); Governance **consumes** policy as the rules it applies at every gate. Policy defines the rules; Governance applies them. The two are strictly distinct (referee vs rulebook). |

**The rule spine:** `Policy defines rules → Governance authorizes rule changes + applies rules at decision gates → Execution enforces rule effects at runtime`, with rules referencing Knowledge (facts), constraining Mission (purpose), and binding every actor equally. Policy is the authoritative rulebook node — never the enforcer, the approver, the purpose, or the truth.

### 9.1 Explicit distinction tables

**Policy vs Governance:** Policy = the rules; Governance = applies/authorizes them. Policy defines, Governance enforces-at-gate + authorizes changes. Policy proposes changes; Governance ratifies.

**Policy vs Mission:** Mission = purpose (what we're for); Policy = rules (what's allowed). Approved Policy **outranks** Mission. Policy constrains Mission; Mission never overrides an approved rule; Policy never defines Mission.

**Policy vs Knowledge:** Knowledge = truth (what is); Policy = rules (what may/must). A rule references facts; a fact is not a rule. Both authoritative, distinct layers; Policy references Knowledge, never replaces it.

**Policy vs Identity:** Identity = who exists + grantable permissions; Policy = rules applying to them. Policy binds actors; Identity owns actors. Policy never grants permissions (Identity does, Governance authorizes).

**Policy vs Reasoning:** Reasoning = thinking (recommends); Policy = rules (constrains the thinking). Reasoning consumes Policy as a bound; Policy never reasons.

**Policy vs Execution:** Execution = performs + enforces effects; Policy = defines rules. Policy states the enforcement contract; Execution enforces it. Policy never executes.

**Policy vs Learning:** Learning = improves behavior (proposes); Policy = rules (unchangeable by Learning). Learning is policy-bound; a policy change is Governance's, never Learning's.

**Policy vs Law:** Law = external absolute ceiling; Policy = internal rules implementing/within Law. Policy may never contradict Law; Law outranks all policy.

**Constant:** Policy **defines the rules**; Governance applies/authorizes, Execution enforces, Mission is bounded, Knowledge is referenced, Identity is bound, Reasoning is constrained, Learning is unable to change them, and Law is above all.

---

## 10. Events

Every Policy transition emits a domain event (canonical envelope, Spec 48 §10.1). Governance, Execution, and constrained modules subscribe.

| Event | Trigger | Payload | Consumers | Impact |
|---|---|---|---|---|
| `PolicyDrafted` | Rule authored | domain, ruleType, scope | Observability | Candidate rule |
| `PolicyProposed` | Submitted to Governance | proposerRef | **Governance** | Ratification requested |
| `PolicyUnderReview` | Governance reviewing | conflicts? | Stewards, Governance | Consistency/conflict evaluated |
| `PolicyRejected` | Governance rejects | reason | Owner, Audit | Rules unchanged |
| `PolicyRatified` | Governance ratifies | ratificationRef, authorityLevel | **Execution, Governance, all constrained modules** | New authoritative rule in force; consumers re-anchor |
| `PolicySuperseded` | Newer version replaces | successorPolicyId | Execution, Audit | Old rule historical |
| `PolicyCorrected` | Correction ratified | newPolicyVersion, reason | Governance, Audit | History preserved; successor authoritative |
| `PolicyHealthChanged` | Freshness/consistency recomputed (ratified/deprecated) | fromHealth, toHealth | Stewards, Observability | Currency signal; **no lifecycle change** |
| `PolicyStale` | Past review cadence / near expiry | reviewCadence | Stewards, Notifications | Review due; still authoritative |
| `PolicyConflicted` | Contradiction detected | conflictRef | **Governance**, Stewards | Flagged for resolution |
| `PolicyDeprecated` / `PolicyExpired` / `PolicyRetired` | Outdated/expired/removed | reason | Execution, Reporting | Consumers stop enforcing; retained |
| `PolicyRestored` | Governed re-ratification | fromState | Governance, Audit | Re-authoritative |
| `PolicyReferenceChanged` | A referenced fact/law/policy changed | referenceRef | Stewards | Dependents flagged for review |
| `PolicySimulated` | Dry-run/simulation | scenario, syntheticResult | Observability | Effect previewed; **no real effect** |
| `PolicyExceptionGranted` | Governed exception to a rule | scope, expiry | **Governance, Security**, Audit | Time-boxed, audited deviation |
| `PolicyArchived` | Terminal | — | Reporting | Rule retired |

**Canonical stream separation (Spec 48 §10.4):** lifecycle vs health events, independent. `PolicyRatified` is a re-anchor signal for every enforcer (like `MissionRatified`/`KnowledgeRatified`).

---

## 11. KPIs

| KPI | Definition | Source |
|---|---|---|
| **Rule anatomy completeness** | % of policies with full mandatory anatomy (target 100%) | validation |
| **Authoritative coverage** | % of policies ratified + authoritative vs draft/expired | lifecycle |
| **Authorization integrity** | % of policy changes authorized by Governance (target 100%) | Governance records |
| **Self-approval incidents** | Count of any policy change without Governance (target 0) | audit reconciliation |
| **Conflict rate / resolution time** | Active conflicts (target 0); median resolution | conflict events |
| **Scope-consistency conformance** | % of narrower rules consistent with broader (target 100%) | consistency checks |
| **Freshness** | % of authoritative policies `current` vs `stale` | `policyHealth` |
| **Staleness backlog** | Policies past review cadence/near expiry | freshness |
| **Violation rate** | Enforcer-reported policy violations per window (from Governance/Execution) | enforcement telemetry |
| **Exception rate** | Governed exceptions granted; % time-boxed + audited (target 100%) | exception events |
| **Simulation coverage** | % of impactful rule changes simulated before ratification | simulation records |
| **Simulation-effect incidents** | Count of simulations causing a real effect (target 0) | simulation audit |
| **Reproducibility** | % of policy decisions reproducible on replay | replay checks |
| **Reference integrity** | % of policies with valid, consistent references (Knowledge/Law) | reference checks |
| **Stewardship coverage** | % of policies with an active steward (target 100%) | steward assignment |
| **Audit completeness** | % of policy changes immutably recorded (target 100%) | audit chain |

---

## 12. Failure Scenarios (50)

Governing rule: **Policy fails closed, authoritative, and consistent** — on ambiguity it does not ratify, over-apply, contradict, or enforce; nothing overwrites; no rule binds unratified; no conflict binds.

1. **Policy tries to enforce itself.** Refused — Policy defines; Governance/Execution enforce.
2. **Policy approves itself.** Refused — Governance is the only authorizer of policy change.
3. **Un-ratified rule treated as authoritative.** Refused — only ratified + authoritative participates in the stack.
4. **Rule missing mandatory anatomy.** Invalid — cannot propose without owner/steward/scope/dates/version/lineage/provenance/rationale/references/cadence.
5. **Rule contradicts a higher/broader rule.** Blocked — scope-consistency; resolved before ratification.
6. **Two authoritative rules conflict.** `conflicted`; resolved before ratification; no authoritative contradiction binds.
7. **Rule contradicts Law.** Blocked — Law outranks all policy.
8. **Department rule relaxes a company-wide rule.** Rejected — narrower may tighten, never relax.
9. **Policy defines/owns a Mission.** Refused — constrains Mission, never defines it.
10. **Policy replaces/owns truth.** Refused — references Knowledge, never replaces it.
11. **Policy grants a permission.** Refused — Identity owns permissions; Governance authorizes grants.
12. **In-place edit of ratified rule.** Refused — corrections version and re-ratify.
13. **Correction loses history.** Impossible — pre-correction version retained/superseded.
14. **Proposer sole-ratifies.** Refused — separation of duties (Governance).
15. **Policy change without Governance.** Blocked — Governance is the only authorizer.
16. **Simulation causes a real effect.** Impossible — simulation is effect-free by construction.
17. **Actor exempts itself from a rule.** Refused — rules apply equally; exemptions are governed exceptions only.
18. **Exception granted silently.** Refused — exceptions are governed, time-boxed, audited.
19. **Expired rule still enforced.** Impossible — past expiry, no longer authoritative; enforcers stop.
20. **Stale rule trusted as current.** `stale` flags it; steward review; still authoritative but flagged.
21. **Deprecated rule relied on.** Deprecation signals enforcers to stop; retained.
22. **Retired rule returned as authoritative.** Impossible — retired removed from active authority.
23. **Referenced fact changes; rule stale.** `PolicyReferenceChanged`; dependents flagged for review.
24. **Referenced law changes.** Dependent policies flagged; governed review.
25. **Cross-tenant policy.** Structurally impossible.
26. **Concurrent corrections (two successors).** One ratification wins atomic flip; the other rebases; no forked lineage.
27. **Ratification/supersession non-atomic (inconsistent rule-set).** Atomic transaction; never a dual-active inconsistency.
28. **Rule applies to humans but not agents (uneven).** Rejected — applies equally unless a governed scoped exception.
29. **Policy executes/reasons/learns.** Refused — inert rules; no effect/thinking/improvement path.
30. **Bundle composed with an internal conflict.** Composition consistency check blocks; conflict resolved first.
31. **Override silently relaxes a higher rule.** Refused — overrides are governed + consistency-checked, never silent relaxation.
32. **Dry-run enforced for real.** Impossible — dry-run logs would-do only; no enforcement.
33. **Health drives lifecycle.** Refused — orthogonal; `conflicted`/`stale` never auto-retire.
34. **Terminal rule mutated.** Refused — immutable.
35. **Rule with empty rationale.** Invalid — rationale mandatory.
36. **Sensitive rule (secrets) stored plainly.** Classified/gated — secrets not plain policy content.
37. **Provider outage during model-assisted policy analysis.** Failover; provider-independent; `degraded`.
38. **GDPR-driven policy erasure.** Governed erasure flow; tombstone; rules usually retired, not erased.
39. **Legal hold vs policy erasure.** Erasure refused under hold; escalated.
40. **Duplicate policy.** Deduped/linked; not double-ratified.
41. **Reproducibility fails on replay.** Immutable record + versioned refs reproduce the decision; divergence flagged.
42. **Reasoning tries to reason a rule away.** Refused — Policy is a bound, not a suggestion; a violation escalates.
43. **Learning proposes weakening a rule.** Refused — policy change is Governance's, not learnable.
44. **Enforcement contract targets a non-enforcer.** Rejected — enforcer must be Governance-gate/Execution-gate.
45. **Rule ratified without scope.** Invalid — scope mandatory.
46. **Owner leaves; rule unmaintained.** Steward/owner reassigned before continuity.
47. **Authoritative rule references a retired fact.** Flagged for re-substantiation; currency re-reviewed.
48. **Policy outranks Mission but changed only via Governance (circularity).** Resolved: Policy sits above Mission *as a rule*, but a *policy change* is a Governance decision bound by Law/Security/Compliance (above Policy) — Governance never lets a policy change violate the layers above Policy, so there is no self-elevation; the stack is enforced top-down at ratification.
49. **Simulation coverage skipped for an impactful rule.** Impactful rules require simulation before ratification; skipping blocks.
50. **Audit write fails on a policy change.** Transactional rollback; no un-audited policy change — auditability holds.

---

## 13. Enterprise Use Cases (60)

Whole-system rule flows. Policy defines; Governance authorizes/applies; Execution enforces.

1. **Spend-approval rule.** "Spend > €10k needs Director approval" ratified; Execution/Governance enforce it on every spend Command.
2. **PII residency rule.** "Customer PII may not leave the EU region" ratified; Execution blocks non-EU data Commands.
3. **Bulk-email rule.** "Agents may not send bulk email without a compliance gate" ratified; workflows must pass the gate.
4. **Backup obligation.** "Backups run nightly" (obligation) ratified; operational enforcement scheduled.
5. **Security rule.** "Secrets never logged" ratified; Execution redacts.
6. **AI-safety rule.** "Model changes require a bias/drift review" ratified; Governance's AI-safety gate applies it.
7. **HR rule.** "Termination requires two-person approval" ratified; enforced via multi-stage governance.
8. **Financial limit.** "Agent cost limit €200/mo" ratified; Execution attributes/halts spend.
9. **Privacy retention.** "Support transcripts retained 24 months" ratified; Memory enforces retention.
10. **Legal clause rule.** "Contracts include a liability cap" ratified; legal gate enforces.
11. **Data-governance classification.** "PII must be classified on ingest" ratified; enforced at data Commands.
12. **Risk control.** "High-risk actions require human review" ratified; Governance scales strictness.
13. **Rule correction.** VAT threshold rule corrected; new version supersedes; enforcers re-anchor on `PolicyRatified`.
14. **Rule conflict resolved.** Two spend rules conflict; reconciled to one before ratification.
15. **Scope refinement.** Company-wide "no discounts below cost"; Sales department tightens to "no discounts without director sign-off" — consistent, not contradicting.
16. **Override (governed).** A more-specific regulated-market rule overrides a general one; consistency-checked.
17. **Exception (governed).** A one-time, time-boxed exception to a rule for a named deal; heightened scrutiny; audited.
18. **Simulation before ratification.** A proposed stricter approval rule is simulated against last year's spends to see its impact — no real effect.
19. **Dry-run rollout.** A new rule runs in shadow (logs would-block) before enforcement.
20. **Testing.** Rule test-cases confirm allow/deny behavior before ratification.
21. **Freshness review.** A rule past its review cadence flags `stale`; steward re-ratifies or corrects.
22. **Expiry.** A temporary COVID-era rule hits its expiration; no longer authoritative.
23. **Deprecation.** An outdated operational rule is deprecated; enforcers stop applying it.
24. **Retirement.** A discontinued product's rules retired; archived.
25. **Restore.** A retired rule becomes relevant again; governed re-ratification.
26. **Reference to Knowledge.** A pricing rule references the canonical "approval thresholds" fact — references, never copies.
27. **Referenced fact changes.** The threshold fact changes; the rule flagged for review.
28. **Referenced law changes.** A regulation update flags dependent compliance policies.
29. **Policy set.** "EU Data Handling Set" applied together to all EU operations.
30. **Policy bundle.** "GDPR Compliance Bundle" versioned and rolled out as a unit.
31. **Bundle conflict caught.** A bundle with an internal contradiction is blocked until resolved.
32. **Inheritance.** A department inherits company-wide security rules and adds stricter ones.
33. **Composition.** Multiple rules compose into a consistent effective rule-set for a workflow.
34. **Constrains Mission.** A Mission amendment that would breach an approved compliance rule is blocked — Approved Policy outranks Mission.
35. **Constrains a Goal.** A Goal requiring a policy-violating tactic is blocked at approval.
36. **Constrains a Plan.** A Plan's approach is checked against operational rules.
37. **Binds a workflow.** A workflow must pass the compliance gate its policy contract requires.
38. **Binds a command.** A delete Command must satisfy the data-governance rule.
39. **Binds execution.** Execution enforces the residency constraint at the effect boundary.
40. **Binds an agent equally.** An agent is bound by the same spend rule as a human.
41. **Binds a human.** A director is bound by the two-person termination rule.
42. **Learning cannot change a rule.** Learning proposes an "efficiency" weakening a control; refused — not learnable.
43. **Reasoning respects a rule.** Reasoning's recommendation that would breach a rule is flagged/escalated.
44. **Governance ratifies a rule.** A proposed rule passes Governance's domain gates; ratified.
45. **Governance rejects a rule.** A rule failing the legal gate is rejected; active rules unchanged.
46. **Governance authorizes a correction.** A rule correction is ratified via Governance; versioned.
47. **Emergency policy suspension.** During an incident, a rule is temporarily suspended via governed emergency exception — time-boxed, loud, auto-restored.
48. **Regulatory audit.** A regulator receives the rule + version + provenance + rationale + references + reproducible decision.
49. **Cross-department rule.** A rule spanning Finance + Legal requires both stewards.
50. **M&A rule alignment.** Merged tenants keep rules per tenant; alignment is governed, per-tenant.
51. **Data-privacy erasure rule.** A rule mandates GDPR erasure workflows; Memory/Knowledge honor it.
52. **Risk-scaled enforcement.** A high-risk rule triggers stricter governance gates than a low-risk one.
53. **Provider-independence rule.** "No single-provider lock-in for critical LLM calls" ratified; Execution's failover honors it.
54. **Observability review.** A policy dashboard shows violation rates, staleness, conflicts, exception counts.
55. **Steward handoff.** A domain steward leaves; stewardship reassigned; rules stay maintained.
56. **Provisional policy.** A time-boxed provisional rule is ratified pending Q3 review; flagged.
57. **Provisional → authoritative.** Confirmed at review; re-ratified as fully authoritative.
58. **Rule references another rule.** A workflow rule depends on a security rule; dependency consistency-checked.
59. **Applies-equally audit.** An auditor confirms a rule binds agents and humans identically.
60. **A year of governed rules.** Every significant action operated within one authoritative, consistent, versioned, accountable rulebook — enforced by Execution, authorized by Governance, referencing Knowledge, bounding Mission, binding all equally. **The rule guarantee: what is allowed/required/forbidden was defined once, authoritatively, and applied to everyone the same.**

---

## 14. Extensibility

- **New policy domains** (e.g. `esg`, `ethics`) register with categories/gates — map to Governance's gate suite.
- **New rule types** extend `ruleTypeEnum` behind the same define-not-enforce contract.
- **Richer conditions/constraints** (temporal, quantitative, ML-assisted) evaluate behind the same effect-free simulation + Execution-enforced boundary.
- **Policy-as-data engines** (external rule engines) integrate behind the enforcement-contract + provider-independence abstraction.
- **Federated policy** (holding-level, cross-tenant governed) adds as governed edges — never ambient.
- **Automated freshness** (monitor referenced law/fact sources) extends review while ratification stays governed.
- **Formal verification** of rule-set consistency deepens validation behind the conflict-free guarantee.

The invariant enabling all: **authoritative only when ratified; defines not enforces; Governance authorizes changes; versioned/auditable/reproducible; references Knowledge, constrains Mission, binds all equally; simulation effect-free.** New demands plug into domains/rule-types/conditions without touching the define-not-enforce or ratification boundaries.

---

## 15. Architectural Principles

1. **Policy defines the rules; it never enforces them.** Governance applies rules at decision gates; Execution enforces effects; Policy runs nothing.
2. **Policy never approves itself.** Governance is the only authority that authorizes policy changes; Policy proposes, Governance ratifies.
3. **Only ratified policy is authoritative; only authoritative policy is in the stack.** Draft/expired/deprecated rules do not bind.
4. **Every rule is fully anatomized, versioned, auditable, reproducible.** Owner/steward/authority/scope/dates/lineage/provenance/rationale/references/cadence — always; corrections version, never overwrite.
5. **Rules are canonical and consistent.** Scope-consistent, conflict-free; a contradiction is resolved before it binds.
6. **Rules bind everyone equally.** Humans, agents, workflows, commands, execution — no actor above the rules; exemptions are governed exceptions.
7. **Policy references truth, constrains purpose, owns neither.** References Knowledge (never replaces it); constrains Mission (never defines it); owns no intent or truth.
8. **Not Identity, not enforcement.** Applies to actors without owning them; states enforcement contracts without running them.
9. **Simulation is effect-free; changes are governed.** Rules are testable/simulatable before binding, with no real effect; every change is a Governance decision.
10. **Lifecycle and health are separate axes.** Ratification-centric governed lifecycle; observed currency/consistency health (`current`/`stale`/`conflicted`), ratified-only, automatic, never changes lifecycle.

---

## 16. What Policy NEVER does

- **Never enforces rules or executes effects.** Enforcement is Governance (decisions) + Execution (effects).
- **Never approves, ratifies, or authorizes itself.** Governance authorizes all policy changes.
- **Never binds while un-ratified, or lets a draft/expired rule participate in the Authority Stack.**
- **Never owns organizational intent, or defines Mission** — it constrains Mission.
- **Never owns or replaces truth** — it references Knowledge.
- **Never owns actors or grants permissions** — that is Identity + Governance.
- **Never reasons, executes, or learns.** It is inert rules.
- **Never lets simulation create a real effect, or a change bypass Governance.**
- **Never contradicts Law or a higher-scope rule, holds an authoritative conflict, or silently relaxes a rule.**
- **Never exempts an actor silently, mutates a terminal version, or lets health change lifecycle.**

---

## Implementation Assumptions

- **New enums (specification-level, not yet migrated):** `policyLifecycleStatusEnum` (`draft | proposed | under-review | ratified | superseded | deprecated | expired | retired | archived`), `policyHealthEnum` (`unknown | current | stale | conflicted`), `policyDomainEnum` (10 domains), `ruleTypeEnum` (`allow | require | forbid | constrain | obligation`), `policyScopeEnum` (`company-wide | department | domain`), `policyAuthorityEnum` (`authoritative | provisional`). Reuses `approvalStateEnum`, `roleTypeEnum`, `permissionScopeEnum`. **This is the final enum set** of the 34–50 architecture; the consolidated migration is now fully scoped.
- **Existing `policy` schema (Identity §3.11):** extended to realize this spec (domain/category/ruleType/scope/anatomy/enforcement-contract/lineage/provenance) — reconciled at implementation, not replaced.
- **Policy is defined here; ratified and enforced elsewhere.** Ratification is a Governance decision (Spec 49); runtime enforcement is Execution (Spec 41) + Governance gates. Implementation must route policy ratification through Governance and policy enforcement through Governance-gate/Execution — Policy has no self-authorization or enforcement path.
- **The circularity is resolved (Failure #48):** Approved Policy outranks Mission *as a rule*, but a *policy change* is a Governance decision bound by the layers above Policy (Law/Security/Compliance). Governance enforces the stack top-down at ratification, so policy can outrank Mission without ever self-elevating.
- **Policy references Knowledge read-only**; a rule resting on a fact links to the Knowledge object by id+version.
- **No code, SQL, migrations, or schema changes produced** — architecture specification only, per instruction.

## Open Questions for the Implementation Phase

The seventeen-specification architecture (34–50) is complete. The remaining questions are no longer architectural — they are implementation questions:

- **The consolidated enum + schema migration (now fully scoped, top priority).** Specs 35–50 defined ~55 new enums (all `*LifecycleStatusEnum`, `*HealthEnum`, `*ScopeEnum`, `*TypeEnum`, `*DomainEnum`, plus risk/voting/rule types) and extensions to ~14 existing tables. Define one consolidated migration: the enum catalog with one naming convention (resolve `missionState` vs `*LifecycleStatus`), the `_base.ts` actor-FK wiring (deferred since foundation), and the table-extension map — sequenced per Spec 48 dependency order (foundation → Identity → cognitive/execution spine → Agent → memory substrate → Reasoning → Learning → Governance → Policy).
- **Shared backbones, built once (Spec 48 §Implementation Assumptions):** the immutable audit sink, the canonical event envelope + bus (decide event-sourced vs state-with-events first), the two-axis lifecycle/health library, the governance-gate contract, the two authority-enforcement checkpoints, and the single human-review inbox. These must exist before module implementation, not per-module.
- **Governance + Policy first among domain modules** (after foundation + Identity), because every other module's gates depend on them.
- **Enforcement wiring:** how the enforcement contract (Policy) is compiled into actual Governance gates and Execution checks — the concrete mechanism the whole rule system rests on.
- **Reference-integrity across authoritative layers:** Policy→Knowledge and Policy→Law references need a live consistency mechanism (flag dependents on change) — define the reference/subscription backbone.
- **Technical Debt Register (Spec 48):** TD-1 (enum backlog) and TD-2 (`_base.ts` actor FK) are now the immediate P0; TD-4 (Decision/Governance/Policy specs) is **resolved** (Governance = 49, Policy = 50; a standalone Decision spec is deemed unnecessary — decision = chain approval + Governance gate). The remaining debts are implementation-sequencing concerns.

---

*End of Policy Specification v1.0 — the organizational rule system of Hebun, and the seventeenth and final specification of the Hebun Core Reference Architecture (34–50). Policy defines the rules; Governance authorizes their change and applies them; Execution enforces their effects; Mission is bounded by them; Knowledge is referenced by them; and every actor is bound by them equally. No implementation code. No SQL. No TypeScript. No other specification modified.*
