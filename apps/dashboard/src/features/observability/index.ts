export { createCanonicalSignal, isCanonicalSignal } from "./canonical-signal";
export { createCollectionPipeline } from "./collection-pipeline";
export { createRequestCorrelationContext, normalizeProducerObservation } from "./collection-normalization";
export type {
  CanonicalSignalSink,
  CollectionPipelineDependencies,
  CollectionResult,
  ProducerObservation,
  RequestCorrelationContext,
  RoutedCanonicalSignal,
  SignalEmitter,
} from "./collection-types";
export {
  InMemoryAppendOnlySignalSink,
  SignalSinkCapacityError,
  type InMemorySignalQuery,
} from "./in-memory-sink";
export { executeRedaction } from "./redaction";
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
  SignalRoute,
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
