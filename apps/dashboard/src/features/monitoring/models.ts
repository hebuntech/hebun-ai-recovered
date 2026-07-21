import type {
  AlertCandidate,
  HealthHistory,
  HealthSnapshot,
  MonitorDefinition,
  MonitorFactoryResult,
} from "./types";
import { deepFreeze, hasOnlyKeys, validText, validVersion } from "./validation";
import { SIGNAL_TYPES } from "../observability";

function invalid<T>(reason: string): MonitorFactoryResult<T> {
  return Object.freeze({ status: "invalid", reason });
}

export function createMonitorDefinition(input: MonitorDefinition): MonitorFactoryResult<MonitorDefinition> {
  const ruleIds = input.rules.map(({ ruleId }) => ruleId);
  const seenRules = new Set<string>();
  const validRules = input.rules.every((rule) => {
    if (!["threshold", "window", "ratio", "trend", "composite"].includes(rule.kind)) return false;
    const common = hasOnlyKeys(rule, rule.kind === "threshold"
      ? ["ruleId", "kind", "operator", "value", "state"]
      : rule.kind === "window"
        ? ["ruleId", "kind", "minimumSignals", "state"]
        : rule.kind === "ratio"
          ? ["ruleId", "kind", "maximumFailureRatio", "state"]
          : rule.kind === "trend"
            ? ["ruleId", "kind", "maximumNegativeDelta", "state"]
            : ["ruleId", "kind", "ruleReferences", "strategy", "state"])
      && validText(rule.ruleId) && ["watch", "degraded", "critical"].includes(rule.state);
    if (!common || seenRules.has(rule.ruleId)) return false;
    let valid = false;
    if (rule.kind === "threshold") valid = ["gt", "gte", "lt", "lte"].includes(rule.operator) && Number.isFinite(rule.value);
    if (rule.kind === "window") valid = Number.isSafeInteger(rule.minimumSignals) && rule.minimumSignals > 0;
    if (rule.kind === "ratio") valid = Number.isFinite(rule.maximumFailureRatio) && rule.maximumFailureRatio >= 0 && rule.maximumFailureRatio <= 1;
    if (rule.kind === "trend") valid = Number.isFinite(rule.maximumNegativeDelta) && rule.maximumNegativeDelta >= 0;
    if (rule.kind === "composite") valid = ["any", "all"].includes(rule.strategy) && rule.ruleReferences.length > 0 && rule.ruleReferences.every((reference) => seenRules.has(reference));
    seenRules.add(rule.ruleId);
    return valid;
  });
  const severities = Object.values(input.severityMapping);
  if (!hasOnlyKeys(input, ["monitorId", "version", "lifecycle", "owner", "compatibility", "compatibleSignalSchemaVersions", "subject", "signalSources", "window", "rules", "aggregation", "evaluationFrequencyMs", "severityMapping", "allowUnknownEvidence"]) ||
      !hasOnlyKeys(input.subject, ["type", "id", "component"]) ||
      !hasOnlyKeys(input.window, input.window.kind === "sliding" ? ["kind", "durationMs", "slideMs"] : ["kind", "durationMs"]) ||
      !hasOnlyKeys(input.severityMapping, ["healthy", "watch", "degraded", "critical", "unknown"]) ||
      !validText(input.monitorId) || !validVersion(input.version) || !validText(input.owner) ||
      !["active", "deprecated", "retired"].includes(input.lifecycle) || !["backward-compatible", "breaking"].includes(input.compatibility) ||
      !validText(input.subject.type) || !validText(input.subject.id) || !validText(input.subject.component) ||
      input.signalSources.length === 0 || input.signalSources.some((source) => !(SIGNAL_TYPES as readonly string[]).includes(source)) ||
      input.compatibleSignalSchemaVersions.length === 0 || input.compatibleSignalSchemaVersions.some((version) => !Number.isSafeInteger(version) || version <= 0) ||
      input.rules.length === 0 || new Set(ruleIds).size !== ruleIds.length || !validRules ||
      !["count", "average", "ratio", "latest"].includes(input.aggregation) || typeof input.allowUnknownEvidence !== "boolean" ||
      severities.length !== 5 || severities.some((severity) => !["debug", "info", "warning", "error", "critical"].includes(severity)) ||
      !Number.isSafeInteger(input.evaluationFrequencyMs) || input.evaluationFrequencyMs <= 0 ||
      !["fixed", "rolling", "sliding"].includes(input.window.kind) ||
      !Number.isSafeInteger(input.window.durationMs) || input.window.durationMs <= 0 ||
      (input.window.kind === "sliding" && (!Number.isSafeInteger(input.window.slideMs) || input.window.slideMs <= 0 || input.window.slideMs > input.window.durationMs))) {
    return invalid("INVALID_MONITOR_DEFINITION");
  }
  return Object.freeze({ status: "created", value: deepFreeze({
    ...input,
    subject: { ...input.subject }, signalSources: [...input.signalSources],
    compatibleSignalSchemaVersions: [...input.compatibleSignalSchemaVersions],
    window: { ...input.window },
    rules: input.rules.map((rule) => ({ ...rule, ...(rule.kind === "composite" ? { ruleReferences: [...rule.ruleReferences] } : {}) })),
    severityMapping: { ...input.severityMapping },
  }) });
}

export function createAlertCandidate(snapshot: HealthSnapshot, correlation: AlertCandidate["correlation"]): AlertCandidate | undefined {
  if (snapshot.state === "healthy" || snapshot.state === "unknown") return undefined;
  return deepFreeze({
    candidateId: `alert-${snapshot.snapshotId}`,
    monitorId: snapshot.monitorId,
    monitorVersion: snapshot.monitorVersion,
    healthState: snapshot.state,
    severity: snapshot.severity,
    evidenceReferences: [...snapshot.evidenceReferences],
    createdAt: snapshot.evaluatedAt,
    correlation: { relationships: correlation.relationships.map((relationship) => ({ ...relationship })) },
  });
}

export function createHealthHistory(): HealthHistory {
  return Object.freeze({ snapshots: Object.freeze([]) });
}

export function appendHealthSnapshot(history: HealthHistory, snapshot: HealthSnapshot): HealthHistory {
  return deepFreeze({ snapshots: [...history.snapshots, snapshot] });
}
