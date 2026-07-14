import { AgentRegistry, type AgentEmployeeRuntimeModel } from "@/features/agent-runtime";
import { DecisionRuntimeService } from "@/features/decision-runtime";
import { DirectorAIRuntime } from "@/features/director-ai-runtime";
import type {
  ExecutiveListItemRuntimeModel,
  ExecutiveOverviewRuntimeModel,
  ExecutiveTimelineEventRuntimeModel,
} from "@/features/executive-runtime-support/types";
import { EnterpriseTransformationEngine } from "@/features/enterprise-transformation-runtime";
import { ExecutiveTimelineRuntimeService } from "@/features/executive-timeline-runtime";
import { GoalRuntimeService } from "@/features/goal-runtime";
import { KnowledgeRuntimeService } from "@/features/knowledge-runtime";
import { MemoryRuntimeService } from "@/features/memory-runtime";
import { MissionRuntimeService } from "@/features/mission-runtime";
import { OrganizationalIntelligenceEngine } from "@/features/organizational-intelligence";
import { listRegisteredPersistenceProviders } from "@/features/persistence/provider-registry";
import type { PersistenceProviderDescriptor } from "@/features/persistence/types";
import { WorkflowRegistry, type WorkflowRuntimeModel } from "@/features/workflow-runtime";

export interface DashboardMetric {
  label: string;
  value: string;
  detail: string;
}

export interface DashboardHealthRow {
  id: string;
  label: string;
  score: number;
  detail: string;
  trend: string;
}

export interface DashboardSectionItem {
  id: string;
  title: string;
  detail: string;
  meta?: string;
  status?: string;
  href?: string;
}

export interface DashboardTimelineItem {
  id: string;
  title: string;
  detail: string;
  when: string;
  kind: string;
}

export interface DashboardSignal {
  id: string;
  title: string;
  detail: string;
  severity: "critical" | "high" | "medium" | "low";
}

export interface DirectorDashboardSnapshot {
  generatedAt: string;
  providers: readonly PersistenceProviderDescriptor[];
  companyOverview: {
    healthScore: number;
    metrics: DashboardMetric[];
  };
  directorInsights: DashboardSectionItem[];
  aiTransformation: ReturnType<typeof EnterpriseTransformationEngine.getDashboardSurface>;
  organizationalHealth: DashboardHealthRow[];
  activeMissions: DashboardSectionItem[];
  activeGoals: DashboardSectionItem[];
  workflowActivity: DashboardSectionItem[];
  agentActivity: DashboardSectionItem[];
  knowledgeOverview: {
    metrics: DashboardMetric[];
    items: DashboardSectionItem[];
  };
  memoryOverview: {
    metrics: DashboardMetric[];
    items: DashboardSectionItem[];
  };
  recentDecisions: DashboardSectionItem[];
  alertsAndRisks: DashboardSignal[];
  opportunities: DashboardSignal[];
  executiveTimeline: DashboardTimelineItem[];
}

function formatPercent(value: number): string {
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
}

