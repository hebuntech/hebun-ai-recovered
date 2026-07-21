import {
  DiagnosticsReadModelRegistry,
  createDiagnosticsSnapshot,
  rebuildProjection,
  type DiagnosticsProjection,
  type DiagnosticsSnapshot,
} from "../diagnostics-read-models";
import {
  aggregateMonitoringSignals,
  evaluateMonitor,
  resolveEvaluationWindow,
  type HealthSnapshot,
  type MonitoringAggregate,
} from "../monitoring";
import type { CanonicalSignal } from "../observability";
import { collectedSignals } from "./composition";
import {
  DIAGNOSTICS_PROJECTION_VERSION,
  DIAGNOSTICS_READ_MODEL_ID,
  runtimeMonitorDefinitions,
  runtimeMonitoringRegistry,
} from "./monitors";
import { RUNTIME_PLATFORM_SCOPE } from "./scope";

export type MaterializationStatus = "materialized" | "empty" | "failed";

export interface ReadModelOutcome {
  readonly status: MaterializationStatus;
  /** Stable code only. Never an exception message or stack trace. */
  readonly reasonCode?: string;
}

export interface MaterializationReport {
  readonly evaluatedAt: string;
  readonly signalCount: number;
  readonly monitoring: ReadModelOutcome;
  readonly health: ReadModelOutcome;
  readonly diagnostics: ReadModelOutcome;
}

export interface MaterializedEvidence {
  readonly report: MaterializationReport;
  readonly monitoringAggregates: readonly MonitoringAggregate[];
  readonly healthSnapshots: readonly HealthSnapshot[];
  readonly diagnosticsProjections: readonly DiagnosticsProjection[];
  readonly diagnosticsSnapshot?: DiagnosticsSnapshot;
}

function diagnosticsRegistry(): DiagnosticsReadModelRegistry {
  return new DiagnosticsReadModelRegistry([{
    readModelId: DIAGNOSTICS_READ_MODEL_ID,
    version: DIAGNOSTICS_PROJECTION_VERSION,
    lifecycle: "active",
    owner: "runtime-observability",
    compatibility: "backward-compatible",
    compatibleSignalSchemaVersions: [1],
    projectionKinds: ["component", "service", "platform"],
  }]);
}

/** Monitoring aggregates, produced by the existing aggregation function only. */
function materializeMonitoring(signals: readonly CanonicalSignal[], now: Date): {
  readonly outcome: ReadModelOutcome;
  readonly aggregates: readonly MonitoringAggregate[];
} {
  try {
    const aggregates: MonitoringAggregate[] = [];
    for (const definition of runtimeMonitorDefinitions()) {
      const window = resolveEvaluationWindow(definition.window, now);
      if (!window) return { outcome: { status: "failed", reasonCode: "INVALID_WINDOW" }, aggregates: [] };
      const scoped = signals.filter((signal) => signal.source.component === definition.subject.component);
      if (scoped.length === 0) continue;
      const produced = aggregateMonitoringSignals({
        monitorId: definition.monitorId,
        signals: scoped,
        authorityScope: RUNTIME_PLATFORM_SCOPE,
        window,
      });
      if (!produced) return { outcome: { status: "failed", reasonCode: "CROSS_SCOPE_SIGNAL" }, aggregates: [] };
      aggregates.push(...produced);
    }
    return {
      outcome: { status: aggregates.length === 0 ? "empty" : "materialized" },
      aggregates: Object.freeze(aggregates),
    };
  } catch {
    return { outcome: { status: "failed", reasonCode: "MONITORING_MATERIALIZATION_FAILED" }, aggregates: [] };
  }
}

/** Health snapshots, produced by the existing monitor engine only. */
function materializeHealth(signals: readonly CanonicalSignal[], now: Date): {
  readonly outcome: ReadModelOutcome;
  readonly snapshots: readonly HealthSnapshot[];
} {
  try {
    const registry = runtimeMonitoringRegistry();
    const snapshots: HealthSnapshot[] = [];
    for (const definition of runtimeMonitorDefinitions()) {
      const scoped = signals.filter((signal) => signal.source.component === definition.subject.component);
      const result = evaluateMonitor({
        registry,
        definition,
        signals: scoped,
        authorityScope: RUNTIME_PLATFORM_SCOPE,
        now,
      });
      // insufficient_evidence is a legitimate empty result, not a failure.
      if (result.status === "evaluation_failed") {
        return { outcome: { status: "failed", reasonCode: result.reason }, snapshots: [] };
      }
      if (result.status !== "insufficient_evidence") snapshots.push(result.snapshot);
    }
    return {
      outcome: { status: snapshots.length === 0 ? "empty" : "materialized" },
      snapshots: Object.freeze(snapshots),
    };
  } catch {
    return { outcome: { status: "failed", reasonCode: "HEALTH_MATERIALIZATION_FAILED" }, snapshots: [] };
  }
}

/** Diagnostics projections, produced by the existing projection function only. */
function materializeDiagnostics(signals: readonly CanonicalSignal[], now: Date): {
  readonly outcome: ReadModelOutcome;
  readonly projections: readonly DiagnosticsProjection[];
  readonly snapshot?: DiagnosticsSnapshot;
} {
  try {
    if (signals.length === 0) return { outcome: { status: "empty" }, projections: [] };
    const result = rebuildProjection({
      readModelId: DIAGNOSTICS_READ_MODEL_ID,
      projectionVersion: DIAGNOSTICS_PROJECTION_VERSION,
      signals,
      registry: diagnosticsRegistry(),
      authorityScope: RUNTIME_PLATFORM_SCOPE,
    });
    if (result.status !== "success") {
      return { outcome: { status: "failed", reasonCode: result.reason }, projections: [] };
    }
    const snapshot = createDiagnosticsSnapshot(result.state, now);
    return {
      outcome: { status: result.state.projections.length === 0 ? "empty" : "materialized" },
      projections: result.state.projections,
      ...(snapshot ? { snapshot } : {}),
    };
  } catch {
    return { outcome: { status: "failed", reasonCode: "DIAGNOSTICS_MATERIALIZATION_FAILED" }, projections: [] };
  }
}

/**
 * Read-side materialization coordinator.
 *
 * Orchestrates the existing monitoring and diagnostics engines over the
 * signals already accepted into the append-only sink. It defines no rules,
 * scores nothing, and mutates neither signals nor registries. Each read model
 * is materialized independently so one failure cannot corrupt its siblings.
 */
export function materializeRuntimeEvidence(now: Date = new Date()): MaterializedEvidence {
  const signals = collectedSignals();
  const monitoring = materializeMonitoring(signals, now);
  const health = materializeHealth(signals, now);
  const diagnostics = materializeDiagnostics(signals, now);
  return Object.freeze({
    report: Object.freeze({
      evaluatedAt: Number.isFinite(now.getTime()) ? now.toISOString() : "",
      signalCount: signals.length,
      monitoring: Object.freeze(monitoring.outcome),
      health: Object.freeze(health.outcome),
      diagnostics: Object.freeze(diagnostics.outcome),
    }),
    monitoringAggregates: monitoring.aggregates,
    healthSnapshots: health.snapshots,
    diagnosticsProjections: diagnostics.projections,
    ...(diagnostics.snapshot ? { diagnosticsSnapshot: diagnostics.snapshot } : {}),
  });
}
