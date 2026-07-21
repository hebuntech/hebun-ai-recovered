import type { AgentEmployeeRuntimeModel } from "../agent-runtime";
import {
  createDashboardSnapshot,
  DASHBOARD_DATA_SOURCES,
  DASHBOARD_SECTION_IDS,
  DashboardRegistry,
  type DashboardSnapshot,
} from "../director-dashboard-data";
import {
  createExecutiveInsights,
  type ExecutiveInsight,
} from "../director-dashboard-executive-insights";
import {
  createExecutiveOverview,
  type ExecutiveOverview,
} from "../director-dashboard-executive-overview";
import {
  createDefaultWidgetRegistry,
  WidgetRefreshEngine,
  type WidgetRuntimeSnapshot,
} from "../director-dashboard-widget-runtime";
import type { OrganizationRuntimeSnapshot } from "../organization-runtime";
import {
  materializeRuntimeEvidence,
  type MaterializedEvidence,
} from "../runtime-observability";
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
  readonly overview: ExecutiveOverview;
  readonly insights: readonly ExecutiveInsight[];
}

function unavailableDashboard(): DirectorDashboardUiModel {
  const engine = new WidgetRefreshEngine(createDefaultWidgetRegistry(), "1.0.0");
  const widgets = engine.manualRefresh({ authorityScope: dashboardScope });
  const overview = createExecutiveOverview({ runtime: widgets, evaluatedAt: new Date() });
  return Object.freeze({ widgets, overview, insights: createExecutiveInsights(overview) });
}

/**
 * Reads observability evidence through the Phase 4A.6a public read-side API.
 *
 * One materialization pass is taken per dashboard read so monitoring, health,
 * and diagnostics all describe the same instant. The adapter evaluates no
 * monitor rules, calculates no health, and rebuilds no projections — it only
 * reads what the producers already materialized.
 *
 * A producer that reports `failed` is genuinely unavailable, so the whole
 * evidence read is refused rather than being downgraded to an empty result.
 * Unavailable and empty must never be conflated.
 */
function runtimeEvidence(generatedAt: Date): MaterializedEvidence | undefined {
  const evidence = materializeRuntimeEvidence(generatedAt);
  const { monitoring, health, diagnostics } = evidence.report;
  if (monitoring.status === "failed" || health.status === "failed" || diagnostics.status === "failed") {
    return undefined;
  }
  return evidence;
}

export function getDirectorDashboardUiModel(): DirectorDashboardUiModel {
  try {
    ensureRuntimeProjectionRegistry();
    const organization = runtimeProjectionRegistry.ensure<OrganizationRuntimeSnapshot>("organization-runtime");
    const agents = runtimeProjectionRegistry.ensure<AgentEmployeeRuntimeModel[]>("agent-runtime");
    const workflows = runtimeProjectionRegistry.ensure<WorkflowRuntimeModel[]>("workflow-runtime");
    const generatedAt = new Date();
    const evidence = runtimeEvidence(generatedAt);
    if (!evidence) return unavailableDashboard();
    const aggregation = createDashboardSnapshot({
      registry: dashboardRegistry(),
      source: {
        authorityScope: dashboardScope,
        sourceVersions: Object.fromEntries(DASHBOARD_DATA_SOURCES.map((source) => [source, "1.0.0"])) as Record<(typeof DASHBOARD_DATA_SOURCES)[number], string>,
        runtimeSnapshots: [organization, agents, workflows],
        workflows: workflows.data,
        monitoringAggregates: evidence.monitoringAggregates,
        healthSnapshots: evidence.healthSnapshots,
        diagnosticsProjections: evidence.diagnosticsProjections,
        // Authentication stays disconnected: platform scope must not carry
        // tenant session data, and the 4A.1 scope rule enforces that.
        // Evaluation stays disconnected: no runtime producer exists yet.
        evaluationSummaries: [], authenticationSessions: [],
        organization: organization.data,
      },
      authorityScope: dashboardScope,
      projectionVersion: "1.0.0",
      generatedAt,
    });
    if (aggregation.status !== "success") return unavailableDashboard();

    const engine = new WidgetRefreshEngine(createDefaultWidgetRegistry(), "1.0.0");
    const widgets = engine.manualRefresh({ snapshot: aggregation.snapshot, authorityScope: dashboardScope });
    const overview = createExecutiveOverview({ runtime: widgets, evaluatedAt: new Date() });
    return Object.freeze({
      snapshot: aggregation.snapshot,
      widgets,
      overview,
      insights: createExecutiveInsights(overview),
    });
  } catch {
    return unavailableDashboard();
  }
}
