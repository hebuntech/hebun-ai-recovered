/*
 * Task Planning — service facade.
 *
 * Public read API. Reuses Agent Reasoning verbatim to obtain the Decision
 * Package (which itself flows through Agent Context → Memory Engine), runs the
 * planning pipeline, and returns an Execution Plan + report.
 *
 * No command dispatch, no mutation, no execution. Command Bus is not touched.
 */

import { getSnapshot as getAgentSnapshot } from "@/features/agent-crud";
import { getAgentReasoning } from "@/features/agent-reasoning";
import { buildExecutionPlan } from "./planning-engine";
import { buildPlanningReport } from "./planning-report";
import type { TaskPlanningResult } from "./types";

/** Plan for a single agent by id. Returns null when the agent is unknown. */
export function getAgentPlan(agentId: string): TaskPlanningResult | null {
  const reasoning = getAgentReasoning(agentId);
  if (!reasoning) return null;

  const { agent, decision } = reasoning;
  const plan = buildExecutionPlan(decision, agent);
  const report = buildPlanningReport(plan);

  return { agent, decision, plan, report };
}

/**
 * Plan for every active agent — used by the Director planning overview.
 * Deterministic ordering by agent id ascending.
 */
export function getActivePlans(): TaskPlanningResult[] {
  return getAgentSnapshot()
    .filter((agent) => agent.lifecycleStatus === "active")
    .slice()
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map((agent) => getAgentPlan(agent.id))
    .filter((result): result is TaskPlanningResult => result !== null);
}
