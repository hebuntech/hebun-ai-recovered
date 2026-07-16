/* Passive PostgreSQL persistence foundation. Only registries are supported. */
import { Pool, type PoolClient, type QueryResult } from "pg";
import type { HealthReporting } from "@/db/config/adapter-contract";
import type { DatabaseHealth } from "@/db/config/connection-contract";
import type { KnowledgeNodeRecord } from "@/features/knowledge-crud/types";
import type { RegistryCrudRecord } from "@/features/registry-crud/types";
import type { PersistenceAdapter } from "./adapter";
import { createEmitter, type Emitter } from "./persistence-events";
import { recordOperation } from "./persistence-history";
import { trackOperation } from "./persistence-telemetry";
import {
  decodeKnowledgeNodeRow,
  decodeKnowledgeNodeRows,
  encodeKnowledgeNodeRecord,
  type KnowledgeNodePostgresRow,
  type KnowledgeNodePostgresWriteRow,
} from "./knowledge-node-postgres-codec";
import {
  PostgresPersistenceError,
  postgresPersistenceError,
} from "./postgres-errors";
import {
  decodeRegistryRow,
  encodeRegistryRecord,
  type RegistryPostgresRow,
  type RegistryPostgresWriteRow,
} from "./registry-postgres-codec";
import type {
  PersistedEntity,
  PersistenceCollection,
  PersistenceContext,
  PersistenceOperation,
  ProviderCapabilityManifest,
} from "./types";

const LOCAL_HOSTS = new Set(["localhost", "127.0.0.1", "::1"]);
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SUPPORTED_COLLECTIONS: readonly PersistenceCollection[] = [
  "registries",
  "knowledge-nodes",
];
const KNOWN_UNSUPPORTED_COLLECTIONS: readonly PersistenceCollection[] = [
  "agents",
  "workflows",
  "memories",
  "knowledge-edges",
  "knowledge-relationships",
  "__provider_registry__",
];
const REGISTRY_SELECT = `
  select id, tenant_id, slug, title, description, owner, health,
         total_records, lifecycle_status, created_at, updated_at
    from registries
   where tenant_id = $1
   order by slug asc`;
const KNOWLEDGE_NODE_SELECT = `
  select id, tenant_id, ref_id, type, label, statement, provenance,
         lifecycle_status, created_at, updated_at
    from knowledge_nodes
   where tenant_id = $1
   order by ref_id asc nulls last, id asc`;

let operationSequence = 0;

export const PERSISTENCE_POSTGRES_DATABASE_URL_ENV =
  "HEBUN_PERSISTENCE_POSTGRES_DATABASE_URL";
export const PERSISTENCE_POSTGRES_ALLOW_REMOTE_ENV =
  "HEBUN_PERSISTENCE_POSTGRES_ALLOW_REMOTE";
export const POSTGRES_PERSISTENCE_CAPABILITIES = [
  "load",
  "save",
  "create",
  "update",
  "archive",
  "restore",
  "delete",
  "exists",
  "find",
  "list",
  "clear",
  "transaction",
  "snapshot",
  "subscription",
  "tenant-context-required",
  "health",
] as const;
export const POSTGRES_REGISTRY_CAPABILITIES = POSTGRES_PERSISTENCE_CAPABILITIES;

export interface PostgresAdapterConfig<T> {
  readonly collection: PersistenceCollection;
  readonly seed: () => T[];
  readonly env?: NodeJS.ProcessEnv;
}

interface SnapshotState<T> {
  records: T[];
  tenantId?: string;
  emitter: Emitter;
}

interface TransactionInternals<T> {
  readonly pool: Pool;
  readonly client: PoolClient;
  readonly snapshot: SnapshotState<T>;
}

