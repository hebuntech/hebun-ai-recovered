import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { executionHistory } from "@/features/execution";

export function ExecutionHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution History</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {executionHistory.map((item) => (
          <div key={item.id} className="rounded-md border bg-surface-sunken p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-semibold text-fg">{item.title}</p>
              <p className="text-xs text-fg-muted">{item.timestamp}</p>
            </div>
            <p className="mt-1 text-sm text-fg-secondary">{item.outcome}</p>
            <p className="mt-2 text-xs text-fg-muted">
              {item.owner} · {item.progressLabel}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
