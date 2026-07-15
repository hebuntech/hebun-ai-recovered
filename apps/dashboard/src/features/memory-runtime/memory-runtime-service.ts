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

  getReport(): MemoryRuntimeProjection["report"] {
    ensureRuntimeProjectionRegistry();
    return runtimeProjectionRegistry.ensure<MemoryRuntimeProjection>("memory-runtime").data.report;
  },

  getActiveCount(): number {
    ensureRuntimeProjectionRegistry();
    return runtimeProjectionRegistry.ensure<MemoryRuntimeProjection>("memory-runtime").data.statistics.active;
  },

  getTypeCount(type: string): number {
    ensureRuntimeProjectionRegistry();
    return runtimeProjectionRegistry.ensure<MemoryRuntimeProjection>("memory-runtime").data.statistics.typeCounts[type] ?? 0;
  },
};
