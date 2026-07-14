/*
 * platform-core / actor — deterministic actor-resolution CONTRACT (S5).
 *
 * Declares WHICH source table an actor type resolves against, so a future
 * resolver service can turn a canonical (actorType, actorId) pair into a concrete
 * record deterministically. This is DECLARATION ONLY:
 *   - no runtime lookup, no DB, no query;
 *   - no generic `actors` table (the polymorphic pair + this map suffice);
 *   - no cross-table polymorphic foreign keys.
 *
 * Resolution model (Identity §3.9):
 *   human   → users.id
 *   agent   → agents.id
 *   system  → a stable platform-managed UUID (no row created this phase)
 *   service → a stable service-identity UUID (no row created this phase)
 */

import type { ActorType } from "./types";

/** Source table an actor type resolves against, or null for machine actors that
 *  have no domain row in this phase (system/service). */
export const ACTOR_SOURCE_TABLE: Readonly<Record<ActorType, string | null>> = {
  human: "users",
  agent: "agents",
  system: null,
  service: null,
};

/** True when an actor type resolves to a concrete domain table row. */
export function actorTypeIsResolvable(actorType: ActorType): boolean {
  return ACTOR_SOURCE_TABLE[actorType] !== null;
}
