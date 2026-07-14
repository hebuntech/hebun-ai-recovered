import type { RuntimeHealth, RuntimeLifecycle } from "@/features/organization-runtime/types";

export type WorkflowRuntimeRefKind =
  | "company"
  | "organization"
  | "department"
  | "human"
  | "agent"
  | "mission"
  | "goal"
  | "plan"
  | "workflow"
  | "task"
  | "execution"
  | "knowledge"
  | "memory"
  | "learning";

export type WorkflowReadinessStatus = "ready" | "watch" | "blocked" | "unavailable";
export type WorkflowRiskLevel = "low" | "medium" | "high" | "critical";

export interface WorkflowRuntimeIdentity {
  id: string;
  slug: string;
  name: string;
  kind: "workflow";
  source: "memory" | "derived";
}

export interface WorkflowRuntimeRef {
  kind: WorkflowRuntimeRefKind;
  id: string;
  label: string;
}

export interface WorkflowRuntimeWorkItem {
  type: WorkflowRuntimeRefKind;
  id: string;
  label: string;
  status?: string;
  detail?: string;
}

export interface WorkflowProgressProfile {
  completionRate: number;
  successRate: number;
  runsToday: number;
  summary: string;
}

export interface WorkflowReadinessProfile {
  status: WorkflowReadinessStatus;
  score: number;
  blockers: number;
  summary: string;
}

export interface WorkflowStatusSummary {
  headline: string;
  detail: string;
}

export interface WorkflowProjectionSourceRecord {
  id: string;
  name: string;
  slug: string;
  department: string;
  category: string;
  owner: string;
  status: string;
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
  ownerAgent: string;
  successRate: number;
  runsToday: number;
  lastRun: string;
  lifecycleStatus: "active" | "archived" | "deleted";
  createdAt: string;
  updatedAt: string;
}

export interface KnowledgeProjectionSourceRecord {
  id: string;
  title: string;
  description: string;
  nodeType: string;
  ownerId: string;
  tags: string[];
  status: string;
  lifecycleStatus: "active" | "archived" | "deleted";
}

export interface MemoryProjectionSourceRecord {
  id: string;
  title: string;
  summary: string;
  memoryType: string;
  ownerType: string;
  ownerId: string;
  source: string;
  tags: string[];
  status: string;
  lifecycleStatus: "active" | "archived" | "deleted";
}

export interface WorkflowRuntimeModel {
  identity: WorkflowRuntimeIdentity;
  mission?: WorkflowRuntimeWorkItem;
  goal?: WorkflowRuntimeWorkItem;
  plan?: WorkflowRuntimeWorkItem;
  parentWorkflow?: WorkflowRuntimeRef;
  childWorkflows: WorkflowRuntimeRef[];
  assignedAgents: WorkflowRuntimeRef[];
  responsibleHumans: WorkflowRuntimeRef[];
  currentTasks: WorkflowRuntimeWorkItem[];
  dependencies: WorkflowRuntimeWorkItem[];
  executionStatus: string;
  lifecycle: RuntimeLifecycle;
  health: RuntimeHealth;
  progress: WorkflowProgressProfile;
  priority: "critical" | "high" | "medium" | "low";
  risk: WorkflowRiskLevel;
  timeline: {
    trigger: string;
    lastRun: string;
  };
  blockingIssues: string[];
  readiness: WorkflowReadinessProfile;
  learningReferences: WorkflowRuntimeWorkItem[];
  knowledgeReferences: WorkflowRuntimeWorkItem[];
  memoryReferences: WorkflowRuntimeWorkItem[];
  statusSummary: WorkflowStatusSummary;
  company: WorkflowRuntimeRef;
  organization: WorkflowRuntimeRef;
  department?: WorkflowRuntimeRef;
  relationships: {
    parent?: WorkflowRuntimeRef;
    children: WorkflowRuntimeRef[];
    supportedMission?: WorkflowRuntimeRef;
    supportedGoal?: WorkflowRuntimeRef;
    supportedPlan?: WorkflowRuntimeRef;
  };
}
