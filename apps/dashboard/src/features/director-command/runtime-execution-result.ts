import type { RuntimeAdapterInvocationContract } from "./runtime-adapter-invocation-contract";
import { deepFreeze, validText } from "./validation";

export const RUNTIME_EXECUTION_RESULT_VERSION = "runtime-execution-result/v1";
export const RUNTIME_EXECUTION_STATUSES = ["SUCCESS", "FAILED", "PARTIAL", "REJECTED", "TIMEOUT", "CANCELLED"] as const;
export const RUNTIME_EXECUTION_OUTPUT_TYPES = ["STRUCTURED", "TEXT", "BINARY", "METADATA"] as const;
export const RUNTIME_EXECUTION_RESULT_ERROR_CODES = ["INVALID_RESULT", "INVALID_STATUS", "INVALID_OUTPUT", "INVALID_REFERENCE", "INVALID_IDENTIFIER", "INVALID_TIMING", "INVALID_METRICS", "INVALID_SERIALIZATION", "IMMUTABILITY_VIOLATION"] as const;

type ResultDataValue = string | number | boolean | null | readonly ResultDataValue[] | { readonly [key: string]: ResultDataValue };
type RuntimeExecutionResultErrorCode = (typeof RUNTIME_EXECUTION_RESULT_ERROR_CODES)[number];

export type RuntimeExecutionStatus = (typeof RUNTIME_EXECUTION_STATUSES)[number];

