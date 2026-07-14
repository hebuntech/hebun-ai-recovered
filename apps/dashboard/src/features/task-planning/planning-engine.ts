/*
 * Task Planning — the engine.
 *
 * Runs the full deterministic pipeline over a Decision Package:
 *
 *   Decision Package
 *     → Goal Planning
 *     → Task Generation
 *     → Dependency Resolution
 *     → Resource Planning
 *     → Approval Planning
 *     → Timeline Planning
 *     → Execution Plan
 *
 * Pure function: same Decision Package + agent → same Execution Plan, every
 * time. No LLM, no randomness, no execution, no orchestration, no mutation.
 */

import type { AgentCrudRecord } from "@/features/agent-crud";
import type { DecisionPackage } from "@/features/agent-reasoning";
import { planGoal } from "./goal-planner";
import { generateTasks } from "./task-generator";
import { resolveDependencies } from "./dependency-engine";
import { planResources } from "./resource-planner";
import { planApprovals } from "./approval-planner";
import { planTimeline } from "./timeline-planner";
import { assembleExecutionPlan } from "./execution-plan";
import type { ExecutionPlan } from "./types";

/** Transform one Decision Package into one Execution Plan. Deterministic. */
export function buildExecutionPlan(
  decision: DecisionPackage,
  agent: AgentCrudRecord
): ExecutionPlan {
  const goal = planGoal(decision);
  const tasks = generateTasks(decision, goal, agent);
  const dependencies = resolveDependencies(tasks);
  const resources = planResources(decision, agent);
  const approvals = planApprovals(decision, agent, tasks);
  const timeline = planTimeline(tasks, approvals);

  return assembleExecutionPlan({
    decision,
    agentId: agent.id,
    agentName: agent.name,
    goal,
    tasks,
    dependencies,
    resources,
    approvals,
    timeline,
  });
}
