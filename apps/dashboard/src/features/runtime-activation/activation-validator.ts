import type { ActivationDecision } from "@/features/runtime-activation/types";

export function validateActivationDecision(decision: ActivationDecision) {
  const issues: string[] = [];
  if (!decision.runtimeDecisionId) issues.push("Missing runtime decision reference.");
  if (!decision.providerId) issues.push("Missing provider reference.");
  if (decision.readinessScore < 0 || decision.readinessScore > 100) issues.push("Readiness score is out of range.");
  if (decision.blocked && decision.blockReasons.length === 0) issues.push("Blocked decision is missing block reasons.");
  if (!decision.report.summary) issues.push("Activation report summary is missing.");
  return { valid: issues.length === 0, issues };
}
