import type { RuntimeObservationModel } from "@/features/organizational-intelligence";
import type { TransformationGap } from "./types";

function gap(
  input: Omit<TransformationGap, "id"> & { id: string },
): TransformationGap {
  return input;
}

export const TransformationGapEngine = {
  detect(observations: RuntimeObservationModel): TransformationGap[] {
    const gaps: TransformationGap[] = [];

    if (observations.departments.length === 0) {
      gaps.push(
        gap({
          id: "gap-missing-departments",
          domain: "organization",
          severity: "critical",
          confidence: 98,
          affectedScope: observations.company.identity.name,
          summary: "Department structure is missing from the runtime.",
          evidence: ["Organization runtime returned zero departments."],
          consequence: "Responsibility, reporting, and transformation sequencing remain ambiguous.",
          recommendedResponse: "Formalize department structure before expanding AI operating scope.",
        }),
      );
    }

    const ownerlessAgents = observations.agents.filter((agent) => !agent.owner);
    for (const agent of ownerlessAgents) {
      gaps.push(
        gap({
          id: `gap-agent-owner-${agent.identity.id}`,
          domain: "agents",
          severity: "high",
          confidence: 92,
          affectedScope: agent.identity.name,
          summary: `${agent.identity.name} has no explicit owner in the agent runtime.`,
          evidence: [agent.statusSummary.detail],
          consequence: "Agent supervision and transformation accountability remain unclear.",
          recommendedResponse: "Assign a human or managerial owner before widening this agent's role.",
        }),
      );
    }

    const incompleteAuthorityAgents = observations.agents.filter(
      (agent) => agent.authority.permissions.length === 0,
    );
    for (const agent of incompleteAuthorityAgents) {
      gaps.push(
        gap({
          id: `gap-agent-authority-${agent.identity.id}`,
          domain: "agents",
          severity: "medium",
          confidence: 86,
          affectedScope: agent.identity.name,
          summary: `${agent.identity.name} has incomplete authority metadata.`,
          evidence: [agent.authority.summary],
          consequence: "Authority boundaries stay implicit, which weakens safe scale-up.",
          recommendedResponse: "Complete authority and permission metadata for the agent runtime.",
        }),
      );
    }

    const unlinkedWorkflows = observations.workflows.filter(
      (workflow) => !workflow.goal || !workflow.plan,
    );
    for (const workflow of unlinkedWorkflows) {
      gaps.push(
        gap({
          id: `gap-workflow-lineage-${workflow.identity.id}`,
          domain: "workflows",
          severity: "high",
          confidence: 94,
          affectedScope: workflow.identity.name,
          summary: `${workflow.identity.name} is missing Goal or Plan lineage.`,
          evidence: [
            workflow.goal ? "Goal linkage exists." : "Goal linkage is missing.",
            workflow.plan ? "Plan linkage exists." : "Plan linkage is missing.",
          ],
          consequence: "Transformation cannot reliably align workflow improvement with strategic intent.",
          recommendedResponse: "Connect the workflow to explicit strategic lineage before orchestration scale-up.",
        }),
      );
    }

    const orphanWorkflows = observations.workflows.filter(
      (workflow) => workflow.assignedAgents.length === 0 || workflow.responsibleHumans.length === 0,
    );
    for (const workflow of orphanWorkflows) {
      gaps.push(
        gap({
          id: `gap-workflow-ownership-${workflow.identity.id}`,
          domain: "workflows",
          severity: "high",
          confidence: 90,
          affectedScope: workflow.identity.name,
          summary: `${workflow.identity.name} lacks complete workflow responsibility coverage.`,
          evidence: [
            `${workflow.assignedAgents.length} assigned agents`,
            `${workflow.responsibleHumans.length} responsible humans`,
          ],
          consequence: "Workflow transformation can stall because operating ownership is incomplete.",
          recommendedResponse: "Attach both digital and human ownership before depending on this workflow.",
        }),
      );
    }

    const unhealthyWorkflows = observations.workflows.filter(
      (workflow) => workflow.executionStatus === "failed" || workflow.health.score < 70,
    );
    for (const workflow of unhealthyWorkflows) {
      gaps.push(
        gap({
          id: `gap-workflow-health-${workflow.identity.id}`,
          domain: "workflows",
          severity: workflow.executionStatus === "failed" ? "critical" : "medium",
          confidence: 88,
          affectedScope: workflow.identity.name,
          summary: `${workflow.identity.name} is not healthy enough for broader transformation scale-up.`,
          evidence: [workflow.health.summary, ...workflow.blockingIssues],
          consequence: "Weak operational health reduces confidence in transformation sequencing.",
          recommendedResponse: "Stabilize workflow health before using it as a transformation building block.",
        }),
      );
    }

    if (observations.knowledge.lowCoverageWorkflows > 0) {
      gaps.push(
        gap({
          id: "gap-knowledge-coverage",
          domain: "knowledge",
          severity: "medium",
          confidence: 81,
          affectedScope: observations.company.identity.name,
          summary: "Knowledge coverage is incomplete across active workflows.",
          evidence: [`${observations.knowledge.lowCoverageWorkflows} workflows have no knowledge references.`],
          consequence: "The organization cannot reliably reuse what it already knows.",
          recommendedResponse: "Increase workflow-to-knowledge coverage before wider AI-native rollout.",
        }),
      );
    }

    if (observations.memory.lowCoverageWorkflows > 0) {
      gaps.push(
        gap({
          id: "gap-memory-coverage",
          domain: "memory",
          severity: "medium",
          confidence: 78,
          affectedScope: observations.company.identity.name,
          summary: "Operational memory coverage is incomplete.",
          evidence: [`${observations.memory.lowCoverageWorkflows} workflows have no memory references.`],
          consequence: "Transformation lacks reusable operating memory in parts of the company.",
          recommendedResponse: "Improve runtime memory association for under-contextualized workflows.",
        }),
      );
    }

    if (observations.governance.metrics.activePolicies === 0 || observations.governance.metrics.health < 75) {
      gaps.push(
        gap({
          id: "gap-governance-readiness",
          domain: "governance",
          severity: "high",
          confidence: 89,
          affectedScope: observations.company.identity.name,
          summary: "Governance readiness is below safe transformation scale.",
          evidence: [
            `${observations.governance.metrics.health}% governance health`,
            `${observations.governance.metrics.activePolicies} active policies`,
          ],
          consequence: "The company can scale automation faster than it can govern it.",
          recommendedResponse: "Strengthen governance baselines before increasing AI operating scope.",
        }),
      );
    }

    if (observations.governance.policies.filter((policy) => policy.status === "active").length === 0) {
      gaps.push(
        gap({
          id: "gap-policy-readiness",
          domain: "policy",
          severity: "high",
          confidence: 91,
          affectedScope: observations.company.identity.name,
          summary: "Policy readiness is too weak for an AI-native operating model.",
          evidence: ["No active policies were observed in the governance surface."],
          consequence: "Authority and control boundaries stay informal during transformation.",
          recommendedResponse: "Establish active policy coverage for the core operating domains.",
        }),
      );
    }

    if (observations.learning.totalSignals === 0) {
      gaps.push(
        gap({
          id: "gap-learning-readiness",
          domain: "learning-readiness",
          severity: "high",
          confidence: 95,
          affectedScope: observations.company.identity.name,
          summary: "Learning readiness evidence is missing.",
          evidence: ["Organizational intelligence reported zero learning signals."],
          consequence: "The organization cannot credibly progress to AI-native maturity without learning loops.",
          recommendedResponse: "Activate learning feedback evidence before claiming advanced maturity.",
        }),
      );
    }

    const averageExecutionReadiness =
      observations.agents.reduce((sum, agent) => sum + agent.executionReadiness.score, 0) /
      Math.max(1, observations.agents.length);
    if (observations.agents.length > 0 && averageExecutionReadiness < 70) {
      gaps.push(
        gap({
          id: "gap-execution-readiness",
          domain: "execution-readiness",
          severity: "medium",
          confidence: 84,
          affectedScope: observations.company.identity.name,
          summary: "Execution readiness is below transformation-safe levels.",
          evidence: [`Average agent execution readiness is ${Math.round(averageExecutionReadiness)}%.`],
          consequence: "Transformation initiatives will hit friction before they become operational.",
          recommendedResponse: "Improve readiness and dispatch confidence before increasing orchestration complexity.",
        }),
      );
    }

    return gaps;
  },
};
