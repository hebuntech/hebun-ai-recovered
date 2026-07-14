import { approvals } from "@/features/approvals/mock";
import type {
  AgentProjectionSourceRecord,
  AgentWorkloadProfile,
  WorkflowProjectionSourceRecord,
} from "./types";

function workloadState(score: number): AgentWorkloadProfile["state"] {
  if (score >= 85) return "overloaded";
  if (score >= 65) return "loaded";
  if (score >= 35) return "balanced";
  return "light";
}

export const AgentWorkloadService = {
  buildWorkloadProfile(
    agent: AgentProjectionSourceRecord,
    workflows: WorkflowProjectionSourceRecord[],
  ): AgentWorkloadProfile {
    const pendingApprovals = approvals.filter((approval) => approval.requestedBy === agent.name).length;
    const activeWorkCount = workflows.filter((workflow) => workflow.status === "running").length;
    const utilizationScore = Math.max(
      0,
      Math.min(
        100,
        Math.round(agent.tasksToday * 1.6 + activeWorkCount * 7 + pendingApprovals * 9),
      ),
    );

    return {
      tasksToday: agent.tasksToday,
      activeWorkCount,
      workflowCount: workflows.length,
      pendingApprovals,
      utilizationScore,
      state: workloadState(utilizationScore),
      summary: `${agent.tasksToday} tasks today · ${activeWorkCount} active workflows · ${pendingApprovals} pending approvals`,
    };
  },
};
