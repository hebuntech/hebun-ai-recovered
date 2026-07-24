import { deepFreeze, validText } from "./validation";

/*
 * Phase 4E.8 — Runtime Error Architecture.
 *
 * Canonical immutable error metadata. A RuntimeError describes a failure that
 * was observed. It is inert data only: it raises nothing, handles nothing,
 * records nothing to any sink, re-attempts nothing, restores nothing, and
 * reaches no adapter, provider, buffer, deferral primitive, or store. The sole
 * exception is the shared construction-time immutability guard, which rejects
 * non-inert input.
 *
 * This is a foundational leaf: it imports only the shared validation utility,
 * and no other Runtime layer may depend on it.
 */

export const RUNTIME_ERROR_VERSION = "runtime-error/v1";

export const RUNTIME_ERROR_CODES = [
  "RUNTIME_UNKNOWN",
  "RUNTIME_INVALID_REQUEST",
  "RUNTIME_AUTHORITY_DENIED",
  "RUNTIME_POLICY_BLOCKED",
  "RUNTIME_PERMIT_INVALID",
  "RUNTIME_TARGET_UNRESOLVED",
  "RUNTIME_ADAPTER_UNAVAILABLE",
  "RUNTIME_INVOCATION_FAILED",
  "RUNTIME_EXECUTION_FAILED",
  "RUNTIME_EXECUTION_TIMEOUT",
  "RUNTIME_EXECUTION_CANCELLED",
  "RUNTIME_RESULT_INVALID",
  "RUNTIME_INTERNAL",
] as const;

export const RUNTIME_ERROR_CATEGORIES = [
  "validation",
  "authority",
  "policy",
  "permit",
  "resolution",
  "adapter",
  "execution",
  "timeout",
  "cancellation",
  "result",
  "internal",
] as const;

export const RUNTIME_ERROR_SEVERITIES = ["info", "warning", "error", "critical", "fatal"] as const;

export const RUNTIME_ERROR_ORIGIN_LAYERS = [
  "authority",
  "policy",
  "permit",
  "engine",
  "session",
  "pipeline",
  "dispatcher",
  "adapter-invocation",
  "result",
  "retry-compensation",
] as const;

export const RUNTIME_ERROR_ERROR_CODES = [
  "INVALID_ERROR",
  "INVALID_ERROR_CODE",
  "INVALID_ERROR_CATEGORY",
  "INVALID_ERROR_SEVERITY",
  "INVALID_ERROR_ORIGIN",
  "INVALID_ERROR_REFERENCE",
  "INVALID_ERROR_CONTEXT",
  "INVALID_ERROR_CORRELATION",
  "INVALID_ERROR_METADATA",
  "IMMUTABILITY_VIOLATION",
] as const;

export type RuntimeErrorCode = (typeof RUNTIME_ERROR_CODES)[number];
export type RuntimeErrorCategory = (typeof RUNTIME_ERROR_CATEGORIES)[number];
export type RuntimeErrorSeverity = (typeof RUNTIME_ERROR_SEVERITIES)[number];
export type RuntimeErrorOriginLayer = (typeof RUNTIME_ERROR_ORIGIN_LAYERS)[number];
type RuntimeErrorErrorCode = (typeof RUNTIME_ERROR_ERROR_CODES)[number];

type MetadataValue = string | number | boolean | null | readonly MetadataValue[] | { readonly [key: string]: MetadataValue };

