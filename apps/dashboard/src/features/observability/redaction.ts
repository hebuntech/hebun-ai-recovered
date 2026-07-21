import { SignalContractError } from "./errors";
import type { SignalPolicyDecision } from "./policy";
import type { CanonicalSignalType, NormalizedSignalCandidate } from "./types";
import { validateMetadata, validatePayload } from "./validation";

function cloneJsonValue(value: unknown, seen = new Set<object>()): unknown {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (Array.isArray(value)) {
    if (seen.has(value)) throw new SignalContractError("INVALID_PAYLOAD");
    seen.add(value);
    const clone = value.map((entry) => cloneJsonValue(entry, seen));
    seen.delete(value);
    return clone;
  }
  if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
    if (seen.has(value)) throw new SignalContractError("INVALID_PAYLOAD");
    seen.add(value);
    const clone = Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, cloneJsonValue(entry, seen)]));
    seen.delete(value);
    return clone;
  }
  throw new SignalContractError("INVALID_PAYLOAD");
}

export function executeRedaction<T extends CanonicalSignalType>(
  candidate: NormalizedSignalCandidate<T>,
  decision: SignalPolicyDecision<T>,
): NormalizedSignalCandidate<T> {
  if (!decision.redactionApplied) throw new SignalContractError("POLICY_REJECTED");
  validateMetadata(candidate.metadata);
  validatePayload(decision.signalType, candidate.payload, candidate.evidenceCompleteness, decision.maxPayloadBytes);
  return Object.freeze({
    ...candidate,
    payload: cloneJsonValue(candidate.payload),
    metadata: cloneJsonValue(candidate.metadata),
  });
}
