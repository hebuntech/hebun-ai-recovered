import { liveBlockedErrors } from "@/features/providers/claude-live/claude-live-errors";
import type {
  ClaudeLiveAuditRecord,
  ClaudeLiveDryRunResult,
  ClaudeLiveEligibility,
  ClaudeLiveResponse,
  ClaudeLiveSimulationFallback,
} from "@/features/providers/claude-live/types";

const EPOCH = "2025-01-01T00:00:00.000Z";

export function buildClaudeLiveResponse(input: {
  id: string;
  eligibility: ClaudeLiveEligibility;
  dryRun: ClaudeLiveDryRunResult;
  simulationFallback: ClaudeLiveSimulationFallback;
  audit: ClaudeLiveAuditRecord[];
}): ClaudeLiveResponse {
  const { id, eligibility, dryRun, simulationFallback, audit } = input;
  const blocked = !eligibility.liveEligible;

  return {
    id,
    status: blocked ? "live-blocked" : "dry-run",
    mode: eligibility.mode,
    summary: blocked
      ? "Claude live path is blocked, so the foundation returns the dry-run result plus deterministic simulation fallback."
      : "Claude live path is structurally eligible, but this phase still returns a dry-run-only foundation response.",
    output: blocked ? simulationFallback.output : dryRun.summary,
    usageEstimate: dryRun.usageEstimate,
    latencyEstimate: dryRun.estimatedLatencyMs,
    warnings: [
      "Dry Run is the default execution mode.",
      "Simulation fallback is mandatory.",
      "No Claude API call is performed in this phase.",
    ],
    errors: liveBlockedErrors(eligibility.reasons),
    events: [
      { label: "request", detail: "Claude live request normalized.", at: EPOCH },
      { label: "dry-run", detail: dryRun.summary, at: EPOCH },
      { label: "fallback", detail: simulationFallback.summary, at: EPOCH },
    ],
    telemetry: dryRun.expectedTelemetry,
    audit,
    simulationFallbackUsed: true,
    liveBlockedReasons: eligibility.reasons,
    createdAt: EPOCH,
  };
}
