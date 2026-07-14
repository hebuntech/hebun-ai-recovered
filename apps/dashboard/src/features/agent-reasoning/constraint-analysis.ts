/*
 * Agent Reasoning — constraint analysis.
 *
 * Identifies the policies, permissions, and limits bounding a decision, plus any
 * missing information. Completeness is a deterministic fraction of constraint
 * categories that are satisfied. Reads only the Context Package and agent record.
 */

import type { AgentContextPackage } from "@/features/agent-context";
import type { ConstraintAnalysis } from "./types";

/** How full a context must be before "insufficient memories" is flagged. */
const MIN_MEMORIES = 3;
const MIN_COVERAGE = 0.5;

export function analyzeConstraints(pkg: AgentContextPackage): ConstraintAnalysis {
  const { agent, context, report } = pkg;

  // Policies: policy-typed memories + policy knowledge nodes.
  const policies = unique([
    ...context.memories
      .filter((entry) => entry.record.memoryType === "Policy")
      .map((entry) => entry.record.title),
    ...context.knowledgeNodes
      .filter((entry) => entry.node.nodeType === "Policy")
      .map((entry) => entry.node.title),
  ]);

  const permissions = agent.permissions.slice();

  const workflowLimits = unique(
    context.memories
      .filter((entry) => entry.record.ownerType === "workflow" || entry.record.memoryType === "Workflow")
      .map((entry) => `Bounded by ${entry.record.ownerId}`)
  );

  const departmentLimits = [`Operates within ${agent.department} department scope`];

  // Missing information: concrete, measurable gaps.
  const missingInformation: string[] = [];
  if (report.retrievedMemories < MIN_MEMORIES) {
    missingInformation.push("Insufficient retrieved memories");
  }
  if (report.knowledgeCoverage < MIN_COVERAGE) {
    missingInformation.push("Knowledge-graph coverage below threshold");
  }
  if (policies.length === 0) {
    missingInformation.push("No governing policy found in context");
  }
  if (context.confidence.averageConfidence < 75) {
    missingInformation.push("Retrieval confidence below 75");
  }

  const completeness = computeCompleteness({
    hasPolicies: policies.length > 0,
    hasPermissions: permissions.length > 0,
    hasMemories: report.retrievedMemories >= MIN_MEMORIES,
    hasCoverage: report.knowledgeCoverage >= MIN_COVERAGE,
    hasConfidence: context.confidence.averageConfidence >= 75,
  });

  return {
    policies,
    permissions,
    workflowLimits,
    departmentLimits,
    missingInformation,
    completeness,
  };
}

function computeCompleteness(flags: Record<string, boolean>): number {
  const values = Object.values(flags);
  const satisfied = values.filter(Boolean).length;
  return round(satisfied / values.length);
}

function unique(values: string[]): string[] {
  return [...new Set(values)];
}

function round(value: number): number {
  return Math.round(value * 100) / 100;
}