export interface RuntimeErrorOrigin {
  readonly layer: RuntimeErrorOriginLayer;
  readonly component: string;
  readonly operation: string;
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeErrorReference {
  readonly executionId: string;
  readonly correlationId: string;
  readonly targetId: string;
  readonly resultReference: string;
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeErrorCorrelation {
  readonly correlationId: string;
  readonly causationId: string;
  readonly parentErrorId: string;
  readonly rootErrorId: string;
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeErrorContext {
  readonly reason: string;
  readonly retryable: boolean;
  readonly terminal: boolean;
  readonly attributes: Readonly<Record<string, MetadataValue>>;
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeErrorMetadata {
  readonly occurredAt: string;
  readonly schemaVersion: string;
  readonly redactionApplied: boolean;
  readonly attributes: Readonly<Record<string, MetadataValue>>;
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeError {
  readonly errorId: string;
  readonly code: RuntimeErrorCode;
  readonly category: RuntimeErrorCategory;
  readonly severity: RuntimeErrorSeverity;
  readonly message: string;
  readonly origin: RuntimeErrorOrigin;
  readonly reference: RuntimeErrorReference;
  readonly correlation: RuntimeErrorCorrelation;
  readonly context: RuntimeErrorContext;
  readonly metadata: RuntimeErrorMetadata;
  readonly architectureVersion: typeof RUNTIME_ERROR_VERSION;
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeErrorValidationError {
  readonly code: RuntimeErrorErrorCode;
  readonly message: string;
}

export interface RuntimeErrorValidation {
  readonly status: "valid" | "invalid";
  readonly error?: RuntimeErrorValidationError;
  readonly executable: false;
  readonly authoritative: false;
}

/**
 * Which error codes belong to which category. A RuntimeError must not
 * misattribute its code to an unrelated category, so classification cannot
 * drift from the declared code.
 */
const CODE_CATEGORY: Readonly<Record<RuntimeErrorCode, RuntimeErrorCategory>> = Object.freeze({
  RUNTIME_UNKNOWN: "internal",
  RUNTIME_INVALID_REQUEST: "validation",
  RUNTIME_AUTHORITY_DENIED: "authority",
  RUNTIME_POLICY_BLOCKED: "policy",
  RUNTIME_PERMIT_INVALID: "permit",
  RUNTIME_TARGET_UNRESOLVED: "resolution",
  RUNTIME_ADAPTER_UNAVAILABLE: "adapter",
  RUNTIME_INVOCATION_FAILED: "adapter",
  RUNTIME_EXECUTION_FAILED: "execution",
  RUNTIME_EXECUTION_TIMEOUT: "timeout",
  RUNTIME_EXECUTION_CANCELLED: "cancellation",
  RUNTIME_RESULT_INVALID: "result",
  RUNTIME_INTERNAL: "internal",
});

type InertValue = string | number | boolean | null | readonly InertValue[] | { readonly [key: string]: InertValue };

/**
 * Deep-copies inert data, rejecting anything that could carry behaviour or
 * shared mutable state: functions, promises, symbols, bigints, class
 * instances, cycles, non-finite numbers, and unfrozen references seen twice.
 */
function copy(value: unknown, ancestors = new WeakSet<object>(), mutableReferences = new WeakSet<object>()): InertValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (!value || typeof value !== "object" || value instanceof Promise || ancestors.has(value)
    || (Object.getPrototypeOf(value) !== Object.prototype && !Array.isArray(value))) {
    throw new TypeError("Runtime Error must contain serializable inert data.");
  }
  if (!Object.isFrozen(value) && mutableReferences.has(value)) {
    throw new TypeError("Runtime Error must not contain shared mutable references.");
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

function invalid(code: RuntimeErrorErrorCode, message: string): RuntimeErrorValidation {
  return deepFreeze({ status: "invalid" as const, error: { code, message }, executable: false as const, authoritative: false as const });
}

/** Builds an immutable Runtime Error descriptor. Records a failure; raises nothing. */
export function createRuntimeError(input: Omit<RuntimeError, "architectureVersion">): RuntimeError {
  const copied = copy(input) as unknown as Omit<RuntimeError, "architectureVersion">;
  const structures: readonly unknown[] = [copied, copied.origin, copied.reference, copied.correlation, copied.context, copied.metadata];
  if (structures.some((value) => (value as { executable?: unknown }).executable !== false
    || (value as { authoritative?: unknown }).authoritative !== false)) {
    throw new TypeError("Invalid Runtime Error.");
  }
  return deepFreeze({ ...copied, architectureVersion: RUNTIME_ERROR_VERSION });
}

/** Validates error descriptors only. Never throws for a caller; returns a verdict. */
export function validateRuntimeError(value: RuntimeError): RuntimeErrorValidation {
  if (!value || typeof value !== "object" || value.architectureVersion !== RUNTIME_ERROR_VERSION
    || !value.origin || !value.reference || !value.correlation || !value.context || !value.metadata) {
    return invalid("INVALID_ERROR", "Runtime Error structure or schema is invalid.");
  }
  const structures = [value, value.origin, value.reference, value.correlation, value.context, value.metadata];
  if (!structures.every(inert) || !immutableData(value)) {
    return invalid("IMMUTABILITY_VIOLATION", "Runtime Error must be immutable inert metadata.");
  }
  if (!validText(value.errorId) || !validText(value.message)) {
    return invalid("INVALID_ERROR", "Runtime Error identifiers are invalid.");
  }
  if (!(RUNTIME_ERROR_CODES as readonly string[]).includes(value.code)) {
    return invalid("INVALID_ERROR_CODE", "Runtime Error code is invalid.");
  }
  if (!(RUNTIME_ERROR_CATEGORIES as readonly string[]).includes(value.category)
    || CODE_CATEGORY[value.code] !== value.category) {
    return invalid("INVALID_ERROR_CATEGORY", "Runtime Error category is invalid or inconsistent with its code.");
  }
  if (!(RUNTIME_ERROR_SEVERITIES as readonly string[]).includes(value.severity)) {
    return invalid("INVALID_ERROR_SEVERITY", "Runtime Error severity is invalid.");
  }
  const origin = value.origin;
  if (!(RUNTIME_ERROR_ORIGIN_LAYERS as readonly string[]).includes(origin.layer)
    || ![origin.component, origin.operation].every(validText)) {
    return invalid("INVALID_ERROR_ORIGIN", "Runtime Error origin is invalid.");
  }
  const reference = value.reference;
  if (![reference.executionId, reference.correlationId, reference.targetId, reference.resultReference].every(validText)) {
    return invalid("INVALID_ERROR_REFERENCE", "Runtime Error reference is invalid.");
  }
  const correlation = value.correlation;
  if (![correlation.correlationId, correlation.causationId, correlation.parentErrorId, correlation.rootErrorId].every(validText)) {
    return invalid("INVALID_ERROR_CORRELATION", "Runtime Error correlation is invalid.");
  }
  if (correlation.correlationId !== reference.correlationId) {
    return invalid("INVALID_ERROR_CORRELATION", "Runtime Error correlation is inconsistent with its reference.");
  }
  const context = value.context;
  if (!validText(context.reason) || typeof context.retryable !== "boolean" || typeof context.terminal !== "boolean"
    || !context.attributes || typeof context.attributes !== "object") {
    return invalid("INVALID_ERROR_CONTEXT", "Runtime Error context is invalid.");
  }
  // A failure cannot be both terminal and retryable: those are contradictory
  // descriptions of the same observed error.
  if (context.terminal && context.retryable) {
    return invalid("INVALID_ERROR_CONTEXT", "Runtime Error context cannot be terminal and retryable.");
  }
  const metadata = value.metadata;
  if (!validText(metadata.occurredAt) || !validText(metadata.schemaVersion)
    || typeof metadata.redactionApplied !== "boolean"
    || !metadata.attributes || typeof metadata.attributes !== "object") {
    return invalid("INVALID_ERROR_METADATA", "Runtime Error metadata is invalid.");
  }
  return deepFreeze({ status: "valid" as const, executable: false as const, authoritative: false as const });
}

export { CODE_CATEGORY };
