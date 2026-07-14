import type {
  AdapterValidationResult,
  ExecutionAdapter,
  ExecutionRequest,
} from "@/features/adapters/types";

const CONTRACT_METHODS = [
  "supports",
  "initialize",
  "validate",
  "prepare",
  "execute",
  "pause",
  "resume",
  "cancel",
  "rollback",
  "shutdown",
  "health",
  "telemetry",
] as const;

/*
 * Validates that an adapter implements the full SDK contract and declares
 * at least one capability. Deterministic — no execution performed.
 */
export function validateAdapter(adapter: ExecutionAdapter): AdapterValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!adapter.metadata?.id) errors.push("Adapter metadata.id is required");
  if (!adapter.metadata?.version) errors.push("Adapter metadata.version is required");
  if (!adapter.capabilities?.length) errors.push("Adapter must declare at least one capability");

  for (const method of CONTRACT_METHODS) {
    if (typeof (adapter as unknown as Record<string, unknown>)[method] !== "function") {
      errors.push(`Missing contract method: ${method}()`);
    }
  }

  if (adapter.metadata && !adapter.metadata.deterministic) {
    warnings.push("Adapter is not marked deterministic");
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    summary: errors.length === 0 ? "Adapter satisfies the SDK contract" : "Adapter contract incomplete",
  };
}

export function validateRequest(request: ExecutionRequest): AdapterValidationResult {
  const errors: string[] = [];
  if (!request.id) errors.push("Request id is required");
  if (!request.capability) errors.push("Request capability is required");
  if (!request.action) errors.push("Request action is required");
  return {
    valid: errors.length === 0,
    errors,
    warnings: [],
    summary: errors.length === 0 ? "Request valid" : "Request invalid",
  };
}
