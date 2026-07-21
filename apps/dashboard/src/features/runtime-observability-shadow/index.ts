export { createShadowObservabilityConfig } from "./config";
export { createShadowModeDispatcher } from "./dispatcher";
export { createShadowInstrumentationHooks } from "./hooks";
export { runWithShadowInstrumentation, type PassiveOperationHooks } from "./integration";
export type {
  ShadowDispatchResult,
  ShadowDispatcherDependencies,
  ShadowFailureLogger,
  ShadowFailureRecord,
  ShadowInstrumentationHooks,
  ShadowLifecycleName,
  ShadowModeDispatcher,
  ShadowObservabilityConfig,
  ShadowRuntimeContext,
  ShadowRuntimeEvent,
} from "./types";
