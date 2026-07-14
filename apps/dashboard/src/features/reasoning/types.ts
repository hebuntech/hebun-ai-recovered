import type { BadgeVariant } from "@/components/ui/badge";
import type { KnowledgeGraphRelationship, KnowledgeGraphNode } from "@/features/knowledge-graph";
import type { MemoryRecord } from "@/features/memory";
import type { RegistryDefinition, RegistryKey } from "@/features/registries/types";
import type { CoreRiskLevel, RelatedReferenceIds } from "@/features/shared";

export type EvidenceSourceType = "registry" | "intelligence" | "memory" | "graph";
export type ConstraintStatus = "pass" | "watch" | "fail";
export type GoalStatus = "aligned" | "partial" | "blocked";
export type ReasoningRiskLevel = CoreRiskLevel;

export interface ReasoningScenario {
  id: string;
  title: string;
  objective: string;
  focus: string;
  query: string;
  registryIds: RegistryKey[];
  hardConstraints: string[];
  softConstraints: string[];
  goalLabels: string[];
  timestamp: string;
}

export interface ReasoningContext {
  scenarioId: string;
  title: string;
  objective: string;
  focus: string;
  registries: RegistryDefinition[];
  registryIds: RegistryKey[];
  query: string;
  hardConstraints: string[];
  softConstraints: string[];
  goalLabels: string[];
}

export interface ReasoningEvidence {
  id: string;
  sourceType: EvidenceSourceType;
  title: string;
  detail: string;
  weight: number;
  registryIds: RegistryKey[];
  graphNodeIds: string[];
  memoryIds: string[];
}

export interface ReasoningConstraint {
  id: string;
  label: string;
  status: ConstraintStatus;
  detail: string;
  scoreImpact: number;
}

export interface ReasoningGoal {
  id: string;
  label: string;
  status: GoalStatus;
  alignmentScore: number;
  detail: string;
}

export interface CandidateOption {
  id: string;
  title: string;
  summary: string;
  actions: string[];
  benefits: string[];
  downsides: string[];
  relatedRegistryIds: RegistryKey[];
  relatedGraphNodeIds: string[];
  relatedMemoryIds: string[];
}

export interface OptionTradeoff {
  optionId: string;
  upsideScore: number;
  costScore: number;
  riskScore: number;
  speedScore: number;
  totalScore: number;
  summary: string;
}

export interface ReasoningRecommendation {
  title: string;
  summary: string;
  nextStep: string;
  whyNow: string;
}

export interface ReasoningExplanation {
  summary: string;
  evidenceTrace: string[];
  constraintTrace: string[];
  goalTrace: string[];
  whySelected: string[];
}

export interface ReasoningPipelineStep {
  id: string;
  label: string;
  description: string;
}

export interface ReasoningResult extends RelatedReferenceIds {
  id: string;
  context: ReasoningContext;
  evidence: ReasoningEvidence[];
  constraints: ReasoningConstraint[];
  goals: ReasoningGoal[];
  candidateOptions: CandidateOption[];
  selectedOption: CandidateOption;
  confidenceScore: number;
  riskLevel: ReasoningRiskLevel;
  tradeoffs: OptionTradeoff[];
  recommendation: ReasoningRecommendation;
  explanation: ReasoningExplanation;
  relatedMemories: MemoryRecord[];
  relatedGraphLinks: KnowledgeGraphRelationship[];
  relatedGraphNodes: KnowledgeGraphNode[];
  timestamp: string;
}

export interface ReasoningMetrics {
  latestRecommendation: string;
  averageConfidence: number;
  openSessions: number;
  health: number;
  healthBadge: BadgeVariant;
  totalSessions: number;
}
