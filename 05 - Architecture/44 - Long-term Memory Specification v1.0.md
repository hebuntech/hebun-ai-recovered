# Long-term Memory Specification v1.0

> Stage 11 — Long-term Memory module, complete Enterprise Architecture Specification.
> This document is the permanent architectural reference for Long-term Memory in Hebun AI.
> It specifies the durable memory layer — the canonical store of retained experiences after governed promotion. It adds no implementation. It defines boundaries.

**Status:** Definitive · **Scope:** Long-term Memory module only · **Grounded in:** the schema primitives in `src/db/schema/_base.ts` (`rootColumns`, `tenantColumns`) and `_enums.ts` (`lifecycleStatusEnum`, `approvalStateEnum`, `memoryKindEnum`, `providerStatusEnum`, `roleTypeEnum`, `permissionScopeEnum`), and the Identity (34), Mission (35), Goal (36), Plan (37), Task (38), Workflow (39), Command (40), Execution (41), Agent (42), and Working Memory (43) Specifications v1.0.

**Position in the memory hierarchy:**

```
Working Memory (doc 43)  — transient cognitive workspace; disposable
   │  (governed promotion only — never a direct write)
   ▼
Long-term Memory (this document) — DURABLE, canonical store of retained experiences
   ▲  (read-only retrieval feeds Working Memory)
```

**Authority precedence (unchanged, absolute):**

```
Law → Security/Compliance → Approved Policy → Mission → Goals → Plans → Tasks → Workflows → Commands → Execution → Agent → Working Memory → Long-term Memory
```

Long-term Memory is the **durable memory layer** — the single canonical store of everything the company and its agents *retain* after a governed promotion from Working Memory. Working Memory is transient; **Long-term Memory is durable.** It stores **facts, experiences, and procedures** — episodic, semantic, and procedural memory — with full provenance, lineage, versioning, confidence, and trust. It is the disk of the digital workforce; it is **not** the company's truth (that is Knowledge), it does **not** reason, decide, execute, or own intent, and it accepts **no write except through governed promotion.**

**Critical clarification — Long-term Memory is a store, not a mind or a source of truth:**

> Long-term Memory is **NOT** Knowledge. Long-term Memory is **NOT** Working Memory. Long-term Memory is **NOT** Reasoning.
>
> Long-term Memory is the **durable, canonical store of retained experiences** — what happened (episodic), what was learned as fact (semantic), and how to do things (procedural). It holds **memories**, not **organizational truth**: truth is Knowledge's (doc 45, forthcoming). Long-term Memory remembers; it never reasons, decides, or declares what is *true for the company*.

---

## 1. Purpose

### Why the Long-term Memory layer exists

Working Memory (doc 43) is a disposable workspace — it is cleared when a unit of work ends. But a digital workforce that forgets everything at the end of every task cannot improve, cannot recall a customer's history, cannot reuse a procedure it discovered, cannot accumulate experience. Something must **durably retain** what is worth keeping — after it has been deliberately, governedly promoted — with enough structure (provenance, lineage, confidence, trust, versioning) that the retained content is trustworthy, correctable, auditable, and forgettable when required. Long-term Memory is that layer.

Long-term Memory is the **system of record for every retained experience in the platform: the durable, canonical, provenance-bearing store of episodic, semantic, and procedural memory.** It is the only durable memory store; every write arrives through governed promotion from Working Memory; every memory carries where it came from and how it evolved; corrections and supersessions preserve history; and forgetting (aging, retention, GDPR erasure) is governed. It is the disk to Working Memory's RAM — and, crucially, it is *memory* (what was experienced/learned/practiced), not *truth* (what the company holds as authoritative), which is the separate Knowledge layer.

Without a Long-term Memory layer, six things break: no accumulation (agents relearn everything each session), no recall (no durable history of customers/decisions/outcomes), no reuse (procedures discovered are lost), no trust model (retained content has no confidence/provenance), no correction discipline (fixes silently overwrite history), and no governed forgetting (retention/GDPR unmanageable). Long-term Memory closes that gap and holds the **durable-memory boundary**: the one place retained experience lives, written only by promotion, versioned never overwritten, forgettable only by governance — and always distinct from organizational truth.

### Business problem it solves

1. **Durable, trustworthy retention.** The company must keep what matters — experiences, facts, procedures — with provenance, lineage, confidence, and trust, so retained content is reliable and accountable rather than an unverifiable blob.
2. **Governed write discipline.** Nothing should become permanent by accident. Every durable write arrives through a governed promotion pipeline from Working Memory, deduplicated and versioned — never a direct, silent write.
3. **Correctable, forgettable memory.** Memory must be correctable without losing history (versioning/supersession), and forgettable when policy or law requires (aging, retention, GDPR erasure) — with soft-delete as default and hard-delete only through an explicit governed flow.

### Its responsibility

- Own the lifecycle of every durable memory: `proposed → active → corrected → superseded → aged → archived → soft-deleted → purged` (governed), separate from health `unknown → trusted / degraded / conflicted` (observed).
- Be the **only durable memory store**; accept writes **only** through the governed **promotion pipeline** from Working Memory (§5.9). Working Memory can never write directly.
- Store the three memory kinds — **episodic, semantic, procedural** (`memoryKindEnum`) — with **provenance, source attribution, lineage, confidence, trust score, and quality**.
- Organize memory by **ownership scope** (personal/agent, shared, organizational/company), **namespaces**, and **collections**; index it (including a **vector-index abstraction**) for **deterministic, permissioned retrieval**.
- Enforce **correction and supersession that preserve history**, **deduplication**, **versioning**, **memory lineage**, and an **immutable audit history**.
- Govern **aging, retention, forgetting, archiving, soft/hard delete, and GDPR erasure**; support **replay and snapshotting**.
- Enforce **tenant isolation, permission-scoped access, security boundaries, and cost governance**; expose **observability**.
- Emit Long-term Memory events; feed Working Memory via **read-only retrieval**.

### What is explicitly NOT its responsibility

- **Long-term Memory is not Knowledge.** It stores *memories* (facts as experienced, experiences, procedures), not the company's *authoritative truth*. **Truth belongs to the Knowledge layer.** A memory ("we tried X and it failed") is not the same as knowledge ("our policy is Y").
- **Long-term Memory never reasons, decides, or executes.** It stores and retrieves; thinking is Reasoning's, deciding is the cognitive chain's, performing is Execution's.
- **Long-term Memory never changes permissions or owns business intent.** It records what was retained; it never grants access or holds Mission/Goal/Plan intent.
- **Long-term Memory accepts no direct write.** Every write is a governed promotion; there is no bypass from Working Memory or anywhere else.
- **Long-term Memory never silently overwrites.** Corrections version and supersede; history is preserved.
- **Long-term Memory never declares truth.** It carries confidence/trust on *memories*; canonizing something as organizational truth is a governed promotion into Knowledge, not a memory operation.

---

## 2. Mental Model

