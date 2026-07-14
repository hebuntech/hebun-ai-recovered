import type { BadgeVariant } from "@/components/ui/badge";
import type { ExecutionSimulation, SimulatedApprovalState, SimulatedExecutionState } from "./types";

export function simulationStateBadge(state: SimulatedExecutionState): BadgeVariant {
  switch (state) {
    case "completed":
      return "success";
    case "ready":
    case "running":
      return "info";
    case "waiting-approval":
    case "waiting-dependencies":
      return "warning";
    case "blocked":
    case "failed":
    case "cancelled":
      return "error";
    case "skipped":
    case "pending":
    default:
      return "neutral";
  }
}

export function approvalStateBadge(state: SimulatedApprovalState): BadgeVariant {
  switch (state) {
    case "approved":
      return "success";
    case "rejected":
      return "error";
    case "pending":
    case "waiting-approval":
      return "warning";
    default:
      return "neutral";
  }
}

export function deriveSimulationState(simulation: ExecutionSimulation): SimulatedExecutionState {
  const items = simulation.queue.items;

  if (items.some((item) => item.state === "failed")) return "failed";
  if (items.some((item) => item.state === "blocked")) return "blocked";
  if (items.some((item) => item.state === "waiting-approval")) return "waiting-approval";
  if (items.some((item) => item.state === "waiting-dependencies")) return "waiting-dependencies";
  if (items.some((item) => item.state === "running")) return "running";
  if (items.some((item) => item.state === "ready")) return "ready";
  if (items.every((item) => item.state === "cancelled")) return "cancelled";
  if (
    items.every((item) =>
      ["completed", "skipped", "cancelled"].includes(item.state)
    )
  ) {
    return "completed";
  }
  return "pending";
}

