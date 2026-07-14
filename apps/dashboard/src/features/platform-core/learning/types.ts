/*
 * platform-core / learning — improvement proposal contracts only.
 *
 * Structural types only. No learning engine, no governance integration, and no
 * direct mutation of target modules.
 */
export interface LearningSignal {
  readonly detectedPatterns?: Readonly<Record<string, unknown>>;
  readonly driftSignals?: Readonly<Record<string, unknown>>;
  readonly regressionSignals?: Readonly<Record<string, unknown>>;
  readonly biasSignals?: Readonly<Record<string, unknown>>;
  readonly hallucinationReinforcementSignals?: Readonly<Record<string, unknown>>;
}

export interface LearningSafetyAssessment {
  readonly safetyChecks?: Readonly<Record<string, unknown>>;
  readonly rootCauseAnalysis?: Readonly<Record<string, unknown>>;
  readonly riskAssessment?: Readonly<Record<string, unknown>>;
}

export interface LearningProvenance {
  readonly reasoningTraceRefs?: Readonly<Record<string, unknown>>;
  readonly executionRefs?: Readonly<Record<string, unknown>>;
  readonly memoryRefs?: Readonly<Record<string, unknown>>;
  readonly knowledgeRefs?: Readonly<Record<string, unknown>>;
  readonly humanFeedbackRefs?: Readonly<Record<string, unknown>>;
  readonly provenance?: Readonly<Record<string, unknown>>;
}

export interface ImprovementTarget {
  readonly targetModule?: string;
  readonly targetType?: string;
  readonly targetId?: string;
}

export interface ImprovementRollbackPlan {
  readonly rollbackPlan?: Readonly<Record<string, unknown>>;
  readonly validationPlan?: Readonly<Record<string, unknown>>;
}

export interface ImprovementProposal {
  readonly improvementProposalType?:
    | "skill"
    | "procedure"
    | "workflow"
    | "prompt"
    | "calibration"
    | "optimization";
  readonly proposal?: Readonly<Record<string, unknown>>;
  readonly expectedBenefit?: Readonly<Record<string, unknown>>;
  readonly supportingEvidence?: Readonly<Record<string, unknown>>;
  readonly conflictingEvidence?: Readonly<Record<string, unknown>>;
  readonly proposalVersion?: number;
}

export interface LearningSession {
  readonly learningType?: "personal" | "organizational" | "cross-agent";
  readonly subjectType?: string;
  readonly subjectId?: string;
  readonly expectedOutcome?: Readonly<Record<string, unknown>>;
  readonly actualOutcome?: Readonly<Record<string, unknown>>;
  readonly costMetadata?: Readonly<Record<string, unknown>>;
  readonly correlationId?: string;
  readonly causationId?: string;
  readonly learningVersion?: number;
}
