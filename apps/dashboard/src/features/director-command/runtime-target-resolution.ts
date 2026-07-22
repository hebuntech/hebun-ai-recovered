import type { CommandCapability, DirectorCommandId } from "./types";
import type { RuntimeExecutionRequest, RuntimeTargetKind } from "./runtime-execution-contracts";
import { deepFreeze } from "./validation";

export const RUNTIME_TARGET_RESOLUTION_VERSION = "1.0.0";
export const RUNTIME_TARGET_RESOLUTION_SOURCES = ["registry", "static-architecture", "unresolved"] as const;
export type RuntimeTargetResolutionSource = (typeof RUNTIME_TARGET_RESOLUTION_SOURCES)[number];

export const RUNTIME_TARGET_RESOLUTION_ERROR_CODES = [
  "TARGET_NOT_RESOLVABLE", "AMBIGUOUS_TARGET", "UNKNOWN_TARGET_FAMILY", "INVALID_TARGET_DESCRIPTOR",
  "COMMAND_TARGET_CONFLICT", "CAPABILITY_TARGET_CONFLICT", "UNSUPPORTED_TARGET_FAMILY", "RESOLUTION_SOURCE_INVALID",
] as const;
export type RuntimeTargetResolutionErrorCode = (typeof RUNTIME_TARGET_RESOLUTION_ERROR_CODES)[number];

export interface RuntimeTargetResolutionError {
  readonly code: RuntimeTargetResolutionErrorCode;
  readonly message: string;
}

export interface CanonicalRuntimeTarget {
  readonly targetFamily: RuntimeTargetKind;
  readonly canonicalTargetId: string;
  readonly sectionId: string;
  readonly commandFamily: "agent" | "workflow" | "observability";
  readonly requiredCapability: CommandCapability;
  readonly resolutionVersion: typeof RUNTIME_TARGET_RESOLUTION_VERSION;
  readonly resolutionSource: "registry" | "static-architecture";
  readonly executable: false;
  readonly authoritative: false;
}

export type RuntimeTargetResolutionResult =
  | { readonly status: "resolved"; readonly target: CanonicalRuntimeTarget; readonly executable: false; readonly authoritative: false }
  | { readonly status: "unresolved" | "unsupported" | "invalid"; readonly error: RuntimeTargetResolutionError; readonly executable: false; readonly authoritative: false };

export interface RuntimeTargetResolutionMapping {
  readonly targetFamily: RuntimeTargetKind;
  readonly commandFamily: CanonicalRuntimeTarget["commandFamily"];
  readonly requiredCapability: CommandCapability;
  readonly resolutionSource: "static-architecture";
}

/** Every current command maps to exactly one target family; no live discovery is involved. */
export const RUNTIME_TARGET_RESOLUTION_MAPPING: Readonly<Record<DirectorCommandId, RuntimeTargetResolutionMapping>> = deepFreeze({
  "agent.restart": { targetFamily: "agent", commandFamily: "agent", requiredCapability: "agent.lifecycle", resolutionSource: "static-architecture" },
  "workflow.retry": { targetFamily: "workflow", commandFamily: "workflow", requiredCapability: "workflow.recovery", resolutionSource: "static-architecture" },
  "workflow.pause": { targetFamily: "workflow", commandFamily: "workflow", requiredCapability: "workflow.lifecycle", resolutionSource: "static-architecture" },
  "workflow.resume": { targetFamily: "workflow", commandFamily: "workflow", requiredCapability: "workflow.lifecycle", resolutionSource: "static-architecture" },
  "diagnostics.re-evaluate": { targetFamily: "diagnostics", commandFamily: "observability", requiredCapability: "observability.reevaluate", resolutionSource: "static-architecture" },
  "monitoring.refresh": { targetFamily: "monitoring", commandFamily: "observability", requiredCapability: "observability.reevaluate", resolutionSource: "static-architecture" },
});

export function createRuntimeTargetResolutionError(
  code: RuntimeTargetResolutionErrorCode,
  message: string,
): RuntimeTargetResolutionError {
  return deepFreeze({ code, message });
}

export function unresolvedRuntimeTargetResolution(
  code: RuntimeTargetResolutionErrorCode,
  message: string,
): RuntimeTargetResolutionResult {
  return deepFreeze({ status: "unresolved" as const, error: createRuntimeTargetResolutionError(code, message), executable: false as const, authoritative: false as const });
}

export type RuntimeTargetResolutionInput = RuntimeExecutionRequest;
