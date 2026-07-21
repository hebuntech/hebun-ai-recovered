export { createCanonicalSignal } from "./canonical-signal";
export { SignalContractError, type SignalContractErrorCode } from "./errors";
export {
  canonicalSignalSchemaRegistry,
  SignalSchemaRegistry,
  type SignalSchemaDefinition,
  validateSignalSchemaVersion,
} from "./registry";
export type {
  SignalDisposition,
  SignalPolicyDecision,
  SignalPolicyEngine,
  SignalRetentionClass,
} from "./policy";
export {
  assertSignalNotReplay,
  resolveTimeAuthority,
  type TimeAuthorityResolution,
} from "./time-authority";
export {
  SIGNAL_TYPES,
  type AuditEventPayload,
  type BusinessSignalPayload,
  type CanonicalSignal,
  type CanonicalSignalMetadata,
  type CanonicalSignalPayloadMap,
  type CanonicalSignalType,
  type CorrelationRelationship,
  type CorrelationRelationshipType,
  type DiagnosticPayload,
  type EvaluationResultPayload,
  type EvidenceCompleteness,
  type HealthSignalPayload,
  type MetricPayload,
  type NormalizedSignalCandidate,
  type OperationalEventPayload,
  type PlatformScope,
  type SignalCorrelation,
  type SignalProducer,
  type SignalSeverity,
  type SignalSource,
  type TenantScope,
  type TracePayload,
} from "./types";
