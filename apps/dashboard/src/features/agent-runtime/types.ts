import type { AgentContextPackage, AgentContextReport } from "@/features/agent-context";
import type { ExecutionReadinessResult, ExecutionReadinessStatus } from "@/features/execution-readiness";
import type {
  RuntimeHealth,
  RuntimeIdentity,
  RuntimeLifecycle,
  RuntimeRef,
  RuntimeWorkItem,
} from "@/features/organization-runtime/types";

export type AgentRiskLevel = "low" | "medium" | "high" | "critical";
export type AgentWorkloadState = "light" | "balanced" | "loaded" | "overloaded";

export interface AgentCapabilityProfile {
  capabilities: string[];
  tools: string[];
  permissions: string[];
  domains: string[];
  summary: string;
}

export interface AgentContextSummary {
  package: AgentContextPackage | null;
  report: AgentContextReport | null;
  topMemoryTitle?: string;
  summary: string;
}

export interface AgentResponsibilityProfile {
  assignedWork: RuntimeWorkItem[];
  assignedGoals: RuntimeWorkItem[];
  assignedMissions: RuntimeWorkItem[];
  assignedWorkflows: RuntimeWorkItem[];
  summary: string;
}

export interface AgentKnowledgeProfile {
  totalNodes: number;
  verifiedNodes: number;
  topDomains: string[];
  summary: string;
}

export interface AgentMemoryProfile {
  ownedMemories: number;
  contextualMemories: number;
  relatedMemories: number;
  contextHealth: number;
  summary: string;
}

export interface AgentReasoningProfile {
  model: string;
  confidenceScore: number;
  contextHealthLabel: string;
  summary: string;
}

export interface AgentLearningProfile {
  relatedLearningNodes: number;
  relatedLearningMemories: number;
  improvementSignals: number;
  summary: string;
}

export interface AgentAuthorityProfile {
  roleLabel: string;
  authorityRank: number;
  permissions: string[];
  approvalMode: "none" | "manager" | "director" | "human-review";
  summary: string;
}

export interface AgentWorkloadProfile {
  tasksToday: number;
  activeWorkCount: number;
  workflowCount: number;
  pendingApprovals: number;
  utilizationScore: number;
  state: AgentWorkloadState;
  summary: string;
}

export interface AgentExecutionReadinessProfile {
  status: ExecutionReadinessStatus | "unavailable";
  score: number;
  blockers: number;
  summary: string;
  source: ExecutionReadinessResult | null;
}

export interface AgentStatusSummary {
  headline: string;
  detail: string;
}

export interface AgentProjectionSourceRecord {
  id: string;
  name: string;
  slug: string;
  department: string;
  category: string;
  owner: string;
  status: string;
  version: string;
  capabilities: string[];
  provider: string;
  model: string;
  tools: string[];
  permissions: string[];
  runtime: string;
  memory: string;
  knowledge: string;
  role: string;
  tasksToday: number;
  costToday: number;
  lastActive: string;
  lifecycleStatus: "active" | "archived" | "deleted";
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
}

export interface AgentEmployeeRuntimeModel {
  identity: RuntimeIdentity;
  department?: RuntimeRef;
  manager?: RuntimeRef;
  owner?: RuntimeRef;
  lifecycle: RuntimeLifecycle;
  health: RuntimeHealth;
  capabilities: AgentCapabilityProfile;
  currentContext: AgentContextSummary;
  assignedWork: RuntimeWorkItem[];
  assignedGoals: RuntimeWorkItem[];
  assignedMissions: RuntimeWorkItem[];
  assignedWorkflows: RuntimeWorkItem[];
  knowledgeProfile: AgentKnowledgeProfile;
  memoryProfile: AgentMemoryProfile;
  reasoningProfile: AgentReasoningProfile;
  learningProfile: AgentLearningProfile;
  authority: AgentAuthorityProfile;
  riskLevel: AgentRiskLevel;
  executionReadiness: AgentExecutionReadinessProfile;
  workload: AgentWorkloadProfile;
  status: string;
  statusSummary: AgentStatusSummary;
  runtime: string;
  provider: string;
  organization: RuntimeRef;
  company: RuntimeRef;
  relationships: {
    parent?: RuntimeRef;
    memberships: RuntimeRef[];
    reportsTo?: RuntimeRef;
  };
}
