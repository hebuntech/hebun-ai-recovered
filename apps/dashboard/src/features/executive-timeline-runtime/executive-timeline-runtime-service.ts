import type { ExecutiveTimelineEventRuntimeModel } from "@/features/executive-runtime-support/types";
import {
  ensureRuntimeProjectionRegistry,
  runtimeProjectionRegistry,
} from "@/features/runtime-projection";

export const ExecutiveTimelineRuntimeService = {
  listTimelineEvents(limit = 10): ExecutiveTimelineEventRuntimeModel[] {
    ensureRuntimeProjectionRegistry();
    return runtimeProjectionRegistry
      .ensure<ExecutiveTimelineEventRuntimeModel[]>("executive-timeline-runtime")
      .data.slice(0, limit);
  },
};
