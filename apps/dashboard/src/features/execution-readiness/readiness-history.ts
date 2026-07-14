import type { ExecutionReadinessHistoryEntry } from "./types";

export function buildReadinessHistory(input: {
  inspected: number;
  blockers: number;
  score: number;
  valid: boolean;
  status: "ready" | "not-ready";
}): ExecutionReadinessHistoryEntry[] {
  return [
    {
      id: "readiness-history-inspect",
      stage: "inspect",
      detail: `${input.inspected} deterministic readiness check(s) inspected.`,
    },
    {
      id: "readiness-history-check",
      stage: "check",
      detail: `${input.blockers} blocking check(s) remain in the readiness gate.`,
    },
    {
      id: "readiness-history-score",
      stage: "score",
      detail: `Readiness score calculated deterministically at ${input.score}/100.`,
    },
    {
      id: "readiness-history-validate",
      stage: "validate",
      detail: input.valid
        ? "Readiness gate validation passed."
        : "Readiness gate validation reported issues.",
    },
    {
      id: "readiness-history-report",
      stage: "report",
      detail: `Execution plan marked ${input.status} for future live dispatch.`,
    },
  ];
}
