import type { DirectorCommandRegistry } from "./registry";
import type { RuntimeCommandEnvelope } from "./runtime-command-bus";
import {
  RUNTIME_EXECUTION_ARCHITECTURE,
  type RuntimeExecutionArchitecture,
  type RuntimeExecutionAuthority,
  type RuntimeExecutionError,
  type RuntimeExecutionErrorCode,
  type RuntimeExecutionPolicy,
  type RuntimeExecutionRequest,
  type RuntimeTargetDescriptor,
  UNRESOLVED_RUNTIME_EXECUTION_AUTHORITY,
} from "./runtime-execution-contracts";
import { deepFreeze, validText, validVersion } from "./validation";

export type RuntimeExecutionArchitectureValidation =
  | { readonly status: "blocked"; readonly lifecycle: "authority_required"; readonly request: RuntimeExecutionRequest; readonly error: RuntimeExecutionError }
  | { readonly status: "rejected"; readonly lifecycle: "received" | "architecture_validated" | "policy_validated"; readonly error: RuntimeExecutionError };

function failure(code: RuntimeExecutionErrorCode, message: string): RuntimeExecutionError {
  return deepFreeze({ code, message });
}

function isDeeplyFrozen(value: unknown): boolean {
  if (!value || typeof value !== "object") return true;
  return Object.isFrozen(value) && Object.values(value).every(isDeeplyFrozen);
}

function copyEnvelope(envelope: RuntimeCommandEnvelope): RuntimeCommandEnvelope {
  return deepFreeze({
    ...envelope,
    metadata: { ...envelope.metadata },
    confirmation: { ...envelope.confirmation, confirmationRequirements: [...envelope.confirmation.confirmationRequirements] },
    safety: { ...envelope.safety },
    authority: { ...envelope.authority, capabilities: [...envelope.authority.capabilities] },
  });
}

function policy(envelope: RuntimeCommandEnvelope): RuntimeExecutionPolicy {
  return deepFreeze({
    executionAllowed: false as const,
    adapterRequired: true as const,
    idempotencyRequired: true as const,
    concurrencyControlRequired: true as const,
    timeoutRequired: true as const,
    cancellationSupported: envelope.commandId === "workflow.pause" || envelope.commandId === "workflow.resume",
    rollbackClassification: envelope.safety.rollbackAvailability,
    auditRequired: envelope.safety.auditRequired,
    observabilityRequired: true as const,
    failClosed: true as const,
  });
}

function target(envelope: RuntimeCommandEnvelope, architecture: RuntimeExecutionArchitecture): RuntimeTargetDescriptor {
  return deepFreeze({
    kind: architecture.targetKind,
    targetId: envelope.recordId,
    sectionId: envelope.sectionId,
    expectedCommandFamily: architecture.commandFamily,
  });
}

/** Creates a copied contract from a prior immutable envelope; it never resolves a target. */
export function createRuntimeExecutionRequest(input: {
  readonly envelope: RuntimeCommandEnvelope;
  readonly registry: DirectorCommandRegistry;
}): RuntimeExecutionRequest {
  const { envelope, registry } = input;
  if (!isDeeplyFrozen(envelope) || envelope.executable !== false || envelope.authoritative !== false) {
    throw new TypeError("Runtime execution requests require an immutable non-authoritative envelope.");
  }
  const resolution = registry.resolve(envelope.commandId, envelope.metadata.commandVersion);
  if (resolution.status !== "resolved") throw new TypeError("Runtime execution requests require a registered command.");
  const architecture = RUNTIME_EXECUTION_ARCHITECTURE[resolution.command.commandId];
  if (!architecture) throw new TypeError("Runtime execution architecture is unavailable for this command.");
  return deepFreeze({
    envelope: copyEnvelope(envelope),
    commandId: resolution.command.commandId,
    commandVersion: resolution.command.version,
    target: target(envelope, architecture),
    requiredRuntimeCapability: architecture.requiredRuntimeCapability,
    executionPolicy: policy(envelope),
    adapterFamily: architecture.adapterFamily,
    context: {
      correlationId: envelope.metadata.correlationId,
      requestTimestamp: envelope.metadata.requestTimestamp,
      requestOrigin: envelope.metadata.requestOrigin,
    },
    confirmation: { ...envelope.confirmation, confirmationRequirements: [...envelope.confirmation.confirmationRequirements] },
    executable: false as const,
    authoritative: false as const,
  });
}

