/*
 * Task Planning — approval planning.
 *
 * Stage 5. Inserts deterministic approval gates in front of core work. A gate
 * guards the transition into execution: the first core task (or the handoff
 * task when there is no core layer). Gate selection is a pure function of the
 * decision — policies, risk, priority, recommended action, and department.
 *
 * Supported gate types: policy, legal, finance, executive, human.
 * Planning only inserts the gate; it never approves, dispatches, or executes.
 */

import type { AgentCrudRecord } from "@/features/agent-crud";
import type { DecisionPackage } from "@/features/agent-reasoning";
import type { ApprovalGate, PlannedTask } from "./types";

function guardedTaskId(tasks: PlannedTask[]): string {
  const core = tasks.find((t) => t.category === "core");
  if (core) return core.id;
  const handoff = tasks.find((t) => t.category === "handoff");
  return handoff?.id ?? tasks[0]?.id ?? "";
}

export function planApprovals(
  decision: DecisionPackage,
  agent: AgentCrudRecord,
  tasks: PlannedTask[]
): ApprovalGate[] {
  const { constraints, risk, goal, recommendedOption } = decision;
  const blocksTaskId = guardedTaskId(tasks);
  const department = agent.department.toLowerCase();
  const gates: ApprovalGate[] = [];

  const add = (
    type: ApprovalGate["type"],
    label: string,
    reason: string
  ) => {
    gates.push({
      id: `gate-${agent.id}-${type}`,
      type,
      label,
      reason,
      blocksTaskId,
      required: true,
    });
  };

  // Policy — any active policy constraint requires a policy sign-off.
  if (constraints.policies.length > 0) {
    add(
      "policy",
      "Policy approval",
      `${constraints.policies.length} active policy constraint(s): ${constraints.policies.join(", ")}`
    );
  }

  // Legal — legal department ownership or a policy-heavy, high-risk decision.
  if (department.includes("legal") || (risk.policyRisk >= 60 && constraints.policies.length > 0)) {
    add(
      "legal",
      "Legal approval",
      department.includes("legal")
        ? "Legal-owned work requires legal review"
        : `Elevated policy risk (${risk.policyRisk}) with active policies`
    );
  }

  // Finance — finance department ownership or recorded spend.
  if (department.includes("finance") || agent.costToday > 0) {
    add(
      "finance",
      "Finance approval",
      department.includes("finance")
        ? "Finance-owned work requires finance review"
        : `Agent has recorded spend today (${agent.costToday})`
    );
  }

  // Executive — critical priority or an escalation recommendation.
  if (goal.priority === "critical" || recommendedOption.id === "escalate") {
    add(
      "executive",
      "Executive approval",
      goal.priority === "critical"
        ? "Critical-priority goal requires executive sign-off"
        : "Reasoning recommends escalation"
    );
  }

  // Human — an explicit approval request or high overall risk.
  if (recommendedOption.id === "request-approval" || risk.label === "high") {
    add(
      "human",
      "Human approval",
      recommendedOption.id === "request-approval"
        ? "Reasoning recommends requesting approval"
        : `High overall risk (${risk.overallRisk})`
    );
  }

  return gates;
}