function buildPostgresManifest(
  collection: PersistenceCollection,
): ProviderCapabilityManifest {
  if (!SUPPORTED_COLLECTIONS.includes(collection)) {
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
  return {
    supportedCollections: SUPPORTED_COLLECTIONS,
    unsupportedCollections: KNOWN_UNSUPPORTED_COLLECTIONS,
    readableCollections: SUPPORTED_COLLECTIONS,
    writableCollections: SUPPORTED_COLLECTIONS,
    transactional: true,
    tenantIsolation: false,
    softDelete: true,
    optimisticVersioning: false,
  };
}

function immutableRecords<T>(records: T[]): T[] {
  return deepFreeze(structuredClone(records));
}

function deepFreeze<T>(value: T, seen = new WeakSet<object>()): T {
  if (value === null || typeof value !== "object" || seen.has(value)) return value;
  seen.add(value);
  for (const child of Object.values(value)) deepFreeze(child, seen);
  return Object.freeze(value);
}

export class SupabasePostgresAdapter<T extends PersistedEntity>
  implements PersistenceAdapter<T>, HealthReporting
{
  readonly provider = "postgres";
  readonly collection: PersistenceCollection;
  readonly contractVersion = "async";
  readonly manifest: ProviderCapabilityManifest;
  readonly capabilities: readonly string[];

  private readonly env: NodeJS.ProcessEnv;
  private readonly snapshot: SnapshotState<T>;
  private pool?: Pool;
  private readonly transactionClient?: PoolClient;
  private transactionTenantId?: string;
  private transactionMutated = false;

  constructor(
    config: PostgresAdapterConfig<T>,
    internals?: TransactionInternals<T>,
  ) {
    this.collection = config.collection;
    this.env = config.env ?? process.env;
    this.manifest = buildPostgresManifest(config.collection);
    this.capabilities =
      SUPPORTED_COLLECTIONS.includes(config.collection)
        ? POSTGRES_PERSISTENCE_CAPABILITIES
        : ["health"];
    this.snapshot = internals?.snapshot ?? {
      records: [],
      emitter: createEmitter(),
    };
    this.pool = internals?.pool;
    this.transactionClient = internals?.client;
  }

  private audit(
    operation: PersistenceOperation,
    result: "ok" | "error",
    startedAt: number,
  ): void {
    operationSequence += 1;
    const durationMs = Math.max(0, Date.now() - startedAt);
    recordOperation({
      operationId: `pg_op_${String(operationSequence).padStart(6, "0")}`,
      provider: this.provider,
      collection: this.collection,
      operation,
      timestamp: new Date().toISOString(),
      durationMs,
      result,
    });
    trackOperation(operation, durationMs);
  }

  private ensureSupported(operation: PersistenceOperation): void {
    if (SUPPORTED_COLLECTIONS.includes(this.collection)) return;
    throw postgresPersistenceError({
      code: "PERSISTENCE_COLLECTION_UNSUPPORTED",
      collection: this.collection,
      operation,
      detail: `PostgreSQL persistence does not support collection "${this.collection}".`,
    });
  }

  private requireTenant(
    context: PersistenceContext | undefined,
    operation: PersistenceOperation,
  ): string {
    this.ensureSupported(operation);
    const tenantId = context?.tenantId;
    if (!tenantId) {
      throw postgresPersistenceError({
        code: "PERSISTENCE_TENANT_REQUIRED",
        collection: this.collection,
        operation,
        detail: `PostgreSQL ${this.collection} operations require PersistenceContext.tenantId.`,
      });
    }
    if (!UUID_PATTERN.test(tenantId)) {
      throw postgresPersistenceError({
        code: "PERSISTENCE_INVALID_RECORD_MAPPING",
        collection: this.collection,
        operation,
        detail: `PostgreSQL ${this.collection} tenantId must be a UUID.`,
      });
    }
    if (this.transactionClient) {
      if (this.transactionTenantId && this.transactionTenantId !== tenantId) {
        throw postgresPersistenceError({
          code: "PERSISTENCE_TENANT_MISMATCH",
          collection: this.collection,
          operation,
          detail: "A PostgreSQL transaction cannot cross tenant boundaries.",
        });
      }
      this.transactionTenantId = tenantId;
    }
    return tenantId;
  }

  private connectionString(): string {
    const connectionString = this.env[PERSISTENCE_POSTGRES_DATABASE_URL_ENV];
    if (!connectionString) {
      throw postgresPersistenceError({
        code: "PERSISTENCE_POSTGRES_UNAVAILABLE",
        collection: this.collection,
        detail: `${PERSISTENCE_POSTGRES_DATABASE_URL_ENV} is not configured.`,
      });
    }
    try {
      const target = new URL(connectionString);
      if (
        this.env[PERSISTENCE_POSTGRES_ALLOW_REMOTE_ENV] !== "true" &&
        !LOCAL_HOSTS.has(target.hostname)
      ) {
        throw new Error("remote target disabled");
      }
    } catch {
      throw postgresPersistenceError({
        code: "PERSISTENCE_POSTGRES_UNAVAILABLE",
        collection: this.collection,
        detail: "PostgreSQL persistence target is invalid or disallowed.",
      });
    }
    return connectionString;
  }

  private getPool(): Pool {
    if (this.pool) return this.pool;
    this.pool = new Pool({
      connectionString: this.connectionString(),
      max: 2,
      idleTimeoutMillis: 1000,
      connectionTimeoutMillis: 2000,
      application_name: "hebun-persistence-postgres",
    });
    return this.pool;
  }

  private async withClient<R>(work: (client: PoolClient) => Promise<R>): Promise<R> {
    if (this.transactionClient) return work(this.transactionClient);
    const client = await this.getPool().connect();
    try {
      return await work(client);
    } finally {
      client.release();
    }
  }

  private mapError(
    error: unknown,
    operation: PersistenceOperation,
  ): PostgresPersistenceError {
    if (error instanceof PostgresPersistenceError) return error;
    const pgCode = (error as { code?: unknown } | null)?.code;
    if (pgCode === "23505") {
      return postgresPersistenceError({
        code: "PERSISTENCE_LOGICAL_ID_CONFLICT",
        collection: this.collection,
        operation,
        detail: `A ${this.collection} record with this logical id already exists for the tenant.`,
      });
    }
    if (pgCode === "22P02" || pgCode === "23503" || pgCode === "23514") {
      return postgresPersistenceError({
        code: "PERSISTENCE_INVALID_RECORD_MAPPING",
        collection: this.collection,
        operation,
        detail: `PostgreSQL rejected the ${this.collection} record mapping.`,
      });
    }
    return postgresPersistenceError({
      code: "PERSISTENCE_POSTGRES_UNAVAILABLE",
      collection: this.collection,
      operation,
      detail: "PostgreSQL persistence operation failed.",
    });
  }

  private decodeRows(
    rows: RegistryPostgresRow[] | KnowledgeNodePostgresRow[],
    tenantId: string,
  ): T[] {
    if (this.collection === "knowledge-nodes") {
      return decodeKnowledgeNodeRows(
        rows as KnowledgeNodePostgresRow[],
        tenantId,
      ) as unknown as T[];
    }
    return (rows as RegistryPostgresRow[]).map(
      (row) => decodeRegistryRow(row, tenantId) as unknown as T,
    );
  }

  private async readRows(client: PoolClient, tenantId: string): Promise<T[]> {
    if (this.collection === "knowledge-nodes") {
      const result = await client.query<KnowledgeNodePostgresRow>(
        KNOWLEDGE_NODE_SELECT,
        [tenantId],
      );
      return this.decodeRows(result.rows, tenantId);
    }
    const result = await client.query<RegistryPostgresRow>(REGISTRY_SELECT, [tenantId]);
    return this.decodeRows(result.rows, tenantId);
  }

  private replaceSnapshot(records: T[], tenantId: string): void {
    this.snapshot.records = immutableRecords(records);
    this.snapshot.tenantId = tenantId;
    this.snapshot.emitter.emit();
  }

  private async runRead<R>(
    operation: PersistenceOperation,
    context: PersistenceContext | undefined,
    work: (client: PoolClient, tenantId: string) => Promise<R>,
  ): Promise<R> {
    const startedAt = Date.now();
    try {
      const tenantId = this.requireTenant(context, operation);
      const result = await this.withClient((client) => work(client, tenantId));
      this.audit(operation, "ok", startedAt);
      return result;
    } catch (error) {
      this.audit(operation, "error", startedAt);
      throw this.mapError(error, operation);
    }
  }

  private async runMutation<R>(
    operation: PersistenceOperation,
    context: PersistenceContext | undefined,
    work: (client: PoolClient, tenantId: string) => Promise<R>,
  ): Promise<R> {
    const startedAt = Date.now();
    try {
      const tenantId = this.requireTenant(context, operation);
      if (this.transactionClient) {
        const result = await work(this.transactionClient, tenantId);
        this.transactionMutated = true;
        this.audit(operation, "ok", startedAt);
        return result;
      }

      const client = await this.getPool().connect();
      try {
        await client.query("begin");
        await client.query("select set_config('statement_timeout', $1, true)", ["5000"]);
        const result = await work(client, tenantId);
        const next = await this.readRows(client, tenantId);
        await client.query("commit");
        this.replaceSnapshot(next, tenantId);
        this.audit(operation, "ok", startedAt);
        return result;
      } catch (error) {
        try {
          await client.query("rollback");
        } catch {
          // Preserve the original operation failure.
        }
        throw error;
      } finally {
        client.release();
      }
    } catch (error) {
      this.audit(operation, "error", startedAt);
      throw this.mapError(error, operation);
    }
  }

  private async insertRow(
    client: PoolClient,
    row: RegistryPostgresWriteRow,
  ): Promise<RegistryCrudRecord> {
    const result = await client.query<RegistryPostgresRow>(
      `insert into registries
        (tenant_id, slug, title, description, owner, health, total_records,
         lifecycle_status, created_at, updated_at)
       values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       returning id, tenant_id, slug, title, description, owner, health,
                 total_records, lifecycle_status, created_at, updated_at`,
      [
        row.tenantId,
        row.slug,
        row.title,
        row.description,
        row.owner,
        row.health,
        row.totalRecords,
        row.lifecycleStatus,
        row.createdAt,
        row.updatedAt,
      ],
    );
    return decodeRegistryRow(result.rows[0]!, row.tenantId);
  }

  private async insertKnowledgeNodeRow(
    client: PoolClient,
    row: KnowledgeNodePostgresWriteRow,
  ): Promise<KnowledgeNodeRecord> {
    const conflict = await client.query<{ exists: boolean }>(
      `select exists(
         select 1 from knowledge_nodes where tenant_id = $1 and ref_id = $2
       ) as exists`,
      [row.tenantId, row.refId],
    );
    if (conflict.rows[0]?.exists) {
      throw postgresPersistenceError({
        code: "PERSISTENCE_LOGICAL_ID_CONFLICT",
        collection: this.collection,
        operation: "create",
        detail: `Knowledge node "${row.refId}" already exists for the tenant.`,
      });
    }
    const result = await client.query<KnowledgeNodePostgresRow>(
      `insert into knowledge_nodes
        (tenant_id, ref_id, type, label, statement, provenance,
         lifecycle_status, created_at, updated_at)
       values ($1, $2, $3, $4, $5, $6::jsonb, $7, $8, $9)
       returning id, tenant_id, ref_id, type, label, statement, provenance,
                 lifecycle_status, created_at, updated_at`,
      [
        row.tenantId,
        row.refId,
        row.type,
        row.label,
        row.statement,
        JSON.stringify(row.provenancePatch),
        row.lifecycleStatus,
        row.createdAt,
        row.updatedAt,
      ],
    );
    return decodeKnowledgeNodeRow(result.rows[0]!, row.tenantId);
  }

  private async updateKnowledgeNodeRow(
    client: PoolClient,
    row: KnowledgeNodePostgresWriteRow,
  ): Promise<KnowledgeNodeRecord> {
    const result = await client.query<KnowledgeNodePostgresRow>(
      `update knowledge_nodes
          set type = $3,
              label = $4,
              statement = $5,
              provenance = coalesce(provenance, '{}'::jsonb) || $6::jsonb,
              lifecycle_status = $7::lifecycle_status,
              deleted_at = case when $7::text = 'deleted' then coalesce(deleted_at, now()) else null end,
              updated_at = $8
        where tenant_id = $1 and ref_id = $2
        returning id, tenant_id, ref_id, type, label, statement, provenance,
                  lifecycle_status, created_at, updated_at`,
      [
        row.tenantId,
        row.refId,
        row.type,
        row.label,
        row.statement,
        JSON.stringify(row.provenancePatch),
        row.lifecycleStatus,
        row.updatedAt,
      ],
    );
    if (!result.rows[0]) throw this.notFound("update", row.refId);
    return decodeKnowledgeNodeRow(result.rows[0], row.tenantId);
  }

  async load(context?: PersistenceContext): Promise<T[]> {
    const records = await this.runRead("load", context, (client, tenantId) =>
      this.readRows(client, tenantId),
    );
    if (!this.transactionClient) {
      this.replaceSnapshot(records, context!.tenantId!);
    }
    return immutableRecords(records);
  }

  async save(records: T[], context?: PersistenceContext): Promise<void> {
    await this.runMutation("save", context, async (client, tenantId) => {
      if (this.collection === "knowledge-nodes") {
        const encoded = records.map((record) =>
          encodeKnowledgeNodeRecord(
            record as unknown as KnowledgeNodeRecord,
            tenantId,
          ),
        );
        const ids = new Set<string>();
        for (const row of encoded) {
          if (ids.has(row.refId)) {
            throw postgresPersistenceError({
              code: "PERSISTENCE_LOGICAL_ID_CONFLICT",
              collection: this.collection,
              operation: "save",
              detail: `Duplicate knowledge node logical id "${row.refId}" exists in the save input.`,
            });
          }
          ids.add(row.refId);
        }

        await this.readRows(client, tenantId);
        if (encoded.length === 0) {
          await client.query("delete from knowledge_nodes where tenant_id = $1", [
            tenantId,
          ]);
        } else {
          await client.query(
            "delete from knowledge_nodes where tenant_id = $1 and not (ref_id = any($2::text[]))",
            [tenantId, encoded.map((row) => row.refId)],
          );
        }
        for (const row of encoded) {
          const existing = await this.findKnowledgeNodeRowById(
            client,
            tenantId,
            row.refId,
          );
          if (existing) await this.updateKnowledgeNodeRow(client, row);
          else await this.insertKnowledgeNodeRow(client, row);
        }
        return;
      }
      const encoded = records.map((record) =>
        encodeRegistryRecord(record as unknown as RegistryCrudRecord, tenantId),
      );
      await client.query("delete from registries where tenant_id = $1", [tenantId]);
      for (const row of encoded) await this.insertRow(client, row);
    });
  }

  async create(record: T, context?: PersistenceContext): Promise<T> {
    return this.runMutation("create", context, async (client, tenantId) => {
      if (this.collection === "knowledge-nodes") {
        const row = encodeKnowledgeNodeRecord(
          record as unknown as KnowledgeNodeRecord,
          tenantId,
        );
        return (await this.insertKnowledgeNodeRow(client, row)) as unknown as T;
      }
      const row = encodeRegistryRecord(
        record as unknown as RegistryCrudRecord,
        tenantId,
      );
      return (await this.insertRow(client, row)) as unknown as T;
    });
  }

  async update(
    id: string,
    patch: Partial<T>,
    context?: PersistenceContext,
  ): Promise<T | undefined> {
    return this.runMutation("update", context, async (client, tenantId) => {
      if (this.collection === "knowledge-nodes") {
        const current = await this.findKnowledgeNodeRowById(client, tenantId, id);
        if (!current) throw this.notFound("update", id);
        const merged = {
          ...decodeKnowledgeNodeRow(current, tenantId),
          ...(patch as Partial<KnowledgeNodeRecord>),
          id,
          updatedAt:
            (patch as Partial<KnowledgeNodeRecord>).updatedAt ??
            new Date().toISOString(),
        } satisfies KnowledgeNodeRecord;
        const row = encodeKnowledgeNodeRecord(merged, tenantId);
        return (await this.updateKnowledgeNodeRow(client, row)) as unknown as T;
      }
      const current = await this.findRowById(client, tenantId, id);
      if (!current) throw this.notFound("update", id);
      const merged = {
        ...decodeRegistryRow(current, tenantId),
        ...(patch as Partial<RegistryCrudRecord>),
        id,
        updatedAt:
          (patch as Partial<RegistryCrudRecord>).updatedAt ?? new Date().toISOString(),
      } satisfies RegistryCrudRecord;
      const row = encodeRegistryRecord(merged, tenantId);
      const result = await client.query<RegistryPostgresRow>(
        `update registries
            set title = $3, description = $4, owner = $5, health = $6,
                total_records = $7, lifecycle_status = $8, updated_at = $9
          where tenant_id = $1 and slug = $2
          returning id, tenant_id, slug, title, description, owner, health,
                    total_records, lifecycle_status, created_at, updated_at`,
        [
          tenantId,
          id,
          row.title,
          row.description,
          row.owner,
          row.health,
          row.totalRecords,
          row.lifecycleStatus,
          row.updatedAt,
        ],
      );
      return decodeRegistryRow(result.rows[0]!, tenantId) as unknown as T;
    });
  }

  async delete(id: string, context?: PersistenceContext): Promise<T | undefined> {
    return this.setLifecycle("delete", id, "deleted", context);
  }

  async restore(id: string, context?: PersistenceContext): Promise<T | undefined> {
    return this.setLifecycle("restore", id, "active", context);
  }

  async archive(id: string, context?: PersistenceContext): Promise<T | undefined> {
    return this.setLifecycle("archive", id, "archived", context);
  }

  private async setLifecycle(
    operation: Extract<PersistenceOperation, "delete" | "restore" | "archive">,
    id: string,
    status: "active" | "archived" | "deleted",
    context?: PersistenceContext,
  ): Promise<T> {
    return this.runMutation(operation, context, async (client, tenantId) => {
      if (this.collection === "knowledge-nodes") {
        const result = await client.query<KnowledgeNodePostgresRow>(
          `update knowledge_nodes
              set lifecycle_status = $3::lifecycle_status,
                  deleted_at = case when $3::text = 'deleted' then now() else null end,
                  updated_at = now()
            where tenant_id = $1 and ref_id = $2
            returning id, tenant_id, ref_id, type, label, statement, provenance,
                      lifecycle_status, created_at, updated_at`,
          [tenantId, id, status],
        );
        if (!result.rows[0]) throw this.notFound(operation, id);
        return decodeKnowledgeNodeRow(result.rows[0], tenantId) as unknown as T;
      }
      const result = await client.query<RegistryPostgresRow>(
        `update registries
            set lifecycle_status = $3::lifecycle_status,
                deleted_at = case when $3::text = 'deleted' then now() else null end,
                updated_at = now()
          where tenant_id = $1 and slug = $2
          returning id, tenant_id, slug, title, description, owner, health,
                    total_records, lifecycle_status, created_at, updated_at`,
        [tenantId, id, status],
      );
      if (!result.rows[0]) throw this.notFound(operation, id);
      return decodeRegistryRow(result.rows[0], tenantId) as unknown as T;
    });
  }

  async exists(id: string, context?: PersistenceContext): Promise<boolean> {
    return this.runRead("exists", context, async (client, tenantId) => {
      if (this.collection === "knowledge-nodes") {
        const result = await client.query<{ exists: boolean }>(
          "select exists(select 1 from knowledge_nodes where tenant_id = $1 and ref_id = $2) as exists",
          [tenantId, id],
        );
        return result.rows[0]?.exists ?? false;
      }
      const result = await client.query<{ exists: boolean }>(
        "select exists(select 1 from registries where tenant_id = $1 and slug = $2) as exists",
        [tenantId, id],
      );
      return result.rows[0]?.exists ?? false;
    });
  }

  async list(context?: PersistenceContext): Promise<T[]> {
    return this.runRead("list", context, async (client, tenantId) =>
      immutableRecords(await this.readRows(client, tenantId)),
    );
  }

  async find(
    predicate: (record: T) => boolean,
    context?: PersistenceContext,
  ): Promise<T[]> {
    const startedAt = Date.now();
    try {
      const tenantId = this.requireTenant(context, "find");
      if (this.snapshot.tenantId !== tenantId) {
        throw postgresPersistenceError({
          code: "PERSISTENCE_OPERATION_UNSUPPORTED",
          collection: this.collection,
          operation: "find",
          detail: "Registry find requires an explicitly hydrated tenant snapshot.",
        });
      }
      const found = immutableRecords(this.snapshot.records.filter(predicate));
      this.audit("find", "ok", startedAt);
      return found;
    } catch (error) {
      this.audit("find", "error", startedAt);
      throw this.mapError(error, "find");
    }
  }

  async clear(context?: PersistenceContext): Promise<void> {
    await this.runMutation("clear", context, async (client, tenantId) => {
      if (this.collection === "knowledge-nodes") {
        await this.readRows(client, tenantId);
        await client.query("delete from knowledge_nodes where tenant_id = $1", [
          tenantId,
        ]);
        return;
      }
      await client.query("delete from registries where tenant_id = $1", [tenantId]);
    });
  }

  subscribe(listener: () => void): () => void {
    return this.snapshot.emitter.subscribe(listener);
  }

  getSnapshot(): T[] {
    return this.snapshot.records;
  }

  async transaction<R>(
    work: (adapter: PersistenceAdapter<T>) => Promise<R>,
  ): Promise<R> {
    this.ensureSupported("transaction");
    if (this.transactionClient) {
      throw postgresPersistenceError({
        code: "PERSISTENCE_OPERATION_UNSUPPORTED",
        collection: this.collection,
        operation: "transaction",
        detail: "Nested PostgreSQL persistence transactions are unsupported.",
      });
    }

    const startedAt = Date.now();
    const client = await this.getPool().connect();
    try {
      await client.query("begin");
      await client.query("select set_config('statement_timeout', $1, true)", ["5000"]);
      const scoped = new SupabasePostgresAdapter<T>(
        { collection: this.collection, seed: () => [], env: this.env },
        { pool: this.getPool(), client, snapshot: this.snapshot },
      );
      const result = await work(scoped);
      if (!scoped.transactionTenantId) {
        throw postgresPersistenceError({
          code: "PERSISTENCE_TENANT_REQUIRED",
          collection: this.collection,
          operation: "transaction",
          detail: "A PostgreSQL transaction requires a tenant-scoped operation.",
        });
      }
      const next = scoped.transactionMutated
        ? await scoped.readRows(client, scoped.transactionTenantId)
        : undefined;
      await client.query("commit");
      if (next) this.replaceSnapshot(next, scoped.transactionTenantId);
      this.audit("transaction", "ok", startedAt);
      return result;
    } catch (error) {
      try {
        await client.query("rollback");
      } catch {
        // Preserve the transaction failure.
      }
      this.audit("transaction", "error", startedAt);
      if (error instanceof PostgresPersistenceError) throw error;
      throw postgresPersistenceError({
        code: "PERSISTENCE_TRANSACTION_FAILED",
        collection: this.collection,
        operation: "transaction",
        detail: "PostgreSQL registry transaction failed and was rolled back.",
      });
    } finally {
      client.release();
    }
  }

  private async findRowById(
    client: PoolClient,
    tenantId: string,
    id: string,
  ): Promise<RegistryPostgresRow | undefined> {
    const result: QueryResult<RegistryPostgresRow> = await client.query(
      `${REGISTRY_SELECT.replace("order by slug asc", "")} and slug = $2`,
      [tenantId, id],
    );
    return result.rows[0];
  }

  private async findKnowledgeNodeRowById(
    client: PoolClient,
    tenantId: string,
    id: string,
  ): Promise<KnowledgeNodePostgresRow | undefined> {
    const result = await client.query<KnowledgeNodePostgresRow>(
      `${KNOWLEDGE_NODE_SELECT.replace(
        "order by ref_id asc nulls last, id asc",
        "",
      )} and ref_id = $2`,
      [tenantId, id],
    );
    if (result.rows.length > 1) {
      throw postgresPersistenceError({
        code: "PERSISTENCE_LOGICAL_ID_CONFLICT",
        collection: this.collection,
        detail: `Duplicate knowledge node logical id "${id}" exists for the tenant.`,
      });
    }
    return result.rows[0];
  }

  private notFound(
    operation: PersistenceOperation,
    id: string,
  ): PostgresPersistenceError {
    return postgresPersistenceError({
      code: "PERSISTENCE_RECORD_NOT_FOUND",
      collection: this.collection,
      operation,
      detail: `${this.collection} record "${id}" was not found for the tenant.`,
    });
  }

  async health(): Promise<DatabaseHealth> {
    const startedAt = Date.now();
    try {
      const result = await this.withClient((client) =>
        client.query<{ relation: string | null }>(
          this.collection === "knowledge-nodes"
            ? "select to_regclass('public.knowledge_nodes')::text as relation"
            : "select to_regclass('public.registries')::text as relation",
        ),
      );
      return {
        ok:
          result.rows[0]?.relation ===
          (this.collection === "knowledge-nodes"
            ? "knowledge_nodes"
            : "registries"),
        provider: this.provider,
        latencyMs: Date.now() - startedAt,
        checkedAt: new Date().toISOString(),
      };
    } catch {
      return {
        ok: false,
        provider: this.provider,
        latencyMs: Date.now() - startedAt,
        checkedAt: new Date().toISOString(),
      };
    }
  }

  async dispose(): Promise<void> {
    if (!this.pool || this.transactionClient) return;
    await this.pool.end();
    this.pool = undefined;
  }
}

export function createPostgresAdapter<T extends PersistedEntity>(
  config: PostgresAdapterConfig<T>,
): SupabasePostgresAdapter<T> {
  return new SupabasePostgresAdapter(config);
}
