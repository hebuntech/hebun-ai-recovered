# Runtime Adoption Stage 1 — Read-Only Canonical Data Access

- Active runtime authority remains the in-memory persistence provider.
- Canonical PostgreSQL access is optional, read-only, and isolated under `src/features/canonical-read/`.
- Supported queries in this stage are limited to:
  - canonical actor resolution
  - canonical Knowledge fact selection
  - execution lineage lookup
- Absence of `HEBUN_CANONICAL_READ_DATABASE_URL` must not break startup.
- No write path exists in this layer.
- No UI integration exists in this stage.
- No Supabase cutover exists in this stage.

Next adoption gates:

1. Internal read-only callers only, behind explicit service injection.
2. No route or runtime behavior changes until dual-read reporting is added.
3. No PostgreSQL write path until governed persistence adoption is approved.
