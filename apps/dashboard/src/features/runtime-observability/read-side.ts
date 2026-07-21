import type { DiagnosticsProjection, DiagnosticsSnapshot } from "../diagnostics-read-models";
import type { HealthSnapshot, MonitoringAggregate } from "../monitoring";
import type { CanonicalSignal } from "../observability";
import { collectedSignals } from "./composition";
import { materializeRuntimeEvidence, type MaterializationReport } from "./materialization";

/**
 * Read-side surfaces for runtime observability evidence.
 *
 * Every function returns immutable, already-sanitized platform-scoped
 * evidence. Nothing here reaches into Dashboard code, and no mutable internal
 * registry, sink, or projection state is exposed.
 */

/** Canonical signals currently held by the append-only sink. */
export function canonicalSignalSnapshot(): readonly CanonicalSignal[] {
  return collectedSignals();
}

export function monitoringAggregateSnapshot(now?: Date): readonly MonitoringAggregate[] {
  return materializeRuntimeEvidence(now).monitoringAggregates;
}

export function healthSnapshotCollection(now?: Date): readonly HealthSnapshot[] {
  return materializeRuntimeEvidence(now).healthSnapshots;
}

export function diagnosticsProjectionSnapshot(now?: Date): readonly DiagnosticsProjection[] {
  return materializeRuntimeEvidence(now).diagnosticsProjections;
}

export function diagnosticsSnapshot(now?: Date): DiagnosticsSnapshot | undefined {
  return materializeRuntimeEvidence(now).diagnosticsSnapshot;
}

/** Per-read-model materialization outcome, for availability reporting. */
export function materializationReport(now?: Date): MaterializationReport {
  return materializeRuntimeEvidence(now).report;
}
