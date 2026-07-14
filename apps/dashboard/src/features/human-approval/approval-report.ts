import type { ApprovalDecision, HumanApprovalReport, HumanApprovalSummary } from "./types";

function bottlenecks(decisions: ApprovalDecision[]): string[] {
  const items = decisions
    .filter((decision) => decision.status !== "approved")
    .map((decision) => `${decision.commandLabel}: ${decision.reason}`);
  return items.slice(0, 5);
}

export function buildApprovalSummary(input: {
  decisions: ApprovalDecision[];
  blockedCommands: number;
  readyCommands: number;
}): HumanApprovalSummary {
  const pending = input.decisions.filter((item) => item.status === "pending").length;
  const approved = input.decisions.filter((item) => item.status === "approved").length;
  const rejected = input.decisions.filter((item) => item.status === "rejected").length;
  const changesRequested = input.decisions.filter((item) => item.status === "changes-requested").length;

  return {
    totalApprovals: input.decisions.length,
    pending,
    approved,
    rejected,
    changesRequested,
    blockedCommands: input.blockedCommands,
    readyCommands: input.readyCommands,
    readiness:
      rejected > 0 || input.blockedCommands > 0
        ? "blocked"
        : pending > 0 || changesRequested > 0
          ? "approval-required"
          : "ready",
  };
}

export function buildApprovalReport(input: {
  decisions: ApprovalDecision[];
  summary: HumanApprovalSummary;
}): HumanApprovalReport {
  return {
    approvalPipeline: `${input.summary.totalApprovals} approval decision(s) resolved from the simulated execution queue.`,
    readinessSummary: `${input.summary.readyCommands} ready · ${input.summary.pending} pending · ${input.summary.rejected} rejected · ${input.summary.changesRequested} changes requested.`,
    bottlenecks: bottlenecks(input.decisions),
  };
}
