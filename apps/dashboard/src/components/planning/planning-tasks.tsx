import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GeneratedPlan } from "@/features/planning";

interface PlanningTasksProps {
  plan: GeneratedPlan;
}

export function PlanningTasks({ plan }: PlanningTasksProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Task Hierarchy</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {plan.tasks.map((task) => (
          <div key={task.id} className="rounded-md border bg-surface-sunken p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-fg">{task.title}</p>
              <p className="text-xs text-fg-muted">
                {task.priority} · {task.estimatedDuration}
              </p>
            </div>
            <p className="mt-1 text-sm text-fg-secondary">{task.description}</p>
            <p className="mt-2 text-xs text-fg-muted">
              {task.type} · owner {task.owner} · deps {task.dependencyIds.length}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
