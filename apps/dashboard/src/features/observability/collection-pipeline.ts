import { createCanonicalSignal } from "./canonical-signal";
import { normalizeProducerObservation } from "./collection-normalization";
import type {
  CollectionPipelineDependencies,
  CollectionResult,
  ProducerObservation,
  RequestCorrelationContext,
  SignalEmitter,
} from "./collection-types";
import { SignalContractError } from "./errors";
import { SignalSinkCapacityError } from "./in-memory-sink";
import type { SignalDisposition, SignalRoute } from "./policy";
import { executeRedaction } from "./redaction";
import { validateCorrelation, validateScope } from "./validation";

function failure(error: unknown): CollectionResult {
  if (!(error instanceof SignalContractError)) return { status: "rejected_invalid", reason: "UNEXPECTED_COLLECTION_FAILURE" };
  switch (error.code) {
    case "UNKNOWN_SIGNAL_TYPE":
    case "UNKNOWN_SCHEMA_VERSION": return { status: "rejected_version", reason: error.code };
    case "FORBIDDEN_CREDENTIAL":
    case "FORBIDDEN_METADATA": return { status: "rejected_security", reason: error.code };
    case "INVALID_SCOPE": return { status: "rejected_scope", reason: error.code };
    case "CROSS_TENANT_CORRELATION":
    case "UNRESOLVED_CORRELATION": return { status: "rejected_correlation", reason: error.code };
    default: return { status: "rejected_invalid", reason: error.code };
  }
}

function approvedRoutes(disposition: SignalDisposition, routes: readonly SignalRoute[]): readonly SignalRoute[] {
  if (disposition === "discard") return Object.freeze([]);
  if (routes.length !== 1 || routes[0] !== disposition) {
    throw new SignalContractError("POLICY_REJECTED");
  }
  return Object.freeze([...new Set(routes)]);
}

export function createCollectionPipeline(dependencies: CollectionPipelineDependencies): SignalEmitter {
  const knownSignalIds = new Set<string>();
  return Object.freeze({
    async submit(observation: ProducerObservation, context: RequestCorrelationContext): Promise<CollectionResult> {
      let signalId = observation.signalId;
      let disposition: SignalDisposition = "telemetry";
      try {
        const normalized = normalizeProducerObservation(observation, context, dependencies.maxCandidatePayloadBytes);
        signalId = normalized.candidate.signalId;
        const schema = dependencies.registry.resolve(normalized.candidate.candidateSignalType, normalized.candidate.schemaVersion);
        const decision = dependencies.policyEngine.evaluate(normalized.candidate, schema);
        disposition = decision.disposition;
        if (decision.decision === "reject" || disposition === "discard" || !decision.sampled) {
          return { status: "discarded_by_policy", signalId };
        }

        validateScope(decision.tenantScope, decision.platformScope);
        validateCorrelation(normalized.candidate.correlation, decision.tenantScope, decision.platformScope);
        const redactedCandidate = executeRedaction(normalized.candidate, decision);

        const signal = createCanonicalSignal({
          candidate: redactedCandidate,
          policyDecision: decision,
          receivedAt: dependencies.now(),
          maxClockDriftMs: dependencies.maxClockDriftMs,
          registry: dependencies.registry,
          knownSignalIds,
        });
        const routes = approvedRoutes(disposition, decision.approvedRoutes);
        for (const route of routes) {
          const sink = dependencies.sinks.get(route);
          if (!sink) {
            return disposition === "audit"
              ? { status: "audit_guarantee_failed", signalId, failClosed: true }
              : { status: "sink_unavailable", signalId, runtimeAuthorityChanged: false };
          }
          try {
            await sink.append(Object.freeze({ route, disposition, signal }));
          } catch (error) {
            if (error instanceof SignalSinkCapacityError) {
              return disposition === "audit"
                ? { status: "audit_guarantee_failed", signalId, failClosed: true }
                : { status: "rejected_capacity", reason: "SINK_CAPACITY_EXHAUSTED" };
            }
            return disposition === "audit"
              ? { status: "audit_guarantee_failed", signalId, failClosed: true }
              : { status: "sink_unavailable", signalId, runtimeAuthorityChanged: false };
          }
        }
        knownSignalIds.add(signalId);
        return { status: "accepted", signalId, routes };
      } catch (error) {
        return failure(error);
      }
    },
  });
}