export interface RuntimeExecutionOutput {
  readonly type: (typeof RUNTIME_EXECUTION_OUTPUT_TYPES)[number];
  readonly schemaId: string;
  readonly mediaType: string;
  readonly data: ResultDataValue;
  readonly metadata: Readonly<Record<string, ResultDataValue>>;
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeExecutionTiming {
  readonly startedAt: string;
  readonly completedAt: string;
  readonly durationMs: number;
  readonly latencyMs: number;
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeExecutionMetrics {
  readonly tokenCount: number;
  readonly payloadSizeBytes: number;
  readonly executionSizeBytes: number;
  readonly serializationSizeBytes: number;
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeExecutionReference {
  readonly invocationContract: RuntimeAdapterInvocationContract;
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeExecutionErrorReference {
  readonly errorId: string;
  readonly errorCode: string;
  readonly errorType: string;
  readonly metadata: Readonly<Record<string, ResultDataValue>>;
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeExecutionSerialization {
  readonly format: "JSON";
  readonly schemaVersion: string;
  readonly encoding: "UTF-8";
  readonly mediaType: "application/json";
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeExecutionResult {
  readonly resultId: string;
  readonly executionId: string;
  readonly correlationId: string;
  readonly invocationId: string;
  readonly status: RuntimeExecutionStatus;
  readonly output: RuntimeExecutionOutput;
  readonly timing: RuntimeExecutionTiming;
  readonly metrics: RuntimeExecutionMetrics;
  readonly references: RuntimeExecutionReference;
  readonly errorReference?: RuntimeExecutionErrorReference;
  readonly serialization: RuntimeExecutionSerialization;
  readonly architectureVersion: typeof RUNTIME_EXECUTION_RESULT_VERSION;
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeExecutionResultError {
  readonly code: RuntimeExecutionResultErrorCode;
  readonly message: string;
}

export interface RuntimeExecutionResultValidation {
  readonly status: "valid" | "invalid";
  readonly error?: RuntimeExecutionResultError;
  readonly executable: false;
  readonly authoritative: false;
}

function copy(value: unknown, ancestors = new WeakSet<object>(), mutableReferences = new WeakSet<object>()): ResultDataValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (!value || typeof value !== "object" || value instanceof Promise || ancestors.has(value)
    || (Object.getPrototypeOf(value) !== Object.prototype && !Array.isArray(value))) {
    throw new TypeError("Runtime Execution Result must contain serializable inert data.");
  }
  if (!Object.isFrozen(value) && mutableReferences.has(value)) {
    throw new TypeError("Runtime Execution Result must not contain shared mutable references.");
  }
  if (!Object.isFrozen(value)) mutableReferences.add(value);
  ancestors.add(value);
  const copied = Array.isArray(value)
    ? value.map((entry) => copy(entry, ancestors, mutableReferences))
    : Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, copy(entry, ancestors, mutableReferences)]));
  ancestors.delete(value);
  return copied;
}

function inert(value: unknown): value is { readonly executable: false; readonly authoritative: false } {
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

function invalid(code: RuntimeExecutionResultErrorCode, message: string): RuntimeExecutionResultValidation {
  return deepFreeze({ status: "invalid" as const, error: { code, message }, executable: false as const, authoritative: false as const });
}

/** Creates immutable result metadata without performing work or writing state. */
export function createRuntimeExecutionResult(input: Omit<RuntimeExecutionResult, "architectureVersion">): RuntimeExecutionResult {
  const copied = copy(input) as unknown as Omit<RuntimeExecutionResult, "architectureVersion">;
  const structures = [copied, copied.output, copied.timing, copied.metrics, copied.references,
    copied.references.invocationContract, copied.serialization, copied.errorReference].filter(Boolean);
  if (structures.some((value) => (value as { executable?: unknown }).executable !== false
    || (value as { authoritative?: unknown }).authoritative !== false)) {
    throw new TypeError("Invalid Runtime Execution Result.");
  }
  return deepFreeze({ ...copied, architectureVersion: RUNTIME_EXECUTION_RESULT_VERSION });
}

/** Validates immutable outcome descriptors only; no referenced contract is evaluated. */
export function validateRuntimeExecutionResult(value: RuntimeExecutionResult): RuntimeExecutionResultValidation {
  if (!value || typeof value !== "object" || value.architectureVersion !== RUNTIME_EXECUTION_RESULT_VERSION
    || !value.output || !value.timing || !value.metrics || !value.references?.invocationContract || !value.serialization) {
    return invalid("INVALID_RESULT", "Runtime Execution Result structure or schema is invalid.");
  }
  const structures = [value, value.output, value.timing, value.metrics, value.references,
    value.references.invocationContract, value.serialization, value.errorReference].filter(Boolean);
  if (!structures.every(inert) || !immutableData(value)) {
    return invalid("IMMUTABILITY_VIOLATION", "Runtime Execution Result must be immutable inert metadata.");
  }
  if (!(RUNTIME_EXECUTION_STATUSES as readonly string[]).includes(value.status)) {
    return invalid("INVALID_STATUS", "Runtime Execution Result status is invalid.");
  }
  if (!(RUNTIME_EXECUTION_OUTPUT_TYPES as readonly string[]).includes(value.output.type)
    || ![value.output.schemaId, value.output.mediaType].every(validText)) {
    return invalid("INVALID_OUTPUT", "Runtime Execution Result output descriptor is invalid.");
  }
  if (![value.resultId, value.executionId, value.correlationId, value.invocationId].every(validText)) {
    return invalid("INVALID_IDENTIFIER", "Runtime Execution Result identifiers are invalid.");
  }
  if (![value.timing.startedAt, value.timing.completedAt].every(validText)
    || ![value.timing.durationMs, value.timing.latencyMs].every((metric) => Number.isFinite(metric) && metric >= 0)) {
    return invalid("INVALID_TIMING", "Runtime Execution Result timing metadata is invalid.");
  }
  if (!Object.values(value.metrics).filter((metric): metric is number => typeof metric === "number")
    .every((metric) => Number.isFinite(metric) && metric >= 0)) {
    return invalid("INVALID_METRICS", "Runtime Execution Result metrics are invalid.");
  }
  if (value.serialization.format !== "JSON" || value.serialization.encoding !== "UTF-8"
    || value.serialization.mediaType !== "application/json" || !validText(value.serialization.schemaVersion)) {
    return invalid("INVALID_SERIALIZATION", "Runtime Execution Result serialization descriptor is invalid.");
  }
  if (value.errorReference && ![value.errorReference.errorId, value.errorReference.errorCode, value.errorReference.errorType].every(validText)) {
    return invalid("INVALID_REFERENCE", "Runtime Execution Result error reference is invalid.");
  }
  const invocation = value.references.invocationContract;
  if (value.executionId !== invocation.metadata.executionId || value.correlationId !== invocation.metadata.correlationId
    || value.invocationId !== invocation.plan.invocationId) {
    return invalid("INVALID_REFERENCE", "Runtime Execution Result invocation reference is inconsistent.");
  }
  return deepFreeze({ status: "valid" as const, executable: false as const, authoritative: false as const });
}

export function serializeRuntimeExecutionResult(value: RuntimeExecutionResult): string {
  const validation = validateRuntimeExecutionResult(value);
  if (validation.status === "invalid") throw new TypeError(validation.error?.code ?? "INVALID_SERIALIZATION");
  try {
    return JSON.stringify(value);
  } catch {
    throw new TypeError("INVALID_SERIALIZATION");
  }
}
