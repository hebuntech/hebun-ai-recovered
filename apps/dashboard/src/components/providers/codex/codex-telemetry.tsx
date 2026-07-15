import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { codexProviderTelemetry } from "@/features/providers/codex";

export function CodexTelemetry() {
  const items = [
    ["Executions", codexProviderTelemetry.executions],
    ["Success Rate", `${codexProviderTelemetry.successRate}%`],
    ["Average Duration", `${codexProviderTelemetry.averageDurationMs}ms`],
    ["Retries", codexProviderTelemetry.retryCount],
  ];
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Telemetry</CardTitle><span className="text-xs text-fg-muted">{codexProviderTelemetry.lastUpdated}</span></CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {items.map(([label, value]) => <div key={String(label)} className="rounded-md border bg-surface-sunken p-3"><p className="text-xs text-fg-muted">{label}</p><p className="mt-1 font-semibold">{value}</p></div>)}
      </CardContent>
    </Card>
  );
}
