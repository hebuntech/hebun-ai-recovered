import { AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { bottlenecks } from "@/features/execution/mock";

export function BottleneckPanel() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Top Bottlenecks</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{bottlenecks.length}</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {bottlenecks.map((b) => (
          <div key={b.id} className="flex gap-3 rounded-md border bg-surface-sunken p-3">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-fg">{b.location}</span>
                <span className="text-xs font-semibold tabular-nums text-warning">{b.waitTime}</span>
              </div>
              <p className="text-xs text-fg-secondary">{b.impact}</p>
              <p className="text-xs text-fg-muted">
                <span className="capitalize">{b.type}</span> · <span className="font-mono">{b.execution}</span>
              </p>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
