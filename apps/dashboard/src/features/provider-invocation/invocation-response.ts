/*
 * invocation-response.ts — builds the deterministic EXPECTED response for an
 * invocation. This is the contract shape a provider must return; no real
 * execution or model output is produced.
 */

import { artifactsFor } from "@/features/provider-invocation/invocation-artifacts";
import type { RoutingDecision } from "@/features/provider-routing";
import type {
  InvocationContext,
  InvocationResponse,
} from "@/features/provider-invocation/types";

export function buildExpectedResponse(
  decision: RoutingDecision,
  context: InvocationContext
): InvocationResponse {
  const artifactKinds = artifactsFor(decision.matchedCapabilities).map((a) => a.kind);

  if (decision.blocked || !context.providerId) {
    return {
      requestId: decision.requestId,
      status: "blocked",
      summary: "No provider available; invocation cannot be prepared.",
      artifactKinds: [],
      finishReason: "no_provider",
      warnings: ["Routing produced no primary provider."],
    };
  }

  const status = context.executionMode === "Future Live" ? "planned" : "simulated";
  return {
    requestId: decision.requestId,
    status,
    summary: `${context.providerId} would return ${artifactKinds.join(", ")} for ${decision.matchedCapabilities.join(", ")}.`,
    artifactKinds,
    finishReason: context.executionMode === "Approval Required" ? "awaiting_approval" : "simulated_complete",
    warnings:
      context.executionMode === "Future Live"
        ? ["Future live execution is not enabled in this phase."]
        : [],
  };
}
