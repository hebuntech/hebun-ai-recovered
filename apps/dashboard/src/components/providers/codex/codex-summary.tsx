import { StatCard } from "@/components/dashboard/stat-card";
import { codexMetrics } from "@/features/providers/codex";

export function CodexSummary() {
  return (
    <>
      <div className="col-span-6 sm:col-span-3"><StatCard label="Status" value={codexMetrics.status} /></div>
      <div className="col-span-6 sm:col-span-3"><StatCard label="Capabilities" value={`${codexMetrics.capabilityCoverage}`} /></div>
      <div className="col-span-6 sm:col-span-3"><StatCard label="Conformance" value={`${codexMetrics.conformanceScore}%`} /></div>
      <div className="col-span-6 sm:col-span-3"><StatCard label="Credentials" value={codexMetrics.credentialStatus} /></div>
    </>
  );
}
