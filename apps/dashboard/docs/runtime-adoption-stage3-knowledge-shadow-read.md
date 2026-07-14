# Runtime Adoption Stage 3 — Knowledge Shadow Read Verification

Scope:

- Knowledge only
- memory-authoritative
- PostgreSQL comparison-only
- internal diagnostics only

Core rule:

- never select PostgreSQL as runtime Knowledge output
- compare `memory` and `postgres`
- no write path
- no persistence of comparison results

Supported comparison dimensions:

1. Identity
2. Content
3. Governance lifecycle
4. Versioning
5. Trust and provenance
6. Freshness and review metadata

Mismatch taxonomy:

- identity mismatch
- content mismatch
- lifecycle mismatch
- health mismatch
- authority mismatch
- version mismatch
- provenance mismatch
- freshness mismatch
- missing canonical selection
- missing memory representation
- tenant mismatch
- unavailable source
- non-comparable shape

Development-only diagnostics:

- route: `/_internal/canonical-read`
- section: `Knowledge Shadow Read`
- required flag: `HEBUN_ENABLE_CANONICAL_READ_DIAGNOSTICS=true`
- optional canonical target: `HEBUN_CANONICAL_READ_DATABASE_URL`

Local verification:

1. Keep the memory adapter active
2. Set `HEBUN_ENABLE_CANONICAL_READ_DIAGNOSTICS=true`
3. Optionally point `HEBUN_CANONICAL_READ_DATABASE_URL` at a disposable localhost PostgreSQL database
4. Open `/_internal/canonical-read`
5. Use the `Knowledge Shadow Read` inspector

No-runtime-effect guarantee:

- no existing Knowledge consumer imports the shadow-read service
- no Knowledge CRUD path changes
- no Knowledge Graph UI path changes
- no Memory Engine, Agent Context, or Agent Reasoning import changes
- no audit, event, telemetry, memory, or Knowledge persistence

Disable:

- unset `HEBUN_ENABLE_CANONICAL_READ_DIAGNOSTICS`
- or run in `production`
