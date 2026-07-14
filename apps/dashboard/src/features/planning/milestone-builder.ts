import type { GovernanceResult } from "@/features/policy";
import type { PlanMilestone, PlanningTimelineItem } from "@/features/planning/types";

export function createMilestones(
  timeline: PlanningTimelineItem[],
  governance: GovernanceResult
): PlanMilestone[] {
  const first = timeline[0];
  const middle = timeline[Math.max(1, Math.floor(timeline.length / 2))];
  const last = timeline[timeline.length - 1];

  return [
    {
      id: `${governance.id}-ms-1`,
      title: "Planning scope aligned",
      detail: "Goal boundary, governance posture, and reasoning references are attached to the plan.",
      dueDate: first.endDate,
      owner: "Planning Engine",
      status: "on-track",
    },
    {
      id: `${governance.id}-ms-2`,
      title: "Control-aware work sequence ready",
      detail: "Dependencies, resource allocation, and approval checkpoints are explicit.",
      dueDate: middle.endDate,
      owner: "Governance Core",
      status: governance.governanceDecision.status === "approval-required" ? "watch" : "on-track",
    },
    {
      id: `${governance.id}-ms-3`,
      title: "Execution blueprint published",
      detail: "Reusable blueprint is ready for a future orchestrator or execution engine.",
      dueDate: last.endDate,
      owner: "Planning Engine",
      status:
        governance.riskAssessment.level === "critical" ? "at-risk" : "on-track",
    },
  ];
}
