import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { execStatusConfig } from "@/components/execution/execution-tokens";
import { executionMetrics as m, type ExecutionStatus } from "@/features/execution/mock";

export function ExecutionStatusCard() {
  const rows: { status: ExecutionStatus; count: number }[] = [
    { status: "running", count: m.running },
    { status: "waiting", count: m.waiting },
    { status: "retrying", count: m.retrying },
    { status: "blocked", count: m.blocked },
    { status: "failed", count: m.failed },
    { status: "completed", count: m.completedToday },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Execution Status</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {rows.map((r) => {
          const c = execStatusConfig[r.status];
          return (
            <div key={r.status} className="flex items-center justify-between">
              <span className={cn("inline-flex items-center gap-2 text-sm font-medium", c.text)}>
                <span className={cn("size-2 rounded-full", c.dot)} />
                {c.label}
              </span>
              <span className="text-sm font-semibold tabular-nums text-fg">{r.count}</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
