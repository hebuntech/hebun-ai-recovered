import {
  canonicalSignalSchemaRegistry,
  createCollectionPipeline,
  InMemoryAppendOnlySignalSink,
  type CanonicalSignal,
  type SignalEmitter,
} from "../observability";
import {
  createShadowInstrumentationHooks,
  createShadowModeDispatcher,
  createShadowObservabilityConfig,
  type ShadowFailureRecord,
  type ShadowInstrumentationHooks,
  type ShadowModeDispatcher,
  type ShadowObservabilityConfig,
} from "../runtime-observability-shadow";
import { createRuntimeSignalPolicyEngine } from "./policy-engine";
import { PLATFORM_AUTHORITY, RUNTIME_PLATFORM_SCOPE } from "./scope";

export const INSTRUMENTATION_VERSION = "1.0.0";
const SINK_CAPACITY = 10_000;
const MAX_CANDIDATE_PAYLOAD_BYTES = 8_192;
const MAX_CLOCK_DRIFT_MS = 60_000;
const MAX_RETAINED_FAILURES = 100;

interface RuntimeObservabilityComposition {
  readonly config: ShadowObservabilityConfig;
  readonly sink: InMemoryAppendOnlySignalSink;
  readonly emitter: SignalEmitter;
  readonly dispatcher: ShadowModeDispatcher;
  readonly hooks: ShadowInstrumentationHooks;
  readonly failures: ShadowFailureRecord[];
}

let composition: RuntimeObservabilityComposition | undefined;

/**
 * Lifecycle: one composition per process, created on first runtime activity.
 *
 * The sink is in-memory and append-only. Nothing here is persisted, so runtime
 * remains the sole authority and no control-plane write path is introduced.
 */
function create(): RuntimeObservabilityComposition {
  const config = createShadowObservabilityConfig({
    enabled: true,
    instrumentationVersion: INSTRUMENTATION_VERSION,
    environment: "live",
  });
  const sink = new InMemoryAppendOnlySignalSink({ route: "telemetry", capacity: SINK_CAPACITY });
  const emitter = createCollectionPipeline({
    registry: canonicalSignalSchemaRegistry,
    policyEngine: createRuntimeSignalPolicyEngine(),
    // Only a telemetry sink is registered. Audit-class signals therefore fail
    // closed in the pipeline rather than being downgraded to telemetry.
    sinks: new Map([["telemetry", sink]]),
    maxCandidatePayloadBytes: MAX_CANDIDATE_PAYLOAD_BYTES,
    maxClockDriftMs: MAX_CLOCK_DRIFT_MS,
    now: () => new Date(),
  });
  const failures: ShadowFailureRecord[] = [];
  const dispatcher = createShadowModeDispatcher({
    config,
    emitter,
    failureLogger: {
      record(failure) {
        // Bounded: observability failures must never grow without limit.
        if (failures.length >= MAX_RETAINED_FAILURES) failures.shift();
        failures.push(failure);
      },
    },
  });
  return Object.freeze({
    config,
    sink,
    emitter,
    dispatcher,
    hooks: createShadowInstrumentationHooks({ config, dispatcher }),
    failures,
  });
}

export function runtimeObservability(): RuntimeObservabilityComposition {
  composition ??= create();
  return composition;
}

/** Signals currently held by the append-only sink, under the platform scope. */
export function collectedSignals(): readonly CanonicalSignal[] {
  return runtimeObservability().sink.query({ platformAuthority: PLATFORM_AUTHORITY }, RUNTIME_PLATFORM_SCOPE);
}

/** Sanitized copies of recorded observability failures. Never runtime failures. */
export function observabilityFailures(): readonly ShadowFailureRecord[] {
  return Object.freeze(runtimeObservability().failures.map((failure) => Object.freeze({ ...failure })));
}

/** Awaits in-flight dispatches. Test and verification harness only. */
export async function flushRuntimeObservabilityForTests(): Promise<void> {
  await runtimeObservability().dispatcher.flushForTests();
}

/** Drops all collected evidence and rebuilds the composition. Tests only. */
export function resetRuntimeObservabilityForTests(): void {
  composition?.sink.resetForTests();
  composition = undefined;
}
