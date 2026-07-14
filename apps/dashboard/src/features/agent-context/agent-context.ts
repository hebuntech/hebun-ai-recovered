/*
 * Agent Context — core assembly.
 *
 * Resolves an agent, builds its Memory Engine request, calls the engine, and
 * wraps the result into an Agent Context Package. The agent never touches
 * Memory CRUD or Knowledge CRUD directly — everything flows through the Memory
 * Engine. Pure read path.
 */

import type { AgentCrudRecord } from "@/features/agent-crud";
import { retrieveContext } from "@/features/memory-engine";
import { buildAgentRequest } from "./agent-context-builder";
import { buildContextReport } from "./agent-context-report";
import type { AgentContextPackage, AgentContextRequest } from "./types";

/**
 * Build a Context Package for an already-resolved agent record. Deterministic:
 * the same agent + request against the same stores yields the same package.
 */
export function buildAgentContext(
  agent: AgentCrudRecord,
  request: AgentContextRequest = { agentId: agent.id }
): AgentContextPackage {
  const engineRequest = buildAgentRequest(agent, request);
  const context = retrieveContext(engineRequest);
  const report = buildContextReport(context);

  return { agent, engineRequest, context, report };
}
