import type { PlanTask, ResourceAllocation } from "@/features/planning/types";

function daysFromDuration(value: string) {
  const match = value.match(/(\d+)/);
  return match ? Number(match[1]) : 1;
}

export function estimateCapacity(tasks: PlanTask[], allocation: ResourceAllocation) {
  const estimatedDurationDays = tasks.reduce(
    (sum, task) => sum + daysFromDuration(task.estimatedDuration),
    0
  );
  const estimatedEffort = tasks.reduce(
    (sum, task) => sum + daysFromDuration(task.estimatedDuration) * 8,
    0
  );

  const duration = allocation.utilizationScore > 88 ? estimatedDurationDays + 2 : estimatedDurationDays;

  return {
    estimatedDurationDays: duration,
    estimatedDuration: `${duration} days`,
    estimatedEffort,
  };
}
