import type { WorkflowProgressProfile, WorkflowProjectionSourceRecord } from "./types";

function baseCompletionRate(workflow: WorkflowProjectionSourceRecord): number {
  if (workflow.status === "failed") return 32;
  if (workflow.status === "running") return 68;
  if (workflow.status === "scheduled") return 56;
  if (workflow.status === "idle") return 82;
  return 50;
}

export const WorkflowProgressService = {
  buildProgress(workflow: WorkflowProjectionSourceRecord): WorkflowProgressProfile {
    const completionRate = Math.max(
      10,
      Math.min(100, Math.round(baseCompletionRate(workflow) + workflow.successRate * 0.12 + Math.min(workflow.runsToday, 20) * 0.6)),
    );

    return {
      completionRate,
      successRate: workflow.successRate,
      runsToday: workflow.runsToday,
      summary: `${completionRate}% progress · ${workflow.runsToday} runs today · ${workflow.successRate}% success`,
    };
  },
};
