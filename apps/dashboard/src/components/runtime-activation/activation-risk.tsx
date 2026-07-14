import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { activationDecisions } from "@/features/runtime-activation";

export function ActivationRisk() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Risk</CardTitle>
        <span className="text-xs text-fg-muted">activation risk posture derived from runtime boundary outputs</span>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {activationDecisions.map((decision) => (
          <div key={decision.id} className="rounded-md border bg-surface-sunken p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-fg">{decision.providerId ?? "unassigned"}</span>
              <Badge variant={decision.riskLevel === "low" ? "success" : decision.riskLevel === "medium" ? "warning" : "error"}>
                {decision.riskLevel}
              </Badge>
            </div>
            <p className="text-xs text-fg-secondary">{decision.risk.note}</p>
            <p className="mt-2 text-xs text-fg-muted">Risk score: {decision.risk.score}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
