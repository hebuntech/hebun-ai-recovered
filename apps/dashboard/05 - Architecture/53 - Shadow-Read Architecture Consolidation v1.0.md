# Shadow-Read Architecture Consolidation v1.0

## Executive Decision

- Decision: consolidate the validated Knowledge, Execution Lineage, and Actor shadow-read implementations behind one shared comparison and service foundation.
- Runtime decision: GO for continued non-authoritative shadow-read hardening.
- Production decision: NO-GO for runtime authority changes or broad production dual-read activation in this phase.
- First production-shaped silent dual-read candidate: Knowledge only.

## Current Inventory

- Validated shadow domains:
  - `src/features/knowledge-shadow-read`
  - `src/features/execution-shadow-read`
  - `src/features/actor-shadow-read`
- Shared canonical read layer:
  - `src/features/canonical-read`
- Diagnostics entry point:
  - `src/components/canonical-read/diagnostics-page.tsx`
- Integration harnesses:
  - `tests/*shadow-read/integration.ts`
  - `tests/canonical-read/integration.ts`
  - `tests/canonical-read/diagnostics-integration.ts`

## Drift Findings Resolved

- Shared status unions had been duplicated in all three domains.
- Shared field comparison status unions had been duplicated in all three domains.
- UUID validation logic had been duplicated in all three services.
- Compared-at timestamp generation had been duplicated in all three services.
- Match / partial-match / mismatch derivation had been duplicated in all three services.
- Identifier, text, JSON, and datetime normalization had been split across comparator files.
- Field partitioning into matched, mismatched, non-comparable, and missing groups had been duplicated.
- Disposable localhost PostgreSQL setup and teardown logic had been duplicated across all integration suites.
- Diagnostics shadow-result rendering repeated the same boundary badges, mismatch taxonomy card, and comparison-group layout.

## Shared Architecture

- New shared core: `src/features/shadow-read-core/`
  - `types.ts`
  - `compare.ts`
  - `service.ts`
  - `index.ts`
- Shared contracts:
  - `ShadowReadStatus`
  - `ShadowFieldComparisonStatus`
  - `ShadowReadSourceAvailability`
- Shared helpers:
  - `compareShadowField`
  - `partitionShadowComparisons`
  - `deriveShadowMatchStatus`
  - `deriveShadowPresenceStatus`
  - `isShadowUuidLike`
  - `createUnavailableAvailability`
  - `createComparedAt`
  - `buildShadowSourceAvailability`

## Canonical Source-Presence Truth Table

| Memory present | PostgreSQL present | Expected status |
| --- | --- | --- |
| yes | yes | `matched` or `partial-match` or `mismatch` |
| yes | no | `memory-only` |
| no | yes | `postgres-only` |
| no | no | `not-found` |

- `not-found` means both sources were queried successfully and neither source returned a record.
- `unavailable` remains a source-availability outcome, not a data-presence outcome.
- `tenant-mismatch`, `invalid-input`, and `unresolved-actor-type` remain separate explicit states.

## Domain Boundaries Preserved

- Knowledge keeps its domain-specific mismatch taxonomy, memory lookup derivation, and canonical fact/node summarization.
- Execution keeps its lineage-node model, node-specific mismatch taxonomy, and execution-session-to-lineage summarization rules.
- Actor keeps its actor-type-specific unresolved handling, membership and authority sections, and actor-resolution summarization.
- No shared helper performs writes, mutates runtime state, changes execution authority, or changes authorization behavior.

## Contract Consolidation Outcome

- Knowledge now uses shared status and field-status contracts.
- Actor now uses shared status and field-status contracts, with the additional domain-only status `unresolved-actor-type`.
- Execution now uses shared status and field-status contracts and now exposes `sourceAvailability` like the other shadow domains.
- Execution terminology was aligned to `diff` instead of keeping a separate `comparison` result shape.

## Diagnostics Consolidation

- Shared diagnostics view helpers now render:
  - shadow boundary badges
  - shadow comparison groups
  - mismatch taxonomy cards
- Sanitized PostgreSQL availability warnings for all shadow results now flow through one helper in `src/features/canonical-read/diagnostics.ts`.
- Diagnostics remains read-only and explicitly non-authoritative.

## Test Infrastructure Consolidation

- New shared localhost-only disposable harness:
  - `tests/helpers/disposable-postgres.ts`
- Shared guarantees:
  - localhost enforcement
  - disposable database creation
  - migration execution
  - backend termination before drop
  - deterministic cleanup path in `finally`

## Import and No-Write Proofs

- `src/features/shadow-read-core` imports only read-side canonical types and local utility concerns.
- It does not import runtime activation, authorization, orchestration mutation, command execution, or persistence write APIs.
- Shadow services still call:
  - memory readers
  - canonical read services
  - comparators
  - disposal only
- No shadow path issues inserts, updates, deletes, or side-effecting runtime mutations.

## Status Semantics Hardening

- The previous shared defect was:
  - memory absent
  - PostgreSQL absent
  - returned status: `postgres-only`
- That behavior is now corrected across Knowledge, Execution, and Actor shadow reads.
- `postgres-only` now means PostgreSQL has a record and memory does not.
- `not-found` now means neither source has a record after successful queries.
- `not-found` is a neutral empty-state outcome, not an error and not a mismatch.

## Production-Shaped Domain Recommendation

- Knowledge: best first candidate.
  - Lowest operational blast radius.
  - No authorization or execution-path effect.
  - Better rollback story because the memory path remains authoritative.
- Execution: not first.
  - Memory lineage is intentionally partial today.
  - False-positive drift risk is materially higher.
- Actor: not first.
  - Human memory coverage is incomplete.
  - Authorization-adjacent semantics make rollout discipline stricter.

## GO / NO-GO

- GO:
  - continue consolidation
  - continue shadow-only validation
  - run production-shaped silent dual-read planning for Knowledge
  - treat `not-found` as rollout-safe empty-state telemetry
- NO-GO:
  - authority cutover
  - runtime dual-read activation beyond diagnostics and test harnesses
  - Actor-first or Execution-first production experiments

## Metrics Semantics

- Add rollout metrics at design level:
  - `shadow_not_found_count`
  - `shadow_not_found_rate`
- Rate accounting rules:
  - `not-found` is excluded from mismatch rate
  - `not-found` is excluded from postgres-only rate
  - `unavailable` is tracked separately
  - `invalid-input` is tracked separately
  - `tenant-mismatch` is tracked separately
- No persistent metric implementation is introduced in this phase.

## Next Implementation Phase

1. Preserve this shared core as the only place for cross-domain shadow contracts and comparison helpers.
2. Add rollout-grade drift counters and sampling for Knowledge shadow reads.
3. Gate any production-shaped experiment behind explicit diagnostics-safe flags with memory remaining authoritative.
4. Keep `not-found` telemetry separate from mismatch telemetry during rollout analysis.
