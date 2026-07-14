/*
 * Agent Reasoning — service facade.
 *
 * Public read API. Pulls an Agent Context Package (which itself flows through
 * the Memory Engine), runs the reasoning pipeline, and returns a Decision
 * Package + report. No command dispatch, no mutation, no execution.
 */

import { getById, listAll } from "@/features/agent-crud";
import { buildAgentContext } from "@/features/agent-context";
import type { AgentContextRequest } from "@/features/agent-context";
import { reason } from "./reasoning-engine";
import { buildReasoningReport } from "./reasoning-report";
import type { AgentReasoningResult } from "./types";

/** Reason for a single agent by id. Returns null when the agent is unknown. */
export function getAgentReasoning(
  agentId: string,
  request?: Omit<AgentContextRequest, "agentId">
): AgentReasoningResult | null {
  const agent = getById(agentId);
  if (!agent) return null;

  const contextPackage = buildAgentContext(agent, { agentId, ...request });
  const decision = reason(contextPackage);
  const report = buildReasoningReport(decision);

  return { agent, contextPackage, decision, report };
}

/**
 * Reason for every active agent — used by the Director overview. Deterministic
 * ordering by agent id ascending.
 */
export function getActiveAgentReasonings(
  request?: Omit<AgentContextRequest, "agentId">
): AgentReasoningResult[] {
  return listAll()
    .filter((agent) => agent.lifecycleStatus === "active")
    .slice()
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map((agent) => {
      const contextPackage = buildAgentContext(agent, { agentId: agent.id, ...request });
      const decision = reason(contextPackage);
      return { agent, contextPackage, decision, report: buildReasoningReport(decision) };
    });
}
