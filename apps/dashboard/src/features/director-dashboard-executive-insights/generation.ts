import type {
  ExecutiveOverview,
  ExecutiveSection,
} from "../director-dashboard-executive-overview";
import { orderInsights } from "./priority";
import { NARRATIVE_RULES } from "./rules";
import type { ExecutiveInsight } from "./types";
import { deepFreeze } from "./validation";

function insightOf(section: ExecutiveSection, overview: ExecutiveOverview): ExecutiveInsight {
  const rule = NARRATIVE_RULES[section.reasonCode];
  return {
    sectionId: section.sectionId,
    title: section.label,
    severity: section.health,
    summary: rule.summary(section.label, section.recordCount),
    evidenceCount: section.recordCount,
    evidenceSource: section.widgetId,
    recommendedAction: rule.recommendedAction(section.label),
    reasonCode: section.reasonCode,
    ...(overview.freshness.refreshedAt ? { snapshotTimestamp: overview.freshness.refreshedAt } : {}),
    evaluatedAt: overview.evaluatedAt,
    authoritative: false as const,
  };
}

/**
 * Explains WHY each Executive Overview section holds its state.
 *
 * Derives strictly from the overview — it never reads the widget runtime, the
 * dashboard data layer, runtime authority, memory, observability, or the
 * control plane. Every insight is built from a fixed narrative template keyed
 * on the section's canonical reason code, so no fact is invented and the
 * output is fully reproducible for a given overview.
 */
export function createExecutiveInsights(overview: ExecutiveOverview): readonly ExecutiveInsight[] {
  return deepFreeze(orderInsights(overview.sections.map((section) => insightOf(section, overview))));
}
