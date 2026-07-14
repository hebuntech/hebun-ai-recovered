import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GeneratedPlan } from "@/features/planning";

interface PlanningMilestonesProps {
  plan: GeneratedPlan;
}

export function PlanningMilestones({ plan }: PlanningMilestonesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Milestones</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {plan.milestones.map((milestone) => (
          <div key={milestone.id} className="rounded-md border bg-surface-sunken p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-fg">{milestone.title}</p>
              <p className="text-xs text-fg-muted">{milestone.status}</p>
            </div>
            <p className="mt-1 text-sm text-fg-secondary">{milestone.detail}</p>
            <p className="mt-2 text-xs text-fg-muted">
              {milestone.dueDate} · owner {milestone.owner}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
