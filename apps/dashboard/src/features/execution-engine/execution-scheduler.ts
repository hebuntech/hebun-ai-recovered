import type { CommandPlan } from "@/features/execution-bridge";
import type { CommandCandidate } from "@/features/execution-bridge";
import type { SimulatedExecutionCommand } from "./types";

function stageForCommand(
  commandId: string,
  executionOrder: CommandPlan["executionOrder"]
): { order: number; label: string } {
  const stage = executionOrder.find((item) => item.commandIds.includes(commandId));
  return {
    order: stage?.order ?? 0,
    label: stage?.label ?? "Unscheduled",
  };
}

export function buildExecutionQueue(plan: CommandPlan): SimulatedExecutionCommand[] {
  return plan.commandCandidates.map((candidate: CommandCandidate) => {
    const stage = stageForCommand(candidate.id, plan.executionOrder);
    return {
      id: `exec-${candidate.id}`,
      commandId: candidate.id,
      commandType: candidate.commandType,
      commandLabel: candidate.commandLabel,
      title: candidate.title,
      owner: candidate.owner,
      priority: candidate.priority,
      dependencies: candidate.dependencies,
      approvalGateIds: candidate.approvalGateIds,
      approvalState: candidate.approvalGateIds.length > 0 ? "pending" : "approved",
      estimatedDuration: candidate.estimatedDuration,
      stageOrder: stage.order,
      stageLabel: stage.label,
      state: "pending",
      lifecycle: ["pending"],
      failureReasons: [],
      missingResources: [],
      traceability: {
        commandId: candidate.id,
        commandType: candidate.commandType,
        taskId: candidate.traceability.taskId,
        taskTitle: candidate.traceability.taskTitle,
        decision: candidate.traceability.decision,
        reasoning: candidate.traceability.reasoning,
        context: candidate.traceability.context,
        memory: candidate.traceability.memory,
        knowledge: candidate.traceability.knowledge,
      },
    };
  });
}

