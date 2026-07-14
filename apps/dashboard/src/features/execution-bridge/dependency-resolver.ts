import { formatDuration } from "@/features/task-planning";
import type { CommandCandidate, CommandDependencyGraph, ExecutionOrderStage } from "./types";
import type { ExecutionPlan } from "@/features/task-planning";

function commandIdByTaskId(candidates: CommandCandidate[]): Map<string, string> {
  return new Map(candidates.map((candidate) => [candidate.taskId, candidate.id]));
}

export function resolveCommandDependencies(
  plan: ExecutionPlan,
  candidates: CommandCandidate[]
): {
  candidates: CommandCandidate[];
  dependencyGraph: CommandDependencyGraph;
  executionOrder: ExecutionOrderStage[];
  estimatedDuration: number;
  estimatedDurationLabel: string;
} {
  const byTaskId = commandIdByTaskId(candidates);
  const dependencyMap = new Map(plan.dependencies.dependencies.map((dep) => [dep.taskId, dep]));

  const updatedCandidates = candidates.map((candidate) => {
    const dep = dependencyMap.get(candidate.taskId);
    const dependencies = (dep?.dependsOn ?? [])
      .map((taskId) => byTaskId.get(taskId))
      .filter((value): value is string => Boolean(value));

    const blockedByDependencies = dependencies.some((dependencyId) => {
      const dependency = candidates.find((item) => item.id === dependencyId);
      return dependency?.approvalGateIds.length;
    });

    let status: CommandCandidate["status"] = "ready";
    if (candidate.approvalGateIds.length > 0) status = "waiting-approval";
    else if (blockedByDependencies) status = "blocked";
    else if (dependencies.length > 0) status = "waiting-dependencies";

    return { ...candidate, dependencies, status };
  });

  const nodes = updatedCandidates.map((candidate) => {
    const dep = dependencyMap.get(candidate.taskId);
    return {
      commandId: candidate.id,
      dependsOn: candidate.dependencies,
      blocks: (dep?.blocks ?? [])
        .map((taskId) => byTaskId.get(taskId))
        .filter((value): value is string => Boolean(value)),
      dependencyKind: dep?.kind ?? "sequential",
      blockedByApprovalGateIds: candidate.approvalGateIds,
    };
  });

  const approvalDependencies = updatedCandidates.flatMap((candidate) =>
    candidate.approvalGateIds.map((gateId) => ({
      gateId,
      commandId: candidate.id,
    }))
  );

  const blockedCommands = updatedCandidates
    .filter((candidate) => candidate.status === "blocked" || candidate.status === "waiting-approval")
    .map((candidate) => candidate.id);

  const executionOrder = plan.timeline.stages.map((stage) => {
    const commandIds = stage.taskIds
      .map((taskId) => byTaskId.get(taskId))
      .filter((value): value is string => Boolean(value));

    return {
      order: stage.order,
      label: stage.label,
      commandIds,
      estimatedDuration: stage.estimatedDuration,
    };
  });

  const criticalPath = plan.dependencies.criticalPath
    .map((taskId) => byTaskId.get(taskId))
    .filter((value): value is string => Boolean(value));

  return {
    candidates: updatedCandidates,
    dependencyGraph: {
      nodes,
      parallelGroups: plan.dependencies.parallelGroups.map((group) =>
        group.map((taskId) => byTaskId.get(taskId)).filter((value): value is string => Boolean(value))
      ),
      criticalPath,
      approvalDependencies,
      blockedCommands,
    },
    executionOrder,
    estimatedDuration: plan.timeline.estimatedTotalDuration,
    estimatedDurationLabel: formatDuration(plan.timeline.estimatedTotalDuration),
  };
}

