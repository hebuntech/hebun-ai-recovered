import { getSnapshot as getAgentSnapshot } from "@/features/agent-crud/agent-adapter";
import type { AgentCrudRecord } from "@/features/agent-crud/types";
import { getNodeSnapshot } from "@/features/knowledge-crud/node-adapter";
import { getSnapshot as getMemorySnapshot } from "@/features/memory-crud/memory-adapter";
import { getSnapshot as getWorkflowSnapshot } from "@/features/workflow-crud/workflow-adapter";
import { getAgentExecutionReadiness } from "@/features/execution-readiness";
import type { GoalRuntimeModel } from "@/features/goal-runtime/types";
import type { MissionRuntimeModel } from "@/features/mission-runtime/types";
import type { OrganizationRuntimeSnapshot } from "@/features/organization-runtime/types";
import { AgentAuthorityService } from "@/features/agent-runtime/agent-authority-service";
import { AgentCapabilityService } from "@/features/agent-runtime/agent-capability-service";
import { AgentContextService } from "@/features/agent-runtime/agent-context-service";
import { AgentHealthService } from "@/features/agent-runtime/agent-health-service";
import { AgentResponsibilityService } from "@/features/agent-runtime/agent-responsibility-service";
import { AgentWorkloadService } from "@/features/agent-runtime/agent-workload-service";
import type {
  AgentEmployeeRuntimeModel,
  AgentExecutionReadinessProfile,
  AgentKnowledgeProfile,
  AgentLearningProfile,
  AgentMemoryProfile,
  AgentReasoningProfile,
  AgentStatusSummary,
} from "@/features/agent-runtime/types";
import { createProjectionBuilder } from "../projection-builder";

function buildKnowledgeProfile(agent: AgentCrudRecord): AgentKnowledgeProfile {
  const nodes = getNodeSnapshot().filter(
    (node) =>
      node.lifecycleStatus === "active" &&
      (node.ownerId === agent.department.toLowerCase() ||
        node.tags.includes(agent.department.toLowerCase()) ||
        node.tags.includes("agents")),
  );
  const verifiedNodes = nodes.filter((node) => node.status === "verified").length;
  const topDomains = [...new Set(nodes.slice(0, 4).map((node) => node.nodeType))];

  return {
    totalNodes: nodes.length,
    verifiedNodes,
    topDomains,
    summary: `${nodes.length} nodes · ${verifiedNodes} verified`,
  };
}

function buildMemoryProfile(agent: AgentCrudRecord): AgentMemoryProfile {
  const context = AgentContextService.getContextSummary(agent);
  const ownedMemories = getMemorySnapshot().filter(
    (memory) =>
      memory.lifecycleStatus === "active" &&
      ((memory.ownerType === "agent" && memory.ownerId === agent.id) ||
        (memory.ownerType === "department" &&
          memory.ownerId === agent.department.toLowerCase().replace(/[^a-z0-9]+/g, "-"))),
  ).length;

  return {
    ownedMemories,
    contextualMemories: context.report?.retrievedMemories ?? 0,
    relatedMemories: context.report?.relatedMemories ?? 0,
    contextHealth: context.report?.contextHealth ?? 0,
    summary:
      context.report
        ? `${ownedMemories} owned · ${context.report.retrievedMemories} contextual · health ${context.report.contextHealth}`
        : `${ownedMemories} owned memories`,
  };
}

function buildReasoningProfile(agent: AgentCrudRecord): AgentReasoningProfile {
  const context = AgentContextService.getContextSummary(agent);
  const confidenceScore = Math.round(
    Math.max(40, Math.min(99, (context.report?.averageConfidence ?? 60) * 0.7 + (context.report?.knowledgeCoverage ?? 0.4) * 30)),
  );

  return {
    model: agent.model,
    confidenceScore,
    contextHealthLabel: context.report?.contextHealthLabel ?? "empty",
    summary: `${agent.model} · confidence ${confidenceScore} · context ${context.report?.contextHealthLabel ?? "empty"}`,
  };
}

function buildLearningProfile(agent: AgentCrudRecord): AgentLearningProfile {
  const nodes = getNodeSnapshot().filter(
    (node) =>
      node.lifecycleStatus === "active" &&
      node.nodeType === "Learning" &&
      (node.tags.includes(agent.department.toLowerCase()) || node.tags.includes("agents")),
  );
  const memories = getMemorySnapshot().filter(
    (memory) =>
      memory.lifecycleStatus === "active" &&
      memory.source.startsWith("learning") &&
      (memory.ownerId === agent.department.toLowerCase().replace(/[^a-z0-9]+/g, "-") ||
        memory.ownerId === agent.id),
  );

  return {
    relatedLearningNodes: nodes.length,
    relatedLearningMemories: memories.length,
    improvementSignals: nodes.length + memories.length,
    summary: `${nodes.length} learning nodes · ${memories.length} learning memories`,
  };
}

function buildExecutionReadiness(agent: AgentCrudRecord): AgentExecutionReadinessProfile {
  const readiness = getAgentExecutionReadiness(agent.id);
  if (!readiness) {
    return {
      status: "unavailable",
      score: 0,
      blockers: 0,
      summary: "No execution-readiness record is available for this agent.",
      source: null,
    };
  }

  return {
    status: readiness.summary.status,
    score: readiness.summary.score,
    blockers: readiness.summary.blockers,
    summary: readiness.report.estimatedDispatchReadiness,
    source: readiness,
  };
}

