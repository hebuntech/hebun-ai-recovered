import type { AgentAssignment, HandoffPlan, HumanAssignment } from "@/features/orchestration/types";
import type { GeneratedPlan } from "@/features/planning";

function ownerForTask(
  taskId: string,
  agentAssignments: AgentAssignment[],
  humanAssignments: HumanAssignment[]
) {
  const human = humanAssignments.find((assignment) => assignment.taskId === taskId);
  if (human) return { owner: human.role, kind: "human" as const };
  const agent = agentAssignments.find((assignment) => assignment.taskId === taskId);
  if (agent) return { owner: agent.agentRole, kind: "agent" as const };
  return { owner: "Unassigned", kind: "human" as const };
}

export function planHandoffs(
  plan: GeneratedPlan,
  agentAssignments: AgentAssignment[],
  humanAssignments: HumanAssignment[]
): HandoffPlan[] {
  return plan.dependencies
    .flatMap((dependency) =>
      dependency.dependsOn.map((sourceId, index) => {
        const from = ownerForTask(sourceId, agentAssignments, humanAssignments);
        const to = ownerForTask(dependency.taskId, agentAssignments, humanAssignments);
        const handoffType =
          from.kind === "agent" && to.kind === "agent"
            ? "agent-to-agent"
            : from.kind === "agent" && to.kind === "human"
              ? "agent-to-human"
              : from.kind === "human" && to.kind === "agent"
                ? "human-to-agent"
                : "human-to-human";

        return {
          id: `${plan.id}-handoff-${dependency.taskId}-${index + 1}`,
          fromTaskId: sourceId,
          toTaskId: dependency.taskId,
          fromOwner: from.owner,
          toOwner: to.owner,
          handoffType,
          requiredContext: [
            "Task completion status",
            "Required capability/tool trace",
            "Approval and risk context",
          ],
          acceptanceCriteria: [
            "Receiving owner acknowledges prerequisites",
            "Dependency output is attached to the task trace",
          ],
          riskLevel:
            handoffType === "agent-to-human" || handoffType === "human-to-agent"
              ? "medium"
              : "low",
        } satisfies HandoffPlan;
      })
    );
}
