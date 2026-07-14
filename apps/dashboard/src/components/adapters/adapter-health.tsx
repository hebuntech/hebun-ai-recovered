import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { adapterRecords, healthStatuses, healthVariant } from "@/features/adapters";

export function AdapterHealth() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Adapter Health</CardTitle>
        <div className="flex flex-wrap gap-1.5">
          {healthStatuses.map((s) => (
            <Badge key={s} variant={healthVariant[s]}>{s}</Badge>
          ))}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {adapterRecords.map((r) => (
          <div key={r.metadata.id} className="flex items-center justify-between rounded-md border bg-surface-sunken p-3">
            <div>
              <p className="text-sm font-medium text-fg">{r.metadata.name}</p>
              <p className="text-xs text-fg-muted">{r.health.note}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <Badge variant={healthVariant[r.health.status]}>{r.health.status}</Badge>
              <span className="text-xs text-fg-muted tabular-nums">
                {r.health.successRate}% · {r.health.latencyMs}ms
              </span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
