import type { ProducerObservation } from "../observability";
import type {
  ShadowDispatchResult,
  ShadowInstrumentationHooks,
  ShadowLifecycleName,
  ShadowModeDispatcher,
  ShadowObservabilityConfig,
  ShadowRuntimeContext,
  ShadowRuntimeEvent,
} from "./types";

function outcome(name: ShadowLifecycleName): "succeeded" | "failed" | "unknown" {
  if (name === "authentication.failed") return "failed";
  if (name.endsWith(".started") || name === "runtime.startup" || name === "runtime.shutdown") return "unknown";
  return "succeeded";
}

export function createShadowInstrumentationHooks(input: {
  readonly config: ShadowObservabilityConfig;
  readonly dispatcher: ShadowModeDispatcher;
}): ShadowInstrumentationHooks {
  const emit = (name: ShadowLifecycleName, event: ShadowRuntimeEvent, context: ShadowRuntimeContext): ShadowDispatchResult => {
    if (!input.config.enabled) return Object.freeze({ status: "disabled" });
    const { tenantScope, platformScope, relationships } = context.correlation;
    const observation: ProducerObservation = {
      signalId: `shadow-${event.eventId}`,
      signalType: "operational-event",
      schemaVersion: 1,
      producer: { id: "hebun-runtime-shadow", producerClass: "runtime", version: input.config.instrumentationVersion },
      source: { component: event.component, operation: name },
      timestamp: event.timestamp,
      tenantIdCandidate: tenantScope.kind === "tenant" ? tenantScope.tenantId : undefined,
      platformAuthorityCandidate: platformScope.kind === "platform" ? platformScope.authority : undefined,
      correlationCandidates: relationships.map(({ type, id, tenantId, parentId }) => ({ type, id, tenantId, parentId })),
      severityCandidate: outcome(name) === "failed" ? "warning" : "info",
      payload: { name, component: event.component, outcome: outcome(name), ...(event.reasonCode ? { reasonCode: event.reasonCode } : {}) },
      metadata: { environment: input.config.environment },
      evidenceCompleteness: "FULL",
    };
    return input.dispatcher.dispatch(observation, context.correlation);
  };

  const hooks: ShadowInstrumentationHooks = {
    runtimeStartup: (event, context) => emit("runtime.startup", event, context),
    runtimeShutdown: (event, context) => emit("runtime.shutdown", event, context),
    agentCreated: (event, context) => emit("agent.created", event, context),
    agentFinished: (event, context) => emit("agent.finished", event, context),
    workflowStarted: (event, context) => emit("workflow.started", event, context),
    workflowCompleted: (event, context) => emit("workflow.completed", event, context),
    toolStarted: (event, context) => emit("tool.started", event, context),
    toolCompleted: (event, context) => emit("tool.completed", event, context),
    memoryRead: (event, context) => emit("memory.read", event, context),
    memoryWrite: (event, context) => emit("memory.write", event, context),
    authenticationSucceeded: (event, context) => emit("authentication.succeeded", event, context),
    authenticationFailed: (event, context) => emit("authentication.failed", event, context),
  };
  return Object.freeze(hooks);
}
