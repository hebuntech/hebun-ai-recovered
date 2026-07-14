/*
 * platform-core / actor — construction + narrowing helpers for ActorReference.
 *
 * Pure, side-effect-free. No identity lookup, no DB, no permission logic — those
 * belong to the Identity domain (wired in a later stage). These helpers only
 * build and inspect the canonical contract shape.
 */

import type { ActorReference, ActorSource, ActorType } from "./types";

const ACTOR_TYPES: readonly ActorType[] = ["human", "agent", "system", "service"];

/** True when `t` is one of the four canonical actor types. */
export function isActorType(t: string): t is ActorType {
  return (ACTOR_TYPES as readonly string[]).includes(t);
}

/** Build a canonical actor reference. No lookup — the caller supplies resolved ids. */
export function makeActorReference(input: {
  actorType: ActorType;
  actorId: string;
  tenantId?: string;
  displayLabel?: string;
  source?: ActorSource;
  metadata?: Record<string, unknown>;
}): ActorReference {
  return {
    actorType: input.actorType,
    actorId: input.actorId,
    tenantId: input.tenantId,
    displayLabel: input.displayLabel,
    source: input.source,
    metadata: input.metadata,
  };
}

/** A stable string key for an actor reference (for audit/event keys, not auth). */
export function actorRefKey(ref: ActorReference): string {
  return `${ref.actorType}:${ref.actorId}`;
}

/** True when the reference is a non-human machine actor (system or service). */
export function isMachineActor(ref: ActorReference): boolean {
  return ref.actorType === "system" || ref.actorType === "service";
}
