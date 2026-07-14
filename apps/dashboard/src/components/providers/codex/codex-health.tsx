import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { codexProviderHealth } from "@/features/providers/codex";

export function CodexHealth() {
  const tiles = [
    { label: "Status", value: codexProviderHealth.status },
    { label: "Availability", value: `${codexProviderHealth.availability}%` },
    { label: "Latency", value: `${codexProviderHealth.latencyMs}ms` },
  ];

  return (
    <Card className="h-full">
      <CardHeader>
        <CardTitle>Provider Health</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid gap-3 sm:grid-cols-3">
          {tiles.map((tile) => (
            <div key={tile.label} className="rounded-md border bg-surface-sunken p-4">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">{tile.label}</p>
              <p className="mt-1 text-sm font-semibold text-fg">{tile.value}</p>
            </div>
          ))}
        </div>
        <div className="rounded-md border bg-surface-sunken p-4 text-sm text-fg-secondary">
          {codexProviderHealth.note}
        </div>
      </CardContent>
    </Card>
  );
}
