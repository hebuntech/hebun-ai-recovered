import type { GovernanceResult } from "@/features/policy";
import { registryRecords } from "@/features/registries";
import type { RegistryRecord } from "@/features/registries/types";
import type { PlanningGoal } from "@/features/planning/types";

function chooseGoalRecord(governance: GovernanceResult): RegistryRecord {
  const title = `${governance.reasoning.context.title} ${governance.reasoning.context.query}`.toLowerCase();

  if (title.includes("enterprise") || title.includes("approval")) {
    return registryRecords.goals[1];
  }

  if (
    title.includes("explainability") ||
    title.includes("governance") ||
    title.includes("compliance")
  ) {
    return registryRecords.goals[2];
  }

  return registryRecords.goals[0];
}

export function loadRelatedGoal(governance: GovernanceResult): PlanningGoal {
  const goal = chooseGoalRecord(governance);

  return {
    id: goal.id,
    title: goal.name,
    description: `${goal.name} is the closest active business goal for this approved decision and anchors the downstream execution blueprint.`,
    owner: goal.owner,
    sourceGoal: goal,
    drivers: [
      governance.reasoning.context.objective,
      governance.governanceDecision.summary,
      `${governance.reasoning.relatedMemories.length} referenced memories support plan construction`,
    ],
  };
}

export function decomposeGoal(goal: PlanningGoal, governance: GovernanceResult) {
  return [
    `Preserve alignment with ${goal.title}`,
    `Translate ${governance.reasoning.selectedOption.title.toLowerCase()} into ordered work`,
    "Keep approvals, evidence, and rollback points explicit before any future executor touches the plan",
  ];
}
