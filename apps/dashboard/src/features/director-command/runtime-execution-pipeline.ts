import type { RuntimeExecutionSession } from "./runtime-execution-session";
import { deepFreeze, validText } from "./validation";

export const RUNTIME_EXECUTION_PIPELINE_VERSION = "runtime-execution-pipeline/v1";
export const RUNTIME_EXECUTION_PIPELINE_STAGES = ["CREATED", "SESSION_BOUND", "VALIDATED", "READY", "DISPATCH_PENDING", "COMPLETED"] as const;
export const RUNTIME_EXECUTION_PIPELINE_ERROR_CODES = ["INVALID_PIPELINE", "INVALID_STAGE", "INVALID_REFERENCE", "INVALID_IDENTIFIER", "INVALID_METADATA", "SERIALIZATION_FAILED", "IMMUTABILITY_VIOLATION"] as const;

type PipelineMetadataValue = string | number | boolean | null | readonly PipelineMetadataValue[] | { readonly [key: string]: PipelineMetadataValue };
type RuntimeExecutionPipelineErrorCode = (typeof RUNTIME_EXECUTION_PIPELINE_ERROR_CODES)[number];

export interface RuntimeExecutionPipelineStage {
  readonly stage: (typeof RUNTIME_EXECUTION_PIPELINE_STAGES)[number];
  readonly ordinal: number;
  readonly metadata: Readonly<Record<string, PipelineMetadataValue>>;
  readonly executable: false;
  readonly authoritative: false;
}
export interface RuntimeExecutionPipelineMetadata {
  readonly pipelineId: string;
  readonly executionId: string;
  readonly correlationId: string;
  readonly schemaVersion: string;
  readonly createdAt: string;
  readonly metadata: Readonly<Record<string, PipelineMetadataValue>>;
  readonly executable: false;
  readonly authoritative: false;
}
export interface RuntimeExecutionPipelineReference { readonly session: RuntimeExecutionSession; readonly executable: false; readonly authoritative: false; }
export interface RuntimeExecutionPipeline { readonly stages: readonly RuntimeExecutionPipelineStage[]; readonly metadata: RuntimeExecutionPipelineMetadata; readonly references: RuntimeExecutionPipelineReference; readonly architectureVersion: typeof RUNTIME_EXECUTION_PIPELINE_VERSION; readonly executable: false; readonly authoritative: false; }
export interface RuntimeExecutionPipelineError { readonly code: RuntimeExecutionPipelineErrorCode; readonly message: string; }
export interface RuntimeExecutionPipelineValidation { readonly status: "valid" | "invalid"; readonly error?: RuntimeExecutionPipelineError; readonly executable: false; readonly authoritative: false; }

function copy(value: unknown, ancestors = new WeakSet<object>(), mutableReferences = new WeakSet<object>()): PipelineMetadataValue {
  if (value === null || typeof value === "string" || typeof value === "boolean") return value;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (!value || typeof value !== "object" || value instanceof Promise || ancestors.has(value) || (Object.getPrototypeOf(value) !== Object.prototype && !Array.isArray(value))) throw new TypeError("Runtime Execution Pipeline must contain serializable inert data.");
  if (!Object.isFrozen(value) && mutableReferences.has(value)) throw new TypeError("Runtime Execution Pipeline must not contain shared mutable references.");
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
function invalid(code: RuntimeExecutionPipelineErrorCode, message: string): RuntimeExecutionPipelineValidation { return deepFreeze({ status: "invalid" as const, error: { code, message }, executable: false as const, authoritative: false as const }); }

/** Constructs an ordered architectural descriptor; it does not traverse or change stages. */
export function createRuntimeExecutionPipeline(input: Omit<RuntimeExecutionPipeline, "architectureVersion">): RuntimeExecutionPipeline {
  const copied = copy(input) as unknown as Omit<RuntimeExecutionPipeline, "architectureVersion">;
  const values = [copied, copied.metadata, copied.references, copied.references.session, ...copied.stages];
  if (values.some((value) => !value || (value as { executable?: unknown }).executable !== false || (value as { authoritative?: unknown }).authoritative !== false)) throw new TypeError("Invalid Runtime Execution Pipeline.");
  return deepFreeze({ ...copied, stages: copied.stages.map((stage) => ({ ...stage, metadata: stage.metadata })), metadata: { ...copied.metadata, metadata: copied.metadata.metadata }, references: { ...copied.references, session: copied.references.session }, architectureVersion: RUNTIME_EXECUTION_PIPELINE_VERSION, executable: false as const, authoritative: false as const });
}

/** Validates descriptor ordering and consistency only; no stage is entered or executed. */
export function validateRuntimeExecutionPipeline(value: RuntimeExecutionPipeline): RuntimeExecutionPipelineValidation {
  if (!value || typeof value !== "object" || value.architectureVersion !== RUNTIME_EXECUTION_PIPELINE_VERSION || !Array.isArray(value.stages) || !value.metadata || !value.references?.session) return invalid("INVALID_PIPELINE", "Runtime Execution Pipeline structure or schema is invalid.");
  try { JSON.stringify(value); } catch { return invalid("SERIALIZATION_FAILED", "Runtime Execution Pipeline is not serializable."); }
  if (![value, value.metadata, value.references, value.references.session, ...value.stages].every(inert) || !immutableData(value)) return invalid("IMMUTABILITY_VIOLATION", "Runtime Execution Pipeline must be immutable inert metadata.");
  if (value.stages.length !== RUNTIME_EXECUTION_PIPELINE_STAGES.length || !value.stages.every((stage, ordinal) => stage.stage === RUNTIME_EXECUTION_PIPELINE_STAGES[ordinal] && stage.ordinal === ordinal)) return invalid("INVALID_STAGE", "Runtime Execution Pipeline stages must match canonical order.");
  if (![value.metadata.pipelineId, value.metadata.executionId, value.metadata.correlationId].every(validText)) return invalid("INVALID_IDENTIFIER", "Runtime Execution Pipeline identifiers are invalid.");
  if (![value.metadata.schemaVersion, value.metadata.createdAt].every(validText)) return invalid("INVALID_METADATA", "Runtime Execution Pipeline metadata is invalid.");
  if (value.metadata.executionId !== value.references.session.metadata.executionId || value.metadata.correlationId !== value.references.session.metadata.correlationId) return invalid("INVALID_REFERENCE", "Runtime Execution Pipeline session reference is inconsistent.");
  return deepFreeze({ status: "valid" as const, executable: false as const, authoritative: false as const });
}
export function serializeRuntimeExecutionPipeline(value: RuntimeExecutionPipeline): string {
  const validation = validateRuntimeExecutionPipeline(value);
  if (validation.status === "invalid") throw new TypeError(validation.error?.code ?? "SERIALIZATION_FAILED");
  try { return JSON.stringify(value); } catch { throw new TypeError("SERIALIZATION_FAILED"); }
}
