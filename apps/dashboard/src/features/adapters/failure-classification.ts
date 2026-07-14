import type { AdapterError } from "@/features/adapters/adapter-errors";
import type { AdapterErrorCode } from "@/features/adapters/error-codes";

/*
 * failure-classification.ts — maps error codes onto failure classes and the
 * recovery strategy the Execution Engine should apply. Deterministic.
 */

export type FailureClass =
  | "validation"
  | "configuration"
  | "permission"
  | "timeout"
  | "execution"
  | "cancellation"
  | "rollback"
  | "availability"
  | "fatal";

export type RecoveryStrategy =
  | "reject"
  | "retry"
  | "fallback"
  | "compensate"
  | "circuit-break"
  | "human-escalation"
  | "halt";

const classByCode: Record<AdapterErrorCode, FailureClass> = {
  OK: "execution",
  VALIDATION_FAILED: "validation",
  CONFIGURATION_INVALID: "configuration",
  CAPABILITY_UNSUPPORTED: "configuration",
  PERMISSION_DENIED: "permission",
  TIMEOUT: "timeout",
  EXECUTION_FAILED: "execution",
  CANCELLED: "cancellation",
  ROLLBACK_FAILED: "rollback",
  RETRY_EXHAUSTED: "fatal",
  CIRCUIT_OPEN: "availability",
  UNAVAILABLE: "availability",
  FATAL: "fatal",
};

const strategyByClass: Record<FailureClass, RecoveryStrategy> = {
  validation: "reject",
  configuration: "reject",
  permission: "human-escalation",
  timeout: "retry",
  execution: "retry",
  cancellation: "halt",
  rollback: "human-escalation",
  availability: "circuit-break",
  fatal: "halt",
};

export function classifyFailure(code: AdapterErrorCode): FailureClass {
  return classByCode[code];
}

export function recoveryStrategyFor(code: AdapterErrorCode): RecoveryStrategy {
  return strategyByClass[classifyFailure(code)];
}

export function classifyError(error: AdapterError) {
  const failureClass = classifyFailure(error.code);
  return {
    failureClass,
    strategy: strategyByClass[failureClass],
    recoverable: error.recoverable,
  };
}
