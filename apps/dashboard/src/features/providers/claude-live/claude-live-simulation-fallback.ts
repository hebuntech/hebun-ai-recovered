import type {
  ClaudeLiveRequest,
  ClaudeLiveSimulationFallback,
} from "@/features/providers/claude-live/types";

export function buildClaudeLiveSimulationFallback(
  request: ClaudeLiveRequest
): ClaudeLiveSimulationFallback {
  return {
    prepared: true,
    summary: "Deterministic simulation fallback is prepared for the summarization capability.",
    output: `Simulation fallback summary for ${request.metadata.requestId ?? "the current request"}: Hebun AI remains in dry-run-first mode, so Claude live integration stops at request preparation, activation validation, and audit generation.`,
  };
}
