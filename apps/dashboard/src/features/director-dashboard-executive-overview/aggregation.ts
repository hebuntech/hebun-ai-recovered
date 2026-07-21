import type { WidgetRuntimeSnapshot, WidgetRuntimeState } from "../director-dashboard-widget-runtime";
import { calculateSectionHealth, foldOrganizationHealth, SECTION_RULES, type SectionRule } from "./health";
import { orderByPriority } from "./priority";
import type {
  ExecutiveFreshness,
  ExecutiveHealthState,
  ExecutiveOverview,
  ExecutiveOverviewInput,
  ExecutiveReasonCode,
  ExecutiveSection,
} from "./types";
import { deepFreeze } from "./validation";

export const DEFAULT_FRESHNESS_THRESHOLD_SECONDS = 300;

function reasonCode(state: WidgetRuntimeState, health: ExecutiveHealthState): ExecutiveReasonCode {
  if (state.state === "unavailable" || state.state === "failed") return "SECTION_UNAVAILABLE";
  if (state.state === "loading") return "SECTION_LOADING";
  if (state.state === "empty") return "SECTION_EMPTY";
  if (health === "critical") return "SECTION_CRITICAL";
  if (health === "warning") return "SECTION_WARNING";
  if (health === "unknown") return "SECTION_UNKNOWN";
  return "SECTION_HEALTHY";
}

function sectionOf(rule: SectionRule, state: WidgetRuntimeState): ExecutiveSection {
  const health = calculateSectionHealth(rule, state);
  return {
    sectionId: rule.sectionId,
    widgetId: rule.widgetId,
    label: rule.label,
    health,
    sourceState: state.state,
    recordCount: state.viewModel?.items.length ?? 0,
    reasonCode: reasonCode(state, health),
  };
}

function freshnessOf(runtime: WidgetRuntimeSnapshot, evaluatedAt: Date, thresholdSeconds: number): ExecutiveFreshness {
  const base = runtime.sourceSnapshotId ? { sourceSnapshotId: runtime.sourceSnapshotId } : {};
  if (!runtime.refreshedAt || !Number.isFinite(evaluatedAt.getTime())) return { state: "unknown", ...base };
  const refreshed = new Date(runtime.refreshedAt);
  if (!Number.isFinite(refreshed.getTime())) return { state: "unknown", ...base };
  const ageSeconds = Math.floor((evaluatedAt.getTime() - refreshed.getTime()) / 1000);
  if (ageSeconds < 0) return { state: "unknown", refreshedAt: runtime.refreshedAt, ...base };
  return {
    state: ageSeconds <= thresholdSeconds ? "fresh" : "stale",
    refreshedAt: runtime.refreshedAt,
    ageSeconds,
    ...base,
  };
}

/**
 * Builds the immutable Executive Overview. Reads only the widget runtime
 * snapshot — never the dashboard data layer, runtime authority, or
 * observability directly — and summarizes it without inventing data.
 */
export function createExecutiveOverview(input: ExecutiveOverviewInput): ExecutiveOverview {
  const thresholdSeconds = input.freshnessThresholdSeconds ?? DEFAULT_FRESHNESS_THRESHOLD_SECONDS;
  const sections = orderByPriority(SECTION_RULES.map((rule) => sectionOf(rule, input.runtime.states[rule.widgetId])));
  const evaluatedAt = Number.isFinite(input.evaluatedAt.getTime()) ? input.evaluatedAt.toISOString() : "";
  const freshness = freshnessOf(input.runtime, input.evaluatedAt, thresholdSeconds);
  const count = (health: ExecutiveHealthState) => sections.filter((section) => section.health === health).length;
  return deepFreeze({
    overviewId: `executive-overview-${input.runtime.sourceSnapshotId ?? "unavailable"}-${evaluatedAt}`,
    evaluatedAt,
    organizationHealth: foldOrganizationHealth(sections.map((section) => section.health)),
    sections,
    criticalAlertCount: count("critical"),
    warningCount: count("warning"),
    unavailableCount: count("unavailable"),
    freshness,
    authoritative: false as const,
  });
}
