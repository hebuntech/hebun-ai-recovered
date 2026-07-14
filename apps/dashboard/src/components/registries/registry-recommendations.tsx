import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { RegistryRecommendation } from "@/features/registries/recommendations";

function priorityVariant(priority: RegistryRecommendation["priority"]) {
  if (priority === "critical") return "error";
  if (priority === "high") return "warning";
  if (priority === "medium") return "info";
  return "neutral";
}

export function RegistryRecommendations({
  recommendations,
  title = "Director Recommendations",
}: {
  recommendations: RegistryRecommendation[];
  title?: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <span className="text-xs text-fg-muted">
          recommended director-level follow-up actions
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        {recommendations.map((recommendation) => (
          <div
            key={recommendation.id}
            className="rounded-md border bg-surface-sunken p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-fg">
                  {recommendation.title}
                </p>
                <p className="mt-1 text-sm text-fg-secondary">
                  {recommendation.detail}
                </p>
                <p className="mt-2 text-sm text-fg">
                  <span className="font-medium">Action: </span>
                  {recommendation.action}
                </p>
              </div>
              <Badge variant={priorityVariant(recommendation.priority)}>
                {recommendation.priority}
              </Badge>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-xs text-fg-muted">
              <span>{recommendation.owner}</span>
              <span>·</span>
              <span>{recommendation.registryIds.length} linked registries</span>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
