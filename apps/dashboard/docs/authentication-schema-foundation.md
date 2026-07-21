# Authentication Schema Foundation (Phase 3D.2B.2)

S12 is an additive, provider-neutral database foundation. It stores canonical
identity links, invitation digests, server-side session context, coarse role
permissions, and authentication audit lookup fields. Supabase Auth is not
configured and authentication remains disabled.

## Security boundary

- Provider tokens, raw JWTs, cookies, raw provider-session identifiers, and
  plaintext invitation tokens have no schema columns.
- Invitation and provider-session references are represented by versioned HMAC
  digests at the application boundary. Session contexts persist the positive key
  version used for each digest so controlled current/previous-key rotation does
  not require retaining an unbounded secret history.
- Security-history relationships use restrictive deletion; audit session lookup
  intentionally has no FK so retained audit events cannot be deleted transitively.
- Existing tenant and membership state remains non-authoritative until inventory,
  deterministic backfill, and restrictive constraint validation are complete.

## Rollback boundary

Before production authentication writes, S12 may remain inert while the old
application continues unchanged. After a canonical identity or session context is
used to grant production access, destructive rollback is forbidden; disable the
future authentication gate and ship a forward-fix instead.

## Retained blockers

No canonical identity resolver, server session resolver, TenantContext, route
protection, permission seed, RLS, tenant provisioning, runtime hydration, provider
activation, or PostgreSQL cutover is included. Memory remains active and
authoritative; PostgreSQL remains passive.
