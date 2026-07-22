import type { CanonicalRuntimeTarget } from "./runtime-target-resolution";
import { RuntimeAdapterRegistry } from "./runtime-adapter-registry";
import { runtimeAdapterError, type RuntimeAdapterSelectionResult } from "./runtime-adapter-framework";
import { deepFreeze } from "./validation";

/** Deterministic metadata selection; it never constructs or invokes an adapter. */
export function selectRuntimeAdapter(input: { readonly target: CanonicalRuntimeTarget; readonly registry: RuntimeAdapterRegistry }): RuntimeAdapterSelectionResult {
  if (!Object.isFrozen(input.target) || input.target.executable !== false || input.target.authoritative !== false) {
    return deepFreeze({ status: "invalid" as const, error: runtimeAdapterError("INVALID_ADAPTER_DESCRIPTOR", "Canonical target is invalid."), executable: false as const, authoritative: false as const });
  }
  const candidates = input.registry.forTargetFamily(input.target.targetFamily);
  if (candidates.length === 0) return deepFreeze({ status: "unsupported" as const, error: runtimeAdapterError("ADAPTER_NOT_FOUND", "No adapter family supports this target."), executable: false as const, authoritative: false as const });
  if (candidates.length !== 1) return deepFreeze({ status: "invalid" as const, error: runtimeAdapterError("AMBIGUOUS_ADAPTER", "Multiple adapters support this target."), executable: false as const, authoritative: false as const });
  const descriptor = candidates[0]!;
  if (descriptor.adapterFamily !== input.target.targetFamily) return deepFreeze({ status: "invalid" as const, error: runtimeAdapterError("ADAPTER_TARGET_MISMATCH", "Adapter family does not match target family."), executable: false as const, authoritative: false as const });
  if (!descriptor.supportedCommandFamilies.includes(input.target.commandFamily)) return deepFreeze({ status: "invalid" as const, error: runtimeAdapterError("ADAPTER_FAMILY_MISMATCH", "Adapter does not support the command family."), executable: false as const, authoritative: false as const });
  if (!descriptor.capabilityRequirements.includes(input.target.requiredCapability)) return deepFreeze({ status: "invalid" as const, error: runtimeAdapterError("ADAPTER_CAPABILITY_MISMATCH", "Adapter does not support the required capability."), executable: false as const, authoritative: false as const });
  if (descriptor.availability !== "available") return deepFreeze({ status: "unavailable" as const, error: runtimeAdapterError("ADAPTER_UNAVAILABLE", "No concrete Runtime adapter is available."), executable: false as const, authoritative: false as const });
  return deepFreeze({ status: "selected" as const, descriptor, executable: false as const, authoritative: false as const });
}
