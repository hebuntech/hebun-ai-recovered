import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { claudeLiveRecord, summarizeTelemetry } from "@/features/providers/claude-live";

export function ClaudeLiveTelemetryCard() {
  const telemetry = summarizeTelemetry(claudeLiveRecord.response.telemetry);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Telemetry</CardTitle>
      </CardHeader>
      <CardContent className="grid grid-cols-2 gap-2 sm:grid-cols-5">
        {telemetry.map((item) => (
          <div key={item.label} className="rounded-md border bg-surface-sunken p-3">
            <p className="text-xs uppercase tracking-wider text-fg-secondary">{item.label}</p>
            <p className="mt-1 text-sm font-semibold text-fg">{item.value}</p>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
