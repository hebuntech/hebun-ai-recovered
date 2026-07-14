import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { memoryMetrics } from "@/features/memory";

export function MemoryMetricsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Memory Metrics</CardTitle>
        <span className="text-xs text-fg-muted">
          category growth and reusable memory coverage
        </span>
      </CardHeader>
      <CardContent className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
            Memory Distribution
          </p>
          {memoryMetrics.categoryDistribution.map((item) => (
            <div key={item.category} className="rounded-md border bg-surface-sunken p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-fg">{item.label}</p>
                <p className="text-sm text-fg-secondary">{item.count}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
            Growth Signals
          </p>
          <div className="rounded-md border bg-surface-sunken p-3 text-sm text-fg-secondary">
            Memory assets are derived from registries and the knowledge graph, so
            growth follows real operational change instead of standalone manual logs.
          </div>
          <div className="rounded-md border bg-surface-sunken p-3 text-sm text-fg-secondary">
            Decision and learning memories form the strongest reuse path for future
            planning and reasoning systems.
          </div>
          <div className="rounded-md border bg-surface-sunken p-3 text-sm text-fg-secondary">
            Conversation memory stays summary-only, preventing raw chat history from
            becoming the persistence model.
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
