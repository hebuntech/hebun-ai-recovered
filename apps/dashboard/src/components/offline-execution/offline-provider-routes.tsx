import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { offlineSession } from "@/features/offline-execution";

export function OfflineProviderRoutes() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Provider Routes</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{offlineSession.providerRoutes.length} routes</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        {offlineSession.tasks.map((t) => (
          <div key={t.taskId} className="flex items-center justify-between gap-2 rounded-md border bg-surface-sunken p-2.5">
            <div className="flex flex-col">
              <span className="text-sm font-medium text-fg">{t.capability}</span>
              <span className="text-xs text-fg-muted">{t.routing.strategy}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Badge variant="success">{t.routing.primaryProvider ?? "none"}</Badge>
              <Badge variant={t.routing.confidenceBadge}>conf {t.routing.confidence}</Badge>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
