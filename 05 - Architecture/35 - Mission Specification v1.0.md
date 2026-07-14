# Mission Specification v1.0

> Stage 2 — Mission module, complete Enterprise Architecture Specification.
> This document is the permanent architectural reference for Mission in Hebun AI.
> It specifies the highest layer of the cognitive hierarchy. It adds no implementation. It defines boundaries.

**Status:** Definitive · **Scope:** Mission module only · **Grounded in:** the existing schema primitives in `src/db/schema/_base.ts` (`rootColumns`, `tenantColumns`) and `_enums.ts` (`lifecycleStatusEnum`, `approvalStateEnum`, `roleTypeEnum`, `permissionScopeEnum`), the Identity Specification v1.0 (doc 34), and the Cognitive → Execution hierarchy designed for the Hebun AI Operating System.

**Position in the cognitive hierarchy:**

```
Mission            ← this document — the North Star of INTENT
  → Goals
    → Decisions
      → Plans
        → Tasks
          → Commands
            → Execution
```

Mission is the root of **intent**: everything below Mission derives from Mission. But Mission is *not* the root of **authority**. Mission is bound by a higher constraint stack it may never override:

```
Law and Regulation              ← absolute, external, non-negotiable
  → Security and Compliance Policy
    → Approved Company Policy
      → Mission                  ← the North Star of intent, subordinate to all above
        → Goals
          → Plans
            → Execution
```

Read the two together: Mission is the highest source of *intent* and the lowest node in the *authority precedence* that governs it. A Mission may direct the company toward any purpose that law, compliance, and approved policy permit — and no further. Where Mission conflicts with anything above it, **the higher layer wins, downstream execution is blocked, and a human must resolve the conflict explicitly.**

---

## 1. Purpose

### Why the Mission layer exists

Hebun AI is a digital company operating system. Identity (doc 34) answers **"who is acting and on behalf of which company."** Mission answers the question that must be settled *before* any actor is allowed to act at all: **"what is this company ultimately for, and does this action serve it?"**

Without a Mission layer, a digital company is a machine that executes commands with no reason to prefer one command over another. Goals become arbitrary, decisions become locally optimal but globally incoherent, and an autonomous agent optimizing a department metric can drive the whole company off a cliff while every individual step looks correct. Mission is the layer that makes autonomy *safe* and *directed*: it is the single, ratified statement of purpose that every downstream intent must be traceable to.

Mission is the **system of record for the company's purpose, its guiding principles, and the constraints those principles place on all subordinate intent.** It is the one artifact in the platform that is deliberately hard to change, because everything else changes fast and needs a fixed point to change *against*.

### Business problem it solves

Enterprises — human or digital — fail at three things Mission fixes:

1. **Direction.** Thousands of daily decisions must point the same way. Without a ratified North Star, each department, agent, and goal optimizes locally and the company diffuses. Mission gives every decision a common referent.
2. **Alignment enforcement.** It is not enough to *state* a purpose; an autonomous system must be able to *check* any goal, decision, or command against it and refuse what contradicts it. Mission is the checkable authority that makes "does this serve the company" a deterministic question, not a slogan.
3. **Change discipline.** Purpose must be stable enough to trust and amendable enough to survive reality. Mission provides a governed, audited, approval-gated way to evolve purpose without ever leaving the company purposeless for a moment.

Mission provides the fixed reference that Goals, Decisions, Plans, Tasks, Commands, and Execution all resolve against.

### Its responsibility

- Own the lifecycle of the company's purpose: `draft → proposed → ratified → superseded → archived`.
- Guarantee that **exactly one Mission is active (ratified) per company at any instant** — the North Star invariant.
- Hold the ratified Mission as **immutable**: a ratified Mission is never edited in place; it is superseded by a new, separately-ratified version.
- Provide the authoritative answer to `activeMission(companyId)` and `alignsWithMission(intent, companyId)`.
- Own the derivation edge: every Goal declares the Mission (and Mission version) it derives from. Mission validates that the derivation exists; it does not author the Goal.
- Emit Mission events so every downstream module re-anchors when purpose changes.
- Preserve an immutable, versioned audit trail of every purpose the company has ever held and why it changed.

### What is explicitly NOT its responsibility

- **It does not set Goals.** Mission is the *source of authority* Goals cite; the Goal module authors, schedules, and measures goals. Mission validates the derivation link, never the goal's content beyond alignment.
- **It does not make Decisions.** A Decision cites the Mission as a constraint input; the Reasoning/Decision layer computes the decision. Mission supplies the "what we are for," never the "what we now do."
- **It does not execute.** Mission never runs a command, touches a provider, or mutates business data. It is pure intent at the top of the stack.
- **It does not authenticate or authorize actors.** Who may *ratify* a Mission is an authorization decision computed by Governance from Identity data (`roleTypeEnum`). Mission consumes the resolved authority; it never validates a credential or a permission itself.
- **It does not model strategy or planning detail.** Business strategy, roadmaps, OKRs, and plans live in Goals/Plans. Mission is the purpose those artifacts serve, not the artifacts.

---

## 2. Mental Model

If Identity is the **skeleton** of the digital company, Mission is its **North Star** — the single fixed point in the sky that every part of the organism orients toward. The skeleton says *who and where*; the North Star says *why and toward what*.

The mental model in one line: **Mission is the immutable root of intent. Every Goal, Decision, Plan, Task, Command, and Execution is a descendant of exactly one ratified Mission version, and none of them may contradict it.**

Four properties define the model:

