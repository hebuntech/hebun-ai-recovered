import type { OrchestrationBlueprint } from "@/features/orchestration";
import type {
  AbstractExecutor,
  ExecutionState,
  ExecutorAssignment,
} from "@/features/execution/types";

function assignmentStatus(
  state: ExecutionState,
  taskId: string,
  totalTasks: number
): ExecutorAssignment["status"] {
  const sequence = Number(taskId.split("-").at(-1) ?? 1);
  const completionThreshold = Math.max(1, Math.ceil(totalTasks * 0.5));

  if (state === "queued" || state === "pending" || state === "ready") return "queued";
  if (state === "waiting" || state === "blocked" || state === "paused") return "waiting";
  if (state === "completed") return "completed";
  if (state === "failed" || state === "timed-out") {
    return sequence >= completionThreshold ? "failed" : "completed";
  }
  if (state === "retrying") {
    return sequence >= completionThreshold ? "running" : "completed";
  }

  return sequence >= completionThreshold ? "running" : "completed";
}

export function allocateExecutors(
  blueprint: OrchestrationBlueprint
): AbstractExecutor[] {
  const agentExecutors: AbstractExecutor[] = blueprint.agentAssignments.map((assignment) => ({
    id: `executor-${assignment.agentId}`,
    title: assignment.agentRole,
    executorType: "AgentExecutor",
    owner: assignment.agentId,
    status:
      assignment.status === "blocked"
        ? "constrained"
        : assignment.status === "fallback"
          ? "standby"
          : "allocated",
    capabilityIds: assignment.requiredCapabilities,
    toolIds: assignment.requiredTools,
    note: assignment.assignmentReason,
  }));

  const humanExecutors: AbstractExecutor[] = blueprint.humanAssignments.map((assignment) => ({
    id: `executor-human-${assignment.taskId}`,
    title: assignment.role,
    executorType: "HumanExecutor",
    owner: assignment.role,
    status: assignment.approvalRequired ? "shared" : "allocated",
    capabilityIds: [],
    toolIds: [],
    note: assignment.responsibility,
  }));

  return [...agentExecutors, ...humanExecutors];
}

export function dispatchExecutionAssignments(
  blueprint: OrchestrationBlueprint,
  state: ExecutionState,
  startedAt: string
): ExecutorAssignment[] {
  const totalTasks = blueprint.plan.tasks.length;
  const agentAssignments: ExecutorAssignment[] = blueprint.plan.tasks.map((task) => {
    const owner =
      blueprint.agentAssignments.find((assignment) => assignment.taskId === task.id) ??
      blueprint.humanAssignments.find((assignment) => assignment.taskId === task.id);

    return {
      id: `dispatch-${task.id}`,
      taskId: task.id,
      taskTitle: task.title,
      executorId: owner
        ? "agentId" in owner
          ? `executor-${owner.agentId}`
          : `executor-human-${owner.taskId}`
        : "executor-unassigned",
      executorType: owner ? ("agentId" in owner ? "AgentExecutor" : "HumanExecutor") : "Executor",
      owner: owner ? ("agentId" in owner ? owner.agentRole : owner.role) : "Unassigned",
      status: assignmentStatus(state, task.id, totalTasks),
      assignedAt: startedAt,
      note:
        owner && "assignmentReason" in owner
          ? owner.assignmentReason
          : owner && "responsibility" in owner
            ? owner.responsibility
            : "Awaiting downstream executor allocation.",
    };
  });

  return agentAssignments;
}
