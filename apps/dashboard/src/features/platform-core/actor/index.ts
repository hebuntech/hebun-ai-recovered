/*
 * platform-core / actor — barrel.
 * Canonical actor reference contract (Identity §3.9). Contract + helpers only;
 * no identity lookup, no DB, no permission logic in this phase.
 */
export type { ActorType, ActorSource, ActorReference } from "./types";
export {
  isActorType,
  makeActorReference,
  actorRefKey,
  isMachineActor,
} from "./actor-reference";
export { ACTOR_SOURCE_TABLE, actorTypeIsResolvable } from "./actor-resolution";