If Working Memory is the **desk** a digital employee works at, Long-term Memory is the **employee's personal filing cabinet and the department's shared archive** — the durable place where deliberately-filed experiences, learned facts, and worked-out procedures live. Some drawers are personal (an agent's own recollections), some shared (a team's), some organizational (the company's collective memory). Every filed item has a slip saying where it came from, how confident we are in it, who has touched it, and what it replaced. Items can be corrected — but the old version stays in the file, struck through, not shredded. Items age, and are retired or (by legal order) destroyed through a governed process. The cabinet *remembers*; it does not *decide what is true* — that is the company handbook (Knowledge), a different shelf entirely.

The mental model in one line: **Long-term Memory is the single durable, canonical store of retained experiences — episodic, semantic, and procedural — written only through governed promotion, carrying provenance/lineage/confidence/trust, versioned and never silently overwritten, permission-scoped and tenant-isolated, forgettable only by governance, and always memory (what was experienced/learned/practiced) rather than truth (which is Knowledge).**

Eight properties define the model:

- **Durable & canonical.** It is the one place retained memory lives. Nothing else is a durable memory store; there is no second copy of record.
- **Promotion-only writes.** Every durable memory arrives through the governed promotion pipeline from Working Memory. There is no direct write path — not from Working Memory, not from an agent, not from execution.
- **Three-kinded.** Episodic (what happened), semantic (facts learned), procedural (how to do things) — the `memoryKindEnum` triad, each with its own retention and use.
- **Provenanced & lineaged.** Every memory records its source, its promotion origin, and its full lineage of corrections/supersessions. Nothing is anonymous or history-less.
- **Trust-scored, not truth-bearing.** Memories carry confidence and trust — how much we rely on them — but they are not organizational truth. Elevating a memory to truth is a governed promotion into Knowledge, a separate act.
- **Versioned & correctable.** Corrections create versions and supersessions; history is preserved. Memory is never silently overwritten.
- **Forgettable by governance.** Aging, retention, archiving, soft-delete (default), and hard-delete/GDPR erasure (explicit governed flow) — memory can be forgotten, but only through policy, never by accident.
- **Bounded, not sovereign.** Beneath the whole authority stack; permission-scoped, tenant-isolated; it stores and serves, it never reasons, decides, or owns intent.

Long-term Memory sits **beneath Working Memory as the durable counterpart and beside Knowledge as its distinct sibling.** Working Memory promotes into it; it retrieves back into Working Memory read-only; and it is carefully *not* Knowledge — memory of experience vs authoritative truth. It is the hinge between *transient thinking* (Working Memory) and *durable recall* — and it is exclusively about *storing and serving retained experience*, never *reasoning, deciding, executing, or declaring truth*.

---

## 3. Core Domain Objects

Long-term Memory introduces one primary entity and supporting objects. All reuse the column contracts from `_base.ts`:

- **`rootColumns`** / **`tenantColumns`**. `createdBy`/`ownerRef` resolve to actor references (Identity §3.9); every memory is tenant-scoped.

---

### 3.1 Memory (Long-term Memory Record)

- **Purpose.** A single durable retained experience — episodic, semantic, or procedural. The primary object of this module.
- **Table.** `memories` (`tenantColumns`).
- **Conceptual fields.**
  - `id` — Memory ID.
  - `tenantId` — owning Company (Identity §3.1).
  - `memoryKind` — `memoryKindEnum`: `episodic | semantic | procedural`. Required.
  - `scope` — `memoryScopeEnum` (§3.2): `personal | shared | organizational`. Required.
  - `ownerRef` — the accountable owner (an agent for personal; a team/department for shared; the company for organizational).
  - `namespaceRef` — the memory namespace this belongs to (§5.5). Required.
  - `collectionRef` — the collection within the namespace (§5.6).
  - `content` — the memory content (typed by kind).
  - `provenance` — where it came from (§3.4): the Working Memory session, the source frames, the promotion record.
  - `sourceAttribution` — the originating actor/source (human input, execution result, retrieval, etc.).
  - `confidence` — how confident the content is correct (0–100 or graded).
  - `trustScore` — how much the system trusts this memory (derived from provenance, confirmations, age, corrections; §5.11).
  - `quality` — a quality signal (completeness, corroboration; §5.11).
  - `lineageRef` — the lineage chain of corrections/supersessions (§3.5).
  - `supersedesMemoryId` / `supersededByMemoryId` — correction/supersession edges.
  - `memoryLifecycleStatus` — governed lifecycle (`memoryLifecycleStatusEnum`, §6).
  - `memoryHealth` — health (`memoryHealthEnum`, §6): `unknown | trusted | degraded | conflicted`.
  - `retentionPolicy` — how long/under what rules it is retained (§5.13).
  - `agingState` — current aging position (§5.12).
  - `permissions` — access scope (Identity §6), bounding who/what may retrieve it.
  - `vectorIndexRef` — reference into the vector-index abstraction for semantic retrieval (§5.7).
  - `memoryVersion` — immutable version counter.
  - base lifecycle/audit fields (immutable audit history).
- **Required.** `tenantId`, `memoryKind`, `scope`, `ownerRef`, `namespaceRef`, `content`, `provenance`, `permissions`, `memoryLifecycleStatus`. (`memoryHealth` defaults `unknown`.)
- **Immutability.** Content is **versioned, never silently overwritten**; a change is a correction/supersession creating a new version. Audit history is immutable.
- **Ownership.** Owned by exactly one company; scoped personal/shared/organizational with a single accountable owner.
- **Example.** Episodic memory: "Lead #88 asked about bulk pricing on 2026-07-10; no discount offered." scope `shared` (Sales team), confidence 95, trust 80, provenance {WM session S-412, promotion P-77}.

### 3.2 Memory Scope (personal / shared / organizational)

- **Purpose.** Declares *whose* memory it is — the ownership boundary. **Agent memory vs Company memory** is exactly this axis.
- **Realization.** `memoryScopeEnum` (specified): `personal | shared | organizational`.
  - **personal** — an Agent's own memory (its recollections of its work); owner = the Agent (bounded by its human ceiling).
  - **shared** — memory shared across a team/department; owner = that container; cross-agent sharing within scope (§5.14).
  - **organizational** — company-wide collective memory; owner = the Company.
- **Rule.** Scope sets default visibility and the permission baseline; access is always further bounded by permissions and tenant isolation. **Personal memory** is not visible outside its owner+ceiling except via governed sharing; **organizational memory** is broadly readable within permitted scope.

### 3.3 Memory Kind (episodic / semantic / procedural)

- **Episodic Memory.** *What happened* — time-stamped experiences, events, interactions, outcomes ("we did X, result Y, on date Z"). High volume; ages fastest; the raw record of experience.
- **Semantic Memory.** *Facts learned* — durable factual assertions distilled from experience ("this customer prefers email"). Longer retention; candidate for promotion to Knowledge if it becomes organizational truth.
- **Procedural Memory.** *How to do things* — reusable procedures/skills an agent learned ("the steps that reliably qualify a lead"). Feeds Agent learning (Agent §5.6); reused across sessions.
- **Rule.** Kind governs default retention, aging, and use. Semantic memory that becomes company-authoritative is **promoted to Knowledge** (a governed act), not silently reclassified.

### 3.4 Provenance & Source Attribution

- **Purpose.** Where a memory came from — mandatory for every memory. **Every memory has provenance.**
- **Realization.** `provenance {workingMemorySessionRef, sourceFrames, promotionRef, promotedBy, promotedAt}`; `sourceAttribution {originType ∈ memorySources, originActorRef}`. A memory with no provenance cannot be promoted (§7).
- **Rule.** Provenance is immutable and travels with every version and correction; it is the basis of trust and audit.

### 3.5 Memory Lineage

- **Purpose.** The full chain of a memory's corrections and supersessions — **every memory has lineage; every correction preserves history.**
- **Realization.** `lineageRef` links a memory to its predecessors/successors via `supersedesMemoryId`/`supersededByMemoryId`; `memoryVersion` orders the chain. The chain is immutable and replayable.
- **Rule.** A correction **never edits in place**; it creates a new version superseding the old, both retained. Lineage is the record of how a memory's understanding evolved.

### 3.6 Memory Namespace & Collection

- **Namespace (`namespaceRef`).** A named partition of memory (per tenant, per scope, per domain) — the top-level organizer. Isolation and permission baselines attach here (§5.5).
- **Collection (`collectionRef`).** A grouping within a namespace (e.g. "customer-interactions," "qualification-procedures") — the retrieval and retention unit (§5.6).

### 3.7 Promotion Record

- **Purpose.** The governed record of a write — the sole entry path into Long-term Memory from Working Memory (§5.9).
- **Realization.** `{promotionId, workingMemorySessionRef, candidateContent, targetNamespace, targetKind, targetScope, justification, approvalRef?, decision, decidedBy, decidedAt}`. Every durable memory traces to exactly one accepted Promotion Record.
- **Rule.** **Every write arrives through governed promotion.** No memory exists without a Promotion Record.

### 3.8 Memory Version & Snapshot

- **Purpose.** The immutable version of a memory and point-in-time snapshots of collections/namespaces for replay.
- **Realization.** `memoryVersion` per record; **snapshots** capture a namespace/collection state at a time for replay and audit (§5.16). Versions and snapshots are immutable.

---

## 4. Ownership

- **Owned by Company.** Every memory belongs to exactly one company via `tenantId`. **Tenant isolation** is structural — no memory spans companies; cross-tenant retrieval is impossible.
- **Scoped ownership (agent vs company).** The accountable owner depends on scope:
  - **personal** → an Agent (bounded by its human owner's ceiling, Agent §7).
  - **shared** → a team/department container.
  - **organizational** → the Company.
- **The store owns the records; it does not own intent.** Long-term Memory owns the *memory records*; it **never owns business intent** (Mission/Goal/Plan) — those reference or produce memories, they are not owned by this module.
- **Permission-bounded access.** Every retrieval is bounded by the memory's `permissions` and the requester's authority (Identity §6). An agent reads only memory its scope + permissions + human ceiling permit; **personal memory** of one agent is not readable by another except via governed **shared memory**.
- **Owner accountability on correction/forget.** Corrections, supersessions, aging decisions, and deletions are attributed to an accountable actor; the module records who changed/forgot what.
- **No cross-tenant memory, ever.** Holding/M&A memory stays per tenant; sharing across tenants is a governed export, never ambient access.

---

## 5. Long-term Memory Architecture

The durable store's internal architecture. All are storage/retrieval/governance mechanics; none reasons, decides, or declares truth.

### 5.1 Episodic Memory Architecture

- Stores time-stamped experiences with full context and outcome. High-volume, append-heavy. Indexed by time, actor, entity, and semantics (vector). Ages fastest (§5.12); the raw substrate from which semantic/procedural memory is distilled (by governed promotion, not automatic inference here).

### 5.2 Semantic Memory Architecture

- Stores durable factual assertions with confidence/trust. Deduplicated (§5.10) so the same fact isn't stored redundantly; conflicting facts are flagged `conflicted` (health) for resolution. Semantic memory that becomes company-authoritative is **promoted to Knowledge** (§9), never silently treated as truth here.

### 5.3 Procedural Memory Architecture

- Stores reusable procedures/skills with success signals. Versioned as procedures improve (correction/supersession). Feeds Agent learning (Agent §5.6) via governed retrieval; a procedure's authority to be *used* is still bounded by the agent's ceiling.

### 5.4 Ownership & Scope Architecture

- Realizes personal/shared/organizational scope (§3.2) with per-scope default visibility and permission baselines. **Agent memory** = personal scope; **Company memory** = organizational scope; **shared memory** bridges via governed cross-agent sharing (§5.14).

### 5.5 Namespace Architecture

- Memory is partitioned into **namespaces** (per tenant/scope/domain). A namespace carries isolation, permission baseline, retention defaults, and cost accounting. Cross-namespace access is explicit and permissioned.

### 5.6 Collection Architecture

- Within a namespace, **collections** group related memories (a retrieval + retention unit). Collections define default aging/retention and are the granularity for snapshotting and forgetting.

### 5.7 Indexing & Vector-Index Abstraction

- Memories are indexed for retrieval by structured fields (time, actor, entity, kind, scope) and by **semantic similarity via a vector-index abstraction**. The vector index is an **abstraction** — provider-independent (§5.9 storage abstraction), so the concrete vector DB/engine is resolved behind the interface and swappable.

### 5.8 Retrieval Architecture

- **Read-only, deterministic, permissioned** retrieval feeds Working Memory (Working Memory §5.2). Retrieval is scoped by tenant, namespace, scope, and permissions; ranked by relevance, recency, confidence, and trust. **Retrieval never mutates** a memory (except updating access telemetry, which is not the memory content). Determinism: same query + same store state → same result set.

### 5.9 Promotion Pipeline (the only write path)

- The **sole entry path**: Working Memory proposes a promotion candidate (Working Memory §3.5) → the pipeline validates provenance/permissions/dedup → **promotion approval** (governed; approval-gated for organizational/high-trust or sensitive memory, reuses `approvalStateEnum`) → on acceptance, a durable memory is written with a Promotion Record (§3.7). **Working Memory can never write directly; every write arrives through governed promotion.**
- **Storage abstraction & provider independence.** The pipeline writes through a **storage abstraction** — provider-independent — so the concrete durable store and vector engine are swappable without changing the memory model.

### 5.10 Deduplication

- On promotion, candidate content is checked against existing memories (structural + semantic). A duplicate is **merged/linked** (increasing confidence/corroboration), not re-stored. Near-duplicates that conflict are flagged `conflicted` for resolution. Dedup keeps the store canonical.

### 5.11 Confidence, Trust, Quality

- **Confidence** — likelihood the content is correct (from source + corroboration).
- **Trust score** — how much the system relies on the memory, derived from provenance strength, corroboration count, age, correction history, and source attribution.
- **Quality** — completeness/corroboration signal.
- These are **decision inputs, not truth**: they rank retrieval and gate promotion-to-Knowledge; they never make Long-term Memory authoritative.

### 5.12 Aging & 5.13 Retention & Forgetting

- **Aging.** Memories carry an `agingState`; relevance decays over time by kind (episodic fastest). Aging lowers retrieval ranking and can trigger archival — it never silently deletes.
- **Retention.** Each memory/collection has a `retentionPolicy` (duration, legal hold, kind defaults). Retention governs when a memory is eligible for archival/forgetting.
- **Forgetting.** Governed reduction: age-out → archive → soft-delete → (only via explicit governed flow) hard-delete. **Forgetting is always governed**, never accidental.

### 5.14 Cross-Agent Memory Sharing

- **Shared memory** lets memories cross agents within a scope via **governed sharing** — an explicit, permissioned edge, never ambient. A personal memory becomes shared only by a governed act; sharing never exceeds the sharer's authority or the recipients' permissions.

### 5.15 Correction, Supersession, Versioning

- **Correction** creates a new version superseding the old (both retained); **supersession** links them via lineage. **Memory is versioned, never silently overwritten; every correction preserves history.** The active version is the latest non-superseded; the chain is immutable and replayable.

### 5.16 Replay & Snapshotting

- **Snapshots** capture namespace/collection state at a point in time. **Replay** reconstructs what memory existed (and what an agent could have retrieved) at any past moment — for audit, debugging, and reproducing decisions. Replay is read-only.

### 5.17 Security, Permissions & Tenant Isolation

- Every access passes permission enforcement (Identity §6) and tenant isolation; **security boundaries** protect personal/sensitive memory; secrets are never stored as plain memory. Sensitive memory is classified and access-gated.

### 5.18 GDPR Deletion, Soft vs Hard Delete, Immutable Audit

- **Soft delete** (default) marks a memory deleted (`lifecycleStatus=deleted`), retained for audit, dropped from retrieval.
- **Hard delete / GDPR erasure** physically removes content via an **explicit, approval-gated governed flow** (mirrors Identity §5 legal erasure) — the only path that destroys content.
- **Immutable audit history** records every write, correction, share, aging decision, and deletion — even erasure leaves an auditable tombstone (that erasure occurred, by whom, under what basis) without retaining the erased content.

### 5.19 Cost Governance & 5.20 Observability

- **Cost governance.** Storage, indexing, and retrieval cost are accounted per namespace/scope and attributed up lineage (to agents/departments); growth is bounded by retention + archival.
- **Observability.** Memory volume, retrieval rates, trust/confidence distributions, conflict rates, aging, promotion/rejection rates, and cost are exposed — the store's transparency surface.

### 5.21 The durable-memory boundary

- Long-term Memory **stores and serves** retained experience but **reasons/decides/executes nothing** and **declares no truth**. It accepts writes only by promotion and forgets only by governance. This boundary is why the company can accumulate rich, trustworthy, correctable, forgettable experience without that store ever becoming an unaccountable oracle or a shadow source of organizational truth.

---

## 6. Lifecycle

A Memory carries **two orthogonal state dimensions** (mirroring prior specs) that must never be conflated:

- **Lifecycle** (`memoryLifecycleStatusEnum`) — *where the memory is in its governed existence.* Governed transitions only.
- **Health** (`memoryHealthEnum`) — *how reliable a memory currently is.* Auto-derived; never a lifecycle transition.

Governing rule: **a memory enters only by accepted promotion with provenance; it is versioned never overwritten; corrections/supersessions preserve history; forgetting is governed; and audit is immutable.**

### 6.1 Lifecycle dimension

**`memoryLifecycleStatusEnum`** (specified): `proposed | active | corrected | superseded | aged | archived | soft-deleted | purged`.

| Lifecycle state | Meaning | Mutable? | Retrievable? |
|---|---|---|---|
| **proposed** | Promotion candidate under governance; not yet stored | Pipeline only | No |
| **active** | Accepted, durable, current | Version-only (correction) | Yes |
| **corrected** | A correction was issued; this record is the pre-correction version | No (immutable) | No (superseded) |
| **superseded** | Replaced by a newer version | No (immutable) | No (lineage) |
| **aged** | Retention/aging demoted it; low-relevance, retained | No | Low-priority |
| **archived** | Retired from active retrieval; retained for audit/replay | No (immutable) | Archive-only |
| **soft-deleted** | Marked deleted; dropped from retrieval; retained for audit | No (immutable) | No |
| **purged** | Hard-deleted / GDPR-erased; content destroyed, tombstone retained | No (tombstone) | No |

**Lifecycle transitions (governed):**

| Transition | From → To | Precondition | Effect | Emits |
|---|---|---|---|---|
| **Propose** | ∅ → proposed | Working Memory submits a promotion candidate | candidate enters pipeline; `memoryHealth=unknown` | `MemoryPromotionProposed` |
| **Accept (write)** | proposed → active | Validation + dedup + promotion approval pass | durable memory written with Promotion Record + provenance | `MemoryPromoted`, `MemoryActivated` |
| **Reject** | proposed → ∅ | Promotion rejected | nothing stored | `MemoryPromotionRejected` |
| **Correct** | active → corrected (+ new active successor) | A correction is issued (governed) | new version created superseding this; history preserved | `MemoryCorrected` |
| **Supersede** | active → superseded (+ successor) | A newer version replaces it | lineage linked; this frozen | `MemorySuperseded` |
| **Age** | active → aged | Aging/retention demotes relevance | retrieval ranking lowered; retained | `MemoryAged` |
| **Archive** | active/aged → archived | Retention rule / governed retirement | removed from active retrieval, retained | `MemoryArchived` |
| **Soft-delete** | active/aged/archived → soft-deleted | Governed deletion (default) | dropped from retrieval, retained for audit | `MemorySoftDeleted` |
| **Restore** | archived/soft-deleted → active | Governed reinstatement (not for purged) | re-enters active retrieval | `MemoryRestored` |
| **Purge (hard-delete/GDPR)** | soft-deleted/any → purged | **Explicit, approval-gated legal-erasure flow** | content physically destroyed; tombstone retained | `MemoryPurged` |

Every transition is governed and audited. **Health never appears in this table.** **Purge** is the only content-destroying transition and requires the explicit governed erasure flow.

### 6.2 Health dimension

**`memoryHealthEnum`** (specified): `unknown | trusted | degraded | conflicted`.

| Health state | Meaning | Set how |
|---|---|---|
| **unknown** | No sufficient signal (default; also for terminal/proposed) | default / on clear |
| **trusted** | High confidence + trust, corroborated, uncontradicted | auto |
| **degraded** | Low/decaying confidence, stale, weak provenance, low corroboration | auto |
| **conflicted** | Contradicted by another memory or a correction dispute | auto |

**Health rules:**

- **Scope.** Health applies **only** to `active`/`aged` memories. In `proposed` it is `unknown`; in `corrected`/`superseded`/`archived`/`soft-deleted`/`purged` it is cleared to `unknown`, frozen — terminal/historical records carry no active health.
- **Automatic.** Derived from **confidence, trust score, corroboration, age, correction disputes, and conflicts.** Never manual.
- **No lifecycle effect.** **Health never changes lifecycle.** A `conflicted` memory is not auto-deleted; it is flagged for governed resolution (correction/supersession). Only governed transitions move lifecycle. (Distinct from prior specs' `blocked`: memory's failure modes are trust and conflict, hence `degraded`/`conflicted`.)
- **Observability, not authority.** Health ranks retrieval and flags for resolution; it never makes a memory authoritative or destroys it.

### 6.3 Terminal-state rules

- **purged** is the only content-destroying terminal state (GDPR/legal erasure), leaving an immutable tombstone. **soft-deleted / archived / superseded / corrected** retain content for audit/lineage.
- **Memory is versioned, never silently overwritten.** Corrections preserve history; superseded/corrected records are immutable.
- **Immutable audit history**: every write, correction, share, aging, deletion, and purge is retained forever (a purge retains the tombstone, not the content). Only the explicit legal-erasure flow destroys content.
- **Restore** is possible from archived/soft-deleted (governed) but **never from purged** — erasure is final.

---

## 7. Constraints

Structural and semantic constraints, enforced by the schema and the module — not by convention.

**Structural / hard invariants (enforced):**

1. **Only durable memory store.** Long-term Memory is the **only** durable memory store; no other module persists memory of record.
2. **Promotion-only writes.** **Working Memory can never write directly.** **Every write arrives through governed promotion** with a Promotion Record; no memory exists without one.
3. **Provenance mandatory.** **Every memory has provenance** and source attribution; a provenance-less candidate cannot be promoted.
4. **Lineage mandatory.** **Every memory has lineage**; corrections/supersessions link the chain.
5. **Versioned, never overwritten.** **Memory is versioned, never silently overwritten.** **Every correction preserves history.**
6. **Kind, scope, namespace mandatory.** `memoryKind`, `scope`, `namespaceRef` present; each memory is classified and partitioned.
7. **Tenant isolation.** `tenantId` NOT NULL, FK → `companies.id`; no cross-tenant memory.
8. **Immutable audit history.** Every mutation writes an immutable audit record; even purge leaves a tombstone.
9. **Terminal immutability.** Superseded/corrected/archived/soft-deleted are immutable; purged destroys content, retains tombstone.

**Semantic (module-enforced) — the boundary guards:**

10. **Not Knowledge; not truth.** **Long-term Memory stores facts, experiences, and procedures — not organizational truth. Truth belongs to the Knowledge layer.** A memory is never treated as company-authoritative; canonizing it is a governed promotion into Knowledge.
11. **Never reason.** **Long-term Memory never performs reasoning.** It stores/serves; thinking is Reasoning's.
12. **Never decide.** **Long-term Memory never makes decisions.** It provides inputs (confidence/trust); the cognitive chain decides.
13. **Never change permissions.** **Long-term Memory never changes permissions.** It enforces them; it never grants/elevates access.
14. **Never execute.** **Long-term Memory never executes commands.** Retrieval/promotion are not executions; effects are Execution's.
15. **Never own business intent.** **Long-term Memory never owns business intent** (Mission/Goal/Plan).
16. **Forgetting is governed.** Aging/retention/soft-delete/hard-delete follow policy; **content destruction only via the explicit GDPR/legal-erasure flow** (approval-gated).
17. **Retrieval is read-only & deterministic.** Retrieval never mutates memory content; same query + state → same results.
18. **Lifecycle/health orthogonal; health scoped/derived.** Separate fields; health non-`unknown` only active/aged; auto-derived; never writes lifecycle.

---

## 8. Validation

Validation runs at gates: **promotion (proposed → active)**, **correction/supersession**, **retrieval**, and **forgetting/erasure**. Long-term Memory fails closed: on ambiguity it does not persist, does not over-share, and does not destroy.

**Promotion validation (proposed → active):**

- The candidate carries **provenance** (Working Memory session + source frames) and **source attribution**; a provenance-less candidate is refused.
- The promoter's authority permits writing to the target `namespace`/`scope` (Identity §6); organizational/sensitive/high-trust promotions are **approval-gated** (`approvalStateEnum`).
- **Deduplication:** the candidate is checked against existing memories; a duplicate is merged/linked (not re-stored); a conflict is flagged.
- `memoryKind`, `scope`, `namespaceRef` valid; content well-formed for the kind.

**Correction/supersession validation:**

- A correction creates a new version superseding the old (both retained); an attempt to edit content in place is refused. The corrector's authority permits it; lineage is extended immutably.

**Retrieval validation:**

- The requester's permissions + the memory's `permissions` + tenant isolation are enforced; out-of-scope memory is never returned. Retrieval is read-only and deterministic; results ranked by relevance/recency/confidence/trust.

**Boundary validation (continuous):**

- Any attempt to treat a memory as organizational truth, reason/decide/execute from within the module, change permissions, or write outside promotion is refused as a layer violation.

**Forgetting/erasure validation:**

- Aging/retention transitions follow policy; soft-delete is the default; **hard-delete/GDPR purge requires the explicit approval-gated erasure flow**; a purge under legal hold is refused until the hold clears (or is itself governed).

**Trust/quality validation (continuous):**

- Confidence/trust/quality recomputed from corroboration/age/corrections; conflicting memories flagged `conflicted` for governed resolution — never auto-resolved by silently deleting one side.

**Health validation (continuous):**

- `memoryHealth` non-`unknown` only active/aged; unresolved inputs yield `unknown`; a health update never moves lifecycle.

Only content passing all applicable gates is stored/served/forgotten. A failure refuses the write/share/destroy with the violated rule recorded.

---

## 9. Relationships

Long-term Memory relates to Working Memory (its writer via promotion, its reader via retrieval), Knowledge (its distinct sibling and promotion target), and the actors that own/use memory. It stores and serves; it never reasons, decides, executes, or declares truth.

| Module | Relationship to Long-term Memory |
|---|---|
| **Working Memory** | **The only writer (via promotion) and a read-only consumer.** Working Memory proposes promotion candidates (Working Memory §3.5) — the sole write path; and retrieves memories read-only into its workspace (Working Memory §5.2). It **never** writes durable memory directly. |
| **Knowledge** | **The distinct sibling and a promotion target.** Long-term Memory stores *memories*; Knowledge stores *organizational truth* (doc 45). Semantic memory that becomes company-authoritative is **promoted to Knowledge** (a governed act) — never silently reclassified here. Knowledge is not Long-term Memory; the boundary is strict. |
| **Agent** | **The owner of personal memory and consumer of procedural memory.** An Agent owns personal-scope memory (bounded by its human ceiling, Agent §5.4) and reuses procedural memory for its work; it retrieves within its permissions. The Agent never writes durable memory except via governed promotion. |
| **Reasoning** | Consumes retrieved memory as input; Long-term Memory **never reasons**. Trust/confidence inform reasoning; the thinking is Reasoning's. |
| **Execution** | Retrieval/promotion writes are performed as read/write **Commands via Execution** where applicable; Long-term Memory **never executes** — it is the store Execution reads/writes on promotion. |
| **Commands** | Memory reads (retrieval) and promotion writes may be expressed as Commands (Command §3, `targetType` memory) performed by Execution; the store is the addressee, not the performer. |
| **Governance** | Governs promotion approval, correction disputes, forgetting/erasure, and conflict resolution. Long-term Memory enforces; Governance adjudicates. |
| **Policies / Permissions** | Bound access, promotion, retention, and sharing (Identity §6). Long-term Memory **never changes permissions**; it enforces them. |
| **Identity / Company / Departments** | Tenant scoping and the owner/scope basis (personal/shared/organizational) every memory carries. |
| **Audit** | Every write/correction/share/aging/deletion/purge is recorded immutably; even erasure leaves a tombstone (§5.18). |
| **Observability** | Consumes volume/retrieval/trust/conflict/aging/cost signals (§5.20). |

**The memory spine:** `Working Memory —(governed promotion)→ Long-term Memory —(read-only retrieval)→ Working Memory`, with `Long-term Memory —(governed promotion)→ Knowledge` for content that becomes organizational truth. Long-term Memory is the durable node that retains experience — and is carefully never the node that declares truth, reasons, or acts.

---

## 10. Events

Every Long-term Memory mutation emits exactly one domain event. Working Memory, Knowledge, Governance, and observability subscribe. Payloads carry `actorRef`, `tenantId`, `memoryId`, `memoryVersion`, `memoryKind`, `scope`, `namespaceRef`, and `occurredAt`.

| Event | Trigger | Payload (beyond envelope) | Consumers | Business impact |
|---|---|---|---|---|
| `MemoryPromotionProposed` | Working Memory submits a candidate | wmSessionRef, targetKind/scope | Governance, Observability | Durable write proposed (governed) |
| `MemoryPromotionRejected` | Promotion rejected | reason | Working Memory, Audit | Nothing stored |
| `MemoryPromoted` / `MemoryActivated` | Accepted & written | promotionRef, provenance | Agent, Observability | Durable memory now exists & retrievable |
| `MemoryDeduplicated` | Candidate merged with existing | mergedIntoMemoryId, corroboration | Observability | Canonical store preserved |
| `MemoryRetrieved` | Read-only retrieval | requesterRef, query, resultCount | Working Memory, Observability, Audit | Memory served (not mutated) |
| `MemoryCorrected` | Correction issued (new version) | newMemoryVersion, reason | Governance, Audit | History preserved; successor active |
| `MemorySuperseded` | Replaced by newer version | successorMemoryId | Audit | Lineage extended |
| `MemoryHealthChanged` | Trust/confidence recomputed (active/aged only) | fromHealth, toHealth, drivers | Observability, Governance | Reliability signal moved; **no lifecycle change** |
| `MemoryConflicted` | Contradiction detected | conflictingMemoryId | Governance, Notifications | Flagged for governed resolution |
| `MemoryAged` | Aging/retention demotion | agingState | Observability | Relevance decayed; retained |
| `MemoryArchived` | Retired from active retrieval | reason | Reporting, Audit | Retained, archive-only |
| `MemorySharedCrossAgent` | Governed cross-agent share | fromScope, toScope, recipients | Governance, Audit | Shared within scope; never ambient |
| `MemorySoftDeleted` | Governed soft delete | reason | Governance, Audit | Dropped from retrieval, retained |
| `MemoryRestored` | Governed reinstatement | fromState | Governance, Audit | Re-entered active retrieval |
| `MemoryPurged` | Hard-delete / GDPR erasure | erasureBasis, approvalRef | **Security, Compliance, Audit** | Content destroyed; tombstone retained |
| `MemoryPromotedToKnowledge` | Semantic memory promoted to Knowledge | knowledgeRef, approvalRef | **Knowledge**, Governance, Audit | Memory became organizational truth (governed) |
| `MemorySnapshotTaken` | Namespace/collection snapshot | snapshotRef | Audit, Observability | Point-in-time captured for replay |
| `MemoryAccessViolationAttempted` | Out-of-scope retrieval attempt | requesterRef, memoryId | **Security**, Governance, Audit | Permission boundary enforced |

**Ordering and idempotency.** Events carry `memoryVersion`; consumers discard stale/duplicate deliveries. Emission is **transactional with the mutation**; a failed audit/event write rolls back — no un-audited memory change.

**Two independent streams.** Health events never accompany or cause a lifecycle change; lifecycle events never carry a health transition.

---

## 11. KPIs

Long-term Memory health and the company's durable-memory performance, measured deterministically from memory records.

| KPI | Definition | Source |
|---|---|---|
| **Provenance completeness** | % of memories with full provenance + source attribution (target 100%) | fields + validation |
| **Promotion acceptance rate** | % of proposed promotions accepted vs rejected | promotion events |
| **Direct-write incidents** | Count of any write bypassing promotion (target 0) | write audit |
| **Deduplication rate** | % of candidates merged vs newly stored | dedup events |
| **Trust distribution** | Share of active memories `trusted` vs `degraded`/`conflicted` | `memoryHealth` |
| **Conflict rate / resolution time** | Count of `conflicted` memories; median time to governed resolution | conflict events |
| **Correction rate** | Corrections per memory; % preserving history (target 100% by construction) | lineage |
| **Retrieval determinism** | % of retrievals reproducible on replay | replay checks |
| **Retrieval relevance** | % of retrieved memories used by reasoning | usage feedback |
| **Aging/retention conformance** | % of memories aged/archived per policy | aging events |
| **Forgetting governance** | % of deletions through governed flow; 0 accidental hard-deletes | deletion audit |
| **GDPR erasure completeness** | % of erasure requests fully purged with tombstone (target 100%) | purge audit |
| **Promotion-to-Knowledge rate** | % of semantic memories promoted to Knowledge | knowledge-promotion events |
| **Isolation integrity** | Count of cross-tenant/out-of-scope access attempts blocked | access events |
| **Cost per namespace** | Storage/index/retrieval cost attributed by scope | cost metrics |
| **Audit completeness** | % of memory mutations with an immutable trail (target 100%) | audit chain |

These feed the Executive/Director/Department and Observability surfaces (Identity §10 pattern). All from Long-term Memory's own records — no external inference.

---

## 12. Failure Scenarios

At least the following failure modes and the system's deterministic reaction. Governing rule: **Long-term Memory fails closed, versioned, and governed** — on ambiguity it does not persist, over-share, or destroy; nothing overwrites; nothing is forgotten by accident.

1. **Direct write attempt (bypassing promotion).** Refused — the only write path is governed promotion; there is no direct write API.
2. **Promotion candidate with no provenance.** Refused — provenance is mandatory.
3. **Promotion beyond the promoter's authority/scope.** Refused; organizational/sensitive promotions are approval-gated.
4. **Duplicate promotion.** Merged/linked into the existing memory (raising corroboration), not re-stored.
5. **Conflicting semantic memories.** Both flagged `conflicted`; governed resolution (correction/supersession) required; neither silently deleted.
6. **In-place content edit attempt.** Refused — corrections create versions; content is never overwritten.
7. **Correction loses history.** Impossible — the pre-correction version is retained and superseded; history preserved.
8. **Out-of-scope retrieval.** Refused; `MemoryAccessViolationAttempted`; permission boundary enforced.
9. **Cross-tenant retrieval.** Structurally impossible — tenant isolation; refused.
10. **Personal memory read by another agent without sharing.** Refused — personal scope is private except via governed cross-agent sharing.
11. **Cross-agent share exceeding sharer authority.** Refused — sharing never exceeds the sharer's or recipients' permissions.
12. **Treating a memory as organizational truth.** Refused — truth is Knowledge's; a memory becomes truth only via governed promotion to Knowledge.
13. **Module asked to reason/decide.** Refused — Long-term Memory never reasons or decides; it serves inputs.
14. **Module asked to change permissions.** Refused — it enforces, never grants/elevates.
15. **Module asked to execute a command.** Refused — retrieval/promotion are not executions; effects are Execution's.
16. **Accidental hard delete.** Impossible — soft-delete is default; hard-delete/purge requires the explicit approval-gated erasure flow.
17. **GDPR erasure under legal hold.** Refused until the hold clears (or the hold is itself governed) — compliance conflict routed to a human.
18. **Purge leaves retrievable content.** Impossible — purge destroys content, retains only a tombstone; content is unrecoverable.
19. **Restore of a purged memory.** Refused — erasure is final; restore works only from archived/soft-deleted.
20. **Retrieval mutates a memory.** Impossible — retrieval is read-only (access telemetry is not memory content).
21. **Non-deterministic retrieval.** Flagged — retrieval must be deterministic for replay; a non-reproducible index result is quarantined/investigated.
22. **Stale memory served as current.** Aging lowers ranking; `degraded` health; recency/trust ranking prevents a stale memory from outranking a fresh corroborated one.
23. **Trust inflation without corroboration.** Prevented — trust derives from provenance/corroboration/age; it cannot be manually set high.
24. **Vector-index provider outage.** Structured retrieval degrades gracefully (falls back to non-vector indexes); `degraded` observability; never a silent empty result presented as "no memory."
25. **Storage provider swap mid-operation.** The storage abstraction isolates the model; migration is governed; no memory model change.
26. **Namespace/collection misassignment.** Rejected at promotion — kind/scope/namespace must be valid and consistent.
27. **Concurrent correction (two successors).** One supersession wins the atomic flip; the other rebases; no forked lineage.
28. **Health value set on a proposed/terminal memory.** Rejected, coerced to `unknown`.
29. **Attempt to move lifecycle because health changed.** Refused — `conflicted`/`degraded` never auto-delete; only governed transitions move lifecycle.
30. **Terminal/proposed memory showing active health.** Structurally impossible — cleared to `unknown`, frozen.
31. **Agent suspended; its personal memory.** Retained (history preserved); access follows the suspended agent's blocked authority; not destroyed by suspension.
32. **Owner authority drops; access re-scoped.** Retrieval re-scoped immediately to the reduced ceiling; now-out-of-scope memory is fenced from that actor.
33. **Sensitive/secret content promoted as plain memory.** Refused/classified — secrets are not stored as plain memory; sensitive memory is access-gated.
34. **Cost/growth runaway in a namespace.** Retention + archival bound growth; cost governance flags/escalates; never unbounded silent growth.
35. **Snapshot/replay after purge.** Replay reconstructs pre-purge state only from retained snapshots/audit; purged content is honestly absent (tombstoned), never resurrected.
36. **Audit write fails on a memory mutation.** Transactional emission rolls back the mutation; no un-audited memory change — the immutable-audit guarantee holds.

---

## 13. Enterprise Use Cases

Behavior of Long-term Memory in real situations. In every case memory is written only by governed promotion, versioned never overwritten, served read-only, and forgotten only by governance.

1. **Promoting an episodic memory.** After qualifying a lead, an agent promotes "Lead #88 asked for bulk pricing; declined discount" from Working Memory; accepted; stored with provenance.
2. **Promoting a semantic memory.** "This customer prefers email" is promoted as a semantic fact with confidence 90.
3. **Promoting a procedural memory.** A discovered "reliable lead-qualification sequence" is promoted as procedural memory, reused across sessions.
4. **Read-only recall.** A support agent's Working Memory retrieves the customer's episodic history — read-only; the memory is unchanged.
5. **Deduplication.** Two agents promote the same fact; the store merges them, raising corroboration and trust.
6. **Correction preserving history.** A memory "customer is in Germany" is corrected to "France"; a new version supersedes the old; both retained; lineage shows the change.
7. **Conflict resolution.** Two memories contradict on a customer's plan tier; both `conflicted`; Governance resolves via correction; the losing one is superseded, not deleted.
8. **Personal vs shared.** An agent's personal recollection stays private; a team-relevant fact is governed-shared to the Sales shared scope.
9. **Organizational memory.** A company-wide "we ran a Black Friday campaign in 2025 with result X" lives in organizational scope, broadly retrievable.
10. **Cross-agent sharing.** A research agent shares a discovered procedure with a peer via governed sharing within the department scope.
11. **Trust ranking.** Retrieval ranks a corroborated, recent memory above a stale, weakly-sourced one.
12. **Aging.** Old episodic memories age; their retrieval ranking decays; eventually archived per retention.
13. **Retention policy.** A namespace's retention keeps semantic memory for years but episodic for months; aging/archival follow it.
14. **Soft delete.** An obsolete memory is soft-deleted; dropped from retrieval; retained for audit.
15. **GDPR erasure.** A customer requests erasure; the approval-gated purge destroys their personal memories across namespaces; tombstones retained; audit shows the erasure.
16. **Legal hold blocks erasure.** An erasure request during litigation hold is refused until the hold clears — compliance conflict escalated.
17. **Promotion to Knowledge.** A semantic memory ("our standard NPS follow-up wording") becomes company-authoritative; governed promotion moves it to Knowledge; the memory records the promotion.
18. **Memory not treated as truth.** An agent's memory "competitor X is cheaper" is retrievable but is not organizational truth; it informs, it does not decide policy.
19. **Replay for audit.** An auditor replays what memory existed when an agent made a decision, reconstructing the basis.
20. **Snapshot before a big change.** A namespace is snapshotted before a bulk correction, enabling rollback/replay.
21. **Procedural reuse feeds learning.** An agent's procedural memory improves its skill (Agent §5.6) via governed retrieval — effectiveness up, authority unchanged.
22. **Confidence-gated use.** A low-confidence memory is retrieved with its confidence, so reasoning weighs it appropriately.
23. **Vector retrieval.** A semantic-similarity query finds relevant past interactions via the vector-index abstraction.
24. **Provider independence.** The vector engine is swapped; the memory model is unchanged behind the storage abstraction.
25. **Access denied cross-agent.** An agent tries to read another's personal memory without sharing; refused.
26. **Owner authority drop.** An agent's owner is demoted; the agent's memory access re-scopes immediately.
27. **Suspended agent's memory.** An agent is suspended; its personal memory is retained; access follows its blocked authority; nothing is destroyed by suspension.
28. **Cost governance.** A namespace grows; retention/archival + cost metrics bound it; growth is surfaced, not silent.
29. **Sensitive memory gated.** A memory containing PII is classified sensitive; access is gated and audited.
30. **Cross-tenant isolation in M&A.** Merged companies keep memory per tenant; sharing across is a governed export, never ambient.
31. **Corroboration over time.** Repeated confirmations of a fact raise its trust; a single unconfirmed claim stays low-trust.
32. **Correction dispute.** Two agents disagree on a correction; Governance adjudicates; the resolution is versioned.
33. **Archival then restore.** An archived memory becomes relevant again; governed restore reinstates it.
34. **Observability review.** A memory-ops dashboard shows trust distribution, conflict rate, and promotion acceptance to tune governance.
35. **Snapshot-based replay after correction.** A wrong correction is investigated by replaying the pre-correction snapshot.
36. **Bulk promotion from a long session.** A rich research session promotes several distinct memories; each deduplicated and provenance-stamped independently.
37. **Procedural memory versioning.** A procedure improves; the new version supersedes the old; both retained; agents use the latest.
38. **Semantic memory decay.** A fact ("their budget is €50k") ages and degrades; a fresh corroboration re-elevates trust.
39. **Forgetting by policy.** A retention policy expires a class of episodic memory; governed archival/soft-delete follows; audit retained.
40. **Truth stays in Knowledge.** A company policy change updates Knowledge; agents' memories of the *old* policy remain (as historical experience) but are not authoritative — the boundary holds.
41. **Erasure audit for regulators.** A regulator asks to confirm a customer's data was erased; the tombstone + audit prove the purge without retaining the content.

---

## 14. Extensibility

How Long-term Memory absorbs future demands **without redesign**, because the core abstractions were chosen as extension points.

- **New memory kinds/sub-kinds.** `memoryKindEnum` and per-kind architectures extend (e.g. "affective" or "spatial" memory) without changing the promotion/lineage model.
- **Richer trust models.** Confidence/trust/quality can evolve (Bayesian corroboration, decay curves, source-reputation) behind the same "inputs, not truth" contract.
- **Advanced retrieval.** Hybrid/graph/temporal retrieval and re-ranking extend behind the read-only, deterministic retrieval interface.
- **Vector/storage engine swaps.** The vector-index and storage abstractions make engines provider-independent and swappable.
- **Federated / cross-tenant memory (governed).** Explicit governed export/import between tenants adds as a governed edge, never ambient access.
- **Auto-suggested promotions.** The pipeline can suggest promotion candidates for human approval while remaining non-automatic to persist.
- **Memory consolidation.** Governed background consolidation (episodic → semantic distillation) can be added as a promotion-style governed process, never a silent inference.
- **Tiered storage.** Hot/warm/cold tiers by aging extend cost governance without model change.

The invariant enabling all of the above: **the only durable memory store; promotion-only writes; provenance + lineage on everything; versioned never overwritten; governed forgetting; memory ≠ truth.** New demands plug into kinds/retrieval/trust/storage without touching the write, lineage, or truth boundaries.

---

## 15. Architectural Principles

The permanent design principles governing Long-term Memory. If a future request conflicts with one of these, the request is wrong, not the principle.

1. **The only durable memory store.** All retained memory lives here; there is no second store of record.
2. **Promotion-only writes.** Working Memory can never write directly; every durable write arrives through governed promotion with a Promotion Record.
3. **Provenance and lineage on everything.** Every memory records where it came from and how it evolved; nothing is anonymous or history-less.
4. **Versioned, never silently overwritten.** Corrections and supersessions create versions and preserve history.
5. **Memory is not truth.** It stores facts, experiences, and procedures — not organizational truth. Truth belongs to Knowledge; elevation is a governed promotion.
6. **Trust-scored, not authoritative.** Confidence/trust/quality rank and gate; they never make a memory authoritative.
7. **Forgetting is governed.** Aging, retention, soft-delete (default), and hard-delete/GDPR erasure (explicit governed flow) — memory is forgettable only by policy, never by accident.
8. **Permission-scoped, tenant-isolated, secure.** Access is bounded by permissions and scope; cross-tenant is impossible; sensitive memory is gated.
9. **Stores and serves only.** It never reasons, decides, executes, changes permissions, or owns intent.
10. **Lifecycle and health are separate axes.** Lifecycle is governed existence; health is observed reliability (`trusted`/`degraded`/`conflicted`), active-only, automatic, and never changes lifecycle.

---

## 16. What Long-term Memory will NEVER do

Explicit boundaries to prevent responsibility creep. If a future request asks Long-term Memory to do any of these, the answer is: it belongs to Knowledge, Reasoning, the cognitive chain, or Execution.

- **Never accept a direct write.** Every write is a governed promotion from Working Memory; there is no bypass.
- **Never let Working Memory (or anything) write durably outside promotion.**
- **Never store a memory without provenance and lineage.**
- **Never silently overwrite.** Corrections version and preserve history.
- **Never be Knowledge or declare organizational truth.** It stores memories; truth is Knowledge's; elevation is a governed promotion.
- **Never reason, decide, or execute.** It stores and serves inputs only.
- **Never change permissions or own business intent.**
- **Never forget by accident.** Aging/retention/soft-delete are governed; content destruction is only via the explicit GDPR/legal-erasure flow.
- **Never leak across tenants or scopes.** Tenant isolation and permission scope are absolute; personal memory is private except by governed sharing.
- **Never mutate on retrieval, let health change lifecycle, or mutate without an immutable audit record.**

---

## Implementation Assumptions

- **New enums (specification-level, not yet migrated):** `memoryLifecycleStatusEnum` (`proposed | active | corrected | superseded | aged | archived | soft-deleted | purged`), `memoryHealthEnum` (`unknown | trusted | degraded | conflicted`), `memoryScopeEnum` (`personal | shared | organizational`). Reuses the existing `memoryKindEnum` (`episodic | semantic | procedural`). These join the accumulated, unimplemented enum backlog from specs 35–43.
- **Existing `memory` schema:** the repo already has a `memory` schema file and `memoryKindEnum`; this spec assumes Long-term Memory extends/realizes that table (with namespace/collection/provenance/lineage/scope/trust fields) rather than replacing it — to be reconciled at implementation.
- **Promotion is cross-module:** the write path spans Working Memory (proposer), Governance (approver), and Long-term Memory (store). Implementation must place the pipeline so no module can shortcut it.
- **Vector + storage abstractions** are interfaces; concrete engines (vector DB, object/row store) are deployment choices behind them, provider-independent.
- **Retrieval/promotion as Commands:** memory reads/writes are expressed through the Command → Execution path where they cross the effect boundary; direct in-process reads for same-tenant retrieval are an optimization behind the same permission checks.
- **No code, SQL, migrations, or schema changes produced** — architecture specification only, per instruction.

## Open Questions for 45 - Knowledge Specification v1.0

- **The memory↔truth boundary, precisely.** When does a semantic memory become Knowledge? Define the promotion-to-Knowledge pipeline: who proposes, who approves, what corroboration/trust threshold, and how the memory records the promotion.
- **Knowledge canonicalization.** Knowledge is "organizational truth" — is it single-canonical (one authoritative statement per fact) with conflict impossible, unlike Memory where conflict is allowed? Define Knowledge's uniqueness/canonical model.
- **Knowledge vs Policy.** Both are authoritative. Knowledge = what is true; Policy = what is allowed/required. Clarify the boundary (a fact vs a rule) and how they reference each other.
- **Knowledge lifecycle vs Memory lifecycle.** Does Knowledge version/supersede like Memory, or does it have ratification (like Mission) because it is authoritative? Likely closer to Mission/Policy ratification than Memory promotion.
- **Knowledge scope.** Is Knowledge always organizational (company truth), or can there be department/domain-scoped knowledge? Define scope vs Memory's personal/shared/organizational.
- **Retrieval unification.** Working Memory retrieves from both Memory and Knowledge; define how they are jointly ranked/attributed so an agent knows what is *remembered* vs *true*.
- **Knowledge provenance & trust.** Does Knowledge carry confidence/trust, or is it binary-authoritative once ratified? Likely authoritative (no confidence) once ratified, unlike Memory.
- **Forgetting truth.** Can Knowledge be forgotten/retired, or only superseded by new ratified truth? GDPR interaction with Knowledge vs Memory.
- **Accumulated enum backlog** across specs 35–44 remains unimplemented; the Knowledge spec will add more (`knowledgeStatusEnum`, etc.). Flag that an implementation/migration consolidation stage is overdue.
