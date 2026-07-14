import { planningInputsForOrchestration } from "@/features/orchestration/orchestrator-engine";
import { selectAgentAssignment } from "@/features/orchestration/agent-selector";
import { mapHumanAssignment } from "@/features/orchestration/role-mapper";
import { buildCapabilityRequirements, buildToolAssignments } from "@/features/orchestration/task-router";
import { resolveDependencyMap } from "@/features/orchestration/dependency-resolver";
import { identifyParallelGroups } from "@/features/orchestration/parallelization-engine";
import { planHandoffs } from "@/features/orchestration/handoff-planner";
import { buildApprovalGates } from "@/features/orchestration/approval-gate";
import { assessAvailability } from "@/features/orchestration/availability-engine";
import { buildFallbackStrategy } from "@/features/orchestration/fallback-engine";
import { determineCoordinationStrategy, orchestrationStatus } from "@/features/orchestration/coordination-engine";
import { validateOrchestrationPlan } from "@/features/orchestration/orchestration-validator";
import type {
  OrchestrationBlueprint,
  OrchestrationExplanation,
  OrchestrationPipelineStep,
  OrchestrationRisk,
} from "@/features/orchestration/types";
import type { GeneratedPlan } from "@/features/planning";

export const orchestrationPipelineSteps: OrchestrationPipelineStep[] = [
  { id: "receive-plan", label: "Receive Execution Blueprint from Planning Engine", description: "Use the planning blueprint as the orchestration input." },
  { id: "load-capacity", label: "Load Available Agents, Roles, Tools, Capabilities", description: "Read available coordination surfaces from existing system data." },
  { id: "map-capabilities", label: "Map Tasks to Required Capabilities", description: "Preserve explicit capability and tool requirements per task." },
  { id: "select-owner", label: "Select Best Agent or Human Owner", description: "Assign the most suitable agent and escalation role." },
  { id: "resolve-dependencies", label: "Resolve Task Dependencies", description: "Preserve sequencing and blocker rules from planning." },
  { id: "parallelize", label: "Identify Parallelizable Work", description: "Carry forward safe parallel groups from the planning blueprint." },
  { id: "handoffs", label: "Plan Handoffs", description: "Define owner transitions and context transfer requirements." },
  { id: "approval-gates", label: "Validate Approval Gates", description: "Keep governance approvals explicit inside orchestration." },
  { id: "availability", label: "Evaluate Availability and Capacity", description: "Check whether assigned owners are usable or overloaded." },
  { id: "fallbacks", label: "Create Fallback Strategy", description: "Define alternate owners and escalation routes before execution exists." },
  { id: "coordination", label: "Build Coordination Plan", description: "Choose the deterministic strategy for sequencing and control." },
  { id: "validate", label: "Validate Orchestration Plan", description: "Check ownership, dependencies, approvals, overload, and fallback coverage." },
  { id: "blueprint", label: "Produce Final Orchestration Blueprint", description: "Emit the final explainable coordination artifact." },
];

function buildRisks(
  plan: GeneratedPlan,
  availability: OrchestrationBlueprint["availabilityAssessment"],
  validationIssues: string[]
): OrchestrationRisk[] {
  const risks: OrchestrationRisk[] = [
    {
      id: `${plan.id}-orch-risk-1`,
      title: "Approval-aware orchestration pressure",
      level: plan.governance.governanceDecision.status === "approval-required" ? "high" : "medium",
      detail: "Approvals can interrupt coordination flow unless they are placed before wide parallelization begins.",
      mitigation: "Keep approval-gated tasks close to the front of the critical path.",
    },
    {
      id: `${plan.id}-orch-risk-2`,
      title: "Availability drift across assigned owners",
      level: availability.overloadedAgents.length > 0 ? "high" : "low",
      detail: availability.summary,
      mitigation: "Use fallback owners and constrain riskier assignments.",
    },
  ];

  if (validationIssues.length > 0) {
    risks.push({
      id: `${plan.id}-orch-risk-3`,
      title: "Structural orchestration gaps remain",
      level: "high",
      detail: validationIssues.join(" "),
      mitigation: "Resolve ownership and fallback gaps before any execution layer consumes the blueprint.",
    });
  }

  if (plan.riskAssessment.some((risk) => risk.level === "critical")) {
    risks.push({
      id: `${plan.id}-orch-risk-4`,
      title: "Critical planning risk narrows coordination freedom",
      level: "critical",
      detail: "The upstream plan contains at least one critical planning risk, so the orchestration blueprint must remain tightly controlled.",
      mitigation: "Prefer human-in-the-loop or fallback-first coordination paths.",
    });
  }

  return risks;
}

