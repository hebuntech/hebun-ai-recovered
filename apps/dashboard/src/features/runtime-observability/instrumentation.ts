import type { ProducerObservation } from "../observability";
import type { ShadowDispatchResult } from "../runtime-observability-shadow";
import { INSTRUMENTATION_VERSION, runtimeObservability } from "./composition";
import type { InstrumentedComponent } from "./monitors";
import { runtimePlatformCorrelation } from "./scope";

export type ProjectionRefreshOutcome = "succeeded" | "failed";

export interface ProjectionRefreshObservation {
  readonly component: InstrumentedComponent;
  readonly outcome: ProjectionRefreshOutcome;
  /** Existing projection version. Used for signal identity, never randomised. */
  readonly version: number;
  /** Existing projection check time. */
  readonly observedAt: string;
  /** Sanitized failure category from the runtime. Never an exception or stack. */
  readonly reasonCode?: string;
}

/**
 * Emits a canonical operational event for a real runtime projection refresh.
 *
 * The signal identity is derived from existing identifiers — component,
 * projection version, and outcome — so replaying the same refresh yields the
 * same signal id and the append-only sink deduplicates it instead of double
 * counting.
 *
 * The shadow dispatcher is used directly rather than the lifecycle hook
 * helpers because no hook name describes a projection refresh; naming it
 * `agent.finished` or `workflow.completed` would misreport what happened.
 */
export function observeProjectionRefresh(input: ProjectionRefreshObservation): ShadowDispatchResult {
  try {
    return dispatchProjectionRefresh(input);
  } catch {
    // Fail-open is guaranteed here, not by the caller: a malformed observation
    // or a broken composition yields a typed result, never a runtime throw.
    return Object.freeze({ status: "dropped", reason: "INVALID_OBSERVATION" });
  }
}

function dispatchProjectionRefresh(input: ProjectionRefreshObservation): ShadowDispatchResult {
  const observation: ProducerObservation = {
    signalId: `runtime-projection.refresh:${input.component}:${input.version}:${input.outcome}`,
    signalType: "operational-event",
    schemaVersion: 1,
    producer: { id: "runtime-projection", producerClass: "runtime", version: INSTRUMENTATION_VERSION },
    source: { component: input.component, operation: "runtime-projection.refresh" },
    timestamp: input.observedAt,
    platformAuthorityCandidate: undefined,
    correlationCandidates: [{ type: "command", id: `runtime-projection:${input.component}` }],
    severityCandidate: input.outcome === "failed" ? "warning" : "info",
    payload: {
      name: "runtime-projection.refresh",
      component: input.component,
      outcome: input.outcome,
      ...(input.reasonCode ? { reasonCode: input.reasonCode } : {}),
    },
    metadata: { environment: "live", runtimeVersion: INSTRUMENTATION_VERSION },
    evidenceCompleteness: "FULL",
  };
  const correlation = runtimePlatformCorrelation(observation.correlationCandidates ?? []);
  return runtimeObservability().dispatcher.dispatch(observation, correlation);
}

/**
 * Emits the genuine runtime startup event via the existing lifecycle hook.
 * Fired once per process when the runtime projection registry bootstraps.
 */
export function observeRuntimeStartup(input: { readonly bootstrapId: string; readonly observedAt: string }): ShadowDispatchResult {
  try {
    const correlation = runtimePlatformCorrelation([{ type: "command", id: `runtime-bootstrap:${input.bootstrapId}` }]);
    return runtimeObservability().hooks.runtimeStartup(
      { eventId: `runtime-bootstrap-${input.bootstrapId}`, timestamp: input.observedAt, component: "runtime-projection" },
      { correlation },
    );
  } catch {
    return Object.freeze({ status: "dropped", reason: "INVALID_OBSERVATION" });
  }
}
