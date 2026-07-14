import type {
  ExecutiveOverviewRuntimeModel,
  ExecutiveTimelineEventRuntimeModel,
} from "@/features/executive-runtime-support/types";
import {
  ensureRuntimeProjectionRegistry,
  runtimeProjectionRegistry,
} from "@/features/runtime-projection";
import type { MemoryRuntimeProjection } from "./types";

export const MemoryRuntimeService = {
  getOverview(): ExecutiveOverviewRuntimeModel {
    ensureRuntimeProjectionRegistry();
    return runtimeProjectionRegistry.ensure<MemoryRuntimeProjection>("memory-runtime").data.overview;
  },

  listTimelineEvents(limit = 8): ExecutiveTimelineEventRuntimeModel[] {
    ensureRuntimeProjectionRegistry();
    return runtimeProjectionRegistry
      .ensure<MemoryRuntimeProjection>("memory-runtime")
      .data.timeline.slice(0, limit);
  },
};
