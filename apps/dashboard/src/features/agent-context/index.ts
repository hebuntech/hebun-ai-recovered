/*
 * Agent Context — bridges the Agent domain to the deterministic Memory Engine.
 *
 * Agents request their own Context Package; retrieval, filtering, and ranking
 * are delegated entirely to the Memory Engine. Read only. Same agent + same
 * stores → same context, every time.
 */

export * from "./types";
export { buildAgentRequest } from "./agent-context-builder";
export { buildContextReport } from "./agent-context-report";
export { buildAgentContext } from "./agent-context";
export { getAgentContext, getActiveAgentContexts } from "./agent-context-service";
