import { OrganizationalIntelligenceEngine } from "@/features/organizational-intelligence";
import { MaturityAssessmentEngine } from "./maturity-assessment-engine";
import { TransformationGapEngine } from "./transformation-gap-engine";
import { TransformationPriorityEngine } from "./transformation-priority-engine";
import { TransformationReadinessService } from "./transformation-readiness-service";
import { TransformationRecommendationEngine } from "./transformation-recommendation-engine";
import { TransformationRoadmapService } from "./transformation-roadmap-service";
import type {
  DirectorAITransformationSurface,
  TransformationDashboardSurface,
  TransformationDomain,
  TransformationDomainAssessment,
  TransformationGap,
  TransformationInitiative,
  TransformationRecommendation,
  TransformationRuntimeSnapshot,
} from "./types";
import type { RuntimeObservationModel } from "@/features/organizational-intelligence";

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return Math.round(values.reduce((sum, value) => sum + value, 0) / values.length);
}

function healthForDomain(domain: TransformationDomain, observations: RuntimeObservationModel): number {
  switch (domain) {
    case "organization":
      return average([observations.company.health.score, ...observations.departments.map((department) => department.health.score)]);
    case "people":
      return observations.humans.length > 0 ? average(observations.humans.map((human) => human.health.score)) : 0;
    case "agents":
      return observations.agents.length > 0 ? average(observations.agents.map((agent) => agent.health.score)) : 0;
    case "workflows":
      return observations.workflows.length > 0 ? average(observations.workflows.map((workflow) => workflow.health.score)) : 0;
    case "knowledge":
      return Math.max(0, Math.min(100, observations.knowledge.verifiedKnowledge * 4 - observations.knowledge.lowCoverageWorkflows * 6));
    case "memory":
      return Math.max(0, Math.min(100, Math.round(observations.memory.report.averageConfidence * 0.6 + observations.memory.report.knowledgeCoverage * 100 * 0.4)));
    case "governance":
      return observations.governance.metrics.health;
    case "policy":
      return observations.governance.policies.filter((policy) => policy.status === "active").length > 0
        ? observations.governance.metrics.complianceScore
        : 0;
    case "execution-readiness":
      return observations.agents.length > 0
        ? average(observations.agents.map((agent) => agent.executionReadiness.score))
        : 0;
    case "learning-readiness":
      return Math.max(0, Math.min(100, observations.learning.totalSignals * 12));
    case "organizational-intelligence-readiness":
      return average([
        observations.company.health.score,
        observations.governance.metrics.health,
        observations.performanceSeed.knowledgeCoverage,
      ]);
    default:
      return 0;
  }
}

function evidenceForDomain(domain: TransformationDomain, observations: RuntimeObservationModel): string[] {
  switch (domain) {
    case "organization":
      return [
        `${observations.departments.length} departments observed`,
        `${observations.humans.length} humans resolved`,
      ];
    case "people":
      return [
        `${observations.humans.length} humans observed`,
        `${observations.governance.approvals.length} governance approvals visible`,
      ];
    case "agents":
      return [
        `${observations.agents.length} agents observed`,
        `${observations.agents.filter((agent) => !!agent.owner).length} agents have explicit owners`,
      ];
    case "workflows":
      return [
        `${observations.workflows.length} workflows observed`,
        `${observations.workflows.filter((workflow) => workflow.goal && workflow.plan).length} workflows have strategic lineage`,
      ];
    case "knowledge":
      return [
        `${observations.knowledge.verifiedKnowledge} verified knowledge signals`,
        `${observations.knowledge.totalReferences} total workflow knowledge references`,
      ];
    case "memory":
      return [
        `${observations.memory.totalReferences} workflow memory references`,
        `${Math.round(observations.memory.report.knowledgeCoverage * 100)}% memory-linked knowledge coverage`,
      ];
    case "governance":
      return [
        `${observations.governance.metrics.health}% governance health`,
        `${observations.governance.metrics.pendingApprovals} pending approvals`,
      ];
    case "policy":
      return [
        `${observations.governance.policies.length} policies observed`,
        `${observations.governance.policies.filter((policy) => policy.status === "active").length} active policies`,
      ];
    case "execution-readiness":
      return [
        `${average(observations.agents.map((agent) => agent.executionReadiness.score))}% average agent readiness`,
        `${observations.workflows.filter((workflow) => workflow.readiness.status === "ready").length} workflows are ready`,
      ];
    case "learning-readiness":
      return [
        `${observations.learning.totalSignals} learning signals observed`,
        `${observations.learning.relatedAgents} agents and ${observations.learning.relatedWorkflows} workflows contribute learning evidence`,
      ];
    case "organizational-intelligence-readiness":
      return [
        `${observations.company.health.score}% company health`,
        `${observations.performanceSeed.knowledgeCoverage}% knowledge coverage signal`,
      ];
    default:
      return [];
  }
}

