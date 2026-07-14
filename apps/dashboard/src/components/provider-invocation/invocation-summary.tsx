import { PackageCheck, FlaskConical, RefreshCw, TimerReset, ScrollText, HeartPulse } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { invocationMetrics as m } from "@/features/provider-invocation";

export function InvocationSummary() {
  const tiles = [
    { label: "Prepared", value: `${m.preparedInvocations}/${m.totalInvocations}`, icon: <PackageCheck className="size-4" /> },
    { label: "Simulation", value: `${m.simulationInvocations}`, icon: <FlaskConical className="size-4" /> },
    { label: "Retry Coverage", value: `${m.retryCoverage}%`, icon: <RefreshCw className="size-4" /> },
    { label: "Timeout Coverage", value: `${m.timeoutCoverage}%`, icon: <TimerReset className="size-4" /> },
    { label: "Audit Coverage", value: `${m.auditCoverage}%`, icon: <ScrollText className="size-4" /> },
    { label: "Invocation Health", value: `${m.invocationHealth}%`, icon: <HeartPulse className="size-4" /> },
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
