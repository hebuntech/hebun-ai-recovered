import {
  canonicalSignalSchemaRegistry,
  type CanonicalSignalType,
  type SignalDisposition,
  type SignalPolicyDecision,
  type SignalPolicyEngine,
} from "../observability";

export const RUNTIME_POLICY_VERSION = 1;

/**
 * Disposition per signal type. Audit-class evidence routes to the audit
 * disposition, which the collection pipeline treats as fail-closed: if no
 * audit sink is registered the submission fails rather than silently
 * downgrading to telemetry.
 */
function dispositionFor(signalType: CanonicalSignalType): SignalDisposition {
  return signalType === "audit-event" ? "audit" : "telemetry";
}

/**
 * The runtime platform signal policy.
 *
 * It decides routing, retention, and sampling only. It never rewrites scope,
 * severity, or payload — those are carried through from the normalized
 * candidate so the policy cannot widen what the producer declared.
 */
export function createRuntimeSignalPolicyEngine(): SignalPolicyEngine {
  return Object.freeze({
    evaluate<T extends CanonicalSignalType>(
      candidate: Parameters<SignalPolicyEngine["evaluate"]>[0],
    ): SignalPolicyDecision<T> {
      const disposition = dispositionFor(candidate.candidateSignalType);
      const schema = canonicalSignalSchemaRegistry.resolve(candidate.candidateSignalType, candidate.schemaVersion);
      return Object.freeze({
        decision: "accept",
        signalType: candidate.candidateSignalType as T,
        schemaVersion: candidate.schemaVersion,
        policyVersion: RUNTIME_POLICY_VERSION,
        disposition,
        retention: disposition === "audit" ? "security" : "operational",
        severity: candidate.candidateSeverity,
        tenantScope: candidate.tenantScope,
        platformScope: candidate.platformScope,
        maxPayloadBytes: schema.maxPayloadBytes,
        sampled: true,
        redactionApplied: true,
        approvedRoutes: Object.freeze(disposition === "discard" ? [] : [disposition]),
      });
    },
  });
}
