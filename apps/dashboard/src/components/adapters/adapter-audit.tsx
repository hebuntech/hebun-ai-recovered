import { ShieldCheck, AlertTriangle, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StatCard } from "@/components/dashboard/stat-card";
import { cn } from "@/lib/utils";
import { auditReport } from "@/features/adapters";

const findingIcon = {
  ok: <CheckCircle2 className="size-4 text-success" />,
  warning: <AlertTriangle className="size-4 text-warning" />,
  error: <XCircle className="size-4 text-error" />,
};

export function AdapterAudit() {
  const r = auditReport;
  return (
    <>
      <div className="col-span-6 sm:col-span-3">
        <StatCard label="Contract Version" value={`v${r.contractVersion}`} />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <StatCard label="Adapters Audited" value={`${r.adaptersAudited}`} />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <StatCard label="Contract Complete" value={`${r.contractComplete}/${r.adaptersAudited}`} />
      </div>
      <div className="col-span-6 sm:col-span-3">
        <StatCard label="Average Score" value={`${r.averageScore}`} />
      </div>

      <div className="col-span-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldCheck className="size-4 text-primary" />
              Audit Report
            </CardTitle>
            <Badge variant={r.verdictBadge}>{r.verdict}</Badge>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            {r.findings.map((f, i) => (
              <div key={i} className={cn("flex items-start gap-3 rounded-md border bg-surface-sunken p-3")}>
                {findingIcon[f.severity]}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-sm font-medium text-fg">{f.area}</span>
                    <span className="font-mono text-xs text-fg-muted">{f.adapterId}</span>
                  </div>
                  <p className="text-xs text-fg-secondary">{f.detail}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </>
  );
}
