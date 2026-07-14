/*
 * offline-execution-context.ts — resolves the planning + orchestration
 * blueprints that seed a session. References the existing Planning and
 * Orchestration engines; nothing is duplicated. Also maps a plan task type to a
 * matrix capability so the task can be routed deterministically.
 */

import { latestOrchestrationBlueprint } from "@/features/orchestration";
import type { OrchestrationBlueprint } from "@/features/orchestration";
import type { GeneratedPlan, PlanTask } from "@/features/planning";
import type { MatrixCapability } from "@/features/provider-matrix";

export interface OfflineExecutionContext {
  orchestration: OrchestrationBlueprint;
  plan: GeneratedPlan;
  planId: string;
  orchestrationId: string;
  tasks: PlanTask[];
}

/** deterministic plan-task-type → matrix capability mapping. */
const taskTypeCapability: Record<string, MatrixCapability> = {
  alignment: "Planning",
  design: "Code Generation",
  governance: "Human Approval",
  enablement: "Execution",
  validation: "Review",
};

export function capabilityForTask(task: PlanTask): MatrixCapability {
  return taskTypeCapability[task.type] ?? "Reasoning";
}

export function buildOfflineContext(): OfflineExecutionContext {
  const orchestration = latestOrchestrationBlueprint();
  const plan = orchestration.plan;
  return {
    orchestration,
    plan,
    planId: orchestration.planId,
    orchestrationId: orchestration.id,
    tasks: plan.tasks,
  };
}
