import type { ActivationDecision, ActivationReport } from "@/features/runtime-activation/types";

export function buildActivationReport(decision: Omit<ActivationDecision, "report">): ActivationReport {
  return {
    decisionId: decision.id,
    runtimeDecisionId: decision.runtimeDecisionId,
    providerId: decision.providerId,
    providerType: decision.providerType,
    activationLevel: decision.activationLevel,
    allowed: decision.allowed,
    blocked: decision.blocked,
    blockReasons: decision.blockReasons,
    readinessScore: decision.readinessScore,
    riskLevel: decision.riskLevel,
    credentialStatus: decision.credentialStatus,
    approvalStatus: decision.approvalStatus,
    policyStatus: decision.policyStatus,
    environmentStatus: decision.environmentStatus,
    summary: decision.explanation,
    badge: decision.badge,
  };
}
