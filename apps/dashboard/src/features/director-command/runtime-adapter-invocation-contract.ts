import type { RuntimeCommandDispatcher } from "./runtime-command-dispatcher";
import { deepFreeze, validText } from "./validation";

export const RUNTIME_ADAPTER_INVOCATION_CONTRACT_VERSION = "runtime-adapter-invocation-contract/v1";
export const RUNTIME_ADAPTER_INVOCATION_TARGET_CATEGORIES = ["LOCAL", "REMOTE", "MCP", "SYSTEM", "INTERNAL", "EXTERNAL"] as const;
export const RUNTIME_ADAPTER_INVOCATION_ERROR_CODES = ["INVALID_INVOCATION_CONTRACT", "INVALID_INVOCATION_TARGET", "INVALID_REFERENCE", "INVALID_IDENTIFIER", "INVALID_METADATA", "INVALID_PAYLOAD_DESCRIPTOR", "SERIALIZATION_FAILED", "IMMUTABILITY_VIOLATION"] as const;

type InvocationMetadataValue = string | number | boolean | null | readonly InvocationMetadataValue[] | { readonly [key: string]: InvocationMetadataValue };
type RuntimeAdapterInvocationErrorCode = (typeof RUNTIME_ADAPTER_INVOCATION_ERROR_CODES)[number];

export interface RuntimeAdapterInvocationTarget {
  readonly targetId: string;
  readonly category: (typeof RUNTIME_ADAPTER_INVOCATION_TARGET_CATEGORIES)[number];
  readonly adapterId: string;
  readonly handlerId: string;
  readonly metadata: Readonly<Record<string, InvocationMetadataValue>>;
  readonly executable: false;
  readonly authoritative: false;
}
export interface RuntimeAdapterInvocationPlan {
  readonly invocationId: string;
  readonly target: RuntimeAdapterInvocationTarget;
  readonly payloadDescriptor: Readonly<{
    schemaId: string;
    payloadType: string;
    metadata: Readonly<Record<string, InvocationMetadataValue>>;
    executable: false;
    authoritative: false;
  }>;
  readonly serializationDescriptor: Readonly<{
    format: "JSON";
    schemaVersion: string;
    encoding: "UTF-8";
    metadata: Readonly<Record<string, InvocationMetadataValue>>;
    executable: false;
    authoritative: false;
  }>;
  readonly executable: false;
  readonly authoritative: false;
}
export interface RuntimeAdapterInvocationMetadata {
  readonly contractId: string;
  readonly executionId: string;
  readonly correlationId: string;
  readonly schemaVersion: string;
  readonly createdAt: string;
  readonly metadata: Readonly<Record<string, InvocationMetadataValue>>;
  readonly executable: false;
  readonly authoritative: false;
}
export interface RuntimeAdapterInvocationReference { readonly dispatcher: RuntimeCommandDispatcher; readonly executable: false; readonly authoritative: false; }
export interface RuntimeAdapterInvocationContract { readonly plan: RuntimeAdapterInvocationPlan; readonly metadata: RuntimeAdapterInvocationMetadata; readonly references: RuntimeAdapterInvocationReference; readonly architectureVersion: typeof RUNTIME_ADAPTER_INVOCATION_CONTRACT_VERSION; readonly executable: false; readonly authoritative: false; }
export interface RuntimeAdapterInvocationError { readonly code: RuntimeAdapterInvocationErrorCode; readonly message: string; }
export interface RuntimeAdapterInvocationValidation { readonly status: "valid" | "invalid"; readonly error?: RuntimeAdapterInvocationError; readonly executable: false; readonly authoritative: false; }

function copy(value: unknown, ancestors = new WeakSet<object>(), mutableReferences = new WeakSet<object>()): InvocationMetadataValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (!value || typeof value !== "object" || value instanceof Promise || ancestors.has(value) || (Object.getPrototypeOf(value) !== Object.prototype && !Array.isArray(value))) throw new TypeError("Runtime Adapter Invocation Contract must contain serializable inert data.");
  if (!Object.isFrozen(value) && mutableReferences.has(value)) throw new TypeError("Runtime Adapter Invocation Contract must not contain shared mutable references.");
  if (!Object.isFrozen(value)) mutableReferences.add(value);
  ancestors.add(value);
  const copied = Array.isArray(value) ? value.map((entry) => copy(entry, ancestors, mutableReferences)) : Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, copy(entry, ancestors, mutableReferences)]));
  ancestors.delete(value);
  return copied;
}
function inert(value: unknown): value is { readonly executable: false; readonly authoritative: false } { return Boolean(value) && typeof value === "object" && Object.isFrozen(value) && (value as { executable?: unknown }).executable === false && (value as { authoritative?: unknown }).authoritative === false; }
function immutableData(value: unknown, seen = new WeakSet<object>()): boolean {
  if (value === null || ["string", "number", "boolean"].includes(typeof value)) return true;
  if (!value || typeof value !== "object" || !Object.isFrozen(value) || value instanceof Promise || seen.has(value) || (Object.getPrototypeOf(value) !== Object.prototype && !Array.isArray(value))) return false;
  seen.add(value);
  const valid = Object.values(value).every((entry) => immutableData(entry, seen));
  seen.delete(value);
  return valid;
}
function invalid(code: RuntimeAdapterInvocationErrorCode, message: string): RuntimeAdapterInvocationValidation { return deepFreeze({ status: "invalid" as const, error: { code, message }, executable: false as const, authoritative: false as const }); }

