/*
 * Task Planning — execution plan assembly.
 *
 * Stage 7. Assembles the final Execution Plan from every prior stage and
 * derives the planning summary + expected outputs. The plan is the phase's
 * only product: a prepared, traceable, read-only blueprint. It is never run.
 */

import type { DecisionPackage } from "@/features/agent-reasoning";
import type {
  ApprovalGate,
  DependencyGraph,
  ExecutionPlan,
  PlannedGoal,
  PlannedResources,
  PlannedTask,
  PlanningSummary,
  PlanReadiness,
  Timeline,
} from "./types";

interface AssembleInputs {
  decision: DecisionPackage;
  agentId: string;
  agentName: string;
  goal: PlannedGoal;
  tasks: PlannedTask[];
  dependencies: DependencyGraph;
  resources: PlannedResources;
  approvals: ApprovalGate[];
  timeline: Timeline;
}

/** Deterministic de-dup of strings, first-seen order preserved. */
function uniq(values: string[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const v of values) {
    if (seen.has(v)) continue;
    seen.add(v);
    out.push(v);
  }
  return out;
}

function deriveReadiness(
  decision: DecisionPackage,
  approvals: ApprovalGate[]
): PlanReadiness {
  if (approvals.length > 0) return "needs-approval";
  const { recommendedOption, constraints } = decision;
  const blockedOnInfo =
    recommendedOption.id === "collect-more-information" ||
    constraints.missingInformation.length > 0;
  if (blockedOnInfo) return "blocked";
  return "ready";
}

function buildSummary(inputs: AssembleInputs): PlanningSummary {
  const { decision, goal, tasks, dependencies, approvals, timeline } = inputs;
  const readiness = deriveReadiness(decision, approvals);

  const recommendedAction =
    readiness === "needs-approval"
      ? `Clear ${approvals.length} approval gate(s) before execution`
      : readiness === "blocked"
        ? `Resolve ${decision.constraints.missingInformation.length} information gap(s) before execution`
        : "Plan is ready to hand to the execution layer";

  return {
    taskCount: tasks.length,
    approvalCount: approvals.length,
    parallelCount: dependencies.parallelCount,
    sequentialCount: dependencies.sequentialCount,
    criticalPathDuration: dependencies.criticalPathDuration,
    estimatedTotalDuration: timeline.estimatedTotalDuration,
    priority: goal.priority,
    readiness,
    recommendedAction,
  };
}

export function assembleExecutionPlan(inputs: AssembleInputs): ExecutionPlan {
  const {
    agentId,
    agentName,
    goal,
    tasks,
    dependencies,
    resources,
    approvals,
    timeline,
  } = inputs;

  const expectedOutputs = uniq([
    ...goal.deliverables,
    ...tasks.map((t) => t.expectedOutput),
  ]);

  return {
    id: `plan-${agentId}`,
    agentId,
    agentName,
    goal,
    tasks,
    dependencies,
    resources,
    approvals,
    timeline,
    expectedOutputs,
    summary: buildSummary(inputs),
  };
}