function formatDate(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function buildOrganizationalHealth(
  departments: Array<{ id: string; label: string; score: number; detail: string; trend: string }>,
): DashboardHealthRow[] {
  return departments.map((department) => ({
    id: department.id,
    label: department.label,
    score: department.score,
    detail: department.detail,
    trend: department.trend,
  }));
}

function mapExecutiveItems(items: ExecutiveListItemRuntimeModel[]): DashboardSectionItem[] {
  return items.map((item) => ({
    id: item.id,
    title: item.title,
    detail: item.detail,
    meta: item.meta,
    status: item.status,
    href: item.href,
  }));
}

function mapExecutiveOverview(
  overview: ExecutiveOverviewRuntimeModel,
): DirectorDashboardSnapshot["knowledgeOverview"] {
  return {
    metrics: overview.metrics.map((metric) => ({
      label: metric.label,
      value: metric.value,
      detail: metric.detail,
    })),
    items: mapExecutiveItems(overview.items),
  };
}

function buildActiveGoals(): DashboardSectionItem[] {
  return GoalRuntimeService.listGoals()
    .slice(0, 6)
    .map((goal) => ({
      id: goal.id,
      title: goal.title,
      detail: goal.description,
      meta: `${goal.source} · confidence ${formatPercent(goal.confidence)}`,
      status: goal.status,
      href: "/director/registries/goals",
    }));
}

function buildActiveMissions(): DashboardSectionItem[] {
  return MissionRuntimeService.listMissions()
    .slice(0, 6)
    .map((mission) => ({
      id: mission.id,
      title: mission.title,
      detail: mission.description,
      meta: `${mission.source} · confidence ${formatPercent(mission.confidence)}`,
      status: mission.status,
      href: "/director/goals",
    }));
}

function buildWorkflowItems(workflows: WorkflowRuntimeModel[]): DashboardSectionItem[] {
  return workflows
    .slice(0, 8)
    .map((workflow) => ({
      id: workflow.identity.id,
      title: workflow.identity.name,
      detail: `${workflow.department?.label ?? "Organization"} · ${workflow.assignedAgents[0]?.label ?? "Unassigned"} · ${workflow.progress.runsToday} runs today`,
      meta: `${workflow.timeline.trigger} · success ${formatPercent(workflow.progress.successRate)}`,
      status: workflow.executionStatus,
      href: "/director/registries/workflows",
    }));
}

function buildDirectorInsights(
  items: ReturnType<typeof DirectorAIRuntime.getRuntimeSurface>["dashboardInsights"],
): DashboardSectionItem[] {
  return items.map((item) => ({
    id: item.id,
    title: item.summary,
    detail: item.recommendedNextAction,
    meta: `${item.category} · confidence ${formatPercent(item.confidence)}`,
    status: item.severity,
    href: "/director/intelligence/insights",
  }));
}

function buildAgentItems(agents: AgentEmployeeRuntimeModel[]): DashboardSectionItem[] {
  return agents
    .sort((a, b) => {
      const statusWeight = (value: AgentEmployeeRuntimeModel["status"]) =>
        value === "error" ? 4 : value === "running" ? 3 : value === "paused" ? 2 : 1;
      const bTaskCount = b.assignedWork.length;
      const aTaskCount = a.assignedWork.length;
      return statusWeight(b.status) - statusWeight(a.status) || bTaskCount - aTaskCount;
    })
    .slice(0, 8)
    .map((agent) => ({
      id: agent.identity.id,
      title: agent.identity.name,
      detail: `${agent.department?.label ?? "Organization"} · ${agent.authority.roleLabel} · ${agent.assignedWork.length} linked workflows`,
      meta: `${agent.reasoningProfile.model} · ${agent.riskLevel} risk · ${agent.statusSummary.headline}`,
      status: agent.status,
      href: "/director/registries/agents",
    }));
}

function buildRecentDecisions(): DashboardSectionItem[] {
  return mapExecutiveItems(
    DecisionRuntimeService.listDashboardItems().map((decision) => ({
      ...decision,
      meta: decision.meta ? formatDecisionMeta(decision.meta) : undefined,
    })),
  );
}

function buildAlertsAndRisks(
  insights: Array<{ id: string; summary: string; recommendedNextAction: string; severity: DashboardSignal["severity"] }>,
): DashboardSignal[] {
  return insights.slice(0, 8).map((insight) => ({
    id: insight.id,
    title: insight.summary,
    detail: insight.recommendedNextAction,
    severity: insight.severity,
  }));
}

function buildOpportunities(
  insights: Array<{ id: string; summary: string; recommendedNextAction: string; severity: DashboardSignal["severity"] }>,
): DashboardSignal[] {
  return insights.slice(0, 8).map((insight) => ({
    id: insight.id,
    title: insight.summary,
    detail: insight.recommendedNextAction,
    severity: insight.severity,
  }));
}

function formatDecisionMeta(meta: string): string {
  const parts = meta.split(" · ");
  if (parts.length < 3) return meta;
  const [ownerType, ownerId, updatedAt] = parts;
  return `${ownerType} · ${ownerId} · ${formatDate(updatedAt)}`;
}

function buildExecutiveTimeline(): DashboardTimelineItem[] {
  return ExecutiveTimelineRuntimeService.listTimelineEvents().map(
    (event: ExecutiveTimelineEventRuntimeModel) => ({
      id: event.id,
      title: event.title,
      detail: event.detail,
      when: formatDate(event.when),
      kind: event.kind,
    }),
  );
}

export async function getDirectorDashboardSnapshot(): Promise<DirectorDashboardSnapshot> {
  const [providers] = await Promise.all([listRegisteredPersistenceProviders()]);
  const intelligence = OrganizationalIntelligenceEngine.getSnapshot();
  const transformation = EnterpriseTransformationEngine.buildSnapshot(intelligence.observations);
  const directorAI = DirectorAIRuntime.getRuntimeSurface({
    transformationSnapshot: transformation,
  });
  const runtimeAgents = AgentRegistry.listAgents();
  const runtimeWorkflows = WorkflowRegistry.listWorkflows();

  return {
    generatedAt: new Date().toISOString(),
    providers,
    companyOverview: intelligence.companyOverview,
    directorInsights: buildDirectorInsights(directorAI.dashboardInsights),
    aiTransformation: EnterpriseTransformationEngine.getDashboardSurface(transformation),
    organizationalHealth: buildOrganizationalHealth(intelligence.health.departmentHealth),
    activeMissions: buildActiveMissions(),
    activeGoals: buildActiveGoals(),
    workflowActivity: buildWorkflowItems(runtimeWorkflows),
    agentActivity: buildAgentItems(runtimeAgents),
    knowledgeOverview: mapExecutiveOverview(KnowledgeRuntimeService.getOverview()),
    memoryOverview: mapExecutiveOverview(MemoryRuntimeService.getOverview()),
    recentDecisions: buildRecentDecisions(),
    alertsAndRisks: buildAlertsAndRisks(intelligence.risks),
    opportunities: buildOpportunities(intelligence.opportunities),
    executiveTimeline: buildExecutiveTimeline(),
  };
}
