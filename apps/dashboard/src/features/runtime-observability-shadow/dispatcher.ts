import type {
  ProducerObservation,
  RequestCorrelationContext,
} from "../observability";
import type {
  ShadowDispatchResult,
  ShadowDispatcherDependencies,
  ShadowFailureRecord,
  ShadowModeDispatcher,
} from "./types";

function validObservation(observation: ProducerObservation): boolean {
  return Boolean(observation.signalId.trim()) && Boolean(observation.timestamp) &&
    observation.producer.producerClass === "runtime" && observation.source.component.trim().length > 0;
}

export function createShadowModeDispatcher(dependencies: ShadowDispatcherDependencies): ShadowModeDispatcher {
  const inFlight = new Set<Promise<void>>();

  function logFailure(failure: ShadowFailureRecord): void {
    try {
      dependencies.failureLogger.record(Object.freeze(failure));
    } catch {
      // Logging is deliberately terminal: never recurse into observability.
    }
  }

  return Object.freeze({
    enabled: dependencies.config.enabled,
    dispatch(observation: ProducerObservation, context: RequestCorrelationContext): ShadowDispatchResult {
      if (!dependencies.config.enabled) return Object.freeze({ status: "disabled" });
      if (!validObservation(observation)) return Object.freeze({ status: "dropped", reason: "INVALID_OBSERVATION" });
      let task: Promise<void>;
      try {
        task = Promise.resolve(dependencies.emitter.submit(observation, context))
          .then((result) => {
            if (result.status !== "accepted" && result.status !== "discarded_by_policy") {
              logFailure({ signalId: observation.signalId, category: "collection_rejected", collectionStatus: result.status });
            }
          })
          .catch(() => logFailure({ signalId: observation.signalId, category: "dispatcher_failure" }));
      } catch {
        logFailure({ signalId: observation.signalId, category: "dispatcher_failure" });
        return Object.freeze({ status: "dropped", reason: "INVALID_OBSERVATION" });
      }
      inFlight.add(task);
      void task.finally(() => inFlight.delete(task));
      return Object.freeze({ status: "queued", signalId: observation.signalId });
    },
    async flushForTests(): Promise<void> {
      await Promise.allSettled([...inFlight]);
    },
  });
}
