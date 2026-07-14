import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { offlineSession } from "@/features/offline-execution";

export function OfflineTelemetry() {
  const t = offlineSession.telemetry;
  const tiles = [
    { label: "Tasks", value: `${t.taskCount}` },
    { label: "Routed", value: `${t.routedCount}` },
    { label: "Invoked", value: `${t.invokedCount}` },
    { label: "Runtime Eval", value: `${t.runtimeEvaluatedCount}` },
    { label: "Simulated", value: `${t.simulatedResultCount}` },
    { label: "Sim Enforced", value: `${t.simulationEnforcedCount}` },
    { label: "Traceable", value: `${t.traceableCount}` },
    { label: "Avg Gates", value: `${t.averageGatesPassed}` },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle>Telemetry</CardTitle>
        <span className="text-xs text-fg-muted">session-level, deterministic</span>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-4">
        {tiles.map((x) => (
          <div key={x.label} className="rounded-md border bg-surface-sunken p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">{x.label}</p>
            <p className="mt-1 text-sm font-bold text-fg tabular-nums">{x.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
