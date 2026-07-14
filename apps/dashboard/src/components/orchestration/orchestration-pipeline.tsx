import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { orchestrationPipelineSteps } from "@/features/orchestration";

export function OrchestrationPipelineView() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Orchestration Pipeline</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {orchestrationPipelineSteps.map((step, index) => (
          <div key={step.id} className="rounded-md border bg-surface-sunken p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
              Step {index + 1}
            </p>
            <p className="mt-1 text-sm font-semibold text-fg">{step.label}</p>
            <p className="mt-2 text-sm text-fg-secondary">{step.description}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
