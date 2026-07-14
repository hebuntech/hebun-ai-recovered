import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { invocations } from "@/features/provider-invocation";

export function InvocationEvents() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Invocation Events</CardTitle>
        <span className="text-xs text-fg-muted">deterministic event stream</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {invocations.map((inv) => (
          <div key={inv.id} className="flex flex-col gap-2 rounded-md border bg-surface-sunken p-3">
            <span className="text-sm font-semibold text-fg">{inv.requestId}</span>
            <div className="flex flex-wrap items-center gap-1.5">
              {inv.events.map((e, i) => (
                <span key={`${e.type}-${i}`} className="inline-flex items-center gap-1.5">
                  {i > 0 && <span className="text-fg-muted">→</span>}
                  <span
                    className="rounded-sm bg-surface px-2 py-0.5 text-xs font-medium text-fg-secondary"
                    title={e.note}
                  >
                    {e.label}
                  </span>
                </span>
              ))}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
