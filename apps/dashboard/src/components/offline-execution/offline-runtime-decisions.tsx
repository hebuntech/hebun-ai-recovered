import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { offlineSession } from "@/features/offline-execution";

export function OfflineRuntimeDecisions() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Runtime Decisions</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{offlineSession.runtimeDecisions.length} decisions</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {offlineSession.tasks.map((t) => (
          <div key={t.taskId} className="flex items-center justify-between gap-2 rounded-md border bg-surface-sunken p-2.5">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-fg">{t.runtime.requestId}</span>
              <span className="text-xs text-fg-muted">
                gates {t.runtime.telemetry.gatesPassed}/{t.runtime.telemetry.gatesEvaluated} · {t.runtime.runtimeState}
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant={t.runtime.modeBadge}>{t.runtimeMode}</Badge>
              <Badge variant={t.runtime.allowed ? "success" : "warning"}>{t.runtime.allowed ? "allowed" : "held"}</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
