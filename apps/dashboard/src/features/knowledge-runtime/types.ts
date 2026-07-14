import type {
  ExecutiveOverviewRuntimeModel,
  ExecutiveTimelineEventRuntimeModel,
} from "@/features/executive-runtime-support/types";

export interface KnowledgeRuntimeProjection {
  readonly overview: ExecutiveOverviewRuntimeModel;
  readonly timeline: ExecutiveTimelineEventRuntimeModel[];
}
