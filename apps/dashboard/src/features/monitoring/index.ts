export { aggregateMonitoringSignals } from "./aggregation";
export { evaluateMonitor } from "./engine";
export { appendHealthSnapshot, createAlertCandidate, createHealthHistory, createMonitorDefinition } from "./models";
export { MonitoringRegistry, type MonitorRegistration, type MonitorResolution } from "./registry";
export { emitHealthSignal } from "./service";
export { resolveEvaluationWindow, selectSignalsInWindow } from "./windows";
export type {
  AlertCandidate,
  EvaluationWindow,
  HealthHistory,
  HealthRule,
  HealthSignalDependencies,
  HealthSignalEmissionResult,
  HealthSnapshot,
  HealthState,
  MonitorCompatibility,
  MonitorDefinition,
  MonitorFactoryResult,
  MonitorLifecycle,
  MonitoringAggregate,
  MonitoringAuthorityScope,
  MonitoringResult,
  MonitorRegistryEntry,
  WindowDefinition,
} from "./types";
