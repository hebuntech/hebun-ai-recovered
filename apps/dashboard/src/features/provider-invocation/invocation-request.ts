/*
 * invocation-request.ts — builds the normalized invocation request from a
 * routing decision + context. Deterministic; carries no secrets or credentials.
 */

import type { RoutingDecision } from "@/features/provider-routing";
import type {
  InvocationContext,
  InvocationRequest,
} from "@/features/provider-invocation/types";

export function buildInvocationRequest(
  decision: RoutingDecision,
  context: InvocationContext
): InvocationRequest {
  return {
    id: `ireq-${decision.requestId}`,
    providerId: decision.primaryProvider,
    capabilities: decision.matchedCapabilities,
    executionMode: context.executionMode,
    payloadSummary: `Invoke ${context.providerId ?? "no-provider"} for ${
      decision.matchedCapabilities.join(", ") || "unmatched capabilities"
    }.`,
    constraints: ["offline-only", "no-network", "no-credentials"],
    metadata: {
      routingDecisionId: decision.id,
      strategy: decision.strategy,
      simulation: String(context.simulation),
    },
  };
}
