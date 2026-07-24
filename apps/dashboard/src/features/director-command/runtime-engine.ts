import type { RuntimeExecutionPermit } from "./runtime-execution-permit";
import { deepFreeze, validText } from "./validation";

export const RUNTIME_ENGINE_VERSION = "runtime-engine/v1";
export const RUNTIME_ENGINE_STATES = ["idle", "ready"] as const;
export const RUNTIME_ENGINE_COORDINATION_MODES = ["declarative"] as const;
export const RUNTIME_ENGINE_ERROR_CODES = ["INVALID_RUNTIME", "INVALID_CONFIGURATION", "INVALID_STATE", "IMMUTABILITY_VIOLATION", "SERIALIZATION_FAILED"] as const;

type RuntimeMetadataValue = string | number | boolean | null | readonly RuntimeMetadataValue[] | { readonly [key: string]: RuntimeMetadataValue };
type RuntimeEngineErrorCode = (typeof RUNTIME_ENGINE_ERROR_CODES)[number];

export interface RuntimeEngineState {
  readonly value: (typeof RUNTIME_ENGINE_STATES)[number];
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeEngineConfiguration {
  readonly configurationId: string;
  readonly schemaVersion: string;
  readonly coordinationMode: (typeof RUNTIME_ENGINE_COORDINATION_MODES)[number];
  readonly pipelineReference: string;
  readonly metadata: Readonly<Record<string, RuntimeMetadataValue>>;
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeEngineMetadata {
  readonly runtimeEngineId: string;
  readonly permitId: string;
  readonly correlationId: string;
  readonly executionId: string;
  readonly createdAt: string;
  readonly metadata: Readonly<Record<string, RuntimeMetadataValue>>;
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeEngine {
  readonly permit: RuntimeExecutionPermit;
  readonly state: RuntimeEngineState;
  readonly configuration: RuntimeEngineConfiguration;
  readonly metadata: RuntimeEngineMetadata;
  readonly architectureVersion: typeof RUNTIME_ENGINE_VERSION;
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeEngineError {
  readonly code: RuntimeEngineErrorCode;
  readonly message: string;
}

export interface RuntimeEngineValidation {
  readonly status: "valid" | "invalid";
  readonly error?: RuntimeEngineError;
  readonly executable: false;
  readonly authoritative: false;
}

function copy(value: unknown, ancestors = new WeakSet<object>()): RuntimeMetadataValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (!value || typeof value !== "object" || value instanceof Promise || ancestors.has(value) || (Object.getPrototypeOf(value) !== Object.prototype && !Array.isArray(value))) {
    throw new TypeError("Runtime Engine must contain serializable inert data.");
  }
  ancestors.add(value);
  const copied = Array.isArray(value)
    ? value.map((entry) => copy(entry, ancestors))
    : Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, copy(entry, ancestors)]));
  ancestors.delete(value);
  return copied;
}

function inert(value: unknown): value is { readonly executable: false; readonly authoritative: false } {
  return Boolean(value)
    && typeof value === "object"
    && Object.isFrozen(value)
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

function invalid(code: RuntimeEngineErrorCode, message: string): RuntimeEngineValidation {
  return deepFreeze({ status: "invalid" as const, error: { code, message }, executable: false as const, authoritative: false as const });
}

/** Constructs immutable orchestration metadata; it does not evaluate or use the permit. */
export function createRuntimeEngine(input: Omit<RuntimeEngine, "architectureVersion">): RuntimeEngine {
  const copied = copy(input) as unknown as Omit<RuntimeEngine, "architectureVersion">;
  const values = [copied, copied.permit, copied.state, copied.configuration, copied.metadata];
  if (values.some((value) => !value || (value as { executable?: unknown }).executable !== false || (value as { authoritative?: unknown }).authoritative !== false)) {
    throw new TypeError("Invalid Runtime Engine.");
  }
  return deepFreeze({
    ...copied,
    permit: copied.permit,
    state: { ...copied.state },
    configuration: { ...copied.configuration, metadata: copied.configuration.metadata },
    metadata: { ...copied.metadata, metadata: copied.metadata.metadata },
    architectureVersion: RUNTIME_ENGINE_VERSION,
    executable: false as const,
    authoritative: false as const,
  });
}

/** Validates architecture metadata only; it never authorizes, coordinates, or executes work. */
export function validateRuntimeEngine(value: RuntimeEngine): RuntimeEngineValidation {
  if (!value || typeof value !== "object" || value.architectureVersion !== RUNTIME_ENGINE_VERSION || !value.permit || !value.state || !value.configuration || !value.metadata) {
    return invalid("INVALID_RUNTIME", "Runtime Engine structure or schema is invalid.");
  }
  try {
    JSON.stringify(value);
  } catch {
    return invalid("SERIALIZATION_FAILED", "Runtime Engine is not serializable.");
  }
  if (![value, value.permit, value.state, value.configuration, value.metadata].every(inert) || !immutableData(value)) {
    return invalid("IMMUTABILITY_VIOLATION", "Runtime Engine must be immutable inert metadata.");
  }
  if (!(RUNTIME_ENGINE_STATES as readonly string[]).includes(value.state.value)) {
    return invalid("INVALID_STATE", "Runtime Engine state is invalid.");
  }
  if (![value.configuration.configurationId, value.configuration.schemaVersion, value.configuration.pipelineReference].every(validText)
    || !(RUNTIME_ENGINE_COORDINATION_MODES as readonly string[]).includes(value.configuration.coordinationMode)) {
    return invalid("INVALID_CONFIGURATION", "Runtime Engine configuration is invalid.");
  }
  if (![value.metadata.runtimeEngineId, value.metadata.permitId, value.metadata.correlationId, value.metadata.executionId, value.metadata.createdAt].every(validText)
    || value.metadata.permitId !== value.permit.identity.permitId
    || value.metadata.correlationId !== value.permit.identity.correlationId
    || value.metadata.executionId !== value.permit.identity.executionId) {
    return invalid("INVALID_RUNTIME", "Runtime Engine metadata is invalid.");
  }
  return deepFreeze({ status: "valid" as const, executable: false as const, authoritative: false as const });
}

/** Serializes the declarative model without invoking any Runtime capability. */
export function serializeRuntimeEngine(value: RuntimeEngine): string {
  const validation = validateRuntimeEngine(value);
  if (validation.status === "invalid") throw new TypeError(validation.error?.code ?? "SERIALIZATION_FAILED");
  try {
    return JSON.stringify(value);
  } catch {
    throw new TypeError("SERIALIZATION_FAILED");
  }
}
