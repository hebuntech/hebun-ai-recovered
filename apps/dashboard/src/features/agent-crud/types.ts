/*
 * Agent CRUD — types.
 *
 * Agents are first-class platform entities managed through the same
 * service/repository/persistence/command-bus architecture as Registry CRUD.
 */

import type { AgentStatus } from "@/types";
import type { Command } from "@/features/commands/types";
import type { LifecycleStatus } from "@/features/persistence";

export interface AgentCrudRecord {
  id: string;
  name: string;
  slug: string;
  description: string;
  department: string;
  category: string;
  owner: string;
  status: AgentStatus;
  version: string;
  capabilities: string[];
  provider: string;
  model: string;
  tools: string[];
  permissions: string[];
  runtime: string;
  memory: string;
  knowledge: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  lifecycleStatus: LifecycleStatus;
  role: string;
  tasksToday: number;
  costToday: number;
  lastActive: string;
}

export interface AgentInput {
  name: string;
  slug: string;
  description: string;
  department: string;
  category: string;
  owner: string;
  status: AgentStatus;
  version: string;
  capabilities: string[];
  provider: string;
  model: string;
  tools: string[];
  permissions: string[];
  runtime: string;
  memory: string;
  knowledge: string;
  role?: string;
  tasksToday?: number;
  costToday?: number;
  lastActive?: string;
}

export type CreateAgentInput = AgentInput;

export type UpdateAgentInput = Partial<AgentInput>;

export type AgentAction = "create" | "update" | "archive" | "restore" | "delete";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export interface AgentAuditEntry {
  commandId: string;
  agentId: string;
  timestamp: string;
  actor: string;
  action: AgentAction;
  previousState: AgentCrudRecord | null;
  newState: AgentCrudRecord;
  simulation: boolean;
}

export interface AgentHistoryEntry {
  commandId: string;
  agentId: string;
  action: AgentAction;
  timestamp: string;
  actor: string;
  ok: boolean;
}

export interface AgentTelemetryState {
  creates: number;
  updates: number;
  archives: number;
  restores: number;
  softDeletes: number;
  validationFailures: number;
  totalLatencyMs: number;
  historyCount: number;
}

export interface AgentCrudResult {
  ok: boolean;
  errors: string[];
  record?: AgentCrudRecord;
  command?: Command;
}
