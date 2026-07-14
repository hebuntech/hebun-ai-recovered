import type { CommandPlan, ExecutionPreview } from "./types";

export function buildExecutionPreview(plan: CommandPlan): ExecutionPreview {
  return {
    agentId: plan.executionPlan.agentId,
    agentName: plan.executionPlan.agentName,
    commands: plan.commandCandidates,
    dependencies: plan.dependencyGraph,
    executionOrder: plan.executionOrder,
    approvalGates: plan.approvalGates,
    criticalPath: plan.dependencyGraph.criticalPath,
    estimatedDuration: plan.summary.estimatedDurationLabel,
    summary: plan.summary,
    validation: plan.validation,
  };
}

