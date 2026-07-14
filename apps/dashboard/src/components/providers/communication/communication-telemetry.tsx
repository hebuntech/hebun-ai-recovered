import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { communicationProviderTelemetry } from "@/features/providers/communication";

export function CommunicationTelemetry() {
  const items = [
    { label: "Request Count", value: `${communicationProviderTelemetry.executions}` },
    { label: "Simulation Count", value: `${communicationProviderTelemetry.succeeded}` },
    { label: "Average Latency", value: `${communicationProviderTelemetry.averageDurationMs} ms` },
    { label: "Failure Count", value: `${communicationProviderTelemetry.failed}` },
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
