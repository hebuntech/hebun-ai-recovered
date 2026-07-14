import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { lifecycleStages, lifecycleDiagnostics } from "@/features/adapters";

export function AdapterLifecycleValidation() {
  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Lifecycle Validation</CardTitle>
        <span className="text-xs text-fg-muted">legal vs illegal transitions</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {lifecycleStages.map((stage) => {
          const d = lifecycleDiagnostics(stage);
          return (
            <div key={stage} className="rounded-md border bg-surface-sunken p-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-fg">{stage}</span>
                <span className="text-xs text-fg-muted tabular-nums">{d.legalNext.length} legal</span>
              </div>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {d.legalNext.length ? (
                  d.legalNext.map((s) => (
                    <span key={s} className={cn("rounded-sm px-2 py-0.5 text-xs font-medium", "bg-success/12 text-success")}>
                      → {s}
                    </span>
                  ))
                ) : (
                  <span className="text-xs text-fg-muted">terminal</span>
                )}
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
