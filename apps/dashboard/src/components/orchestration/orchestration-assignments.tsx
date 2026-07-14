import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrchestrationBlueprint } from "@/features/orchestration";

interface OrchestrationAssignmentsProps {
  blueprint: OrchestrationBlueprint;
}

export function OrchestrationAssignments({ blueprint }: OrchestrationAssignmentsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Agent Assignments</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {blueprint.agentAssignments.map((assignment) => (
          <div key={assignment.id} className="rounded-md border bg-surface-sunken p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-fg">{assignment.agentRole}</p>
              <p className="text-xs text-fg-muted">
                {assignment.status} · {assignment.confidence}
              </p>
            </div>
            <p className="mt-1 text-sm text-fg-secondary">{assignment.assignmentReason}</p>
            <p className="mt-2 text-xs text-fg-muted">
              task {assignment.taskId} · tools {assignment.requiredTools.length} · capabilities {assignment.requiredCapabilities.length}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