/** Pure, fail-closed architectural validation; it never contacts an adapter. */
export function validateRuntimeExecutionArchitecture(input: {
  readonly request: RuntimeExecutionRequest;
  readonly registry: DirectorCommandRegistry;
  readonly authority?: RuntimeExecutionAuthority;
}): RuntimeExecutionArchitectureValidation {
  const { request, registry } = input;
  if (!isDeeplyFrozen(request)) return deepFreeze({ status: "rejected", lifecycle: "received", error: failure("MUTABLE_EXECUTION_REQUEST", "Execution request must be deeply immutable.") });
  if (!validText(request.commandId) || !validVersion(request.commandVersion) || request.executable !== false || request.authoritative !== false) {
    return deepFreeze({ status: "rejected", lifecycle: "received", error: failure("INVALID_EXECUTION_REQUEST", "Execution request is structurally invalid.") });
  }
  const resolution = registry.resolve(request.commandId, request.commandVersion);
  if (resolution.status !== "resolved") return deepFreeze({ status: "rejected", lifecycle: "received", error: failure("UNKNOWN_COMMAND", "Command is not registered.") });
  const definition = resolution.command;
  if (request.envelope.metadata.commandVersion !== definition.version) return deepFreeze({ status: "rejected", lifecycle: "architecture_validated", error: failure("COMMAND_VERSION_MISMATCH", "Command version does not match the envelope.") });
  const architecture = RUNTIME_EXECUTION_ARCHITECTURE[definition.commandId];
  if (!architecture) return deepFreeze({ status: "rejected", lifecycle: "architecture_validated", error: failure("UNSUPPORTED_COMMAND_FAMILY", "Command family has no Runtime execution architecture.") });
  if (request.target.kind !== architecture.targetKind || request.target.expectedCommandFamily !== architecture.commandFamily) return deepFreeze({ status: "rejected", lifecycle: "architecture_validated", error: failure("TARGET_KIND_MISMATCH", "Target kind does not match the command architecture.") });
  if (request.target.sectionId !== definition.targetSectionId || request.envelope.sectionId !== definition.targetSectionId) return deepFreeze({ status: "rejected", lifecycle: "architecture_validated", error: failure("TARGET_SECTION_MISMATCH", "Target section does not match the command definition.") });
  if (request.requiredRuntimeCapability !== architecture.requiredRuntimeCapability || request.requiredRuntimeCapability !== definition.permission.capability) return deepFreeze({ status: "rejected", lifecycle: "architecture_validated", error: failure("CAPABILITY_MISMATCH", "Runtime capability does not match the command definition.") });
  if (!request.executionPolicy || request.executionPolicy.executionAllowed !== false || request.executionPolicy.failClosed !== true || request.executionPolicy.adapterRequired !== true) return deepFreeze({ status: "rejected", lifecycle: "policy_validated", error: failure("EXECUTION_POLICY_MISSING", "Execution policy is incomplete or unsafe.") });
  if (request.adapterFamily !== architecture.adapterFamily) return deepFreeze({ status: "rejected", lifecycle: "policy_validated", error: failure("ADAPTER_FAMILY_MISMATCH", "Adapter family does not match the command architecture.") });
  const authority = input.authority ?? UNRESOLVED_RUNTIME_EXECUTION_AUTHORITY;
  if (!isDeeplyFrozen(authority) || authority.authoritative !== false || authority.sourceClassification !== "unavailable") {
    return deepFreeze({ status: "rejected", lifecycle: "policy_validated", error: failure("RUNTIME_AUTHORITY_UNAVAILABLE", "No trusted Runtime execution authority is available.") });
  }
  return deepFreeze({ status: "blocked", lifecycle: "authority_required", request, error: failure("RUNTIME_AUTHORITY_UNAVAILABLE", "No trusted Runtime execution authority is available.") });
}