- **Singular.** A company has exactly one active company-level North Star Mission. Not a list of missions, not a folder of aspirations — one ratified statement of purpose at a time. Subsidiaries, organizations, departments, regions, and business units do **not** get their own North Star; they may define **mandates, strategic charters, or scoped objectives** that explicitly align beneath the one company Mission. Multiplicity of North Stars is a governance failure, and the schema forbids it.
- **Immutable-once-ratified.** You do not "update the mission." You *ratify a new version that supersedes the old one*, through a governed, approval-gated flow. The old version is preserved forever. This is what makes Mission trustworthy as a referent: while it is active, it does not move under you.
- **Derivable.** Mission is not a passive banner. It is a *checkable authority*: any subordinate intent can be tested for alignment against the active Mission, and the system can refuse intent that contradicts it. Purpose that cannot be checked is decoration; Mission is not decoration.
- **Bounded, not sovereign.** Mission is the top of *intent*, not the top of *authority*. It sits **beneath** an external and non-negotiable constraint stack: **Law and Regulation → Security and Compliance Policy → Approved Company Policy → Mission.** A Mission may pursue any purpose those layers permit and no further. Mission never overrides law, regulation, security, compliance, contractual obligation, or approved company policy. Where they conflict, the higher layer wins, downstream execution is blocked, and a human resolves it. The North Star tells the ship where to sail; it does not repeal the laws of the sea.

Mission sits **above Identity in intent but inside Identity in ownership, and beneath Law/Compliance/Policy in authority**: a Mission belongs to a Company (an Identity container), is authored and ratified by actors resolved through Identity, governs what those actors and their agents may *pursue*, yet is itself constrained by the legal, security, compliance, and approved-policy layers above it. Identity draws the boundary of the company; the constraint stack draws the boundary of the permissible; Mission fills what remains with direction.

---

## 3. Core Domain Objects

Mission introduces one primary entity and a small set of supporting objects. All reuse the existing column contracts from `_base.ts`:

- **`rootColumns`**: `id`, `createdAt`, `createdBy`, `updatedAt`, `updatedBy`, `version`, `lifecycleStatus` (`active | archived | deleted`), `deletedAt`.
- **`tenantColumns`** = `rootColumns` + `tenantId` (FK → `companies.id`, NOT NULL).

`createdBy` / `updatedBy` resolve to an **actor reference** as defined in Identity §3.9 (`{actorType, actorId}`, `actorType ∈ {human, agent, system, service}`). Mission never mutates without a resolved actor.

---

### 3.1 Mission

- **Purpose.** The ratifiable statement of a company's purpose and guiding principles. The North Star.
- **Table.** `missions` (`tenantColumns`).
- **Conceptual fields.**
  - `id`, `tenantId` — the owning company.
  - `title` — short human-facing name of the mission ("Become the world's most trusted rug house").
  - `statement` — the canonical purpose text; the immutable core once ratified.
  - `principles` — the ordered guiding principles that constrain how the purpose is pursued (structured list).
  - `missionState` — the state-machine position (`missionStateEnum`, §6).
  - `approvalState` — reuses `approvalStateEnum` (`not-required | pending | approved | rejected`) for the ratification gate.
  - `missionVersion` — the ratified purpose version (distinct from the row-level `version` audit counter; see §3.4).
  - `supersedesId` — nullable FK → `missions.id`; the prior ratified Mission this one replaces.
  - `ratifiedAt`, `ratifiedBy` — timestamp and actor reference of ratification.
  - `effectiveFrom`, `effectiveUntil` — the window during which this version is (or was) the active North Star.
  - base lifecycle/audit fields.
- **Required.** `tenantId`, `title`, `statement`, `missionState`.
- **Optional.** `principles`, `supersedesId`, `effectiveUntil` (open-ended while active).
- **Immutability.** Once `missionState = ratified`, `statement` and `principles` are frozen for that row. Changing purpose creates a **new** `missions` row with `supersedesId` pointing at the current one.
- **Ownership.** Owned by exactly one company. Root of the intent spine for that company.
- **Example.** Company `Turkish Rug House` → Mission `"Bring authentic Anatolian craftsmanship to the world without a middleman."`

### 3.2 Mission Principle

- **Purpose.** A single guiding constraint that qualifies *how* the purpose may be pursued. Principles are what make Mission checkable — a Goal or Decision is aligned only if it violates no principle.
- **Realization.** Structured entries within a Mission's `principles` (ordered, each with an `id`, `text`, and optional `priority`). Not a separate tenant table in v1.0; principles live and version with their Mission because a principle has no meaning outside the Mission that ratified it.
- **Example.** Principle: *"Never compromise artisan fairness for margin."* — a hard constraint any Goal or Decision must respect.

### 3.3 Sub-Mission (Alignment Charter)

- **Purpose.** An optional, narrower statement of purpose for an `organization` or `department`, which **must derive from and may never contradict** the company Mission. It translates the company North Star into a local one without creating a second North Star.
- **Realization.** A `missions` row scoped to a container via `scopeType` (`company | organization | department`) and `scopeId`. A sub-mission always carries `parentMissionId` → the company Mission it derives from.
- **Rule.** A company has exactly one `scopeType=company` active Mission. Organizations and departments may each have at most one active sub-mission, always subordinate. Sub-missions inherit and refine principles; they never relax them.
- **Example.** Company Mission → Department `Sales` sub-mission: *"Win trust before winning the sale."* — narrower, fully consistent with the parent.

### 3.4 Mission Version (immutable lineage record)

- **Purpose.** The permanent, ordered history of every purpose a company has ever ratified. The lineage that makes "why did our purpose change, and when" answerable forever.
- **Realization.** Each ratified `missions` row *is* a version, linked backward by `supersedesId` and identified by `missionVersion` (1, 2, 3…). The chain `v1 ← v2 ← v3` is the company's mission history. No version is ever edited or deleted.
- **Distinction.** `missionVersion` counts *ratified purpose changes* (rare, governed). The base `version` column counts *row-level mutations* (draft edits before ratification, metadata touches). They are orthogonal.

