import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrchestrationBlueprint } from "@/features/orchestration";

interface OrchestrationHandoffsProps {
  blueprint: OrchestrationBlueprint;
}

export function OrchestrationHandoffs({ blueprint }: OrchestrationHandoffsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Handoffs</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {blueprint.handoffs.map((handoff) => (
          <div key={handoff.id} className="rounded-md border bg-surface-sunken p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-fg">
                {handoff.fromOwner} {"->"} {handoff.toOwner}
              </p>
              <p className="text-xs text-fg-muted">{handoff.handoffType}</p>
            </div>
            <p className="mt-1 text-sm text-fg-secondary">
              context {handoff.requiredContext.join(", ")}
            </p>
            <p className="mt-2 text-xs text-fg-muted">
              {handoff.acceptanceCriteria.join(" · ")} · risk {handoff.riskLevel}
            </p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
