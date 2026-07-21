import { HEALTH_SEVERITY_RANK } from "./health";
import { EXECUTIVE_SECTION_IDS, type ExecutiveSection, type ExecutiveSectionId } from "./types";

const CANONICAL_ORDER: Readonly<Record<ExecutiveSectionId, number>> = Object.freeze(
  Object.fromEntries(EXECUTIVE_SECTION_IDS.map((sectionId, index) => [sectionId, index])) as Record<ExecutiveSectionId, number>,
);

/**
 * Orders sections so the highest-priority issue is always first.
 * Primary key: health severity (critical > unavailable > warning > unknown > healthy).
 * Tie-break: the fixed canonical section order, so the result is stable and
 * independent of input ordering.
 */
export function orderByPriority(sections: readonly ExecutiveSection[]): readonly ExecutiveSection[] {
  return [...sections].sort((left, right) => {
    const severity = HEALTH_SEVERITY_RANK[right.health] - HEALTH_SEVERITY_RANK[left.health];
    return severity !== 0 ? severity : CANONICAL_ORDER[left.sectionId] - CANONICAL_ORDER[right.sectionId];
  });
}

export { CANONICAL_ORDER };
