import { Check, X } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getOfflineReport } from "@/features/offline-execution";

export function OfflineReport() {
  const r = getOfflineReport();
  const flags = [
    { label: "Simulation enforced", ok: r.simulationEnforced },
    { label: "Future Live blocked", ok: r.futureLiveBlocked },
    { label: "Valid", ok: r.valid },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Offline Execution Report</CardTitle>
        <div className="flex items-center gap-1.5">
          <Badge variant={r.riskLevel === "low" ? "success" : r.riskLevel === "medium" ? "warning" : "error"}>
            {r.riskLevel} risk
          </Badge>
          <Badge variant={r.badge}>{r.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { label: "Tasks", value: `${r.taskCount}` },
            { label: "Simulated", value: `${r.simulatedResults}` },
            { label: "Traceability", value: `${r.traceabilityScore}%` },
            { label: "Audit", value: `${r.auditCoverage}%` },
          ].map((s) => (
            <div key={s.label} className="rounded-md border bg-surface p-2">
              <p className="text-[0.65rem] uppercase tracking-wider text-fg-muted">{s.label}</p>
              <p className="text-sm font-bold text-fg tabular-nums">{s.value}</p>
            </div>
          ))}
        </div>
        <div className="flex flex-wrap gap-3">
          {flags.map((f) => (
            <span key={f.label} className="inline-flex items-center gap-1.5 text-xs">
              {f.ok ? <Check className="size-3.5 text-success" /> : <X className="size-3.5 text-error" />}
              <span className={f.ok ? "text-fg-secondary" : "text-error"}>{f.label}</span>
            </span>
          ))}
        </div>
        <p className="text-xs text-fg-secondary">{r.explanation}</p>
      </CardContent>
    </Card>
  );
}
