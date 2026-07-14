/*
 * Agent Context — request builder.
 *
 * Maps an agent (plus optional scope hints) into a Memory Engine retrieval
 * request. This is the ONLY translation step; the Memory Engine owns every
 * filter and ranking decision. We never re-implement retrieval here.
 */

import type { AgentCrudRecord } from "@/features/agent-crud";
import type { MemoryRetrievalRequest } from "@/features/memory-engine";
import type { AgentContextRequest } from "./types";

function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Build the Memory Engine request for an agent. The agent id, its department,
 * and any supplied workflow/project/customer become context anchors — soft
 * signals the engine's ranking boosts. We deliberately do NOT hard-filter on
 * owner, so an agent always receives ranked context rather than an empty set.
 */
export function buildAgentRequest(
  agent: AgentCrudRecord,
  request: AgentContextRequest
): MemoryRetrievalRequest {
  const department = (request.department ?? agent.department).trim();

  return {
    agent: agent.id,
    department: department ? slugify(department) : undefined,
    workflow: request.workflow ? slugify(request.workflow) : undefined,
    project: request.project ? slugify(request.project) : undefined,
    customer: request.customer ? slugify(request.customer) : undefined,
    tags: request.tags && request.tags.length > 0 ? request.tags : undefined,
    limit: request.limit,
  };
}
