/*
 * Task Planning — goal planning.
 *
 * Stage 1 of the pipeline. Reuses the reasoning layer's GoalAnalysis verbatim
 * (no re-derivation) and expands it into a plannable goal: primary + supporting
 * goals, concrete deliverables, completion criteria, and priority.
 */

import type { DecisionPackage } from "@/features/agent-reasoning";
import type { PlannedGoal } from "./types";

/** Deterministically expand the reasoning goal into a plannable goal. */
export function planGoal(decision: DecisionPackage): PlannedGoal {
  const { goal, recommendedOption } = decision;

  // Deliverables are concrete artifacts, derived deterministically from the
  // goal text and the recommended action. Primary first, then one per
  // supporting goal, in the goal's own order.
  const deliverables = [
    `Completed outcome: ${goal.primaryGoal}`,
    ...goal.supportingGoals.map((g) => `Supporting deliverable: ${g}`),
    `Decision record: ${recommendedOption.label}`,
  ];

  return {
    primaryGoal: goal.primaryGoal,
    supportingGoals: goal.supportingGoals,
    deliverables,
    completionCriteria: goal.successCriteria,
    priority: goal.priority,
  };
}
