/*
 * Task Planning — task generation.
 *
 * Stage 2. Turns a Decision Package + planned goal into a deterministic,
 * ordered list of PlannedTasks. The task set is a pure function of the
 * decision: same decision → same tasks, same ids, same order.
 *
 * Generation order is by category (preparation → information → core →
 * validation → handoff); the dependency + timeline stages rely on this order.
 * Nothing is executed — every task is prepared and stays `planned`.
 */

import type { AgentCrudRecord } from "@/features/agent-crud";
import type { DecisionPackage } from "@/features/agent-reasoning";
import type { PlannedGoal, PlannedTask, PlanPriority, TaskCategory, TaskTrace } from "./types";

/** Base effort per category, in minutes, before deterministic adjustments. */
const BASE_DURATION: Record<TaskCategory, number> = {
  preparation: 15,
  information: 30,
  core: 45,
  validation: 20,
  handoff: 15,
};

/** Priority effort bump, in minutes. Higher priority → more prepared effort. */
const PRIORITY_BUMP: Record<PlanPriority, number> = {
  critical: 20,
  high: 12,
  medium: 6,
  low: 0,
};

/** Build the shared traceability chain for every task from this decision. */
function traceFor(decision: DecisionPackage): TaskTrace {
  const { recommendedOption, contextSummary } = decision;
  return {
    decision: `${recommendedOption.label} (score ${recommendedOption.score})`,
    reasoning: recommendedOption.rationale,
    context: `${contextSummary.retrievedMemories} memories · ${contextSummary.knowledgeNodes} nodes · health ${contextSummary.contextHealth}`,
    memory: contextSummary.topMemory,
    knowledge: `${contextSummary.knowledgeNodes} knowledge node(s), ${contextSummary.relationships} relationship(s)`,
  };
}

/** Deterministic per-task duration: category base + priority + risk load. */
function durationFor(
  category: TaskCategory,
  priority: PlanPriority,
  riskLoad: number
): number {
  // riskLoad (0-100) adds up to ~30m of prepared buffer to core work only.
  const riskBuffer = category === "core" ? Math.round(riskLoad * 0.3) : 0;
  return BASE_DURATION[category] + PRIORITY_BUMP[priority] + riskBuffer;
}

/**
 * Generate the deterministic task list.
 *
 * @param decision the reasoning Decision Package (the single source of truth)
 * @param goal     the planned goal (stage 1 output)
 * @param agent    the owning agent — provides capabilities + department refs
 */
export function generateTasks(
  decision: DecisionPackage,
  goal: PlannedGoal,
  agent: AgentCrudRecord
): PlannedTask[] {
  const { constraints, risk, recommendedOption } = decision;
  const trace = traceFor(decision);
  const priority = goal.priority;
  const capabilities = agent.capabilities;
  const tasks: PlannedTask[] = [];

  let seq = 0;
  const nextId = () => `task-${agent.id}-${++seq}`;

  const push = (
    category: TaskCategory,
    title: string,
    description: string,
    ownerType: PlannedTask["ownerType"],
    ownerId: string,
    requiredCapabilities: string[],
    expectedOutput: string
  ) => {
    tasks.push({
      id: nextId(),
      title,
      description,
      category,
      ownerType,
      ownerId,
      estimatedDuration: durationFor(category, priority, risk.overallRisk),
      priority,
      status: "planned",
      requiredCapabilities,
      expectedOutput,
      trace,
    });
  };

  // 1 — Preparation: always exactly one. Assemble context for the goal.
  push(
    "preparation",
    "Assemble decision context",
    `Load the reasoning context for "${goal.primaryGoal}" and confirm the recommended action "${recommendedOption.label}" is still applicable.`,
    "agent",
    agent.id,
    [],
    "Confirmed, context-loaded working set"
  );

  // 2 — Information: one per missing-information gap, in constraint order.
  //     These are parallel siblings (all depend only on preparation).
  for (const gap of constraints.missingInformation) {
    push(
      "information",
      `Close information gap: ${gap}`,
      `Gather the missing input "${gap}" required before core work can proceed.`,
      "agent",
      agent.id,
      capabilities.slice(0, 1),
      `Resolved input for: ${gap}`
    );
  }

  // 3 — Core: one for the primary goal + one per supporting goal.
  //     These are parallel siblings (all depend on the information layer).
  push(
    "core",
    `Execute: ${goal.primaryGoal}`,
    `Carry out the prepared work for the primary goal via "${recommendedOption.label}".`,
    "agent",
    agent.id,
    capabilities,
    goal.deliverables[0] ?? `Completed: ${goal.primaryGoal}`
  );

  for (const supporting of goal.supportingGoals) {
    push(
      "core",
      `Execute supporting goal: ${supporting}`,
      `Carry out the prepared work for the supporting goal "${supporting}".`,
      "agent",
      agent.id,
      capabilities,
      `Supporting deliverable: ${supporting}`
    );
  }

  // 4 — Validation: always exactly one. Check completion criteria.
  push(
    "validation",
    "Validate against completion criteria",
    `Verify all completion criteria are met: ${goal.completionCriteria.join("; ") || "primary goal delivered"}.`,
    "agent",
    agent.id,
    capabilities.slice(0, 1),
    "Validation result against completion criteria"
  );

  // 5 — Handoff: always exactly one. Deliver to the owning department.
  push(
    "handoff",
    "Hand off deliverables",
    `Package and hand the deliverables to ${agent.department} for downstream use.`,
    "department",
    agent.department,
    [],
    "Delivered deliverable package"
  );

  return tasks;
}
