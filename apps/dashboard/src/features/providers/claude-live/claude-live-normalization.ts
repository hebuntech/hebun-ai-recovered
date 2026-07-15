import type {
  ClaudeLiveRequest,
  ClaudeLiveResponse,
} from "@/features/providers/claude-live/types";

export function normalizeClaudeLiveRequest(
  request: ClaudeLiveRequest
): ClaudeLiveRequest {
  return {
    ...request,
    mode: request.mode === "Live Eligible" ? "Dry Run" : request.mode,
    input: request.input.trim(),
    constraints: Array.from(
      new Set([...request.constraints, "no-live-provider-call", "simulation-fallback-required"])
    ),
    temperature: Math.min(1, Math.max(0, request.temperature)),
  };
}

export function normalizeClaudeLiveResponse(
  response: ClaudeLiveResponse
): ClaudeLiveResponse {
  return {
    ...response,
    warnings: Array.from(
      new Set([...response.warnings, "No Claude provider call was performed."])
    ),
    simulationFallbackUsed: true,
  };
}
