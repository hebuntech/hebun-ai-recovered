import type {
  TransformationInitiative,
  TransformationMaturityAssessment,
  TransformationRoadmap,
  TransformationRoadmapPhase,
  TransformationRoadmapStage,
} from "./types";

const phases: TransformationRoadmapPhase[] = [
  "Foundation",
  "Visibility",
  "Governance",
  "Assisted Operations",
  "Agent Collaboration",
  "Orchestrated Execution",
  "Continuous Learning",
  "AI-native Optimization",
];

function phaseForInitiative(initiative: TransformationInitiative): TransformationRoadmapPhase {
  if (initiative.affectedDomains.includes("organization") || initiative.affectedDomains.includes("people")) {
    return "Foundation";
  }
  if (initiative.affectedDomains.includes("organizational-intelligence-readiness")) {
    return "Visibility";
  }
  if (initiative.affectedDomains.includes("governance") || initiative.affectedDomains.includes("policy")) {
    return "Governance";
  }
  if (initiative.affectedDomains.includes("agents")) {
    return "Agent Collaboration";
  }
  if (initiative.affectedDomains.includes("workflows") || initiative.affectedDomains.includes("execution-readiness")) {
    return "Orchestrated Execution";
  }
  if (initiative.affectedDomains.includes("learning-readiness")) {
    return "Continuous Learning";
  }
  return "Assisted Operations";
}

function currentPhaseFromMaturity(maturity: TransformationMaturityAssessment): TransformationRoadmapPhase {
  if (maturity.level <= 1) return "Foundation";
  if (maturity.level === 2) return "Visibility";
  if (maturity.level === 3) return "Assisted Operations";
  if (maturity.level === 4) return "Agent Collaboration";
  return "AI-native Optimization";
}

export const TransformationRoadmapService = {
  build(
    initiatives: TransformationInitiative[],
    maturity: TransformationMaturityAssessment,
  ): TransformationRoadmap {
    const stages: TransformationRoadmapStage[] = phases.map((phase) => ({
      phase,
      summary: `${phase} stage based on current runtime evidence.`,
      initiativeIds: initiatives
        .filter((initiative) => phaseForInitiative(initiative) === phase)
        .map((initiative) => initiative.id),
    }));
    const currentPhase = currentPhaseFromMaturity(maturity);
    const nextInitiative = initiatives[0];

    return {
      currentPhase,
      nextMilestone: nextInitiative?.title ?? "Collect more evidence before proposing a milestone.",
      stages,
      summary: nextInitiative
        ? `${currentPhase} is the current transformation phase. Next milestone: ${nextInitiative.title}.`
        : `${currentPhase} is the current transformation phase, but evidence is insufficient for a concrete milestone.`,
    };
  },
};
