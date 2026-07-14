import type { RuntimeDecision } from "@/features/runtime-boundary";
import type { ActivationApprovalAssessment } from "@/features/runtime-activation/types";

export function assessActivationApproval(runtimeDecision: RuntimeDecision): ActivationApprovalAssessment {
  if (!runtimeDecision.approval.required) {
    return { status: "Not Required", required: false, approved: true, note: runtimeDecision.approval.reason };
  }
  return { status: "Pending", required: true, approved: false, note: runtimeDecision.approval.reason };
}
