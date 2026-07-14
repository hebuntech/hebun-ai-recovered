import { Activity, Building2, Cpu } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { StatCard } from "@/components/dashboard/stat-card";
import { EventTimeline } from "@/components/dashboard/event-timeline";
import { Badge } from "@/components/ui/badge";
import { ExecutiveSummaryPanel } from "@/components/director/executive-summary-panel";
import { GoalProgressCard } from "@/components/director/goal-progress-card";
import { DomainReference } from "@/components/director/domain-reference";
import { strategicGoals, executiveTimeline, departmentHealth, companyHealth } from "@/features/director/mock";
import { systemStatus } from "@/features/architecture/mock";

export default function ExecutiveOverviewPage() {
  return (
    <>
      <PageHeader
        title="Executive Overview"
        context="Executive Command Center — the strategic view of the company and the launchpad into every operational domain. For live operations, open the Dashboard."
        action={<Badge variant="success">Company Health {companyHealth}</Badge>}
      />

      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12">
          <ExecutiveSummaryPanel withLink={false} />
        </div>

        {/* Top KPIs */}
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard label="Platform Health" value={`${systemStatus.platformHealth}%`} delta="+0.4%" caption="AI OS v1.0" icon={<Cpu className="size-4" />} />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard label="Active Departments" value={`${departmentHealth.length}`} caption="Sales · Ops · Finance · HR · Legal" icon={<Building2 className="size-4" />} />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard label="Engines" value={`${systemStatus.engines}`} caption="across 4 cores" icon={<Activity className="size-4" />} />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard label="Registries" value={`${systemStatus.registries}`} caption="single source of truth" icon={<Activity className="size-4" />} />
        </div>
        <div className="col-span-12 sm:col-span-6 xl:col-span-3">
          <StatCard label="ADRs" value={`${systemStatus.adrs}`} caption="architecture decisions" icon={<Activity className="size-4" />} />
        </div>

        {/* Strategic goals */}
        {strategicGoals.slice(0, 3).map((g) => (
          <div key={g.id} className="col-span-12 xl:col-span-4">
            <GoalProgressCard goal={g} />
          </div>
        ))}

        {/* Organization Health — owned by /director/organization-health */}
        <div className="col-span-12">
          <DomainReference
            title="Organization Health"
            description={`Company Health ${companyHealth} · department capacity, efficiency, AI utilization, learning and risk across every department.`}
            href="/director/organization-health"
            cta="Open Organization Health"
          />
        </div>

        {/* Domain references — Director links to owners instead of embedding operational detail */}
        <div className="col-span-12 xl:col-span-6">
          <DomainReference
            title="Critical Alerts"
            description="Incidents, risk, compliance, infra, approval and security escalations are owned by Critical Alerts and monitored live on the Dashboard."
            href="/director/alerts"
            cta="Open Critical Alerts"
          />
        </div>
        <div className="col-span-12 xl:col-span-6">
          <DomainReference
            title="Live Operations"
            description="Running work, recommendations, execution flow, and provider / runtime posture live on the operational Dashboard."
            href="/dashboard"
            cta="Open Dashboard"
          />
        </div>

        <div className="col-span-12">
          <EventTimeline events={executiveTimeline} title="Executive Timeline" />
        </div>
      </div>
    </>
  );
}
