# Runtime Adoption Stage 7 — Knowledge Silent Dual-Read Rollout Plan

Scope:

- Knowledge only
- memory-authoritative
- PostgreSQL comparison-only
- production-shaped rollout infrastructure only

Core rule:

- memory output returns unchanged
- shadow comparison never selects PostgreSQL
- no write path
- no mutation
- no user-visible output change

Implemented groundwork:

- env-driven config parsing for:
  - `HEBUN_ENABLE_KNOWLEDGE_SILENT_DUAL_READ`
  - `HEBUN_KNOWLEDGE_DUAL_READ_TENANT_ALLOWLIST`
  - `HEBUN_KNOWLEDGE_DUAL_READ_SAMPLE_RATE`
  - `HEBUN_KNOWLEDGE_DUAL_READ_TIMEOUT_MS`
- pure deterministic eligibility gate
- production-safe metrics sink abstraction
- sanitized error categorization

Current blocker:

- no existing server-side product hook currently returns an individual `KnowledgeNodeRecord` memory snapshot
- existing Knowledge snapshot reads are client-side store reads
- existing server-side deterministic engine paths are out of scope for perturbation in this stage

Inspected surfaces:

- `src/features/knowledge-crud/node-queries.ts`
- `src/features/knowledge-crud/report.ts`
- `src/features/memory-engine/memory-index.ts`
- `src/features/agent-context/agent-context-service.ts`
- `src/features/agent-reasoning/agent-reasoning-service.ts`
- `src/app/(dashboard)/director/knowledge-graph/page.tsx`

Why rollout is blocked today:

- no safe existing server-only Knowledge-node hook exists
- adding a new product read surface purely for shadow rollout would violate the “select one existing low-risk hook” rule
- instrumenting Agent Context, Agent Reasoning, or Memory Engine would touch protected runtime paths

Eligibility semantics:

1. feature disabled → ineligible
2. missing tenant → ineligible
3. tenant not allowlisted → ineligible
4. canonical read unavailable → ineligible
5. sample excluded → ineligible
6. valid config + allowlisted tenant + deterministic sample pass + canonical available → eligible

Metrics semantics:

- allowed counters only
- no fact keys
- no Knowledge content
- no raw tenant ids
- no SQL errors
- production sink defaults to no-op until a safe hooked runtime exists

Rollback:

- set `HEBUN_ENABLE_KNOWLEDGE_SILENT_DUAL_READ=false`
- because no product hook is attached yet, rollback is immediate and side-effect free

Next required prerequisite before activation:

- create or identify one existing server-side Knowledge read facade that already returns a stable memory `KnowledgeNodeRecord`
- attach the shadow runner only there
- keep memory authoritative
