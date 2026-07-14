/*
 * Knowledge Graph CRUD — types.
 *
 * Knowledge nodes and typed relationships are first-class platform entities,
 * managed through the same service/repository/persistence/command-bus
 * architecture as Registry, Agent, Workflow and Memory CRUD. No graph traversal,
 * embeddings, or vector search — those belong to the future Memory/Knowledge
 * Engine. This layer is registry-grade CRUD only.
 */

import type { Command } from "@/features/commands/types";
import type { LifecycleStatus } from "@/features/persistence";
import type { KnowledgeGraphRelationshipType } from "@/features/knowledge-graph/types";

export type { KnowledgeGraphRelationshipType } from "@/features/knowledge-graph/types";

export type KnowledgeNodeType =
  | "Agent"
  | "Workflow"
  | "Department"
  | "Organization"
  | "Customer"
  | "Project"
  | "Decision"
  | "Memory"
  | "Knowledge"
  | "Policy"
  | "Goal"
  | "Plan"
  | "Tool"
  | "Model"
  | "Capability"
  | "Event"
  | "Risk"
  | "Entity"
  | "Execution"
  | "Learning"
  | "Experience"
  | "Governance";

export type KnowledgeOwnerType = "agent" | "workflow" | "department" | "organization";
export type KnowledgeNodeStatus = "verified" | "provisional" | "review";
export type KnowledgeImportance = "critical" | "high" | "medium" | "low";

export interface KnowledgeNodeRecord {
  id: string;
  title: string;
  slug: string;
  description: string;
  nodeType: KnowledgeNodeType;
  ownerType: KnowledgeOwnerType;
  ownerId: string;
  confidence: number;
  importance: KnowledgeImportance;
  status: KnowledgeNodeStatus;
  version: string;
  source: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  lifecycleStatus: LifecycleStatus;
}

export interface KnowledgeNodeInput {
  title: string;
  slug: string;
  description: string;
  nodeType: KnowledgeNodeType;
  ownerType: KnowledgeOwnerType;
  ownerId: string;
  confidence: number;
  importance: KnowledgeImportance;
  status: KnowledgeNodeStatus;
  version: string;
  source: string;
  tags: string[];
}

export type CreateKnowledgeInput = KnowledgeNodeInput;
export type UpdateKnowledgeInput = Partial<KnowledgeNodeInput>;
export type KnowledgeAction = "create" | "update" | "archive" | "restore" | "delete";

/* Relationships are edges between two knowledge nodes. */
export interface RelationshipRecord {
  id: string;
  sourceNode: string;
  targetNode: string;
  relationshipType: KnowledgeGraphRelationshipType;
  weight: number;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  updatedBy: string;
  lifecycleStatus: LifecycleStatus;
}

export interface RelationshipInput {
  sourceNode: string;
  targetNode: string;
  relationshipType: KnowledgeGraphRelationshipType;
  weight: number;
}

export type CreateRelationshipInput = RelationshipInput;
export type UpdateRelationshipInput = Partial<Pick<RelationshipInput, "relationshipType" | "weight">>;
export type RelationshipAction = "create" | "update" | "delete";

export interface ValidationResult {
  ok: boolean;
  errors: string[];
}

export type KnowledgeEntityKind = "node" | "relationship";

export interface KnowledgeAuditEntry {
  commandId: string;
  entityKind: KnowledgeEntityKind;
  knowledgeId?: string;
  relationshipId?: string;
  actor: string;
  timestamp: string;
  action: KnowledgeAction | RelationshipAction;
  previousState: KnowledgeNodeRecord | RelationshipRecord | null;
  newState: KnowledgeNodeRecord | RelationshipRecord;
  simulation: boolean;
}

export interface KnowledgeHistoryEntry {
  commandId: string;
  entityKind: KnowledgeEntityKind;
  entityId: string;
  action: KnowledgeAction | RelationshipAction;
  timestamp: string;
  actor: string;
  ok: boolean;
}

export interface KnowledgeTelemetryState {
  creates: number;
  updates: number;
  archives: number;
  restores: number;
  softDeletes: number;
  relationshipOps: number;
  validationFailures: number;
  totalLatencyMs: number;
  historyCount: number;
}

export interface KnowledgeCrudResult {
  ok: boolean;
  errors: string[];
  record?: KnowledgeNodeRecord;
  command?: Command;
}

export interface RelationshipCrudResult {
  ok: boolean;
  errors: string[];
  record?: RelationshipRecord;
  command?: Command;
}
