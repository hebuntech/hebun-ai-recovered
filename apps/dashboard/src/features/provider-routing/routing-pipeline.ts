/*
 * routing-pipeline.ts — the ordered, deterministic routing pipeline definition
 * and the batch runner that produces decisions for every sample request. The
 * pipeline is descriptive (for UI + audit); execution of each step lives in the
 * dedicated filter/engine modules.
 */

import { route } from "@/features/provider-routing/routing-engine";
import { sampleRequests } from "@/features/provider-routing/routing-rules";
import type { RoutingDecision } from "@/features/provider-routing/types";

export interface PipelineStep {
  order: number;
  label: string;
  description: string;
}

export const routingPipeline: PipelineStep[] = [
  { order: 1, label: "Receive Execution Request", description: "Accept a task with required capabilities and strategy." },
  { order: 2, label: "Build Routing Context", description: "Snapshot the matrix provider set for this request." },
  { order: 3, label: "Resolve Required Capabilities", description: "Normalize the requested capabilities." },
  { order: 4, label: "Load Provider Matrix", description: "Read the centralized capability matrix (no duplication)." },
  { order: 5, label: "Filter by Capability", description: "Drop providers that cannot serve the capabilities." },
  { order: 6, label: "Filter by Health", description: "Drop unhealthy providers." },
  { order: 7, label: "Filter by Constraints", description: "Check execution mode and availability." },
  { order: 8, label: "Filter by Policy", description: "Apply declared policy constraints." },
  { order: 9, label: "Filter by Approval", description: "Flag approval-gated capabilities." },
  { order: 10, label: "Rank Providers", description: "Order candidates by the selected strategy." },
  { order: 11, label: "Select Primary Provider", description: "Pick the top-ranked provider." },
  { order: 12, label: "Select Fallback Providers", description: "Assign the fallback chain." },
  { order: 13, label: "Build Routing Decision", description: "Assemble the explainable decision object." },
  { order: 14, label: "Produce Routing Report", description: "Emit the audit-friendly routing report." },
];

/** run the engine over every sample request — deterministic result set */
export const routingDecisions: RoutingDecision[] = sampleRequests.map(route);

export function decisionByRequestId(requestId: string): RoutingDecision | undefined {
  return routingDecisions.find((d) => d.requestId === requestId);
}
