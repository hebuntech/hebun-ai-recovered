import type { ReasoningResult } from "@/features/reasoning";

export function allowedReasoningActions(reasoning: ReasoningResult) {
  return reasoning.selectedOption.actions.filter(
    (action) =>
      !action.toLowerCase().includes("expand") &&
      !action.toLowerCase().includes("accelerate")
  );
}

export function blockedReasoningActions(reasoning: ReasoningResult) {
  return reasoning.selectedOption.actions.filter(
    (action) =>
      action.toLowerCase().includes("expand") ||
      action.toLowerCase().includes("accelerate")
  );
}
