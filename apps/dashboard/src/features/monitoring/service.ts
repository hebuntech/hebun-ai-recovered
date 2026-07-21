import type { ProducerObservation } from "../observability";
import type { HealthSignalDependencies, HealthSignalEmissionResult, HealthSnapshot } from "./types";

export async function emitHealthSignal(input: {
  readonly snapshot: HealthSnapshot;
  readonly dependencies: HealthSignalDependencies;
}): Promise<HealthSignalEmissionResult> {
  if (input.snapshot.evidenceCompleteness === "MISSING" && input.snapshot.state === "healthy") {
    return Object.freeze({ status: "not_emitted", reason: "MISSING_EVIDENCE" });
  }
  const { tenantScope, platformScope, relationships } = input.dependencies.correlationContext;
  const observation: ProducerObservation = {
    signalId: `health-signal-${input.snapshot.snapshotId}`,
    signalType: "health-signal",
    schemaVersion: 1,
    producer: { id: input.snapshot.monitorId, producerClass: "internal-service", version: input.snapshot.monitorVersion },
    source: { component: "monitoring", operation: "derive-health" },
    timestamp: input.dependencies.now().toISOString(),
    tenantIdCandidate: tenantScope.kind === "tenant" ? tenantScope.tenantId : undefined,
    platformAuthorityCandidate: platformScope.kind === "platform" ? platformScope.authority : undefined,
    correlationCandidates: relationships.map(({ type, id, tenantId, parentId }) => ({ type, id, tenantId, parentId })),
    severityCandidate: input.snapshot.severity,
    payload: {
      subjectType: input.snapshot.subject.type,
      subjectId: input.snapshot.subject.id,
      dimension: input.snapshot.subject.component,
      state: input.snapshot.state,
      evidenceReferences: [...input.snapshot.evidenceReferences],
      derivationVersion: input.snapshot.monitorVersion,
    },
    metadata: { dataClassification: "internal" },
    evidenceCompleteness: input.snapshot.evidenceCompleteness,
  };
  const collection = await input.dependencies.emitter.submit(observation, input.dependencies.correlationContext);
  return collection.status === "accepted"
    ? Object.freeze({ status: "emitted", collection })
    : Object.freeze({ status: "not_emitted", reason: "COLLECTION_REJECTED", collection });
}
