/*
 * platform-core / actor — canonical actor reference (Identity §3.9, Spec 48 §7.9).
 *
 * The unifying abstraction behind every mutation's createdBy / updatedBy and
 * every "who is acting" question. This is a CONTRACT ONLY:
 *   - no runtime identity lookup in this phase;
 *   - no database writes; no permission checks;
 *   - it does NOT replace the existing createdBy/updatedBy uuid columns yet
 *     (that FK wiring is deferred to migration stage S2).
 *
 * An actor reference resolves to exactly one accountable actor of a known type.
 */

/** The four accountable actor kinds (Identity §3.9). */
export type ActorType = "human" | "agent" | "system" | "service";

/** How an actor reference entered the system (mirrors commandSourceEnum values). */
export type ActorSource = "ui" | "voice" | "system" | "scheduler" | "api";

/**
 * Canonical actor reference. `actorId` points at the id of the underlying
 * record for its `actorType` (users.id | agents.id | a system/service account
 * id). `tenantId` is present for tenant-scoped actors and omitted for global
 * ones (e.g. a platform system account). Additive metadata only.
 */
export interface ActorReference {
  readonly actorType: ActorType;
  readonly actorId: string;
  /** Present for tenant-scoped actors; omitted for platform-global system actors. */
  readonly tenantId?: string;
  /** Human-facing label for display/audit; never authoritative for authorization. */
  readonly displayLabel?: string;
  /** Channel/source the action arrived through. */
  readonly source?: ActorSource;
  /** Optional non-authoritative metadata (e.g. delegation ref, session id). */
  readonly metadata?: Readonly<Record<string, unknown>>;
}
