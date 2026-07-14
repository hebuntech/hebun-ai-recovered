import type { OrganizationalIntelligenceInsight, RuntimeObservationModel } from "./types";

function now(): string {
  return new Date().toISOString();
}

export const OpportunityEngine = {
  detect(observations: RuntimeObservationModel): OrganizationalIntelligenceInsight[] {
    const opportunities: OrganizationalIntelligenceInsight[] = [];

    const idleAgents = observations.agents.filter(
      (agent) => agent.status === "idle" || agent.workload.state === "light",
    );
    if (idleAgents.length > 0) {
      opportunities.push({
        id: "agent-capacity-opportunity",
        type: "opportunity",
        severity: "low",
        confidence: 87,
        category: "agent-utilization",
        sourceRuntime: "agent-runtime",
        affectedOrganization: observations.company.identity.name,
        affectedAgents: idleAgents.map((agent) => agent.identity.name),
        affectedWorkflows: [],
        summary: "Unused agent capacity is available across the runtime.",
        evidence: idleAgents.map((agent) => agent.workload.summary).slice(0, 3),
        recommendedNextAction: "Route low-risk operational work toward the least-utilized agents first.",
        createdAt: now(),
      });
    }

    const reusableKnowledgeWorkflows = observations.workflows.filter(
      (workflow) => workflow.knowledgeReferences.length >= 2 && workflow.progress.successRate >= 90,
    );
    if (reusableKnowledgeWorkflows.length > 0) {
      opportunities.push({
        id: "knowledge-reuse-opportunity",
        type: "opportunity",
        severity: "medium",
        confidence: 84,
        category: "knowledge-reuse",
        sourceRuntime: "workflow-runtime",
        affectedOrganization: observations.company.identity.name,
        affectedAgents: [],
        affectedWorkflows: reusableKnowledgeWorkflows.map((workflow) => workflow.identity.name),
        summary: "High-performing workflows already have reusable knowledge attached.",
        evidence: reusableKnowledgeWorkflows
          .slice(0, 3)
          .map((workflow) => `${workflow.identity.name} has ${workflow.knowledgeReferences.length} linked knowledge references.`),
        recommendedNextAction: "Reuse those workflow patterns when expanding similar operational paths.",
        createdAt: now(),
      });
    }

    const memoryReadyWorkflows = observations.workflows.filter(
      (workflow) => workflow.memoryReferences.length >= 2 && workflow.progress.successRate >= 90,
    );
    if (memoryReadyWorkflows.length > 0) {
      opportunities.push({
        id: "memory-promotion-opportunity",
        type: "opportunity",
        severity: "low",
        confidence: 78,
        category: "memory-promotion",
        sourceRuntime: "memory-engine",
        affectedOrganization: observations.company.identity.name,
        affectedAgents: [],
        affectedWorkflows: memoryReadyWorkflows.map((workflow) => workflow.identity.name),
        summary: "Several workflows now have enough memory context to become repeatable operating patterns.",
        evidence: memoryReadyWorkflows
          .slice(0, 3)
          .map((workflow) => `${workflow.identity.name} has ${workflow.memoryReferences.length} linked memory references.`),
        recommendedNextAction: "Review the strongest workflow memory bundles for promotion into broader organizational use.",
        createdAt: now(),
      });
    }

    const consolidationGroups = new Map<string, string[]>();
    for (const workflow of observations.workflows) {
      const key = `${workflow.department?.label ?? "Organization"}:${workflow.assignedAgents[0]?.label ?? "unassigned"}`;
      const existing = consolidationGroups.get(key) ?? [];
      existing.push(workflow.identity.name);
      consolidationGroups.set(key, existing);
    }
    const consolidationTarget = [...consolidationGroups.values()].find((group) => group.length >= 2);
    if (consolidationTarget) {
      opportunities.push({
        id: "workflow-consolidation-opportunity",
        type: "opportunity",
        severity: "medium",
        confidence: 73,
        category: "workflow-consolidation",
        sourceRuntime: "workflow-runtime",
        affectedOrganization: observations.company.identity.name,
        affectedAgents: [],
        affectedWorkflows: consolidationTarget,
        summary: "A set of workflows appears similar enough to review for consolidation.",
        evidence: [`${consolidationTarget.length} workflows share department and primary runtime ownership.`],
        recommendedNextAction: "Inspect overlapping workflow responsibilities and merge redundant paths where safe.",
        createdAt: now(),
      });
    }

    const departmentsWithCapacity = observations.departments.filter(
      (department) => department.health.score >= 80 && department.agents.length > 0,
    );
    if (departmentsWithCapacity.length > 0) {
      opportunities.push({
        id: "organization-improvement-opportunity",
        type: "opportunity",
        severity: "low",
        confidence: 71,
        category: "organization-improvement",
        sourceRuntime: "organization-runtime",
        affectedOrganization: observations.company.identity.name,
        affectedAgents: [],
        affectedWorkflows: [],
        summary: "Healthier departments have room to absorb more operational responsibility.",
        evidence: departmentsWithCapacity
          .slice(0, 3)
          .map((department) => `${department.identity.name} is at ${department.health.score}% health.`),
        recommendedNextAction: "Use the healthiest departments as pilots for the next organizational runtime expansion.",
        createdAt: now(),
      });
    }

    return opportunities.slice(0, 8);
  },
};
