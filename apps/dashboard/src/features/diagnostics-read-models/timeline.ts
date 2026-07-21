import type { DiagnosticsProjectionState, DiagnosticsTimeline, DiagnosticsTimelineEntry } from "./types";

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const nested of Object.values(value)) deepFreeze(nested);
    Object.freeze(value);
  }
  return value;
}

export function createDiagnosticsTimeline(state: DiagnosticsProjectionState): DiagnosticsTimeline {
  const seen = new Set<string>();
  const entries: DiagnosticsTimelineEntry[] = [];
  for (const projection of state.projections) {
    if (seen.has(projection.sourceSignalId)) continue;
    seen.add(projection.sourceSignalId);
    entries.push({
      timelineId: `timeline:${projection.sourceSignalId}`,
      canonicalEventTime: projection.canonicalEventTime,
      projectionId: projection.projectionId,
      sourceSignalId: projection.sourceSignalId,
      component: projection.component,
      severity: projection.severity,
      evidenceReferences: [...projection.evidenceReferences],
      correlation: projection.correlation.map((relationship) => ({ ...relationship })),
    });
  }
  entries.sort((left, right) => left.canonicalEventTime.localeCompare(right.canonicalEventTime) || left.sourceSignalId.localeCompare(right.sourceSignalId));
  const groups: Record<string, string[]> = {};
  for (const entry of entries) {
    for (const relationship of entry.correlation) {
      const key = `${relationship.type}:${relationship.id}`;
      groups[key] = [...(groups[key] ?? []), entry.timelineId];
    }
  }
  return deepFreeze({ entries, correlationGroups: groups });
}

export function appendDiagnosticsTimeline(timeline: DiagnosticsTimeline, state: DiagnosticsProjectionState): DiagnosticsTimeline {
  const projected = createDiagnosticsTimeline(state);
  const existing = new Set(timeline.entries.map(({ sourceSignalId }) => sourceSignalId));
  const entries = [...timeline.entries, ...projected.entries.filter(({ sourceSignalId }) => !existing.has(sourceSignalId))]
    .sort((left, right) => left.canonicalEventTime.localeCompare(right.canonicalEventTime) || left.sourceSignalId.localeCompare(right.sourceSignalId));
  const groups: Record<string, string[]> = {};
  for (const entry of entries) {
    for (const relationship of entry.correlation) {
      const key = `${relationship.type}:${relationship.id}`;
      groups[key] = [...(groups[key] ?? []), entry.timelineId];
    }
  }
  return deepFreeze({ entries, correlationGroups: groups });
}
