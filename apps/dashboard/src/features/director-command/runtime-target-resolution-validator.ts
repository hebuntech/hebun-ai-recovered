import type { DirectorCommandRegistry } from "./registry";
import type { RuntimeExecutionRequest } from "./runtime-execution-contracts";
import {
  RUNTIME_TARGET_RESOLUTION_MAPPING,
  createRuntimeTargetResolutionError,
  type CanonicalRuntimeTarget,
  type RuntimeTargetResolutionError,
  type RuntimeTargetResolutionResult,
} from "./runtime-target-resolution";
import { deepFreeze, validText } from "./validation";

export type RuntimeTargetResolutionValidation =
  | { readonly status: "valid"; readonly mapping: (typeof RUNTIME_TARGET_RESOLUTION_MAPPING)[keyof typeof RUNTIME_TARGET_RESOLUTION_MAPPING] }
  | { readonly status: "unresolved" | "unsupported" | "invalid"; readonly error: RuntimeTargetResolutionError };

function isDeeplyFrozen(value: unknown): boolean {
  if (!value || typeof value !== "object") return true;
  return Object.isFrozen(value) && Object.values(value).every(isDeeplyFrozen);
}

function invalid(code: RuntimeTargetResolutionError["code"], message: string): RuntimeTargetResolutionValidation {
  return deepFreeze({ status: "invalid" as const, error: createRuntimeTargetResolutionError(code, message) });
}

/** Validates deterministic target metadata without looking up a live Runtime object. */
export function validateRuntimeTargetResolutionRequest(input: {
  readonly request: RuntimeExecutionRequest;
  readonly registry: DirectorCommandRegistry;
}): RuntimeTargetResolutionValidation {
  const { request, registry } = input;
  if (!isDeeplyFrozen(request)) return invalid("INVALID_TARGET_DESCRIPTOR", "Target resolution requires a deeply immutable execution request.");
  if (!validText(request.target.targetId)) return deepFreeze({ status: "unresolved" as const, error: createRuntimeTargetResolutionError("TARGET_NOT_RESOLVABLE", "Canonical target identity is unavailable.") });
  const resolution = registry.resolve(request.commandId, request.commandVersion);
  if (resolution.status !== "resolved") return deepFreeze({ status: "unsupported" as const, error: createRuntimeTargetResolutionError("UNSUPPORTED_TARGET_FAMILY", "Command has no supported target resolution mapping.") });
  const mapping = RUNTIME_TARGET_RESOLUTION_MAPPING[resolution.command.commandId];
  if (!mapping) return deepFreeze({ status: "unsupported" as const, error: createRuntimeTargetResolutionError("UNSUPPORTED_TARGET_FAMILY", "Command family is unsupported for target resolution.") });
  if (request.target.kind !== mapping.targetFamily || request.target.expectedCommandFamily !== mapping.commandFamily) return invalid("COMMAND_TARGET_CONFLICT", "Target descriptor conflicts with the command mapping.");
  if (request.target.sectionId !== resolution.command.targetSectionId || request.envelope.sectionId !== resolution.command.targetSectionId) return invalid("COMMAND_TARGET_CONFLICT", "Target section conflicts with the command definition.");
  if (request.requiredRuntimeCapability !== mapping.requiredCapability || resolution.command.permission.capability !== mapping.requiredCapability) return invalid("CAPABILITY_TARGET_CONFLICT", "Target capability conflicts with the command definition.");
  if (mapping.resolutionSource !== "static-architecture") return invalid("RESOLUTION_SOURCE_INVALID", "Target resolution source is invalid.");
  return deepFreeze({ status: "valid" as const, mapping });
}

/** Ensures a returned target/result remains a frozen, non-authoritative projection. */
export function validateRuntimeTargetResolutionResult(result: RuntimeTargetResolutionResult): boolean {
  if (!isDeeplyFrozen(result) || result.executable !== false || result.authoritative !== false) return false;
  if (result.status !== "resolved") return Boolean(result.error && validText(result.error.code) && validText(result.error.message));
  const target: CanonicalRuntimeTarget = result.target;
  return (
    isDeeplyFrozen(target) && target.executable === false && target.authoritative === false &&
    validText(target.canonicalTargetId) && validText(target.sectionId) &&
    target.resolutionVersion === "1.0.0" &&
    (target.resolutionSource === "registry" || target.resolutionSource === "static-architecture")
  );
}
