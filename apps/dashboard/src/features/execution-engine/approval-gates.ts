import type { CommandPlan } from "@/features/execution-bridge";
import type { SimulatedApprovalGate, SimulatedApprovalState } from "./types";

function stateForGate(plan: CommandPlan, gateId: string): SimulatedApprovalState {
  const issue = plan.validation.issues.find(
    (item) => item.relatedIds?.includes(gateId) || item.commandId === gateId
  );
  if (issue) return "rejected";
  return "pending";
}

export function simulateApprovalGates(plan: CommandPlan): SimulatedApprovalGate[] {
  return plan.approvalGates.map((gate) => ({
    id: `sim-${gate.id}`,
    gate,
    state: stateForGate(plan, gate.id),
    commandIds: plan.commandCandidates
      .filter((candidate) => candidate.approvalGateIds.includes(gate.id))
      .map((candidate) => candidate.id),
    reason:
      stateForGate(plan, gate.id) === "rejected"
        ? "Approval gate rejected by deterministic validation."
        : "Approval gate remains pending in simulation.",
  }));
}

