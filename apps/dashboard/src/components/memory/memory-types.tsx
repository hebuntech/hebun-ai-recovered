import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { memoryMetrics, memoryTypeDefinitions } from "@/features/memory";

export function MemoryTypes() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Memory Types</CardTitle>
        <span className="text-xs text-fg-muted">
          the persistent memory categories future systems will build on
        </span>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {memoryTypeDefinitions.map((type) => {
          const metric = memoryMetrics.categoryDistribution.find(
            (item) => item.category === type.id
          );
          return (
            <div key={type.id} className="rounded-md border bg-surface-sunken p-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-fg">{type.label}</p>
                <p className="text-sm text-fg-secondary">{metric?.count ?? 0}</p>
              </div>
              <p className="mt-1 text-sm text-fg-secondary">{type.description}</p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
