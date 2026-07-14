import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { invocations } from "@/features/provider-invocation";

export function InvocationRequestView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invocation Request</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{invocations.length} invocations</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {invocations.map((inv) => (
          <div key={inv.id} className="flex flex-col gap-2 rounded-md border bg-surface-sunken p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-fg">{inv.request.id}</span>
              <div className="flex items-center gap-1.5">
                <Badge variant="neutral">{inv.executionMode}</Badge>
                <Badge variant={inv.statusBadge}>{inv.status}</Badge>
              </div>
            </div>
            <p className="text-xs text-fg-secondary">{inv.request.payloadSummary}</p>
            <div className="flex flex-wrap gap-1.5">
              {inv.request.capabilities.map((c) => (
                <span key={c} className="rounded-sm bg-primary-subtle px-2 py-0.5 text-xs font-medium text-primary">
                  {c}
                </span>
              ))}
            </div>
            <span className="text-xs text-fg-muted">constraints: {inv.request.constraints.join(" · ")}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
