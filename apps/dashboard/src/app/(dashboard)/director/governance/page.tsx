import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { GovernanceHealthCard } from "@/components/governance/governance-health-card";
import { GovernanceSummary } from "@/components/governance/governance-summary";
import { ApprovalQueue } from "@/components/governance/approval-queue";
import { EventTimeline } from "@/components/dashboard/event-timeline";
import { GovernanceTimeline } from "@/components/governance/governance-timeline";
import { RiskHeatmap } from "@/components/governance/risk-heatmap";
import { governanceMetrics } from "@/features/governance/metrics";
import { auditEvents } from "@/features/governance/audit";
import { governanceRisks } from "@/features/governance/risk";
import { countryCompliance } from "@/features/governance/compliance";

export default function GovernanceOverviewPage() {
  return (
    <>
      <PageHeader
        title="Governance Center"
        context="The enterprise governance console for approvals, policies, compliance and control."
        action={<Badge variant="success">Governance Health {governanceMetrics.health}</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 xl:col-span-4">
          <GovernanceHealthCard health={governanceMetrics.health} />
        </div>

        <GovernanceSummary />

        <div className="col-span-12 xl:col-span-7">
          <ApprovalQueue title="Approval Queue" />
        </div>
        <div className="col-span-12 xl:col-span-5">
          <EventTimeline events={auditEvents.slice(0, 5)} title="Audit Activity" />
        </div>

        <div className="col-span-12 xl:col-span-7">
          <RiskHeatmap />
        </div>
        <div className="col-span-12 xl:col-span-5">
          <EventTimeline
            events={countryCompliance.map((item) => ({
              id: item.id,
              type: "compliance.overview",
              source: item.label,
              message: `${item.score}% compliance — ${item.note}`,
              severity: item.score >= 93 ? "success" : item.score >= 90 ? "warning" : "error",
              timestamp: item.trend === "up" ? "improving" : item.trend === "down" ? "slipping" : "stable",
            }))}
            title="Compliance Overview"
          />
        </div>

        <div className="col-span-12 xl:col-span-6">
          <EventTimeline
            events={governanceRisks.map((risk) => ({
              id: risk.id,
              type: `${risk.category}.risk`,
              source: risk.owner,
              message: `${risk.title} — ${risk.mitigation}`,
              severity: risk.severity === "critical" ? "error" : risk.severity === "high" ? "warning" : "info",
              timestamp: risk.status,
            }))}
            title="Active Risks"
          />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <GovernanceTimeline />
        </div>
      </div>
    </>
  );
}
