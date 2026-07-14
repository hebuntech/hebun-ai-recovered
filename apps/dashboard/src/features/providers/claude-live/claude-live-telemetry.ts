import type { ClaudeLiveTelemetry } from "@/features/providers/claude-live/types";

export function summarizeTelemetry(telemetry: ClaudeLiveTelemetry) {
  return [
    { label: "Mode", value: telemetry.mode },
    { label: "Capability", value: telemetry.capability },
    { label: "Requests", value: `${telemetry.requestCount}` },
    { label: "Dry Runs", value: `${telemetry.dryRunCount}` },
    { label: "Live Eligible", value: `${telemetry.liveEligibleCount}` },
    { label: "Live Blocked", value: `${telemetry.liveBlockedCount}` },
    { label: "Fallback", value: `${telemetry.simulationFallbackCount}` },
    { label: "Latency", value: `${telemetry.estimatedLatencyMs}ms` },
    { label: "Tokens", value: `${telemetry.estimatedTokenUsage}` },
    { label: "Audit", value: `${telemetry.auditCoverage}%` },
  ];
}
