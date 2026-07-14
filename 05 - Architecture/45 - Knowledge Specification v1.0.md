# Knowledge Specification v1.0

> Stage 12 — Knowledge module, complete Enterprise Architecture Specification.
> This document is the permanent architectural reference for Knowledge in Hebun AI.
> It specifies the canonical organizational-truth layer — the single source of what the company accepts as true. It adds no implementation. It defines boundaries.

**Status:** Definitive · **Scope:** Knowledge module only · **Grounded in:** the schema primitives in `src/db/schema/_base.ts` (`rootColumns`, `tenantColumns`) and `_enums.ts` (`lifecycleStatusEnum`, `approvalStateEnum`, `memoryKindEnum`, `roleTypeEnum`, `permissionScopeEnum`), the existing `knowledge` schema (Identity/Platform layers), and the Identity (34) through Long-term Memory (44) Specifications v1.0.

**Position in the cognitive substrate:**

```
Long-term Memory (doc 44) — durable store of retained EXPERIENCE (may conflict)
      │  governed promotion + ratification (only path to truth)
      ▼
Knowledge (this document) — CANONICAL organizational TRUTH (may NOT conflict)
      ▲  read-only, authoritative retrieval; OVERRIDES memory during reasoning
```

**Authority precedence (unchanged, absolute):**

```
Law → Security/Compliance → Approved Policy → Mission → Goals → Plans → Tasks → Workflows → Commands → Execution → Agent → Working Memory → Long-term Memory → Knowledge
```

> Note on precedence vs authority-of-truth: Knowledge sits at the *storage* bottom of this list (it is a substrate, not a commander), but within *reasoning* it is **authoritative** — Knowledge is the single source of organizational truth and **overrides Memory** wherever they disagree. Policy and Mission *consume* Knowledge; they are not Knowledge. Knowledge itself commands nothing — it does not reason, decide, execute, or own intent.

Knowledge is the **canonical organizational-truth layer**. **Memory stores what happened; Knowledge stores what the organization accepts as true.** Where Long-term Memory may hold conflicting recollections, **Knowledge may not** — it is canonical, ratified, versioned, and singular per fact. Every Knowledge object originates from a **governed promotion** out of Long-term Memory and is **ratified** before it becomes truth.

**Critical clarification — Knowledge is truth, not memory, not rules, not thinking:**

> Knowledge is **NOT** Memory. Knowledge is **NOT** Policy. Knowledge is **NOT** Mission. Knowledge is **NOT** Reasoning.
>
> Knowledge is the **single source of what the company accepts as true** — canonical facts, definitions, and authoritative domain understanding. Memory *remembers experiences* (and may conflict); Policy states *what is allowed/required*; Mission states *what the company is for*; Reasoning *thinks*. Knowledge states *what is true* — one canonical answer per fact — and it never remembers, rules, aspires, or reasons.

---

## 1. Purpose

### Why the Knowledge layer exists

Long-term Memory (doc 44) durably retains experience — but experience conflicts, ages, and carries confidence rather than authority. Two agents may remember a customer's plan tier differently; both memories can coexist. Yet a digital company cannot *operate* on conflicting recollections: when Reasoning must act, it needs one canonical answer to "what is true here." Something must hold the company's **accepted truth** — singular, ratified, versioned, authoritative — distilled from memory through governance, and override memory wherever they disagree. Knowledge is that layer.

Knowledge is the **system of record for organizational truth: the single, canonical, ratified, versioned store of what the company accepts as true**, organized into domains and categories, with provenance, lineage, authority, and freshness. It is the company handbook to Memory's diary: where Memory says "we experienced X," Knowledge says "this is our authoritative understanding." Every Knowledge object enters only by **governed promotion from Long-term Memory** followed by **ratification** — never by direct write, never by silent inference. And because it is *truth*, it is **canonical**: one authoritative statement per fact, conflict-free by construction.

Without a Knowledge layer, six things break: no canonical truth (agents reason from conflicting memories), no authority model (nothing overrides a wrong recollection), no governed distillation (experience never becomes accepted fact), no consistency (contradictory "facts" coexist), no ratification discipline (truth changes without governance), and no separation of truth from experience/rules/intent (Memory, Policy, Mission blur together). Knowledge closes that gap and holds the **truth boundary**: the one place canonical organizational truth lives — ratified, singular, versioned, authoritative over memory — and always distinct from what is remembered, allowed, aspired to, or reasoned.

### Business problem it solves

1. **Canonical truth to act on.** Operations need one authoritative answer per fact, not a spread of recollections. Knowledge provides the single canonical statement, overriding conflicting memory.
2. **Governed distillation of experience into truth.** Experience must become accepted truth only through governance — promotion + ratification — not by accident or by an agent's assertion. Knowledge is that gate.
3. **Consistency and authority.** Truth must be conflict-free, versioned, and authoritative: corrections create versions (history preserved), superseded truth stays historically accessible, and Knowledge wins over Memory wherever they disagree.

### Its responsibility

- Own the lifecycle of every canonical truth: `draft → proposed → under-review → ratified → superseded → deprecated → retired → archived` (governed), separate from health `unknown → current / stale / contested` (observed).
- Be the **single source of organizational truth**; accept content **only** via **governed promotion from Long-term Memory** followed by **ratification** (§5.11–5.13). No direct write; no un-ratified truth.
- Organize truth into a **Knowledge Registry** of **domains, categories, and a hierarchy** — company-wide, department, and domain-scoped Knowledge — each with **ownership and stewardship**.
- Guarantee **canonical consistency**: one authoritative statement per fact; **conflict is not allowed** and is resolved before ratification (§5.14).
- Carry **provenance, source attribution, lineage, authority level, freshness/expiration, dependencies, and cross-domain references**; support **discovery, retrieval, indexing, search** — read-only and authoritative.
- Enforce **versioning and supersession that preserve history**, **review**, **deprecation/retirement**, **security, permission enforcement, and multi-tenant isolation**; expose **observability and auditability**; be **provider-independent**.
- **Override Memory during reasoning**: when Reasoning retrieves both, Knowledge is authoritative.
- Emit Knowledge events; be consumed (read-only) by Reasoning, Policy, Mission, Execution — never mutated by them.

### What is explicitly NOT its responsibility

- **Knowledge is not Memory.** It holds *accepted truth* (canonical, conflict-free), not *retained experience* (which may conflict). Memory can reference Knowledge; **Memory cannot redefine Knowledge.**
- **Knowledge is not Policy or Mission.** Policy states what is *allowed/required*; Mission states what the company is *for*. Both **consume** Knowledge; neither *is* Knowledge, and Knowledge defines neither.
- **Knowledge never reasons, decides, or executes.** Reasoning **consumes** Knowledge but never mutates it; Execution **consumes** Knowledge but never writes it. Knowledge is inert truth, not an actor.
- **Knowledge never owns business intent.** It states facts; it holds no Mission/Goal/Plan intent.
- **Knowledge accepts no direct write and no conflict.** Every write is promotion+ratification; contradictory truth cannot be stored.
- **Knowledge never silently modifies.** Corrections create versions; superseded truth remains historically accessible.

---

## 2. Mental Model

If Long-term Memory is an employee's **diary and the department archive** (everything experienced, including contradictions), Knowledge is the **company handbook and the canonical reference shelf** — the single authoritative statement of what the company holds to be true, ratified by the responsible stewards, versioned like an official manual, with each edition superseding the last but the old editions kept on file. When a memory says one thing and the handbook says another, the handbook wins. The handbook does not remember every meeting (that is the diary), it does not set the rules of conduct (that is Policy), it does not state the company's purpose (that is Mission), and it does not think (that is Reasoning) — it states, canonically, *what is true.*

