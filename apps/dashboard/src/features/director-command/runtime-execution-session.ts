import type { RuntimeEngine } from "./runtime-engine";
import type { RuntimeExecutionPermit } from "./runtime-execution-permit";
import { deepFreeze, validText } from "./validation";

export const RUNTIME_EXECUTION_SESSION_VERSION = "runtime-execution-session/v1";
export const RUNTIME_EXECUTION_SESSION_ERROR_CODES = ["INVALID_SESSION", "INVALID_REFERENCE", "INVALID_IDENTIFIER", "INVALID_METADATA", "SERIALIZATION_FAILED", "IMMUTABILITY_VIOLATION"] as const;

type SessionMetadataValue = string | number | boolean | null | readonly SessionMetadataValue[] | { readonly [key: string]: SessionMetadataValue };
type RuntimeExecutionSessionErrorCode = (typeof RUNTIME_EXECUTION_SESSION_ERROR_CODES)[number];

export interface RuntimeExecutionSessionMetadata {
  readonly executionId: string;
  readonly correlationId: string;
  readonly schemaVersion: string;
  readonly createdAt: string;
  readonly requestMetadata: Readonly<Record<string, SessionMetadataValue>>;
  readonly traceMetadata: Readonly<{
    traceId: string;
    parentSpanId?: string;
    metadata: Readonly<Record<string, SessionMetadataValue>>;
  }>;
  readonly timingMetadata: Readonly<{
    createdAt: string;
    requestedAt?: string;
    metadata: Readonly<Record<string, SessionMetadataValue>>;
  }>;
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeExecutionSessionReference {
  readonly permit: RuntimeExecutionPermit;
  readonly runtimeEngine: RuntimeEngine;
  readonly actor: RuntimeExecutionPermit["references"]["identity"]["principal"];
  readonly tenant: RuntimeExecutionPermit["references"]["identity"]["tenant"];
  readonly organization: RuntimeExecutionPermit["references"]["identity"]["tenant"];
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeExecutionSession {
  readonly metadata: RuntimeExecutionSessionMetadata;
  readonly references: RuntimeExecutionSessionReference;
  readonly architectureVersion: typeof RUNTIME_EXECUTION_SESSION_VERSION;
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeExecutionSessionError {
  readonly code: RuntimeExecutionSessionErrorCode;
  readonly message: string;
}

export interface RuntimeExecutionSessionValidation {
  readonly status: "valid" | "invalid";
  readonly error?: RuntimeExecutionSessionError;
  readonly executable: false;
  readonly authoritative: false;
}

function copy(value: unknown, ancestors = new WeakSet<object>(), mutableReferences = new WeakSet<object>()): SessionMetadataValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (!value || typeof value !== "object" || value instanceof Promise || ancestors.has(value)
    || (Object.getPrototypeOf(value) !== Object.prototype && !Array.isArray(value))) {
    throw new TypeError("Runtime Execution Session must contain serializable inert data.");
  }
  if (!Object.isFrozen(value) && mutableReferences.has(value)) {
    throw new TypeError("Runtime Execution Session must not contain shared mutable references.");
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

function invalid(code: RuntimeExecutionSessionErrorCode, message: string): RuntimeExecutionSessionValidation {
  return deepFreeze({ status: "invalid" as const, error: { code, message }, executable: false as const, authoritative: false as const });
}

/** Constructs immutable execution-condition metadata; it does not start or authorize Runtime. */
export function createRuntimeExecutionSession(input: Omit<RuntimeExecutionSession, "architectureVersion">): RuntimeExecutionSession {
  const copied = copy(input) as unknown as Omit<RuntimeExecutionSession, "architectureVersion">;
  const values = [
    copied, copied.metadata, copied.references, copied.references.permit, copied.references.runtimeEngine,
    copied.references.actor, copied.references.tenant, copied.references.organization,
  ];
  if (values.some((value) => !value || (value as { executable?: unknown }).executable !== false
    || (value as { authoritative?: unknown }).authoritative !== false)) {
    throw new TypeError("Invalid Runtime Execution Session.");
  }
  return deepFreeze({
    ...copied,
    metadata: {
      ...copied.metadata,
      requestMetadata: copied.metadata.requestMetadata,
      traceMetadata: { ...copied.metadata.traceMetadata, metadata: copied.metadata.traceMetadata.metadata },
      timingMetadata: { ...copied.metadata.timingMetadata, metadata: copied.metadata.timingMetadata.metadata },
    },
    references: {
      ...copied.references,
      permit: copied.references.permit,
      runtimeEngine: copied.references.runtimeEngine,
      actor: copied.references.actor,
      tenant: copied.references.tenant,
      organization: copied.references.organization,
    },
    architectureVersion: RUNTIME_EXECUTION_SESSION_VERSION,
    executable: false as const,
    authoritative: false as const,
  });
}

/** Validates immutable descriptor consistency only; no referenced contract is evaluated. */
export function validateRuntimeExecutionSession(value: RuntimeExecutionSession): RuntimeExecutionSessionValidation {
  if (!value || typeof value !== "object" || value.architectureVersion !== RUNTIME_EXECUTION_SESSION_VERSION
    || !value.metadata || !value.references) {
    return invalid("INVALID_SESSION", "Runtime Execution Session structure or schema is invalid.");
  }
  try {
    JSON.stringify(value);
  } catch {
    return invalid("SERIALIZATION_FAILED", "Runtime Execution Session is not serializable.");
  }
  const inertValues = [
    value, value.metadata, value.references, value.references.permit, value.references.runtimeEngine,
    value.references.actor, value.references.tenant, value.references.organization,
  ];
  if (!inertValues.every(inert) || !immutableData(value)) {
    return invalid("IMMUTABILITY_VIOLATION", "Runtime Execution Session must be immutable inert metadata.");
  }
  if (value.metadata.timingMetadata.createdAt !== value.metadata.createdAt) {
    return invalid("INVALID_METADATA", "Runtime Execution Session timing metadata is inconsistent.");
  }
  const { permit, runtimeEngine, actor, tenant, organization } = value.references;
  if (![value.metadata.executionId, value.metadata.correlationId, permit.identity.permitId,
    runtimeEngine.metadata.runtimeEngineId, actor.principalId, actor.tenantId, tenant.tenantId, organization.tenantId].every(validText)) {
    return invalid("INVALID_IDENTIFIER", "Runtime Execution Session identifiers are invalid.");
  }
  if (![value.metadata.schemaVersion, value.metadata.createdAt, value.metadata.traceMetadata.traceId, value.metadata.timingMetadata.createdAt].every(validText)
    || (value.metadata.traceMetadata.parentSpanId !== undefined && !validText(value.metadata.traceMetadata.parentSpanId))
    || (value.metadata.timingMetadata.requestedAt !== undefined && !validText(value.metadata.timingMetadata.requestedAt))) {
    return invalid("INVALID_METADATA", "Runtime Execution Session metadata is invalid.");
  }
  if (value.metadata.executionId !== permit.identity.executionId
    || value.metadata.correlationId !== permit.identity.correlationId
    || value.metadata.executionId !== runtimeEngine.metadata.executionId
    || value.metadata.correlationId !== runtimeEngine.metadata.correlationId
    || runtimeEngine.permit.identity.permitId !== permit.identity.permitId
    || actor.tenantId !== tenant.tenantId
    || organization.tenantId !== tenant.tenantId) {
    return invalid("INVALID_REFERENCE", "Runtime Execution Session references are inconsistent.");
  }
  return deepFreeze({ status: "valid" as const, executable: false as const, authoritative: false as const });
}

/** Serializes validated descriptor metadata without invoking Runtime behavior. */
export function serializeRuntimeExecutionSession(value: RuntimeExecutionSession): string {
  const validation = validateRuntimeExecutionSession(value);
  if (validation.status === "invalid") throw new TypeError(validation.error?.code ?? "SERIALIZATION_FAILED");
  try {
    return JSON.stringify(value);
  } catch {
    throw new TypeError("SERIALIZATION_FAILED");
  }
}
