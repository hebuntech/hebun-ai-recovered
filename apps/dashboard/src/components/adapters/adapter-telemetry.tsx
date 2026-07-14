import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { adapterRecords } from "@/features/adapters";

export function AdapterTelemetryCard() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Adapter Telemetry</CardTitle>
        <span className="text-xs text-fg-muted">deterministic bridge</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {adapterRecords.map((r) => {
          const t = r.telemetry;
          const tiles = [
            { label: "Executions", value: `${t.executions}` },
            { label: "Succeeded", value: `${t.succeeded}` },
            { label: "Failed", value: `${t.failed}` },
            { label: "Cancelled", value: `${t.cancelled}` },
            { label: "Avg Duration", value: `${t.averageDurationMs}ms` },
            { label: "Updated", value: t.lastUpdated },
          ];
          return (
            <div key={r.metadata.id}>
              <p className="mb-2 text-sm font-medium text-fg">{r.metadata.name}</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {tiles.map((tile) => (
                  <div key={tile.label} className="rounded-md border bg-surface-sunken p-3">
                    <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">{tile.label}</p>
                    <p className="mt-1 text-sm font-bold tabular-nums text-fg">{tile.value}</p>
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
