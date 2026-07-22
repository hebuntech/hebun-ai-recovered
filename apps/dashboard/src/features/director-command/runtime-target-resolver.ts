import type { DirectorCommandRegistry } from "./registry";
import type { RuntimeExecutionRequest } from "./runtime-execution-contracts";
import {
  RUNTIME_TARGET_RESOLUTION_VERSION,
  createRuntimeTargetResolutionError,
  type RuntimeTargetResolutionResult,
} from "./runtime-target-resolution";
import { validateRuntimeTargetResolutionRequest } from "./runtime-target-resolution-validator";
import { deepFreeze } from "./validation";

/** Pure deterministic resolver. It derives a target contract and never resolves a live Runtime object. */
export class RuntimeTargetResolver {
  readonly #registry: DirectorCommandRegistry;

  constructor(input: { readonly registry: DirectorCommandRegistry }) {
    this.#registry = input.registry;
    Object.freeze(this);
  }

  resolve(request: RuntimeExecutionRequest): RuntimeTargetResolutionResult {
    const validation = validateRuntimeTargetResolutionRequest({ request, registry: this.#registry });
    if (validation.status !== "valid") {
      return deepFreeze({
        status: validation.status,
        error: validation.error,
        executable: false as const,
        authoritative: false as const,
      });
    }
    const { mapping } = validation;
    if (!request.target.targetId) {
      return deepFreeze({
        status: "unresolved" as const,
        error: createRuntimeTargetResolutionError("TARGET_NOT_RESOLVABLE", "Canonical target identity is unavailable."),
        executable: false as const,
        authoritative: false as const,
      });
    }
    return deepFreeze({
      status: "resolved" as const,
      target: {
        targetFamily: mapping.targetFamily,
        canonicalTargetId: request.target.targetId,
        sectionId: request.target.sectionId,
        commandFamily: mapping.commandFamily,
        requiredCapability: mapping.requiredCapability,
        resolutionVersion: RUNTIME_TARGET_RESOLUTION_VERSION,
        resolutionSource: "registry" as const,
        executable: false as const,
        authoritative: false as const,
      },
      executable: false as const,
      authoritative: false as const,
    });
  }
}