function buildStatusSummary(agent: AgentCrudRecord, healthScore: number, readiness: AgentExecutionReadinessProfile): AgentStatusSummary {
  return {
    headline: `${agent.status} · ${healthScore}% health`,
    detail: readiness.status === "unavailable" ? "Awaiting readiness wiring." : readiness.summary,
  };
}

function projectAgent(
  agent: AgentCrudRecord,
  organizationProjection: OrganizationRuntimeSnapshot,
  goals: readonly GoalRuntimeModel[],
  missions: readonly MissionRuntimeModel[],
): AgentEmployeeRuntimeModel {
  const runtimeAgent = organizationProjection.agents.find(
    (candidate) => candidate.identity.id === agent.id,
  );
  if (!runtimeAgent) {
    throw new Error(`Missing organization runtime agent for ${agent.id}`);
  }

  const company = organizationProjection.company;
  const role = runtimeAgent.role
    ? organizationProjection.roles.find(
        (candidate) => candidate.identity.id === runtimeAgent.role?.id,
      )
    : undefined;
  const relatedWorkflows = getWorkflowSnapshot().filter(
    (workflow) =>
      workflow.lifecycleStatus === "active" &&
      (workflow.ownerAgent === agent.name || workflow.assignedAgents.includes(agent.name)),
  );
  const department = runtimeAgent.department
    ? organizationProjection.departments.find(
        (candidate) => candidate.identity.id === runtimeAgent.department?.id,
      )
    : undefined;

  const currentContext = AgentContextService.getContextSummary(agent);
  const responsibilities = AgentResponsibilityService.buildResponsibilities(
    agent,
    relatedWorkflows,
    getNodeSnapshot().filter((node) => node.lifecycleStatus === "active"),
    goals,
    missions,
  );
  const capabilities = AgentCapabilityService.buildCapabilityProfile(agent, relatedWorkflows);
  const authority = AgentAuthorityService.buildAuthorityProfile(agent, role);
  const workload = AgentWorkloadService.buildWorkloadProfile(agent, relatedWorkflows);
  const readiness = buildExecutionReadiness(agent);
  const { health, riskLevel } = AgentHealthService.buildHealth(
    agent,
    currentContext,
    workload,
    readiness,
  );
  const knowledgeProfile = buildKnowledgeProfile(agent);
  const memoryProfile = buildMemoryProfile(agent);
  const reasoningProfile = buildReasoningProfile(agent);
  const learningProfile = buildLearningProfile(agent);

  return {
    identity: runtimeAgent.identity,
    department: runtimeAgent.department,
    manager: runtimeAgent.relationships.reportsTo,
    owner: runtimeAgent.relationships.ownership.owner,
    lifecycle: runtimeAgent.lifecycle,
    health,
    capabilities,
    currentContext,
    assignedWork: responsibilities.assignedWork,
    assignedGoals: responsibilities.assignedGoals,
    assignedMissions: responsibilities.assignedMissions,
    assignedWorkflows: responsibilities.assignedWorkflows,
    knowledgeProfile,
    memoryProfile,
    reasoningProfile,
    learningProfile,
    authority,
    riskLevel,
    executionReadiness: readiness,
    workload,
    status: agent.status,
    statusSummary: buildStatusSummary(agent, health.score, readiness),
    runtime: agent.runtime,
    provider: agent.provider,
    organization: runtimeAgent.organization,
    company: {
      kind: company.identity.kind,
      id: company.identity.id,
      label: company.identity.name,
    },
    relationships: {
      parent: department
        ? {
            kind: department.identity.kind,
            id: department.identity.id,
            label: department.identity.name,
          }
        : runtimeAgent.organization,
      memberships: runtimeAgent.relationships.memberships,
      reportsTo: runtimeAgent.relationships.reportsTo,
    },
  };
}

function buildAgentProjection(
  snapshot: OrganizationRuntimeSnapshot,
  goals: readonly GoalRuntimeModel[],
  missions: readonly MissionRuntimeModel[],
): AgentEmployeeRuntimeModel[] {
  return getAgentSnapshot()
    .filter((agent) => agent.lifecycleStatus === "active")
    .map((agent) => projectAgent(agent, snapshot, goals, missions))
    .sort((a, b) => a.identity.name.localeCompare(b.identity.name));
}

export const AgentProjectionBuilder = createProjectionBuilder({
  collection: "agent-runtime",
  owner: "Agent Runtime",
  dependencies: ["organization-runtime", "goal-runtime", "mission-runtime"],
  build: (context) => {
    const snapshot =
      context.getSnapshot<OrganizationRuntimeSnapshot>("organization-runtime");
    const goals = context.getSnapshot<GoalRuntimeModel[]>("goal-runtime");
    const missions = context.getSnapshot<MissionRuntimeModel[]>("mission-runtime");
    if (!snapshot || !goals || !missions) {
      throw new Error(
        "Organization, goal, and mission projections are required before agent projection.",
      );
    }
    return buildAgentProjection(snapshot.data, goals.data, missions.data);
  },
  count: (snapshot) => snapshot.length,
});