### 3.5 Alignment Assertion (derivation edge)

- **Purpose.** The typed link a downstream artifact (Goal, Decision, Plan) carries to declare which Mission version it serves. This is how the whole cognitive stack stays traceable to purpose.
- **Realization.** Not owned by Mission as a table; it is a `{missionId, missionVersion}` reference carried by the downstream artifact (e.g. `goals.missionRef`). Mission exposes the *validator* (`alignsWithMission`), the downstream module *carries* the reference. Mission owns the check; it does not own the pointer.

---

## 4. Mission Ownership

- **Owned by Company.** Every Mission (`scopeType=company`) belongs to exactly one company via `tenantId`. There is no platform-global mission; purpose is always a tenant's own.
- **Authored by actors, ratified by authority.** A Mission is drafted by any authorized actor (human or agent) resolved through Identity. It is **ratified only by an actor whose resolved role authority permits it** — by default `roleTypeEnum ∈ {owner, director}`, computed by Governance, not by Mission. Mission records `ratifiedBy` as the accountable actor.
- **Sub-mission ownership.** An organization/department sub-mission is owned by the company (tenant) and *scoped* to the container. Ownership never leaves the company; scope only narrows the audience and authority required.
- **No cross-tenant missions.** A Mission is never shared across companies. In a holding/M&A structure each company holds its own Mission; a parent company's Mission does not implicitly govern a subsidiary's — alignment across tenants, if desired, is an explicit governed link, never inheritance (see §13).
- **Accountability.** Because ratification changes the direction of the entire company, `ratifiedBy` is a first-class, immutable, audited actor reference. "The system ratified it" is never valid; every Mission version traces to an accountable authority.

---

## 5. Mission Hierarchy

Mission has two hierarchies that must not be confused: the **scope hierarchy** (where a mission applies) and the **version lineage** (how a mission evolves over time).

### 5.1 Scope hierarchy (spatial)

```
Company Mission            (scopeType=company)   — the North Star, exactly one active per company
  └── Organization Sub-Mission   (scopeType=organization)  — optional, derives from company Mission
        └── Department Sub-Mission  (scopeType=department)  — optional, derives from org (or company) Mission
```

Rules of the scope hierarchy:

- **One North Star.** Exactly one active `scopeType=company` Mission per company. Non-negotiable and structurally enforced (§7).
- **Derivation, not divergence.** Every sub-mission carries `parentMissionId` and must be *consistent with* its parent. A sub-mission refines and localizes; it can add narrower principles but can never contradict or relax a parent principle.
- **Optional depth.** A single-purpose company runs on the company Mission alone. Organizations and departments add sub-missions only when local translation adds clarity.
- **Downward derivation continues past Mission.** Below the department sub-mission, the hierarchy hands off to Goals: `Mission → Goals → Decisions → Plans → Tasks → Commands → Execution`. Every one of those artifacts is a descendant of a Mission version.

### 5.2 Version lineage (temporal)

```
Mission v1  ──superseded by──▶  Mission v2  ──superseded by──▶  Mission v3 (active)
 (archived)                       (archived)                      (ratified)
```

Rules of the version lineage:

- **Append-only.** New purpose = new version. Prior versions are archived, never deleted.
- **Single active tip.** Exactly one version in the chain is `ratified/active` at any time; all earlier versions are `superseded`.
- **Continuity.** Supersession is atomic: the moment v3 becomes active, v2 becomes superseded. There is never a gap in which the company has no active Mission (§6, §12).

The scope hierarchy answers "where does this purpose apply." The version lineage answers "which purpose is current and what came before." Every Goal's Alignment Assertion (§3.5) names a point in *both*: a mission `id` (scope) at a `missionVersion` (lineage).

---

## 6. Mission State Machine

Every Mission moves through a deterministic state machine backed by a new `missionStateEnum` and gated by the existing `approvalStateEnum`. The governing rule: **the company is never without an active Mission, and a ratified Mission never mutates.**

**`missionStateEnum`** (specified): `draft | proposed | ratified | superseded | archived`.

| State | Meaning | Mutable? | Is North Star? |
|---|---|---|---|
| **draft** | Being authored; not yet submitted | Yes (statement/principles editable) | No |
| **proposed** | Submitted for ratification; approval pending | No (frozen for review) | No |
| **ratified** | Approved and active — the current North Star | No (immutable) | **Yes** |
| **superseded** | Replaced by a newer ratified version | No (immutable, retained) | No |
| **archived** | Retired draft/proposal or a very old lineage entry retained for audit | No | No |

### Transitions

| Transition | From → To | Precondition | Effect | Emits |
|---|---|---|---|---|
| **Draft** | ∅ → draft | Authoring actor resolved | Row created, `missionState=draft`, `approvalState=not-required` | `MissionDrafted` |
| **Propose** | draft → proposed | Passes validation (§8); ratification authority identified | `missionState=proposed`, `approvalState=pending`; statement/principles frozen | `MissionProposed` |
| **Approve/Ratify** | proposed → ratified | `approvalState` reaches `approved` by an authorized ratifier; predecessor (if any) still active | Predecessor atomically → superseded; this row `ratified`, `ratifiedAt/By` set, `effectiveFrom=now`, `missionVersion=predecessor+1` | `MissionRatified` (+ `MissionSuperseded` for predecessor) |
| **Reject** | proposed → draft \| archived | Ratifier rejects | Returns to `draft` for revision, or `archived` if abandoned; **no change to the active Mission** | `MissionRejected` |
| **Supersede** | ratified → superseded | A successor version reaches `ratified` | `missionState=superseded`, `effectiveUntil=now` | `MissionSuperseded` |
| **Amend** | ratified → (new draft) | Amendment authorized | Creates a **new** draft row with `supersedesId` = active Mission; the active Mission stays untouched until the amendment is ratified | `MissionAmendmentProposed` |
| **Archive** | draft \| proposed \| superseded → archived | Not the active version | `lifecycleStatus=archived`; retained for audit | `MissionArchived` |

