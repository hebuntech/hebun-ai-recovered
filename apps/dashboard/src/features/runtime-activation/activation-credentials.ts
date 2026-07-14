import type { RuntimeDecision } from "@/features/runtime-boundary";
import type { ActivationCredentialAssessment } from "@/features/runtime-activation/types";

export function assessActivationCredentials(runtimeDecision: RuntimeDecision): ActivationCredentialAssessment {
  const { required, state, note } = runtimeDecision.credential;
  const liveEligible = !required || state === "Injected";
  return {
    status: state,
    required,
    liveEligible,
    note: liveEligible ? note : `${note} Live activation remains unavailable until credential state is valid.`,
  };
}
