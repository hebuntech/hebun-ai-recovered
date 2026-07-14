import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adapterRecords, healthVariant } from "@/features/adapters";

export function AdapterRegistry() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Adapter Registry</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{adapterRecords.length} registered</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {adapterRecords.map((r) => (
          <div key={r.metadata.id} className="rounded-md border bg-surface-sunken p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold text-fg">{r.metadata.name}</h3>
                  <span className="font-mono text-xs text-fg-muted">v{r.metadata.version}</span>
                  {r.metadata.simulation && <Badge variant="info">simulation</Badge>}
                </div>
                <p className="mt-1 text-xs text-fg-secondary">{r.metadata.description}</p>
              </div>
              <div className="flex shrink-0 flex-col items-end gap-1">
                <Badge variant={healthVariant[r.health.status]}>{r.health.status}</Badge>
                <span className="text-xs text-fg-muted">{r.lifecycle}</span>
              </div>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2 border-t pt-3 text-xs text-fg-muted">
              <span>{r.metadata.vendor}</span>
              <span>· {r.capabilities.length} capabilities</span>
              <span>· {r.telemetry.executions} executions</span>
              <span className="ml-auto tabular-nums">registered {r.registeredAt}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
