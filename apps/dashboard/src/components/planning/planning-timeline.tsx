import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GeneratedPlan } from "@/features/planning";

interface PlanningTimelineProps {
  plan: GeneratedPlan;
}

export function PlanningTimeline({ plan }: PlanningTimelineProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Timeline</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {plan.timeline.map((item) => (
          <div key={item.id} className="rounded-md border bg-surface-sunken p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-fg">{item.title}</p>
              <p className="text-xs text-fg-muted">#{item.sequence}</p>
            </div>
            <p className="mt-2 text-sm text-fg-secondary">
              {item.startDate} → {item.endDate}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
