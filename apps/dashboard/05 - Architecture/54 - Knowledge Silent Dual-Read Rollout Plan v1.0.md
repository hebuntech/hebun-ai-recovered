# Knowledge Silent Dual-Read Rollout Plan v1.0

## Decision

- Domain selected: Knowledge only
- Runtime authority: memory remains authoritative
- Current implementation decision: GO for the dedicated server-side facade
- Current rollout decision: NO-GO for attaching silent dual-read yet
- Reason: the safe server-side hook now exists, but PostgreSQL shadow work is still intentionally unattached in this stage

## Verified Constraint

- The Stage 7 rollout requires one existing server-side hook where a stable memory Knowledge node snapshot is already produced.
- That hook now exists as `src/features/knowledge-read-facade/`.

## Inspected Runtime Surfaces

- Client-side Knowledge snapshot consumers:
  - `src/components/knowledge-graph/knowledge-registry-workspace.tsx`
  - `src/components/memory-engine/memory-engine-panel.tsx`
  - `src/components/agent-context/agent-context-panel.tsx`
  - `src/components/agent-reasoning/agent-reasoning-panel.tsx`
- Shared read facades:
  - `src/features/knowledge-crud/node-queries.ts`
  - `src/features/knowledge-crud/report.ts`
  - `src/features/memory-engine/memory-index.ts`
  - `src/features/agent-context/agent-context-service.ts`
  - `src/features/agent-reasoning/agent-reasoning-service.ts`
- Server page inspection:
  - `src/app/(dashboard)/director/knowledge-graph/page.tsx`
  - `src/app/(dashboard)/knowledge/page.tsx`

## Hook Selection Result

- Selected source: `getNodeSnapshot()` from `src/features/knowledge-crud/node-adapter.ts`
- Why this source:
  - returns the canonical in-memory `KnowledgeNodeRecord` shape already used today
  - deterministic
  - callable server-side
  - read-only
  - does not write audit, telemetry, or persistence state
- Rejected sources:
  - `node-queries.ts` because they are not server-only and route through repository list/find behavior
  - `knowledge-registry-workspace.tsx` because it is client-side
  - `memory-index.ts`, Agent Context, and Agent Reasoning because those paths are protected runtime flows
  - `report.ts` because it is aggregate-only and does not expose a single stable Knowledge snapshot

## Implemented Facade

- Location:
  - `src/features/knowledge-read-facade/`
- Entry point:
  - `readKnowledgeFromMemoryFacade()`
- Contract behavior:
  - server-only
  - read-only
  - memory-authoritative
  - no PostgreSQL
  - no mutation
  - immutable serializable summary output

## Tenant Boundary Truthfulness

- Current memory Knowledge nodes do not consistently carry tenant identity.
- The facade therefore:
  - verifies tenant only when an explicit `tenant:<uuid>` tag is present in the current memory shape
  - returns `tenant-mismatch` when explicit tenant metadata disagrees
  - otherwise returns a partial tenant-boundary warning and marks `tenantId` non-comparable
- This keeps tenant assessment truthful and prevents false certainty.

## Implemented Groundwork

- `src/features/knowledge-silent-dual-read/config.ts`
  - safe env parsing
  - disabled-by-default behavior
  - bounded timeout
  - invalid-config safe disable
- `src/features/knowledge-silent-dual-read/eligibility.ts`
  - pure deterministic allowlist and sample gate
- `src/features/knowledge-silent-dual-read/metrics.ts`
  - production-safe no-op sink
  - development in-memory sink
- `src/features/knowledge-silent-dual-read/redaction.ts`
  - sanitized error categorization

## Feature Flags

- `HEBUN_ENABLE_KNOWLEDGE_SILENT_DUAL_READ=false`
- `HEBUN_KNOWLEDGE_DUAL_READ_TENANT_ALLOWLIST=`
- `HEBUN_KNOWLEDGE_DUAL_READ_SAMPLE_RATE=0`
- `HEBUN_KNOWLEDGE_DUAL_READ_TIMEOUT_MS=100`

## Eligibility Rules

- `feature-disabled`
- `missing-tenant`
- `tenant-not-allowed`
- `canonical-read-unavailable`
- `missing-sample-key`
- `sample-excluded`
- `invalid-config`

## Metrics Design

- Allowed counters:
  - `shadow_knowledge_eligible_count`
  - `shadow_knowledge_executed_count`
  - `shadow_knowledge_matched_count`
  - `shadow_knowledge_partial_match_count`
  - `shadow_knowledge_mismatch_count`
  - `shadow_knowledge_memory_only_count`
  - `shadow_knowledge_postgres_only_count`
  - `shadow_knowledge_not_found_count`
  - `shadow_knowledge_unavailable_count`
  - `shadow_knowledge_invalid_input_count`
  - `shadow_knowledge_tenant_mismatch_count`
  - `shadow_knowledge_timeout_count`
  - `shadow_knowledge_error_count`
- Allowed observation:
  - `shadow_knowledge_latency_ms`
- Forbidden payloads remain excluded:
  - fact keys
  - Knowledge content
  - provenance
  - source attribution
  - tenant ids
  - SQL rows
  - connection strings

## Rollback

- Rollback command:
  - `HEBUN_ENABLE_KNOWLEDGE_SILENT_DUAL_READ=false`
- Because no runtime hook is attached yet:
  - no pending work remains
  - no queue drain is required
  - no data repair is required
  - no schema rollback is required

## GO / NO-GO

- GO:
  - keep the rollout infrastructure
  - use `knowledge-read-facade` as the only approved future Knowledge silent dual-read hook
  - attach the silent dual-read only through this facade in a later stage
- NO-GO:
  - attach shadow work to client snapshot consumers
  - attach shadow work to Memory Engine
  - attach shadow work to Agent Context
  - attach shadow work to Agent Reasoning
  - invent a product-path PostgreSQL read fallback
