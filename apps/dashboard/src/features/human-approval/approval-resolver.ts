import type { DecisionPackage } from "@/features/agent-reasoning";
import type { ExecutionSimulation, SimulatedExecutionCommand } from "@/features/execution-engine";
import type { ApprovalDecision } from "./types";
import {
  deriveApprovalRisk,
  deriveDecisionReason,
  deriveDecisionStatus,
  derivePolicySignals,
  isReadyForExecution,
} from "./approval-policy";

function relevantValidationSignals(
  simulation: ExecutionSimulation,
  command: SimulatedExecutionCommand
): string[] {
  return simulation.validation.issues
    .filter(
      (issue) =>
        issue.commandId === command.commandId ||
        issue.relatedIds?.includes(command.commandId)
    )
    .map((issue) => issue.message)
    .concat(command.failureReasons);
}

function dependencySignals(
  simulation: ExecutionSimulation,
  command: SimulatedExecutionCommand
): string[] {
  const byId = new Map(simulation.queue.items.map((item) => [item.commandId, item]));

  return command.dependencies
    .map((dependencyId) => byId.get(dependencyId))
    .filter((dependency): dependency is SimulatedExecutionCommand => Boolean(dependency))
    .filter((dependency) =>
      ["blocked", "failed", "waiting-approval", "waiting-dependencies", "cancelled"].includes(
        dependency.state
      )
    )
    .map(
      (dependency) =>
        `${dependency.commandLabel} is ${dependency.state}${dependency.blockingReason ? `: ${dependency.blockingReason}` : ""}`
    );
}

export function resolveApprovalDecisions(
  simulation: ExecutionSimulation,
  decision: DecisionPackage
): ApprovalDecision[] {
  return simulation.queue.items
    .filter((command) => command.approvalGateIds.length > 0)
    .map((command) => {
      const validationSignals = relevantValidationSignals(simulation, command);
      const dependencySignalList = dependencySignals(simulation, command);
      const policySignals = derivePolicySignals(decision, command);
      const risk = deriveApprovalRisk(decision, command);
      const status = deriveDecisionStatus({
        command,
        decision,
        validationSignals,
        dependencySignals: dependencySignalList,
        policySignals,
      });

      const approval: ApprovalDecision = {
        id: `approval-${simulation.executionPlan.agentId}-${command.commandId}`,
        title: command.commandLabel,
        summary: command.title,
        requestedBy: simulation.executionPlan.agentName,
        type: command.commandType,
        risk,
        createdAt: "deterministic",
        status,
        agentId: simulation.executionPlan.agentId,
        agentName: simulation.executionPlan.agentName,
        commandId: command.commandId,
        commandType: command.commandType,
        commandLabel: command.commandLabel,
        priority: command.priority,
        riskLabel: decision.risk.label,
        confidence: decision.confidence.score,
        policySignals,
        validationSignals,
        dependencySignals: dependencySignalList,
        blockedCommands: command.dependencies,
        reason: "",
        readyForExecution: false,
        nextCommand:
          status === "approved"
            ? "approval.approve"
            : status === "rejected"
              ? "approval.reject"
              : null,
        traceability: {
          agentId: simulation.executionPlan.agentId,
          agentName: simulation.executionPlan.agentName,
          commandId: command.commandId,
          commandType: command.commandType,
          taskId: command.traceability.taskId,
          taskTitle: command.traceability.taskTitle,
          decision: command.traceability.decision,
          reasoning: command.traceability.reasoning,
          context: command.traceability.context,
          memory: command.traceability.memory,
          knowledge: command.traceability.knowledge,
        },
      };

      approval.reason = deriveDecisionReason(approval);
      approval.readyForExecution = isReadyForExecution(status, command, simulation);
      return approval;
    });
}

