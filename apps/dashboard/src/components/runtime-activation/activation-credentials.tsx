import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { activationDecisions } from "@/features/runtime-activation";

export function ActivationCredentials() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Credentials</CardTitle>
        <span className="text-xs text-fg-muted">placeholder-only credential posture</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {activationDecisions.map((decision) => (
          <div key={decision.id} className="rounded-md border bg-surface-sunken p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-fg">{decision.providerId ?? "unassigned"}</span>
              <Badge variant={decision.credentials.liveEligible ? "success" : "warning"}>
                {decision.credentialStatus}
              </Badge>
            </div>
            <p className="text-xs text-fg-secondary">{decision.credentials.note}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
