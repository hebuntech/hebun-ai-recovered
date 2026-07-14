import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrchestrationBlueprint } from "@/features/orchestration";

interface OrchestrationDependenciesProps {
  blueprint: OrchestrationBlueprint;
}

export function OrchestrationDependencies({ blueprint }: OrchestrationDependenciesProps) {
  const titles = new Map(blueprint.plan.tasks.map((task) => [task.id, task.title]));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Dependency Map</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {blueprint.dependencyMap.map((dependency) => (
          <div key={dependency.taskId} className="rounded-md border bg-surface-sunken p-4">
            <p className="text-sm font-semibold text-fg">{titles.get(dependency.taskId) ?? dependency.taskId}</p>
            <p className="mt-1 text-sm text-fg-secondary">
              {dependency.dependsOn.length > 0
                ? dependency.dependsOn.map((item) => titles.get(item) ?? item).join(" -> ")
                : "No upstream blockers."}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
