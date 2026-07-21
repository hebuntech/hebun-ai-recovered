import { SignalContractError } from "./errors";
import { SIGNAL_TYPES, type CanonicalSignalType, type EvidenceCompleteness } from "./types";
import type {
  NormalizationResult,
  ProducerObservation,
  RequestCorrelationContext,
} from "./collection-types";
import { SIGNAL_SEVERITIES } from "./collection-types";
import { validateCorrelation, validateScope } from "./validation";

const evidenceValues: readonly EvidenceCompleteness[] = Object.freeze([
  "FULL", "PARTIAL", "UNKNOWN", "MISSING",
]);

function normalizedText(value: string): string {
  return value.trim().replace(/\s+/g, " ");
}

function jsonSize(value: unknown): number {
  try {
    return new TextEncoder().encode(JSON.stringify(value)).byteLength;
  } catch {
    throw new SignalContractError("INVALID_PAYLOAD");
  }
}

export function createRequestCorrelationContext(
  input: Omit<RequestCorrelationContext, "scope">,
): RequestCorrelationContext {
  validateScope(input.tenantScope, input.platformScope);
  if (input.relationships.length > 32) throw new SignalContractError("UNRESOLVED_CORRELATION");
  const relationships = Object.freeze(input.relationships.map((relationship) => Object.freeze({
    ...relationship,
    resolvedBy: "server" as const,
  })));
  validateCorrelation({ relationships }, input.tenantScope, input.platformScope);
  return Object.freeze({ scope: "request", tenantScope: input.tenantScope, platformScope: input.platformScope, relationships });
}

export function normalizeProducerObservation(
  observation: ProducerObservation,
  context: RequestCorrelationContext,
  maxCandidatePayloadBytes: number,
): NormalizationResult {
  if (!Number.isSafeInteger(maxCandidatePayloadBytes) || maxCandidatePayloadBytes <= 0) {
    throw new SignalContractError("INVALID_PAYLOAD");
  }
  if (context.relationships.length > 32) throw new SignalContractError("UNRESOLVED_CORRELATION");
  if (!(SIGNAL_TYPES as readonly string[]).includes(observation.signalType)) {
    throw new SignalContractError("UNKNOWN_SIGNAL_TYPE");
  }
  if (!Number.isSafeInteger(observation.schemaVersion) || observation.schemaVersion <= 0) {
    throw new SignalContractError("UNKNOWN_SCHEMA_VERSION");
  }
  if (!SIGNAL_SEVERITIES.includes(observation.severityCandidate as never)) {
    throw new SignalContractError("INVALID_SIGNAL");
  }
  if (!evidenceValues.includes(observation.evidenceCompleteness as never)) {
    throw new SignalContractError("INVALID_SIGNAL");
  }
  if (!Number.isFinite(Date.parse(observation.timestamp))) {
    throw new SignalContractError("INVALID_TIME");
  }
  if (jsonSize(observation.payload) > maxCandidatePayloadBytes) {
    throw new SignalContractError("PAYLOAD_TOO_LARGE");
  }
  if (observation.tenantIdCandidate && context.tenantScope.kind !== "tenant") {
    throw new SignalContractError("INVALID_SCOPE");
  }
  if (
    observation.tenantIdCandidate &&
    context.tenantScope.kind === "tenant" &&
    observation.tenantIdCandidate !== context.tenantScope.tenantId
  ) {
    throw new SignalContractError("INVALID_SCOPE");
  }
  if (observation.platformAuthorityCandidate && context.platformScope.kind !== "platform") {
    throw new SignalContractError("INVALID_SCOPE");
  }
  if (
    observation.platformAuthorityCandidate &&
    context.platformScope.kind === "platform" &&
    observation.platformAuthorityCandidate !== context.platformScope.authority
  ) {
    throw new SignalContractError("INVALID_SCOPE");
  }

  const authoritative = new Map(
    context.relationships.map((relationship) => [`${relationship.type}:${relationship.id}`, relationship]),
  );
  for (const candidate of observation.correlationCandidates ?? []) {
    const resolved = authoritative.get(`${candidate.type}:${candidate.id}`);
    if (
      !resolved ||
      candidate.tenantId !== resolved.tenantId ||
      candidate.parentId !== resolved.parentId
    ) {
      throw new SignalContractError("UNRESOLVED_CORRELATION");
    }
  }

  return Object.freeze({
    candidate: Object.freeze({
      signalId: normalizedText(observation.signalId),
      candidateSignalType: observation.signalType as CanonicalSignalType,
      schemaVersion: observation.schemaVersion,
      producer: Object.freeze({ ...observation.producer, id: normalizedText(observation.producer.id), version: normalizedText(observation.producer.version) }),
      source: Object.freeze({ component: normalizedText(observation.source.component), operation: normalizedText(observation.source.operation) }),
      timestamp: new Date(observation.timestamp).toISOString(),
      tenantScope: context.tenantScope,
      platformScope: context.platformScope,
      correlation: Object.freeze({ relationships: Object.freeze(context.relationships.map((relationship) => Object.freeze({ ...relationship, resolvedBy: "server" as const }))) }),
      candidateSeverity: observation.severityCandidate,
      payload: observation.payload,
      metadata: observation.metadata,
      evidenceCompleteness: observation.evidenceCompleteness,
    }),
    requestedRoutes: Object.freeze([]),
  }) as NormalizationResult;
}
