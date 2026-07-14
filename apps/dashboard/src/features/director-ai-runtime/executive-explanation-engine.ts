import type { DirectorAIExplanation, ExecutiveContextModel, ExecutiveQuestion } from "./types";

function companyStatusExplanation(context: ExecutiveContextModel): DirectorAIExplanation {
  return {
    id: "explanation-company-status",
    title: "Company status is grounded in live organizational intelligence",
    summary: `Enterprise health is ${context.intelligence.health.overallEnterpriseHealth}% with workflow health at ${context.intelligence.health.workflowHealth}% and governance health at ${context.intelligence.observations.governance.metrics.health}%.`,
    evidence: [
      `${context.workflows.length} workflows are being observed by the workflow runtime.`,
      `${context.agents.length} agents are active in the organization model.`,
      `${context.intelligence.risks.length} risks and ${context.intelligence.opportunities.length} opportunities are active.`,
    ],
    whyItMatters: "This gives the Director one executive reading that already combines structure, workforce, workflow, and governance signals.",
  };
}

export const ExecutiveExplanationEngine = {
  explain(context: ExecutiveContextModel, question: ExecutiveQuestion): DirectorAIExplanation {
    if (question.category === "risks") {
      const topRisk = context.intelligence.risks[0];
      return {
        id: `explanation-${question.id}`,
        title: topRisk?.summary ?? "No critical risk is currently elevated",
        summary: topRisk
          ? topRisk.recommendedNextAction
          : "Director AI did not find a currently elevated runtime risk in the executive window.",
        evidence: topRisk?.evidence ?? ["Current runtime signals do not show a single dominant critical risk."],
        whyItMatters: "Risks define where executive attention can prevent local strain from becoming company-wide drag.",
      };
    }

    if (question.category === "opportunities") {
      const topOpportunity = context.intelligence.opportunities[0];
      return {
        id: `explanation-${question.id}`,
        title: topOpportunity?.summary ?? "No immediate leverage opportunity is dominant",
        summary: topOpportunity
          ? topOpportunity.recommendedNextAction
          : "Director AI did not find a dominant opportunity requiring immediate executive intervention.",
        evidence: topOpportunity?.evidence ?? ["Current runtime signals show balanced opportunity distribution."],
        whyItMatters: "Opportunities show where the organization can improve leverage without adding execution risk.",
      };
    }

    if (question.category === "departments") {
      const weakestDepartment = context.intelligence.health.departmentHealth[0];
      return {
        id: `explanation-${question.id}`,
        title: `${weakestDepartment?.label ?? "Department"} needs the most executive attention`,
        summary: weakestDepartment
          ? `${weakestDepartment.label} is the lowest-health department at ${weakestDepartment.score}%.`
          : "All departments are currently unresolved.",
        evidence: weakestDepartment ? [weakestDepartment.detail, weakestDepartment.trend] : ["Department health data is unavailable."],
        whyItMatters: "Department weakness is where local operational strain turns into organizational drag first.",
      };
    }

    if (question.category === "transformation") {
      return {
        id: `explanation-${question.id}`,
        title: `${context.transformation.overallMaturity.label} transformation maturity`,
        summary: `${context.transformation.overallReadiness.summary} Current roadmap phase: ${context.transformation.roadmap.currentPhase}.`,
        evidence: [
          `${context.transformation.gaps.length} transformation gaps are active.`,
          `${context.transformation.initiatives.length} proposed initiatives are available.`,
          context.transformation.roadmap.summary,
        ],
        whyItMatters: "Transformation readiness shows how prepared the organization is to scale into an AI-native operating model safely.",
      };
    }

    return companyStatusExplanation(context);
  },
};
