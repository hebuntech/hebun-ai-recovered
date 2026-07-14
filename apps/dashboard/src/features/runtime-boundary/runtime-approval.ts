/*
 * runtime-approval.ts — deterministic approval + policy assessment at the
 * boundary. Approval requirement is carried from the invocation; policy is
 * evaluated offline (recorded, never enforced against a live system).
 */

import type { Invocation } from "@/features/provider-invocation";
import type { RuntimeContext } from "@/features/runtime-boundary/runtime-context";
import type { ApprovalAssessment } from "@/features/runtime-boundary/types";

export function assessApproval(inv: Invocation, context: RuntimeContext): ApprovalAssessment {
  const required =
    context.runtimeMode === "Approval Required" || inv.executionMode === "Approval Required";
  return {
    required,
    reason: required
      ? "Approval-gated capability must be approved by a human before any live action."
      : "No human approval required at the boundary.",
  };
}
