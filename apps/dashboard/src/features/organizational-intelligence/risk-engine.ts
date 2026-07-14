import type { OrganizationalIntelligenceInsight, RuntimeObservationModel } from "./types";

function now(): string {
  return new Date().toISOString();
}

export const RiskEngine = {
  detect(observations: RuntimeObservationModel): OrganizationalIntelligenceInsight[] {
    const risks: OrganizationalIntelligenceInsight[] = [];

    for (const workflow of observations.workflows.filter((candidate) => candidate.executionStatus === "failed" || candidate.readiness.status === "blocked")) {
      risks.push({
        id: `workflow-risk-${workflow.identity.id}`,
        type: "risk",
        severity: workflow.executionStatus === "failed" ? "critical" : "high",
        confidence: 94,
        category: "blocked-workflow",
        sourceRuntime: "workflow-runtime",
        affectedOrganization: observations.company.identity.name,
        affectedDepartment: workflow.department?.label,
        affectedAgents: workflow.assignedAgents.map((agent) => agent.label),
        affectedWorkflows: [workflow.identity.name],
        summary: `${workflow.identity.name} is blocked in the workflow runtime.`,
        evidence: workflow.blockingIssues.length > 0 ? workflow.blockingIssues : [workflow.statusSummary.detail],
        recommendedNextAction: "Review the blocking workflow path and resolve the highest-impact readiness constraint.",
        createdAt: now(),
      });
    }

    for (const agent of observations.agents.filter((candidate) => candidate.status === "idle" || candidate.workload.state === "light")) {
      risks.push({
        id: `agent-risk-${agent.identity.id}`,
        type: "risk",
        severity: "medium",
        confidence: 82,
        category: "idle-agent",
        sourceRuntime: "agent-runtime",
        affectedOrganization: observations.company.identity.name,
        affectedDepartment: agent.department?.label,
        affectedAgents: [agent.identity.name],
        affectedWorkflows: agent.assignedWorkflows.map((workflow) => workflow.label),
        summary: `${agent.identity.name} is carrying low active workload.`,
        evidence: [agent.workload.summary, agent.statusSummary.detail],
        recommendedNextAction: "Rebalance work assignment or confirm whether this agent should remain on standby.",
        createdAt: now(),
      });
    }

    for (const workflow of observations.workflows.filter((candidate) => candidate.assignedAgents.length === 0)) {
      risks.push({
        id: `orphan-workflow-${workflow.identity.id}`,
        type: "risk",
        severity: "high",
        confidence: 96,
        category: "orphan-workflow",
        sourceRuntime: "workflow-runtime",
        affectedOrganization: observations.company.identity.name,
        affectedDepartment: workflow.department?.label,
        affectedAgents: [],
        affectedWorkflows: [workflow.identity.name],
        summary: `${workflow.identity.name} has no assigned agent runtime.`,
        evidence: ["Workflow runtime returned zero assigned agents."],
        recommendedNextAction: "Attach ownership before relying on this workflow for operational execution.",
        createdAt: now(),
      });
    }

    for (const workflow of observations.workflows.filter((candidate) => !candidate.department)) {
      risks.push({
        id: `missing-department-${workflow.identity.id}`,
        type: "risk",
        severity: "high",
        confidence: 93,
        category: "missing-department",
        sourceRuntime: "workflow-runtime",
        affectedOrganization: observations.company.identity.name,
        affectedAgents: workflow.assignedAgents.map((agent) => agent.label),
        affectedWorkflows: [workflow.identity.name],
        summary: `${workflow.identity.name} is not mapped to a department runtime.`,
        evidence: ["Workflow runtime could not resolve a department reference."],
        recommendedNextAction: "Resolve the workflow-to-department mapping so responsibility is explicit.",
        createdAt: now(),
      });
    }

    if (observations.knowledge.lowCoverageWorkflows > 0) {
      risks.push({
        id: "knowledge-gap",
        type: "risk",
        severity: "medium",
        confidence: 79,
        category: "knowledge-gap",
        sourceRuntime: "workflow-runtime",
        affectedOrganization: observations.company.identity.name,
        affectedAgents: [],
        affectedWorkflows: observations.workflows
          .filter((workflow) => workflow.knowledgeReferences.length === 0)
          .map((workflow) => workflow.identity.name),
        summary: "Several workflows are operating with little or no linked knowledge context.",
        evidence: [`${observations.knowledge.lowCoverageWorkflows} workflows have zero knowledge references.`],
        recommendedNextAction: "Increase knowledge linkage for the least-contextualized workflows before scaling them further.",
        createdAt: now(),
      });
    }

    if (observations.memory.lowCoverageWorkflows > 0) {
      risks.push({
        id: "memory-gap",
        type: "risk",
        severity: "medium",
        confidence: 76,
        category: "memory-gap",
        sourceRuntime: "memory-engine",
        affectedOrganization: observations.company.identity.name,
        affectedAgents: [],
        affectedWorkflows: observations.workflows
          .filter((workflow) => workflow.memoryReferences.length === 0)
          .map((workflow) => workflow.identity.name),
        summary: "Workflow memory coverage is thin in parts of the organization.",
        evidence: [
          `${observations.memory.lowCoverageWorkflows} workflows returned no linked memory references.`,
          `Memory engine knowledge coverage is ${Math.round(observations.memory.report.knowledgeCoverage * 100)}%.`,
        ],
        recommendedNextAction: "Capture or associate more operational memory for workflows missing reusable context.",
        createdAt: now(),
      });
    }

    if (observations.governance.metrics.pendingApprovals > 0) {
      risks.push({
        id: "governance-bottleneck",
        type: "risk",
        severity: observations.governance.metrics.pendingApprovals >= 8 ? "high" : "medium",
        confidence: 88,
        category: "organization-bottleneck",
        sourceRuntime: "governance-runtime",
        affectedOrganization: observations.company.identity.name,
        affectedAgents: observations.governance.approvals.map((approval) => approval.owner),
        affectedWorkflows: [],
        summary: "Governance approval load is creating organizational drag.",
        evidence: [
          `${observations.governance.metrics.pendingApprovals} approvals are pending.`,
          `${observations.governance.approvals.filter((approval) => approval.status === "escalated").length} approvals are escalated.`,
        ],
        recommendedNextAction: "Clear the oldest escalations and rebalance approval ownership where possible.",
        createdAt: now(),
      });
    }

    return risks
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 8);
  },
};
