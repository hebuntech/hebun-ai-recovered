import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { knowledgeGraphMetrics } from "@/features/knowledge-graph";

export function KnowledgeGraphMetricsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Graph Metrics</CardTitle>
        <span className="text-xs text-fg-muted">
          most connected registries and relationship distribution
        </span>
      </CardHeader>
      <CardContent className="grid gap-6 xl:grid-cols-2">
        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
            Most Connected Registries
          </p>
          {knowledgeGraphMetrics.mostConnectedRegistries.map((registry) => (
            <div key={registry.registryType} className="rounded-md border bg-surface-sunken p-3">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-fg">{registry.registryType}</p>
                <p className="text-sm font-medium text-fg-secondary">
                  {registry.relationshipCount} links
                </p>
              </div>
              <p className="mt-1 text-sm text-fg-secondary">
                {registry.nodeCount} nodes · avg health {registry.averageHealth}
              </p>
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
            Relationship Distribution
          </p>
          {knowledgeGraphMetrics.relationshipDistribution.map((distribution) => (
            <div
              key={distribution.relationshipType}
              className="flex items-center justify-between rounded-md border bg-surface-sunken px-3 py-2"
            >
              <span className="text-sm font-medium text-fg">
                {distribution.relationshipType}
              </span>
              <span className="text-sm text-fg-secondary">{distribution.count}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
