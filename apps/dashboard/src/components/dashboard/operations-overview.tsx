import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orgDepartments } from "@/features/organization/mock";

export function OperationsOverview() {
  const operations = orgDepartments.find((department) => department.id === "operations");
  if (!operations) return null;
  const metrics = [
    ["Health", `${operations.health}%`],
    ["Capacity", `${operations.capacity}%`],
    ["Running Tasks", operations.runningTasks],
    ["Waiting Tasks", operations.waitingTasks],
    ["Completed Today", operations.completedToday],
    ["Response Time", operations.avgResponseTime],
  ] as const;
  return (
    <Card>
      <CardHeader><CardTitle>Operations Overview</CardTitle><span className="text-xs text-fg-muted">current operating state</span></CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {metrics.map(([label, value]) => (
          <div key={label} className="rounded-md border bg-surface-sunken p-3">
            <p className="text-xs uppercase tracking-wider text-fg-muted">{label}</p>
            <p className="mt-1 font-semibold tabular-nums">{String(value)}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
