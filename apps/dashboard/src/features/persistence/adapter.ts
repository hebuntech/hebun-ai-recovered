/*
 * Persistence layer — adapter interface.
 *
 * Every storage backend (memory today; Supabase / Postgres / SQLite / Redis
 * later) implements this exact interface. The repository and service depend only
 * on this contract, so swapping the backend never touches application code.
 */

import type {
  PersistedEntity,
  PersistenceContext,
  ProviderCapabilityManifest,
} from "./types";

export interface PersistenceAdapter<T extends PersistedEntity> {
  readonly provider: string;
  readonly collection: string;
  readonly contractVersion: "async";
  readonly manifest: ProviderCapabilityManifest;

  /* Bulk */
  load(context?: PersistenceContext): Promise<T[]>;
  save(records: T[], context?: PersistenceContext): Promise<void>;

  /* CRUD */
  create(record: T, context?: PersistenceContext): Promise<T>;
  update(
    id: string,
    patch: Partial<T>,
    context?: PersistenceContext
  ): Promise<T | undefined>;
  delete(id: string, context?: PersistenceContext): Promise<T | undefined>; // soft delete only
  restore(id: string, context?: PersistenceContext): Promise<T | undefined>;
  archive(id: string, context?: PersistenceContext): Promise<T | undefined>;

  /* Read */
  exists(id: string, context?: PersistenceContext): Promise<boolean>;
  list(context?: PersistenceContext): Promise<T[]>;
  find(
    predicate: (record: T) => boolean,
    context?: PersistenceContext
  ): Promise<T[]>;

  /* Maintenance */
  clear(context?: PersistenceContext): Promise<void>;

  /* Reactivity — powers useSyncExternalStore in the UI */
  subscribe(listener: () => void): () => void;
  getSnapshot(): T[];

  /* Future transaction support. The memory adapter runs the unit of work
   * synchronously; a real backend can wrap it in a database transaction. */
  transaction<R>(
    work: (adapter: PersistenceAdapter<T>) => Promise<R>
  ): Promise<R>;
}
