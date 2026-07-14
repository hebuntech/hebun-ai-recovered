import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { computerUseProviderTelemetry } from "@/features/providers/computer-use";

export function ComputerUseTelemetry() {
  const items = [
    { label: "Request Count", value: `${computerUseProviderTelemetry.executions}` },
    { label: "Simulation Count", value: `${computerUseProviderTelemetry.succeeded}` },
    { label: "Average Latency", value: `${computerUseProviderTelemetry.averageDurationMs} ms` },
    { label: "Failure Count", value: `${computerUseProviderTelemetry.failed}` },
    { label: "Planned Actions", value: "30" },
    { label: "Health Score", value: `${computerUseProviderTelemetry.successRate}%` },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Telemetry</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
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