function opportunitiesForDomain(domain: TransformationDomain, observations: RuntimeObservationModel): string[] {
  if (domain === "agents" && observations.agents.some((agent) => agent.workload.state === "light")) {
    return ["Unused agent capacity can support staged transformation work."];
  }
  if (domain === "workflows" && observations.workflows.some((workflow) => workflow.knowledgeReferences.length >= 2)) {
    return ["Well-instrumented workflows can become transformation exemplars."];
  }
  if (domain === "knowledge" && observations.knowledge.verifiedKnowledge > 0) {
    return ["Existing knowledge can be reused to accelerate adoption."];
  }
  if (domain === "learning-readiness" && observations.learning.totalSignals > 0) {
    return ["Learning signals are already visible enough to support continuous improvement."];
  }
  return [];
}

function risksForDomain(gaps: TransformationGap[]): string[] {
  return gaps.map((gap) => gap.summary).slice(0, 3);
}

function initiativeFromGap(gap: TransformationGap): TransformationInitiative {
  const priority = TransformationPriorityEngine.scoreFromGap(gap);
  const readiness = TransformationReadinessService.fromHealthAndGaps(
    100 - priority.score / 2,
    [gap],
  );

  const titleByDomain: Record<TransformationDomain, string> = {
    organization: "Formalize organization structure",
    people: "Clarify human operating roles",
    agents: "Assign agent ownership and authority",
    workflows: "Connect workflows to strategic lineage",
    knowledge: "Improve knowledge coverage",
    memory: "Improve memory coverage",
    governance: "Establish governance readiness",
    policy: "Establish policy readiness",
    "execution-readiness": "Improve execution readiness",
    "learning-readiness": "Activate learning feedback loops",
    "organizational-intelligence-readiness": "Improve executive visibility",
  };

  return {
    id: `initiative-${gap.id}`,
    title: titleByDomain[gap.domain],
    objective: gap.recommendedResponse,
    rationale: gap.consequence,
    priority,
    dependencies: priority.blockedCapabilities,
    expectedOutcome: `Reduce ${gap.domain} transformation friction and unblock downstream capability growth.`,
    affectedDomains: [gap.domain],
    evidence: gap.evidence,
    readiness,
    recommendedOwnerType:
      gap.domain === "governance" || gap.domain === "policy"
        ? "governance"
        : gap.domain === "organization" || gap.domain === "people"
          ? "director"
          : gap.domain === "agents"
            ? "human-manager"
            : "department-lead",
    status: "proposed",
  };
}

function buildDomainAssessments(observations: RuntimeObservationModel, gaps: TransformationGap[]): TransformationDomainAssessment[] {
  const domains: TransformationDomain[] = [
    "organization",
    "people",
    "agents",
    "workflows",
    "knowledge",
    "memory",
    "governance",
    "policy",
    "execution-readiness",
    "learning-readiness",
    "organizational-intelligence-readiness",
  ];

  return domains.map((domain) => {
    const domainGaps = gaps.filter((gap) => gap.domain === domain);
    const health = healthForDomain(domain, observations);
    const evidence = evidenceForDomain(domain, observations);
    const readiness = TransformationReadinessService.fromHealthAndGaps(health, domainGaps);
    const maturity = MaturityAssessmentEngine.assessDomain({
      domain,
      observations,
      health,
      confidence: Math.max(20, Math.min(100, 100 - domainGaps.length * 10)),
      gapCount: domainGaps.length,
      summary: `${domain} maturity is based on ${evidence.length} evidence signals and ${domainGaps.length} detected gaps.`,
    });

    return {
      domain,
      maturity,
      health,
      readiness,
      evidence,
      gaps: domainGaps,
      risks: risksForDomain(domainGaps),
      opportunities: opportunitiesForDomain(domain, observations),
      recommendedNextStep:
        domainGaps[0]?.recommendedResponse ??
        opportunitiesForDomain(domain, observations)[0] ??
        `Continue strengthening ${domain} evidence before advancing maturity.`,
    };
  });
}

