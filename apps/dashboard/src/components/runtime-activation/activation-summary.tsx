import { Gauge, FlaskConical, ShieldCheck, OctagonAlert, UserCheck, Radar } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { activationMetrics as m } from "@/features/runtime-activation";

export function ActivationSummary() {
  const tiles = [
    { label: "Activation Health", value: `${m.activationHealth}%`, icon: <ShieldCheck className="size-4" /> },
    { label: "Simulation", value: `${m.simulationCount}`, icon: <FlaskConical className="size-4" /> },
    { label: "Ready For Live", value: `${m.liveReadyCount}`, icon: <Gauge className="size-4" /> },
    { label: "Blocked", value: `${m.blockedCount}`, icon: <OctagonAlert className="size-4" /> },
    { label: "Approval Pending", value: `${m.approvalPendingCount}`, icon: <UserCheck className="size-4" /> },
    { label: "Avg Readiness", value: `${m.averageReadiness}%`, icon: <Radar className="size-4" /> },
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
