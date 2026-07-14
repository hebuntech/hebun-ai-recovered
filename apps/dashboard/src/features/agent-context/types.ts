/*
 * Agent Context — types.
 *
 * Connects the Agent domain to the deterministic Memory Engine. An agent asks
 * for its context; the Memory Engine answers with a Context Package. This layer
 * only shapes the request and reports the result — no retrieval, filtering, or
 * ranking logic lives here (that all belongs to the Memory Engine). Read only:
 * nothing mutates, nothing dispatches.
 */

import type { AgentCrudRecord } from "@/features/agent-crud";
import type {
  MemoryContextPackage,
  MemoryRetrievalRequest,
} from "@/features/memory-engine";

/** What an agent supplies to ask for its own context. */
export interface AgentContextRequest {
  agentId: string;
  /** Overrides the agent's own department when scoping context. */
  department?: string;
  workflow?: string;
  project?: string;
  customer?: string;
  tags?: string[];
  limit?: number;
}

export type ContextHealthLabel = "strong" | "moderate" | "weak" | "empty";

/** Compact, dashboard-ready rollup of a Context Package for one agent. */
export interface AgentContextReport {
  retrievedMemories: number;
  knowledgeNodes: number;
  relationships: number;
  relatedMemories: number;
  averageConfidence: number;
  averageImportance: number;
  knowledgeCoverage: number;
  /** Derived 0-100 score combining confidence, coverage, and fill ratio. */
  contextHealth: number;
  contextHealthLabel: ContextHealthLabel;
  retrievalTimeMs: number;
}

/**
 * The Agent Context Package. Wraps the Memory Engine's Context Package with the
 * agent it belongs to, the resolved engine request (for traceability), and the
 * derived report.
 */
export interface AgentContextPackage {
  agent: AgentCrudRecord;
  /** The exact request handed to the Memory Engine. */
  engineRequest: MemoryRetrievalRequest;
  /** The Memory Engine's answer, reused verbatim. */
  context: MemoryContextPackage;
  report: AgentContextReport;
}
