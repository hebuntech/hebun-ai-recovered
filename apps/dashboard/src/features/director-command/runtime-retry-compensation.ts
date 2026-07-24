import { RUNTIME_EXECUTION_STATUSES, type RuntimeExecutionStatus } from "./runtime-execution-result";
import { deepFreeze, validText } from "./validation";

/*
 * Phase 4E.7 — Runtime Retry & Compensation Architecture.
 *
 * Immutable, declarative metadata only. A RuntimeRetryPolicy describes whether
 * another attempt is theoretically permitted; a RuntimeCompensationPlan
 * describes what should happen if recovery is required. Neither retries, waits,
 * defers, invokes an adapter, or performs compensation. No deferral primitive
 * and no work buffer exists here.
 *
 * Position in the canonical flow:
 *   RuntimeExecutionResult -> RuntimeRetryPolicy -> RuntimeCompensationPlan
 * Nothing in an earlier Runtime layer may depend on this file.
 */

export const RUNTIME_RETRY_COMPENSATION_VERSION = "runtime-retry-compensation/v1";

export const RUNTIME_RETRY_ELIGIBILITY_REASONS = [
  "RETRY_ALLOWED",
  "RETRY_NOT_ALLOWED",
  "MAX_ATTEMPTS_REACHED",
  "PERMISSION_DENIED",
  "NON_RETRYABLE_FAILURE",
  "MANUAL_APPROVAL_REQUIRED",
] as const;

export const RUNTIME_RETRY_BACKOFF_STRATEGIES = ["FIXED", "LINEAR", "EXPONENTIAL", "CUSTOM"] as const;

export const RUNTIME_COMPENSATION_STEP_KINDS = ["rollback", "cleanup", "notification", "audit"] as const;

export const RUNTIME_COMPENSATION_STATUSES = [
  "NOT_REQUIRED",
  "PLANNED",
  "MANUAL_REQUIRED",
  "BLOCKED",
  "SUPERSEDED",
] as const;

export const RUNTIME_RECOVERY_CLASSES = [
  "none",
  "automatic-retry",
  "manual-recovery",
  "compensation-only",
] as const;

export const RUNTIME_RETRY_COMPENSATION_ERROR_CODES = [
  "INVALID_RETRY_POLICY",
  "INVALID_RETRY_ELIGIBILITY",
  "INVALID_RETRY_LIMIT",
  "INVALID_RETRY_ATTEMPT",
  "INVALID_BACKOFF_DESCRIPTOR",
  "INVALID_COMPENSATION_PLAN",
  "INVALID_COMPENSATION_STEP",
  "INVALID_REFERENCE",
  "INVALID_RECOVERY_METADATA",
  "IMMUTABILITY_VIOLATION",
] as const;

export type RuntimeRetryEligibilityReason = (typeof RUNTIME_RETRY_ELIGIBILITY_REASONS)[number];
export type RuntimeRetryBackoffStrategy = (typeof RUNTIME_RETRY_BACKOFF_STRATEGIES)[number];
export type RuntimeCompensationStepKind = (typeof RUNTIME_COMPENSATION_STEP_KINDS)[number];
export type RuntimeCompensationStatus = (typeof RUNTIME_COMPENSATION_STATUSES)[number];
export type RuntimeRecoveryClass = (typeof RUNTIME_RECOVERY_CLASSES)[number];
type RuntimeRetryCompensationErrorCode = (typeof RUNTIME_RETRY_COMPENSATION_ERROR_CODES)[number];

