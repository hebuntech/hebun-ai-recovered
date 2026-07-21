import type {
  CanonicalSignal,
  EvaluationResultPayload,
  MetricPayload,
  OperationalEventPayload,
} from "../observability";
import type { MonitoringRegistry } from "./registry";
import { createAlertCandidate } from "./models";
import type {
  HealthRule,
  HealthSnapshot,
  HealthState,
  MonitorDefinition,
  MonitoringResult,
  MonitoringAuthorityScope,
} from "./types";
import { resolveEvaluationWindow, selectSignalsInWindow } from "./windows";
import { deepFreeze } from "./validation";

const stateRank: Readonly<Record<HealthState, number>> = Object.freeze({ healthy: 0, watch: 1, degraded: 2, critical: 3, unknown: 4 });

function scopeMatches(signal: CanonicalSignal, authority: MonitoringAuthorityScope): boolean {
  return authority.kind === "tenant"
    ? signal.tenantScope.kind === "tenant" && signal.tenantScope.tenantId === authority.tenantId
    : signal.platformScope.kind === "platform" && signal.platformScope.authority === authority.authority;
}

function numericValue(signal: CanonicalSignal): number | undefined {
  if (signal.signalType === "metric") return (signal.payload as MetricPayload).value;
  if (signal.signalType === "evaluation-result") return (signal.payload as EvaluationResultPayload).score;
  return undefined;
}

function failed(signal: CanonicalSignal): boolean {
  if (signal.signalType === "evaluation-result") return (signal.payload as EvaluationResultPayload).outcome === "failed";
  if (signal.signalType === "operational-event") return (signal.payload as OperationalEventPayload).outcome === "failed";
  return false;
}

function compare(operator: Extract<HealthRule, { kind: "threshold" }>["operator"], actual: number, expected: number): boolean {
  if (operator === "gt") return actual > expected;
  if (operator === "gte") return actual >= expected;
  if (operator === "lt") return actual < expected;
  return actual <= expected;
}

function evaluateRule(rule: HealthRule, signals: readonly CanonicalSignal[], aggregation: MonitorDefinition["aggregation"], results: ReadonlyMap<string, boolean>): boolean {
  if (rule.kind === "window") return signals.length < rule.minimumSignals;
  if (rule.kind === "ratio") return signals.length > 0 && signals.filter(failed).length / signals.length > rule.maximumFailureRatio;
  if (rule.kind === "composite") {
    const referenced = rule.ruleReferences.map((reference) => results.get(reference) ?? false);
    return rule.strategy === "all" ? referenced.length > 0 && referenced.every(Boolean) : referenced.some(Boolean);
  }
  const values = signals.map(numericValue).filter((value): value is number => value !== undefined && Number.isFinite(value));
  if (rule.kind === "trend") return values.length >= 2 && values[values.length - 1]! - values[0]! < -rule.maximumNegativeDelta;
  if (values.length === 0) return false;
  const actual = aggregation === "count" ? values.length
    : aggregation === "latest" ? values[values.length - 1]!
      : values.reduce((sum, value) => sum + value, 0) / values.length;
  return compare(rule.operator, actual, rule.value);
}

export function evaluateMonitor(input: {
  readonly registry: MonitoringRegistry;
  readonly definition: MonitorDefinition;
  readonly signals: readonly CanonicalSignal[];
  readonly authorityScope: MonitoringAuthorityScope;
  readonly now: Date;
}): MonitoringResult {
  const schemaVersion = input.signals[0]?.schemaVersion ?? input.definition.compatibleSignalSchemaVersions[0] ?? 0;
  const resolution = input.registry.resolve(input.definition.monitorId, input.definition.version, schemaVersion);
  if (resolution.status === "unknown_monitor") return Object.freeze({ status: "evaluation_failed", reason: "UNKNOWN_MONITOR" });
  if (resolution.status === "incompatible") return Object.freeze({ status: "evaluation_failed", reason: "INCOMPATIBLE_SIGNAL_SCHEMA" });
  if (input.signals.some((signal) => !scopeMatches(signal, input.authorityScope))) {
    return Object.freeze({ status: "evaluation_failed", reason: "CROSS_TENANT_SIGNAL" });
  }
  const window = resolveEvaluationWindow(input.definition.window, input.now);
  if (!window) return Object.freeze({ status: "evaluation_failed", reason: "INVALID_WINDOW" });
  const scoped = selectSignalsInWindow(input.signals, window).filter((signal) => input.definition.signalSources.includes(signal.signalType));
  if (scoped.length === 0 || scoped.some(({ evidenceCompleteness }) => evidenceCompleteness === "MISSING")) {
    return Object.freeze({ status: "insufficient_evidence", evidenceCompleteness: "MISSING", window });
  }
  const hasUnknown = scoped.some(({ evidenceCompleteness }) => evidenceCompleteness === "UNKNOWN");
  const evidenceCompleteness = hasUnknown ? "UNKNOWN" : scoped.some(({ evidenceCompleteness }) => evidenceCompleteness === "PARTIAL") ? "PARTIAL" : "FULL";

  const ruleResults = new Map<string, boolean>();
  let state: HealthState = hasUnknown && !input.definition.allowUnknownEvidence ? "unknown" : "healthy";
  for (const rule of input.definition.rules) {
    const triggered = evaluateRule(rule, scoped, input.definition.aggregation, ruleResults);
    ruleResults.set(rule.ruleId, triggered);
    if (triggered && stateRank[rule.state] > stateRank[state]) state = rule.state;
  }
  if (hasUnknown && state === "healthy") state = input.definition.allowUnknownEvidence ? "watch" : "unknown";
  const evaluatedAt = input.now.toISOString();
  const snapshot: HealthSnapshot = deepFreeze({
    snapshotId: `${input.definition.monitorId}-${evaluatedAt}`,
    monitorId: input.definition.monitorId,
    monitorVersion: input.definition.version,
    subject: { ...input.definition.subject },
    state,
    severity: input.definition.severityMapping[state],
    evidenceCompleteness,
    evidenceReferences: scoped.map(({ signalId }) => signalId),
    window,
    evaluatedAt,
  });
  const alertCandidate = createAlertCandidate(snapshot, scoped[0]?.correlation ?? { relationships: [] });
  return deepFreeze({ status: state, snapshot, ...(alertCandidate ? { alertCandidate } : {}) });
}
