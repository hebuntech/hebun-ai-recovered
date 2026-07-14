import type {
  ExecutiveOverviewRuntimeModel,
  ExecutiveTimelineEventRuntimeModel,
} from "@/features/executive-runtime-support/types";
import {
  ensureRuntimeProjectionRegistry,
  runtimeProjectionRegistry,
} from "@/features/runtime-projection";
import type { KnowledgeRuntimeProjection } from "./types";

export const KnowledgeRuntimeService = {
  getOverview(): ExecutiveOverviewRuntimeModel {
    ensureRuntimeProjectionRegistry();
    return runtimeProjectionRegistry.ensure<KnowledgeRuntimeProjection>("knowledge-runtime").data.overview;
  },

  listTimelineEvents(limit = 8): ExecutiveTimelineEventRuntimeModel[] {
    ensureRuntimeProjectionRegistry();
    return runtimeProjectionRegistry
      .ensure<KnowledgeRuntimeProjection>("knowledge-runtime")
      .data.timeline.slice(0, limit);
  },
};
