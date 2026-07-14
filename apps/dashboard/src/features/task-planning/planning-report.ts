/*
 * Task Planning — report projection.
 *
 * Compact, dashboard-friendly view of an Execution Plan for the Director
 * planning overview. No new data is computed here — it only projects the plan.
 */

import type { ExecutionPlan, PlanningReport } from "./types";

export function buildPlanningReport(plan: ExecutionPlan): PlanningReport {
  return {
    agentId: plan.agentId,
    agentName: plan.agentName,
    primaryGoal: plan.goal.primaryGoal,
    taskCount: plan.tasks.length,
    approvalCount: plan.approvals.length,
    criticalPathLength: plan.dependencies.criticalPath.length,
    criticalPathDuration: plan.dependencies.criticalPathDuration,
    estimatedCompletion: plan.timeline.estimatedCompletion,
    priority: plan.goal.priority,
    readiness: plan.summary.readiness,
  };
}
