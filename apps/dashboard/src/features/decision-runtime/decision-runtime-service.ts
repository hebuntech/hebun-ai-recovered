import type { ExecutiveListItemRuntimeModel } from "@/features/executive-runtime-support/types";
import {
  ensureRuntimeProjectionRegistry,
  runtimeProjectionRegistry,
} from "@/features/runtime-projection";
import type { DecisionRuntimeModel, DecisionRuntimeProjection } from "./types";

export const DecisionRuntimeService = {
  listDecisions(): DecisionRuntimeModel[] {
    ensureRuntimeProjectionRegistry();
    return runtimeProjectionRegistry.ensure<DecisionRuntimeProjection>("decision-runtime").data.decisions;
  },

  listDashboardItems(limit = 6): ExecutiveListItemRuntimeModel[] {
    ensureRuntimeProjectionRegistry();
    return runtimeProjectionRegistry
      .ensure<DecisionRuntimeProjection>("decision-runtime")
      .data.dashboardItems.slice(0, limit);
  },
};
