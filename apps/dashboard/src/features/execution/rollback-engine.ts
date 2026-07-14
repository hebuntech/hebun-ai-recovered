import type { OrchestrationBlueprint } from "@/features/orchestration";
import type { ExecutionState } from "@/features/execution/types";

export function determineRollbackCount(
  blueprint: OrchestrationBlueprint,
  state: ExecutionState
) {
  if (state === "rolled-back") return Math.max(1, blueprint.plan.executionBlueprint.rollbackPoints.length);
  if (state === "failed" || state === "timed-out") {
    return blueprint.plan.executionBlueprint.rollbackPoints.length > 0 ? 1 : 0;
  }
  return 0;
}

export function rollbackSummary(blueprint: OrchestrationBlueprint) {
  if (blueprint.plan.executionBlueprint.rollbackPoints.length === 0) {
    return "No rollback points were required in the current execution blueprint.";
  }

  return `${blueprint.plan.executionBlueprint.rollbackPoints.length} rollback checkpoints were carried forward from planning into execution control.`;
}
