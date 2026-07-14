import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { latestExecutionSession } from "@/features/execution";
import { sessionMonitorSummary } from "@/features/execution/execution-session";

export function ExecutionMonitorCard() {
  const session = latestExecutionSession();
  if (!session) return null;
  const monitor = sessionMonitorSummary(session);

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Execution Monitor</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="rounded-md border bg-surface-sunken p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
            Monitor Status
          </p>
          <p className="mt-1 text-lg font-semibold text-fg">{monitor.status}</p>
          <p className="mt-2 text-sm text-fg-secondary">{monitor.summary}</p>
        </div>
        {monitor.signals.map((signal) => (
          <div key={signal} className="rounded-md border bg-surface-sunken p-3 text-sm text-fg-secondary">
            {signal}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
