import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrchestrationBlueprint } from "@/features/orchestration";

interface OrchestrationApprovalsProps {
  blueprint: OrchestrationBlueprint;
}

export function OrchestrationApprovals({ blueprint }: OrchestrationApprovalsProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Approval Gates</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {blueprint.approvalGates.map((gate) => (
          <div key={gate.id} className="rounded-md border bg-surface-sunken p-4">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-semibold text-fg">{gate.mode}</p>
              <p className="text-xs text-fg-muted">{gate.status}</p>
            </div>
            <p className="mt-1 text-sm text-fg-secondary">{gate.summary}</p>
            <p className="mt-2 text-xs text-fg-muted">owner {gate.owner}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
