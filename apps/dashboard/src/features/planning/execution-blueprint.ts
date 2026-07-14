import type {
  ExecutionBlueprint,
  GeneratedPlan,
  PlanSuccessCriterion,
  PlanningTimelineItem,
} from "@/features/planning/types";

function groupedParallelTasks(timeline: PlanningTimelineItem[]) {
  const groups = new Map<string, string[]>();

  timeline.forEach((item) => {
    const key = item.startDate;
    const existing = groups.get(key) ?? [];
    existing.push(item.taskId);
    groups.set(key, existing);
  });

  return Array.from(groups.values()).filter((group) => group.length > 1);
}

export function generateExecutionBlueprint(
  planId: string,
  timeline: PlanningTimelineItem[],
  taskTitles: Map<string, string>,
  successCriteria: PlanSuccessCriterion[],
  planStatus: GeneratedPlan["status"],
  requiredApprovals: string[]
): ExecutionBlueprint {
  const orderedTasks = timeline
    .slice()
    .sort((a, b) => a.sequence - b.sequence)
    .map((item) => taskTitles.get(item.taskId) ?? item.taskId);
  const parallelTasks = groupedParallelTasks(timeline).map((group) =>
    group.map((taskId) => taskTitles.get(taskId) ?? taskId)
  );
  const criticalPath = [
    orderedTasks[0],
    orderedTasks[Math.max(1, orderedTasks.length - 2)],
    orderedTasks[orderedTasks.length - 1],
  ].filter(Boolean);

  return {
    id: `${planId}-blueprint`,
    orderedTasks,
    parallelTasks,
    criticalPath,
    decisionPoints: [
      planStatus === "blocked"
        ? "Resolve planning blockers before sequencing expands."
        : "Confirm the proposed work sequence still matches the approved governance posture.",
      "Decide whether the parallel tasks should remain concurrent or collapse into a tighter control path.",
    ],
    approvalCheckpoints:
      requiredApprovals.length > 0
        ? requiredApprovals.map((approval) => `${approval} approval must clear before execution handoff.`)
        : ["No additional governance approval is required before execution handoff."],
    rollbackPoints: [
      "Return to scope alignment if dependencies or resources drift.",
      "Pause before blueprint release if approval timing changes or registry risks worsen.",
    ],
    completionCriteria: successCriteria.map((criterion) => criterion.label),
  };
}
