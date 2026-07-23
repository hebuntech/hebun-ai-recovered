import { deepFreeze, validText } from "./validation";

export const RUNTIME_AUTHORITY_VERSION = "runtime-authority/v1";
export const RUNTIME_AUTHORITY_STATUSES = ["requested", "evaluating", "approval_required", "denied", "invalid"] as const;
export const RUNTIME_AUTHORITY_REASON_CODES = ["REQUEST_RECEIVED", "SUBJECT_INVALID", "RESOURCE_INVALID", "ACTION_INVALID", "CONTEXT_INVALID", "EXECUTABLE_VALUE_REJECTED"] as const;
export const RUNTIME_AUTHORITY_ERROR_CODES = ["INVALID_AUTHORITY_REQUEST", "INVALID_AUTHORITY_SUBJECT", "INVALID_AUTHORITY_RESOURCE", "INVALID_AUTHORITY_ACTION", "INVALID_AUTHORITY_CONTEXT", "EXECUTABLE_VALUE_LEAKAGE", "AUTHORITY_SERIALIZATION_FAILED"] as const;

type AuthorityStatus = (typeof RUNTIME_AUTHORITY_STATUSES)[number];
type AuthorityReasonCode = (typeof RUNTIME_AUTHORITY_REASON_CODES)[number];
type AuthorityErrorCode = (typeof RUNTIME_AUTHORITY_ERROR_CODES)[number];
type InertMetadata = string | number | boolean | null | readonly InertMetadata[] | { readonly [key: string]: InertMetadata };

export interface RuntimeAuthoritySubject { readonly subjectId: string; readonly subjectType: "director" | "service" | "system"; readonly tenantScope: string; readonly executable: false; readonly authoritative: false; }
export interface RuntimeAuthorityResource { readonly resourceId: string; readonly resourceType: "agent" | "workflow" | "diagnostics" | "monitoring"; readonly tenantScope: string; readonly executable: false; readonly authoritative: false; }
export interface RuntimeAuthorityAction { readonly actionId: string; readonly actionType: string; readonly executable: false; readonly authoritative: false; }
export interface RuntimeAuthorityContext { readonly correlationId: string; readonly timestamp: string; readonly metadata: Readonly<Record<string, InertMetadata>>; readonly executable: false; readonly authoritative: false; }
export interface RuntimeAuthorityRequest { readonly requestId: string; readonly subject: RuntimeAuthoritySubject; readonly resource: RuntimeAuthorityResource; readonly action: RuntimeAuthorityAction; readonly context: RuntimeAuthorityContext; readonly architectureVersion: typeof RUNTIME_AUTHORITY_VERSION; readonly executable: false; readonly authoritative: false; }
export interface RuntimeAuthorityDecision { readonly requestId: string; readonly status: AuthorityStatus; readonly reasonCodes: readonly AuthorityReasonCode[]; readonly architectureVersion: typeof RUNTIME_AUTHORITY_VERSION; readonly executable: false; readonly authoritative: false; }
export interface RuntimeAuthorityValidation { readonly decision: RuntimeAuthorityDecision; readonly error?: { readonly code: AuthorityErrorCode; readonly message: string; }; readonly executable: false; readonly authoritative: false; }

function copyMetadata(value: unknown, seen = new WeakSet<object>()): InertMetadata {
  if (value === null || typeof value === "string" || typeof value === "number" || typeof value === "boolean") return value;
  if (!value || typeof value !== "object" || value instanceof Promise || seen.has(value) || (Object.getPrototypeOf(value) !== Object.prototype && !Array.isArray(value))) throw new TypeError("Authority metadata must be serializable inert data.");
  seen.add(value);
  if (Array.isArray(value)) return value.map((entry) => copyMetadata(entry, seen));
  return Object.fromEntries(Object.entries(value).map(([key, entry]) => [key, copyMetadata(entry, seen)]));
}

