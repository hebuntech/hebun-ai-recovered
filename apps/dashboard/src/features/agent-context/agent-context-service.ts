/*
 * Agent Context — service facade.
 *
 * The public read API. Resolves agents through Agent CRUD queries and returns
 * Context Packages built on the Memory Engine. No command dispatch, no mutation.
 */

import { getSnapshot as getAgentSnapshot } from "@/features/agent-crud";
import { buildAgentContext } from "./agent-context";
import type { AgentContextPackage, AgentContextRequest } from "./types";

/**
 * Get the Context Package for a single agent by id. Returns null when the agent
 * does not exist, so callers can render an empty state instead of throwing.
 */
export function getAgentContext(
  agentId: string,
  request?: Omit<AgentContextRequest, "agentId">
): AgentContextPackage | null {
  const agent = getAgentSnapshot().find((candidate) => candidate.id === agentId);
  if (!agent) return null;
  return buildAgentContext(agent, { agentId, ...request });
}

/**
 * Get Context Packages for every active agent — used by the Director overview.
 * Ordered by agent id ascending for a stable, deterministic list.
 */
export function getActiveAgentContexts(
  request?: Omit<AgentContextRequest, "agentId">
): AgentContextPackage[] {
  return getAgentSnapshot()
    .filter((agent) => agent.lifecycleStatus === "active")
    .slice()
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))
    .map((agent) => buildAgentContext(agent, { agentId: agent.id, ...request }));
}
