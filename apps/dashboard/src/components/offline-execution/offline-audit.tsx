import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { offlineSession } from "@/features/offline-execution";

export function OfflineAudit() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Trail</CardTitle>
        <span className="text-xs text-fg-muted">every stage, auditable & offline</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5">
        {offlineSession.auditTrail.map((a) => (
          <div key={a.stage} className="flex gap-2 rounded-md border bg-surface-sunken p-2.5 text-xs">
            <span className="w-44 shrink-0 font-medium uppercase tracking-wider text-fg-muted">{a.stage}</span>
            <span className="text-fg-secondary">{a.detail}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
