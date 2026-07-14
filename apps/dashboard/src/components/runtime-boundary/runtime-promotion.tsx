import { ChevronRight, Lock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { runtimeDecisions } from "@/features/runtime-boundary";

export function RuntimePromotion() {
  // Promotion path is identical structurally; show one representative decision
  // for the path plus per-request current stage + eligibility.
  const sample = runtimeDecisions[0];
  const path = sample?.promotion.path ?? [];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Promotion Path</CardTitle>
        <span className="text-xs text-fg-muted">Simulation → Dry Run → Read Only → Future Live</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap items-center gap-1.5">
          {path.map((step, i) => (
            <span key={`${step.from}-${step.to}`} className="inline-flex items-center gap-1.5">
              {i > 0 && <ChevronRight className="size-3 text-fg-muted" />}
              <Badge variant={step.eligible ? "success" : "error"} title={step.reason}>
                {!step.eligible && step.to === "Future Live" && <Lock className="size-3" />}
                {step.from} → {step.to}
              </Badge>
            </span>
          ))}
        </div>

        <div className="flex flex-col gap-1.5">
          {runtimeDecisions.map((d) => (
            <div
              key={d.id}
              className="flex items-center justify-between gap-2 rounded-md border bg-surface-sunken p-2.5"
            >
              <div className="flex flex-col">
                <span className="text-sm font-medium text-fg">{d.requestId}</span>
                <span className="text-xs text-fg-muted">{d.promotion.reason}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="neutral">{d.promotion.currentStage}</Badge>
                <Badge variant={d.promotion.eligible ? "success" : "warning"}>
                  {d.promotion.eligible ? "promotable" : "held"}
                </Badge>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
