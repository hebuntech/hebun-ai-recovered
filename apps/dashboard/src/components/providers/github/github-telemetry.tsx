import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { githubProviderTelemetry } from "@/features/providers/github";

export function GitHubTelemetry() {
  const items = [
    ["Executions", githubProviderTelemetry.executions],
    ["Success Rate", `${githubProviderTelemetry.successRate}%`],
    ["Average Duration", `${githubProviderTelemetry.averageDurationMs}ms`],
    ["Queue Time", `${githubProviderTelemetry.queueTimeMs}ms`],
  ];
  return (
    <Card className="h-full">
      <CardHeader><CardTitle>Telemetry</CardTitle><span className="text-xs text-fg-muted">{githubProviderTelemetry.lastUpdated}</span></CardHeader>
      <CardContent className="grid grid-cols-2 gap-3">
        {items.map(([label, value]) => <div key={String(label)} className="rounded-md border bg-surface-sunken p-3"><p className="text-xs text-fg-muted">{label}</p><p className="mt-1 font-semibold">{value}</p></div>)}
      </CardContent>
    </Card>
  );
}
