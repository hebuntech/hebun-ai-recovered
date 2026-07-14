import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { RiskHeatmap } from "@/components/governance/risk-heatmap";
import { EventTimeline } from "@/components/dashboard/event-timeline";
import { governanceRisks } from "@/features/governance/risk";

export default function GovernanceRiskPage() {
  const critical = governanceRisks.filter((risk) => risk.severity === "critical").length;

  return (
    <>
      <PageHeader
        title="Risk Center"
        context="Business, operational, AI, security and compliance risks with mitigation ownership."
        action={<Badge variant="error">{critical} critical</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-6 sm:col-span-3"><StatCard label="Risks" value={`${governanceRisks.length}`} /></div>
        <div className="col-span-6 sm:col-span-3"><StatCard label="Critical" value={`${critical}`} /></div>
        <div className="col-span-6 sm:col-span-3"><StatCard label="Mitigating" value={`${governanceRisks.filter((risk) => risk.status === "mitigating").length}`} /></div>
        <div className="col-span-6 sm:col-span-3"><StatCard label="Owners" value={`${new Set(governanceRisks.map((risk) => risk.owner)).size}`} /></div>

        <div className="col-span-12">
          <RiskHeatmap />
        </div>

        <div className="col-span-12">
          <EventTimeline
            events={governanceRisks.map((risk) => ({
              id: risk.id,
              type: `${risk.category}.risk`,
              source: risk.owner,
              message: `${risk.title} — ${risk.mitigation}`,
              severity: risk.severity === "critical" ? "error" : risk.severity === "high" ? "warning" : "info",
              timestamp: `${risk.status} · ${risk.trend}`,
            }))}
            title="Risk Register"
          />
        </div>
      </div>
    </>
  );
}