### The continuity invariant

Ratification and supersession are a **single atomic transaction**: the successor becomes `ratified` and the predecessor becomes `superseded` together, or neither does. This guarantees the company transitions directly from "governed by v_n" to "governed by v_{n+1}" with no instant in between where zero missions are active. A failed ratification leaves the current Mission fully in force.

---

## 7. Mission Constraints

Structural and semantic constraints, enforced by the schema and the module — not by convention.

**Structural (schema-enforced):**

1. **Single active company Mission.** A partial unique index on `missions` over `(tenantId)` where `scopeType='company' AND missionState='ratified'` guarantees **at most one** active company Mission per tenant.
2. **Single active sub-mission per scope.** Partial unique over `(tenantId, scopeType, scopeId)` where `missionState='ratified'` — at most one active mission per container.
3. **Tenant isolation.** `tenantId` NOT NULL, FK → `companies.id`, on every Mission row (inherited from `tenantColumns`). Cross-tenant leakage is structurally impossible.
4. **Version monotonicity.** `missionVersion` strictly increases along a `supersedesId` chain; unique `(tenantId, scopeType, scopeId, missionVersion)`.
5. **No self-supersession / no cycles.** `supersedesId ≠ id`; the supersession chain is acyclic (checked at write time).
6. **Immutability of ratified rows.** Updates to `statement` / `principles` are rejected when `missionState ∈ {ratified, superseded}`.
7. **Ratification provenance.** `ratifiedAt` and `ratifiedBy` are non-null iff `missionState ∈ {ratified, superseded}`.

**Semantic (module-enforced):**

8. **Mission is required for business and strategic execution — but not for protective operations.** A company with no `ratified` company Mission is blocked from *autonomous business and strategic live execution* (revenue, growth, customer, operational goals) — agents fall back to simulation until a Mission exists (mirrors the `providerStatusEnum` posture). The following operations are **Mission-exempt** and proceed regardless of whether a Mission exists or is under change:
   - security containment
   - compliance enforcement
   - access revocation
   - backup and recovery
   - platform health
   - incident response
   - mandatory legal operations

   These exist to protect the company and satisfy its obligations; they must never be blocked for lack of a strategic purpose statement. Mission gates *ambition*, never *protection*.
9. **Mission is subordinate to the authority stack.** A ratified Mission — and any Goal/Plan/Execution derived from it — may never override **law, regulation, security policy, compliance policy, contractual obligation, or approved company policy.** Precedence is fixed: **Law and Regulation → Security and Compliance Policy → Approved Company Policy → Mission → Goals → Plans → Execution.** A detected Mission-vs-(law/compliance/approved-policy) conflict is a hard stop: downstream execution is **blocked** and the conflict is escalated for **explicit human resolution** — the system never auto-resolves in Mission's favor.
10. **Sub-missions may not relax parent principles.** A mandate/charter/scoped objective's principle set must be a *consistent refinement* of the parent Mission's; contradiction is rejected at proposal validation (§8). A scoped mission is never a competing North Star.
11. **Ratification requires authority.** The ratifier's resolved role must satisfy the company's ratification policy (default `owner|director`). Enforced via Governance inputs, checked before `proposed → ratified`.
12. **Amend, never edit.** There is no code path that mutates a ratified statement in place. The only route to new purpose is a new version.

---

## 8. Mission Validation Rules

Validation runs at two gates: **draft → proposed** (submission) and **proposed → ratified** (ratification). Mission fails closed: on any ambiguity, the proposal does not advance and the active Mission is untouched.

**Content validation (at submission):**

- `title` present, non-empty, within length bounds.
- `statement` present and non-empty; a Mission with no purpose text cannot be proposed.
- `principles` (if any) each have non-empty text and a resolvable priority ordering.
- No duplicate principle text within the set.

**Structural validation (at submission):**

- `scopeType` and `scopeId` resolve to a live Identity container (company/organization/department) in the same tenant.
- For a sub-mission, `parentMissionId` resolves to an **active** ancestor Mission in the same tenant.
- `supersedesId` (if present) resolves to the current active Mission for this scope — you may only supersede the reigning version, never a stale one.

**Consistency validation (at submission):**

- **Principle refinement check.** For a sub-mission, every parent principle is either inherited unchanged or narrowed; none is contradicted or dropped. A contradiction (e.g. parent says "never discount below cost," child says "discount to win share") is rejected.
- **Self-consistency check.** The proposed principle set contains no internal contradictions.

**Legality & precedence validation (at submission and re-checked at ratification):**

- **Authority-stack conformance.** The proposed Mission `statement` and `principles` are checked against the higher constraint stack — law/regulation markers, active security and compliance policy, and approved company policy. A Mission that *directs* the company to act against any of these cannot be ratified.
- **Conflict is a blocking outcome, not a soft flag.** If a conflict with law, regulation, security, compliance, contractual obligation, or approved policy is detected, the proposal does not advance; the conflict is recorded and routed for **explicit human resolution**. The system never ratifies a Mission over an unresolved higher-precedence conflict.
- **Standing re-check.** Because approved policy and compliance rules change *after* a Mission is ratified, the active Mission is re-validated against the stack when a superseding policy/compliance change lands; a newly-created conflict blocks Mission-derived downstream execution and raises `MissionAlignmentViolationDetected` until a human resolves it.

**Authority validation (at ratification):**