function inert(value: unknown): value is { readonly executable: false; readonly authoritative: false } {
  return Boolean(value) && typeof value === "object" && Object.isFrozen(value) && (value as { executable?: unknown }).executable === false && (value as { authoritative?: unknown }).authoritative === false;
}

function decision(requestId: string, status: AuthorityStatus, reasonCodes: readonly AuthorityReasonCode[]): RuntimeAuthorityDecision {
  return deepFreeze({ requestId, status, reasonCodes: [...reasonCodes], architectureVersion: RUNTIME_AUTHORITY_VERSION, executable: false as const, authoritative: false as const });
}

/** Copies declarative caller input; no authority is granted or evaluated. */
export function createRuntimeAuthorityRequest(input: Omit<RuntimeAuthorityRequest, "architectureVersion">): RuntimeAuthorityRequest {
  const copied = copyMetadata(input) as unknown as Omit<RuntimeAuthorityRequest, "architectureVersion">;
  if (!validText(copied.requestId) || copied.subject.executable !== false || copied.subject.authoritative !== false || copied.resource.executable !== false || copied.resource.authoritative !== false || copied.action.executable !== false || copied.action.authoritative !== false || copied.context.executable !== false || copied.context.authoritative !== false || copied.executable !== false || copied.authoritative !== false) throw new TypeError("Invalid Runtime authority request.");
  return deepFreeze({ requestId: copied.requestId, subject: { ...copied.subject }, resource: { ...copied.resource }, action: { ...copied.action }, context: { ...copied.context, metadata: copied.context.metadata }, architectureVersion: RUNTIME_AUTHORITY_VERSION, executable: false as const, authoritative: false as const });
}

/** Pure shape validation; a well-formed request remains merely requested. */
export function validateRuntimeAuthorityRequest(request: RuntimeAuthorityRequest): RuntimeAuthorityValidation {
  const invalid = (code: AuthorityErrorCode, reason: AuthorityReasonCode, message: string): RuntimeAuthorityValidation => deepFreeze({ decision: decision(request.requestId, "invalid", [reason]), error: { code, message }, executable: false as const, authoritative: false as const });
  if (!inert(request) || !inert(request.subject) || !inert(request.resource) || !inert(request.action) || !inert(request.context)) return invalid("EXECUTABLE_VALUE_LEAKAGE", "EXECUTABLE_VALUE_REJECTED", "Authority request must be immutable inert metadata.");
  if (!validText(request.requestId)) return invalid("INVALID_AUTHORITY_REQUEST", "CONTEXT_INVALID", "Authority request identity is invalid.");
  if (!validText(request.subject.subjectId) || !["director", "service", "system"].includes(request.subject.subjectType) || !validText(request.subject.tenantScope)) return invalid("INVALID_AUTHORITY_SUBJECT", "SUBJECT_INVALID", "Authority subject is invalid.");
  if (!validText(request.resource.resourceId) || !["agent", "workflow", "diagnostics", "monitoring"].includes(request.resource.resourceType) || request.resource.tenantScope !== request.subject.tenantScope) return invalid("INVALID_AUTHORITY_RESOURCE", "RESOURCE_INVALID", "Authority resource is invalid or out of scope.");
  if (!validText(request.action.actionId) || !validText(request.action.actionType)) return invalid("INVALID_AUTHORITY_ACTION", "ACTION_INVALID", "Authority action is invalid.");
  try { JSON.stringify(request.context.metadata); } catch { return invalid("AUTHORITY_SERIALIZATION_FAILED", "CONTEXT_INVALID", "Authority context is not serializable."); }
  if (!validText(request.context.correlationId) || !validText(request.context.timestamp)) return invalid("INVALID_AUTHORITY_CONTEXT", "CONTEXT_INVALID", "Authority context is invalid.");
  return deepFreeze({ decision: decision(request.requestId, "requested", ["REQUEST_RECEIVED"]), executable: false as const, authoritative: false as const });
}
