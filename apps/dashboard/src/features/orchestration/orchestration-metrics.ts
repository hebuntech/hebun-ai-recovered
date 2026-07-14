import { orchestrationBlueprints } from "@/features/orchestration/orchestration-pipeline";
import { latestOrchestrationBlueprint } from "@/features/orchestration/orchestration-queries";
import type { OrchestrationMetrics } from "@/features/orchestration/types";

const activeBlueprints = orchestrationBlueprints.filter((item) => item.status !== "blocked").length;
const agentAssignments = orchestrationBlueprints.reduce(
  (sum, item) => sum + item.agentAssignments.length,
  0
);
const humanHandoffs = orchestrationBlueprints.reduce(
  (sum, item) => sum + item.handoffs.filter((handoff) => handoff.handoffType !== "agent-to-agent").length,
  0
);
const blockedAssignments = orchestrationBlueprints.reduce(
  (sum, item) => sum + item.agentAssignments.filter((assignment) => assignment.status === "blocked" || assignment.status === "fallback").length,
  0
);
const fallbackCoverage = Math.round(
  (orchestrationBlueprints.reduce(
    (sum, item) =>
      sum +
      item.fallbackStrategy.filter((fallback) => fallback.fallbackAgents.length > 0).length,
    0
  ) /
    Math.max(agentAssignments, 1)) *
    100
);
const averageConfidence = Math.round(
  orchestrationBlueprints.reduce((sum, item) => sum + item.confidence, 0) /
    Math.max(orchestrationBlueprints.length, 1)
);
const orchestrationHealth = Math.max(
  0,
  Math.min(100, Math.round(averageConfidence * 0.45 + fallbackCoverage * 0.25 + activeBlueprints * 8 - blockedAssignments * 6))
);

export const orchestrationMetrics: OrchestrationMetrics = {
  activeBlueprints,
  agentAssignments,
  humanHandoffs,
  blockedAssignments,
  fallbackCoverage,
  orchestrationHealth,
  latestStrategy: latestOrchestrationBlueprint()?.coordinationStrategy ?? "No strategy",
  healthBadge:
    orchestrationHealth >= 90 ? "success" : orchestrationHealth >= 82 ? "warning" : "error",
};
