import type {
  ClaudeLiveDryRunResult,
  ClaudeLiveEligibility,
  ClaudeLiveRequest,
  ClaudeLiveTelemetry,
  ClaudeLiveUsageEstimate,
} from "@/features/providers/claude-live/types";

export function estimateUsage(request: ClaudeLiveRequest): ClaudeLiveUsageEstimate {
  const inputTokens = Math.max(120, Math.round(request.input.length / 4));
  const outputTokens = Math.min(request.maxTokens, 180);
  const totalTokens = inputTokens + outputTokens;

  return {
    inputTokens,
    outputTokens,
    totalTokens,
    estimatedCostUsd: Number((totalTokens * 0.000008).toFixed(4)),
  };
}

export function buildDryRunTelemetry(
  eligibility: ClaudeLiveEligibility,
  usage: ClaudeLiveUsageEstimate
): ClaudeLiveTelemetry {
  return {
    mode: eligibility.mode,
    capability: "summarization",
    requestCount: 1,
    dryRunCount: 1,
    liveEligibleCount: eligibility.liveEligible ? 1 : 0,
    liveBlockedCount: eligibility.liveEligible ? 0 : 1,
    simulationFallbackCount: eligibility.liveEligible ? 0 : 1,
    estimatedLatencyMs: 780,
    estimatedTokenUsage: usage.totalTokens,
    errorCount: eligibility.reasons.length,
    auditCoverage: 100,
  };
}

export function buildClaudeLiveDryRun(
  request: ClaudeLiveRequest,
  eligibility: ClaudeLiveEligibility
): ClaudeLiveDryRunResult {
  const usageEstimate = estimateUsage(request);
  const expectedTelemetry = buildDryRunTelemetry(eligibility, usageEstimate);

  return {
    status: eligibility.liveEligible ? "ready" : "blocked",
    summary: eligibility.liveEligible
      ? "Dry run completed. Request shape, activation state, and telemetry are ready for a future gated live promotion."
      : "Dry run completed. Live execution stays blocked, and simulation fallback remains the only safe path.",
    estimatedLatencyMs: expectedTelemetry.estimatedLatencyMs,
    usageEstimate,
    expectedTelemetry,
  };
}