/** Creates an immutable presentation contract; it never invokes an adapter or handler. */
export function createRuntimeAdapterInvocationContract(input: Omit<RuntimeAdapterInvocationContract, "architectureVersion">): RuntimeAdapterInvocationContract {
  const copied = copy(input) as unknown as Omit<RuntimeAdapterInvocationContract, "architectureVersion">;
  const values = [copied, copied.plan, copied.plan.target, copied.plan.payloadDescriptor, copied.plan.serializationDescriptor, copied.metadata, copied.references, copied.references.dispatcher];
  if (values.some((value) => !value || (value as { executable?: unknown }).executable !== false || (value as { authoritative?: unknown }).authoritative !== false)) throw new TypeError("Invalid Runtime Adapter Invocation Contract.");
  return deepFreeze({ ...copied, plan: { ...copied.plan, target: { ...copied.plan.target, metadata: copied.plan.target.metadata }, payloadDescriptor: { ...copied.plan.payloadDescriptor, metadata: copied.plan.payloadDescriptor.metadata }, serializationDescriptor: { ...copied.plan.serializationDescriptor, metadata: copied.plan.serializationDescriptor.metadata } }, metadata: { ...copied.metadata, metadata: copied.metadata.metadata }, references: { ...copied.references, dispatcher: copied.references.dispatcher }, architectureVersion: RUNTIME_ADAPTER_INVOCATION_CONTRACT_VERSION, executable: false as const, authoritative: false as const });
}

/** Validates immutable presentation metadata only; it never serializes traffic or executes work. */
export function validateRuntimeAdapterInvocationContract(value: RuntimeAdapterInvocationContract): RuntimeAdapterInvocationValidation {
  if (!value || typeof value !== "object" || value.architectureVersion !== RUNTIME_ADAPTER_INVOCATION_CONTRACT_VERSION || !value.plan || !value.metadata || !value.references?.dispatcher) return invalid("INVALID_INVOCATION_CONTRACT", "Runtime Adapter Invocation Contract structure or schema is invalid.");
  try { JSON.stringify(value); } catch { return invalid("SERIALIZATION_FAILED", "Runtime Adapter Invocation Contract is not serializable."); }
  const structures = [value, value.plan, value.plan.target, value.plan.payloadDescriptor, value.plan.serializationDescriptor, value.metadata, value.references, value.references.dispatcher];
  if (!structures.every(inert) || !immutableData(value)) return invalid("IMMUTABILITY_VIOLATION", "Runtime Adapter Invocation Contract must be immutable inert metadata.");
  const target = value.plan.target;
  if (![target.targetId, target.adapterId, target.handlerId].every(validText) || !(RUNTIME_ADAPTER_INVOCATION_TARGET_CATEGORIES as readonly string[]).includes(target.category)) return invalid("INVALID_INVOCATION_TARGET", "Runtime Adapter Invocation Target is invalid.");
  if (![value.plan.payloadDescriptor.schemaId, value.plan.payloadDescriptor.payloadType].every(validText) || value.plan.serializationDescriptor.format !== "JSON" || value.plan.serializationDescriptor.encoding !== "UTF-8" || !validText(value.plan.serializationDescriptor.schemaVersion)) return invalid("INVALID_PAYLOAD_DESCRIPTOR", "Runtime Adapter payload or serialization descriptor is invalid.");
  if (![value.plan.invocationId, value.metadata.contractId, value.metadata.executionId, value.metadata.correlationId].every(validText)) return invalid("INVALID_IDENTIFIER", "Runtime Adapter Invocation identifiers are invalid.");
  if (![value.metadata.schemaVersion, value.metadata.createdAt].every(validText)) return invalid("INVALID_METADATA", "Runtime Adapter Invocation metadata is invalid.");
  const dispatcher = value.references.dispatcher;
  const dispatchTarget = dispatcher.plan.targets.find(({ targetId }) => targetId === dispatcher.plan.primaryTargetId);
  if (!dispatchTarget || target.targetId !== dispatchTarget.targetId || target.handlerId !== dispatchTarget.handlerId || value.metadata.executionId !== dispatcher.metadata.executionId || value.metadata.correlationId !== dispatcher.metadata.correlationId) return invalid("INVALID_REFERENCE", "Runtime Adapter Invocation Dispatcher reference is inconsistent.");
  return deepFreeze({ status: "valid" as const, executable: false as const, authoritative: false as const });
}
export function serializeRuntimeAdapterInvocationContract(value: RuntimeAdapterInvocationContract): string {
  const validation = validateRuntimeAdapterInvocationContract(value);
  if (validation.status === "invalid") throw new TypeError(validation.error?.code ?? "SERIALIZATION_FAILED");
  try { return JSON.stringify(value); } catch { throw new TypeError("SERIALIZATION_FAILED"); }
}
