import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GeneratedPlan } from "@/features/planning";

interface PlanningGoalsProps {
  plan: GeneratedPlan;
}

export function PlanningGoals({ plan }: PlanningGoalsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Goal Breakdown</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="rounded-md border bg-surface-sunken p-4">
          <p className="text-sm font-semibold text-fg">{plan.goal.title}</p>
          <p className="mt-1 text-sm text-fg-secondary">{plan.goal.description}</p>
          <p className="mt-2 text-xs text-fg-muted">
            Goal {plan.goal.sourceGoal.id} · owner {plan.goal.owner}
          </p>
        </div>
        {plan.goal.drivers.map((driver) => (
          <div key={driver} className="rounded-md border bg-surface-sunken p-4">
            <p className="text-sm text-fg-secondary">{driver}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
