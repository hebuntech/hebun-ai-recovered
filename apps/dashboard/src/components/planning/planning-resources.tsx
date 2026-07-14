import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GeneratedPlan } from "@/features/planning";

interface PlanningResourcesProps {
  plan: GeneratedPlan;
}

export function PlanningResources({ plan }: PlanningResourcesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Resource Allocation</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="rounded-md border bg-surface-sunken p-4">
          <p className="text-sm text-fg-secondary">{plan.resourceAllocation.summary}</p>
          <p className="mt-2 text-xs text-fg-muted">
            utilization {plan.resourceAllocation.utilizationScore} · {plan.resourceAllocation.budgetBand} · {plan.resourceAllocation.timeWindow}
          </p>
        </div>
        {plan.resourceAllocation.resources.map((resource) => (
          <div key={resource.id} className="rounded-md border bg-surface-sunken p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-fg">{resource.title}</p>
              <p className="text-xs uppercase tracking-wider text-fg-muted">{resource.category}</p>
            </div>
            <p className="mt-1 text-sm text-fg-secondary">{resource.detail}</p>
            <p className="mt-2 text-xs text-fg-muted">owner {resource.owner}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
