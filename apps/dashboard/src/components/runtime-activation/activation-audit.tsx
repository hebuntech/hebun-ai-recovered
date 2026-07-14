import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { activationDecisions } from "@/features/runtime-activation";

export function ActivationAudit() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activation Audit</CardTitle>
        <span className="text-xs text-fg-muted">traceability across runtime, policy, readiness and gates</span>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-3 xl:grid-cols-2">
        {activationDecisions.map((decision) => (
          <div key={decision.id} className="rounded-md border bg-surface-sunken p-3">
            <p className="mb-2 text-sm font-semibold text-fg">{decision.providerId ?? "unassigned"}</p>
            <div className="flex flex-col gap-1">
              {decision.audit.map((record) => (
                <div key={`${decision.id}-${record.subject}-${record.detail}`} className="text-xs">
                  <span className="font-medium text-fg-secondary">{record.subject}:</span>{" "}
                  <span className="text-fg-muted">{record.detail}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
