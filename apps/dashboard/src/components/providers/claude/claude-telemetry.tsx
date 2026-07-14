import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { claudeProviderTelemetry } from "@/features/providers/claude";

export function ClaudeTelemetry() {
  const tiles = [
    { label: "Executions", value: `${claudeProviderTelemetry.executions}` },
    { label: "Success Rate", value: `${claudeProviderTelemetry.successRate}%` },
    { label: "Avg Duration", value: `${claudeProviderTelemetry.averageDurationMs}ms` },
    { label: "Queue Time", value: `${claudeProviderTelemetry.queueTimeMs}ms` },
    { label: "Peak Duration", value: `${claudeProviderTelemetry.peakDurationMs}ms` },
    { label: "Last Updated", value: claudeProviderTelemetry.lastUpdated },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Telemetry</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-md border bg-surface-sunken p-4">
            <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
              {tile.label}
            </p>
            <p className="mt-1 text-sm font-semibold text-fg">{tile.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
