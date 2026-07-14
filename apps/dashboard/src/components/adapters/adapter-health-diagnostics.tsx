import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adapterRecords, healthVariant } from "@/features/adapters";

export function AdapterHealthDiagnostics() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Health Diagnostics</CardTitle>
        <span className="text-xs text-fg-muted">availability · reliability · error rate</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {adapterRecords.map((r) => {
          const h = r.health;
          const tiles = [
            { label: "Availability", value: h.availability != null ? `${h.availability}%` : "—" },
            { label: "Latency", value: `${h.latencyMs}ms` },
            { label: "Reliability", value: h.reliability != null ? `${h.reliability}%` : "—" },
            { label: "Error Rate", value: h.errorRate != null ? `${h.errorRate}%` : "—" },
            { label: "Resource Use", value: h.resourceUsage != null ? `${h.resourceUsage}%` : "—" },
            { label: "Last Success", value: h.lastSuccessfulExecution ?? "—" },
            { label: "Last Failure", value: h.lastFailedExecution ?? "—" },
            { label: "Success Rate", value: `${h.successRate}%` },
          ];
          return (
            <div key={r.metadata.id}>
              <div className="mb-2 flex items-center gap-2">
                <span className="text-sm font-medium text-fg">{r.metadata.name}</span>
                <Badge variant={healthVariant[h.status]}>{h.status}</Badge>
              </div>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {tiles.map((t) => (
                  <div key={t.label} className="rounded-md border bg-surface-sunken p-2">
                    <p className="text-xs text-fg-muted">{t.label}</p>
                    <p className="text-sm font-semibold tabular-nums text-fg">{t.value}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
