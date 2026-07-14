import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { orgDepartments } from "@/features/organization/mock";
import { workloadCell } from "@/components/organization/org-tokens";

const legendOrder = ["idle", "low", "medium", "high", "critical"] as const;

export function CapacityHeatmap() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Capacity Heatmap</CardTitle>
        <div className="flex flex-wrap items-center gap-3">
          {legendOrder.map((w) => (
            <span key={w} className="inline-flex items-center gap-1.5 text-xs text-fg-secondary">
              <span className={cn("size-2.5 rounded-sm", workloadCell[w].bg)} />
              {workloadCell[w].label}
            </span>
          ))}
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {orgDepartments.map((d) => {
          const cell = workloadCell[d.workload];
          return (
            <div key={d.id} className={cn("flex flex-col gap-1 rounded-md border p-3", cell.bg)}>
              <span className="truncate text-xs font-medium text-fg">{d.name}</span>
              <span className={cn("text-sm font-semibold", cell.text)}>{cell.label}</span>
              <span className="text-xs text-fg-muted tabular-nums">{d.capacity}% capacity</span>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
