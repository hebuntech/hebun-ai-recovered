import {
  createMonitorDefinition,
  MonitoringRegistry,
  type MonitorDefinition,
  type MonitorRegistryEntry,
} from "../monitoring";

export const MONITOR_VERSION = "1.0.0";
export const MONITOR_OWNER = "runtime-observability";

/**
 * Runtime components instrumented by this phase. Each corresponds to a real
 * runtime projection collection whose refresh outcome is already a stable,
 * public runtime event.
 */
export const INSTRUMENTED_COMPONENTS = [
  "organization-runtime",
  "agent-runtime",
  "workflow-runtime",
] as const;

export type InstrumentedComponent = (typeof INSTRUMENTED_COMPONENTS)[number];

export function monitorIdFor(component: InstrumentedComponent): string {
  return `runtime-projection-${component}`;
}

function definitionFor(component: InstrumentedComponent): MonitorDefinition {
  const result = createMonitorDefinition({
    monitorId: monitorIdFor(component),
    version: MONITOR_VERSION,
    lifecycle: "active",
    owner: MONITOR_OWNER,
    compatibility: "backward-compatible",
    compatibleSignalSchemaVersions: [1],
    subject: { type: "component", id: component, component },
    signalSources: ["operational-event"],
    // Rolling hour: long enough that a single refresh remains visible between
    // dashboard reads, short enough that recovery is reflected.
    window: { kind: "rolling", durationMs: 3_600_000 },
    // Any failed refresh in the window degrades the component. The rule is
    // evaluated by the monitoring engine, never re-implemented here.
    rules: [{ ruleId: `${component}-refresh-failure`, kind: "ratio", maximumFailureRatio: 0, state: "degraded" }],
    aggregation: "count",
    evaluationFrequencyMs: 60_000,
    severityMapping: { healthy: "info", watch: "info", degraded: "warning", critical: "error", unknown: "debug" },
    allowUnknownEvidence: false,
  });
  if (result.status !== "created") throw new TypeError(`Invalid runtime monitor definition: ${result.reason}`);
  return result.value;
}

export function runtimeMonitorDefinitions(): readonly MonitorDefinition[] {
  return Object.freeze(INSTRUMENTED_COMPONENTS.map(definitionFor));
}

export function runtimeMonitoringRegistry(): MonitoringRegistry {
  const entries: MonitorRegistryEntry[] = runtimeMonitorDefinitions().map((definition) => ({
    monitorId: definition.monitorId,
    version: definition.version,
    lifecycle: definition.lifecycle,
    owner: definition.owner,
    compatibility: definition.compatibility,
    compatibleSignalSchemaVersions: [...definition.compatibleSignalSchemaVersions],
  }));
  return new MonitoringRegistry(entries);
}

export const DIAGNOSTICS_READ_MODEL_ID = "runtime-diagnostics";
export const DIAGNOSTICS_PROJECTION_VERSION = "1.0.0";
