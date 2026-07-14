import type { HumanApprovalResult, HumanApprovalTelemetry } from "./types";

export function buildApprovalTelemetry(input: {
  decisions: HumanApprovalResult["decisions"];
  blockedCommands: number;
  readyCommands: number;
  historyCount: number;
}): HumanApprovalTelemetry {
  return {
    approvalsInspected: input.decisions.length,
    approvalsPending: input.decisions.filter((item) => item.status === "pending").length,
    approvalsApproved: input.decisions.filter((item) => item.status === "approved").length,
    approvalsRejected: input.decisions.filter((item) => item.status === "rejected").length,
    approvalsChangesRequested: input.decisions.filter((item) => item.status === "changes-requested").length,
    blockedCommands: input.blockedCommands,
    readyCommands: input.readyCommands,
    historyCount: input.historyCount,
  };
}

