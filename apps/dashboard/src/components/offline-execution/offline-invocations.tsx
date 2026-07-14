import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { offlineSession } from "@/features/offline-execution";

export function OfflineInvocations() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invocations</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{offlineSession.invocations.length} invocations</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {offlineSession.tasks.map((t) => (
          <div key={t.taskId} className="flex items-center justify-between gap-2 rounded-md border bg-surface-sunken p-2.5">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-fg">{t.invocation.request.id}</span>
              <span className="text-xs text-fg-muted">{t.invocation.executionMode} · retry ×{t.invocation.retryPolicy.maxAttempts} · {t.invocation.timeoutPolicy.timeoutMs}ms</span>
            </div>
            <Badge variant={t.invocation.statusBadge}>{t.invocation.status}</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