- The ratifying actor's resolved authority satisfies the ratification policy (Governance-computed from Identity `roleTypeEnum`).
- **Separation of duties.** The actor who *authored/proposed* the Mission may not be the sole *ratifier* when the ratification policy requires independent approval (reuses the `approvalStateEnum` chain; ties to Identity §13 separation-of-duties).

**Continuity validation (at ratification):**

- A predecessor exists and is still active (for versions ≥ 2), so supersession is atomic and gap-free.
- The ratification transaction can atomically flip predecessor → superseded and successor → ratified; if it cannot, ratification is refused and the active Mission stands.

Only a proposal passing **all** applicable gates advances. A failure returns the proposal to `draft` with the violated rule recorded; it never partially ratifies.

---

## 9. Mission Relationships

Mission is the source of intent; every relationship below is other modules pointing *up* at Mission. Mission points down at nothing except its own sub-missions.

| Module | Relationship to Mission |
|---|---|
| **Company** | A Mission **belongs to** a Company via `tenantId`. The Company is the tenant root (Identity §3.1); the Mission is that company's single active statement of purpose. One company, one active Mission. Identity supplies the ownership edge; Mission supplies the purpose. |
| **Organization** | An Organization may hold **one active sub-mission** (`scopeType=organization`) that derives from the company Mission. It localizes purpose for a division/subsidiary/brand without creating a second North Star. |
| **Departments** | A Department may hold **one active sub-mission** (`scopeType=department`) deriving from its organization's or the company's Mission. This is how a functional unit (Sales, Finance, Legal) translates the North Star into its own charter. Departments *receive* Goals that must cite a Mission version. |
| **Agents** | An Agent (Identity §3.8, a digital employee) **operates in service of** the Mission of its company/department. An agent may *author or propose* a Mission draft (subject to authority), but its autonomous actions are bounded by Mission: an agent may never pursue a Goal or issue a Command that fails `alignsWithMission`. Mission is the agent's outermost guardrail — above its role ceiling, above its department scope. |
| **Goals** | **The primary derivation edge.** Every Goal carries an Alignment Assertion `{missionId, missionVersion}` (§3.5). A Goal without a Mission reference is invalid. Mission validates that the derivation exists and that the Goal does not contradict a Mission principle; the Goal module owns the goal's content, targets, and measurement. `Mission → Goals` is the first hop of the cognitive hierarchy. |
| **Decisions** | A Decision cites the active Mission as a **constraint input**. The Reasoning/Decision layer computes the decision; Mission supplies the principles the decision must respect. A decision that violates a Mission principle is refused or escalated. Mission answers "what we are for"; the Decision layer answers "what we now do about it." |
| **Law & Regulation** | The **absolute** top of the authority stack, external to the platform. Mission is subordinate to it without exception. A Mission that would direct the company to violate law or regulation cannot be ratified; a mandatory legal operation proceeds even with no Mission and even mid-amendment (Mission-exempt, §7.8). Mission never repeals, reinterprets, or outweighs law. |
| **Security & Compliance Policy** | Ranks **above** Mission. Security containment, compliance enforcement, access revocation, backup/recovery, platform health, and incident response are Mission-exempt protective operations (§7.8) — never blocked for lack of purpose. A Mission conflicting with security or compliance policy is blocked and escalated for human resolution; it never wins by default. |
| **Approved Company Policy** | Ranks **above** Mission in precedence, though Mission constrains *ends* and Policy constrains *means*. Approved policy (Identity §3.11, `policies`, `approvalStateEnum`) may implement a Mission principle, but where an *approved* policy and Mission conflict, **the approved policy prevails**, downstream execution is **blocked**, and the conflict requires **explicit human resolution** — either the policy is amended or the Mission is re-ratified through the governed flow. Mission never silently overrides ratified policy. (Draft/unapproved policy does not outrank Mission; only *approved* policy does.) |
| **Governance** | Governance **evaluates ratification authority, authority-stack conformance, and alignment enforcement** using Mission as the reference and the higher stack as the ceiling. Mission stores the North Star and the checkable principles; Governance decides *who may ratify*, *whether a Mission conflicts with law/compliance/approved policy*, and *whether a flagged misalignment blocks or escalates to a human*. Same input/decision split as Identity ↔ Governance: Mission supplies the standard, Governance renders verdicts and routes conflicts to human resolution. |
| **Identity** | Mission depends on Identity for every actor reference (author, proposer, ratifier) and every scope target (company, organization, department). Identity draws the boundary and names the actors; Mission fills the boundary with direction and records which actors set it. |

**The intent spine:** `Company (Identity) → Mission → Goals → Decisions → Plans → Tasks → Commands → Execution`. Mission is the second node and the first *intentful* one: Identity says the company exists, Mission says what it is for, and everything after derives from that.

---

## 10. Mission Event Model

Every Mission mutation emits exactly one domain event. Events are Mission's public reaction surface — downstream modules subscribe and re-anchor; they never read Mission's tables directly. Payloads carry `actorRef` (`{actorType, actorId}`), `tenantId`, `missionId`, `missionVersion`, `scopeType`, `scopeId`, and `occurredAt`.

