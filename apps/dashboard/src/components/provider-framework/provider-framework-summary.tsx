import { Boxes, HeartPulse, FlaskConical, ShieldCheck, Layers, GitBranch } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { frameworkMetrics as m } from "@/features/provider-framework";

export function ProviderFrameworkSummary() {
  const tiles = [
    { label: "Provider Types", value: `${m.registeredProviderTypes}`, icon: <Layers className="size-4" /> },
    { label: "Registered Providers", value: `${m.registeredProviders}`, icon: <Boxes className="size-4" /> },
    { label: "Framework Health", value: `${m.frameworkHealth}%`, icon: <HeartPulse className="size-4" /> },
    { label: "Simulation Coverage", value: `${m.simulationCoverage}%`, icon: <FlaskConical className="size-4" /> },
    { label: "Conformance", value: `${m.conformanceScore}`, icon: <ShieldCheck className="size-4" /> },
    { label: "Framework Version", value: `v${m.frameworkVersion}`, icon: <GitBranch className="size-4" /> },
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