function buildExplanation(
  blueprint: Pick<
    OrchestrationBlueprint,
    "agentAssignments" | "handoffs" | "approvalGates" | "fallbackStrategy" | "coordinationStrategy"
  >
): OrchestrationExplanation {
  return {
    summary: `${blueprint.coordinationStrategy} coordination was selected based on the current approval posture, dependency map, and owner availability.`,
    assignmentTrace: blueprint.agentAssignments.map(
      (assignment) => `${assignment.taskId} -> ${assignment.agentRole} (${assignment.assignmentReason})`
    ),
    handoffTrace: blueprint.handoffs.map(
      (handoff) => `${handoff.fromOwner} -> ${handoff.toOwner} (${handoff.handoffType})`
    ),
    approvalTrace: blueprint.approvalGates.map(
      (gate) => `${gate.mode}: ${gate.summary}`
    ),
    fallbackTrace: blueprint.fallbackStrategy.map(
      (fallback) => `${fallback.taskId}: ${fallback.summary}`
    ),
  };
}

function buildBlueprint(plan: GeneratedPlan, index: number): OrchestrationBlueprint {
  const agentAssignments = plan.tasks.map((task) => selectAgentAssignment(plan, task));
  const humanAssignments = plan.tasks
    .map((task) => mapHumanAssignment(plan, task))
    .filter((item): item is NonNullable<typeof item> => Boolean(item));
  const toolAssignments = buildToolAssignments(plan);
  const capabilityRequirements = buildCapabilityRequirements(plan);
  const dependencyMap = resolveDependencyMap(plan);
  const parallelGroups = identifyParallelGroups(plan);
  const handoffs = planHandoffs(plan, agentAssignments, humanAssignments);
  const approvalGates = buildApprovalGates(plan);
  const availabilityAssessment = assessAvailability(agentAssignments);
  const fallbackStrategy = buildFallbackStrategy(agentAssignments);
  const validationResult = validateOrchestrationPlan(
    plan,
    agentAssignments,
    humanAssignments,
    approvalGates,
    availabilityAssessment,
    fallbackStrategy
  );
  const coordinationStrategy = determineCoordinationStrategy(
    plan,
    parallelGroups,
    availabilityAssessment
  );
  const riskAssessment = buildRisks(plan, availabilityAssessment, validationResult.issues);
  const status = orchestrationStatus(
    coordinationStrategy,
    validationResult,
    availabilityAssessment
  );
  const explanation = buildExplanation({
    agentAssignments,
    handoffs,
    approvalGates,
    fallbackStrategy,
    coordinationStrategy,
  });

  return {
    id: `orch-${plan.id}-${index + 1}`,
    planId: plan.id,
    planningBlueprintId: plan.executionBlueprintId,
    status,
    coordinationStrategy,
    agentAssignments,
    humanAssignments,
    toolAssignments,
    capabilityRequirements,
    dependencyMap,
    parallelGroups,
    handoffs,
    approvalGates,
    availabilityAssessment,
    fallbackStrategy,
    riskAssessment,
    validationResult,
    confidence: Math.max(60, Math.min(96, plan.confidence - validationResult.issues.length * 5 - availabilityAssessment.overloadedAgents.length * 4 + 6)),
    explanation,
    createdAt: plan.createdAt,
    updatedAt: plan.updatedAt,
    relatedRegistryIds: plan.relatedRegistryIds,
    relatedGraphNodeIds: plan.relatedGraphNodeIds,
    relatedMemoryIds: plan.relatedMemoryIds,
    relatedReasoningIds: plan.relatedReasoningIds,
    relatedGovernanceIds: plan.relatedGovernanceIds,
    relatedPlanningIds: [plan.id],
    plan,
  };
}

export const orchestrationBlueprints: OrchestrationBlueprint[] =
  planningInputsForOrchestration.map(buildBlueprint);
