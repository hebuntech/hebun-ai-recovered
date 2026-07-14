import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GeneratedPlan } from "@/features/planning";

interface PlanningDependenciesProps {
  plan: GeneratedPlan;
}

export function PlanningDependencies({ plan }: PlanningDependenciesProps) {
  const taskTitles = new Map(plan.tasks.map((task) => [task.id, task.title]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dependencies</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {plan.dependencies.map((dependency) => (
          <div key={dependency.taskId} className="rounded-md border bg-surface-sunken p-4">
            <p className="text-sm font-semibold text-fg">
              {taskTitles.get(dependency.taskId) ?? dependency.taskId}
            </p>
            <p className="mt-1 text-sm text-fg-secondary">
              {dependency.dependsOn.length > 0
                ? dependency.dependsOn.map((item) => taskTitles.get(item) ?? item).join(" → ")
                : "No prerequisite dependencies."}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
