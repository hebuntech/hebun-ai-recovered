import { Card, CardContent } from "@/components/ui/card";
import type { DashboardMetric } from "@/features/director-dashboard/foundation";

interface MetricGridProps {
  metrics: DashboardMetric[];
}

export function MetricGrid({ metrics }: MetricGridProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
      {metrics.map((metric) => (
        <Card key={metric.label} className="border-border/80 bg-surface-sunken shadow-none">
          <CardContent className="flex min-h-28 flex-col gap-2">
            <p className="text-[0.7rem] font-semibold uppercase tracking-[0.14em] text-fg-muted">
              {metric.label}
            </p>
            <p className="text-2xl font-semibold leading-none text-fg">{metric.value}</p>
            <p className="mt-auto text-sm leading-6 text-fg-secondary">{metric.detail}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
