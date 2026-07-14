import type { RuntimeDecision } from "@/features/runtime-boundary";
import type { ActivationPolicyAssessment } from "@/features/runtime-activation/types";

export function assessActivationPolicy(runtimeDecision: RuntimeDecision): ActivationPolicyAssessment {
  if (runtimeDecision.policy.status === "blocked") {
    return { status: "Blocked", allowsLive: false, note: runtimeDecision.policy.note };
  }
  if (runtimeDecision.policy.status === "restricted") {
    return { status: "Restricted", allowsLive: false, note: runtimeDecision.policy.note };
  }
  return { status: "Allowed", allowsLive: true, note: runtimeDecision.policy.note };
}
