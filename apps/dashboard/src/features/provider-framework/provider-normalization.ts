import type { AdapterError } from "@/features/adapters";
import type { NormalizedRequest, NormalizedResponse } from "@/features/provider-framework/types";

/*
 * provider-normalization.ts — deterministic normalization functions the
 * ProviderAdapter contract uses. Requests/responses are already in canonical
 * shape here; normalization enforces defaults and trims provider-specifics.
 */

export function normalizeRequest(input: NormalizedRequest): NormalizedRequest {
  return {
    ...input,
    executionMode: input.executionMode ?? "simulation",
    constraints: input.constraints ?? [],
    metadata: input.metadata ?? {},
  };
}

export function normalizeResponse(input: NormalizedResponse): NormalizedResponse {
  return {
    ...input,
    artifacts: input.artifacts ?? [],
    warnings: input.warnings ?? [],
    errors: input.errors ?? [],
    events: input.events ?? [],
  };
}

export function normalizeError(error: AdapterError): AdapterError {
  return { ...error };
}
