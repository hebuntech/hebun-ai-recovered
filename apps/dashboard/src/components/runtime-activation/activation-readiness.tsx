import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { activationDecisions } from "@/features/runtime-activation";

export function ActivationReadiness() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Readiness</CardTitle>
        <span className="text-xs text-fg-muted">provider, policy, approval and simulation readiness</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {activationDecisions.map((decision) => (
          <div key={decision.id} className="rounded-md border bg-surface-sunken p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-fg">{decision.providerId ?? "unassigned"}</span>
              <span className="text-xs text-fg-muted">{decision.readiness.score}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-surface">
              <div
                className="h-full rounded-full bg-primary transition-all duration-(--dur-fast)"
                style={{ width: `${decision.readiness.score}%` }}
              />
            </div>
            <div className="mt-3 grid grid-cols-1 gap-1">
              {decision.readiness.checks.map((check) => (
                <div key={check.label} className="flex items-center justify-between gap-3 text-xs">
                  <span className="text-fg-secondary">{check.label}</span>
                  <span className={check.ready ? "text-success" : "text-warning"}>{check.score}%</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