export const EnterpriseTransformationEngine: {
  buildSnapshot(observations: RuntimeObservationModel): TransformationRuntimeSnapshot;
  getSnapshot(): TransformationRuntimeSnapshot;
  getDashboardSurface(snapshot?: TransformationRuntimeSnapshot): TransformationDashboardSurface;
  getDirectorAISurface(snapshot?: TransformationRuntimeSnapshot): DirectorAITransformationSurface;
} = {
  buildSnapshot(observations: RuntimeObservationModel): TransformationRuntimeSnapshot {
    const gaps = TransformationGapEngine.detect(observations);
    const domainAssessments = buildDomainAssessments(observations, gaps);
    const overallMaturity = MaturityAssessmentEngine.assessOverall(domainAssessments, observations);
    const overallHealth = average(domainAssessments.map((assessment) => assessment.health));
    const overallReadiness = TransformationReadinessService.fromHealthAndGaps(overallHealth, gaps);
    const initiatives = gaps
      .map(initiativeFromGap)
      .sort((a, b) => b.priority.score - a.priority.score);
    const roadmap = TransformationRoadmapService.build(initiatives, overallMaturity);
    const recommendations = TransformationRecommendationEngine.build(initiatives);

    return {
      generatedAt: new Date().toISOString(),
      observations,
      overallMaturity,
      overallReadiness,
      domainAssessments,
      gaps,
      initiatives,
      recommendations,
      roadmap,
      summary: `${overallMaturity.label} maturity with ${gaps.length} transformation gaps and ${initiatives.length} proposed initiatives.`,
    };
  },

  getSnapshot(): TransformationRuntimeSnapshot {
    return EnterpriseTransformationEngine.buildSnapshot(
      OrganizationalIntelligenceEngine.getSnapshot().observations,
    );
  },

  getDashboardSurface(snapshot = EnterpriseTransformationEngine.getSnapshot()): TransformationDashboardSurface {
    const metrics = [
      {
        label: "Maturity",
        value: snapshot.overallMaturity.label,
        detail: `${snapshot.overallMaturity.confidence}% confidence`,
      },
      {
        label: "Readiness",
        value: `${snapshot.overallReadiness.score}%`,
        detail: snapshot.overallReadiness.summary,
      },
      {
        label: "Top Gaps",
        value: String(snapshot.gaps.length),
        detail: "Evidence-backed transformation gaps only",
      },
      {
        label: "Proposed Initiatives",
        value: String(snapshot.initiatives.length),
        detail: "Read-only initiatives, not executable objects",
      },
      {
        label: "Current Phase",
        value: snapshot.roadmap.currentPhase,
        detail: snapshot.roadmap.summary,
      },
      {
        label: "Next Milestone",
        value: snapshot.roadmap.nextMilestone,
        detail: "Derived from the top proposed initiative",
      },
    ];

    return {
      metrics,
      gaps: snapshot.gaps.slice(0, 4).map((gap: TransformationGap) => ({
        id: gap.id,
        title: gap.summary,
        detail: gap.recommendedResponse,
        meta: `${gap.domain} · confidence ${gap.confidence}%`,
        status: gap.severity,
        href: "/director/intelligence/recommendations",
      })),
      initiatives: snapshot.initiatives.slice(0, 4).map((initiative: TransformationInitiative) => ({
        id: initiative.id,
        title: initiative.title,
        detail: initiative.objective,
        meta: `${initiative.priority.level} priority · ${initiative.status}`,
        status: initiative.priority.level,
        href: "/director/intelligence/recommendations",
      })),
      empty: snapshot.gaps.length === 0 && snapshot.initiatives.length === 0,
    };
  },

  getDirectorAISurface(snapshot = EnterpriseTransformationEngine.getSnapshot()): DirectorAITransformationSurface {
    return {
      summary: snapshot.summary,
      recommendations: snapshot.recommendations.slice(0, 4).map((recommendation: TransformationRecommendation) => ({
        id: `director-ai-${recommendation.id}`,
        title: recommendation.title,
        summary: recommendation.summary,
        reason: recommendation.rationale,
        confidence: recommendation.confidence,
        priority: recommendation.priority,
        affectedAgents: [],
        recommendedActions: recommendation.recommendedActions,
        supportingEvidence: recommendation.evidence,
      })),
    };
  },
};
