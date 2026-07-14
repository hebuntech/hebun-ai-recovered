import type {
  TransformationDomain,
  TransformationDomainAssessment,
  TransformationMaturityAssessment,
  TransformationMaturityLevel,
} from "./types";
import type { RuntimeObservationModel } from "@/features/organizational-intelligence";

const MATURITY_LABELS: Record<TransformationMaturityLevel, TransformationMaturityAssessment["label"]> = {
  0: "Unobserved",
  1: "Manual",
  2: "Digitized",
  3: "Assisted",
  4: "Orchestrated",
  5: "AI-native",
};

function createMaturity(level: TransformationMaturityLevel, confidence: number, summary: string): TransformationMaturityAssessment {
  return {
    level,
    label: MATURITY_LABELS[level],
    confidence,
    summary,
  };
}

function hasAinativeEvidence(observations: RuntimeObservationModel): boolean {
  return (
    observations.agents.length > 0 &&
    observations.workflows.length > 0 &&
    observations.governance.metrics.activePolicies > 0 &&
    observations.learning.totalSignals > 0
  );
}

/*
 * High-level deterministic maturity rules:
 * 0 = no meaningful runtime evidence
 * 1 = manual structure only
 * 2 = digitized structure with visible entities
 * 3 = assisted runtime with active agents/workflows/intelligence
 * 4 = orchestrated runtime with healthy linkage, governance, and readiness
 * 5 = AI-native only when agent, workflow, governance, and learning evidence all exist
 */
function levelForDomain(
  domain: TransformationDomain,
  observations: RuntimeObservationModel,
  health: number,
  gapCount: number,
): TransformationMaturityLevel {
  switch (domain) {
    case "organization":
      if (observations.departments.length === 0) return 0;
      if (observations.humans.length === 0) return 1;
      if (observations.agents.length === 0) return 2;
      if (observations.departments.length > 0 && observations.agents.length > 0) return health >= 80 ? 4 : 3;
      return 0;
    case "people":
      if (observations.humans.length === 0) return 0;
      if (observations.governance.approvals.length === 0) return 2;
      return health >= 80 ? 4 : 3;
    case "agents":
      if (observations.agents.length === 0) return 0;
      if (observations.agents.every((agent) => !agent.owner)) return 2;
      return health >= 82 ? 4 : 3;
    case "workflows":
      if (observations.workflows.length === 0) return 0;
      if (observations.workflows.every((workflow) => workflow.assignedAgents.length === 0)) return 2;
      return health >= 82 ? 4 : 3;
    case "knowledge":
      if (observations.knowledge.totalReferences === 0) return 0;
      if (observations.knowledge.verifiedKnowledge === 0) return 2;
      return health >= 80 ? 4 : 3;
    case "memory":
      if (observations.memory.totalReferences === 0) return 0;
      if (observations.memory.report.retrievedCount === 0) return 1;
      return health >= 80 ? 4 : 3;
    case "governance":
      if (observations.governance.metrics.activePolicies === 0) return 0;
      if (observations.governance.metrics.pendingApprovals > 0) return health >= 80 ? 4 : 3;
      return 2;
    case "policy":
      if (observations.governance.policies.length === 0) return 0;
      if (observations.governance.policies.every((policy) => policy.status !== "active")) return 2;
      return health >= 80 ? 4 : 3;
    case "execution-readiness": {
      const avgAgentReadiness =
        observations.agents.reduce((sum, agent) => sum + agent.executionReadiness.score, 0) /
        Math.max(1, observations.agents.length);
      if (observations.agents.length === 0 && observations.workflows.length === 0) return 0;
      if (avgAgentReadiness < 50) return 2;
      return health >= 80 ? 4 : 3;
    }
    case "learning-readiness":
      if (observations.learning.totalSignals === 0) return 0;
      if (observations.learning.relatedAgents === 0 && observations.learning.relatedWorkflows === 0) return 2;
      return health >= 80 ? 4 : 3;
    case "organizational-intelligence-readiness":
      if (gapCount === 0 && health >= 85 && hasAinativeEvidence(observations)) return 5;
      if (observations.company.health.score === 0) return 0;
      return health >= 80 ? 4 : 3;
    default:
      return 0;
  }
}

export const MaturityAssessmentEngine = {
  assessDomain(input: {
    domain: TransformationDomain;
    observations: RuntimeObservationModel;
    health: number;
    confidence: number;
    gapCount: number;
    summary: string;
  }): TransformationMaturityAssessment {
    let level = levelForDomain(input.domain, input.observations, input.health, input.gapCount);
    if (level === 5 && !hasAinativeEvidence(input.observations)) {
      level = 4;
    }
    return createMaturity(level, input.confidence, input.summary);
  },

  assessOverall(assessments: TransformationDomainAssessment[], observations: RuntimeObservationModel): TransformationMaturityAssessment {
    if (assessments.length === 0) {
      return createMaturity(0, 0, "No transformation evidence is currently available.");
    }

    const averageLevel = Math.round(
      assessments.reduce((sum, assessment) => sum + assessment.maturity.level, 0) /
        assessments.length,
    ) as TransformationMaturityLevel;
    const confidence = Math.round(
      assessments.reduce((sum, assessment) => sum + assessment.maturity.confidence, 0) /
        assessments.length,
    );
    const aiNativeAllowed = hasAinativeEvidence(observations);
    const cappedLevel =
      averageLevel === 5 && !aiNativeAllowed ? 4 : averageLevel;

    return createMaturity(
      cappedLevel,
      confidence,
      `${MATURITY_LABELS[cappedLevel]} maturity derived from ${assessments.length} evidence-backed domain assessments.`,
    );
  },
};
