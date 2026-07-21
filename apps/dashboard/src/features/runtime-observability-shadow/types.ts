import type {
  CollectionResult,
  ProducerObservation,
  RequestCorrelationContext,
  SignalEmitter,
} from "../observability";

export interface ShadowObservabilityConfig {
  readonly enabled: boolean;
  readonly instrumentationVersion: string;
  readonly environment: "simulation" | "dry-run" | "live";
}

export interface ShadowRuntimeEvent {
  readonly eventId: string;
  readonly timestamp: string;
  readonly component: string;
  readonly reasonCode?: string;
}

export interface ShadowRuntimeContext {
  readonly correlation: RequestCorrelationContext;
}

export type ShadowDispatchResult =
  | { readonly status: "queued"; readonly signalId: string }
  | { readonly status: "disabled" }
  | { readonly status: "dropped"; readonly reason: "INVALID_OBSERVATION" };

export interface ShadowFailureRecord {
  readonly signalId: string;
  readonly category: "collection_rejected" | "dispatcher_failure" | "logger_failure";
  readonly collectionStatus?: CollectionResult["status"];
}

export interface ShadowFailureLogger {
  record(failure: ShadowFailureRecord): void;
}

export interface ShadowModeDispatcher {
  readonly enabled: boolean;
  dispatch(observation: ProducerObservation, context: RequestCorrelationContext): ShadowDispatchResult;
  flushForTests(): Promise<void>;
}

export interface ShadowDispatcherDependencies {
  readonly config: ShadowObservabilityConfig;
  readonly emitter: SignalEmitter;
  readonly failureLogger: ShadowFailureLogger;
}

export type ShadowLifecycleName =
  | "runtime.startup"
  | "runtime.shutdown"
  | "agent.created"
  | "agent.finished"
  | "workflow.started"
  | "workflow.completed"
  | "tool.started"
  | "tool.completed"
  | "memory.read"
  | "memory.write"
  | "authentication.succeeded"
  | "authentication.failed";

export interface ShadowInstrumentationHooks {
  runtimeStartup(event: ShadowRuntimeEvent, context: ShadowRuntimeContext): ShadowDispatchResult;
  runtimeShutdown(event: ShadowRuntimeEvent, context: ShadowRuntimeContext): ShadowDispatchResult;
  agentCreated(event: ShadowRuntimeEvent, context: ShadowRuntimeContext): ShadowDispatchResult;
  agentFinished(event: ShadowRuntimeEvent, context: ShadowRuntimeContext): ShadowDispatchResult;
  workflowStarted(event: ShadowRuntimeEvent, context: ShadowRuntimeContext): ShadowDispatchResult;
  workflowCompleted(event: ShadowRuntimeEvent, context: ShadowRuntimeContext): ShadowDispatchResult;
  toolStarted(event: ShadowRuntimeEvent, context: ShadowRuntimeContext): ShadowDispatchResult;
  toolCompleted(event: ShadowRuntimeEvent, context: ShadowRuntimeContext): ShadowDispatchResult;
  memoryRead(event: ShadowRuntimeEvent, context: ShadowRuntimeContext): ShadowDispatchResult;
  memoryWrite(event: ShadowRuntimeEvent, context: ShadowRuntimeContext): ShadowDispatchResult;
  authenticationSucceeded(event: ShadowRuntimeEvent, context: ShadowRuntimeContext): ShadowDispatchResult;
  authenticationFailed(event: ShadowRuntimeEvent, context: ShadowRuntimeContext): ShadowDispatchResult;
}
