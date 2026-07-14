import { getCommandDefinition } from "@/features/commands/registry";
import type { CommandType } from "@/features/commands/pipeline";
import type { ApprovalGate, ExecutionPlan, PlannedTask } from "@/features/task-planning";
import type { CommandCandidate } from "./types";

function normalize(text: string): string {
  return text.toLowerCase();
}

function includesAny(text: string, values: string[]): boolean {
  return values.some((value) => text.includes(value));
}

function inferCommandType(task: PlannedTask): CommandType {
  const text = normalize(
    [task.title, task.description, task.expectedOutput, task.trace.reasoning].join(" ")
  );

  if (task.category === "preparation" || task.category === "information" || task.category === "validation") {
    return "report.view";
  }

  if (task.category === "handoff") {
    if (includesAny(text, ["document", "knowledge", "summary", "deliverable"])) {
      return "document.create";
    }
    return "report.view";
  }

  if (includesAny(text, ["policy", "governance", "compliance"])) return "policy.create";
  if (includesAny(text, ["contract", "msa", "nda", "agreement"])) return "contract.generate";
  if (includesAny(text, ["invoice", "billing", "payment", "budget", "expense"])) return "invoice.create";
  if (includesAny(text, ["job", "hiring", "candidate", "recruit"])) return "job.post";
  if (includesAny(text, ["integration", "provider", "connector", "tool access"])) return "integration.add";
  if (includesAny(text, ["workflow", "orchestration", "sequence"])) return "workflow.update";
  if (includesAny(text, ["memory", "recall"])) return "memory.update";
  if (includesAny(text, ["knowledge", "document", "brief", "summary"])) return "document.create";
  if (includesAny(text, ["approval", "sign-off", "approve"])) return "approval.approve";

  if (task.ownerType === "workflow") return "workflow.update";
  if (task.ownerType === "department") return "report.view";
  return "agent.update";
}

function approvalGateIdsForTask(taskId: string, approvals: ApprovalGate[]): string[] {
  return approvals.filter((gate) => gate.blocksTaskId === taskId).map((gate) => gate.id);
}

export function mapExecutionPlanToCommands(plan: ExecutionPlan): CommandCandidate[] {
  return plan.tasks.map((task) => {
    const commandType = inferCommandType(task);
    const definition = getCommandDefinition(commandType);
    const approvalGateIds = approvalGateIdsForTask(task.id, plan.approvals);

    return {
      id: `candidate-${plan.agentId}-${task.id}`,
      taskId: task.id,
      title: task.title,
      commandType,
      commandLabel: definition?.label ?? commandType,
      owner: {
        type: task.ownerType,
        id: task.ownerId,
      },
      priority: task.priority,
      dependencies: [],
      approvalGateIds,
      requiredApproval: definition?.requiresApproval ?? approvalGateIds.length > 0,
      estimatedDuration: task.estimatedDuration,
      status: "ready",
      traceability: {
        taskId: task.id,
        taskTitle: task.title,
        taskCategory: task.category,
        decision: task.trace.decision,
        reasoning: task.trace.reasoning,
        context: task.trace.context,
        memory: task.trace.memory,
        knowledge: task.trace.knowledge,
      },
      payload: {
        agentId: plan.agentId,
        agentName: plan.agentName,
        taskId: task.id,
        taskTitle: task.title,
        taskCategory: task.category,
        ownerType: task.ownerType,
        ownerId: task.ownerId,
        expectedOutput: task.expectedOutput,
      },
    };
  });
}
