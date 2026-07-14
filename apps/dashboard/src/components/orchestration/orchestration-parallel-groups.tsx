import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrchestrationBlueprint } from "@/features/orchestration";

interface OrchestrationParallelGroupsProps {
  blueprint: OrchestrationBlueprint;
}

export function OrchestrationParallelGroups({ blueprint }: OrchestrationParallelGroupsProps) {
  const titles = new Map(blueprint.plan.tasks.map((task) => [task.id, task.title]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Parallel Work Groups</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {blueprint.parallelGroups.map((group, index) => (
          <div key={`${group.join("-")}-${index}`} className="rounded-md border bg-surface-sunken p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
              Group {index + 1}
            </p>
            <div className="mt-2 flex flex-col gap-2 text-sm text-fg-secondary">
              {group.map((taskId) => (
                <p key={taskId}>{titles.get(taskId) ?? taskId}</p>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
