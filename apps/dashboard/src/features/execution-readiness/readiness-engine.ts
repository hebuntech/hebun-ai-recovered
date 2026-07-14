import type { HumanApprovalResult } from "@/features/human-approval";
import { buildReadinessChecks } from "./readiness-checks";
import { buildReadinessSummary } from "./readiness-score";
import { buildReadinessReport } from "./readiness-report";
import { validateExecutionReadiness } from "./readiness-validator";
import { buildReadinessHistory } from "./readiness-history";
import { buildReadinessTelemetry } from "./readiness-telemetry";
import type { ExecutionReadinessResult } from "./types";

export function buildExecutionReadiness(
  approval: HumanApprovalResult
): ExecutionReadinessResult {
  const checks = buildReadinessChecks(approval);
  const summary = buildReadinessSummary(checks, approval);
  const report = buildReadinessReport({
    result: approval,
    checks,
    summary,
  });
  const validation = validateExecutionReadiness({
    checks,
    summary,
    report,
  });
  const history = buildReadinessHistory({
    inspected: checks.length,
    blockers: summary.blockers,
    score: summary.score,
    valid: validation.valid,
    status: summary.status,
  });
  const telemetry = buildReadinessTelemetry({
    checksTotal: checks.length,
    checksPassed: checks.filter((check) => check.passed).length,
    blockers: summary.blockers,
    warnings: summary.warnings,
    readinessScore: summary.score,
    historyCount: history.length,
  });

  return {
    approval,
    checks,
    summary,
    validation,
    history,
    telemetry,
    report,
  };
}
