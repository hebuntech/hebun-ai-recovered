import type { CommandPlan } from "@/features/execution-bridge";
import type {
  SimulatedApprovalGate,
  SimulatedExecutionCommand,
  SimulatedExecutionState,
} from "./types";
import { simulateFailureReasons, simulateMissingResources } from "./failure-simulator";

function approvalStateForCommand(
  command: SimulatedExecutionCommand,
  approvals: SimulatedApprovalGate[]
): SimulatedExecutionCommand["approvalState"] {
  if (command.approvalGateIds.length === 0) return "approved";
  const gateStates = approvals
    .filter((approval) => command.approvalGateIds.includes(approval.gate.id))
    .map((approval) => approval.state);
  if (gateStates.includes("rejected")) return "rejected";
  if (gateStates.includes("pending")) return "pending";
  return "approved";
}

function terminalDependencyState(state?: SimulatedExecutionState): boolean {
  return Boolean(
    state && ["completed", "failed", "blocked", "cancelled", "skipped"].includes(state)
  );
}

export function runExecutionSimulation(
  plan: CommandPlan,
  queue: SimulatedExecutionCommand[],
  approvals: SimulatedApprovalGate[]
): SimulatedExecutionCommand[] {
  const byId = new Map<string, SimulatedExecutionCommand>();
  const ordered = queue
    .slice()
    .sort((a, b) => (a.stageOrder - b.stageOrder) || (a.commandId < b.commandId ? -1 : 1));

  for (const command of ordered) {
    const failureReasons = simulateFailureReasons(plan, plan.commandCandidates.find((item) => item.id === command.commandId)!);
    const missingResources = simulateMissingResources(
      plan,
      plan.commandCandidates.find((item) => item.id === command.commandId)!
    );
    const dependencyStates = command.dependencies.map((id) => byId.get(id)?.state);
    const approvalState = approvalStateForCommand(command, approvals);

    let state: SimulatedExecutionState = "pending";
    let blockingReason: string | undefined;
    const lifecycle: SimulatedExecutionState[] = ["pending"];

    if (plan.validation.issues.some((issue) => issue.code === "circular-dependency" && issue.relatedIds?.includes(command.commandId))) {
      state = "cancelled";
      lifecycle.push("cancelled");
      blockingReason = "Command cancelled because the dependency graph is circular.";
    } else if (failureReasons.length > 0) {
      state = "failed";
      lifecycle.push("failed");
      blockingReason = failureReasons[0];
    } else if (dependencyStates.some((item) => item === "failed" || item === "cancelled")) {
      state = "skipped";
      lifecycle.push("skipped");
      blockingReason = "A prerequisite command failed or was cancelled.";
    } else if (dependencyStates.some((item) => item === "blocked")) {
      state = "blocked";
      lifecycle.push("blocked");
      blockingReason = "A prerequisite command remains blocked.";
    } else if (approvalState === "rejected") {
      state = "blocked";
      lifecycle.push("blocked");
      blockingReason = "Approval gate rejected this command.";
    } else if (approvalState === "pending") {
      state = "waiting-approval";
      lifecycle.push("waiting-approval");
      blockingReason = "Waiting for approval gate resolution.";
    } else if (dependencyStates.some((item) => !terminalDependencyState(item) || item === "waiting-approval" || item === "waiting-dependencies")) {
      state = "waiting-dependencies";
      lifecycle.push("waiting-dependencies");
      blockingReason = "Waiting for prerequisite commands to reach a terminal state.";
    } else {
      lifecycle.push("ready", "running", "completed");
      state = "completed";
    }

    byId.set(command.commandId, {
      ...command,
      approvalState,
      state,
      lifecycle,
      blockingReason,
      failureReasons,
      missingResources,
    });
  }

  return ordered.map((command) => byId.get(command.commandId)!);
}

