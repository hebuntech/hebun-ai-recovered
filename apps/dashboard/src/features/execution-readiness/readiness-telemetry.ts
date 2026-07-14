import type { ExecutionReadinessTelemetry } from "./types";

export function buildReadinessTelemetry(input: {
  checksTotal: number;
  checksPassed: number;
  blockers: number;
  warnings: number;
  readinessScore: number;
  historyCount: number;
}): ExecutionReadinessTelemetry {
  return {
    checksTotal: input.checksTotal,
    checksPassed: input.checksPassed,
    checksFailed: input.checksTotal - input.checksPassed,
    blockingIssues: input.blockers,
    warnings: input.warnings,
    readinessScore: input.readinessScore,
    historyCount: input.historyCount,
  };
}
