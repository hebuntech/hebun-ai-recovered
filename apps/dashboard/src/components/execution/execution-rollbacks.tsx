import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { executionSessions } from "@/features/execution";

export function ExecutionRollbacks() {
  const sessions = executionSessions.filter((session) => session.rollbackCount > 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Rollback Activity</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {sessions.map((session) => (
          <div key={session.id} className="rounded-md border bg-surface-sunken p-4">
            <p className="text-sm font-semibold text-fg">{session.orchestration.plan.title}</p>
            <p className="mt-1 text-sm text-fg-secondary">
              {session.rollbackCount} rollback checkpoint(s) preserved from the planning blueprint.
            </p>
            <p className="mt-2 text-xs text-fg-muted">
              {session.orchestration.plan.executionBlueprint.rollbackPoints.join(", ") || "No named rollback points"}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
