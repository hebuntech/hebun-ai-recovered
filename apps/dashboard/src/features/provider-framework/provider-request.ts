import type {
  AdapterCapabilityKind,
} from "@/features/adapters";
import type {
  NormalizedRequest,
  ProviderExecutionMode,
  ProviderTypeKind,
} from "@/features/provider-framework/types";

/*
 * provider-request.ts — builds normalized requests. Every provider receives
 * the same request shape regardless of category. Deterministic.
 */
export function buildNormalizedRequest(params: {
  requestId: string;
  providerType: ProviderTypeKind;
  executionMode?: ProviderExecutionMode;
  payloadSummary: string;
  capabilities: AdapterCapabilityKind[];
  constraints?: string[];
  metadata?: Record<string, string>;
}): NormalizedRequest {
  return {
    requestId: params.requestId,
    providerType: params.providerType,
    executionMode: params.executionMode ?? "simulation",
    payloadSummary: params.payloadSummary,
    capabilities: params.capabilities,
    constraints: params.constraints ?? [],
    metadata: params.metadata ?? {},
  };
}
