import type { BadgeVariant } from "@/components/ui/badge";
import type { GeneratedPlan } from "@/features/planning";
import type {
  CoreRiskLevel,
  DownstreamReferenceIds,
  PipelineRecordTimestamps,
} from "@/features/shared";

export type OrchestrationStatus = "ready" | "approval-gated" | "fallback-required" | "blocked";
export type CoordinationStrategy =
  | "Sequential"
  | "Parallel"
  | "Hybrid"
  | "Human-in-the-loop"
  | "Approval-gated"
  | "Risk-controlled"
  | "Fallback-first";
export type AssignmentStatus = "ready" | "waiting" | "blocked" | "fallback";
export type HandoffRiskLevel = "low" | "medium" | "high";

export interface AgentAssignment {
  id: string;
  taskId: string;
  agentId: string;
  agentRole: string;
  requiredCapabilities: string[];
  requiredTools: string[];
  assignmentReason: string;
  confidence: number;
  status: AssignmentStatus;
  fallbackAgentIds: string[];
  humanEscalationRole: string;
}

export interface HumanAssignment {
  id: string;
  taskId: string;
  role: string;
  department: string;
  responsibility: string;
  approvalRequired: boolean;
  escalationPath: string[];
}

export interface ToolAssignment {
  taskId: string;
  toolIds: string[];
  summary: string;
}

export interface CapabilityRequirement {
  taskId: string;
  capabilityIds: string[];
  summary: string;
}

export interface HandoffPlan {
  id: string;
  fromTaskId: string;
  toTaskId: string;
  fromOwner: string;
  toOwner: string;
  handoffType: "agent-to-agent" | "agent-to-human" | "human-to-agent" | "human-to-human";
  requiredContext: string[];
  acceptanceCriteria: string[];
  riskLevel: HandoffRiskLevel;
}

export interface ApprovalGate {
  id: string;
  taskId?: string;
  mode: string;
  owner: string;
  summary: string;
  status: "required" | "cleared" | "pending";
}

export interface AvailabilityAssessment {
  availableAgents: string[];
  constrainedAgents: string[];
  overloadedAgents: string[];
  humanCoverage: string[];
  summary: string;
}

export interface FallbackPlan {
  taskId: string;
  fallbackAgents: string[];
  fallbackHumanRole: string;
  summary: string;
}

export interface OrchestrationRisk {
  id: string;
  title: string;
  level: CoreRiskLevel;
  detail: string;
  mitigation: string;
}

export interface OrchestrationValidationResult {
  valid: boolean;
  issues: string[];
  checks: {
    missingAgentOwnership: boolean;
    missingCapabilities: boolean;
    missingTools: boolean;
    unresolvedDependencies: boolean;
    circularDependencies: boolean;
    approvalConflicts: boolean;
    capacityOverload: boolean;
    unavailableAgents: boolean;
    missingFallbackOwners: boolean;
    humanEscalationGaps: boolean;
  };
  summary: string;
}

export interface OrchestrationExplanation {
  summary: string;
  assignmentTrace: string[];
  handoffTrace: string[];
  approvalTrace: string[];
  fallbackTrace: string[];
}

export interface OrchestrationBlueprint
  extends DownstreamReferenceIds, PipelineRecordTimestamps {
  id: string;
  planId: string;
  planningBlueprintId: string;
  status: OrchestrationStatus;
  coordinationStrategy: CoordinationStrategy;
  agentAssignments: AgentAssignment[];
  humanAssignments: HumanAssignment[];
  toolAssignments: ToolAssignment[];
  capabilityRequirements: CapabilityRequirement[];
  dependencyMap: GeneratedPlan["dependencies"];
  parallelGroups: string[][];
  handoffs: HandoffPlan[];
  approvalGates: ApprovalGate[];
  availabilityAssessment: AvailabilityAssessment;
  fallbackStrategy: FallbackPlan[];
  riskAssessment: OrchestrationRisk[];
  validationResult: OrchestrationValidationResult;
  confidence: number;
  explanation: OrchestrationExplanation;
  relatedPlanningIds: string[];
  plan: GeneratedPlan;
}

export interface OrchestrationPipelineStep {
  id: string;
  label: string;
  description: string;
}

export interface OrchestrationMetrics {
  activeBlueprints: number;
  agentAssignments: number;
  humanHandoffs: number;
  blockedAssignments: number;
  fallbackCoverage: number;
  orchestrationHealth: number;
  latestStrategy: string;
  healthBadge: BadgeVariant;
}
