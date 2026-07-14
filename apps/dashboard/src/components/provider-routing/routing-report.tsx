import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { routingReports } from "@/features/provider-routing";

export function RoutingReport() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Routing Report</CardTitle>
        <span className="text-xs text-fg-muted">explainable & auditable</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {routingReports.map((r) => (
          <div key={r.decisionId} className="flex flex-col gap-2 rounded-md border bg-surface-sunken p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-fg">{r.description}</span>
              <div className="flex items-center gap-1.5">
                <Badge variant="neutral">{r.strategy}</Badge>
                <Badge variant={r.riskBadge}>{r.riskLevel} risk</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "Capability", value: r.capabilityScore },
                { label: "Health", value: r.healthScore },
                { label: "Policy", value: r.policyScore },
                { label: "Confidence", value: r.confidenceScore },
              ].map((s) => (
                <div key={s.label} className="rounded-md border bg-surface p-2">
                  <p className="text-[0.65rem] uppercase tracking-wider text-fg-muted">{s.label}</p>
                  <p className="text-sm font-bold text-fg tabular-nums">{s.value}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-fg-secondary">
              <span className="font-medium text-fg">Why selected:</span> {r.whySelected}
            </p>
            {r.whyRejected.length > 0 && (
              <div className="flex flex-col gap-0.5">
                <span className="text-xs font-medium text-fg">Why rejected:</span>
                {r.whyRejected.map((w, i) => (
                  <span key={i} className="text-xs text-fg-muted">
                    · {w}
                  </span>
                ))}
              </div>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
