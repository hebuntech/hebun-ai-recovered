/*
 * Memory CRUD — types.
 *
 * Memories are first-class platform entities managed through the same
 * service/repository/persistence/command-bus architecture as Registry CRUD,
 * Agent CRUD, and Workflow CRUD.
 */

import type { Command } from "@/features/commands/types";
import type { LifecycleStatus } from "@/features/persistence";

export type MemoryType =
  | "Conversation"
  | "Decision"
  | "Fact"
  | "Procedure"
  | "Policy"
  | "Customer"
  | "Project"
  | "Organization"
  | "Agent"
  | "Workflow";

export type MemoryOwnerType =
  | "agent"
  | "workflow"
  | "department"
  | "organization";

export type MemoryStatus = "fresh" | "stable" | "review";
export type MemoryImportance = "critical" | "high" | "medium" | "low";

export interface MemoryCrudRecord {
  id: string;
  title: string;
  slug: string;
  description: string;
  memoryType: MemoryType;
  ownerType: MemoryOwnerType;
  ownerId: string;
  importance: MemoryImportance;
  confidence: number;
  source: string;
  tags: string[];
  summary: string;
  status: MemoryStatus;
  version: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  lifecycleStatus: LifecycleStatus;
}

export interface MemoryInput {
  title: string;
  slug: string;
  description: string;
  memoryType: MemoryType;
  ownerType: MemoryOwnerType;
  ownerId: string;
  importance: MemoryImportance;
  confidence: number;
  source: string;
  tags: string[];
  summary: string;
  status: MemoryStatus;
  version: string;
}

export type CreateMemoryInput = MemoryInput;
export type UpdateMemoryInput = Partial<MemoryInput>;
export type MemoryAction = "create" | "update" | "archive" | "restore" | "delete";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export interface MemoryAuditEntry {
  commandId: string;
  memoryId: string;
  timestamp: string;
  actor: string;
  action: MemoryAction;
  previousState: MemoryCrudRecord | null;
  newState: MemoryCrudRecord;
  simulation: boolean;
}

export interface MemoryHistoryEntry {
  commandId: string;
  memoryId: string;
  action: MemoryAction;
  timestamp: string;
  actor: string;
  ok: boolean;
}

export interface MemoryTelemetryState {
  creates: number;
  updates: number;
  archives: number;
  restores: number;
  softDeletes: number;
  validationFailures: number;
  totalLatencyMs: number;
  historyCount: number;
}

export interface MemoryCrudResult {
  ok: boolean;
  errors: string[];
  record?: MemoryCrudRecord;
  command?: Command;
}
