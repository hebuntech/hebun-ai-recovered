import Link from "next/link";
import { ArrowRight, Route } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { routingMetrics as m } from "@/features/provider-routing";

export function RoutingWidget() {
  const tiles = [
    { label: "Routing Health", value: `${m.routingHealth}%` },
    { label: "Strategies", value: `${m.activeStrategies}` },
    { label: "Primary", value: `${m.primaryProviders}` },
    { label: "Fallback", value: `${m.fallbackCoverage}%` },
    { label: "Confidence", value: `${m.averageConfidence}` },
    { label: "Simulation", value: `${m.simulationCoverage}%` },
  ];
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Route className="size-4 text-primary" />
          Provider Routing Engine
        </CardTitle>
        <span className="text-xs text-fg-muted">selects the right provider for every request</span>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-6">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-md border bg-surface-sunken p-3">
              <p className="text-xs font-medium uppercase tracking-wider text-fg-secondary">{t.label}</p>
              <p className="mt-1 text-sm font-bold text-fg tabular-nums">{t.value}</p>
            </div>
          ))}
        </div>
        <Link
          href="/director/provider-routing"
          className="inline-flex w-fit items-center gap-1.5 text-sm font-medium text-primary transition-colors duration-(--dur-fast) hover:text-primary-hover"
        >
          Open Provider Routing
          <ArrowRight className="size-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
