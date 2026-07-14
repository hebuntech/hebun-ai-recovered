import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { executionSessions, latestExecutionSession } from "@/features/execution";
import { executionStateLabels, executionStateOrder } from "@/features/execution/execution-state";

export function ExecutionStateCard() {
  const session = latestExecutionSession();
  if (!session) return null;

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Execution State</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="rounded-md border bg-surface-sunken p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
            Current Session
          </p>
          <p className="mt-1 text-lg font-semibold text-fg">
            {executionStateLabels[session.executionState]}
          </p>
          <p className="mt-2 text-sm text-fg-secondary">{session.summary.outcome}</p>
        </div>
        {executionStateOrder
          .map((state) => ({
            state,
            count: executionSessions.filter((sessionItem) => sessionItem.executionState === state).length,
          }))
          .filter((item) => item.count > 0)
          .map((item) => (
            <div key={item.state} className="flex items-center justify-between text-sm">
              <span className="text-fg-secondary">{executionStateLabels[item.state]}</span>
              <span className="font-semibold text-fg">{item.count}</span>
            </div>
          ))}
      </CardContent>
    </Card>
  );
}
