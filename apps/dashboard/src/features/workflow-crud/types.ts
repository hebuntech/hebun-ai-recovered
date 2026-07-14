/*
 * Workflow CRUD — types.
 *
 * Workflows are first-class platform entities managed through the same
 * service/repository/persistence/command-bus architecture as Registry CRUD and
 * Agent CRUD.
 */

import type { Command } from "@/features/commands/types";
import type { LifecycleStatus } from "@/features/persistence";
import type { WorkflowStatus } from "@/types";

export interface WorkflowCrudRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  department: string;
  category: string;
  owner: string;
  status: WorkflowStatus;
  version: string;
  trigger: string;
  steps: string[];
  assignedAgents: string[];
  dependencies: string[];
  approvalPolicy: string;
  executionMode: string;
  retryPolicy: string;
  timeout: number;
  runtime: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  lifecycleStatus: LifecycleStatus;
  ownerAgent: string;
  successRate: number;
  runsToday: number;
  lastRun: string;
}

export interface WorkflowInput {
  name: string;
  slug: string;
  description: string;
  department: string;
  category: string;
  owner: string;
  status: WorkflowStatus;
  version: string;
  trigger: string;
  steps: string[];
  assignedAgents: string[];
  dependencies: string[];
  approvalPolicy: string;
  executionMode: string;
  retryPolicy: string;
  timeout: number;
  runtime: string;
  ownerAgent?: string;
  successRate?: number;
  runsToday?: number;
  lastRun?: string;
}

export type CreateWorkflowInput = WorkflowInput;

export type UpdateWorkflowInput = Partial<WorkflowInput>;

export type WorkflowAction = "create" | "update" | "archive" | "restore" | "delete";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export interface WorkflowAuditEntry {
  commandId: string;
  workflowId: string;
  timestamp: string;
  actor: string;
  action: WorkflowAction;
  previousState: WorkflowCrudRecord | null;
  newState: WorkflowCrudRecord;
  simulation: boolean;
}

export interface WorkflowHistoryEntry {
  commandId: string;
  workflowId: string;
  action: WorkflowAction;
  timestamp: string;
  actor: string;
  ok: boolean;
}

export interface WorkflowTelemetryState {
  creates: number;
  updates: number;
  archives: number;
  restores: number;
  softDeletes: number;
  validationFailures: number;
  totalLatencyMs: number;
  historyCount: number;
}

export interface WorkflowCrudResult {
  ok: boolean;
  errors: string[];
  record?: WorkflowCrudRecord;
  command?: Command;
}