The mental model in one line: **Knowledge is the single canonical, ratified, versioned store of organizational truth — promoted from Memory and ratified through governance, conflict-free by construction, authoritative over Memory during reasoning, consumed but never mutated by Reasoning/Policy/Mission/Execution, and never itself a rememberer, ruler, aspirer, or thinker.**

Eight properties define the model:

- **Canonical.** One authoritative statement per fact. Unlike Memory, **Knowledge may not hold conflicting information** — conflict is resolved before truth is ratified.
- **Ratified, not merely promoted.** A candidate becomes truth only by governed **ratification** (like Mission/Policy), a stronger gate than Memory's promotion-acceptance. Un-ratified content is not Knowledge.
- **Authoritative over Memory.** In reasoning, Knowledge **overrides** Memory wherever they disagree. Memory informs; Knowledge decides what is true.
- **Sourced from Memory.** Every Knowledge object originates from a governed promotion out of Long-term Memory — truth is distilled experience, governed, not invented.
- **Versioned & consistent.** Corrections create new versions; superseded truth stays historically accessible; the active canonical version is singular and consistent.
- **Domain-organized & stewarded.** Truth lives in a registry of domains/categories with owners and stewards accountable for its accuracy and currency.
- **Fresh & governed-forgettable.** Truth has freshness/expiration; it is deprecated, retired, or superseded — always by governance, never by silent staleness masquerading as fact.
- **Inert & bounded.** Knowledge states; it does not reason, decide, execute, or own intent. It is beneath the authority stack as a substrate, authoritative only *about truth*, consumed by the modules above.

Knowledge sits **above Long-term Memory as its ratified distillation and beside Policy/Mission as their factual input.** Memory promotes into it; it overrides Memory in reasoning; Policy and Mission consume it; Reasoning and Execution read it. It is the hinge between *what was experienced* (Memory) and *what is authoritatively true* — and it is exclusively about *stating canonical truth*, never *remembering, ruling, aspiring, reasoning, or acting*.

---

## 3. Core Domain Objects

Knowledge introduces one primary entity and supporting objects, extending the existing `knowledge` schema. All reuse `_base.ts` contracts:

- **`rootColumns`** / **`tenantColumns`**. `createdBy`/`stewardRef`/`ratifiedBy` resolve to actor references (Identity §3.9); every Knowledge object is tenant-scoped.

---

### 3.1 Knowledge Object

- **Purpose.** A single canonical statement of organizational truth. The primary object of this module.
- **Table.** `knowledge` (`tenantColumns`) — extended.
- **Conceptual fields.**
  - `id` — Knowledge ID.
  - `tenantId` — owning Company (Identity §3.1).
  - `domainRef` — the Knowledge Domain (§3.2). Required.
  - `categoryRef` — the category within the domain (§3.3).
  - `scope` — `knowledgeScopeEnum` (§3.4): `company-wide | department | domain`. Required.
  - `ownerRef` / `stewardRef` — the accountable owner and the steward responsible for accuracy/currency (§4).
  - `statement` — the canonical truth content (the fact/definition/understanding).
  - `authorityLevel` — `knowledgeAuthorityEnum` (§5.15): e.g. `authoritative | provisional` — provisional for ratified-but-time-boxed truth pending review.
  - `provenance` — where it came from (§3.5): the promoting Long-term Memory record(s), the promotion record, the ratification record.
  - `sourceAttribution` — the originating source(s) behind the truth.
  - `lineageRef` — the chain of corrections/supersessions (§3.6).
  - `supersedesKnowledgeId` / `supersededByKnowledgeId` — supersession edges.
  - `dependencies` — other Knowledge objects this truth depends on (§5.17).
  - `references` — cross-domain and inbound/outbound Knowledge references (§5.18).
  - `memoryRefs` — the Memory records this truth references (read-only; Knowledge references Memory, never the reverse redefining it).
  - `knowledgeLifecycleStatus` — governed lifecycle (`knowledgeLifecycleStatusEnum`, §6).
  - `knowledgeHealth` — health (`knowledgeHealthEnum`, §6): `unknown | current | stale | contested`.
  - `approvalState` — ratification gate (`approvalStateEnum`).
  - `ratifiedAt` / `ratifiedBy` — ratification provenance.
  - `freshnessPolicy` / `expirationPolicy` — freshness/expiration rules (§5.16).
  - `permissions` — access scope (Identity §6).
  - `indexRef` — reference into the search/vector index (§5.20).
  - `knowledgeVersion` — immutable version counter.
  - base lifecycle/audit fields (immutable audit history).
- **Required.** `tenantId`, `domainRef`, `scope`, `ownerRef`, `stewardRef`, `statement`, `authorityLevel`, `provenance`, `permissions`, `knowledgeLifecycleStatus`. (`knowledgeHealth` defaults `unknown`.)
- **Immutability.** Ratified Knowledge is **versioned, never silently modified**; a change is a correction/supersession creating a new version, re-ratified. Audit is immutable.
- **Canonical uniqueness.** At most **one active (ratified, non-superseded) Knowledge object per canonical fact** within a domain/scope — **conflict is structurally disallowed** (§7).
- **Example.** Company-wide Knowledge: "Our standard payment terms are Net-30." domain `finance`, scope `company-wide`, authority `authoritative`, provenance {promoted from LTM M-771 + ratification R-12}, steward "Finance Director."

### 3.2 Knowledge Domain

- **Purpose.** A top-level area of organizational truth (finance, legal, product, sales, operations…). The primary organizer of the **Knowledge Registry**.
- **Realization.** `domainRef` → a registered domain with an owner/steward, permission baseline, and consistency scope. Canonical uniqueness is enforced within a domain (§5.14).

### 3.3 Knowledge Category

- **Purpose.** A grouping within a domain (e.g. finance → "payment terms," "tax treatment"). The retrieval/review unit.
- **Realization.** `categoryRef` within a domain; carries default freshness/review cadence.

### 3.4 Knowledge Scope (company-wide / department / domain)

