/*
 * invocation-context.ts — resolves execution mode and builds the immutable
 * invocation context from a routing decision. Provider metadata is referenced
 * from the Provider Matrix catalog, never duplicated.
 */

import { getCatalogEntry } from "@/features/provider-matrix";
import type { RoutingDecision } from "@/features/provider-routing";
import type {
  InvocationContext,
  InvocationExecutionMode,
} from "@/features/provider-invocation/types";

/** map matrix catalog execution mode → invocation execution mode. */
export function resolveExecutionMode(decision: RoutingDecision): InvocationExecutionMode {
  if (decision.approvalRequirement.required) return "Approval Required";
  if (decision.simulationMode) return "Simulation";

  const entry = decision.primaryProvider ? getCatalogEntry(decision.primaryProvider) : undefined;
  switch (entry?.executionMode) {
    case "Dry Run":
      return "Dry Run";
    case "Read Only":
      return "Read Only";
    case "Planning Only":
      return "Planning";
    case "Approval Required":
      return "Approval Required";
    case "Future Live":
      return "Future Live";
    default:
      return "Simulation";
  }
}

export function buildInvocationContext(decision: RoutingDecision): InvocationContext {
  const entry = decision.primaryProvider ? getCatalogEntry(decision.primaryProvider) : undefined;
  const executionMode = resolveExecutionMode(decision);
  return {
    invocationId: `inv-${decision.requestId}`,
    requestId: decision.requestId,
    routingDecisionId: decision.id,
    providerId: decision.primaryProvider,
    providerType: entry?.providerType ?? null,
    executionMode,
    simulation: executionMode === "Simulation" || decision.simulationMode,
    confidence: decision.confidence,
  };
}
