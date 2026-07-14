/*
 * Persistence layer — repository base.
 *
 * A generic repository over any PersistenceAdapter. Domain repositories build on
 * this so they share one implementation and never touch a store directly.
 */

import type { PersistenceAdapter } from "./adapter";
import type { PersistedEntity, PersistenceContext } from "./types";

export interface BaseRepository<T extends PersistedEntity> {
  findAll(context?: PersistenceContext): Promise<T[]>;
  findById(id: string, context?: PersistenceContext): Promise<T | undefined>;
  exists(id: string, context?: PersistenceContext): Promise<boolean>;
  insert(record: T, context?: PersistenceContext): Promise<T>;
  update(
    id: string,
    patch: Partial<T>,
    context?: PersistenceContext
  ): Promise<T | undefined>;
  archive(id: string, context?: PersistenceContext): Promise<T | undefined>;
  restore(id: string, context?: PersistenceContext): Promise<T | undefined>;
  softDelete(id: string, context?: PersistenceContext): Promise<T | undefined>;
  transaction<R>(
    work: (repository: BaseRepository<T>) => Promise<R>
  ): Promise<R>;
  subscribe(listener: () => void): () => void;
  getSnapshot(): T[];
}

export function createRepository<T extends PersistedEntity>(
  adapter: PersistenceAdapter<T>
): BaseRepository<T> {
  const repository: BaseRepository<T> = {
    findAll: (context) => adapter.list(context),
    findById: async (id, context) => (await adapter.find((r) => r.id === id, context))[0],
    exists: (id, context) => adapter.exists(id, context),
    insert: (record, context) => adapter.create(record, context),
    update: (id, patch, context) => adapter.update(id, patch, context),
    archive: (id, context) => adapter.archive(id, context),
    restore: (id, context) => adapter.restore(id, context),
    softDelete: (id, context) => adapter.delete(id, context),
    transaction: (work) => adapter.transaction(async () => work(repository)),
    subscribe: adapter.subscribe,
    getSnapshot: adapter.getSnapshot,
  };

  return repository;
}
