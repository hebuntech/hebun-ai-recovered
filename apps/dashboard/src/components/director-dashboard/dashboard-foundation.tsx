import { Badge } from "@/components/ui/badge";
import { PageHeader } from "@/components/layout/page-header";
import { ActiveGoalsSection } from "@/components/director-dashboard/active-goals-section";
import { ActiveMissionsSection } from "@/components/director-dashboard/active-missions-section";
import { AgentActivitySection } from "@/components/director-dashboard/agent-activity-section";
import { AITransformationSection } from "@/components/director-dashboard/ai-transformation-section";
import { AlertsRisksSection } from "@/components/director-dashboard/alerts-risks-section";
import { CompanyOverviewSection } from "@/components/director-dashboard/company-overview-section";
import { DirectorInsightsSection } from "@/components/director-dashboard/director-insights-section";
import { ExecutiveTimelineSection } from "@/components/director-dashboard/executive-timeline-section";
import { KnowledgeOverviewSection } from "@/components/director-dashboard/knowledge-overview-section";
import { MemoryOverviewSection } from "@/components/director-dashboard/memory-overview-section";
import { OpportunitiesSection } from "@/components/director-dashboard/opportunities-section";
import { OrganizationalHealthSection } from "@/components/director-dashboard/organizational-health-section";
import { RecentDecisionsSection } from "@/components/director-dashboard/recent-decisions-section";
import { WorkflowActivitySection } from "@/components/director-dashboard/workflow-activity-section";
import type { DirectorDashboardSnapshot } from "@/features/director-dashboard/foundation";

interface DashboardFoundationProps {
  snapshot: DirectorDashboardSnapshot;
}

export function DashboardFoundation({ snapshot }: DashboardFoundationProps) {
  const memoryProvider = snapshot.providers.find((provider) => provider.key === "memory");
  const postgresProvider = snapshot.providers.find((provider) => provider.key === "postgres");

  return (
    <>
      <PageHeader
        title="Director Dashboard"
        context="The operational control center of the company. Every panel below reads the current memory-backed runtime state and stays honest about domains that are not yet live."
        action={
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="success">
              {memoryProvider?.label ?? "Memory"} {memoryProvider?.status ?? "active"}
            </Badge>
            <Badge variant="neutral">
              {postgresProvider?.label ?? "PostgreSQL"} {postgresProvider?.status ?? "inactive"}
            </Badge>
          </div>
        }
      />

      <div className="space-y-6">
        <CompanyOverviewSection overview={snapshot.companyOverview} />

        <div className="grid gap-6 xl:grid-cols-2">
          <DirectorInsightsSection items={snapshot.directorInsights} />
          <OrganizationalHealthSection items={snapshot.organizationalHealth} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <AITransformationSection transformation={snapshot.aiTransformation} />
          <ActiveMissionsSection items={snapshot.activeMissions} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <ActiveGoalsSection items={snapshot.activeGoals} />
          <WorkflowActivitySection items={snapshot.workflowActivity} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <AgentActivitySection items={snapshot.agentActivity} />
          <KnowledgeOverviewSection overview={snapshot.knowledgeOverview} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <MemoryOverviewSection overview={snapshot.memoryOverview} />
          <RecentDecisionsSection items={snapshot.recentDecisions} />
        </div>

        <div className="grid gap-6 xl:grid-cols-2">
          <AlertsRisksSection items={snapshot.alertsAndRisks} />
          <OpportunitiesSection items={snapshot.opportunities} />
        </div>

        <ExecutiveTimelineSection items={snapshot.executiveTimeline} />
      </div>
    </>
  );
}
