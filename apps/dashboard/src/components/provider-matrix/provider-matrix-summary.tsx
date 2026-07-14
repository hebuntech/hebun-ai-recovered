import { Boxes, HeartPulse, FlaskConical, Grid3x3, AlertTriangle, Trophy } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { providerMatrixMetrics as m } from "@/features/provider-matrix";

export function ProviderMatrixSummary() {
  const tiles = [
    { label: "Providers", value: `${m.providerCount}`, icon: <Boxes className="size-4" /> },
    {
      label: "Capability Coverage",
      value: `${m.coveredCapabilities}/${m.totalCapabilities}`,
      icon: <Grid3x3 className="size-4" />,
    },
    { label: "Network Health", value: `${m.overallHealth}%`, icon: <HeartPulse className="size-4" /> },
    { label: "Simulation", value: `${m.simulationCoverage}%`, icon: <FlaskConical className="size-4" /> },
    { label: "Avg Score", value: `${m.averageScore}`, icon: <Trophy className="size-4" /> },
    { label: "Missing Providers", value: `${m.missingProviders}`, icon: <AlertTriangle className="size-4" /> },
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