| Event | Trigger | Payload (beyond envelope) | Consumers | Business impact |
|---|---|---|---|---|
| `MissionDrafted` | New mission draft created | scopeType, parentMissionId? | Dashboard, Governance | A candidate purpose exists; not yet binding |
| `MissionProposed` | Draft submitted for ratification | proposedBy, approvalRef | Governance, Notifications | Ratification workflow begins |
| `MissionRejected` | Proposal rejected | reason, ratifierRef | Dashboard, Notifications | No change to the active North Star |
| `MissionRatified` | Proposal approved and made active | previousMissionId?, effectiveFrom | **Goals, Decisions, Plans, Agents, Governance, Dashboard** | New North Star in force; all downstream intent must re-anchor to the new version |
| `MissionSuperseded` | Prior version retired by a successor | successorMissionId, effectiveUntil | Goals, Decisions, Audit | Old version no longer authoritative; goals citing it flagged for re-derivation |
| `MissionAmendmentProposed` | Amendment draft opened against the active Mission | baseMissionId, baseVersion | Governance, Dashboard | Purpose change under consideration; active Mission unaffected |
| `MissionArchived` | Draft/proposal/old version retired | previousState | Dashboard, Reporting | Removed from active views, history kept |
| `SubMissionAligned` | Sub-mission ratified under a parent | parentMissionId, scopeId | Departments, Goals | Local charter now in force, consistent with parent |
| `MissionAlignmentViolationDetected` | A Goal/Decision/Command found to contradict the active Mission | offendingArtifactRef, violatedPrincipleId | Governance (high severity), Notifications, Audit | Downstream intent flagged; blocked or escalated per Governance |
| `MissionDriftDetected` | Alignment metrics cross a drift threshold | driftScore, window | Executive Dashboard, Governance | Company action is diverging from stated purpose; leadership alerted |

**Ordering and idempotency.** Events carry `missionVersion`; consumers detect and discard stale/duplicate deliveries. Emission is **transactional with the mutation** — a Mission event is never emitted unless the state change committed, and (mirroring Identity §7) a failed event/audit write rolls back the mutation. `MissionRatified` is the single most consequential event in the platform: it is the signal every intent-bearing module treats as a re-anchor instruction.

---

## 11. Mission KPIs

Mission's health and the company's fidelity to it, measured deterministically from Mission's own records and the alignment assertions carried downstream.

| KPI | Definition | Source |
|---|---|---|
| **Mission clarity** | Whether an active, ratified, non-empty Mission exists with a resolvable principle set (binary per company, rolled up across tenants) | mission state + validation |
| **Goal-derivation coverage** | % of active Goals carrying a valid Alignment Assertion to the *current* Mission version (target 100%) | goal `missionRef` vs active mission |
| **Alignment rate** | % of Decisions/Commands in a window that pass `alignsWithMission` without violation | alignment checks + violation events |
| **Mission drift** | Rate/severity of `MissionAlignmentViolationDetected` over a window; rising drift = company acting against purpose | violation event stream |
| **Stale-derivation ratio** | % of active Goals still citing a *superseded* Mission version after a ratification (should trend to 0 as they re-derive) | goal `missionRef` vs supersession |
| **Ratification governance health** | % of ratifications with valid authority + satisfied separation-of-duties + complete approval chain (target 100%) | approval chain + authority check |
| **Mission stability** | Time the active Mission has been in force; frequency of supersession (excessive churn signals an unstable North Star) | version lineage timestamps |
| **Sub-mission consistency** | % of active sub-missions passing the principle-refinement check against their parent (target 100%) | consistency validation |

These feed the Executive and Admin dashboards (§ below and Identity §10). All are computed from Mission's own rows, its audit lineage, and the derivation references downstream modules carry — no external inference.

**Dashboard surfacing (summary).** *Executive:* the active Mission, its version, mission-drift and alignment-rate tiles. *Director:* the scope's sub-mission, goal-derivation coverage for their department, pending amendments. *Admin:* full lifecycle surface — draft/propose/ratify/supersede, ratification approvals, mission history, integrity checks. *Mobile:* read-first (the North Star, my department's charter, approve pending ratifications). *Audit:* the full version lineage per company — every purpose ever held, who ratified it, when, and why.

---

## 12. Failure Scenarios

At least the following failure modes and the system's deterministic reaction. The governing rule: **Mission fails closed and gap-free** — on ambiguity it refuses the change and leaves the current North Star fully in force.

