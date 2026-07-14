import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RegistryInsight } from "@/features/registries/insights";

function priorityVariant(priority: RegistryInsight["priority"]) {
  if (priority === "high") return "warning";
  if (priority === "medium") return "info";
  return "neutral";
}

export function RegistryInsights({
  insights,
  title = "Cross-Registry Insights",
}: {
  insights: RegistryInsight[];
  title?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <span className="text-xs text-fg-muted">
          interpreted operational observations
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {insights.map((insight) => (
          <div
            key={insight.id}
            className="rounded-md border bg-surface-sunken p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-fg">{insight.title}</p>
                <p className="mt-1 text-sm text-fg-secondary">
                  {insight.detail}
                </p>
              </div>
              <Badge variant={priorityVariant(insight.priority)}>
                {insight.priority}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-fg-muted">
              <span>{insight.category}</span>
              <span>·</span>
              <span>{insight.registryIds.length} linked registries</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
