/*
 * PostgreSQL persistence adapter — passive provider implementation.
 *
 * This adapter exposes truthful async contracts and provider health, but it is
 * NOT active in storage-manager. Memory remains the only authoritative runtime
 * provider until a later cutover stage explicitly activates PostgreSQL.
 */

import { ADAPTER_CAPABILITIES, type HealthReporting } from "@/db/config/adapter-contract";
import type { DatabaseHealth } from "@/db/config/connection-contract";
import { CanonicalPgReadClient } from "@/features/canonical-read/pg-read-client";
import { createEmitter } from "./persistence-events";
import { recordOperation } from "./persistence-history";
import { trackOperation } from "./persistence-telemetry";
import type { PersistenceAdapter } from "./adapter";
import type {
  PersistedEntity,
  PersistenceCollection,
  PersistenceContext,
  PersistenceOperation,
  ProviderCapabilityManifest,
} from "./types";

const OP_COST_MS: Record<PersistenceOperation, number> = {
  load: 4,
  save: 4,
  create: 2,
  update: 2,
  delete: 2,
  restore: 2,
  archive: 2,
  exists: 2,
  list: 2,
  find: 2,
  clear: 2,
  transaction: 2,
};

let operationSequence = 0;

export const PERSISTENCE_POSTGRES_DATABASE_URL_ENV =
  "HEBUN_PERSISTENCE_POSTGRES_DATABASE_URL";
export const PERSISTENCE_POSTGRES_ALLOW_REMOTE_ENV =
  "HEBUN_PERSISTENCE_POSTGRES_ALLOW_REMOTE";

export interface PostgresAdapterConfig<T> {
  readonly collection: PersistenceCollection;
  readonly seed: () => T[];
  readonly env?: NodeJS.ProcessEnv;
}

class UnsupportedPostgresPersistenceOperationError extends Error {
  readonly provider = "postgres";
  readonly code = "PERSISTENCE_OPERATION_UNSUPPORTED";

  constructor(
    readonly collection: PersistenceCollection,
    readonly operation: PersistenceOperation,
  ) {
    super(
      `PostgreSQL provider is registered in passive mode and does not support ${operation} for collection "${collection}".`,
    );
    this.name = "UnsupportedPostgresPersistenceOperationError";
  }
}

function buildPostgresManifest(
  collection: PersistenceCollection,
): ProviderCapabilityManifest {
  return {
    supportedCollections: [],
    unsupportedCollections: [collection],
    readableCollections: [],
    writableCollections: [],
    transactional: false,
    tenantIsolation: false,
    softDelete: false,
    optimisticVersioning: false,
  };
}

function createPostgresHealthClient(
  env: NodeJS.ProcessEnv = process.env,
): CanonicalPgReadClient | undefined {
  const connectionString = env[PERSISTENCE_POSTGRES_DATABASE_URL_ENV];
  if (!connectionString) return undefined;

  return new CanonicalPgReadClient({
    connectionString,
    allowRemote: env[PERSISTENCE_POSTGRES_ALLOW_REMOTE_ENV] === "true",
    statementTimeoutMs: 5000,
    connectionTimeoutMs: 2000,
    idleTimeoutMs: 1000,
    appName: "hebun-persistence-postgres",
  });
}

export class SupabasePostgresAdapter<T extends PersistedEntity>
  implements PersistenceAdapter<T>, HealthReporting
{
  readonly provider = "postgres";
  readonly collection: PersistenceCollection;
  readonly contractVersion = "async";
  readonly manifest: ProviderCapabilityManifest;
  readonly capabilities = ADAPTER_CAPABILITIES;
  private readonly emitter = createEmitter();
  private readonly healthClient?: CanonicalPgReadClient;

  constructor(config: PostgresAdapterConfig<T>) {
    this.collection = config.collection;
    this.manifest = buildPostgresManifest(config.collection);
    this.healthClient = createPostgresHealthClient(config.env);
  }

  private audit(operation: PersistenceOperation): void {
    operationSequence += 1;
    const durationMs = OP_COST_MS[operation];
    recordOperation({
      operationId: `pg_op_${String(operationSequence).padStart(6, "0")}`,
      provider: this.provider,
      collection: this.collection,
      operation,
      timestamp: new Date().toISOString(),
      durationMs,
      result: "ok",
    });
    trackOperation(operation, durationMs);
  }

  private unsupported(
    operation: PersistenceOperation,
  ): UnsupportedPostgresPersistenceOperationError {
    this.audit(operation);
    return new UnsupportedPostgresPersistenceOperationError(
      this.collection,
      operation,
    );
  }

  async load(_context?: PersistenceContext): Promise<T[]> {
    throw this.unsupported("load");
  }

  async save(_records: T[], _context?: PersistenceContext): Promise<void> {
    throw this.unsupported("save");
  }

  async create(_record: T, _context?: PersistenceContext): Promise<T> {
    throw this.unsupported("create");
  }

  async update(
    _id: string,
    _patch: Partial<T>,
    _context?: PersistenceContext,
  ): Promise<T | undefined> {
    throw this.unsupported("update");
  }

  async delete(
    _id: string,
    _context?: PersistenceContext,
  ): Promise<T | undefined> {
    throw this.unsupported("delete");
  }

  async restore(
    _id: string,
    _context?: PersistenceContext,
  ): Promise<T | undefined> {
    throw this.unsupported("restore");
  }

  async archive(
    _id: string,
    _context?: PersistenceContext,
  ): Promise<T | undefined> {
    throw this.unsupported("archive");
  }

  async exists(_id: string, _context?: PersistenceContext): Promise<boolean> {
    throw this.unsupported("exists");
  }

  async list(_context?: PersistenceContext): Promise<T[]> {
    throw this.unsupported("list");
  }

  async find(
    _predicate: (record: T) => boolean,
    _context?: PersistenceContext,
  ): Promise<T[]> {
    throw this.unsupported("find");
  }

  async clear(_context?: PersistenceContext): Promise<void> {
    throw this.unsupported("clear");
  }

  subscribe(listener: () => void): () => void {
    return this.emitter.subscribe(listener);
  }

  getSnapshot(): T[] {
    return [];
  }

  async transaction<R>(
    _work: (adapter: PersistenceAdapter<T>) => Promise<R>,
  ): Promise<R> {
    throw this.unsupported("transaction");
  }

  async health(): Promise<DatabaseHealth> {
    if (!this.healthClient) {
      return {
        ok: false,
        provider: this.provider,
        latencyMs: 0,
        checkedAt: new Date().toISOString(),
      };
    }

    const availability = await this.healthClient.availability();
    return {
      ok: availability.available,
      provider: this.provider,
      latencyMs: availability.latencyMs ?? 0,
      checkedAt: availability.checkedAt ?? new Date().toISOString(),
    };
  }
}

export function createPostgresAdapter<T extends PersistedEntity>(
  config: PostgresAdapterConfig<T>,
): PersistenceAdapter<T> & HealthReporting {
  return new SupabasePostgresAdapter(config);
}
