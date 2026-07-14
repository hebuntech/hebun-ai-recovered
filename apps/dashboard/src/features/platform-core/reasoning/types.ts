/*
 * platform-core / reasoning — auditable reasoning summary contracts only.
 *
 * No hidden chain-of-thought, no provider calls, no runtime engine, and no
 * mutation logic live here.
 */
export interface ReasoningSessionReference {
  readonly agentId?: string;
  readonly workingMemoryId?: string;
  readonly commandId?: string;
  readonly executionId?: string;
  readonly missionId?: string;
  readonly goalId?: string;
  readonly planId?: string;
  readonly taskId?: string;
  readonly workflowId?: string;
}

export interface ReasoningEvidenceReference {
  readonly knowledgeRefs?: Readonly<Record<string, unknown>>;
  readonly canonicalFactRefs?: Readonly<Record<string, unknown>>;
  readonly memoryRefs?: Readonly<Record<string, unknown>>;
  readonly policyRefs?: Readonly<Record<string, unknown>>;
  readonly constraintRefs?: Readonly<Record<string, unknown>>;
  readonly supportingEvidence?: Readonly<Record<string, unknown>>;
  readonly conflictingEvidence?: Readonly<Record<string, unknown>>;
}

export interface ReasoningCitation {
  readonly citationMap?: Readonly<Record<string, unknown>>;
}

export interface ReasoningVerificationSummary {
  readonly verificationResult?: Readonly<Record<string, unknown>>;
  readonly escalationReason?: string;
  readonly humanReviewRequired?: string;
}

export interface ReasoningConclusion {
  readonly conclusion?: string;
  readonly recommendation?: string;
  readonly confidence?: number;
  readonly uncertainty?: Readonly<Record<string, unknown>>;
  readonly assumptions?: Readonly<Record<string, unknown>>;
  readonly hypotheses?: Readonly<Record<string, unknown>>;
  readonly alternatives?: Readonly<Record<string, unknown>>;
}

export interface ReasoningAuditSummary {
  readonly inputSnapshot?: Readonly<Record<string, unknown>>;
  readonly providerMetadata?: Readonly<Record<string, unknown>>;
  readonly tokenUsage?: Readonly<Record<string, unknown>>;
  readonly costMetadata?: Readonly<Record<string, unknown>>;
  readonly startedAt?: string;
  readonly concludedAt?: string;
  readonly disposedAt?: string;
  readonly reasoningVersion?: number;
}
