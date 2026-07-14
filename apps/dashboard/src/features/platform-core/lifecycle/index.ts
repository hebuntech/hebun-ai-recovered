/*
 * platform-core / lifecycle — barrel.
 * Canonical two-axis (lifecycle + health) contracts. Contracts only; no runtime.
 */
export type {
  LifecycleValue,
  HealthValue,
  TerminalKind,
  LifecycleStateMeta,
  LifecycleTransitionRequest,
  LifecycleTransitionResult,
  HealthUpdateRequest,
  TransitionValidationResult,
} from "./types";

export {
  HEALTH_UNKNOWN,
  isTerminal,
  carriesHealth,
  validateHealthForState,
  assertHealthDoesNotMoveLifecycle,
} from "./contracts";
export type { LifecycleContract } from "./contracts";
