import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adapterRecords } from "@/features/adapters";

export function AdapterTelemetryMetrics() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Telemetry Metrics</CardTitle>
        <span className="text-xs text-fg-muted">deterministic</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {adapterRecords.map((r) => {
          const t = r.telemetry;
          const tiles = [
            { label: "Executions", value: `${t.executions}` },
            { label: "Success Rate", value: t.successRate != null ? `${t.successRate}%` : "—" },
            { label: "Failure Rate", value: t.failureRate != null ? `${t.failureRate}%` : "—" },
            { label: "Avg Duration", value: `${t.averageDurationMs}ms` },
            { label: "Peak Duration", value: t.peakDurationMs != null ? `${t.peakDurationMs}ms` : "—" },
            { label: "Queue Time", value: t.queueTimeMs != null ? `${t.queueTimeMs}ms` : "—" },
            { label: "Retries", value: `${t.retryCount ?? 0}` },
            { label: "Rollbacks", value: `${t.rollbackCount ?? 0}` },
            { label: "Cancels", value: `${t.cancelCount ?? 0}` },
          ];
          return (
            <div key={r.metadata.id}>
              <p className="mb-2 text-sm font-medium text-fg">{r.metadata.name}</p>
              <div className="grid grid-cols-3 gap-2">
                {tiles.map((tile) => (
                  <div key={tile.label} className="rounded-md border bg-surface-sunken p-2">
                    <p className="text-xs text-fg-muted">{tile.label}</p>
                    <p className="text-sm font-semibold tabular-nums text-fg">{tile.value}</p>
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
