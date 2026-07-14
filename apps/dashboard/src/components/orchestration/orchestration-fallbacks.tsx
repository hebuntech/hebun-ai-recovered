import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrchestrationBlueprint } from "@/features/orchestration";

interface OrchestrationFallbacksProps {
  blueprint: OrchestrationBlueprint;
}

export function OrchestrationFallbacks({ blueprint }: OrchestrationFallbacksProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Fallback Strategy</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {blueprint.fallbackStrategy.map((fallback) => (
          <div key={fallback.taskId} className="rounded-md border bg-surface-sunken p-4">
            <p className="text-sm font-semibold text-fg">{fallback.taskId}</p>
            <p className="mt-1 text-sm text-fg-secondary">{fallback.summary}</p>
            <p className="mt-2 text-xs text-fg-muted">
              agents {fallback.fallbackAgents.join(", ")} · human {fallback.fallbackHumanRole}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