- **Purpose.** Declares the breadth of a truth's authority. Answers "true for whom."
- **Realization.** `knowledgeScopeEnum` (specified): `company-wide | department | domain`.
  - **company-wide** — truth for the whole company (broadest authority).
  - **department** — truth authoritative within a department (a department's canonical understanding, consistent with company-wide).
  - **domain** — truth scoped to a knowledge domain/subject area.
- **Rule.** Narrower-scope Knowledge must be **consistent with** broader-scope Knowledge; a department truth may refine but never contradict a company-wide truth (§7, §5.14) — the same derivation discipline as Mission sub-missions.

### 3.5 Knowledge Provenance & Source Attribution

- **Purpose.** Where a truth came from — mandatory. **Every Knowledge object has provenance.**
- **Realization.** `provenance {promotedFromMemoryIds, promotionRef, ratificationRef, ratifiedBy}`; `sourceAttribution {originSources}`. A truth with no promotion+ratification provenance cannot exist (§7).

### 3.6 Knowledge Lineage

- **Purpose.** The chain of a truth's corrections/supersessions — **every Knowledge object has lineage; corrections always create a new version.**
- **Realization.** `lineageRef` links via `supersedesKnowledgeId`/`supersededByKnowledgeId`; `knowledgeVersion` orders the chain. **Superseded Knowledge remains historically accessible**; the chain is immutable and replayable.

### 3.7 Ratification Record

- **Purpose.** The governed record that turned a promoted candidate into ratified truth — the sole gate into Knowledge (§5.13).
- **Realization.** `{ratificationId, promotionRef, candidateStatement, domain, scope, reviewers, approvalRef, decision, ratifiedBy, ratifiedAt}`. **Every Knowledge object is ratified**; every truth traces to exactly one Ratification Record.

---

## 4. Ownership

- **Owned by Company.** Every Knowledge object belongs to exactly one company via `tenantId`. **Multi-tenant isolation** is structural — no truth spans companies; cross-tenant retrieval is impossible.
- **Owner and Steward (Knowledge Stewardship).** Each Knowledge object has an accountable **owner** (the container whose truth it is — company/department/domain) and a **steward** — the actor responsible for its accuracy, currency, review, and conflict resolution. Stewardship is a first-class role: truth without a steward is unmaintained truth, disallowed (§7).
- **Scope ownership.** `company-wide` truth owned by the Company; `department` truth owned by the department; `domain` truth owned by the domain owner — always with a steward.
- **Knowledge owns the truth records; it owns no intent.** Knowledge owns the *canonical statements*; it **never owns business intent** (Mission/Goal/Plan) — those consume Knowledge, they are not owned by it.
- **Permission-bounded access.** Every retrieval is bounded by the object's `permissions`, scope, and the requester's authority (Identity §6). Sensitive truth is access-gated; **Knowledge never changes permissions** — it enforces them.
- **Ratification authority.** Ratifying/​correcting/​retiring truth requires an authorized actor (steward + governance; scope-appropriate authority). An agent may *propose* a promotion-to-Knowledge but **never ratify** its own or any truth (separation of duties, §7).
- **No cross-tenant truth.** Holding/M&A knowledge stays per tenant; cross-tenant reference is a governed export, never ambient.

---

## 5. Knowledge Architecture

The canonical-truth layer's internal architecture. All are storage/organization/governance mechanics; none reasons, decides, executes, or owns intent.

### 5.1 Organizational-Truth Architecture

- Knowledge is the **single source of organizational truth**: one canonical, ratified statement per fact. It is the authoritative answer any reasoning defers to. Truth is **distilled from experience** (Memory) through governance, never invented in-module.

### 5.2 Canonical Knowledge & 5.14 Conflict Resolution / Consistency

- **Canonical**: at most one active ratified truth per fact per domain/scope. **Knowledge may not hold conflicting information.** Before ratification, any conflict with existing active Knowledge is **resolved** (supersede the old, or reject the candidate, or reconcile) — a contradiction can never be *stored*. **Consistency**: narrower scopes must not contradict broader scopes; cross-references must be consistent. A detected contradiction marks health `contested` and blocks ratification/use until resolved.

### 5.3 Domain / Department / Company-wide Knowledge

- Realizes `knowledgeScopeEnum` (§3.4): company-wide (broadest), department, domain. Consistency flows downward: department/domain truth refines but never contradicts company-wide.

### 5.4 Knowledge Registry, Domains, Categories, Hierarchy

- The **Knowledge Registry** catalogs all domains, categories, and the **hierarchy** (domain → category → object; scope company-wide → department → domain). It is the map of the company's truth: navigable, permissioned, stewarded.

### 5.5 Ownership & Stewardship Architecture

- Realizes owner + steward per object/domain (§4). Stewards run **review** cycles, resolve conflicts, and shepherd ratification, corrections, and retirement.

### 5.6 Discovery, 5.19 Retrieval, 5.20 Indexing & Search

- **Discovery** browses the registry/hierarchy. **Retrieval** is **read-only, authoritative, permissioned, deterministic**, ranked by scope-authority, freshness, and relevance. **Indexing & search** cover structured (domain/category/scope) and semantic (vector) — **provider-independent** behind an abstraction. Retrieval **never mutates** Knowledge.

### 5.7 Knowledge Authority & Memory Override

- Knowledge carries an **authority level** (§5.15). In reasoning, **Knowledge overrides Memory**: when both are retrieved and disagree, the ratified Knowledge is authoritative and the memory is treated as (possibly stale) experience. This override is the operational meaning of "single source of truth."

### 5.8 Freshness, 5.16 Expiration, Deprecation, Retirement

- **Freshness/expiration**: truth carries a freshness policy; expired truth is flagged `stale` (health) and scheduled for review — a stale truth is not silently trusted as current. **Deprecation** marks truth as superseded-in-spirit but retained; **retirement** removes it from active authority (retained for audit). Forgetting truth is always governed — never silent.

### 5.9 Dependencies, 5.17 & References, 5.18 & Cross-domain Linking

- Knowledge objects declare **dependencies** (truth that depends on other truth) and **references** (cross-domain links). **Cross-domain linking** connects related truths across domains with consistency checks; a change to a depended-upon truth flags dependents for review.

### 5.11 Promotion from Long-term Memory & 5.12 Approval & 5.13 Ratification

- The **only entry path**: Long-term Memory proposes a promotion-to-Knowledge candidate (a semantic memory judged organizationally authoritative) → **validation** (provenance, consistency, dedup against existing truth) → **knowledge approval** (governed, scope-appropriate authority) → **ratification** (the truth becomes canonical, `ratified`, with a Ratification Record). **Every Knowledge object originates from governed promotion and is ratified.** No direct write; no un-ratified truth.

### 5.10 Provider Independence & Storage Abstraction

- Knowledge writes/reads through a **storage + index abstraction** — provider-independent — so concrete stores/search engines are swappable without changing the truth model.

### 5.21 Security, Permissions, Multi-tenant Isolation

- Every access passes permission enforcement (Identity §6), scope, and tenant isolation; sensitive truth is classified and gated; secrets are never stored as plain Knowledge.

### 5.22 Observability & Auditability

- **Observability**: truth volume by domain, freshness distribution, contested/consistency rates, ratification/rejection rates, retrieval and override rates, cost. **Auditability**: every promotion, ratification, correction, supersession, deprecation, retirement is immutably recorded.

### 5.23 The truth boundary

- Knowledge **states** canonical truth but **reasons/decides/executes nothing** and **owns no intent**. It accepts truth only by promotion+ratification, forbids conflict, and forgets only by governance. This boundary is why the company can have a single trustworthy source of truth that overrides memory in reasoning — without that source ever becoming an unaccountable actor, a rulebook, or a shadow decision-maker.

---

## 6. Lifecycle

A Knowledge object carries **two orthogonal state dimensions** (mirroring prior specs) that must never be conflated:

- **Lifecycle** (`knowledgeLifecycleStatusEnum`) — *where the truth is in its governed existence.* Governed transitions only.
- **Health** (`knowledgeHealthEnum`) — *how current/consistent the truth is.* Auto-derived; never a lifecycle transition.

Governing rule: **truth enters only by promotion + ratification; it is canonical and conflict-free; corrections version never overwrite; superseded truth stays accessible; forgetting is governed; audit is immutable.** (Ratification-centric, closer to Mission/Policy than to Memory's promotion.)

### 6.1 Lifecycle dimension

**`knowledgeLifecycleStatusEnum`** (specified): `draft | proposed | under-review | ratified | superseded | deprecated | retired | archived`.

| Lifecycle state | Meaning | Mutable? | Authoritative? |
|---|---|---|---|
| **draft** | Candidate truth being prepared (from a promotion) | Yes (pre-review) | No |
| **proposed** | Submitted for review/ratification; frozen | No | No |
| **under-review** | Stewards/reviewers evaluating; consistency checked | No | No |
| **ratified** | Accepted as canonical organizational truth — active | Version-only (correction) | **Yes** |
| **superseded** | Replaced by a newer ratified version | No (immutable) | No (historical) |
| **deprecated** | Marked outdated; retained, use-discouraged | No | Waning (flagged) |
| **retired** | Removed from active authority; retained for audit | No (immutable) | No |
| **archived** | Fully retired; terminal | No (immutable) | No |

**Lifecycle transitions (governed):**

| Transition | From → To | Precondition | Effect | Emits |
|---|---|---|---|---|
| **Draft** | ∅ → draft | LTM promotion candidate accepted into the Knowledge pipeline | candidate prepared; `knowledgeHealth=unknown` | `KnowledgePromotionProposed` |
| **Propose** | draft → proposed | Provenance + consistency + dedup validation pass | frozen for review; `approvalState=pending` | `KnowledgeProposed` |
| **Review** | proposed → under-review | Stewards/reviewers assigned | consistency + conflict checks run | `KnowledgeUnderReview` |
| **Ratify** | under-review → ratified | Reviewers approve; no unresolved conflict; authority satisfied | canonical truth written; predecessor (if correction) superseded atomically; `ratifiedAt/By` set | `KnowledgeRatified` (+ `KnowledgeSuperseded` for predecessor) |
| **Reject** | proposed/under-review → draft \| archived | Review rejects | back to draft or archived; **no change to active truth** | `KnowledgeRejected` |
| **Correct** | ratified → superseded (+ new ratified successor) | A correction is ratified | new version supersedes; history preserved | `KnowledgeCorrected` |
| **Supersede** | ratified → superseded | Newer ratified version replaces it | lineage linked; frozen | `KnowledgeSuperseded` |
| **Deprecate** | ratified → deprecated | Steward marks outdated (not yet replaced) | use-discouraged, retained | `KnowledgeDeprecated` |
| **Retire** | ratified/deprecated → retired | Governed removal from active authority | removed from active retrieval, retained | `KnowledgeRetired` |
| **Restore** | deprecated/retired → ratified | Governed reinstatement (re-ratified) | re-enters active authority | `KnowledgeRestored` |
| **Archive** | retired/superseded → archived | Governed final retirement | `lifecycleStatus=archived` (terminal) | `KnowledgeArchived` |

Every transition is governed and audited. **Health never appears in this table.** Ratification and supersession are **atomic** — the company is never, for an instant, holding two active canonical truths for one fact (mirrors Mission continuity).

### 6.2 Health dimension

**`knowledgeHealthEnum`** (specified): `unknown | current | stale | contested`.

| Health state | Meaning | Set how |
|---|---|---|
| **unknown** | No sufficient signal (default; also non-ratified/terminal) | default / on clear |
| **current** | Ratified, fresh, consistent, uncontested | auto |
| **stale** | Freshness/expiration lapsed; due for review | auto |
| **contested** | A challenge/conflict/correction dispute is open | auto |

**Health rules:**

- **Scope.** Health applies **only** to `ratified`/`deprecated` truth. In draft/proposed/under-review it is `unknown`; in superseded/retired/archived it is cleared to `unknown`, frozen.
- **Automatic.** Derived from **freshness/expiration, open challenges, dependency changes, and consistency checks.** Never manual.
- **No lifecycle effect.** **Health never changes lifecycle.** A `stale` or `contested` truth is not auto-retired; it is flagged for governed review/resolution — it **remains the active canonical truth until superseded/corrected**, but `contested` signals reasoning to weigh it cautiously (still overriding memory, but flagged). Only governed transitions move lifecycle.
- **Observability, not authority.** Health flags for stewardship; it never silently changes truth.

### 6.3 Terminal-state rules

- **retired / archived** are terminal; **superseded**/​**deprecated** retained. **Superseded Knowledge remains historically accessible.**
- **Knowledge is versioned, never silently modified**; corrections preserve history; superseded/retired/archived are immutable.
- **Immutable audit history**: every promotion, ratification, correction, deprecation, retirement recorded forever. GDPR/legal erasure of Knowledge (rare — truth is usually retired, not erased) follows the explicit governed erasure flow (Identity §5), leaving a tombstone.
- **Restore** is possible from deprecated/retired (governed re-ratification); a superseded version is not "restored" — reinstating old truth is a new ratification.

---

## 7. Constraints

Structural and semantic constraints, enforced by the schema and the module — not by convention.

**Structural / hard invariants (enforced):**

1. **Single source of organizational truth.** Knowledge is the **only** authoritative truth store; no other module is authoritative for truth.
2. **Promotion + ratification only.** **Every Knowledge object originates from a governed promotion (from Long-term Memory) and is ratified.** No direct write; no un-ratified truth.
3. **Canonical, conflict-free.** At most one active ratified truth per fact per domain/scope. **Knowledge may not hold conflicting information**; contradictions are resolved before ratification.
4. **Provenance & lineage mandatory.** **Every Knowledge object has provenance and lineage**; corrections always create a new version.
5. **Versioned, never silently modified.** **Corrections always create a new version; superseded Knowledge remains historically accessible.**
6. **Domain, scope, steward mandatory.** `domainRef`, `scope`, `stewardRef` present; every truth is organized and stewarded.
7. **Scope consistency.** Narrower-scope truth may not contradict broader-scope truth.
8. **Tenant isolation & immutable audit.** `tenantId` NOT NULL; every mutation immutably audited.
9. **Terminal immutability.** Superseded/deprecated/retired/archived immutable.

**Semantic (module-enforced) — the truth-boundary guards:**

10. **Knowledge overrides Memory; Memory cannot redefine Knowledge.** In reasoning, ratified Knowledge is authoritative over Memory. **Knowledge can reference Memory; Memory cannot redefine Knowledge.**
11. **Long-term Memory is not authoritative.** Memory may conflict and carries confidence; only ratified Knowledge is truth.
12. **Not Policy, not Mission.** **Policies consume Knowledge but are not Knowledge; Mission consumes Knowledge but does not define Knowledge.** Knowledge states facts, not rules or purpose.
13. **Never reason.** **Reasoning consumes Knowledge but never mutates it; Knowledge never performs reasoning.**
14. **Never execute.** **Execution consumes Knowledge but never writes to it; Knowledge never executes actions.**
15. **Never own business intent.** **Knowledge never owns business intent.**
16. **Never self-ratify (agents).** An agent may propose a promotion-to-Knowledge but never ratify truth; ratification is a governed human/steward act with separation of duties.
17. **Forgetting is governed.** Deprecation/retirement/erasure follow policy; truth is never silently dropped or staled-into-nonexistence.
18. **Lifecycle/health orthogonal; health scoped/derived.** Separate fields; health non-`unknown` only ratified/deprecated; auto-derived; never writes lifecycle.

---

## 8. Validation

Validation runs at gates: **promotion → draft**, **draft → proposed → under-review → ratified**, **correction**, **retrieval**, and **deprecation/retirement/erasure**. Knowledge fails closed: on ambiguity it does not ratify, does not over-share, and does not contradict.

**Promotion validation (into the Knowledge pipeline):**

- The candidate originates from a real Long-term Memory record (promotion provenance) judged organizationally authoritative; a candidate with no memory provenance is refused.
- The promoter has authority to propose truth in the target domain/scope; agents may propose, never ratify.

**Consistency & canonical validation (proposed → under-review → ratified):**

- **Deduplication/conflict:** the candidate is checked against existing active Knowledge; a duplicate is merged/linked; a **conflict must be resolved** (supersede/reject/reconcile) — a contradiction can never be ratified.
- **Scope consistency:** narrower-scope truth is checked against broader-scope; a department truth contradicting company-wide is rejected.
- **Dependency consistency:** referenced/depended-upon Knowledge is consistent; a truth depending on retired/contested truth is flagged.

**Ratification validation:**

- Reviewers/stewards with scope-appropriate authority approve (`approvalStateEnum`); **separation of duties** — the proposer may not be the sole ratifier.
- Ratification + supersession (for corrections) is atomic — no dual active canonical truth.

**Retrieval validation:**

- Requester permissions + object permissions + scope + tenant isolation enforced; out-of-scope truth never returned. Retrieval is read-only, deterministic, authority-ranked. **Knowledge overrides Memory** when both are retrieved for the same fact.

**Boundary validation (continuous):**

- Any attempt to treat Knowledge as Policy/Mission, reason/decide/execute from within, be redefined by Memory, or be written outside promotion+ratification is refused as a layer violation.

**Freshness/forgetting validation:**

- Freshness/expiration transitions to `stale` health and schedules review; deprecation/retirement follow governance; erasure (rare) requires the explicit governed flow.

**Health validation (continuous):**

- `knowledgeHealth` non-`unknown` only ratified/deprecated; unresolved inputs yield `unknown`; a health update never moves lifecycle.

Only content passing all gates becomes/stays canonical truth. A failure refuses the ratification/share/retirement with the violated rule recorded.

---

## 9. Relationships

Knowledge relates to Memory (its source and its subordinate-in-truth), to Policy/Mission (its consumers), and to Reasoning/Execution (read-only consumers). It states truth; it never reasons, decides, executes, or owns intent.

| Module | Relationship to Knowledge |
|---|---|
| **Long-term Memory** | **The source, and subordinate-in-truth.** Every Knowledge object is **promoted from Long-term Memory** (§5.11) and ratified. Knowledge **can reference Memory** (`memoryRefs`); **Memory cannot redefine Knowledge.** Memory may conflict; Knowledge may not. In reasoning, **Knowledge overrides Memory.** |
| **Working Memory** | Retrieves Knowledge **read-only** into its workspace (Working Memory §5.2), alongside memory; when both disagree, Knowledge is authoritative. Working Memory never writes Knowledge. |
| **Reasoning** | **Consumes Knowledge but never mutates it.** Reasoning treats ratified Knowledge as authoritative fact and Memory as experience; Knowledge itself **never reasons**. |
| **Policy** | **Consumes Knowledge but is not Knowledge.** A Policy (what is allowed/required) may cite Knowledge (what is true) as a factual basis; Knowledge defines no rule. Where a Policy needs a fact, it reads Knowledge; the rule stays Policy's. |
| **Mission** | **Consumes Knowledge but does not define Knowledge.** Mission (what the company is for) may be informed by Knowledge (what is true); Mission is ratified intent, Knowledge is ratified truth — distinct modules, both ratification-gated. |
| **Execution** | **Consumes Knowledge but never writes to it.** Execution may read Knowledge to perform correctly (e.g. the canonical tax rate); it never mutates Knowledge. |
| **Commands** | Knowledge reads are Commands (`targetType` knowledge, Command §3) performed by Execution; Knowledge is the addressee, not the performer. |
| **Agent** | An Agent retrieves Knowledge (read-only, permission-scoped) and may **propose** promotion of a memory to Knowledge; it **never ratifies** truth. |
| **Governance** | Governs promotion approval, ratification, conflict resolution, corrections, deprecation/retirement. Knowledge enforces; Governance adjudicates truth changes. |
| **Policies / Permissions** | Bound access, promotion, ratification, and scope (Identity §6). Knowledge **never changes permissions**; it enforces them. |
| **Identity / Company / Departments** | Tenant scoping and the owner/steward/scope basis every truth carries. |
| **Audit / Observability** | Immutable records and transparency of every truth change (§5.22). |

**The truth spine:** `Long-term Memory —(governed promotion + ratification)→ Knowledge —(read-only, authoritative retrieval; overrides memory)→ Reasoning/Working Memory`, with Policy and Mission consuming Knowledge as factual input. Knowledge is the canonical node that states organizational truth — never the node that remembers, rules, aspires, reasons, or acts.

### 9.1 Explicit distinction tables (Memory · Knowledge · Policy · Mission · Reasoning)

**What each layer is:**

| Layer | Holds | Question it answers | Canonical? | Conflict allowed? | Gate to enter |
|---|---|---|---|---|---|
| **Long-term Memory** | Retained experiences (episodic/semantic/procedural) | "What happened / what did we learn?" | No | **Yes** (may conflict) | Governed promotion (acceptance) |
| **Knowledge** | Canonical organizational truth (facts/definitions) | "What is true?" | **Yes** | **No** (conflict-free) | Promotion + **ratification** |
| **Policy** | Rules — what is allowed/required | "What are we allowed/obliged to do?" | Yes (approved) | No | Approval (governed) |
| **Mission** | Purpose — what the company is for | "What are we for?" | Yes (one North Star) | No | **Ratification** |
| **Reasoning** | Nothing durable — active thinking | "What should we conclude/decide now?" | N/A | N/A | N/A (process, not store) |

**How they interact:**

| From ↓ / To → | Memory | Knowledge | Policy | Mission | Reasoning |
|---|---|---|---|---|---|
| **Memory** | — | promotes into (governed) | informs (via Knowledge) | informs (via Knowledge) | consumed by (as experience) |
| **Knowledge** | references (read); overrides in reasoning | — | consumed by (as facts) | consumed by (as facts) | consumed by (as **authoritative truth**) |
| **Policy** | — | reads (facts) | — | subordinate to Mission | consumed by (as constraints) |
| **Mission** | — | reads (facts) | outranks (means vs ends) | — | consumed by (as purpose) |
| **Reasoning** | reads | reads (never writes) | reads | reads | — |

**Authority when they disagree (in reasoning):** Law/Compliance/Policy (rules) bound *what may be done*; **Knowledge** is authoritative for *what is true* (**overrides Memory**); Mission bounds *what we are for*; Memory is *experience only* (never authoritative); Reasoning *applies* all of them but changes none.

---

## 10. Events

Every Knowledge mutation emits exactly one domain event. Reasoning, Policy, Mission, Memory, Governance, and observability subscribe. Payloads carry `actorRef`, `tenantId`, `knowledgeId`, `knowledgeVersion`, `domainRef`, `scope`, and `occurredAt`.

| Event | Trigger | Payload (beyond envelope) | Consumers | Business impact |
|---|---|---|---|---|
| `KnowledgePromotionProposed` | LTM proposes a memory for truth | memoryRefs, targetDomain/scope | Governance, Stewards | Candidate truth entered pipeline |
| `KnowledgeProposed` | Draft submitted for review | reviewers | Governance | Ratification workflow begins |
| `KnowledgeUnderReview` | Review + consistency checks running | conflicts? | Stewards, Governance | Truth being evaluated |
| `KnowledgeRejected` | Review rejects | reason | Memory, Audit | No change to active truth |
| `KnowledgeRatified` | Accepted as canonical truth | ratificationRef, provenance | **Reasoning, Policy, Mission, Working Memory**, Dashboard | New authoritative truth in force; overrides memory |
| `KnowledgeSuperseded` | Replaced by a newer ratified version | successorKnowledgeId | Reasoning, Audit | Old truth historical; consumers re-anchor |
| `KnowledgeCorrected` | Correction ratified (new version) | newKnowledgeVersion, reason | Governance, Audit | History preserved; successor canonical |
| `KnowledgeHealthChanged` | Freshness/consistency recomputed (ratified/deprecated) | fromHealth, toHealth, drivers | Stewards, Observability | Currency signal moved; **no lifecycle change** |
| `KnowledgeStale` | Freshness/expiration lapsed | freshnessPolicy | Stewards, Notifications | Review due; still canonical |
| `KnowledgeContested` | Challenge/conflict opened | challengeRef | **Governance**, Stewards | Flagged for resolution; weigh cautiously |
| `KnowledgeConflictResolved` | Contradiction resolved before/at ratification | resolution | Governance, Audit | Canonical consistency preserved |
| `KnowledgeDeprecated` / `KnowledgeRetired` | Outdated/removed from active authority | reason | Reasoning, Reporting | Consumers stop relying; retained |
| `KnowledgeRestored` | Governed reinstatement (re-ratified) | fromState | Governance, Audit | Re-entered active authority |
| `KnowledgeDependencyChanged` | A depended-upon truth changed | dependencyRef | Stewards | Dependents flagged for review |
| `KnowledgeCrossDomainLinked` | Cross-domain reference created | fromDomain, toDomain | Observability | Truth graph extended (consistent) |
| `KnowledgeAccessViolationAttempted` | Out-of-scope retrieval attempt | requesterRef | **Security**, Governance, Audit | Permission boundary enforced |
| `KnowledgeArchived` | Terminal retirement | — | Reporting | Truth record retired |

**Ordering and idempotency.** Events carry `knowledgeVersion`; consumers discard stale/duplicate deliveries. Emission is **transactional with the mutation**; a failed audit/event write rolls back — no un-audited truth change. `KnowledgeRatified` is the signal every truth-consuming module treats as a re-anchor (like Mission's `MissionRatified`).

**Two independent streams.** Health events never accompany or cause a lifecycle change; lifecycle events never carry a health transition.

---

## 11. KPIs

Knowledge health and the company's truth-integrity, measured deterministically from Knowledge records.

| KPI | Definition | Source |
|---|---|---|
| **Truth completeness** | % of Knowledge with provenance, lineage, steward, domain/scope (target 100%) | fields + validation |
| **Ratification rate** | % of promotion candidates ratified vs rejected | ratification events |
| **Direct-write / un-ratified incidents** | Count of any truth existing without ratification (target 0) | write audit |
| **Canonical consistency** | Count of active contradictions (target 0 by construction) | consistency checks |
| **Contested rate / resolution time** | Count of `contested` truths; median time to resolution | contested events |
| **Correction rate** | Corrections per truth; % preserving history (100% by construction) | lineage |
| **Freshness** | % of ratified truth `current` vs `stale` | `knowledgeHealth` |
| **Staleness backlog** | Count of stale truths past review due | freshness |
| **Memory-override rate** | % of reasoning retrievals where Knowledge overrode a conflicting memory | retrieval telemetry |
| **Promotion-from-memory rate** | Rate of memories promoted to Knowledge | promotion events |
| **Retrieval determinism** | % of retrievals reproducible on replay | replay checks |
| **Scope-consistency conformance** | % of narrower-scope truths consistent with broader (target 100%) | consistency checks |
| **Stewardship coverage** | % of Knowledge with an active steward (target 100%) | steward assignment |
| **Isolation integrity** | Count of cross-tenant/out-of-scope access attempts blocked | access events |
| **Audit completeness** | % of truth mutations with an immutable trail (target 100%) | audit chain |

These feed the Executive/Director/Domain and Observability surfaces (Identity §10 pattern). All from Knowledge's own records — no external inference.

---

## 12. Failure Scenarios

At least the following failure modes and the system's deterministic reaction. Governing rule: **Knowledge fails closed, canonical, and ratified** — on ambiguity it does not ratify, over-share, or contradict; nothing overwrites; no truth exists unratified; no conflict is stored.

1. **Direct write attempt (bypassing promotion+ratification).** Refused — the only entry is governed promotion + ratification.
2. **Truth with no memory provenance.** Refused — every Knowledge object originates from a promoted Long-term Memory record.
3. **Un-ratified content used as truth.** Refused — only ratified Knowledge is authoritative.
4. **Candidate conflicts with existing active truth.** Ratification blocked until resolved (supersede/reject/reconcile); **a contradiction is never stored.**
5. **Two active canonical truths for one fact.** Structurally impossible — canonical uniqueness; the second ratification supersedes or is rejected.
6. **Department truth contradicts company-wide.** Rejected — scope consistency; narrower may refine, never contradict.
7. **In-place edit of ratified truth.** Refused — corrections version and re-ratify; truth is never silently modified.
8. **Correction loses history.** Impossible — the pre-correction version is retained/superseded; history preserved.
9. **Agent self-ratifies its proposed truth.** Refused — agents propose, never ratify; separation of duties.
10. **Memory tries to redefine Knowledge.** Refused — Memory can be referenced by Knowledge, never redefine it; Memory is not authoritative.
11. **Reasoning gets conflicting Memory vs Knowledge.** Knowledge **overrides**; the memory is treated as experience (possibly stale).
12. **Knowledge treated as Policy/Mission.** Refused — Knowledge states facts, not rules or purpose; Policy/Mission consume it.
13. **Module asked to reason/decide.** Refused — Knowledge never reasons or decides.
14. **Execution tries to write Knowledge.** Refused — Execution consumes, never writes truth.
15. **Knowledge asked to own a Goal/intent.** Refused — Knowledge owns no business intent.
16. **Stale truth trusted as current.** Freshness marks it `stale`; flagged for review; still canonical but flagged so reasoning weighs currency — never silently "fresh."
17. **Contested truth used blindly.** `contested` flags it; reasoning weighs cautiously (still overriding memory) until resolution; not auto-deleted.
18. **Deprecated truth still relied on.** Deprecation signals consumers to stop relying; retained for reference; not authoritative.
19. **Retired truth returned in active retrieval.** Impossible — retired is removed from active authority; archive-only.
20. **Out-of-scope retrieval.** Refused; `KnowledgeAccessViolationAttempted`; permission enforced.
21. **Cross-tenant retrieval.** Structurally impossible — tenant isolation.
22. **Dependency truth changes, dependent stale.** `KnowledgeDependencyChanged`; dependents flagged for review; inconsistency surfaced, not silent.
23. **Cross-domain link creates inconsistency.** Rejected/flagged — cross-domain links are consistency-checked.
24. **Duplicate promotion of the same fact.** Merged/linked (raising corroboration), not a second canonical object.
25. **Ratification without authority.** Refused — scope-appropriate steward/governance authority required.
26. **Concurrent corrections (two successors).** One ratification wins the atomic flip; the other rebases; no forked canonical lineage.
27. **Ratification/supersession non-atomic (dual active truth risk).** Atomic transaction — predecessor superseded and successor ratified together, or neither; never dual active canonical truth.
28. **Health set on a non-ratified/terminal truth.** Rejected, coerced to `unknown`.
29. **Attempt to move lifecycle because health changed.** Refused — `stale`/`contested` never auto-retire; only governed transitions.
30. **Terminal/proposed truth showing active health.** Impossible — cleared to `unknown`, frozen.
31. **GDPR erasure of a fact about a person.** Handled via the explicit governed erasure flow (rare for Knowledge) with tombstone; usually truth is *retired*, not erased — the distinction is governed.
32. **Sensitive/secret content ratified as plain Knowledge.** Refused/classified — secrets are not plain Knowledge; sensitive truth is gated.
33. **Provider/search-engine swap mid-operation.** Storage/index abstraction isolates the truth model; migration governed; no model change.
34. **Non-deterministic retrieval.** Flagged — retrieval must be deterministic for replay/consistency.
35. **Mission/Policy tries to define Knowledge.** Refused — they consume Knowledge; they do not define it.
36. **Truth references a retired memory.** Allowed as historical reference (provenance), but the truth's currency is re-reviewed; a truth resting only on retired/erased memory is flagged for re-substantiation.
37. **Steward leaves; truth unmaintained.** Stewardship reassigned before continuity; truth is never left steward-less.
38. **Owner authority drop; access re-scoped.** Retrieval re-scopes immediately to the reduced ceiling.
39. **Bulk domain re-ratification.** Governed batch; each object individually versioned/ratified/audited; no partial-state canonical inconsistency.
40. **Audit write fails on a truth mutation.** Transactional emission rolls back; no un-audited truth change — immutable-audit guarantee holds.
41. **Attempt to store confidence as if truth were probabilistic.** Ratified Knowledge is authoritative (not confidence-weighted like Memory); a "maybe true" belongs in Memory until ratified — provisional authority (§5.15) is the only time-boxed exception, explicitly flagged.

---

## 13. Enterprise Use Cases

Behavior of Knowledge in real situations. In every case truth enters only by promotion+ratification, is canonical/conflict-free, is served read-only and authoritative, and overrides memory in reasoning.

1. **Promoting a memory to truth.** A well-corroborated semantic memory ("our standard payment terms are Net-30") is promoted from Long-term Memory and ratified as company-wide Knowledge.
2. **Ratification review.** Stewards review a proposed truth, check consistency, and ratify it; the Ratification Record is created.
3. **Rejection.** A proposed "truth" that contradicts existing Knowledge is rejected; the active truth is unchanged.
4. **Knowledge overrides memory.** An agent's memory says a customer is Net-60; Knowledge says the company standard is Net-30 with no customer exception ratified — reasoning uses Net-30.
5. **Correction with history.** "VAT rate is 18%" is corrected to "20%"; a new version supersedes; the old is historically accessible; consumers re-anchor on `KnowledgeRatified`.
6. **Conflict resolved before ratification.** Two candidate truths about a product spec conflict; stewards reconcile to one canonical statement before ratifying — no contradiction stored.
7. **Company-wide vs department scope.** A company-wide truth ("brand voice is formal") and a department refinement ("support uses warmer tone") coexist — the department refines, never contradicts.
8. **Domain knowledge.** The `legal` domain holds canonical definitions (e.g. "a qualified lead is …") stewarded by Legal.
9. **Knowledge registry navigation.** A director browses the Knowledge Registry by domain/category to find canonical policies-of-fact.
10. **Freshness flag.** A truth ("pricing tiers") passes its freshness window → `stale`; stewards review and re-ratify or correct.
11. **Deprecation.** An outdated product fact is deprecated; consumers stop relying; retained for reference.
12. **Retirement.** A discontinued product's canonical facts are retired from active authority; archived for audit.
13. **Cross-domain link.** A `finance` truth references a `legal` truth (tax treatment ↔ regulation); the link is consistency-checked.
14. **Dependency review.** A regulation truth changes; dependent finance truths are flagged for review.
15. **Policy consumes Knowledge.** An approval Policy ("invoices over €10k need director sign-off") reads the canonical "our approval thresholds" Knowledge as its factual basis — the rule stays Policy's.
16. **Mission consumes Knowledge.** Mission ratification is informed by canonical market/company truth, but Mission remains ratified *intent*, not truth.
17. **Reasoning consumes Knowledge.** An agent reasoning about a discount defers to the canonical pricing truth, not its own memory.
18. **Execution consumes Knowledge.** A billing Command reads the canonical tax rate to compute correctly; it never writes Knowledge.
19. **Agent proposes, human ratifies.** An agent notices a recurring fact and proposes it for Knowledge; a steward ratifies — the agent never ratifies.
20. **Contested truth.** A challenge is raised against a ratified fact; `contested`; reasoning weighs cautiously; governance resolves via correction or upholds.
21. **Provisional authority.** A time-boxed provisional truth ("interim policy fact pending Q3 review") is ratified with `provisional` authority, flagged for review.
22. **Multi-tenant isolation.** Two tenants hold different canonical "standard terms"; neither sees the other's.
23. **Sensitive truth gated.** A canonical fact containing regulated data is access-gated and audited.
24. **Replay for audit.** An auditor replays what Knowledge was canonical when a decision was made.
25. **Bulk re-ratification.** A regulatory change triggers governed re-ratification of a domain's truths; each versioned/audited.
26. **Steward handoff.** A domain steward leaves; stewardship reassigned; truth stays maintained.
27. **Search/discovery.** An agent semantically searches Knowledge for the canonical answer to a question.
28. **Provider independence.** The search engine is swapped; the truth model is unchanged behind the abstraction.
29. **Memory references Knowledge.** An episodic memory ("we quoted per the standard terms") references the canonical terms Knowledge — memory points at truth, never redefines it.
30. **Restoring retired truth.** A retired fact becomes relevant again; governed re-ratification restores it.
31. **Consistency block.** A department tries to ratify a fact contradicting company-wide truth; blocked.
32. **Truth vs experience in a dispute.** A customer disputes a term citing an agent's promise (a memory); Knowledge's canonical term is authoritative; the memory is evidence of what was said, not what is true.
33. **Deprecation cascade.** Deprecating a foundational truth flags dependents for review before they silently rely on stale ground.
34. **GDPR handling.** A person-specific fact is governed-erased (rare) with tombstone; most person data lives in Memory, not Knowledge.
35. **Observability review.** A knowledge-ops dashboard shows freshness, contested rate, and ratification throughput to tune stewardship.
36. **Override telemetry.** Ops sees how often Knowledge overrides conflicting memory — a signal of memory drift to address.
37. **Cross-department canonicalization.** A fact known differently in two departments is canonicalized to one company-wide truth via governed ratification.
38. **New domain bootstrap.** A new business line's Knowledge domain is created with owner/steward and initial ratified truths.
39. **Provisional → authoritative.** A provisional truth is confirmed at review and re-ratified as fully authoritative.
40. **M&A truth reconciliation.** Merged companies keep Knowledge per tenant; conflicting canonical truths reconciled within each tenant via ratification; no cross-tenant ambient truth.
41. **Dependency-driven correction.** A corrected foundational truth triggers governed review and correction of dependents, keeping the truth graph consistent.
42. **Freshness-driven review cadence.** Each category's freshness policy schedules periodic steward review so canonical truth never silently rots.
43. **Reasoning cites source.** When reasoning uses a truth, it cites the Knowledge object + version, giving a traceable authoritative basis.
44. **Contested resolution upholds.** A challenge is investigated and the truth upheld; the challenge and resolution are audited; `contested` clears to `current`.
45. **Truth graph audit for regulators.** A regulator asks for the canonical basis of a decision; the ratified Knowledge + lineage + provenance provide it.

---

## 14. Extensibility

How Knowledge absorbs future demands **without redesign**, because the core abstractions were chosen as extension points.

- **New domains/categories.** The registry extends with new domains/categories without changing the promotion/ratification/canonical model.
- **Richer authority levels.** `knowledgeAuthorityEnum` can extend (e.g. `provisional`, `authoritative`, `regulatory`) behind the same "ratified = canonical" contract.
- **Advanced consistency/reasoning-over-truth.** Consistency engines (ontology checks, entailment) extend behind the conflict-free guarantee — still never reasoning *in* Knowledge, only validating consistency.
- **Semantic/graph search.** Knowledge-graph and semantic retrieval extend behind the read-only, deterministic, provider-independent interface.
- **Federated / cross-tenant truth (governed).** Governed export/import between tenants adds as a governed edge, never ambient.
- **Auto-suggested promotions.** The pipeline can suggest Knowledge candidates from corroborated memory for steward ratification — never auto-ratifying.
- **Truth freshness automation.** Freshness/review can gain source-monitoring (flag when an external source changes) while ratification stays governed.
- **Provenance depth.** Richer provenance (multi-source corroboration graphs) extends without touching the canonical/ratification model.

The invariant enabling all of the above: **single source of truth; promotion + ratification only; canonical and conflict-free; versioned never overwritten; overrides memory; governed forgetting; states truth but never reasons/decides/executes/owns intent.** New demands plug into domains/authority/search without touching the ratification or canonical boundaries.

---

## 15. Architectural Principles

The permanent design principles governing Knowledge. If a future request conflicts with one of these, the request is wrong, not the principle.

1. **The single source of organizational truth.** Knowledge is the one canonical store of what the company accepts as true; nothing else is authoritative for truth.
2. **Promotion + ratification only.** Every Knowledge object originates from a governed promotion out of Long-term Memory and is ratified; no direct write, no un-ratified truth.
3. **Canonical and conflict-free.** One authoritative statement per fact; Knowledge may not hold conflicting information; contradictions are resolved before ratification.
4. **Knowledge overrides Memory; Memory cannot redefine Knowledge.** Memory may conflict and is not authoritative; in reasoning, ratified Knowledge wins.
5. **Versioned, never silently modified.** Corrections create versions and preserve history; superseded truth remains historically accessible.
6. **Provenanced, lineaged, stewarded.** Every truth records where it came from, how it evolved, and who is accountable for it.
7. **Not Policy, not Mission, not Reasoning.** Policy and Mission consume Knowledge but are not Knowledge; Reasoning consumes it but never mutates it; Knowledge states facts, not rules, purpose, or conclusions.
8. **Inert and bounded.** Knowledge never reasons, decides, executes, changes permissions, or owns intent; it states truth and is consumed.
9. **Fresh and governed-forgettable.** Truth carries freshness/expiration; deprecation/retirement/erasure are governed, never silent.
10. **Lifecycle and health are separate axes.** Lifecycle is governed (ratification-centric) existence; health is observed currency/consistency (`current`/`stale`/`contested`), ratified-only, automatic, and never changes lifecycle.

---

## 16. What Knowledge will NEVER do

Explicit boundaries to prevent responsibility creep. If a future request asks Knowledge to do any of these, the answer is: it belongs to Memory, Policy, Mission, Reasoning, or Execution.

- **Never accept a direct write or un-ratified truth.** Entry is promotion + ratification only.
- **Never hold conflicting information.** It is canonical; contradictions are resolved before ratification.
- **Never be redefined by Memory.** Memory may be referenced by Knowledge; it can never redefine it; Memory is not authoritative.
- **Never be silently modified.** Corrections version and re-ratify; superseded truth stays accessible.
- **Never be Policy or Mission, or let them define it.** Policy/Mission consume Knowledge; they do not define it, and it defines neither.
- **Never reason, decide, or execute.** It states truth; Reasoning consumes it (never mutates), Execution consumes it (never writes).
- **Never own business intent.**
- **Never let health change lifecycle, or exist without provenance, lineage, a steward, a domain, and a ratification.**
- **Never leak across tenants or scopes, or change permissions.** Isolation and permission scope are absolute; it enforces, never grants.
- **Never forget by accident.** Deprecation/retirement/erasure are governed; freshness never silently deletes truth.

---

## Implementation Assumptions

- **New enums (specification-level, not yet migrated):** `knowledgeLifecycleStatusEnum` (`draft | proposed | under-review | ratified | superseded | deprecated | retired | archived`), `knowledgeHealthEnum` (`unknown | current | stale | contested`), `knowledgeScopeEnum` (`company-wide | department | domain`), `knowledgeAuthorityEnum` (`authoritative | provisional`, extensible). Joins the accumulated unimplemented enum backlog from specs 35–44.
- **Existing `knowledge` schema:** the repo already has a `knowledge` schema; this spec assumes Knowledge extends/realizes it (adding domain/category/scope/provenance/lineage/steward/authority/freshness fields) rather than replacing it — reconciled at implementation.
- **Ratification is cross-module and Mission-like:** the write path spans Long-term Memory (promoter), Governance/Stewards (ratifiers), and Knowledge (store). Ratification is closer to Mission/Policy ratification than to Memory's promotion-acceptance — a stronger, separation-of-duties gate.
- **Knowledge is canonical (no confidence):** unlike Memory, ratified Knowledge is authoritative, not confidence-weighted; `provisional` authority is the only time-boxed, explicitly-flagged exception.
- **Retrieval/reads as Commands** where they cross the effect boundary; same-tenant in-process reads are an optimization behind the same permission checks.
- **No code, SQL, migrations, or schema changes produced** — architecture specification only, per instruction.

## Open Questions for 46 - Reasoning Specification v1.0

- **Reasoning's inputs, precisely.** Reasoning consumes Working Memory (context), Long-term Memory (experience), and Knowledge (authoritative truth). Define how Reasoning ranks/combines them: **Knowledge overrides Memory** (established here) — formalize the resolution rule Reasoning applies and how it cites sources.
- **Reasoning ↔ decision boundary.** Reasoning "thinks"; the cognitive chain (Goals/Plans/Decisions) "decides." Define what a Reasoning *output* is (a conclusion/recommendation) vs a *decision* (a governed commitment), and who commits it.
- **Reasoning is a process, not a store.** Confirm Reasoning holds nothing durable (unlike Memory/Knowledge) — its transient state lives in Working Memory; its conclusions become Memory (by promotion) or Knowledge (by ratification) or Decisions (by governance). Define these output paths.
- **Reasoning authority bounds.** Reasoning runs via LLM Commands performed by Execution under the Agent's ceiling — confirm Reasoning never exceeds the Agent's authority and never mutates Knowledge/Memory/Policy/Mission.
- **Reasoning determinism/auditability.** Reasoning uses non-deterministic LLMs — define how its steps are traced, cited (Knowledge/Memory refs + versions), and audited for a "why did the agent conclude X" reconstruction, given the deterministic-audit expectations of the prior specs.
- **Reasoning over conflicts.** When Memory conflicts with Knowledge, or two Knowledge dependencies strain, how does Reasoning surface/escalate rather than silently pick? Tie to `contested` Knowledge and Governance.
- **Accumulated enum + migration backlog** across specs 35–45 remains unimplemented; Reasoning will add more. An implementation/migration consolidation stage is now clearly overdue — flag explicitly for planning.
