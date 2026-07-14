/*
 * Persistence layer — operation history / audit.
 *
 * Newest-first log of every persistence operation across all adapters. Each entry
 * is the operation audit: id, provider, collection, operation, timestamp,
 * duration and result.
 */

import type { PersistenceOperationRecord } from "./types";

const history: PersistenceOperationRecord[] = [];

export function recordOperation(entry: PersistenceOperationRecord): void {
  history.unshift(entry);
}

export function getOperationHistory(): PersistenceOperationRecord[] {
  return history;
}

export function getOperationCount(): number {
  return history.length;
}
