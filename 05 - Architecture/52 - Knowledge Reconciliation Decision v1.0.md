# Knowledge Reconciliation Decision v1.0

## 1. Executive decision

**Selected outcome: B. Extend the existing `knowledge_nodes` / `knowledge_edges` graph plus one narrowly scoped supporting table.**

The current graph can remain the canonical Knowledge surface only if the **canonical fact identity and ratification record are separated from node presentation**. `knowledge_nodes` can be extended additively to carry most governed-truth metadata, and `knowledge_edges` can be extended additively to carry typed governed relationships. However, the requirement **"one active ratified truth per canonical fact key"** is not cleanly representable by nodes and edges alone without either:

1. overloading a node into both a fact record and a graph projection object, or
2. embedding a uniqueness-critical canonical key inside free-form text / JSON with no enforceable relational guarantee.

The minimal supporting table is therefore a **fact-key / ratification support table**, not a second Knowledge system. It would exist only to hold the canonical fact identity and active-ratified pointer needed for uniqueness and atomic supersession. The graph remains the Knowledge system; the support table enforces canonical truth discipline for it.

**GO recommendation:** proceed only with an implementation that keeps `knowledge_nodes` / `knowledge_edges` as the primary Knowledge model and adds one narrow relational support table for canonical fact-key enforcement and ratification linkage.

## 2. Current schema inventory

### 2.1 Actual inspected schema

The repository does **not** contain `knowledge-node.ts` or `knowledge-edge.ts`. The graph schema currently lives in a single file:

- `src/db/schema/knowledge.ts`

Current definitions:

- `knowledge_nodes`
  - `tenantColumns`
  - `type`
  - `refId`
  - `label`

- `knowledge_edges`
  - `tenantColumns`
  - `fromNodeId`
  - `toNodeId`
  - `relation`
  - `weight`

### 2.2 Related runtime surfaces inspected

- `src/features/knowledge-crud/*`
- `src/features/knowledge-graph/*`
- `src/components/knowledge-graph/*`
- `src/app/(dashboard)/director/knowledge-graph/page.tsx`
- `src/features/memory-engine/*`
- `src/features/agent-context/*`
- `src/features/agent-reasoning/*`
- `src/db/schema/memory.ts`
- `src/db/schema/governance.ts`
- `src/db/schema/policy.ts`
- `src/db/schema/audit-log.ts`
- `src/db/schema/event-log.ts`

### 2.3 Runtime reality

The current Knowledge implementation is **not** a governed truth store today. It is:

- an in-memory CRUD layer over node and relationship records;
- seeded initially from registry-derived graph data;
- consumed by the deterministic memory engine as a link layer;
- surfaced in UI as a graph/registry workspace;
- not ratified, not canonical, not conflict-free, and not authoritative over memory.

This differs materially from the older gap-analysis assumption that Knowledge should likely become a separate canonical table. The graph implementation is richer than a visualization-only placeholder, but still structurally incomplete for canonical truth.

## 3. Specification coverage matrix

### 3.1 knowledge_nodes coverage

| Requirement | Classification | Evidence / rationale |
|---|---|---|
| canonical organizational truth | additively extendable | Node rows can represent truth objects if enriched with statement/authority/lifecycle metadata. |
| one active authoritative truth per fact/scope | conflicting | Needs enforceable canonical fact identity and active-ratified uniqueness; nodes alone do not expose a stable fact-key column today. |
| ratification | additively extendable | Can add approval/ratification fields and governance-decision references. |
| authority | additively extendable | Can add `knowledgeAuthorityEnum` and steward/owner actor pairs. |
| scope | additively extendable | Can add `knowledgeScopeEnum`. |
| domain | additively extendable | Can add domain/category columns. |
| category | additively extendable | Straightforward additive column. |
| owner | additively extendable | Actor-pair or scoped owner refs can be added. |
| steward | additively extendable | Actor-pair columns can be added. |
| provenance | additively extendable | JSONB / referenced IDs fit cleanly. |
| lineage | additively extendable | Self-references + version columns fit cleanly. |
| source attribution | additively extendable | JSONB or text references fit cleanly. |
| versioning | additively extendable | `knowledgeVersion`, supersession refs, canonical fact key can be added. |
| supersession | additively extendable | Self-references and lifecycle can model it. |
| freshness | additively extendable | health + review timestamps + freshness policy fit. |
| review cadence | additively extendable | cadence + next review columns fit. |
| deprecation | additively extendable | `knowledgeLifecycleStatusEnum` supports it. |
| retirement | additively extendable | `knowledgeLifecycleStatusEnum` supports it. |
| contested state | additively extendable | `knowledgeHealthEnum` supports it. |
| provisional authority | additively extendable | `knowledgeAuthorityEnum` supports it. |
| Knowledge refs to Long-term Memory | additively extendable | memory references can be stored as FK(s) or JSON refs. |
| tenant isolation | already supported | `tenantColumns` already present. |
| department/domain/company-wide scope | additively extendable | requires explicit scope + scoped owner/domain refs. |

