import {
  evaluateKnowledgeSilentDualReadRollout,
} from "./rollout";
import type {
  KnowledgeSilentDualReadEligibilityInput,
  KnowledgeSilentDualReadEligibilityResult,
} from "./types";

export function evaluateKnowledgeSilentDualReadEligibility(
  input: KnowledgeSilentDualReadEligibilityInput,
): KnowledgeSilentDualReadEligibilityResult {
  const rollout = evaluateKnowledgeSilentDualReadRollout({
    config: input.config,
    tenantId: input.tenantId,
    requestSampleKey: input.requestSampleKey,
  });
  if (!rollout.shouldRun) {
    return { eligible: false, reason: rollout.reason };
  }

  if (!input.canonicalAvailability.available) {
    return { eligible: false, reason: "canonical-read-unavailable" };
  }

  return { eligible: true };
}
