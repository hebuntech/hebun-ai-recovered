import { StatCard } from "@/components/dashboard/stat-card";
import { governanceMetrics } from "@/features/governance/metrics";

export function GovernanceSummary() {
  const items = [
    { label: "Pending Approvals", value: `${governanceMetrics.pendingApprovals}` },
    { label: "Compliance Score", value: `${governanceMetrics.complianceScore}%` },
    { label: "Policy Status", value: `${governanceMetrics.activePolicies}` , caption: "active policies"},
    { label: "Audit Health", value: `${governanceMetrics.auditHealth}%` },
    { label: "Permission Issues", value: `${governanceMetrics.permissionIssues}` },
    { label: "Critical Risks", value: `${governanceMetrics.criticalRisks}` },
    { label: "Explainability", value: `${governanceMetrics.explainabilityCoverage}%`, caption: "coverage" },
  ];

  return (
    <>
      <div className="col-span-12 xl:col-span-3">
        <StatCard label="Governance Health" value={`${governanceMetrics.health}`} caption="composite" />
      </div>
      {items.map((item) => (
        <div key={item.label} className="col-span-6 sm:col-span-3 xl:col-span-3">
          <StatCard label={item.label} value={item.value} caption={item.caption} />
        </div>
      ))}
    </>
  );
}
