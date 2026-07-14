import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { runtimePipeline } from "@/features/runtime-boundary";

export function RuntimePipeline() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Runtime Pipeline</CardTitle>
        <span className="text-xs text-fg-muted tabular-nums">{runtimePipeline.length} steps</span>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        {runtimePipeline.map((step) => (
          <div key={step.order} className="flex items-start gap-3 rounded-md border bg-surface-sunken p-3">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-primary-subtle text-xs font-bold text-primary tabular-nums">
              {step.order}
            </span>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-fg">{step.label}</span>
              <span className="text-xs text-fg-muted">{step.description}</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
