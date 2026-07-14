import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrchestrationBlueprint } from "@/features/orchestration";

interface OrchestrationHumansProps {
  blueprint: OrchestrationBlueprint;
}

export function OrchestrationHumans({ blueprint }: OrchestrationHumansProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Human Assignments</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {blueprint.humanAssignments.map((assignment) => (
          <div key={assignment.id} className="rounded-md border bg-surface-sunken p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-fg">{assignment.role}</p>
              <p className="text-xs text-fg-muted">{assignment.department}</p>
            </div>
            <p className="mt-1 text-sm text-fg-secondary">{assignment.responsibility}</p>
            <p className="mt-2 text-xs text-fg-muted">
              approval {assignment.approvalRequired ? "required" : "not required"} · escalation {assignment.escalationPath.join(" -> ")}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
