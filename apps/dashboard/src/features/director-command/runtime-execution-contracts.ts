import type { CommandConfirmationModel } from "./safety";
import type { RuntimeCommandEnvelope } from "./runtime-command-bus";
import type { CommandCapability, CommandRollbackAvailability, DirectorCommandId } from "./types";
import { deepFreeze } from "./validation";

export const RUNTIME_TARGET_KINDS = ["agent", "workflow", "diagnostics", "monitoring"] as const;
export type RuntimeTargetKind = (typeof RUNTIME_TARGET_KINDS)[number];

export const RUNTIME_ADAPTER_FAMILIES = ["agent-runtime", "workflow-runtime", "observability-projection"] as const;
export type RuntimeAdapterFamily = (typeof RUNTIME_ADAPTER_FAMILIES)[number];

export const RUNTIME_EXECUTION_LIFECYCLE_STATES = [
  "received", "architecture_validated", "target_resolution_required", "authority_required",
  "policy_validated", "adapter_required", "future_execution",
] as const;
export type RuntimeExecutionLifecycleState = (typeof RUNTIME_EXECUTION_LIFECYCLE_STATES)[number];

export const RUNTIME_EXECUTION_ERROR_CODES = [
  "INVALID_EXECUTION_REQUEST", "MUTABLE_EXECUTION_REQUEST", "UNKNOWN_COMMAND", "COMMAND_VERSION_MISMATCH",
  "TARGET_KIND_MISMATCH", "TARGET_SECTION_MISMATCH", "CAPABILITY_MISMATCH", "EXECUTION_POLICY_MISSING",
  "ADAPTER_FAMILY_MISMATCH", "RUNTIME_AUTHORITY_UNAVAILABLE", "RUNTIME_CAPABILITY_DENIED", "UNSUPPORTED_COMMAND_FAMILY",
] as const;
export type RuntimeExecutionErrorCode = (typeof RUNTIME_EXECUTION_ERROR_CODES)[number];

export interface RuntimeExecutionError {
  readonly code: RuntimeExecutionErrorCode;
  readonly message: string;
}

export interface RuntimeTargetDescriptor {
  readonly kind: RuntimeTargetKind;
  readonly targetId: string;
  readonly sectionId: string;
  readonly expectedCommandFamily: "agent" | "workflow" | "observability";
}

export interface RuntimeExecutionPolicy {
  readonly executionAllowed: false;
  readonly adapterRequired: true;
  readonly idempotencyRequired: true;
  readonly concurrencyControlRequired: true;
  readonly timeoutRequired: true;
  readonly cancellationSupported: boolean;
  readonly rollbackClassification: CommandRollbackAvailability;
  readonly auditRequired: boolean;
  readonly observabilityRequired: true;
  readonly failClosed: true;
}

export interface RuntimeExecutionAuthority {
  readonly authorityId: string;
  readonly authorityVersion: string;
  readonly grantedRuntimeCapabilities: readonly CommandCapability[];
  readonly allowedAdapterFamilies: readonly RuntimeAdapterFamily[];
  readonly allowedTargetKinds: readonly RuntimeTargetKind[];
  readonly authoritative: boolean;
  readonly sourceClassification: "unavailable" | "future-runtime-authority";
}

/** The only authority available in this phase; it cannot grant execution. */
export const UNRESOLVED_RUNTIME_EXECUTION_AUTHORITY: RuntimeExecutionAuthority = deepFreeze({
  authorityId: "runtime-authority-unavailable",
  authorityVersion: "1.0.0",
  grantedRuntimeCapabilities: [],
  allowedAdapterFamilies: [],
  allowedTargetKinds: [],
  authoritative: false as const,
  sourceClassification: "unavailable" as const,
});

export interface RuntimeExecutionContext {
  readonly correlationId: string;
  readonly requestTimestamp: string;
  readonly requestOrigin: RuntimeCommandEnvelope["metadata"]["requestOrigin"];
}

/**
 * A copied, immutable architectural request. It remains non-authoritative and
 * non-executable until a future Runtime Authority and concrete adapter exist.
 */
export interface RuntimeExecutionRequest {
  readonly envelope: RuntimeCommandEnvelope;
  readonly commandId: DirectorCommandId;
  readonly commandVersion: string;
  readonly target: RuntimeTargetDescriptor;
  readonly requiredRuntimeCapability: CommandCapability;
  readonly executionPolicy: RuntimeExecutionPolicy;
  readonly adapterFamily: RuntimeAdapterFamily;
  readonly context: RuntimeExecutionContext;
  readonly confirmation: CommandConfirmationModel;
  readonly executable: false;
  readonly authoritative: false;
}

export interface RuntimeExecutionAdapterResult {
  readonly status: "accepted" | "rejected" | "unsupported" | "unavailable" | "failed";
  readonly error?: RuntimeExecutionError;
  readonly executed: false;
  readonly authoritative: false;
}

/** Future adapters receive only an already validated immutable request. */
export interface RuntimeExecutionAdapter {
  accept(request: RuntimeExecutionRequest): RuntimeExecutionAdapterResult;
}

/** Creates the only canonical immutable adapter-result representation. */
export function createRuntimeExecutionAdapterResult(input: {
  readonly status: RuntimeExecutionAdapterResult["status"];
  readonly error?: RuntimeExecutionError;
}): RuntimeExecutionAdapterResult {
  if (
    !(input.status === "accepted" || input.status === "rejected" || input.status === "unsupported" || input.status === "unavailable" || input.status === "failed") ||
    (input.error && (!(RUNTIME_EXECUTION_ERROR_CODES as readonly string[]).includes(input.error.code) || !input.error.message.trim()))
  ) {
    throw new TypeError("Invalid Runtime execution adapter result.");
  }
  return deepFreeze({
    status: input.status,
    ...(input.error ? { error: { ...input.error } } : {}),
    executed: false as const,
    authoritative: false as const,
  });
}

export interface RuntimeExecutionArchitecture {
  readonly targetKind: RuntimeTargetKind;
  readonly commandFamily: RuntimeTargetDescriptor["expectedCommandFamily"];
  readonly requiredRuntimeCapability: CommandCapability;
  readonly adapterFamily: RuntimeAdapterFamily;
}

export const RUNTIME_EXECUTION_ARCHITECTURE: Readonly<Record<DirectorCommandId, RuntimeExecutionArchitecture>> = deepFreeze({
  "agent.restart": { targetKind: "agent", commandFamily: "agent", requiredRuntimeCapability: "agent.lifecycle", adapterFamily: "agent-runtime" },
  "workflow.retry": { targetKind: "workflow", commandFamily: "workflow", requiredRuntimeCapability: "workflow.recovery", adapterFamily: "workflow-runtime" },
  "workflow.pause": { targetKind: "workflow", commandFamily: "workflow", requiredRuntimeCapability: "workflow.lifecycle", adapterFamily: "workflow-runtime" },
  "workflow.resume": { targetKind: "workflow", commandFamily: "workflow", requiredRuntimeCapability: "workflow.lifecycle", adapterFamily: "workflow-runtime" },
  "diagnostics.re-evaluate": { targetKind: "diagnostics", commandFamily: "observability", requiredRuntimeCapability: "observability.reevaluate", adapterFamily: "observability-projection" },
  "monitoring.refresh": { targetKind: "monitoring", commandFamily: "observability", requiredRuntimeCapability: "observability.reevaluate", adapterFamily: "observability-projection" },
});
