# Runtime Adoption Stage 5 — Actor Shadow Read Verification

Scope:

- Actor resolution only
- memory-authoritative
- PostgreSQL comparison-only
- internal diagnostics only

Core rule:

- never select PostgreSQL as runtime actor or authorization output
- compare `memory` and `postgres`
- no write path
- no persistence of comparison results

Human comparison dimensions:

1. Identity
2. Membership presence
3. Role metadata
4. Lifecycle and suspension
5. Authority metadata when already available

Agent comparison dimensions:

1. Identity
2. Department
3. Human owner and manager
4. Lifecycle
5. Health, type, and risk when available
6. Authority/config metadata when already available

System and service behavior:

- canonical result remains registry-required
- no rows are fabricated
- comparison returns `unresolved-actor-type`
- unavailable fields remain non-comparable

Mismatch taxonomy:

- identity mismatch
- tenant mismatch
- display-label mismatch
- lifecycle mismatch
- suspension mismatch
- membership mismatch
- role mismatch
- ownership mismatch
- manager mismatch
- department mismatch
- agent-type mismatch
- health mismatch
- risk mismatch
- authority-metadata mismatch
- missing memory actor
- missing canonical actor
- unresolved system/service actor
- unavailable source
- non-comparable field

Sensitive-data controls:

- no auth tokens
- no session secrets
- no password hashes
- no connection strings
- no raw auth payloads
- no unrestricted authority JSON
- display labels only, not raw auth identifiers

Development-only diagnostics:

- route: `/_internal/canonical-read`
- section: `Actor Shadow Read`
- required flag: `HEBUN_ENABLE_CANONICAL_READ_DIAGNOSTICS=true`
- optional canonical target: `HEBUN_CANONICAL_READ_DATABASE_URL`

Local verification:

1. Keep the memory adapter active
2. Set `HEBUN_ENABLE_CANONICAL_READ_DIAGNOSTICS=true`
3. Optionally point `HEBUN_CANONICAL_READ_DATABASE_URL` at a disposable localhost PostgreSQL database
4. Open `/_internal/canonical-read`
5. Use the `Actor Shadow Read` inspector

No-authorization and no-runtime-effect guarantee:

- no auth or permission path imports the actor shadow service
- no Governance or Policy path consumes it
- no runtime actor resolution is replaced
- no ownership, role, or authority repair occurs
- no audit, event, telemetry, memory, or PostgreSQL writes occur

Disable:

- unset `HEBUN_ENABLE_CANONICAL_READ_DIAGNOSTICS`
- or run in `production`
