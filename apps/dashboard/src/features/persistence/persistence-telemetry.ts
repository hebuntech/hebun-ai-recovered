/*
 * Persistence layer — telemetry.
 *
 * Global deterministic counters across every adapter and collection.
 */

import type { PersistenceOperation } from "./types";

export interface PersistenceTelemetryState {
  reads: number;
  writes: number;
  creates: number;
  updates: number;
  archives: number;
  restores: number;
  softDeletes: number;
  loadTimeMs: number;
  saveTimeMs: number;
  adapterLatencyMs: number;
  operations: number;
}

const state: PersistenceTelemetryState = {
  reads: 0,
  writes: 0,
  creates: 0,
  updates: 0,
  archives: 0,
  restores: 0,
  softDeletes: 0,
  loadTimeMs: 0,
  saveTimeMs: 0,
  adapterLatencyMs: 0,
  operations: 0,
};

const readOps = new Set<PersistenceOperation>(["load", "list", "find", "exists"]);
const writeOps = new Set<PersistenceOperation>([
  "save",
  "create",
  "update",
  "delete",
  "restore",
  "archive",
  "clear",
  "transaction",
]);

export function trackOperation(operation: PersistenceOperation, durationMs: number): void {
  state.operations += 1;
  state.adapterLatencyMs += durationMs;
  if (readOps.has(operation)) state.reads += 1;
  if (writeOps.has(operation)) state.writes += 1;
  if (operation === "load") state.loadTimeMs += durationMs;
  if (operation === "save") state.saveTimeMs += durationMs;
  if (operation === "create") state.creates += 1;
  if (operation === "update") state.updates += 1;
  if (operation === "archive") state.archives += 1;
  if (operation === "restore") state.restores += 1;
  if (operation === "delete") state.softDeletes += 1;
}

export function getPersistenceTelemetry(): PersistenceTelemetryState {
  return { ...state };
}
