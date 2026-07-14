/*
 * Persistence layer — types.
 *
 * The data layer is split from the application layer. Services and repositories
 * never know whether records live in memory, Supabase, Postgres, SQLite, Redis,
 * or a future cloud store. Only adapters know. This file defines the shared
 * contract every adapter obeys.
 */

export type LifecycleStatus = "active" | "archived" | "deleted";

/** Minimum shape a persisted record must have to support lifecycle operations. */
export interface PersistedEntity {
  id: string;
  lifecycleStatus: LifecycleStatus;
}

export type PersistenceOperation =
  | "load"
  | "save"
  | "create"
  | "update"
  | "delete"
  | "restore"
  | "archive"
  | "exists"
  | "list"
  | "find"
  | "clear"
  | "transaction";

export type PersistenceCollection =
  | "agents"
  | "workflows"
  | "memories"
  | "knowledge-nodes"
  | "knowledge-edges"
  | "registries"
  | "__provider_registry__"
  | (string & {});

export interface PersistenceContext {
  readonly tenantId?: string;
  readonly actorId?: string;
  readonly correlationId?: string;
  readonly causationId?: string;
}

export interface ProviderCapabilityManifest {
  readonly supportedCollections: readonly PersistenceCollection[];
  readonly unsupportedCollections: readonly PersistenceCollection[];
  readonly readableCollections: readonly PersistenceCollection[];
  readonly writableCollections: readonly PersistenceCollection[];
  readonly transactional: boolean;
  readonly tenantIsolation: boolean;
  readonly softDelete: boolean;
  readonly optimisticVersioning: boolean;
}

/** Audit record for a single persistence operation. */
export interface PersistenceOperationRecord {
  operationId: string;
  provider: string;
  collection: string;
  operation: PersistenceOperation;
  timestamp: string;
  durationMs: number;
  result: "ok" | "error";
}

export type PersistenceProviderKey =
  | "memory"
  | "postgres"
  | "supabase"
  | "sqlite"
  | "redis";

export type PersistenceProviderRegistrationStatus = "active" | "available";

export interface PersistenceProviderHealth {
  readonly state: "healthy" | "unconfigured" | "unavailable";
  readonly provider: string;
  readonly checkedAt?: string;
  readonly latencyMs?: number;
  readonly detail?: string;
}

export interface PersistenceProviderDescriptor {
  readonly key: PersistenceProviderKey;
  readonly label: string;
  readonly status: PersistenceProviderRegistrationStatus;
  readonly active: boolean;
  readonly capabilities: readonly string[];
  readonly collections: readonly string[];
  readonly manifest?: ProviderCapabilityManifest;
  readonly health: PersistenceProviderHealth;
}
