/*
 * platform-core / audit — canonical immutable audit contract (Spec 48 §7.3).
 *
 * Every significant mutation, in every domain, is expected to write ONE
 * append-only audit record, transactional with the mutation. This file defines
 * the canonical record shape only. It does NOT:
 *   - replace the existing command_audit store (features/persistence, schema);
 *   - change Command Bus audit behavior;
 *   - implement a sink, a writer, or any persistence.
 *
 * The generalized audit sink (generalizing command_audit) is built in stage S3.
 */

import type { ActorReference } from "../actor";

/** The disposition of the audited action. */
export type AuditResult = "committed" | "rejected" | "rolled-back";

/**
 * A single immutable audit record. `previousState` / `nextState` are opaque
 * snapshots (domain-defined); they are not interpreted here.
 */
export interface AuditRecord {
  readonly auditId: string;
  readonly tenantId?: string;
  /** The accountable actor for the mutation (canonical actor reference). */
  readonly actorRef: ActorReference;
  /** Verb of the mutation, e.g. "create", "ratify", "promote", "transition". */
  readonly action: string;
  /** Domain entity kind, e.g. "command", "mission", "policy". */
  readonly entityType: string;
  readonly entityId: string;
  /** Threads this record through its run and lineage. */
  readonly correlationId?: string;
  /** The event/action that caused this one, if any. */
  readonly causationId?: string;
  readonly timestamp: string;
  readonly previousState?: unknown;
  readonly nextState?: unknown;
  readonly metadata?: Readonly<Record<string, unknown>>;
  readonly result: AuditResult;
  /** True when produced under a non-live posture (no real effect occurred). */
  readonly simulation: boolean;
  /** Channel/source, mirroring commandSourceEnum values. */
  readonly source?: string;
}
