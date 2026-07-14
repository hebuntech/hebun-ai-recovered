import type { HumanApprovalHistoryEntry } from "./types";

export function buildApprovalHistory(input: {
  inspected: number;
  pending: number;
  approved: number;
  rejected: number;
  changesRequested: number;
  blockedCommands: number;
  readyCommands: number;
  valid: boolean;
}): HumanApprovalHistoryEntry[] {
  return [
    {
      id: "approval-history-inspect",
      stage: "inspect",
      detail: `${input.inspected} approval-required command(s) inspected.`,
    },
    {
      id: "approval-history-policy",
      stage: "policy",
      detail: "Policy, priority, risk, validation, dependencies, and confidence evaluated deterministically.",
    },
    {
      id: "approval-history-resolve",
      stage: "resolve",
      detail: `${input.approved} approved · ${input.pending} pending · ${input.rejected} rejected · ${input.changesRequested} changes requested.`,
    },
    {
      id: "approval-history-validate",
      stage: "validate",
      detail: input.valid ? "Approval resolution validation passed." : "Approval resolution validation reported issues.",
    },
    {
      id: "approval-history-report",
      stage: "report",
      detail: `${input.blockedCommands} blocked command(s) · ${input.readyCommands} ready command(s).`,
    },
  ];
}
