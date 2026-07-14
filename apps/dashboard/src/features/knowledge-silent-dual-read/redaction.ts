import { categorizeErrorByMessage } from "@/features/canonical-read-platform";
import type { KnowledgeSilentDualReadErrorCategory } from "./types";

export function categorizeKnowledgeSilentDualReadError(
  error: unknown,
): KnowledgeSilentDualReadErrorCategory {
  return categorizeErrorByMessage(
    error,
    [
      { match: "timeout", category: "timeout" },
      { match: "unavailable", category: "unavailable" },
      { match: "query", category: "query-failed" },
      { match: "config", category: "invalid-config" },
    ],
    "unknown",
  );
}
