import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { agents } from "@/features/agents/mock";
import type { OrchestrationBlueprint } from "@/features/orchestration";

interface OrchestrationAgentsProps {
  blueprint: OrchestrationBlueprint;
}

export function OrchestrationAgents({ blueprint }: OrchestrationAgentsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Availability</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {blueprint.agentAssignments.map((assignment) => {
          const agent = agents.find((item) => item.id === assignment.agentId);
          return (
            <div key={assignment.id} className="rounded-md border bg-surface-sunken p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-fg">{agent?.name ?? assignment.agentId}</p>
                <p className="text-xs text-fg-muted">{agent?.status ?? "unknown"}</p>
              </div>
              <p className="mt-1 text-sm text-fg-secondary">
                {agent?.department ?? "Unknown"} · {agent?.tasksToday ?? 0} tasks today
              </p>
              <p className="mt-2 text-xs text-fg-muted">fallbacks {assignment.fallbackAgentIds.join(", ") || "none"}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
