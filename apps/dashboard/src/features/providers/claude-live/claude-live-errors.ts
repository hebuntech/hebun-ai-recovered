import type { ClaudeLiveError, ClaudeLiveErrorCode } from "@/features/providers/claude-live/types";

export function createClaudeLiveError(
  code: ClaudeLiveErrorCode,
  message: string,
  recoverable = true
): ClaudeLiveError {
  return { code, message, recoverable };
}

export function liveBlockedErrors(reasons: string[]): ClaudeLiveError[] {
  return reasons.length === 0
    ? []
    : reasons.map((reason) =>
        createClaudeLiveError("live_blocked", reason, false)
      );
}
