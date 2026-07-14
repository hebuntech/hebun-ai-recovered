import type { ApprovalRisk } from "@/types";
import type { DecisionPackage } from "@/features/agent-reasoning";
import type { ExecutionSimulation, SimulatedExecutionCommand } from "@/features/execution-engine";
import type { ApprovalDecision, HumanApprovalStatus } from "./types";

export function deriveApprovalRisk(
  decision: DecisionPackage,
  command: SimulatedExecutionCommand
): ApprovalRisk {
  if (decision.risk.overallRisk >= 85 || command.priority === "critical") return "critical";
  if (decision.risk.overallRisk >= 65 || command.priority === "high") return "high";
  if (decision.risk.overallRisk >= 40 || command.priority === "medium") return "medium";
  return "low";
}

export function derivePolicySignals(
  decision: DecisionPackage,
  command: SimulatedExecutionCommand
): string[] {
  const signals: string[] = [];

  if (decision.constraints.policies.length > 0) {
    signals.push(`${decision.constraints.policies.length} policy constraint(s) active`);
  }
  if (decision.goal.priority === "critical") {
    signals.push("Critical priority requires heightened review");
  }
  if (command.approvalGateIds.length > 0) {
    signals.push(`${command.approvalGateIds.length} approval gate(s) attached`);
  }
  if (decision.risk.label === "high") {
    signals.push("High risk posture requires human review");
  }

  return signals;
}

export function deriveDecisionStatus(input: {
  command: SimulatedExecutionCommand;
  decision: DecisionPackage;
  validationSignals: string[];
  dependencySignals: string[];
  policySignals: string[];
}): HumanApprovalStatus {
  const { command, decision, validationSignals, dependencySignals, policySignals } = input;

  if (validationSignals.length > 0) return "rejected";
  if (command.approvalState === "rejected") return "rejected";
  if (dependencySignals.length > 0 || command.state === "waiting-dependencies") return "pending";

  if (
    decision.risk.label === "high" &&
    (decision.confidence.score < 75 || policySignals.length > 1)
  ) {
    return "changes-requested";
  }

  if (
    command.priority === "critical" &&
    (decision.confidence.score < 85 || decision.constraints.missingInformation.length > 0)
  ) {
    return "changes-requested";
  }

  if (
    decision.risk.label === "low" &&
    decision.confidence.score >= 86 &&
    policySignals.length <= 1
  ) {
    return "approved";
  }

  if (
    decision.risk.label === "medium" &&
    decision.confidence.score >= 72 &&
    decision.constraints.missingInformation.length === 0
  ) {
    return "approved";
  }

  return "pending";
}

export function deriveDecisionReason(decision: ApprovalDecision): string {
  if (decision.status === "rejected") {
    return decision.validationSignals[0] ?? "Deterministic validation rejected the approval request.";
  }
  if (decision.status === "changes-requested") {
    if (decision.confidence < 75) {
      return `Confidence ${decision.confidence} is below the approval threshold for ${decision.risk} risk work.`;
    }
    return decision.policySignals[0] ?? "Policy and risk signals require changes before approval.";
  }
  if (decision.status === "pending") {
    return decision.dependencySignals[0] ?? decision.policySignals[0] ?? "Approval remains pending until prerequisites are resolved.";
  }
  return `Approved deterministically from ${decision.risk} risk, confidence ${decision.confidence}, and clean validation.`;
}

export function isReadyForExecution(
  status: HumanApprovalStatus,
  command: SimulatedExecutionCommand,
  simulation: ExecutionSimulation
): boolean {
  if (status !== "approved") return false;
  if (command.state === "failed" || command.state === "blocked") return false;
  const dependencyMap = new Map(simulation.queue.items.map((item) => [item.commandId, item]));
  return command.dependencies.every((dependencyId) => {
    const dependency = dependencyMap.get(dependencyId);
    return dependency ? ["completed", "skipped"].includes(dependency.state) : false;
  });
}

