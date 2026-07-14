import type { GovernanceResult } from "@/features/policy";
import type { PlanningGoal, PlanTask, PlanningPriority, PlanningTaskType } from "@/features/planning/types";
import { registryRecords } from "@/features/registries";

const defaultCapabilityIds = registryRecords.capabilities
  .slice(0, 3)
  .map((record) => record.id);
const defaultToolIds = registryRecords.tools.slice(0, 3).map((record) => record.id);

function taskOwner(index: number, goal: PlanningGoal) {
  const owners = [goal.owner, "Planning Engine", "Governance Core", "Workflow Engine"];
  return owners[index % owners.length];
}

export function generatePlanTasks(
  goal: PlanningGoal,
  governance: GovernanceResult
): PlanTask[] {
  const actionTasks: PlanTask[] = governance.reasoning.selectedOption.actions
    .slice(0, 3)
    .map((action, index) => {
      const type: PlanningTaskType = index === 0 ? "design" : "enablement";
      const priority: PlanningPriority = index === 0 ? "high" : "medium";

      return {
        id: `${governance.id}-task-${index + 2}`,
        title: `Operationalize: ${action}`,
        description: `Translate the approved decision action "${action}" into a deterministic planning work item with explicit owners, dependencies, and success checks.`,
        type,
        priority,
        status: governance.governanceDecision.status === "allow" ? "ready" : "pending-review",
        owner: taskOwner(index + 1, goal),
        estimatedDuration: `${index + 2} days`,
        requiredCapabilityIds: defaultCapabilityIds.slice(0, index === 0 ? 2 : 3),
        requiredToolIds: defaultToolIds.slice(0, 2),
        dependencyIds: [],
        successCriteria: [
          `Action ${index + 1} is mapped to owned work`,
          "Registry and graph references remain intact",
        ],
      };
    });

  return [
    {
      id: `${governance.id}-task-1`,
      title: `Align planning scope for ${goal.title}`,
      description: "Confirm the planning boundary, target outcome, and governance expectations before work sequencing begins.",
      type: "alignment",
      priority: "high",
      status: "ready",
      owner: goal.owner,
      estimatedDuration: "2 days",
      requiredCapabilityIds: defaultCapabilityIds.slice(0, 2),
      requiredToolIds: defaultToolIds.slice(0, 1),
      dependencyIds: [],
      successCriteria: [
        "Goal scope is confirmed",
        "Governance decision and reasoning traces are attached",
      ],
    },
    ...actionTasks,
    {
      id: `${governance.id}-task-${actionTasks.length + 2}`,
      title: "Validate blueprint readiness",
      description: "Confirm dependencies, milestones, rollback points, and success criteria before the plan is handed to any future execution layer.",
      type: "validation",
      priority: "high",
      status: governance.governanceDecision.status === "allow" ? "ready" : "pending-review",
      owner: "Planning Engine",
      estimatedDuration: "2 days",
      requiredCapabilityIds: defaultCapabilityIds,
      requiredToolIds: defaultToolIds.slice(0, 2),
      dependencyIds: [],
      successCriteria: [
        "Execution blueprint is complete",
        "Planning risks and success criteria are explicit",
      ],
    },
  ];
}
