/*
 * Registry CRUD — types.
 *
 * The reference in-memory data layer. A RegistryCrudRecord is a lifecycle-managed
 * view of a registry catalog entry (seeded from the existing RegistryDefinition
 * data — not a duplicate domain model). Every mutation flows through the Command
 * Bus; nothing is persisted beyond the running session.
 */

import type { Command } from "@/features/commands/types";

export type LifecycleStatus = "active" | "archived" | "deleted";

export interface RegistryCrudRecord {
  id: string;
  title: string;
  description: string;
  owner: string;
  health: number;
  totalRecords: number;
  lifecycleStatus: LifecycleStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CreateRegistryInput {
  title: string;
  description?: string;
  owner?: string;
}

export interface UpdateRegistryInput {
  title?: string;
  description?: string;
  owner?: string;
}

export type RegistryAction =
  | "create"
  | "update"
  | "archive"
  | "restore"
  | "delete";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export interface RegistryAuditEntry {
  commandId: string;
  registryId: string;
  timestamp: string;
  actor: string;
  action: RegistryAction;
  previousState: LifecycleStatus | null;
  newState: LifecycleStatus;
  simulation: boolean;
}

export interface RegistryHistoryEntry {
  commandId: string;
  registryId: string;
  action: RegistryAction;
  timestamp: string;
  actor: string;
  ok: boolean;
}

export interface RegistryTelemetryState {
  creates: number;
  updates: number;
  archives: number;
  restores: number;
  softDeletes: number;
  validationFailures: number;
  totalLatencyMs: number;
  historyCount: number;
}

export interface CrudResult {
  ok: boolean;
  errors: string[];
  record?: RegistryCrudRecord;
  command?: Command;
}
