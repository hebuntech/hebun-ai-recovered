import type { GovernanceResult } from "@/features/policy";
import { companyKnowledgeGraph } from "@/features/knowledge-graph";
import { agents } from "@/features/agents/mock";
import { allocateResources } from "@/features/planning/resource-planner";
import { estimateCapacity } from "@/features/planning/capacity-planner";
import { buildDependencies } from "@/features/planning/dependency-builder";
import { generateExecutionBlueprint } from "@/features/planning/execution-blueprint";
import { loadRelatedGoal, decomposeGoal } from "@/features/planning/goal-decomposer";
import { createMilestones } from "@/features/planning/milestone-builder";
import { determinePlanningPriority } from "@/features/planning/priority-engine";
import { evaluatePlanningRisks } from "@/features/planning/risk-planner";
import { defineSuccessCriteria, planStatusFromSignals } from "@/features/planning/success-criteria";
import { generatePlanTasks } from "@/features/planning/task-generator";
import { buildTimeline } from "@/features/planning/timeline-builder";
import type { GeneratedPlan } from "@/features/planning/types";

function requiredAgentIds(governance: GovernanceResult) {
  const defaultAgents = ["agent-sales", "agent-knowledge-base"];

  if (governance.relatedRegistryIds.includes("learning")) {
    return ["agent-knowledge-base", "agent-research"];
  }

  if (governance.relatedRegistryIds.includes("governance")) {
    return ["agent-sales", "agent-finance"];
  }

  return defaultAgents.filter((agentId) =>
    agents.some((agent) => agent.id === agentId)
  );
}

export function buildGeneratedPlan(governance: GovernanceResult, index: number): GeneratedPlan {
  const goal = loadRelatedGoal(governance);
  const goalDrivers = decomposeGoal(goal, governance);
  const initialTasks = generatePlanTasks(goal, governance);
  const dependencyBundle = buildDependencies(initialTasks);
  const resources = allocateResources(goal, governance);
  const capacity = estimateCapacity(dependencyBundle.tasks, resources);
  const timeline = buildTimeline(dependencyBundle.tasks, governance.timestamp);
  const milestones = createMilestones(timeline, governance);
  const risks = evaluatePlanningRisks(governance);
  const successCriteria = defineSuccessCriteria(goal, governance);
  const priority = determinePlanningPriority(governance);
  const status = planStatusFromSignals(governance, risks, resources.utilizationScore);
  const taskTitles = new Map(dependencyBundle.tasks.map((task) => [task.id, task.title]));
  const executionBlueprint = generateExecutionBlueprint(
    `plan-${governance.id}`,
    timeline,
    taskTitles,
    successCriteria,
    status,
    governance.requiredApprovals
  );

  return {
    id: `plan-${governance.id}`,
    title: `${goal.title} Planning Blueprint ${index + 1}`,
    description: `${goal.title} translated from an approved reasoning result into a deterministic, resource-aware execution plan. ${goalDrivers[0]}`,
    goalId: goal.id,
    reasoningId: governance.reasoningId,
    governanceDecisionId: governance.id,
    priority,
    status,
    owner: goal.owner,
    estimatedDuration: capacity.estimatedDuration,
    estimatedDurationDays: capacity.estimatedDurationDays,
    estimatedEffort: capacity.estimatedEffort,
    requiredCapabilities: Array.from(
      new Set(dependencyBundle.tasks.flatMap((task) => task.requiredCapabilityIds))
    ),
    requiredTools: Array.from(
      new Set(dependencyBundle.tasks.flatMap((task) => task.requiredToolIds))
    ),
    requiredAgents: requiredAgentIds(governance).slice(
      0,
      governance.relatedRegistryIds.includes("governance") ? 2 : 1
    ),
    dependencies: dependencyBundle.dependencies,
    tasks: dependencyBundle.tasks,
    milestones,
    timeline,
    successCriteria,
    riskAssessment: risks,
    resourceAllocation: resources,
    executionBlueprintId: executionBlueprint.id,
    confidence: Math.max(62, Math.min(96, governance.confidence - risks.filter((risk) => risk.level === "high").length * 4 - (status === "blocked" ? 10 : 0) + 5)),
    createdAt: governance.timestamp,
    updatedAt: timeline[timeline.length - 1]?.endDate
      ? `${timeline[timeline.length - 1].endDate}T17:00:00.000Z`
      : governance.timestamp,
    goal: {
      ...goal,
      drivers: goalDrivers,
    },
    executionBlueprint,
    relatedRegistryIds: governance.relatedRegistryIds,
    relatedGraphNodeIds: Array.from(
      new Set([
        ...governance.relatedGraphNodeIds,
        ...companyKnowledgeGraph.nodes
          .filter((node) => governance.relatedRegistryIds.includes(node.registryType))
          .slice(0, 3)
          .map((node) => node.id),
      ])
    ),
    relatedMemoryIds: governance.relatedMemoryIds,
    relatedReasoningIds: [governance.reasoningId],
    relatedGovernanceIds: [governance.id],
    governance,
  };
}
