import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { latestExecutionSession } from "@/features/execution";

export function ExecutionTelemetryCard() {
  const session = latestExecutionSession();
  if (!session) return null;

  const tiles = [
    { label: "Duration", value: session.telemetry.executionDuration },
    { label: "Queue Time", value: session.telemetry.queueTime },
    { label: "Retry Count", value: `${session.telemetry.retryCount}` },
    { label: "Failure Count", value: `${session.telemetry.failureCount}` },
    { label: "Rollback Count", value: `${session.telemetry.rollbackCount}` },
    { label: "Success Rate", value: `${session.telemetry.successRate}%` },
    { label: "Completion Rate", value: `${session.telemetry.completionRate}%` },
    { label: "Avg Task Time", value: session.telemetry.averageTaskTime },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Telemetry</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-md border bg-surface-sunken p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
              {tile.label}
            </p>
            <p className="mt-1 text-sm font-semibold text-fg">{tile.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
