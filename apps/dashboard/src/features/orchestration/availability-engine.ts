import { agents } from "@/features/agents/mock";
import type { AgentAssignment, AvailabilityAssessment } from "@/features/orchestration/types";

export function assessAvailability(
  assignments: AgentAssignment[]
): AvailabilityAssessment {
  const usedAgents = assignments.map((assignment) =>
    agents.find((agent) => agent.id === assignment.agentId)
  );
  const isDefinedAgent = <T>(value: T | undefined): value is T => Boolean(value);
  const availableAgents = usedAgents
    .filter(isDefinedAgent)
    .filter((agent) => agent.status === "running" || agent.status === "idle")
    .map((agent) => agent.name);
  const constrainedAgents = usedAgents
    .filter(isDefinedAgent)
    .filter((agent) => agent.status === "paused")
    .map((agent) => agent.name);
  const overloadedAgents = usedAgents
    .filter(isDefinedAgent)
    .filter((agent) => agent.tasksToday >= 40 || agent.status === "error")
    .map((agent) => agent.name);

  return {
    availableAgents,
    constrainedAgents,
    overloadedAgents,
    humanCoverage: Array.from(new Set(assignments.map((assignment) => assignment.humanEscalationRole))),
    summary:
      overloadedAgents.length > 0
        ? `${availableAgents.length} agents are usable, but ${overloadedAgents.length} assignment owner(s) show load or availability pressure.`
        : `${availableAgents.length} agents are available with explicit human escalation coverage.`,
  };
}
