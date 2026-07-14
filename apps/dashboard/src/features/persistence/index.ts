/*
 * Persistence layer — the storage-agnostic data foundation.
 *
 * UI → Service → Repository → PersistenceAdapter → Storage Provider.
 * Callers depend only on the adapter interface, never on a concrete backend.
 */

export * from "./types";
export type { PersistenceAdapter } from "./adapter";
export { getAdapter, activeProvider, getRegisteredCollections } from "./storage-manager";
export { createRepository } from "./repository-base";
export type { BaseRepository } from "./repository-base";
export { getPersistenceTelemetry } from "./persistence-telemetry";
export type { PersistenceTelemetryState } from "./persistence-telemetry";
export { getOperationHistory, getOperationCount } from "./persistence-history";