1. **No active Mission at all.** A company with no ratified company Mission is blocked from autonomous *business and strategic* live execution; agents resolve to simulation and an "establish Mission" prompt is raised. Drafting/planning still allowed. **Protective operations are Mission-exempt (§7.8)** — security containment, compliance enforcement, access revocation, backup/recovery, platform health, incident response, and mandatory legal operations proceed normally even with no Mission. Lack of purpose never disables protection.
2. **Two active company Missions (attempted).** Structurally impossible — the partial unique index (§7.1) rejects the second ratification. The in-flight ratification fails; the reigning Mission stands.
3. **Editing a ratified Mission.** Refused. Immutable rows reject `statement`/`principles` mutation (§7.6). The only path is Amend → new version.
4. **Ratification gap (successor fails mid-flip).** The atomic ratify/supersede transaction rolls back entirely; predecessor remains active. The company is never left missionless (§6 continuity invariant).
5. **Sub-mission contradicts parent.** Rejected at proposal validation (§8 refinement check). The contradicting sub-mission never becomes active.
6. **Goal references a superseded Mission version.** On `MissionSuperseded`, such goals are flagged (`Stale-derivation ratio` KPI) and routed to re-derivation; they are not silently honored against dead purpose.
7. **Goal with no Mission reference.** Invalid at the Goal layer — a goal without an Alignment Assertion cannot activate. Mission supplies the validator; the Goal module enforces the presence.
8. **Decision/Command that violates a Mission principle.** `MissionAlignmentViolationDetected` fires; Governance blocks or escalates per policy. The action does not proceed autonomously on a violated principle.
9. **Unauthorized ratification attempt.** Refused at the authority gate (§8). The actor lacks the required `roleTypeEnum`; logged as a governance/security event.
10. **Author self-ratifies where independence is required.** Refused by separation-of-duties (§8). Requires an independent ratifier.
11. **Superseding a stale (non-current) version.** Refused — `supersedesId` must resolve to the *current* active Mission. Prevents branching the North Star.
12. **Concurrent amendments (two successors proposed).** Only one can win the atomic ratify/supersede; the second finds the base no longer current and is refused, returned to draft to rebase on the new active version. No lost update, no forked lineage.
13. **Circular supersession.** Rejected by the acyclicity check (§7.5).
14. **Cross-tenant Mission reference.** Any Mission or alignment reference whose `tenantId` doesn't match the actor's tenant is refused (structural isolation, §7.3).
15. **Empty or purposeless statement.** Rejected at submission (§8 content validation). A Mission with no purpose text cannot be proposed.
16. **Sub-mission orphaned by parent supersession.** When a parent Mission is superseded, active sub-missions are flagged for re-alignment against the new parent version; they are not auto-invalidated, but new goals under them are refused until re-aligned.
17. **Audit/event write failure on ratification.** Because emission is transactional with the mutation, a failed audit write rolls back the ratification. No un-audited purpose change can commit.
18. **Agent proposes a Mission beyond its authority.** An agent may draft/propose but never *ratify*; a ratification attempt by an agent is refused, and an agent's proposal still requires an authorized human/role ratifier.
19. **Drift accumulates unnoticed.** The `MissionDriftDetected` event and drift KPI force surfacing to leadership when alignment degrades past a threshold — silent divergence is structurally alarmed, not tolerated.
20. **Restore of a superseded version as active.** Refused as a direct operation. Reinstating an old purpose is itself a new ratification (a new version whose statement equals the old one), fully governed and audited — history is never rewritten to make an old version "current."
21. **Mission conflicts with law, regulation, security, compliance, contract, or approved policy.** Hard stop. The Mission cannot ratify (at submission/ratification) or, if the conflict arises later from a policy/compliance change, all Mission-derived downstream execution is **blocked** and `MissionAlignmentViolationDetected` is raised. The system **never auto-resolves in Mission's favor** — a human must resolve it by amending the policy or re-ratifying the Mission through the governed flow. Protective operations continue regardless (§7.8).
22. **Approved policy change strands the active Mission.** A newly approved company policy or compliance rule contradicts the standing Mission. The Mission is not silently overridden nor silently kept — the conflict is surfaced, Mission-derived execution halts, and Governance routes it to explicit human resolution. Both artifacts are preserved; neither is edited in place.
23. **Scoped mission attempts to act as a competing North Star.** A subsidiary/department/region defines a mandate or charter that behaves as an independent North Star rather than a refinement of the company Mission. Rejected — a scoped mission must carry `parentMissionId` and pass the refinement check; there is exactly one company-level North Star (§7.1).

---

## 13. Enterprise Use Cases

Behavior of Mission in real enterprise situations. In every case Mission mutates only purpose/version/scope edges and emits events; downstream modules re-anchor.

1. **Company founding.** First Mission drafted → proposed → ratified by the owner. `MissionRatified` (v1) lights up the company's autonomous operation. Everything below now has a North Star to derive from.
2. **Strategic pivot.** Leadership amends purpose. New version drafted with `supersedesId` = current, ratified through the approval gate; v1 → superseded, v2 → active, atomically. Goals citing v1 are flagged for re-derivation.
3. **New department charter.** Sales gets a sub-mission deriving from the company Mission, refining it ("win trust before the sale"). `SubMissionAligned` fires; Sales goals now cite the department sub-mission, itself consistent with the North Star.
4. **Multi-brand / multi-org company.** Each organization holds a sub-mission localizing the company Mission per brand or country, never contradicting it.
5. **Autonomous agent guardrail.** An SDR agent proposes an aggressive discounting goal. `alignsWithMission` finds it violates the "artisan fairness" principle → refused before it ever becomes a Command. Mission stopped a locally-rational, globally-harmful action.
6. **M&A.** Acquirer and target each keep their own Mission (separate tenants). Post-merge, the target's Mission is either superseded by an aligned successor or the target company is re-parented; alignment across the two is an explicit governed link, never silent inheritance.
7. **Board-mandated principle addition.** A new guiding principle ("carbon-neutral sourcing by 2030") is added — a new Mission version, ratified, with the principle now checkable against every future goal and decision.
8. **Regulatory constraint.** A compliance rule enters as a **Policy** (means), implementing but not replacing the Mission principle it protects. Mission unchanged; Policy versioned separately.
9. **Purpose audit.** An auditor reads the full version lineage: every purpose the company held, who ratified each, when, and what it superseded — immutable and exportable.
10. **Founder transition.** Ratification authority moves with the owner role (Identity ownership transfer). The Mission itself is untouched; only *who may next ratify* changes.
11. **Drift alarm.** Over a quarter, alignment rate falls as departments chase local metrics. `MissionDriftDetected` surfaces on the Executive Dashboard; leadership re-aligns goals or re-ratifies a sharper Mission.
12. **Simulation vs live.** A company still drafting its Mission runs agents in simulation only; live autonomous execution unlocks the moment a Mission is ratified (mirrors `providerStatusEnum`).
13. **Sub-mission conflict caught early.** A department drafts a sub-mission that quietly contradicts the North Star; the refinement check rejects it at proposal, before any goal derives from a broken charter.
14. **Rollback of a bad pivot.** A pivot proves wrong. The company does not "undo" — it ratifies a *new* version restoring the prior purpose, preserving the full honest lineage of what was tried and reversed.
15. **Franchise.** Each franchisee is its own tenant with its own Mission; the franchisor's Mission governs the franchisor only, with explicit alignment links where brand consistency is contractually required.

---

## 14. Future Extensibility

How Mission absorbs future demands **without redesign**, because the core abstractions were chosen as extension points.

