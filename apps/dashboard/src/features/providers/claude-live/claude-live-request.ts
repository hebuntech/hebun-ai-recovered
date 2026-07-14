import { claudeSimulationProfile } from "@/features/providers/claude";
import { claudeLiveConfig } from "@/features/providers/claude-live/claude-live-config";
import type { ClaudeLiveReferenceChain, ClaudeLiveRequest } from "@/features/providers/claude-live/types";

export function buildClaudeLiveRequest(chain: ClaudeLiveReferenceChain): ClaudeLiveRequest {
  const sampleRequest = claudeSimulationProfile.sampleRequest;

  return {
    id: `claude-live-${chain.requestId ?? "summarization"}`,
    capability: "summarization",
    mode: claudeLiveConfig.defaultMode,
    input:
      "Summarize the current Hebun AI operating posture for the Director in one concise executive paragraph.",
    systemInstructions:
      sampleRequest.systemInstructions ||
      "Produce a concise, executive-safe summary with no external side effects.",
    constraints: [
      ...sampleRequest.constraints,
      "dry-run-first",
      "activation-gated",
      "simulation-fallback-required",
    ],
    outputFormat: "text",
    maxTokens: claudeLiveConfig.defaultMaxTokens,
    temperature: claudeLiveConfig.defaultTemperature,
    metadata: {
      providerId: chain.providerId,
      capability: "summarization",
      source: "claude-live-foundation",
      requestId: chain.requestId ?? "unavailable",
    },
    activationDecisionId: chain.activationDecisionId,
    invocationId: chain.invocationId,
    runtimeDecisionId: chain.runtimeDecisionId,
  };
}
