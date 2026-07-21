import { SignalContractError } from "./errors";
import type { SignalPolicyDecision } from "./policy";
import { canonicalSignalSchemaRegistry, type SignalSchemaRegistry } from "./registry";
import { assertSignalNotReplay, resolveTimeAuthority } from "./time-authority";
import type {
  CanonicalSignal,
  CanonicalSignalPayloadMap,
  CanonicalSignalType,
  NormalizedSignalCandidate,
} from "./types";
import {
  validateCorrelation,
  validateCandidateIdentity,
  validateMetadata,
  validatePayload,
  validateScope,
} from "./validation";

function deepFreeze<T>(value: T): T {
  if (value && typeof value === "object" && !Object.isFrozen(value)) {
    for (const nested of Object.values(value)) deepFreeze(nested);
    Object.freeze(value);
  }
  return value;
}

function scopesMatch(
  candidate: NormalizedSignalCandidate["tenantScope"],
  decided: NormalizedSignalCandidate["tenantScope"],
): boolean {
  return candidate.kind === decided.kind &&
    (candidate.kind === "none" ||
      (decided.kind === "tenant" && candidate.tenantId === decided.tenantId));
}

function platformScopesMatch(
  candidate: NormalizedSignalCandidate["platformScope"],
  decided: NormalizedSignalCandidate["platformScope"],
): boolean {
  return candidate.kind === decided.kind &&
    (candidate.kind === "none" ||
      (decided.kind === "platform" && candidate.authority === decided.authority));
}

export function createCanonicalSignal<T extends CanonicalSignalType>(input: {
  readonly candidate: NormalizedSignalCandidate<T>;
  readonly policyDecision: SignalPolicyDecision<T>;
  readonly receivedAt: Date;
  readonly maxClockDriftMs: number;
  readonly registry?: SignalSchemaRegistry;
  readonly knownSignalIds?: ReadonlySet<string>;
  readonly previousCanonicalEventTime?: string;
}): CanonicalSignal<T> {
  const registry = input.registry ?? canonicalSignalSchemaRegistry;
  const schema = registry.resolve(
    input.policyDecision.signalType,
    input.policyDecision.schemaVersion,
  );
  const { candidate, policyDecision } = input;

  if (
    policyDecision.decision !== "accept" ||
    policyDecision.disposition === "discard" ||
    !policyDecision.sampled ||
    !policyDecision.redactionApplied
  ) {
    throw new SignalContractError("POLICY_REJECTED");
  }
  if (
    candidate.candidateSignalType !== policyDecision.signalType ||
    candidate.schemaVersion !== policyDecision.schemaVersion ||
    policyDecision.maxPayloadBytes > schema.maxPayloadBytes
  ) {
    throw new SignalContractError("INVALID_SIGNAL");
  }
  if (
    !scopesMatch(candidate.tenantScope, policyDecision.tenantScope) ||
    !platformScopesMatch(candidate.platformScope, policyDecision.platformScope)
  ) {
    throw new SignalContractError("INVALID_SCOPE");
  }

  validateCandidateIdentity({
    signalId: candidate.signalId,
    producer: candidate.producer,
    source: candidate.source,
    policyVersion: policyDecision.policyVersion,
    severity: policyDecision.severity,
    evidenceCompleteness: candidate.evidenceCompleteness,
  });
  validateScope(policyDecision.tenantScope, policyDecision.platformScope);
  validateCorrelation(
    candidate.correlation,
    policyDecision.tenantScope,
    policyDecision.platformScope,
  );
  const metadata = validateMetadata(candidate.metadata);
  validatePayload(
    policyDecision.signalType,
    candidate.payload,
    candidate.evidenceCompleteness,
    policyDecision.maxPayloadBytes,
  );
  assertSignalNotReplay(candidate.signalId, input.knownSignalIds);
  const time = resolveTimeAuthority({
    producerTimestamp: candidate.timestamp,
    receivedAt: input.receivedAt,
    maxClockDriftMs: input.maxClockDriftMs,
    previousCanonicalEventTime: input.previousCanonicalEventTime,
  });

  return deepFreeze({
    signalId: candidate.signalId,
    signalType: policyDecision.signalType,
    schemaVersion: policyDecision.schemaVersion,
    producer: { ...candidate.producer },
    source: { ...candidate.source },
    timestamp: time.timestamp,
    canonicalEventTime: time.canonicalEventTime,
    tenantScope: { ...policyDecision.tenantScope },
    platformScope: { ...policyDecision.platformScope },
    correlation: {
      relationships: candidate.correlation.relationships.map((relationship) => ({
        ...relationship,
      })),
    },
    severity: policyDecision.severity,
    policyVersion: policyDecision.policyVersion,
    payload: candidate.payload as CanonicalSignalPayloadMap[T],
    metadata: { ...metadata },
    evidenceCompleteness: candidate.evidenceCompleteness,
  }) as unknown as CanonicalSignal<T>;
}