- **Richer principles.** Principles can gain weights, categories, or machine-checkable predicates without schema change — they are structured entries within the versioned Mission, and versioning already carries their evolution.
- **Quantitative alignment.** `alignsWithMission` can evolve from principle-match to a scored alignment model; the derivation edge (`{missionId, missionVersion}`) and the event surface are unchanged — only the validator's internals deepen.
- **Mission templates / marketplace.** Purpose templates (industry-standard missions) are just draft `missions` rows a company adopts and ratifies; no new primitive.
- **Multi-lingual missions.** `statement` and `principles` can carry localized variants; the ratified canonical version remains the single source, translations hang off it.
- **AI-assisted mission authoring.** An agent proposing/drafting missions is already first-class (agents are actors); the author/ratifier split and separation-of-duties keep AI authorship safe by construction.
- **Cross-tenant alignment (holdings).** An explicit, governed alignment link between a parent company Mission and subsidiary Missions can be added as a typed edge — never as inheritance — preserving tenant isolation.
- **Temporal missions / horizons.** `effectiveFrom`/`effectiveUntil` already model time; scheduled future ratifications (a mission that activates on a date) extend the state machine without touching the model.
- **External governance / OKR sync.** Because Goals carry a typed derivation to Mission versions, external OKR or strategy tools integrate as consumers of the Alignment Assertion and the Mission event stream — Mission is unchanged.

The invariant enabling all of the above: **purpose is versioned and immutable-once-ratified; principles are structured and extensible; alignment is a validator behind a stable derivation edge; the author/ratifier split isolates governance change.** New demands plug into these seams without touching the North Star invariant.

---

## 15. Architectural Principles

The permanent design principles governing Mission. If a future request conflicts with one of these, the request is wrong, not the principle.

1. **One North Star.** Exactly one active company-level Mission per company, always. Subsidiaries, organizations, departments, regions, and business units define **mandates, strategic charters, or scoped objectives** that align beneath it — never competing North Stars. Multiplicity of North Stars is a defect, structurally forbidden.
2. **Immutable once ratified.** A ratified Mission never mutates. Purpose evolves only by ratifying a new version that supersedes the old — the old is preserved forever.
3. **Gap-free continuity.** Supersession is atomic. The company is never, for any instant, without an active Mission.
4. **Everything derives from Mission.** Every Goal, Decision, Plan, Task, Command, and Execution traces to exactly one Mission version. Intent without a Mission ancestor is invalid.
5. **Checkable, not decorative.** Mission is a validated authority, not a banner. Any subordinate intent can be tested against it, and misalignment is refused or escalated — never silently honored.
6. **Fail closed and loud.** On ambiguity, Mission refuses the change and keeps the current North Star. Drift and violations are alarmed, not tolerated.
7. **Author proposes, authority ratifies.** Anyone (human or agent) may draft purpose; only resolved authority may ratify it, with separation of duties. "The system ratified it" is never valid.
8. **Constrains ends, not means.** Mission owns *why* and *toward what*; Policy owns *how*; Goals own *what next*. Mission never executes, never authorizes, never plans.
9. **Bounded by the authority stack.** Mission is the top of *intent* and subordinate in *authority*. Precedence is absolute: **Law and Regulation → Security and Compliance Policy → Approved Company Policy → Mission → Goals → Plans → Execution.** Mission never overrides law, regulation, security, compliance, contractual obligation, or approved policy. A conflict is a blocking stop requiring explicit human resolution — never an auto-win for Mission.
10. **Protection is never gated by purpose.** Mission is required for business and strategic execution, but security containment, compliance enforcement, access revocation, backup/recovery, platform health, incident response, and mandatory legal operations proceed with or without a Mission. Mission gates ambition, never protection.
11. **Immutable audit lineage.** Every purpose the company ever held is retained, versioned, and attributed. Mission history is never rewritten.
12. **Tenant-sovereign.** Purpose belongs to exactly one company. No global mission, no implicit cross-tenant inheritance.

---

## 16. What this module will NEVER do

Explicit boundaries to prevent responsibility creep. If a future request asks Mission to do any of these, the answer is: it belongs to another module.

- **Never author Goals, Decisions, or Plans.** Mission is the authority they cite; it validates derivation, it does not produce them.
- **Never execute.** No command, no provider call, no business-data mutation. Mission is pure intent.
- **Never authenticate or authorize actors.** Who may ratify is a Governance decision over Identity data; Mission consumes the verdict, never computes it.
- **Never mutate a ratified statement in place.** Amend-only. There is no edit path to active purpose.
- **Never allow two active Missions in one scope.** Structurally impossible; enforced by the schema.
- **Never leave a company missionless during change.** Supersession is atomic and gap-free.
- **Never inherit purpose across tenants implicitly.** Cross-company alignment is always explicit, governed, and audited.
- **Never override law, regulation, security, compliance, contract, or approved policy.** Mission is subordinate to the authority stack. Where Mission conflicts with anything above it, the higher layer wins, downstream execution is blocked, and a human resolves the conflict. Mission never self-resolves in its own favor.
- **Never block a protective operation for lack of a Mission.** Security containment, compliance enforcement, access revocation, backup/recovery, platform health, incident response, and mandatory legal operations are Mission-exempt. Mission gates business ambition, never protection.
- **Never let a subsidiary, department, or region raise a competing North Star.** Scoped missions are mandates/charters that refine the one company Mission; they are never independent purposes.
- **Never mutate without an actor and an audit record.** Anonymous or un-audited purpose change is structurally impossible.
- **Never rewrite mission history.** Old versions are preserved forever; reinstating a past purpose is a new, governed ratification.

---

*End of Mission Specification v1.0. This document specifies the Mission module — the immutable North Star at the top of Hebun's cognitive hierarchy — in full and defines its permanent boundaries. No implementation code. No TypeScript. No other module modified.*
