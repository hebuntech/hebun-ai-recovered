/*
 * CRUD core — newest-first in-memory entry store.
 *
 * Shared by CRUD domains that need lightweight audit/history streams without
 * duplicating the same push/get/count plumbing.
 */

export interface EntryStore<T> {
  record(entry: T): void;
  list(): T[];
  count(): number;
}

export function createEntryStore<T>(): EntryStore<T> {
  const entries: T[] = [];

  return {
    record(entry) {
      entries.unshift(entry);
    },
    list() {
      return entries;
    },
    count() {
      return entries.length;
    },
  };
}