### 3.2 knowledge_edges coverage

| Requirement | Classification | Evidence / rationale |
|---|---|---|
| dependencies | already supported | `relation` can already encode dependency semantics, though ungoverned. |
| references | already supported | same as above. |
| contradiction links | additively extendable | new relation type plus lifecycle/metadata columns. |
| supersession links | additively extendable | new relation type, though node self-ref is cleaner for primary lineage. |
| provenance links | additively extendable | edge type + metadata can model source derivation. |
| derived-from links | additively extendable | edge type + metadata fit well. |
| scoped relationships | additively extendable | add scope + domain metadata to edges. |
| cross-domain links | already supported | graph already spans domains conceptually. |
| version-aware relationships | additively extendable | add lifecycle/version / active flags on edges. |
| active/inactive relationship lifecycle | additively extendable | explicit edge lifecycle/health columns fit. |
| canonical graph traversal | additively extendable | traversal model is viable if canonical node identity is stabilized. |

## 4. knowledge_nodes gap analysis

### 4.1 What exists

`knowledge_nodes` already has three useful properties:

1. tenant ownership via `tenantColumns`;
2. a graph identity (`id`);
3. a loose type/reference shell (`type`, `refId`, `label`).

That is enough to **extend** into a governed truth node. It is not enough to guarantee canonical truth today.

### 4.2 What is missing

To satisfy Spec 45, a node would minimally need additive fields for:

- canonical statement / fact payload;
- fact domain and category;
- scope and scoped owner/steward;
- authority level;
- provenance and source attribution;
- approval / ratification references;
- lifecycle and health;
- review cadence / freshness policy;
- version and self-supersession;
- memory references;
- canonical fact identity.

### 4.3 Core structural problem

The hard requirement is not metadata volume. The hard requirement is **canonical uniqueness**:

> one active ratified truth per canonical fact per scope/domain.

If `knowledge_nodes` alone is used, the system needs one column that means:

- this node’s canonical fact identity;
- stable across versions;
- shared by all superseding versions of the same truth;
- indexable with a partial unique constraint over active ratified records.

That is technically possible by adding a `canonicalFactKey` column directly to `knowledge_nodes`. The issue is that the same node table is also the graph’s general-purpose node surface and today supports broad node types, registry-derived projections, and manual CRUD semantics. Forcing every node to participate in canonical fact-key uniqueness pushes two incompatible concerns into one table:

- **truth object identity**
- **graph node projection identity**

That is why nodes alone are possible in theory but poor in practice for correctness.

## 5. knowledge_edges gap analysis

### 5.1 What exists

`knowledge_edges` already models directed graph relationships with:

- source node
- target node
- relation type
- weight
- tenant ownership

This is a good substrate for canonical graph traversal.

### 5.2 What is missing

Spec 45 needs relationships that are not merely visual links. They need to be governable and historically meaningful:

- contradiction
- supersedes
- derived-from
- provenance/source link
- reference
- dependency
- lifecycle / active-inactive state
- review impact
- scope/domain compatibility

All of those are **additively extendable** with:

- richer edge-type catalog
- lifecycle / health columns
- metadata JSONB
- optional self-consistency constraints

