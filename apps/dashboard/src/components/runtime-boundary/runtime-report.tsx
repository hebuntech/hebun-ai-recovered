import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { runtimeReports } from "@/features/runtime-boundary";

export function RuntimeReport() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Runtime Report</CardTitle>
        <span className="text-xs text-fg-muted">explainable & auditable</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {runtimeReports.map((r) => (
          <div key={r.decisionId} className="flex flex-col gap-2 rounded-md border bg-surface-sunken p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-fg">{r.invocationId}</span>
              <div className="flex items-center gap-1.5">
                <Badge variant="neutral">{r.runtimeMode}</Badge>
                <Badge variant={r.badge}>{r.riskLevel} risk</Badge>
                <Badge variant={r.allowed ? "success" : "error"}>{r.allowed ? "allowed" : "held"}</Badge>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                { label: "State", value: r.runtimeState },
                { label: "Credential", value: r.credentialState },
                { label: "Health", value: `${r.healthScore}` },
                { label: "Readiness", value: `${r.readinessScore}%` },
              ].map((s) => (
                <div key={s.label} className="rounded-md border bg-surface p-2">
                  <p className="text-[0.65rem] uppercase tracking-wider text-fg-muted">{s.label}</p>
                  <p className="text-sm font-bold text-fg">{s.value}</p>
                </div>
              ))}
            </div>
            <p className="text-xs text-fg-secondary">{r.explanation}</p>
            {r.blockReasons.map((b, i) => (
              <span key={i} className="text-xs text-error">
                ⛔ {b}
              </span>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
