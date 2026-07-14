import type { ExecutionPlan } from "@/features/task-planning";
import type { CommandPlan, CommandPlanSummary, CommandValidationResult } from "./types";
import type { CommandCandidate, CommandDependencyGraph, ExecutionOrderStage } from "./types";

export function buildCommandPlanSummary(
  plan: ExecutionPlan,
  candidates: CommandCandidate[],
  dependencyGraph: CommandDependencyGraph,
  estimatedDuration: number,
  estimatedDurationLabel: string
): CommandPlanSummary {
  return {
    totalCommands: candidates.length,
    totalApprovals: plan.approvals.length,
    blockedCommands: dependencyGraph.blockedCommands.length,
    criticalPathLength: dependencyGraph.criticalPath.length,
    estimatedDuration,
    estimatedDurationLabel,
    readiness: plan.summary.readiness,
  };
}

export function buildCommandPlan(input: {
  plan: ExecutionPlan;
  commandCandidates: CommandCandidate[];
  dependencyGraph: CommandDependencyGraph;
  executionOrder: ExecutionOrderStage[];
  estimatedDuration: number;
  estimatedDurationLabel: string;
  validation: CommandValidationResult;
}): CommandPlan {
  const summary = buildCommandPlanSummary(
    input.plan,
    input.commandCandidates,
    input.dependencyGraph,
    input.estimatedDuration,
    input.estimatedDurationLabel
  );

  return {
    id: `command-plan-${input.plan.id}`,
    executionPlan: input.plan,
    commandCandidates: input.commandCandidates,
    dependencyGraph: input.dependencyGraph,
    approvalGates: input.plan.approvals,
    executionOrder: input.executionOrder,
    estimatedDuration: input.estimatedDuration,
    summary,
    validation: input.validation,
  };
}

