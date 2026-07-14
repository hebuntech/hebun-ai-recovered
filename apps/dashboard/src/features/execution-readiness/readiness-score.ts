import type { HumanApprovalResult } from "@/features/human-approval";
import type { ExecutionReadinessCheck, ExecutionReadinessSummary } from "./types";

function approvalReadiness(result: HumanApprovalResult): number {
  if (result.summary.totalApprovals === 0) return 100;
  return Math.round((result.summary.approved / result.summary.totalApprovals) * 100);
}

function commandReadiness(result: HumanApprovalResult): number {
  const total = result.simulation.queue.items.length;
  if (total === 0) return 100;
  const ready = result.simulation.queue.items.filter((item) =>
    ["ready", "completed", "skipped"].includes(item.state)
  ).length;
  return Math.round((ready / total) * 100);
}

function dependencyReadiness(result: HumanApprovalResult): number {
  const total = result.simulation.queue.items.length;
  if (total === 0) return 100;

  const byId = new Map(
    result.simulation.queue.items.map((item) => [item.commandId, item])
  );
  const satisfied = result.simulation.queue.items.filter((item) =>
    item.dependencies.every((dependencyId) => {
      const dependency = byId.get(dependencyId);
      return dependency ? ["completed", "skipped"].includes(dependency.state) : false;
    })
  ).length;

  return Math.round((satisfied / total) * 100);
}

function estimatedDispatchReadiness(score: number, blockers: number): string {
  if (blockers > 0) return "Not ready for live dispatch. Resolve blocking issues first.";
  if (score >= 90) return "Ready for live dispatch once the dispatch layer is enabled.";
  if (score >= 75) return "Nearly ready for live dispatch. Clear remaining warnings.";
  return "Not ready for live dispatch. Improve readiness before release.";
}

export function buildReadinessSummary(
  checks: ExecutionReadinessCheck[],
  result: HumanApprovalResult
): ExecutionReadinessSummary {
  const totalWeight = checks.reduce((sum, check) => sum + check.weight, 0);
  const score = totalWeight === 0
    ? 0
    : Math.round(
        (checks.filter((check) => check.passed).reduce((sum, check) => sum + check.weight, 0) /
          totalWeight) *
          100
      );
  const blockers = checks.filter((check) => !check.passed).length;
  const warnings = [
    result.planning.decision.confidence.score < 80,
    result.planning.decision.constraints.policies.length > 0,
    result.summary.changesRequested > 0,
    result.summary.pending > 0,
  ].filter(Boolean).length;

  return {
    score,
    status: blockers === 0 ? "ready" : "not-ready",
    approvalReadiness: approvalReadiness(result),
    commandReadiness: commandReadiness(result),
    dependencyReadiness: dependencyReadiness(result),
    blockers,
    warnings,
    estimatedDispatchReadiness: estimatedDispatchReadiness(score, blockers),
  };
}
