import {
  EXECUTIVE_SECTION_IDS,
  HEALTH_SEVERITY_RANK,
  type ExecutiveSectionId,
} from "../director-dashboard-executive-overview";
import type { ExecutiveInsight } from "./types";

const CANONICAL_ORDER: Readonly<Record<ExecutiveSectionId, number>> = Object.freeze(
  Object.fromEntries(EXECUTIVE_SECTION_IDS.map((sectionId, index) => [sectionId, index])) as Record<ExecutiveSectionId, number>,
);

/**
 * Orders insights so the most severe explanation is read first:
 * critical > unavailable > warning > unknown > healthy.
 *
 * The rank is reused from the Executive Overview rather than redefined, so
 * insight ordering can never drift from section ordering. Ties break on the
 * fixed canonical section order, making the result independent of input order.
 */
export function orderInsights(insights: readonly ExecutiveInsight[]): readonly ExecutiveInsight[] {
  return [...insights].sort((left, right) => {
    const severity = HEALTH_SEVERITY_RANK[right.severity] - HEALTH_SEVERITY_RANK[left.severity];
    return severity !== 0 ? severity : CANONICAL_ORDER[left.sectionId] - CANONICAL_ORDER[right.sectionId];
  });
}

export { CANONICAL_ORDER };
