/*
 * Task Planning — resource planning.
 *
 * Stage 4. References (never allocates or executes) the agents, workflows,
 * departments, knowledge, and memory an Execution Plan would need. Everything
 * is a read-only reference back to an existing platform entity; nothing is
 * reserved, invoked, or mutated.
 */

import type { AgentCrudRecord } from "@/features/agent-crud";
import type { DecisionPackage } from "@/features/agent-reasoning";
import type { PlannedResources, ResourceRef } from "./types";

/** Deterministic de-dup by id, preserving first-seen order. */
function dedup(refs: ResourceRef[]): ResourceRef[] {
  const seen = new Set<string>();
  const out: ResourceRef[] = [];
  for (const ref of refs) {
    if (seen.has(ref.id)) continue;
    seen.add(ref.id);
    out.push(ref);
  }
  return out;
}

export function planResources(
  decision: DecisionPackage,
  agent: AgentCrudRecord
): PlannedResources {
  const { constraints, contextSummary } = decision;

  const requiredAgents: ResourceRef[] = [
    {
      kind: "agent",
      id: agent.id,
      label: agent.name,
      reason: `Owning agent for "${decision.goal.primaryGoal}"`,
    },
  ];

  const requiredWorkflows: ResourceRef[] = dedup(
    constraints.workflowLimits.map((wf) => ({
      kind: "workflow" as const,
      id: wf,
      label: wf,
      reason: "Referenced by an active workflow constraint",
    }))
  );

  const requiredDepartments: ResourceRef[] = dedup([
    {
      kind: "department",
      id: agent.department,
      label: agent.department,
      reason: "Owning department (handoff target)",
    },
    ...constraints.departmentLimits.map((dept) => ({
      kind: "department" as const,
      id: dept,
      label: dept,
      reason: "Referenced by a department constraint",
    })),
  ]);

  const requiredKnowledge: ResourceRef[] = dedup([
    {
      kind: "knowledge",
      id: agent.knowledge || "knowledge-base",
      label: agent.knowledge || "Knowledge base",
      reason: `${contextSummary.knowledgeNodes} node(s), ${contextSummary.relationships} relationship(s) in context`,
    },
  ]);

  const requiredMemory: ResourceRef[] = dedup([
    {
      kind: "memory",
      id: agent.memory || "agent-memory",
      label: agent.memory || "Agent memory",
      reason: `${contextSummary.retrievedMemories} retrieved memory item(s); top: ${contextSummary.topMemory}`,
    },
  ]);

  return {
    requiredAgents,
    requiredWorkflows,
    requiredDepartments,
    requiredKnowledge,
    requiredMemory,
  };
}
