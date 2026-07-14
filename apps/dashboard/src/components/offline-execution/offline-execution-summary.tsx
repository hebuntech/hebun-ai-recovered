import { Workflow, FlaskConical, GitBranch, ScrollText, ShieldCheck, HeartPulse } from "lucide-react";
import { StatCard } from "@/components/dashboard/stat-card";
import { offlineExecutionMetrics as m } from "@/features/offline-execution";

export function OfflineExecutionSummary() {
  const tiles = [
    { label: "Offline Sessions", value: `${m.offlineSessions}`, icon: <Workflow className="size-4" /> },
    { label: "Simulated Results", value: `${m.simulatedResults}`, icon: <FlaskConical className="size-4" /> },
    { label: "Traceability", value: `${m.traceabilityScore}%`, icon: <GitBranch className="size-4" /> },
    { label: "Audit Coverage", value: `${m.auditCoverage}%`, icon: <ScrollText className="size-4" /> },
    { label: "Simulation Enforced", value: `${m.simulationEnforcement}%`, icon: <ShieldCheck className="size-4" /> },
    { label: "Pipeline Health", value: `${m.pipelineHealth}%`, icon: <HeartPulse className="size-4" /> },
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
