/*
 * runtime-report.ts — explainable, auditable per-decision boundary report.
 */

import { runtimeDecisions } from "@/features/runtime-boundary/runtime-engine";
import { validateRuntimeDecision } from "@/features/runtime-boundary/runtime-validator";
import type { RuntimeDecision, RuntimeReport } from "@/features/runtime-boundary/types";

export function buildRuntimeReport(d: RuntimeDecision): RuntimeReport {
  const validation = validateRuntimeDecision(d);
  return {
    decisionId: d.id,
    invocationId: d.invocationId,
    providerId: d.providerId,
    runtimeMode: d.runtimeMode,
    runtimeState: d.runtimeState,
    allowed: d.allowed,
    blocked: d.blocked,
    blockReasons: d.blockReasons,
    promotionEligible: d.promotion.eligible,
    credentialState: d.credential.state,
    healthScore: d.runtimeHealth.score,
    readinessScore: d.readiness.score,
    riskLevel: d.riskLevel,
    explanation: d.explanation,
    valid: validation.valid,
    badge: d.riskBadge,
  };
}

export const runtimeReports: RuntimeReport[] = runtimeDecisions.map(buildRuntimeReport);
