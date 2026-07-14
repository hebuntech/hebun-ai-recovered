import type { CommandPlan, ExecutionBridgeReport, ExecutionBridgeTelemetry, ExecutionHistoryEntry } from "./types";

function commandCounters(plan: CommandPlan): Pick<
  ExecutionBridgeTelemetry,
  "creates" | "updates" | "archives" | "restores" | "softDeletes"
> {
  const counters = {
    creates: 0,
    updates: 0,
    archives: 0,
    restores: 0,
    softDeletes: 0,
  };

  for (const candidate of plan.commandCandidates) {
    if (candidate.commandType.endsWith(".create")) counters.creates += 1;
    if (candidate.commandType.endsWith(".update")) counters.updates += 1;
    if (candidate.commandType.endsWith(".archive")) counters.archives += 1;
    if (candidate.commandType.endsWith(".restore")) counters.restores += 1;
    if (candidate.commandType.endsWith(".delete")) counters.softDeletes += 1;
  }

  return counters;
}

export function buildExecutionHistory(plan: CommandPlan): ExecutionHistoryEntry[] {
  return [
    {
      id: `${plan.id}-mapping`,
      stage: "mapping",
      detail: `${plan.commandCandidates.length} task(s) mapped into command candidates.`,
    },
    {
      id: `${plan.id}-dependency-resolution`,
      stage: "dependency-resolution",
      detail: `${plan.dependencyGraph.nodes.length} dependency node(s), ${plan.dependencyGraph.parallelGroups.length} parallel group(s), ${plan.dependencyGraph.approvalDependencies.length} approval dependency link(s).`,
    },
    {
      id: `${plan.id}-validation`,
      stage: "validation",
      detail: plan.validation.valid
        ? "Command plan validation passed."
        : `${plan.validation.issues.length} validation issue(s) detected.`,
    },
    {
      id: `${plan.id}-preview`,
      stage: "preview",
      detail: `Execution preview prepared for ${plan.executionPlan.agentName}.`,
    },
  ];
}

export function buildExecutionBridgeReport(
  plan: CommandPlan,
  commandLatencyMs: number
): ExecutionBridgeReport {
  const history = buildExecutionHistory(plan);

  return {
    planId: plan.id,
    agentId: plan.executionPlan.agentId,
    agentName: plan.executionPlan.agentName,
    telemetry: {
      ...commandCounters(plan),
      validationFailures: plan.validation.issues.length,
      commandLatencyMs,
      historyCount: history.length,
    },
    history,
  };
}

