import { agents } from "@/features/agents/mock";
import type { AgentAssignment, FallbackPlan } from "@/features/orchestration/types";

export function buildFallbackStrategy(assignments: AgentAssignment[]): FallbackPlan[] {
  return assignments.map((assignment) => ({
    taskId: assignment.taskId,
    fallbackAgents:
      assignment.fallbackAgentIds.length > 0
        ? assignment.fallbackAgentIds
        : agents
            .filter((agent) => agent.status === "running" && agent.id !== assignment.agentId)
            .slice(0, 2)
            .map((agent) => agent.id),
    fallbackHumanRole: assignment.humanEscalationRole,
    summary: `If ${assignment.agentRole} is unavailable, route the task to a fallback agent or escalate to ${assignment.humanEscalationRole}.`,
  }));
}
