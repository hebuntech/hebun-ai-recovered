import { Brain, FlaskConical, Gauge, KeyRound, ShieldCheck, Sparkles } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { claudeMetrics } from "@/features/providers/claude";

export function ClaudeSummary() {
  const tiles = [
    { label: "Provider Status", value: claudeMetrics.status, icon: <Brain className="size-4" /> },
    { label: "Simulation", value: claudeMetrics.simulationMode ? "Enabled" : "Disabled", icon: <FlaskConical className="size-4" /> },
    { label: "Capabilities", value: `${claudeMetrics.capabilityCoverage}`, icon: <Sparkles className="size-4" /> },
    { label: "Conformance", value: `${claudeMetrics.conformanceScore}`, icon: <Gauge className="size-4" /> },
    { label: "Credentials", value: claudeMetrics.credentialStatus, icon: <KeyRound className="size-4" /> },
    { label: "Safety", value: "Offline", icon: <ShieldCheck className="size-4" /> },
  ];

  return (
    <>
      {tiles.map((tile) => (
        <div key={tile.label} className="col-span-6 sm:col-span-4 xl:col-span-2">
          <StatCard label={tile.label} value={tile.value} icon={tile.icon} />
        </div>
      ))}
    </>
  );
}
