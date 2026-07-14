import { AgentRegistry } from "@/features/agent-runtime";
import { governanceApprovals } from "@/features/governance/approvals";
import { governanceMetrics } from "@/features/governance/metrics";
import { governancePolicies } from "@/features/governance/policies";
import { governanceRisks } from "@/features/governance/risk";
import { retrieveReport } from "@/features/memory-engine";
import {
  DepartmentRuntimeService,
  HumanRuntimeService,
  OrganizationRuntimeService,
} from "@/features/organization-runtime";
import { WorkflowRegistry } from "@/features/workflow-runtime";
import { CapacityEngine } from "./capacity-engine";
import { ExecutiveInsightEngine } from "./executive-insight-engine";
import { HealthEngine } from "./health-engine";
import { OpportunityEngine } from "./opportunity-engine";
import { OrganizationScoreEngine } from "./organization-score-engine";
import { PerformanceEngine } from "./performance-engine";
import { RiskEngine } from "./risk-engine";
import type { OrganizationalIntelligenceSnapshot, RuntimeObservationModel } from "./types";

function buildObservations(): RuntimeObservationModel {
  const company = OrganizationRuntimeService.getCompany();
  const departments = DepartmentRuntimeService.listDepartments();
  const humans = HumanRuntimeService.listHumans();
  const agents = AgentRegistry.listAgents();
  const workflows = WorkflowRegistry.listWorkflows();
  const memoryReport = retrieveReport({ limit: 24 });

  const verifiedKnowledge = agents.reduce((sum, agent) => sum + agent.knowledgeProfile.verifiedNodes, 0);
  const knowledgeReferences = workflows.reduce((sum, workflow) => sum + workflow.knowledgeReferences.length, 0);
  const memoryReferences = workflows.reduce((sum, workflow) => sum + workflow.memoryReferences.length, 0);
  const lowCoverageAgents = agents.filter((agent) => agent.knowledgeProfile.verifiedNodes === 0).length;
  const lowCoverageWorkflows = workflows.filter((workflow) => workflow.knowledgeReferences.length === 0).length;
  const lowMemoryWorkflows = workflows.filter((workflow) => workflow.memoryReferences.length === 0).length;
  const totalLearningSignals =
    agents.reduce((sum, agent) => sum + agent.learningProfile.improvementSignals, 0) +
    workflows.reduce((sum, workflow) => sum + workflow.learningReferences.length, 0);

  return {
    company,
    departments,
    humans,
    agents,
    workflows,
    governance: {
      metrics: governanceMetrics,
      approvals: governanceApprovals,
      risks: governanceRisks,
      policies: governancePolicies,
    },
    knowledge: {
      totalReferences: knowledgeReferences,
      verifiedKnowledge,
      lowCoverageAgents,
      lowCoverageWorkflows,
    },
    memory: {
      report: memoryReport,
      totalReferences: memoryReferences,
      lowCoverageWorkflows: lowMemoryWorkflows,
    },
    learning: {
      totalSignals: totalLearningSignals,
      relatedWorkflows: workflows.filter((workflow) => workflow.learningReferences.length > 0).length,
      relatedAgents: agents.filter((agent) => agent.learningProfile.improvementSignals > 0).length,
    },
    performanceSeed: {
      knowledgeCoverage: Math.round(memoryReport.knowledgeCoverage * 100),
    },
  };
}

function buildCompanyOverview(snapshot: Omit<OrganizationalIntelligenceSnapshot, "companyOverview" | "generatedAt">) {
  const { observations, health, performance, capacity, scores } = snapshot;

  return {
    healthScore: health.overallEnterpriseHealth,
    metrics: [
      {
        label: "Company Health",
        value: `${health.overallEnterpriseHealth}%`,
        detail: `${scores.enterpriseScore}% enterprise score from runtime intelligence`,
      },
      {
        label: "Departments",
        value: String(observations.departments.length),
        detail: `${observations.agents.length} agents and ${observations.humans.length} humans resolved by the organization runtime`,
      },
      {
        label: "Workflow Activity",
        value: String(performance.workflowThroughput),
        detail: `${observations.workflows.length} active workflows observed today`,
      },
      {
        label: "Agent Capacity",
        value: `${capacity.availableCapacity}`,
        detail: `${capacity.idleAgents} idle/light agents and ${capacity.overloadedAgents} overloaded agents`,
      },
      {
        label: "Knowledge Coverage",
        value: `${performance.knowledgeCoverage}%`,
        detail: `${observations.knowledge.verifiedKnowledge} verified runtime-linked knowledge signals`,
      },
      {
        label: "Governance Health",
        value: `${observations.governance.metrics.health}%`,
        detail: `${observations.governance.metrics.pendingApprovals} pending approvals across the governance runtime`,
      },
    ],
  };
}

export const OrganizationalIntelligenceEngine = {
  getSnapshot(): OrganizationalIntelligenceSnapshot {
    const observations = buildObservations();
    const performance = PerformanceEngine.assess(observations);
    const capacity = CapacityEngine.assess(observations);
    const health = HealthEngine.assess({
      ...observations,
      performanceSeed: {
        knowledgeCoverage: performance.knowledgeCoverage,
      },
    });
    const scores = OrganizationScoreEngine.assess(observations, health, performance, capacity);
    const risks = RiskEngine.detect(observations);
    const opportunities = OpportunityEngine.detect(observations);
    const executiveInsights = ExecutiveInsightEngine.summarize(
      observations,
      health,
      performance,
      capacity,
    );

    const baseSnapshot = {
      observations,
      health,
      performance,
      capacity,
      scores,
      risks,
      opportunities,
      executiveInsights,
    };

    return {
      generatedAt: new Date().toISOString(),
      ...baseSnapshot,
      companyOverview: buildCompanyOverview(baseSnapshot),
    };
  },
};
