import { StatCard } from "@/components/dashboard/stat-card";
import { policyMetrics } from "@/features/policy";

export function PolicySummary() {
  return (
    <>
      <div className="col-span-6 sm:col-span-4 xl:col-span-2">
        <StatCard label="Policy Health" value={`${policyMetrics.policyHealth}`} />
      </div>
      <div className="col-span-6 sm:col-span-4 xl:col-span-2">
        <StatCard label="Compliance Score" value={`${policyMetrics.complianceScore}`} />
      </div>
      <div className="col-span-6 sm:col-span-4 xl:col-span-2">
        <StatCard label="Open Approvals" value={`${policyMetrics.openApprovals}`} />
      </div>
      <div className="col-span-6 sm:col-span-4 xl:col-span-2">
        <StatCard label="Blocked Decisions" value={`${policyMetrics.blockedDecisions}`} />
      </div>
      <div className="col-span-6 sm:col-span-4 xl:col-span-2">
        <StatCard label="High Risk Decisions" value={`${policyMetrics.highRiskDecisions}`} />
      </div>
      <div className="col-span-6 sm:col-span-4 xl:col-span-2">
        <StatCard label="Avg Confidence" value={`${policyMetrics.averageConfidence}`} />
      </div>
    </>
  );
}
