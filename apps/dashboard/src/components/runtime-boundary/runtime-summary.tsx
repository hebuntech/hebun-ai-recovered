import { ShieldCheck, FlaskConical, ArrowUpCircle, OctagonAlert, KeyRound, Users } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { runtimeMetrics as m } from "@/features/runtime-boundary";

export function RuntimeSummary() {
  const tiles = [
    { label: "Runtime Health", value: `${m.runtimeHealth}%`, icon: <ShieldCheck className="size-4" /> },
    { label: "Simulation", value: `${m.simulationCoverage}%`, icon: <FlaskConical className="size-4" /> },
    { label: "Promotion Ready", value: `${m.promotionReadiness}%`, icon: <ArrowUpCircle className="size-4" /> },
    { label: "Blocked", value: `${m.blockedInvocations}`, icon: <OctagonAlert className="size-4" /> },
    { label: "Approval Queue", value: `${m.approvalQueue}`, icon: <Users className="size-4" /> },
    { label: "Credential PH", value: `${m.credentialPlaceholders}`, icon: <KeyRound className="size-4" /> },
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
