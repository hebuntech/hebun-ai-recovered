import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { offlineSession as s } from "@/features/offline-execution";

export function OfflineExecutionSessionView() {
  const tiles = [
    { label: "Plan", value: s.planId },
    { label: "Orchestration", value: s.orchestrationId },
    { label: "Tasks", value: `${s.tasks.length}` },
    { label: "Confidence", value: `${s.confidence}` },
    { label: "Traceability", value: `${s.traceabilityScore}%` },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Execution Session</CardTitle>
        <div className="flex items-center gap-1.5">
          <Badge variant={s.riskBadge}>{s.riskLevel} risk</Badge>
          <Badge variant={s.statusBadge}>{s.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-md border bg-surface-sunken p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">{t.label}</p>
            <p className="mt-1 text-sm font-bold text-fg tabular-nums">{t.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
