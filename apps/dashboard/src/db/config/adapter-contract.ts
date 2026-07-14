/*
 * Adapter conformance — the capability spec every storage adapter must satisfy.
 *
 * The in-memory adapter already implements the PersistenceAdapter interface.
 * Backend adapters (Supabase / Postgres / SQLite / Redis) must implement the same
 * interface plus an async `health()` check. This file is the shared checklist a
 * conformance test suite will run against every adapter. Declarations only.
 */

import type { DatabaseHealth } from "./connection-contract";

/** Capabilities required of every storage adapter. */
export const ADAPTER_CAPABILITIES = [
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
  "transaction",
  "health",
] as const;

export type AdapterCapability = (typeof ADAPTER_CAPABILITIES)[number];

/**
 * Health extension. PersistenceAdapter stays sync + UI-facing; backend adapters
 * additionally expose an async health probe. Kept separate so the existing
 * memory adapter and PersistenceAdapter interface remain untouched.
 */
export interface HealthReporting {
  health(): Promise<DatabaseHealth>;
}

/** Static description of an adapter's conformance, used by future tests. */
export interface AdapterConformance {
  provider: string;
  capabilities: readonly AdapterCapability[];
  transactional: boolean;
  softDeleteOnly: boolean;
}