### 5.3 Edge conclusion

`knowledge_edges` is **not** the blocker. It can remain the canonical relationship layer with additive expansion. The blocker is canonical fact identity and ratified uniqueness at the node level.

## 6. Canonical truth model

### 6.1 Minimum viable additive design

The smallest design that satisfies Spec 45 while preserving the graph is:

1. `knowledge_nodes` becomes the authoritative Knowledge object row.
2. `knowledge_edges` becomes the authoritative Knowledge relationship row.
3. One narrow support table holds canonical fact identity and active-ratified selection.

### 6.2 Why the support table is needed

The support table is justified because it represents something that columns or edges do not represent cleanly:

- **the canonical fact itself**, distinct from any one node version.

Nodes are versions of truth statements. The canonical fact is the identity that all versions belong to. Edges can link versions, but an edge does not provide:

- a single row to enforce partial uniqueness against;
- a stable fact identity independent of node version rows;
- atomic retargeting from one active ratified node version to the next.

### 6.3 Canonical truth invariants

The minimum truth model needs to guarantee:

- one active ratified node version per fact key / scope / domain;
- no direct contradiction among active ratified truths;
- historical access to superseded versions;
- provisional and contested states without losing lineage;
- governance-traceable ratification.

### 6.4 Atomic supersession

Atomic supersession is feasible if:

- the outgoing node is marked `superseded`;
- the incoming node is marked `ratified`;
- the canonical fact record’s active pointer moves in the same transaction.

That last requirement is the strongest argument for a support table.

## 7. Ratification model

Ratification can stay fully inside the existing governance model by referencing:

- `governance_sessions`
- `decision_records`

Recommended shape:

- a knowledge candidate node enters `draft` or `proposed`;
- governance review moves it to `under-review`;
- ratification decision links to the candidate;
- if approved, the candidate becomes `ratified`;
- if it replaces an active fact version, supersession is atomic.

This can be implemented with:

- additional node columns
- partial unique indexes
- self-references
- governance decision references

No runtime decision engine change is required at the schema-decision stage.

## 8. Versioning and lineage model

### 8.1 Node-level lineage

Use node self-references for:

- `supersedesKnowledgeNodeId`
- `supersededByKnowledgeNodeId` if desired
- `knowledgeVersion`

This preserves historical node versions.

### 8.2 Edge-level lineage

Edges should gain:

- lifecycle
- optional version
- optional supersedes edge ref

Only if relationship history matters independently. Otherwise edge history can derive from node version transitions.

### 8.3 Fact-level lineage

The support table should own:

- canonical fact key
- active ratified node pointer
- scoped uniqueness

This is lineage of the **truth slot**, not just lineage of a node row.

## 9. Scope and authority model

### 9.1 Scope

Knowledge scope should remain as Spec 45 defines:

- `company-wide`
- `department`
- `domain`

### 9.2 Authority

Authority should remain node-level metadata:

- `authoritative`
- `provisional`

### 9.3 Stewardship

Nodes should carry:

- owner actor pair
- steward actor pair

The graph should not own governance. It only stores truth and its accountable stewards.

### 9.4 Consistency rule

Narrower scope may refine broader scope but may not contradict it. This is best modeled as:

- scoped node metadata
- contradiction / dependency edges
- governance validation before ratification

Relational constraints can prevent duplicate active fact keys; they cannot prove semantic non-contradiction. That remains a governed validation rule.

## 10. Memory / Knowledge boundary

- **Knowledge Node owns:** canonical accepted truth, authority, scope, stewardship, ratification provenance, freshness, historical supersession.
- **Knowledge Node must never own:** raw recollection, ambiguous experience, promotion runtime, retrieval heuristics, reasoning conclusions.
- **Long-term Memory owns:** retained experience that may conflict, confidence-bearing recall, promotion candidates, retention/aging/correction metadata.
- **Long-term Memory must never own:** canonical truth, ratified uniqueness, override authority over reasoning.

Knowledge may reference memory. Memory may inform knowledge promotion. They must not collapse into one store.

