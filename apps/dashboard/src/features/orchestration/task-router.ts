import { registryRecords } from "@/features/registries";
import type { GeneratedPlan } from "@/features/planning";
import type { CapabilityRequirement, ToolAssignment } from "@/features/orchestration/types";

export function buildCapabilityRequirements(plan: GeneratedPlan): CapabilityRequirement[] {
  return plan.tasks.map((task) => ({
    taskId: task.id,
    capabilityIds: task.requiredCapabilityIds,
    summary:
      task.requiredCapabilityIds.length > 0
        ? task.requiredCapabilityIds
            .map((id) => registryRecords.capabilities.find((record) => record.id === id)?.name ?? id)
            .join(", ")
        : "No explicit capability requirements.",
  }));
}

export function buildToolAssignments(plan: GeneratedPlan): ToolAssignment[] {
  return plan.tasks.map((task) => ({
    taskId: task.id,
    toolIds: task.requiredToolIds,
    summary:
      task.requiredToolIds.length > 0
        ? task.requiredToolIds
            .map((id) => registryRecords.tools.find((record) => record.id === id)?.name ?? id)
            .join(", ")
        : "No explicit tool requirements.",
  }));
}
