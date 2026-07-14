import type { DirectorAIRecommendation } from "@/features/director-ai-runtime";
import type { RuntimeObservationModel } from "@/features/organizational-intelligence";

export type TransformationDomain =
  | "organization"
  | "people"
  | "agents"
  | "workflows"
  | "knowledge"
  | "memory"
  | "governance"
  | "policy"
  | "execution-readiness"
  | "learning-readiness"
  | "organizational-intelligence-readiness";

export type TransformationMaturityLevel = 0 | 1 | 2 | 3 | 4 | 5;
export type TransformationSeverity = "critical" | "high" | "medium" | "low";
export type TransformationPriorityLevel = "critical" | "high" | "medium" | "low";
export type TransformationReadinessStatus = "unready" | "emerging" | "ready" | "advanced";
export type TransformationRoadmapPhase =
  | "Foundation"
  | "Visibility"
  | "Governance"
  | "Assisted Operations"
  | "Agent Collaboration"
  | "Orchestrated Execution"
  | "Continuous Learning"
  | "AI-native Optimization";

export interface TransformationMaturityAssessment {
  level: TransformationMaturityLevel;
  label: "Unobserved" | "Manual" | "Digitized" | "Assisted" | "Orchestrated" | "AI-native";
  confidence: number;
  summary: string;
}

export interface TransformationReadiness {
  score: number;
  status: TransformationReadinessStatus;
  summary: string;
}

export interface TransformationGap {
  id: string;
  domain: TransformationDomain;
  severity: TransformationSeverity;
  confidence: number;
  affectedScope: string;
  summary: string;
  evidence: string[];
  consequence: string;
  recommendedResponse: string;
}

export interface TransformationPriority {
  level: TransformationPriorityLevel;
  score: number;
  businessCriticality: number;
  architecturalDependency: number;
  riskReduction: number;
  organizationalReadiness: number;
  implementationEffort: "low" | "medium" | "high";
  blockedCapabilities: string[];
  confidence: number;
  summary: string;
}

export interface TransformationInitiative {
  id: string;
  title: string;
  objective: string;
  rationale: string;
  priority: TransformationPriority;
  dependencies: string[];
  expectedOutcome: string;
  affectedDomains: TransformationDomain[];
  evidence: string[];
  readiness: TransformationReadiness;
  recommendedOwnerType: "director" | "human-manager" | "department-lead" | "governance" | "operations";
  status: "proposed";
}

export interface TransformationRecommendation {
  id: string;
  title: string;
  summary: string;
  rationale: string;
  priority: TransformationPriorityLevel;
  confidence: number;
  affectedDomains: TransformationDomain[];
  recommendedActions: string[];
  evidence: string[];
}

export interface TransformationDomainAssessment {
  domain: TransformationDomain;
  maturity: TransformationMaturityAssessment;
  health: number;
  readiness: TransformationReadiness;
  evidence: string[];
  gaps: TransformationGap[];
  risks: string[];
  opportunities: string[];
  recommendedNextStep: string;
}

export interface TransformationRoadmapStage {
  phase: TransformationRoadmapPhase;
  summary: string;
  initiativeIds: string[];
}

export interface TransformationRoadmap {
  currentPhase: TransformationRoadmapPhase;
  nextMilestone: string;
  stages: TransformationRoadmapStage[];
  summary: string;
}

export interface TransformationRuntimeSnapshot {
  generatedAt: string;
  observations: RuntimeObservationModel;
  overallMaturity: TransformationMaturityAssessment;
  overallReadiness: TransformationReadiness;
  domainAssessments: TransformationDomainAssessment[];
  gaps: TransformationGap[];
  initiatives: TransformationInitiative[];
  recommendations: TransformationRecommendation[];
  roadmap: TransformationRoadmap;
  summary: string;
}

export interface TransformationDashboardSurface {
  metrics: Array<{
    label: string;
    value: string;
    detail: string;
  }>;
  gaps: Array<{
    id: string;
    title: string;
    detail: string;
    meta?: string;
    status?: string;
    href?: string;
  }>;
  initiatives: Array<{
    id: string;
    title: string;
    detail: string;
    meta?: string;
    status?: string;
    href?: string;
  }>;
  empty: boolean;
}

export interface DirectorAITransformationSurface {
  recommendations: DirectorAIRecommendation[];
  summary: string;
}
