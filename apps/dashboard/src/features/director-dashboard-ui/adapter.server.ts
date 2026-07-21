import type { AgentEmployeeRuntimeModel } from "../agent-runtime";
import {
  createDashboardSnapshot,
  DASHBOARD_DATA_SOURCES,
  DASHBOARD_SECTION_IDS,
  DashboardRegistry,
  type DashboardSnapshot,
} from "../director-dashboard-data";
import {
  createDefaultWidgetRegistry,
  WidgetRefreshEngine,
  type WidgetRuntimeSnapshot,
} from "../director-dashboard-widget-runtime";
import type { OrganizationRuntimeSnapshot } from "../organization-runtime";
import {
  ensureRuntimeProjectionRegistry,
  runtimeProjectionRegistry,
} from "../runtime-projection";
import type { WorkflowRuntimeModel } from "../workflow-runtime";

const dashboardScope = Object.freeze({
  kind: "platform" as const,
  authority: "hebun-dashboard",
  resolvedBy: "server" as const,
});

function dashboardRegistry(): DashboardRegistry {
  return new DashboardRegistry(DASHBOARD_SECTION_IDS.map((sectionId) => ({
    sectionId,
    version: "1.0.0",
    owner: "director-dashboard",
    lifecycle: "active" as const,
    supportedWidgets: [`${sectionId}-widget`],
    requiredDataSources: [DASHBOARD_DATA_SOURCES[0]],
  })));
}

export interface DirectorDashboardUiModel {
  readonly snapshot?: DashboardSnapshot;
  readonly widgets: WidgetRuntimeSnapshot;
}

function unavailableDashboard(): DirectorDashboardUiModel {
  const engine = new WidgetRefreshEngine(createDefaultWidgetRegistry(), "1.0.0");
  return Object.freeze({ widgets: engine.manualRefresh({ authorityScope: dashboardScope }) });
}

export function getDirectorDashboardUiModel(): DirectorDashboardUiModel {
  try {
    ensureRuntimeProjectionRegistry();
    const organization = runtimeProjectionRegistry.ensure<OrganizationRuntimeSnapshot>("organization-runtime");
    const agents = runtimeProjectionRegistry.ensure<AgentEmployeeRuntimeModel[]>("agent-runtime");
    const workflows = runtimeProjectionRegistry.ensure<WorkflowRuntimeModel[]>("workflow-runtime");
    const aggregation = createDashboardSnapshot({
      registry: dashboardRegistry(),
      source: {
        authorityScope: dashboardScope,
        sourceVersions: Object.fromEntries(DASHBOARD_DATA_SOURCES.map((source) => [source, "1.0.0"])) as Record<(typeof DASHBOARD_DATA_SOURCES)[number], string>,
        runtimeSnapshots: [organization, agents, workflows],
        workflows: workflows.data,
        monitoringAggregates: [], healthSnapshots: [], diagnosticsProjections: [], evaluationSummaries: [], authenticationSessions: [],
        organization: organization.data,
      },
      authorityScope: dashboardScope,
      projectionVersion: "1.0.0",
      generatedAt: new Date(),
    });
    if (aggregation.status !== "success") return unavailableDashboard();
    const engine = new WidgetRefreshEngine(createDefaultWidgetRegistry(), "1.0.0");
    return Object.freeze({
      snapshot: aggregation.snapshot,
      widgets: engine.manualRefresh({ snapshot: aggregation.snapshot, authorityScope: dashboardScope }),
    });
  } catch {
    return unavailableDashboard();
  }
}
