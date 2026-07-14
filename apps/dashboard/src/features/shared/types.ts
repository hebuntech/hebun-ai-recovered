import type { RegistryKey } from "@/features/registries/types";

export type CoreRiskLevel = "low" | "medium" | "high" | "critical";

export interface RelatedReferenceIds {
  relatedRegistryIds: RegistryKey[];
  relatedGraphNodeIds: string[];
  relatedMemoryIds: string[];
}

export interface DownstreamReferenceIds extends RelatedReferenceIds {
  relatedReasoningIds: string[];
  relatedGovernanceIds: string[];
  relatedPlanningIds?: string[];
  relatedOrchestrationIds?: string[];
}

export interface PipelineRecordTimestamps {
  createdAt: string;
  updatedAt: string;
}
