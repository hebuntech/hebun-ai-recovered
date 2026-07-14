/*
 * routing-context.ts — builds the immutable routing context for a request.
 * Snapshots the matrix-derived provider set and normalizes request fields. No
 * mutation of provider data — everything is read from the Provider Matrix.
 */

import { providerCatalog } from "@/features/provider-matrix";
import type { ProviderCatalogEntry } from "@/features/provider-matrix";
import type { RoutingExecutionRequest } from "@/features/provider-routing/types";

export interface RoutingContext {
  request: RoutingExecutionRequest;
  providers: ProviderCatalogEntry[];
  simulationOnly: boolean;
  approvalRequested: boolean;
}

export function buildRoutingContext(request: RoutingExecutionRequest): RoutingContext {
  return {
    request,
    providers: providerCatalog,
    simulationOnly: request.strategy === "Simulation Only" || request.executionMode === "Simulation",
    approvalRequested: request.requiresApproval || request.strategy === "Human First",
  };
}
