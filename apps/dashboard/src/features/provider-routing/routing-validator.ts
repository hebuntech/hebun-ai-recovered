/*
 * routing-validator.ts — deterministic invariants over routing decisions. Used
 * by conformance and metrics to confirm the engine stays explainable and safe.
 */

import type { RoutingDecision } from "@/features/provider-routing/types";

export interface RoutingValidation {
  decisionId: string;
  valid: boolean;
  issues: string[];
}

export function validateDecision(decision: RoutingDecision): RoutingValidation {
  const issues: string[] = [];

  if (decision.primaryProvider && decision.confidence <= 0) {
    issues.push("Selected provider must have positive confidence.");
  }
  if (!decision.primaryProvider && !decision.blocked) {
    issues.push("A decision with no primary provider must be blocked.");
  }
  if (decision.primaryProvider !== null && decision.fallbackProviders.includes(decision.primaryProvider)) {
    issues.push("Primary provider must not also be a fallback.");
  }
  if (!decision.explanation) {
    issues.push("Every decision must be explainable.");
  }
  if (decision.approvalRequirement.required && decision.approvalRequirement.escalationTier !== "Human Escalation") {
    issues.push("Approval-required decisions must escalate to a human.");
  }

  return { decisionId: decision.id, valid: issues.length === 0, issues };
}
