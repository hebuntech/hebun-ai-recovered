/*
 * Agent Reasoning — goal analysis.
 *
 * Extracts a primary goal, supporting goals, priority, and success criteria
 * from the Context Package. Purely derivational: it reads ranked memories and
 * agent metadata, never invents content beyond fixed templates.
 */

import type { AgentContextPackage } from "@/features/agent-context";
import type { MemoryImportance } from "@/features/memory-crud";
import type { GoalAnalysis, GoalPriority } from "./types";

/** Memory types that read as goal/intent signals, in preference order. */
const GOAL_TYPES = ["Decision", "Project", "Workflow", "Procedure"] as const;

const IMPORTANCE_PRIORITY: Record<MemoryImportance, GoalPriority> = {
  critical: "critical",
  high: "high",
  medium: "medium",
  low: "low",
};

export function analyzeGoal(pkg: AgentContextPackage): GoalAnalysis {
  const memories = pkg.context.memories;
  const agent = pkg.agent;

  // Primary goal: the highest-ranked goal-shaped memory, else the top memory,
  // else a department fallback derived from the agent record.
  const goalMemory =
    memories.find((entry) =>
      (GOAL_TYPES as readonly string[]).includes(entry.record.memoryType)
    ) ?? memories[0];

  const primaryGoal = goalMemory
    ? goalMemory.record.title
    : `Advance ${agent.department} objectives as ${agent.role}`;

  // Supporting goals: next distinct high-signal memory titles.
  const supportingGoals: string[] = [];
  for (const entry of memories) {
    if (entry.record.title === primaryGoal) continue;
    if (entry.record.importance === "critical" || entry.record.importance === "high") {
      supportingGoals.push(entry.record.title);
    }
    if (supportingGoals.length >= 3) break;
  }

  const priority: GoalPriority = goalMemory
    ? IMPORTANCE_PRIORITY[goalMemory.record.importance]
    : "low";

  const successCriteria = buildSuccessCriteria(pkg);

  return { primaryGoal, supportingGoals, priority, successCriteria };
}

/** Deterministic success criteria driven by measurable context signals. */
function buildSuccessCriteria(pkg: AgentContextPackage): string[] {
  const { report, context } = pkg;
  const criteria: string[] = [];

  criteria.push(
    report.retrievedMemories > 0
      ? "Ground the decision in retrieved memories"
      : "Acquire relevant memories before acting"
  );
  criteria.push(
    report.knowledgeCoverage >= 0.5
      ? "Maintain knowledge-graph coverage above 50%"
      : "Raise knowledge-graph coverage above 50%"
  );
  criteria.push(
    context.confidence.averageConfidence >= 75
      ? "Preserve retrieval confidence at or above 75"
      : "Reach retrieval confidence of at least 75"
  );
  if (report.relationships > 0) {
    criteria.push("Resolve linked knowledge relationships before commitment");
  }

  return criteria;
}
