import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { offlineSession } from "@/features/offline-execution";
import type { SimulatedResultStatus } from "@/features/offline-execution";

const statusVariant: Record<SimulatedResultStatus, "success" | "warning" | "error"> = {
  simulated: "success",
  held: "warning",
  blocked: "error",
};

export function OfflineResults() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Simulated Results</CardTitle>
        <span className="text-xs text-fg-muted">deterministic, no real output</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {offlineSession.simulatedResults.map((r) => (
          <div key={r.id} className="flex flex-col gap-2 rounded-md border bg-surface-sunken p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-fg">{r.taskId}</span>
              <div className="flex items-center gap-1.5">
                <Badge variant="neutral">{r.providerId ?? "none"}</Badge>
                <Badge variant={statusVariant[r.status]}>{r.status}</Badge>
              </div>
            </div>
            <p className="text-xs text-fg-secondary">{r.output}</p>
            <div className="flex flex-wrap gap-1.5">
              {r.artifacts.map((a) => (
                <span key={a.kind} className="rounded-sm bg-info-subtle px-2 py-0.5 text-xs font-medium text-info">
                  {a.label}
                </span>
              ))}
            </div>
            {r.warnings.map((w) => (
              <span key={w} className="text-xs text-warning">⚠ {w}</span>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
