import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { GeneratedPlan } from "@/features/planning";

interface PlanningRiskProps {
  plan: GeneratedPlan;
}

export function PlanningRisk({ plan }: PlanningRiskProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Planning Risks</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {plan.riskAssessment.map((risk) => (
          <div key={risk.id} className="rounded-md border bg-surface-sunken p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-fg">{risk.title}</p>
              <p className="text-xs text-fg-muted">{risk.level}</p>
            </div>
            <p className="mt-1 text-sm text-fg-secondary">{risk.detail}</p>
            <p className="mt-2 text-xs text-fg-muted">
              mitigation: {risk.mitigation} · source {risk.source}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
