import { companyKnowledgeGraph } from "@/features/knowledge-graph";
import type { GovernanceResult } from "@/features/policy";
import type { PlanningGoal, PlanningResource, ResourceAllocation } from "@/features/planning/types";
import { registryRecords } from "@/features/registries";

function resourceFromRecord(
  category: PlanningResource["category"],
  title: string,
  owner: string,
  detail: string,
  referenceId?: string
): PlanningResource {
  return {
    id: `${category}-${referenceId ?? title.toLowerCase().replace(/\s+/g, "-")}`,
    category,
    title,
    owner,
    detail,
    referenceId,
  };
}

export function allocateResources(goal: PlanningGoal, governance: GovernanceResult): ResourceAllocation {
  const relatedWorkflow = registryRecords.workflows[0];
  const relatedAgent = registryRecords.agents[0];
  const relatedModel = registryRecords.models[0];
  const resources: PlanningResource[] = [
    resourceFromRecord("people", goal.owner, goal.owner, "Business owner for plan acceptance."),
    resourceFromRecord("people", "Director", "Director", "Executive decision owner for milestone review."),
    resourceFromRecord("ai-agents", relatedAgent.name, relatedAgent.owner, "Existing agent surface that would eventually consume the blueprint.", relatedAgent.id),
    resourceFromRecord("tools", registryRecords.tools[0].name, registryRecords.tools[0].owner, "Primary tool surface referenced by required capabilities.", registryRecords.tools[0].id),
    resourceFromRecord("models", relatedModel.name, relatedModel.owner, "Approved model routing path available to downstream execution.", relatedModel.id),
    resourceFromRecord("workflows", relatedWorkflow.name, relatedWorkflow.owner, "Existing workflow destination for future plan orchestration.", relatedWorkflow.id),
    resourceFromRecord("capabilities", registryRecords.capabilities[0].name, registryRecords.capabilities[0].owner, "Primary capability needed to operationalize approved work.", registryRecords.capabilities[0].id),
    resourceFromRecord("budgets", "Planning budget band", "Finance", "Moderate operational planning spend with no new infrastructure required."),
    resourceFromRecord("time", "Planning window", "Planning Engine", `${Math.max(10, governance.reasoning.selectedOption.actions.length * 3 + 6)} day planning envelope.`),
  ];

  const utilizationScore = Math.max(
    68,
    Math.min(
      94,
      70 +
        governance.reasoning.selectedOption.actions.length * 5 +
        governance.approvalRequirements.length * 4 +
        Math.round(companyKnowledgeGraph.edges.length / 100)
    )
  );

  return {
    resources,
    utilizationScore,
    budgetBand: governance.riskAssessment.level === "high" || governance.riskAssessment.level === "critical" ? "elevated control budget" : "standard planning budget",
    timeWindow: `${Math.max(10, governance.reasoning.selectedOption.actions.length * 3 + 6)} days`,
    summary: `${resources.length} reusable resources are referenced from existing registries, graph assets, and governance records. No duplicate planning data is introduced.`,
  };
}
