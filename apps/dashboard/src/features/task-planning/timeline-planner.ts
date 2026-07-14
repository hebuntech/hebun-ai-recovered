/*
 * Task Planning — timeline planning.
 *
 * Stage 6. Sequences the tasks into ordered execution stages (one per non-empty
 * task layer), derives milestones, and estimates total duration. Stages run
 * sequentially; tasks within a stage run in parallel, so a stage costs the
 * duration of its longest task. Fully deterministic — no clocks, no wall time.
 */

import type {
  ApprovalGate,
  ExecutionStage,
  Milestone,
  PlannedTask,
  TaskCategory,
  Timeline,
} from "./types";

const LAYER_ORDER: TaskCategory[] = [
  "preparation",
  "information",
  "core",
  "validation",
  "handoff",
];

const STAGE_LABEL: Record<TaskCategory, string> = {
  preparation: "Preparation",
  information: "Information Gathering",
  core: "Core Execution",
  validation: "Validation",
  handoff: "Handoff",
};

/** Format minutes as a compact, human-readable estimate ("~2h 15m"). */
export function formatDuration(minutes: number): string {
  if (minutes <= 0) return "~0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `~${m}m`;
  if (m === 0) return `~${h}h`;
  return `~${h}h ${m}m`;
}

export function planTimeline(
  tasks: PlannedTask[],
  approvals: ApprovalGate[]
): Timeline {
  const stages: ExecutionStage[] = [];
  let order = 0;

  for (const category of LAYER_ORDER) {
    const layerTasks = tasks.filter((t) => t.category === category);
    if (layerTasks.length === 0) continue;
    order += 1;
    const estimatedDuration = Math.max(
      ...layerTasks.map((t) => t.estimatedDuration)
    );
    stages.push({
      order,
      label: STAGE_LABEL[category],
      category,
      taskIds: layerTasks.map((t) => t.id),
      estimatedDuration,
    });
  }

  const estimatedTotalDuration = stages.reduce(
    (sum, s) => sum + s.estimatedDuration,
    0
  );

  // Milestones: an approval checkpoint before core (when gated), plus a
  // checkpoint after each of the meaningful downstream stages.
  const milestones: Milestone[] = [];
  const coreStage = stages.find((s) => s.category === "core");

  if (approvals.length > 0 && coreStage) {
    milestones.push({
      id: "milestone-approvals-cleared",
      label: "Approvals cleared",
      afterStage: coreStage.order - 1,
      criteria: `${approvals.length} approval gate(s) resolved before core execution`,
    });
  }
  if (coreStage) {
    milestones.push({
      id: "milestone-core-complete",
      label: "Core work complete",
      afterStage: coreStage.order,
      criteria: "All core tasks prepared to completion",
    });
  }
  const validationStage = stages.find((s) => s.category === "validation");
  if (validationStage) {
    milestones.push({
      id: "milestone-validated",
      label: "Validated",
      afterStage: validationStage.order,
      criteria: "Completion criteria verified",
    });
  }
  const handoffStage = stages.find((s) => s.category === "handoff");
  if (handoffStage) {
    milestones.push({
      id: "milestone-delivered",
      label: "Delivered",
      afterStage: handoffStage.order,
      criteria: "Deliverables handed off",
    });
  }

  return {
    stages,
    milestones,
    estimatedTotalDuration,
    estimatedCompletion: formatDuration(estimatedTotalDuration),
  };
}
