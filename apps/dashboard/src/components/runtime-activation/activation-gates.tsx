import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { activationDecisions } from "@/features/runtime-activation";

export function ActivationGates() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Activation Gates</CardTitle>
        <span className="text-xs text-fg-muted">8 deterministic gates per activation decision</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {activationDecisions.map((decision) => (
          <div key={decision.id} className="flex flex-col gap-2 rounded-md border bg-surface-sunken p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-fg">{decision.context.requestId}</span>
              <div className="flex items-center gap-1.5">
                <Badge variant={decision.badge}>{decision.activationLevel}</Badge>
                <Badge variant={decision.allowed ? "success" : "error"}>{decision.allowed ? "allowed" : "blocked"}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-2 xl:grid-cols-4">
              {decision.gates.map((gate) => (
                <div key={gate.gate} className="flex items-center gap-1.5 text-xs" title={gate.reason}>
                  {gate.passed ? (
                    <Check className="size-3 shrink-0 text-success" />
                  ) : (
                    <X className="size-3 shrink-0 text-error" />
                  )}
                  <span className={gate.passed ? "text-fg-secondary" : "text-error"}>{gate.gate}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
