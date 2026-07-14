import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { browserProviderTelemetry } from "@/features/providers/browser";

export function BrowserTelemetry() {
  const items = [
    { label: "Request Count", value: `${browserProviderTelemetry.executions}` },
    { label: "Simulation Count", value: `${browserProviderTelemetry.succeeded}` },
    { label: "Average Latency", value: `${browserProviderTelemetry.averageDurationMs} ms` },
    { label: "Failure Count", value: `${browserProviderTelemetry.failed}` },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Telemetry</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <div key={item.label} className="rounded-md border bg-surface-sunken p-4">
            <p className="text-xs uppercase tracking-wider text-fg-secondary">{item.label}</p>
            <p className="mt-1 text-lg font-semibold text-fg">{item.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
