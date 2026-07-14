import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { executionSessions } from "@/features/execution";

export function ExecutionRetries() {
  const sessions = executionSessions.filter((session) => session.retryCount > 0);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Retry Activity</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {sessions.map((session) => (
          <div key={session.id} className="rounded-md border bg-surface-sunken p-4">
            <p className="text-sm font-semibold text-fg">{session.orchestration.plan.title}</p>
            <p className="mt-1 text-sm text-fg-secondary">
              {session.retryCount} retries reserved across {session.executorAssignments.length} execution assignments.
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
