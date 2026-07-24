import type { RuntimeExecutionPipeline } from "./runtime-execution-pipeline";
import { deepFreeze, validText } from "./validation";

export const RUNTIME_DISPATCH_VERSION = "runtime-command-dispatcher/v1";
export const RUNTIME_DISPATCH_TARGET_CATEGORIES = ["SYSTEM", "DIRECTOR", "MEMORY", "KNOWLEDGE", "TOOL", "ADAPTER"] as const;
export const RUNTIME_DISPATCH_ERROR_CODES = ["INVALID_DISPATCHER", "INVALID_DISPATCH_PLAN", "INVALID_TARGET", "INVALID_REFERENCE", "INVALID_IDENTIFIER", "INVALID_METADATA", "SERIALIZATION_FAILED", "IMMUTABILITY_VIOLATION"] as const;

type DispatchMetadataValue = string | number | boolean | null | readonly DispatchMetadataValue[] | { readonly [key: string]: DispatchMetadataValue };
type RuntimeDispatchErrorCode = (typeof RUNTIME_DISPATCH_ERROR_CODES)[number];

export interface RuntimeDispatchTarget {
  readonly targetId: string;
  readonly category: (typeof RUNTIME_DISPATCH_TARGET_CATEGORIES)[number];
  readonly handlerId: string;
  readonly metadata: Readonly<Record<string, DispatchMetadataValue>>;
  readonly executable: false;
  readonly authoritative: false;
}
export interface RuntimeDispatchPlan {
  readonly planId: string;
  readonly commandId: string;
  readonly primaryTargetId: string;
  readonly targets: readonly RuntimeDispatchTarget[];
  readonly executable: false;
  readonly authoritative: false;
}
export interface RuntimeDispatchMetadata {
  readonly dispatcherId: string;
  readonly executionId: string;
  readonly correlationId: string;
  readonly schemaVersion: string;
  readonly createdAt: string;
  readonly metadata: Readonly<Record<string, DispatchMetadataValue>>;
  readonly executable: false;
  readonly authoritative: false;
}
export interface RuntimeDispatchReference { readonly pipeline: RuntimeExecutionPipeline; readonly executable: false; readonly authoritative: false; }
export interface RuntimeCommandDispatcher { readonly plan: RuntimeDispatchPlan; readonly metadata: RuntimeDispatchMetadata; readonly references: RuntimeDispatchReference; readonly architectureVersion: typeof RUNTIME_DISPATCH_VERSION; readonly executable: false; readonly authoritative: false; }
export interface RuntimeDispatchError { readonly code: RuntimeDispatchErrorCode; readonly message: string; }
export interface RuntimeDispatchValidation { readonly status: "valid" | "invalid"; readonly error?: RuntimeDispatchError; readonly executable: false; readonly authoritative: false; }

function copy(value: unknown, ancestors = new WeakSet<object>(), mutableReferences = new WeakSet<object>()): DispatchMetadataValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (!value || typeof value !== "object" || value instanceof Promise || ancestors.has(value) || (Object.getPrototypeOf(value) !== Object.prototype && !Array.isArray(value))) throw new TypeError("Runtime Command Dispatcher must contain serializable inert data.");
  if (!Object.isFrozen(value) && mutableReferences.has(value)) throw new TypeError("Runtime Command Dispatcher must not contain shared mutable references.");
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
function invalid(code: RuntimeDispatchErrorCode, message: string): RuntimeDispatchValidation { return deepFreeze({ status: "invalid" as const, error: { code, message }, executable: false as const, authoritative: false as const }); }

/** Creates immutable routing metadata; no handler is called and no command is dispatched. */
export function createRuntimeCommandDispatcher(input: Omit<RuntimeCommandDispatcher, "architectureVersion">): RuntimeCommandDispatcher {
  const copied = copy(input) as unknown as Omit<RuntimeCommandDispatcher, "architectureVersion">;
  const values = [copied, copied.plan, copied.metadata, copied.references, copied.references.pipeline, ...copied.plan.targets];
  if (values.some((value) => !value || (value as { executable?: unknown }).executable !== false || (value as { authoritative?: unknown }).authoritative !== false)) throw new TypeError("Invalid Runtime Command Dispatcher.");
  return deepFreeze({ ...copied, plan: { ...copied.plan, targets: copied.plan.targets.map((target) => ({ ...target, metadata: target.metadata })) }, metadata: { ...copied.metadata, metadata: copied.metadata.metadata }, references: { ...copied.references, pipeline: copied.references.pipeline }, architectureVersion: RUNTIME_DISPATCH_VERSION, executable: false as const, authoritative: false as const });
}

/** Validates routing structure only; it never delivers a command or resolves executable code. */
export function validateRuntimeCommandDispatcher(value: RuntimeCommandDispatcher): RuntimeDispatchValidation {
  if (!value || typeof value !== "object" || value.architectureVersion !== RUNTIME_DISPATCH_VERSION || !value.plan || !value.metadata || !value.references?.pipeline) return invalid("INVALID_DISPATCHER", "Runtime Command Dispatcher structure or schema is invalid.");
  try { JSON.stringify(value); } catch { return invalid("SERIALIZATION_FAILED", "Runtime Command Dispatcher is not serializable."); }
  if (![value, value.plan, value.metadata, value.references, value.references.pipeline, ...value.plan.targets].every(inert) || !immutableData(value)) return invalid("IMMUTABILITY_VIOLATION", "Runtime Command Dispatcher must be immutable inert metadata.");
  if (![value.plan.planId, value.plan.commandId, value.plan.primaryTargetId].every(validText) || value.plan.targets.length === 0) return invalid("INVALID_DISPATCH_PLAN", "Runtime Dispatch Plan is invalid.");
  const targetIds = value.plan.targets.map(({ targetId }) => targetId);
  if (!value.plan.targets.every((target) => validText(target.targetId) && validText(target.handlerId) && (RUNTIME_DISPATCH_TARGET_CATEGORIES as readonly string[]).includes(target.category)) || new Set(targetIds).size !== targetIds.length || !targetIds.includes(value.plan.primaryTargetId)) return invalid("INVALID_TARGET", "Runtime Dispatch Target definitions are invalid.");
  if (![value.metadata.dispatcherId, value.metadata.executionId, value.metadata.correlationId].every(validText)) return invalid("INVALID_IDENTIFIER", "Runtime Dispatch identifiers are invalid.");
  if (![value.metadata.schemaVersion, value.metadata.createdAt].every(validText)) return invalid("INVALID_METADATA", "Runtime Dispatch metadata is invalid.");
  if (value.metadata.executionId !== value.references.pipeline.metadata.executionId || value.metadata.correlationId !== value.references.pipeline.metadata.correlationId) return invalid("INVALID_REFERENCE", "Runtime Dispatch Pipeline reference is inconsistent.");
  return deepFreeze({ status: "valid" as const, executable: false as const, authoritative: false as const });
}
export function serializeRuntimeCommandDispatcher(value: RuntimeCommandDispatcher): string {
  const validation = validateRuntimeCommandDispatcher(value);
  if (validation.status === "invalid") throw new TypeError(validation.error?.code ?? "SERIALIZATION_FAILED");
  try { return JSON.stringify(value); } catch { throw new TypeError("SERIALIZATION_FAILED"); }
}
