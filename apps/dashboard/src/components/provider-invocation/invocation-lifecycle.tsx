import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { lifecycleStates, lifecycleTransitions, lifecycleBadge, supportedExecutionModes } from "@/features/provider-invocation";

export function InvocationLifecycle() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Lifecycle & Execution Modes</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{lifecycleStates.length} states</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-1.5">
          {lifecycleStates.map((s) => (
            <Badge key={s} variant={lifecycleBadge(s)}>
              {s}
            </Badge>
          ))}
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-secondary">Transitions</p>
          <div className="grid grid-cols-1 gap-1.5 sm:grid-cols-2">
            {lifecycleTransitions.map((t) => (
              <div key={t.from} className="rounded-md border bg-surface-sunken p-2 text-xs">
                <span className="font-medium text-fg">{t.from}</span>
                <span className="text-fg-muted"> → {t.to.length > 0 ? t.to.join(", ") : "terminal"}</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-fg-secondary">Execution modes</p>
          <div className="flex flex-wrap gap-1.5">
            {supportedExecutionModes.map((m) => (
              <span key={m} className="rounded-sm bg-primary-subtle px-2 py-0.5 text-xs font-medium text-primary">
                {m}
              </span>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
