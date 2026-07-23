import type { CommandCapability, DirectorCommandId } from "./types";
import type { CanonicalRuntimeTarget } from "./runtime-target-resolution";
import { deepFreeze, validText } from "./validation";

export const RUNTIME_CONCURRENCY_SCOPES = ["command", "target", "adapter_family"] as const;
export type RuntimeConcurrencyScope = (typeof RUNTIME_CONCURRENCY_SCOPES)[number];
export const RUNTIME_REPLAY_CLASSIFICATIONS = ["unique", "duplicate", "stale", "unknown"] as const;
export type RuntimeReplayClassification = (typeof RUNTIME_REPLAY_CLASSIFICATIONS)[number];
export const RUNTIME_FRESHNESS_CLASSIFICATIONS = ["fresh", "stale", "indeterminate"] as const;
export type RuntimeFreshnessClassification = (typeof RUNTIME_FRESHNESS_CLASSIFICATIONS)[number];
export const RUNTIME_CONFLICT_CLASSIFICATIONS = ["none", "target_conflict", "adapter_conflict", "capability_conflict", "execution_conflict"] as const;
export type RuntimeConflictClassification = (typeof RUNTIME_CONFLICT_CLASSIFICATIONS)[number];
export const RUNTIME_IDEMPOTENCY_ERROR_CODES = ["INVALID_EXECUTION_IDENTITY", "INVALID_IDEMPOTENCY_IDENTITY", "DUPLICATE_EXECUTION", "STALE_EXECUTION", "INVALID_CONCURRENCY_SCOPE", "INVALID_LEASE_MODEL", "INVALID_FRESHNESS", "EXECUTION_CONFLICT", "INVALID_REPLAY_CLASSIFICATION"] as const;
export type RuntimeIdempotencyErrorCode = (typeof RUNTIME_IDEMPOTENCY_ERROR_CODES)[number];
export interface RuntimeIdempotencyError { readonly code: RuntimeIdempotencyErrorCode; readonly message: string; }
export interface RuntimeExecutionIdentity { readonly executionId: string; readonly correlationId: string; readonly commandId: DirectorCommandId; readonly commandVersion: string; readonly targetIdentity: string; readonly adapterFamily: CanonicalRuntimeTarget["targetFamily"]; readonly capability: CommandCapability; readonly creationTimestamp: string; readonly architectureVersion: "1.0.0"; readonly executable: false; readonly authoritative: false; }
export interface RuntimeIdempotencyIdentity { readonly commandId: DirectorCommandId; readonly commandVersion: string; readonly targetIdentity: string; readonly adapterFamily: CanonicalRuntimeTarget["targetFamily"]; readonly capability: CommandCapability; readonly executable: false; readonly authoritative: false; }
export interface RuntimeExecutionLease { readonly required: true; readonly scope: RuntimeConcurrencyScope; readonly state: "unacquired"; readonly executable: false; readonly authoritative: false; }
export interface RuntimeExecutionReadiness { readonly replay: RuntimeReplayClassification; readonly freshness: RuntimeFreshnessClassification; readonly conflict: RuntimeConflictClassification; readonly lease: RuntimeExecutionLease; readonly executable: false; readonly authoritative: false; }
export function createRuntimeExecutionIdentity(input: { readonly executionId: string; readonly correlationId: string; readonly commandId: DirectorCommandId; readonly commandVersion: string; readonly target: CanonicalRuntimeTarget; readonly creationTimestamp: string; }): RuntimeExecutionIdentity {
  if (![input.executionId, input.correlationId, input.target.canonicalTargetId, input.creationTimestamp].every(validText)) throw new TypeError("Invalid Runtime execution identity.");
  return deepFreeze({ executionId: input.executionId, correlationId: input.correlationId, commandId: input.commandId, commandVersion: input.commandVersion, targetIdentity: input.target.canonicalTargetId, adapterFamily: input.target.targetFamily, capability: input.target.requiredCapability, creationTimestamp: input.creationTimestamp, architectureVersion: "1.0.0" as const, executable: false as const, authoritative: false as const });
}
export function createRuntimeIdempotencyIdentity(identity: RuntimeExecutionIdentity): RuntimeIdempotencyIdentity { return deepFreeze({ commandId: identity.commandId, commandVersion: identity.commandVersion, targetIdentity: identity.targetIdentity, adapterFamily: identity.adapterFamily, capability: identity.capability, executable: false as const, authoritative: false as const }); }
export function validateRuntimeExecutionReadiness(input: { readonly identity: RuntimeExecutionIdentity; readonly idempotency: RuntimeIdempotencyIdentity; readonly readiness: RuntimeExecutionReadiness }): { readonly status: "blocked" | "invalid"; readonly error?: RuntimeIdempotencyError; readonly executable: false; readonly authoritative: false } {
  const invalid = (code: RuntimeIdempotencyErrorCode, message: string) => deepFreeze({ status: "invalid" as const, error: deepFreeze({ code, message }), executable: false as const, authoritative: false as const });
  if (![input.identity, input.idempotency, input.readiness, input.readiness.lease].every(Object.isFrozen)) return invalid("INVALID_EXECUTION_IDENTITY", "Idempotency inputs must be immutable.");
  if (input.identity.commandId !== input.idempotency.commandId || input.identity.targetIdentity !== input.idempotency.targetIdentity || input.identity.capability !== input.idempotency.capability) return invalid("INVALID_IDEMPOTENCY_IDENTITY", "Idempotency identity conflicts with execution identity.");
  if (!(RUNTIME_CONCURRENCY_SCOPES as readonly string[]).includes(input.readiness.lease.scope) || input.readiness.lease.required !== true || input.readiness.lease.state !== "unacquired") return invalid("INVALID_LEASE_MODEL", "Lease metadata is invalid.");
  if (!(RUNTIME_REPLAY_CLASSIFICATIONS as readonly string[]).includes(input.readiness.replay)) return invalid("INVALID_REPLAY_CLASSIFICATION", "Replay classification is invalid.");
  if (!(RUNTIME_FRESHNESS_CLASSIFICATIONS as readonly string[]).includes(input.readiness.freshness)) return invalid("INVALID_FRESHNESS", "Freshness classification is invalid.");
  if (input.readiness.replay === "duplicate") return invalid("DUPLICATE_EXECUTION", "Duplicate execution is blocked.");
  if (input.readiness.replay === "stale" || input.readiness.freshness === "stale") return invalid("STALE_EXECUTION", "Stale execution is blocked.");
  if (input.readiness.conflict !== "none") return invalid("EXECUTION_CONFLICT", "Execution conflict is blocked.");
  return deepFreeze({ status: "blocked" as const, executable: false as const, authoritative: false as const });
}
