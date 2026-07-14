import { Check } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { offlineSession } from "@/features/offline-execution";

export function OfflineExecutionTasks() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Tasks — Plan → Provider → Runtime → Result</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{offlineSession.tasks.length} tasks</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {offlineSession.tasks.map((t) => (
          <div key={t.taskId} className="flex flex-col gap-2 rounded-md border bg-surface-sunken p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-fg">{t.taskTitle}</span>
              <div className="flex items-center gap-1.5">
                <Badge variant="neutral">{t.taskType}</Badge>
                {t.traceable && (
                  <Badge variant="success">
                    <Check className="size-3" /> traceable
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-1.5 text-xs">
              <span className="rounded-sm bg-primary-subtle px-2 py-0.5 font-medium text-primary">{t.capability}</span>
              <span className="text-fg-muted">→</span>
              <Badge variant="info">{t.routing.primaryProvider ?? "none"}</Badge>
              <span className="text-fg-muted">→</span>
              <Badge variant="neutral">{t.invocation.status}</Badge>
              <span className="text-fg-muted">→</span>
              <Badge variant={t.runtime.allowed ? "success" : "warning"}>{t.runtimeMode}</Badge>
              <span className="text-fg-muted">→</span>
              <Badge variant={t.result.status === "simulated" ? "success" : "error"}>{t.result.status}</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
