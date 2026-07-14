import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { memoryMetrics } from "@/features/memory";

export function MemoryHealth() {
  const health = memoryMetrics.health;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Memory Health</CardTitle>
        <Badge variant={health.badge}>{health.status}</Badge>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div>
          <p className="text-lg font-semibold text-fg">{health.score}</p>
          <p className="mt-1 text-sm text-fg-secondary">{health.summary}</p>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {health.signals.map((signal) => (
            <div key={signal} className="rounded-md border bg-surface-sunken p-3 text-sm text-fg-secondary">
              {signal}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
