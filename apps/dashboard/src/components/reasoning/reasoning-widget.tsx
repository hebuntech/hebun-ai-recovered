import Link from "next/link";
import { ArrowRight, Zap } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { reasoningMetrics } from "@/features/reasoning";

export function ReasoningWidget() {
  const tiles = [
    { label: "Latest Recommendation", value: reasoningMetrics.latestRecommendation },
    { label: "Confidence", value: `${reasoningMetrics.averageConfidence}` },
    { label: "Open Sessions", value: `${reasoningMetrics.openSessions}` },
    { label: "Health", value: `${reasoningMetrics.health}` },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="size-4 text-primary" />
          Reasoning Engine
        </CardTitle>
        <span className="text-xs text-fg-muted">
          deterministic recommendation and explanation layer
        </span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {tiles.map((tile) => (
            <div key={tile.label} className="rounded-md border bg-surface-sunken p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">
                {tile.label}
              </p>
              <p className="mt-1 text-sm font-bold text-fg">{tile.value}</p>
            </div>
          ))}
        </div>
        <Link
          href="/director/reasoning"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
        >
          Open Reasoning Engine
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
