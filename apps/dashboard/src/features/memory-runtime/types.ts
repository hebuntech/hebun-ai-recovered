import type {
  ExecutiveOverviewRuntimeModel,
  ExecutiveTimelineEventRuntimeModel,
} from "@/features/executive-runtime-support/types";

export interface MemoryRuntimeProjection {
  readonly overview: ExecutiveOverviewRuntimeModel;
  readonly timeline: ExecutiveTimelineEventRuntimeModel[];
}
