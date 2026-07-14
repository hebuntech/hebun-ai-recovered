import type { RuntimeDecision } from "@/features/runtime-boundary";
import type { ActivationContext } from "@/features/runtime-activation/types";

export function buildActivationContext(runtimeDecision: RuntimeDecision): ActivationContext {
  return {
    runtimeDecisionId: runtimeDecision.id,
    requestId: runtimeDecision.requestId,
    providerId: runtimeDecision.providerId,
    providerType: runtimeDecision.providerType,
    sourceMode: runtimeDecision.sourceMode,
    runtimeMode: runtimeDecision.runtimeMode,
    confidence: runtimeDecision.confidence,
    simulationFallback: runtimeDecision.simulationFallback,
  };
}
