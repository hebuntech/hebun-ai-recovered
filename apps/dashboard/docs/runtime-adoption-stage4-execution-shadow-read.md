# Runtime Adoption Stage 4 — Execution Lineage Shadow Read Verification

Scope:

- Execution lineage only
- memory-authoritative
- PostgreSQL comparison-only
- internal diagnostics only

Core rule:

- never select PostgreSQL as runtime execution lineage output
- compare `memory` and `postgres`
- no write path
- no persistence of comparison results

Supported comparison dimensions:

1. Execution identity, lifecycle, legacy status, health, simulation, and timestamps
2. Command identity, lifecycle, legacy status, correlation, causation, and idempotency
3. Workflow identity, lifecycle, and version
4. Task identity, lifecycle, legacy status, and version
5. Plan identity and version
6. Goal identity and version
7. Mission identity and version

Mismatch taxonomy:

- execution mismatch
- command mismatch
- workflow mismatch
- task mismatch
- plan mismatch
- goal mismatch
- mission mismatch
- version mismatch
- lifecycle mismatch
- legacy-status mismatch
- missing lineage
- broken chain
- tenant mismatch
- unavailable source
- non-comparable field

Development-only diagnostics:

- route: `/_internal/canonical-read`
- section: `Execution Shadow Read`
- required flag: `HEBUN_ENABLE_CANONICAL_READ_DIAGNOSTICS=true`
- optional canonical target: `HEBUN_CANONICAL_READ_DATABASE_URL`

Local verification:

1. Keep the memory adapter active
2. Set `HEBUN_ENABLE_CANONICAL_READ_DIAGNOSTICS=true`
3. Optionally point `HEBUN_CANONICAL_READ_DATABASE_URL` at a disposable localhost PostgreSQL database
4. Open `/_internal/canonical-read`
5. Use the `Execution Shadow Read` inspector

No-runtime-effect guarantee:

- no execution runtime module imports the shadow-read service
- no dispatcher, workflow engine, or Command Bus import changes
- no canonical read result is selected as runtime output
- no audit, event, telemetry, or persistence writes occur
- no repair, replay, retry, dispatch, or synchronization controls exist

Disable:

- unset `HEBUN_ENABLE_CANONICAL_READ_DIAGNOSTICS`
- or run in `production`
