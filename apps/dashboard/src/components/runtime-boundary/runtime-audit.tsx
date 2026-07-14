import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { runtimeDecisions } from "@/features/runtime-boundary";

export function RuntimeAudit() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Audit Trail</CardTitle>
        <span className="text-xs text-fg-muted">auditable & offline</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {runtimeDecisions.map((d) => (
          <div key={d.id} className="flex flex-col gap-1.5 rounded-md border bg-surface-sunken p-3">
            <span className="text-sm font-semibold text-fg">{d.requestId}</span>
            {d.audit.map((a) => (
              <div key={a.subject} className="flex gap-2 text-xs">
                <span className="w-36 shrink-0 font-medium uppercase tracking-wider text-fg-muted">{a.subject}</span>
                <span className="text-fg-secondary">{a.detail}</span>
              </div>
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
