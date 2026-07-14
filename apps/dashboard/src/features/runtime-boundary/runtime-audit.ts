/*
 * runtime-audit.ts — deterministic audit records for every boundary dimension.
 */

import type { RuntimeContext } from "@/features/runtime-boundary/runtime-context";
import type {
  ApprovalAssessment,
  CredentialAssessment,
  EnvironmentAssessment,
  PolicyAssessment,
  PromotionAssessment,
  RuntimeAuditRecord,
  RuntimeGateResult,
  RuntimeHealthAssessment,
} from "@/features/runtime-boundary/types";

export interface AuditInputs {
  context: RuntimeContext;
  allowed: boolean;
  gates: RuntimeGateResult[];
  credential: CredentialAssessment;
  policy: PolicyAssessment;
  approval: ApprovalAssessment;
  environment: EnvironmentAssessment;
  health: RuntimeHealthAssessment;
  promotion: PromotionAssessment;
}

export function buildAudit(inputs: AuditInputs): RuntimeAuditRecord[] {
  const { context, allowed, gates, credential, policy, approval, environment, health, promotion } = inputs;
  const passed = gates.filter((g) => g.passed).length;
  return [
    { subject: "runtime-decision", detail: `Mode ${context.runtimeMode}; allowed=${allowed} (live disabled).` },
    { subject: "gates", detail: `${passed}/${gates.length} gates passed.` },
    { subject: "promotion", detail: promotion.reason },
    { subject: "credentials", detail: `${credential.state} — ${credential.note}` },
    { subject: "policy", detail: `${policy.status} — ${policy.note}` },
    { subject: "approval", detail: approval.required ? "Required." : "Not required." },
    { subject: "environment", detail: environment.note },
    { subject: "health", detail: `Runtime health ${health.score}, ${health.healthy ? "healthy" : "degraded"}.` },
  ];
}