## 11. Policy / Knowledge boundary

- **Knowledge owns:** what is true.
- **Policy owns:** what is allowed, required, forbidden, or constrained.

Knowledge may be cited by Policy. Policy may depend on Knowledge. Policy must never redefine truth by itself, and Knowledge must never encode rules as if they were facts.

## 12. Reasoning consumption contract

Reasoning should consume Knowledge as:

- read-only
- authoritative over Memory
- scoped and permissioned
- historically traceable when superseded truth is consulted

The current reasoning pipeline already reads graph-linked context indirectly through the memory engine. To satisfy Spec 45 later, the contract should become:

- active ratified Knowledge first
- provisional / contested Knowledge only when explicitly allowed
- Memory as supporting evidence, not final authority when conflict exists

This is a runtime adoption note only, not an implementation in this phase.

## 13. Recommended schema changes

### 13.1 `knowledge_nodes` additive columns

Recommended additive columns:

- `statement`
- `knowledgeLifecycleStatus`
- `knowledgeHealth`
- `knowledgeScope`
- `knowledgeAuthority`
- `domainKey`
- `categoryKey`
- `canonicalFactKey` if outcome A were chosen
- `ownerActorType`
- `ownerActorId`
- `stewardActorType`
- `stewardActorId`
- `provenance`
- `sourceAttribution`
- `references`
- `dependencies`
- `memoryRefs`
- `ratificationDecisionId`
- `ratificationSessionId`
- `ratifiedAt`
- `reviewCadence`
- `nextReviewAt`
- `deprecatedAt`
- `retiredAt`
- `knowledgeVersion`
- `supersedesKnowledgeNodeId`

### 13.2 `knowledge_edges` additive columns

Recommended additive columns:

- `edgeLifecycleStatus`
- `edgeHealth`
- `scope`
- `domainKey`
- `relationshipMetadata`
- `relationshipVersion`
- `supersedesKnowledgeEdgeId`

### 13.3 Support table purpose

Recommended narrow support table purpose:

- store the canonical fact key, scoped uniqueness fields, and active ratified node pointer;
- support atomic supersession and one-active-ratified-truth enforcement;
- not duplicate truth content;
- not replace the graph.

## 14. Risks

1. **Model overload risk.** Turning graph nodes directly into canonical truth without a fact-identity support layer will mix projection identity with truth identity and make uniqueness brittle.
2. **Runtime compatibility risk.** Current CRUD and UI assume generic node records with lightweight fields; a migration must preserve that surface during transition.
3. **Governance coupling risk.** Ratification references are straightforward, but semantic contradiction resolution remains a write-path concern rather than a pure DB constraint.
4. **Reasoning override risk.** If Knowledge becomes canonical without a later runtime consumption upgrade, Memory may still dominate in practice.
5. **Edge taxonomy drift.** Relationship types will need a canonical catalog; otherwise contradiction/provenance/derived-from semantics will fragment.

## 15. Stop conditions for implementation

Implementation should stop if any of the following becomes true:

1. a second truth-content table is proposed instead of extending the graph;
2. active-ratified uniqueness cannot be enforced without storing canonical fact identity somewhere relationally stable;
3. runtime consumers require destructive node/edge rewrites instead of additive dual-shape adoption;
4. graph CRUD assumptions force removal or renaming of existing node/edge fields;
5. semantic contradiction detection is treated as a pure SQL constraint rather than a governance validation concern.

## 16. Final GO / NO-GO recommendation

**GO with outcome B.**

Reason:

- `knowledge_nodes` and `knowledge_edges` are structurally extensible enough to become the canonical governed Knowledge graph.
- `knowledge_edges` is not a blocker.
- `knowledge_nodes` can hold almost all required truth metadata additively.
- But one narrow support table is justified because canonical fact identity plus atomic active-ratified selection is not cleanly or safely represented as just node columns or edges without overloading graph rows.

**NO-GO for outcome A** if "nodes and edges only" means no support table at all.

**NO-GO for outcome C** because replacement is not justified: the graph is not structurally incompatible, only incomplete for governed truth invariants.
