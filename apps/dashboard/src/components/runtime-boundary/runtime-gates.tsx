import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { runtimeDecisions } from "@/features/runtime-boundary";

export function RuntimeGates() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Runtime Gates</CardTitle>
        <span className="text-xs text-fg-muted">9 deterministic gates per decision</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {runtimeDecisions.map((d) => (
          <div key={d.id} className="flex flex-col gap-2 rounded-md border bg-surface-sunken p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-fg">{d.requestId}</span>
              <div className="flex items-center gap-1.5">
                <Badge variant={d.modeBadge}>{d.runtimeMode}</Badge>
                <Badge variant={d.allowed ? "success" : "error"}>{d.allowed ? "allowed" : "held"}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-1 sm:grid-cols-3">
              {d.gates.map((g) => (
                <div key={g.gate} className="flex items-center gap-1.5 text-xs" title={g.reason}>
                  {g.passed ? (
                    <Check className="size-3 shrink-0 text-success" />
                  ) : (
                    <X className="size-3 shrink-0 text-error" />
                  )}
                  <span className={g.passed ? "text-fg-secondary" : "text-error"}>{g.gate}</span>
                </div>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
