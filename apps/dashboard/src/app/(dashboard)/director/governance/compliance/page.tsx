import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { ComplianceCard } from "@/components/governance/compliance-card";
import {
  countryCompliance,
  departmentCompliance,
  workflowCompliance,
  capabilityCompliance,
  complianceViolations,
  upcomingComplianceReviews,
} from "@/features/governance/compliance";
import { governanceMetrics } from "@/features/governance/metrics";
import { EventTimeline } from "@/components/dashboard/event-timeline";

export default function GovernanceCompliancePage() {
  return (
    <>
      <PageHeader
        title="Compliance Center"
        context="Overall compliance health across countries, departments, workflows and capabilities."
        action={<Badge variant="success">{governanceMetrics.complianceScore}% score</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-6 sm:col-span-3"><StatCard label="Overall" value={`${governanceMetrics.complianceScore}%`} /></div>
        <div className="col-span-6 sm:col-span-3"><StatCard label="Countries" value={`${countryCompliance.length}`} /></div>
        <div className="col-span-6 sm:col-span-3"><StatCard label="Violations" value={`${complianceViolations.length}`} /></div>
        <div className="col-span-6 sm:col-span-3"><StatCard label="Upcoming Reviews" value={`${upcomingComplianceReviews.length}`} /></div>

        {countryCompliance.map((item) => (
          <div key={item.id} className="col-span-12 sm:col-span-6 xl:col-span-3">
            <ComplianceCard item={item} />
          </div>
        ))}

        {departmentCompliance.map((item) => (
          <div key={item.id} className="col-span-12 sm:col-span-6 xl:col-span-4">
            <ComplianceCard item={item} />
          </div>
        ))}

        <div className="col-span-12 xl:col-span-6">
          <EventTimeline
            events={workflowCompliance.map((item) => ({
              id: item.id,
              type: "workflow.compliance",
              source: item.label,
              message: `${item.score}% — ${item.note}`,
              severity: item.score >= 92 ? "success" : item.score >= 89 ? "warning" : "error",
              timestamp: item.trend,
            }))}
            title="Workflow Compliance"
          />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <EventTimeline
            events={capabilityCompliance.map((item) => ({
              id: item.id,
              type: "capability.compliance",
              source: item.label,
              message: `${item.score}% — ${item.note}`,
              severity: item.score >= 92 ? "success" : item.score >= 89 ? "warning" : "error",
              timestamp: item.trend,
            }))}
            title="Capability Compliance"
          />
        </div>
      </div>
    </>
  );
}
