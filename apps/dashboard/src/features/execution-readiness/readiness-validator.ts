import type { ExecutionReadinessResult } from "./types";

export function validateExecutionReadiness(
  result: Pick<ExecutionReadinessResult, "checks" | "summary" | "report">
) {
  const issues: string[] = [];

  if (result.summary.score < 0 || result.summary.score > 100) {
    issues.push("Readiness score must stay within the 0-100 range.");
  }

  if (result.summary.blockers !== result.checks.filter((check) => !check.passed).length) {
    issues.push("Readiness blocker count does not match the failed check count.");
  }

  if (result.report.readinessScore !== result.summary.score) {
    issues.push("Readiness report score does not match the summary score.");
  }

  if (
    result.report.status !== result.summary.status ||
    (result.summary.status === "ready" && result.report.blockingIssues.length > 0)
  ) {
    issues.push("Readiness status and blocking issue counts are inconsistent.");
  }

  return {
    valid: issues.length === 0,
    issues,
  };
}
