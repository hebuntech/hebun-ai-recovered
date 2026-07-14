import { getAgentExecutionBridge, getExecutiveExecutionBridges } from "@/features/execution-bridge";
import { buildExecutionSimulation } from "./execution-engine";
import { simulationStateBadge } from "./execution-state";
import type { ExecutiveExecutionSimulationRow, ExecutionEngineResult } from "./types";

export function getAgentExecutionSimulation(agentId: string): ExecutionEngineResult | null {
  const bridge = getAgentExecutionBridge(agentId);
  return bridge ? buildExecutionSimulation(bridge.commandPlan) : null;
}

export function getExecutiveExecutionSimulations(): ExecutionEngineResult[] {
  return getExecutiveExecutionBridges().map((bridge) =>
    buildExecutionSimulation(bridge.commandPlan)
  );
}

export function getExecutiveExecutionMonitor(): ExecutiveExecutionSimulationRow[] {
  return getExecutiveExecutionSimulations().map(({ simulation }) => {
    const pendingApprovals = simulation.approvals.some((item) => item.state === "pending");
    const rejectedApprovals = simulation.approvals.some((item) => item.state === "rejected");
    return {
      agentId: simulation.executionPlan.agentId,
      agentName: simulation.executionPlan.agentName,
      progress: simulation.summary.completionPercent,
      blockedCommands: simulation.summary.blocked,
      approvalStatus: rejectedApprovals
        ? "rejected"
        : pendingApprovals
          ? "pending"
          : "approved",
      criticalPath: simulation.summary.criticalPathLength,
      completionPercent: simulation.summary.completionPercent,
      estimatedCompletion: simulation.summary.estimatedDurationLabel,
      state: simulation.state,
      badge: simulationStateBadge(simulation.state),
    };
  });
}

