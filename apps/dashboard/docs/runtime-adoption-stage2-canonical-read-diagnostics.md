# Runtime Adoption Stage 2 — Internal Canonical Read Diagnostics

Route:

- `/_internal/canonical-read`

Environment contract:

- `NODE_ENV` must not be `production`
- `HEBUN_ENABLE_CANONICAL_READ_DIAGNOSTICS=true`
- optional read target: `HEBUN_CANONICAL_READ_DATABASE_URL`
- optional remote override: `HEBUN_CANONICAL_READ_ALLOW_REMOTE=true`

Safety boundary:

- diagnostics are server-guarded and return `notFound()` when disabled
- page is not included in sidebar navigation
- memory runtime remains authoritative
- canonical PostgreSQL access remains optional and read-only
- no write API, no dual-write, no runtime cutover
- no Supabase integration

Supported inspectors:

1. Availability and health
2. Canonical actor resolution
3. Canonical Knowledge fact selection
4. Execution lineage inspection

Credential and error handling:

- passwords and raw connection strings are never rendered
- raw PostgreSQL driver errors are sanitized before rendering
- only typed canonical-read contracts cross the server/client boundary

Local verification:

1. Set `HEBUN_ENABLE_CANONICAL_READ_DIAGNOSTICS=true`
2. Optionally set `HEBUN_CANONICAL_READ_DATABASE_URL` to a disposable localhost PostgreSQL database
3. Run `npm run dev`
4. Open `/_internal/canonical-read`

Disable diagnostics:

- unset `HEBUN_ENABLE_CANONICAL_READ_DIAGNOSTICS`
- or run with `NODE_ENV=production`