export interface RuntimeRetryLimits {
  readonly maxAttempts: number;
  readonly attemptsMade: number;
  readonly attemptsRemaining: number;
  readonly maxTotalDurationMs: number;
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeRetryBackoffDescriptor {
  readonly strategy: RuntimeRetryBackoffStrategy;
  readonly baseDelayMs: number;
  readonly maxDelayMs: number;
  readonly multiplier: number;
  readonly jitter: boolean;
  readonly descriptorId: string;
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeRetryAttempt {
  readonly attemptNumber: number;
  readonly observedStatus: RuntimeExecutionStatus;
  readonly recordedAt: string;
  readonly resultReference: string;
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeRetryEligibility {
  readonly retryable: boolean;
  readonly reason: RuntimeRetryEligibilityReason;
  readonly attemptsRemaining: number;
  readonly requiresManualApproval: boolean;
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeRetryPolicy {
  readonly policyId: string;
  readonly executionId: string;
  readonly correlationId: string;
  readonly observedStatus: RuntimeExecutionStatus;
  readonly retryableStatuses: readonly RuntimeExecutionStatus[];
  readonly permissionGranted: boolean;
  readonly limits: RuntimeRetryLimits;
  readonly backoff: RuntimeRetryBackoffDescriptor;
  readonly attempts: readonly RuntimeRetryAttempt[];
  readonly eligibility: RuntimeRetryEligibility;
  readonly architectureVersion: typeof RUNTIME_RETRY_COMPENSATION_VERSION;
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeCompensationReference {
  readonly executionId: string;
  readonly correlationId: string;
  readonly targetId: string;
  readonly resultReference: string;
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeCompensationStep {
  readonly stepId: string;
  readonly order: number;
  readonly kind: RuntimeCompensationStepKind;
  readonly description: string;
  readonly required: boolean;
  readonly reference: RuntimeCompensationReference;
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeRecoveryMetadata {
  readonly recoveryClass: RuntimeRecoveryClass;
  readonly rationale: string;
  readonly requiresManualApproval: boolean;
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeCompensationPlan {
  readonly planId: string;
  readonly executionId: string;
  readonly correlationId: string;
  readonly status: RuntimeCompensationStatus;
  readonly steps: readonly RuntimeCompensationStep[];
  readonly recovery: RuntimeRecoveryMetadata;
  readonly architectureVersion: typeof RUNTIME_RETRY_COMPENSATION_VERSION;
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeRetryCompensationError {
  readonly code: RuntimeRetryCompensationErrorCode;
  readonly message: string;
}

export interface RuntimeRetryCompensationValidation {
  readonly status: "valid" | "invalid";
  readonly error?: RuntimeRetryCompensationError;
  readonly executable: false;
  readonly authoritative: false;
}

type InertValue = string | number | boolean | null | readonly InertValue[] | { readonly [key: string]: InertValue };

/**
 * Deep-copies inert data, rejecting anything that could carry behaviour or
 * shared mutable state: functions, promises, symbols, bigints, class
 * instances, cycles, and references already seen while unfrozen.
 */
function copy(value: unknown, ancestors = new WeakSet<object>(), mutableReferences = new WeakSet<object>()): InertValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (!value || typeof value !== "object" || value instanceof Promise || ancestors.has(value)
    || (Object.getPrototypeOf(value) !== Object.prototype && !Array.isArray(value))) {
    throw new TypeError("Runtime Retry & Compensation model must contain serializable inert data.");
  }
  if (!Object.isFrozen(value) && mutableReferences.has(value)) {
    throw new TypeError("Runtime Retry & Compensation model must not contain shared mutable references.");
  }
  if (!Object.isFrozen(value)) mutableReferences.add(value);
  ancestors.add(value);
  const copied = Array.isArray(value)
    ? value.map((entry) => copy(entry, ancestors, mutableReferences))
    : Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, copy(entry, ancestors, mutableReferences)]));
  ancestors.delete(value);
  return copied;
}

function inert(value: unknown): boolean {
  return Boolean(value) && typeof value === "object" && Object.isFrozen(value)
    && (value as { executable?: unknown }).executable === false
    && (value as { authoritative?: unknown }).authoritative === false;
}

function immutableData(value: unknown, seen = new WeakSet<object>()): boolean {
  if (value === null || ["string", "number", "boolean"].includes(typeof value)) return true;
  if (!value || typeof value !== "object" || !Object.isFrozen(value) || value instanceof Promise || seen.has(value)
    || (Object.getPrototypeOf(value) !== Object.prototype && !Array.isArray(value))) return false;
  seen.add(value);
  const valid = Object.values(value).every((entry) => immutableData(entry, seen));
  seen.delete(value);
  return valid;
}

function invalid(code: RuntimeRetryCompensationErrorCode, message: string): RuntimeRetryCompensationValidation {
  return deepFreeze({ status: "invalid" as const, error: { code, message }, executable: false as const, authoritative: false as const });
}

function nonNegativeInteger(value: number): boolean {
  return Number.isInteger(value) && value >= 0;
}

function nonNegativeNumber(value: number): boolean {
  return Number.isFinite(value) && value >= 0;
}

/**
 * Derives eligibility from declared inputs only. It states whether another
 * attempt would be permitted; it never performs one. Order is deliberate:
 * permission, then failure retryability, then attempt budget, then approval.
 */
export function deriveRetryEligibility(input: {
  readonly observedStatus: RuntimeExecutionStatus;
  readonly retryableStatuses: readonly RuntimeExecutionStatus[];
  readonly permissionGranted: boolean;
  readonly attemptsRemaining: number;
  readonly requiresManualApproval: boolean;
}): RuntimeRetryEligibility {
  const attemptsRemaining = Math.max(0, Math.trunc(input.attemptsRemaining));
  const base = { attemptsRemaining, executable: false as const, authoritative: false as const };
  if (!input.permissionGranted) {
    return deepFreeze({ ...base, retryable: false, reason: "PERMISSION_DENIED", requiresManualApproval: input.requiresManualApproval });
  }
  if (!input.retryableStatuses.includes(input.observedStatus)) {
    return deepFreeze({ ...base, retryable: false, reason: "NON_RETRYABLE_FAILURE", requiresManualApproval: input.requiresManualApproval });
  }
  if (attemptsRemaining <= 0) {
    return deepFreeze({ ...base, retryable: false, reason: "MAX_ATTEMPTS_REACHED", requiresManualApproval: input.requiresManualApproval });
  }
  if (input.requiresManualApproval) {
    return deepFreeze({ ...base, retryable: false, reason: "MANUAL_APPROVAL_REQUIRED", requiresManualApproval: true });
  }
  return deepFreeze({ ...base, retryable: true, reason: "RETRY_ALLOWED", requiresManualApproval: false });
}

/** Builds an immutable retry policy. Performs no work and schedules nothing. */
export function createRuntimeRetryPolicy(input: Omit<RuntimeRetryPolicy, "architectureVersion">): RuntimeRetryPolicy {
  const copied = copy(input) as unknown as Omit<RuntimeRetryPolicy, "architectureVersion">;
  const structures: readonly unknown[] = [copied, copied.limits, copied.backoff, copied.eligibility, ...copied.attempts];
  if (structures.some((value) => (value as { executable?: unknown }).executable !== false
    || (value as { authoritative?: unknown }).authoritative !== false)) {
    throw new TypeError("Invalid Runtime Retry Policy.");
  }
  return deepFreeze({ ...copied, architectureVersion: RUNTIME_RETRY_COMPENSATION_VERSION });
}

/** Builds an immutable compensation plan. Describes recovery; never runs it. */
export function createRuntimeCompensationPlan(input: Omit<RuntimeCompensationPlan, "architectureVersion">): RuntimeCompensationPlan {
  const copied = copy(input) as unknown as Omit<RuntimeCompensationPlan, "architectureVersion">;
  const structures: readonly unknown[] = [copied, copied.recovery, ...copied.steps, ...copied.steps.map((step) => step.reference)];
  if (structures.some((value) => (value as { executable?: unknown }).executable !== false
    || (value as { authoritative?: unknown }).authoritative !== false)) {
    throw new TypeError("Invalid Runtime Compensation Plan.");
  }
  return deepFreeze({ ...copied, architectureVersion: RUNTIME_RETRY_COMPENSATION_VERSION });
}

/** Validates retry-policy descriptors only. Retries nothing and authorizes nothing. */
export function validateRuntimeRetryPolicy(value: RuntimeRetryPolicy): RuntimeRetryCompensationValidation {
  if (!value || typeof value !== "object" || value.architectureVersion !== RUNTIME_RETRY_COMPENSATION_VERSION
    || !value.limits || !value.backoff || !value.eligibility || !Array.isArray(value.attempts) || !Array.isArray(value.retryableStatuses)) {
    return invalid("INVALID_RETRY_POLICY", "Runtime Retry Policy structure or schema is invalid.");
  }
  const structures = [value, value.limits, value.backoff, value.eligibility, ...value.attempts];
  if (!structures.every(inert) || !immutableData(value)) {
    return invalid("IMMUTABILITY_VIOLATION", "Runtime Retry Policy must be immutable inert metadata.");
  }
  if (![value.policyId, value.executionId, value.correlationId].every(validText)) {
    return invalid("INVALID_REFERENCE", "Runtime Retry Policy identifiers are invalid.");
  }
  if (!(RUNTIME_EXECUTION_STATUSES as readonly string[]).includes(value.observedStatus)
    || value.retryableStatuses.some((status) => !(RUNTIME_EXECUTION_STATUSES as readonly string[]).includes(status))
    || typeof value.permissionGranted !== "boolean") {
    return invalid("INVALID_RETRY_POLICY", "Runtime Retry Policy status descriptors are invalid.");
  }
  const limits = value.limits;
  if (!nonNegativeInteger(limits.maxAttempts) || limits.maxAttempts < 1
    || !nonNegativeInteger(limits.attemptsMade) || !nonNegativeInteger(limits.attemptsRemaining)
    || !nonNegativeNumber(limits.maxTotalDurationMs)
    || limits.attemptsMade + limits.attemptsRemaining > limits.maxAttempts) {
    return invalid("INVALID_RETRY_LIMIT", "Runtime Retry limits are invalid.");
  }
  const backoff = value.backoff;
  if (!(RUNTIME_RETRY_BACKOFF_STRATEGIES as readonly string[]).includes(backoff.strategy)
    || !validText(backoff.descriptorId) || !nonNegativeNumber(backoff.baseDelayMs)
    || !nonNegativeNumber(backoff.maxDelayMs) || backoff.maxDelayMs < backoff.baseDelayMs
    || !nonNegativeNumber(backoff.multiplier) || typeof backoff.jitter !== "boolean") {
    return invalid("INVALID_BACKOFF_DESCRIPTOR", "Runtime Retry backoff descriptor is invalid.");
  }
  for (const attempt of value.attempts) {
    if (!nonNegativeInteger(attempt.attemptNumber) || attempt.attemptNumber < 1
      || !validText(attempt.recordedAt) || !validText(attempt.resultReference)
      || !(RUNTIME_EXECUTION_STATUSES as readonly string[]).includes(attempt.observedStatus)) {
      return invalid("INVALID_RETRY_ATTEMPT", "Runtime Retry attempt metadata is invalid.");
    }
  }
  if (value.attempts.length > limits.attemptsMade) {
    return invalid("INVALID_RETRY_ATTEMPT", "Runtime Retry attempts exceed the recorded attempt count.");
  }
  const eligibility = value.eligibility;
  if (typeof eligibility.retryable !== "boolean" || typeof eligibility.requiresManualApproval !== "boolean"
    || !nonNegativeInteger(eligibility.attemptsRemaining)
    || !(RUNTIME_RETRY_ELIGIBILITY_REASONS as readonly string[]).includes(eligibility.reason)) {
    return invalid("INVALID_RETRY_ELIGIBILITY", "Runtime Retry eligibility is invalid.");
  }
  // Eligibility must be a faithful derivation of the declared inputs.
  const derived = deriveRetryEligibility({
    observedStatus: value.observedStatus,
    retryableStatuses: value.retryableStatuses,
    permissionGranted: value.permissionGranted,
    attemptsRemaining: limits.attemptsRemaining,
    requiresManualApproval: eligibility.requiresManualApproval,
  });
  if (derived.retryable !== eligibility.retryable || derived.reason !== eligibility.reason
    || derived.attemptsRemaining !== eligibility.attemptsRemaining) {
    return invalid("INVALID_RETRY_ELIGIBILITY", "Runtime Retry eligibility is inconsistent with its inputs.");
  }
  return deepFreeze({ status: "valid" as const, executable: false as const, authoritative: false as const });
}

/** Validates compensation-plan descriptors only. Describes recovery; never runs it. */
export function validateRuntimeCompensationPlan(value: RuntimeCompensationPlan): RuntimeRetryCompensationValidation {
  if (!value || typeof value !== "object" || value.architectureVersion !== RUNTIME_RETRY_COMPENSATION_VERSION
    || !value.recovery || !Array.isArray(value.steps)) {
    return invalid("INVALID_COMPENSATION_PLAN", "Runtime Compensation Plan structure or schema is invalid.");
  }
  const structures = [value, value.recovery, ...value.steps, ...value.steps.map((step) => step.reference)];
  if (!structures.every(inert) || !immutableData(value)) {
    return invalid("IMMUTABILITY_VIOLATION", "Runtime Compensation Plan must be immutable inert metadata.");
  }
  if (![value.planId, value.executionId, value.correlationId].every(validText)) {
    return invalid("INVALID_REFERENCE", "Runtime Compensation Plan identifiers are invalid.");
  }
  if (!(RUNTIME_COMPENSATION_STATUSES as readonly string[]).includes(value.status)) {
    return invalid("INVALID_COMPENSATION_PLAN", "Runtime Compensation Plan status is invalid.");
  }
  const recovery = value.recovery;
  if (!(RUNTIME_RECOVERY_CLASSES as readonly string[]).includes(recovery.recoveryClass)
    || !validText(recovery.rationale) || typeof recovery.requiresManualApproval !== "boolean") {
    return invalid("INVALID_RECOVERY_METADATA", "Runtime Recovery metadata is invalid.");
  }
  const orders = new Set<number>();
  for (const step of value.steps) {
    if (!validText(step.stepId) || !validText(step.description) || typeof step.required !== "boolean"
      || !nonNegativeInteger(step.order) || !(RUNTIME_COMPENSATION_STEP_KINDS as readonly string[]).includes(step.kind)) {
      return invalid("INVALID_COMPENSATION_STEP", "Runtime Compensation step metadata is invalid.");
    }
    if (orders.has(step.order)) {
      return invalid("INVALID_COMPENSATION_STEP", "Runtime Compensation step order must be unique.");
    }
    orders.add(step.order);
    const reference = step.reference;
    if (![reference.executionId, reference.correlationId, reference.targetId, reference.resultReference].every(validText)) {
      return invalid("INVALID_REFERENCE", "Runtime Compensation reference is invalid.");
    }
    if (reference.executionId !== value.executionId || reference.correlationId !== value.correlationId) {
      return invalid("INVALID_REFERENCE", "Runtime Compensation reference is inconsistent with its plan.");
    }
  }
  // Status and recovery class must agree: a plan with no steps is not required,
  // and a manual recovery cannot claim to be fully planned.
  if (value.steps.length === 0 && value.status === "PLANNED") {
    return invalid("INVALID_COMPENSATION_PLAN", "A compensation plan with no steps cannot be PLANNED.");
  }
  if (recovery.recoveryClass === "manual-recovery" && value.status === "PLANNED" && !recovery.requiresManualApproval) {
    return invalid("INVALID_RECOVERY_METADATA", "Manual recovery must require manual approval.");
  }
  return deepFreeze({ status: "valid" as const, executable: false as const, authoritative: false as const });
}
