/*
 * Persistence layer — in-memory adapter.
 *
 * The reference PersistenceAdapter implementation. Holds the only mutable copy of
 * a collection for the running session. No database, localStorage, filesystem or
 * network. Every operation is audited (history) and counted (telemetry) with a
 * deterministic duration. A future SupabaseAdapter / PostgresAdapter implements
 * the same interface with no change to callers.
 */

import { createEmitter } from "./persistence-events";
import { recordOperation } from "./persistence-history";
import { trackOperation } from "./persistence-telemetry";
import type { PersistenceAdapter } from "./adapter";
import type {
  PersistedEntity,
  PersistenceContext,
  PersistenceOperation,
  ProviderCapabilityManifest,
} from "./types";

/* Deterministic per-operation cost (ms). Real backends measure wall time. */
const OP_COST_MS: Record<PersistenceOperation, number> = {
  load: 2,
  save: 2,
  create: 1,
  update: 1,
  delete: 1,
  restore: 1,
  archive: 1,
  exists: 1,
  list: 1,
  find: 1,
  clear: 1,
  transaction: 1,
};

let operationSequence = 0;

export interface MemoryAdapterConfig<T> {
  collection: string;
  seed: () => T[];
}

function buildMemoryManifest(collection: string): ProviderCapabilityManifest {
  return {
    supportedCollections: [collection],
    unsupportedCollections: [],
    readableCollections: [collection],
    writableCollections: [collection],
    transactional: true,
    tenantIsolation: false,
    softDelete: true,
    optimisticVersioning: false,
  };
}

export function createMemoryAdapter<T extends PersistedEntity>(
  config: MemoryAdapterConfig<T>
): PersistenceAdapter<T> {
  const provider = "memory";
  const collection = config.collection;
  const emitter = createEmitter();
  let records: T[] = config.seed();
  let transactionDepth = 0;
  let pendingNotification = false;
  const manifest = buildMemoryManifest(collection);

  function audit(operation: PersistenceOperation): number {
    operationSequence += 1;
    const durationMs = OP_COST_MS[operation];
    recordOperation({
      operationId: `op_${String(operationSequence).padStart(6, "0")}`,
      provider,
      collection,
      operation,
      timestamp: new Date().toISOString(),
      durationMs,
      result: "ok",
    });
    trackOperation(operation, durationMs);
    return durationMs;
  }

  function notify(): void {
    if (transactionDepth > 0) {
      pendingNotification = true;
      return;
    }
    emitter.emit();
  }

  function commit(next: T[], operation: PersistenceOperation): void {
    records = next;
    audit(operation);
    notify();
  }

  function get(id: string): T | undefined {
    return records.find((r) => r.id === id);
  }

  const adapter: PersistenceAdapter<T> = {
    provider,
    collection,
    contractVersion: "async",
    manifest,

    async load(_context?: PersistenceContext) {
      audit("load");
      return records;
    },
    async save(next, _context?: PersistenceContext) {
      commit(next, "save");
    },

    async create(record, _context?: PersistenceContext) {
      commit([record, ...records], "create");
      return record;
    },
    async update(id, patch, _context?: PersistenceContext) {
      let updated: T | undefined;
      const next = records.map((r) => {
        if (r.id !== id) return r;
        updated = { ...r, ...patch };
        return updated;
      });
      if (!updated) return undefined;
      commit(next, "update");
      return updated;
    },
    async delete(id, _context?: PersistenceContext) {
      const current = get(id);
      if (!current) return undefined;
      const next = records.map((r) => (r.id === id ? { ...r, lifecycleStatus: "deleted" as const } : r));
      commit(next, "delete");
      return get(id);
    },
    async restore(id, _context?: PersistenceContext) {
      const current = get(id);
      if (!current) return undefined;
      const next = records.map((r) => (r.id === id ? { ...r, lifecycleStatus: "active" as const } : r));
      commit(next, "restore");
      return get(id);
    },
    async archive(id, _context?: PersistenceContext) {
      const current = get(id);
      if (!current) return undefined;
      const next = records.map((r) => (r.id === id ? { ...r, lifecycleStatus: "archived" as const } : r));
      commit(next, "archive");
      return get(id);
    },

    async exists(id, _context?: PersistenceContext) {
      audit("exists");
      return records.some((r) => r.id === id);
    },
    async list(_context?: PersistenceContext) {
      audit("list");
      return records;
    },
    async find(predicate, _context?: PersistenceContext) {
      audit("find");
      return records.filter(predicate);
    },

    async clear(_context?: PersistenceContext) {
      commit([], "clear");
    },

    subscribe: emitter.subscribe,
    getSnapshot() {
      return records;
    },

    async transaction(work) {
      audit("transaction");
      const snapshot = records.slice();
      const pendingBefore = pendingNotification;
      transactionDepth += 1;
      try {
        const result = await work(adapter);
        transactionDepth -= 1;
        if (transactionDepth === 0 && pendingNotification) {
          pendingNotification = false;
          emitter.emit();
        }
        return result;
      } catch (error) {
        records = snapshot;
        transactionDepth -= 1;
        pendingNotification = pendingBefore;
        if (transactionDepth === 0) pendingNotification = false;
        throw error;
      }
    },
  };

  return adapter;
}
