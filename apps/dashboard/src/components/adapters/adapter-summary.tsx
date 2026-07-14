import { Boxes, HeartPulse, FlaskConical, Layers, Activity, Gauge } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { adapterMetrics as m } from "@/features/adapters";

export function AdapterSummary() {
  const tiles = [
    { label: "Registered Adapters", value: `${m.registered}`, icon: <Boxes className="size-4" /> },
    { label: "Healthy Adapters", value: `${m.healthy}`, icon: <HeartPulse className="size-4" /> },
    { label: "Simulation Ready", value: m.simulationReady ? "Yes" : "No", icon: <FlaskConical className="size-4" /> },
    { label: "Capabilities", value: `${m.capabilitiesCovered}/${m.capabilitiesTotal}`, icon: <Layers className="size-4" /> },
    { label: "Executions", value: `${m.totalExecutions}`, icon: <Activity className="size-4" /> },
    { label: "Success Rate", value: `${m.successRate}%`, icon: <Gauge className="size-4" /> },
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
