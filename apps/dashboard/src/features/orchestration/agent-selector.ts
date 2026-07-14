import { agents } from "@/features/agents/mock";
import type { Agent } from "@/types";
import type { GeneratedPlan, PlanTask } from "@/features/planning";
import type { AgentAssignment } from "@/features/orchestration/types";

function normalize(value: string) {
  return value.toLowerCase();
}

function keywordAgent(task: PlanTask): Agent | undefined {
  const text = normalize(`${task.title} ${task.description}`);

  if (text.includes("approval") || text.includes("governance")) {
    return agents.find((agent) => normalize(agent.role).includes("deal execution")) ?? agents[1];
  }
  if (text.includes("contract") || text.includes("legal")) {
    return agents.find((agent) => normalize(agent.department) === "legal");
  }
  if (text.includes("candidate") || text.includes("screening") || text.includes("hr")) {
    return agents.find((agent) => normalize(agent.name).includes("candidate screening"));
  }
  if (text.includes("learning") || text.includes("knowledge")) {
    return agents.find((agent) => normalize(agent.name).includes("knowledge base"));
  }
  if (text.includes("research")) {
    return agents.find((agent) => normalize(agent.name).includes("research"));
  }
  if (text.includes("budget") || text.includes("finance")) {
    return agents.find((agent) => normalize(agent.department) === "finance");
  }
  if (text.includes("renewal") || text.includes("enterprise") || text.includes("proposal")) {
    return agents.find((agent) => normalize(agent.department) === "sales");
  }
  return undefined;
}

function capabilityAgent(task: PlanTask): Agent | undefined {
  const firstCapability = task.requiredCapabilityIds[0];
  if (!firstCapability) return undefined;

  if (firstCapability.includes("703")) {
    return agents.find((agent) => normalize(agent.department) === "hr");
  }
  if (firstCapability.includes("701")) {
    return agents.find((agent) => normalize(agent.department) === "legal");
  }
  if (firstCapability.includes("702")) {
    return agents.find((agent) => normalize(agent.department) === "finance");
  }
  return agents.find((agent) => agent.status === "running");
}

function fallbackAgents(primaryId?: string) {
  return agents
    .filter((agent) => agent.status === "running" && agent.id !== primaryId)
    .slice(0, 2)
    .map((agent) => agent.id);
}

export function selectAgentAssignment(
  plan: GeneratedPlan,
  task: PlanTask
): AgentAssignment {
  const selected =
    keywordAgent(task) ??
    capabilityAgent(task) ??
    agents.find((agent) => normalize(agent.department) === normalize(plan.owner)) ??
    agents.find((agent) => agent.status === "running") ??
    agents[0];
  const available = selected.status === "running" || selected.status === "idle";
  const status: AgentAssignment["status"] = available
    ? task.dependencyIds.length > 0
      ? "waiting"
      : "ready"
    : "fallback";

  return {
    id: `${plan.id}-${task.id}-agent`,
    taskId: task.id,
    agentId: selected.id,
    agentRole: selected.role,
    requiredCapabilities: task.requiredCapabilityIds,
    requiredTools: task.requiredToolIds,
    assignmentReason: `${selected.name} was selected because its department/role best matches the task context and required capabilities.`,
    confidence: Math.max(64, Math.min(96, selected.status === "running" ? 88 : 72)),
    status,
    fallbackAgentIds: fallbackAgents(selected.id),
    humanEscalationRole: plan.owner,
  };
}
