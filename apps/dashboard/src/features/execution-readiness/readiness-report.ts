import type { ExecutionReadinessCheck, ExecutionReadinessReport, ExecutionReadinessSummary } from "./types";
import type { HumanApprovalResult } from "@/features/human-approval";

function missingApprovals(result: HumanApprovalResult): string[] {
  return result.decisions
    .filter((decision) => decision.status === "pending" || decision.status === "changes-requested")
    .map((decision) => `${decision.commandLabel}: ${decision.reason}`);
}

function blockedCommands(result: HumanApprovalResult): string[] {
  return result.simulation.queue.items
    .filter((item) => ["blocked", "failed"].includes(item.state))
    .map(
      (item) =>
        `${item.commandLabel}: ${item.blockingReason ?? item.failureReasons[0] ?? item.state}`
    );
}

function failedValidations(result: HumanApprovalResult): string[] {
  return [
    ...result.simulation.validation.issues.map((issue) => `${issue.code}: ${issue.message}`),
    ...result.validation.issues,
  ];
}

function dependencyIssues(result: HumanApprovalResult): string[] {
  const structural = result.simulation.validation.issues
    .filter(
      (issue) => issue.code === "invalid-dependency" || issue.code === "circular-dependency"
    )
    .map((issue) => issue.message);
  const queued = result.simulation.queue.items
    .filter((item) => item.state === "waiting-dependencies")
    .map(
      (item) =>
        `${item.commandLabel}: ${item.blockingReason ?? "Waiting for prerequisite commands."}`
    );
  return [...structural, ...queued];
}

function policyIssues(result: HumanApprovalResult): string[] {
  return result.decisions
    .filter((decision) => decision.policySignals.length > 0 && decision.status !== "approved")
    .map((decision) => `${decision.commandLabel}: ${decision.reason}`);
}

function warnings(result: HumanApprovalResult, summary: ExecutionReadinessSummary): string[] {
  const items: string[] = [];

  if (result.planning.decision.confidence.score < 80) {
    items.push(
      `Confidence is ${result.planning.decision.confidence.score}; dispatch remains conservative below 80.`
    );
  }
  if (result.planning.decision.constraints.policies.length > 0) {
    items.push(
      `${result.planning.decision.constraints.policies.length} active policy constraint(s) are influencing readiness.`
    );
  }
  if (summary.commandReadiness < 100) {
    items.push(`${summary.commandReadiness}% of commands are currently dispatch-ready.`);
  }
  if (summary.dependencyReadiness < 100) {
    items.push(`${summary.dependencyReadiness}% of command dependencies are satisfied.`);
  }

  return items;
}

function recommendations(checks: ExecutionReadinessCheck[]): string[] {
  return checks
    .filter((check) => !check.passed)
    .map((check) => check.recommendation)
    .slice(0, 6);
}

export function buildReadinessReport(input: {
  result: HumanApprovalResult;
  checks: ExecutionReadinessCheck[];
  summary: ExecutionReadinessSummary;
}): ExecutionReadinessReport {
  const blockingIssues = input.checks
    .filter((check) => !check.passed)
    .map((check) => `${check.label}: ${check.detail}`);

  return {
    readinessScore: input.summary.score,
    status: input.summary.status,
    blockingIssues,
    warnings: warnings(input.result, input.summary),
    recommendations: recommendations(input.checks),
    missingApprovals: missingApprovals(input.result),
    blockedCommands: blockedCommands(input.result),
    failedValidations: failedValidations(input.result),
    dependencyIssues: dependencyIssues(input.result),
    policyIssues: policyIssues(input.result),
    estimatedDispatchReadiness: input.summary.estimatedDispatchReadiness,
  };
}
