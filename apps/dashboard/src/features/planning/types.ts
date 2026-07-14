import type { BadgeVariant } from "@/components/ui/badge";
import type { GovernanceResult } from "@/features/policy";
import type { RegistryRecord } from "@/features/registries/types";
import type {
  CoreRiskLevel,
  DownstreamReferenceIds,
  PipelineRecordTimestamps,
} from "@/features/shared";

export type PlanningPriority = "critical" | "high" | "medium" | "low";
export type PlanningStatus = "ready" | "in-review" | "blocked";
export type PlanningTaskType =
  | "alignment"
  | "design"
  | "governance"
  | "enablement"
  | "validation";
export type PlanningRiskLevel = CoreRiskLevel;
export type PlanningResourceCategory =
  | "people"
  | "ai-agents"
  | "tools"
  | "models"
  | "workflows"
  | "capabilities"
  | "budgets"
  | "time";

export interface PlanningGoal {
  id: string;
  title: string;
  description: string;
  owner: string;
  sourceGoal: RegistryRecord;
  drivers: string[];
}

export interface PlanTask {
  id: string;
  title: string;
  description: string;
  type: PlanningTaskType;
  priority: PlanningPriority;
  status: "ready" | "blocked" | "pending-review";
  owner: string;
  estimatedDuration: string;
  requiredCapabilityIds: string[];
  requiredToolIds: string[];
  dependencyIds: string[];
  successCriteria: string[];
}

export interface PlanningDependency {
  taskId: string;
  dependsOn: string[];
}

export interface PlanningResource {
  id: string;
  category: PlanningResourceCategory;
  title: string;
  owner: string;
  detail: string;
  referenceId?: string;
}

export interface PlanningTimelineItem {
  id: string;
  taskId: string;
  title: string;
  startDate: string;
  endDate: string;
  sequence: number;
}

export interface PlanMilestone {
  id: string;
  title: string;
  detail: string;
  dueDate: string;
  owner: string;
  status: "on-track" | "watch" | "at-risk";
}

export interface PlanSuccessCriterion {
  id: string;
  label: string;
  detail: string;
}

export interface PlanningRisk {
  id: string;
  title: string;
  level: PlanningRiskLevel;
  detail: string;
  mitigation: string;
  source: string;
}

export interface ResourceAllocation {
  resources: PlanningResource[];
  utilizationScore: number;
  budgetBand: string;
  timeWindow: string;
  summary: string;
}

export interface ExecutionBlueprint {
  id: string;
  orderedTasks: string[];
  parallelTasks: string[][];
  criticalPath: string[];
  decisionPoints: string[];
  approvalCheckpoints: string[];
  rollbackPoints: string[];
  completionCriteria: string[];
}

export interface GeneratedPlan extends DownstreamReferenceIds, PipelineRecordTimestamps {
  id: string;
  title: string;
  description: string;
  goalId: string;
  reasoningId: string;
  governanceDecisionId: string;
  priority: PlanningPriority;
  status: PlanningStatus;
  owner: string;
  estimatedDuration: string;
  estimatedDurationDays: number;
  estimatedEffort: number;
  requiredCapabilities: string[];
  requiredTools: string[];
  requiredAgents: string[];
  dependencies: PlanningDependency[];
  tasks: PlanTask[];
  milestones: PlanMilestone[];
  timeline: PlanningTimelineItem[];
  successCriteria: PlanSuccessCriterion[];
  riskAssessment: PlanningRisk[];
  resourceAllocation: ResourceAllocation;
  executionBlueprintId: string;
  confidence: number;
  goal: PlanningGoal;
  executionBlueprint: ExecutionBlueprint;
  governance: GovernanceResult;
}

export interface PlanningPipelineStep {
  id: string;
  label: string;
  description: string;
}

export interface PlanningMetrics {
  activePlans: number;
  tasksGenerated: number;
  milestones: number;
  blockedPlans: number;
  averageCompletionEstimate: string;
  planningHealth: number;
  averageConfidence: number;
  latestPlan: string;
  healthBadge: BadgeVariant;
}
