import { Route, HeartPulse, GitFork, Layers, Gauge, FlaskConical } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { routingMetrics as m } from "@/features/provider-routing";

export function RoutingSummary() {
  const tiles = [
    { label: "Routing Health", value: `${m.routingHealth}%`, icon: <HeartPulse className="size-4" /> },
    { label: "Active Strategies", value: `${m.activeStrategies}`, icon: <Layers className="size-4" /> },
    { label: "Primary Providers", value: `${m.primaryProviders}`, icon: <Route className="size-4" /> },
    { label: "Fallback Coverage", value: `${m.fallbackCoverage}%`, icon: <GitFork className="size-4" /> },
    { label: "Avg Confidence", value: `${m.averageConfidence}`, icon: <Gauge className="size-4" /> },
    { label: "Simulation", value: `${m.simulationCoverage}%`, icon: <FlaskConical className="size-4" /> },
  ];
  return (
    <>
      {tiles.map((t) => (
        <div key={t.label} className="col-span-6 sm:col-span-4 xl:col-span-2">
          <StatCard label={t.label} value={t.value} icon={t.icon} />
        </div>
      ))}
    </>
  );
}
