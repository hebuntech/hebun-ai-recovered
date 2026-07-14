/*
 * Persistence layer — storage manager.
 *
 * Chooses which adapter backs each collection. Today every collection resolves to
 * the in-memory adapter. To move a collection to Supabase / Postgres / SQLite /
 * Redis later, this is the only place that changes — services and repositories
 * keep calling getAdapter() and never learn the provider.
 */

import { createMemoryAdapter } from "./memory-adapter";
import type { PersistenceAdapter } from "./adapter";
import type { PersistedEntity } from "./types";

type StorageProvider = "memory" | "supabase" | "postgres" | "sqlite" | "redis";

/* The active provider. Swap this (or make it config-driven) to migrate. */
const ACTIVE_PROVIDER: StorageProvider = "memory";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const adapters = new Map<string, PersistenceAdapter<any>>();

export function getAdapter<T extends PersistedEntity>(
  collection: string,
  seed: () => T[]
): PersistenceAdapter<T> {
  const existing = adapters.get(collection);
  if (existing) return existing as PersistenceAdapter<T>;

  let adapter: PersistenceAdapter<T>;
  switch (ACTIVE_PROVIDER) {
    // case "supabase": adapter = createSupabaseAdapter({ collection, seed }); break;
    // case "postgres": adapter = createPostgresAdapter({ collection, seed }); break;
    case "memory":
    default:
      adapter = createMemoryAdapter<T>({ collection, seed });
  }

  adapters.set(collection, adapter);
  return adapter;
}

export function activeProvider(): StorageProvider {
  return ACTIVE_PROVIDER;
}

export function getRegisteredCollections(): string[] {
  return [...adapters.keys()];
}
