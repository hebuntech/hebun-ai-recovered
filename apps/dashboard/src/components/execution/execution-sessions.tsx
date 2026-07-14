import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { executionSessions } from "@/features/execution";

export function ExecutionSessions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Sessions</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {executionSessions.map((session) => (
          <div key={session.id} className="rounded-md border bg-surface-sunken p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-fg">{session.orchestration.plan.title}</p>
                <p className="mt-1 text-sm text-fg-secondary">{session.summary.explanation}</p>
              </div>
              <p className="text-sm font-medium text-fg-secondary">{session.executionState}</p>
            </div>
            <div className="mt-3 grid gap-2 text-sm text-fg-secondary sm:grid-cols-3">
              <p>Progress: {session.progress.completedTasks}/{session.progress.totalTasks}</p>
              <p>Confidence: {session.confidence}</p>
              <p>Risk: {session.riskLevel}</p>
              <p>Plan: {session.planId}</p>
              <p>Orchestration: {session.orchestrationId}</p>
              <p>Executors: {session.executors.length}</p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
