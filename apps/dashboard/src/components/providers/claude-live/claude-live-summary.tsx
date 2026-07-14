import { FlaskConical, KeyRound, ShieldCheck, ShieldOff, Sparkles, TimerReset } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { claudeLiveMetrics } from "@/features/providers/claude-live";

export function ClaudeLiveSummary() {
  const tiles = [
    { label: "Mode", value: claudeLiveMetrics.mode, icon: <FlaskConical className="size-4" /> },
    { label: "Capability", value: claudeLiveMetrics.supportedCapability, icon: <Sparkles className="size-4" /> },
    { label: "Live Eligible", value: claudeLiveMetrics.liveEligible ? "Yes" : "No", icon: <ShieldCheck className="size-4" /> },
    { label: "Credential", value: claudeLiveMetrics.credentialStatus, icon: <KeyRound className="size-4" /> },
    { label: "Dry Run", value: claudeLiveMetrics.dryRunStatus, icon: <TimerReset className="size-4" /> },
    { label: "Fallback", value: claudeLiveMetrics.simulationFallback ? "Prepared" : "Missing", icon: <ShieldOff className="size-4" /> },
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
