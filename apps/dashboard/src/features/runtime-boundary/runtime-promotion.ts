/*
 * runtime-promotion.ts — deterministic promotion path. Promotion advances a
 * decision one stage at a time: Simulation → Dry Run → Read Only → Future Live
 * → Blocked. Crossing INTO Future Live is never eligible in this phase — the
 * boundary holds every invocation on the offline side.
 */

import type { RuntimeContext } from "@/features/runtime-boundary/runtime-context";
import type {
  PromotionAssessment,
  PromotionStage,
  PromotionStep,
  RuntimeHealthAssessment,
} from "@/features/runtime-boundary/types";

const stageOrder: PromotionStage[] = ["Simulation", "Dry Run", "Read Only", "Future Live", "Blocked"];

/** offline stages a decision may be promoted between; Future Live is the wall. */
const OFFLINE_STAGES: PromotionStage[] = ["Simulation", "Dry Run", "Read Only"];

function currentStage(context: RuntimeContext): PromotionStage {
  switch (context.runtimeMode) {
    case "Simulation":
      return "Simulation";
    case "Dry Run":
      return "Dry Run";
    case "Read Only":
      return "Read Only";
    case "Future Live":
      return "Future Live";
    default:
      return "Blocked";
  }
}

export function assessPromotion(
  context: RuntimeContext,
  health: RuntimeHealthAssessment
): PromotionAssessment {
  const current = currentStage(context);
  const idx = stageOrder.indexOf(current);
  const next = idx >= 0 && idx < stageOrder.length - 1 ? stageOrder[idx + 1] : null;

  const baseSteps: { from: PromotionStage; to: PromotionStage }[] = [
    { from: "Simulation", to: "Dry Run" },
    { from: "Dry Run", to: "Read Only" },
    { from: "Read Only", to: "Future Live" },
    { from: "Future Live", to: "Blocked" },
  ];
  const path: PromotionStep[] = baseSteps.map((step) => {
    const withinOffline = OFFLINE_STAGES.includes(step.from) && OFFLINE_STAGES.includes(step.to);
    const eligible = withinOffline && health.healthy;
    const reason = withinOffline
      ? eligible
        ? "Eligible: stays within the offline deterministic world."
        : "Not eligible: runtime health below threshold."
      : "Blocked: crossing into live runtime is disabled in this phase.";
    return { ...step, eligible, reason };
  });

  const nextEligible =
    next !== null && OFFLINE_STAGES.includes(current) && OFFLINE_STAGES.includes(next) && health.healthy;

  return {
    currentStage: current,
    nextStage: next,
    eligible: nextEligible,
    path,
    reason: nextEligible
      ? `Promotable ${current} → ${next} within the offline world.`
      : next === "Future Live"
        ? "Promotion to Future Live is blocked by the runtime boundary."
        : `No eligible promotion from ${current}.`,
  };
}
