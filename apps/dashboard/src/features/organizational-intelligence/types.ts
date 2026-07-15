import type { AgentEmployeeRuntimeModel } from "@/features/agent-runtime";
import type { GovernanceApproval, GovernanceMetrics, GovernancePolicy, GovernanceRisk } from "@/features/governance/types";
import type {
  CompanyRuntimeModel,
  DepartmentRuntimeModel,
  HumanRuntimeModel,
} from "@/features/organization-runtime";
import type { MemoryRuntimeReport } from "@/features/memory-runtime";
import type { WorkflowRuntimeModel } from "@/features/workflow-runtime";

export type IntelligenceSeverity = "critical" | "high" | "medium" | "low";
export type IntelligenceType =
  | "health"
  | "risk"
  | "opportunity"
  | "performance"
  | "capacity"
  | "executive";

export interface OrganizationalIntelligenceInsight {
  id: string;
  type: IntelligenceType;
  severity: IntelligenceSeverity;
  confidence: number;
  category: string;
  sourceRuntime: string;
  affectedOrganization?: string;
  affectedDepartment?: string;
  affectedAgents: string[];
  affectedWorkflows: string[];
  summary: string;
  evidence: string[];
  recommendedNextAction: string;
  createdAt: string;
}

export interface OrganizationalIntelligenceMetric {
  label: string;
  value: string;
  detail: string;
}

export interface DepartmentHealthAssessment {
  id: string;
  label: string;
  score: number;
  detail: string;
  trend: string;
}

export interface RuntimeObservationModel {
  company: CompanyRuntimeModel;
  departments: DepartmentRuntimeModel[];
  humans: HumanRuntimeModel[];
  agents: AgentEmployeeRuntimeModel[];
  workflows: WorkflowRuntimeModel[];
  governance: {
    metrics: GovernanceMetrics;
    approvals: GovernanceApproval[];
    risks: GovernanceRisk[];
    policies: GovernancePolicy[];
  };
  knowledge: {
    totalReferences: number;
    verifiedKnowledge: number;
    lowCoverageAgents: number;
    lowCoverageWorkflows: number;
  };
  memory: {
    report: MemoryRuntimeReport;
    totalReferences: number;
    lowCoverageWorkflows: number;
  };
  learning: {
    totalSignals: number;
    relatedWorkflows: number;
    relatedAgents: number;
  };
  performanceSeed: {
    knowledgeCoverage: number;
  };
}

export interface HealthAssessmentModel {
  overallEnterpriseHealth: number;
  organizationHealth: number;
  departmentHealth: DepartmentHealthAssessment[];
  agentHealth: number;
  workflowHealth: number;
  knowledgeHealth: number;
  memoryHealth: number;
  transformationHealth: number;
}

export interface PerformanceAssessmentModel {
  workflowSuccess: number;
  workflowThroughput: number;
  agentReadiness: number;
  governanceHealth: number;
  knowledgeCoverage: number;
}

export interface CapacityAssessmentModel {
  idleAgents: number;
  overloadedAgents: number;
  availableCapacity: number;
  utilizationScore: number;
}

export interface OrganizationScoreModel {
  enterpriseScore: number;
  executionScore: number;
  intelligenceScore: number;
  governanceScore: number;
}

export interface OrganizationalIntelligenceSnapshot {
  generatedAt: string;
  observations: RuntimeObservationModel;
  health: HealthAssessmentModel;
  performance: PerformanceAssessmentModel;
  capacity: CapacityAssessmentModel;
  scores: OrganizationScoreModel;
  companyOverview: {
    healthScore: number;
    metrics: OrganizationalIntelligenceMetric[];
  };
  risks: OrganizationalIntelligenceInsight[];
  opportunities: OrganizationalIntelligenceInsight[];
  executiveInsights: OrganizationalIntelligenceInsight[];
}
