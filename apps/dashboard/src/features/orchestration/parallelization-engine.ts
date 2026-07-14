import type { GeneratedPlan } from "@/features/planning";

function taskIdByTitle(plan: GeneratedPlan, title: string) {
  return plan.tasks.find((task) => task.title === title)?.id ?? title;
}

export function identifyParallelGroups(plan: GeneratedPlan) {
  return plan.executionBlueprint.parallelTasks.map((group) =>
    group.map((title) => taskIdByTitle(plan, title))
  );
}
