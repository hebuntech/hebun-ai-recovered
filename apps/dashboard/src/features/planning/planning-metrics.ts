import { generatedPlans } from "@/features/planning/planning-pipeline";
import { latestGeneratedPlan } from "@/features/planning/planning-queries";
import type { PlanningMetrics } from "@/features/planning/types";

const activePlans = generatedPlans.filter((plan) => plan.status !== "blocked").length;
const blockedPlans = generatedPlans.filter((plan) => plan.status === "blocked").length;
const tasksGenerated = generatedPlans.reduce((sum, plan) => sum + plan.tasks.length, 0);
const milestones = generatedPlans.reduce((sum, plan) => sum + plan.milestones.length, 0);
const averageDurationDays = Math.round(
  generatedPlans.reduce((sum, plan) => sum + plan.estimatedDurationDays, 0) /
    Math.max(generatedPlans.length, 1)
);
const averageConfidence = Math.round(
  generatedPlans.reduce((sum, plan) => sum + plan.confidence, 0) /
    Math.max(generatedPlans.length, 1)
);
const planningHealth = Math.max(
  0,
  Math.min(
    100,
    Math.round(
      averageConfidence * 0.45 +
        activePlans * 8 +
        milestones * 2 -
        blockedPlans * 10 -
        generatedPlans.filter((plan) =>
          plan.riskAssessment.some((risk) => risk.level === "critical")
        ).length *
          6
    )
  )
);

export const planningMetrics: PlanningMetrics = {
  activePlans,
  tasksGenerated,
  milestones,
  blockedPlans,
  averageCompletionEstimate: `${averageDurationDays} days`,
  planningHealth,
  averageConfidence,
  latestPlan: latestGeneratedPlan()?.title ?? "No generated plan",
  healthBadge:
    planningHealth >= 90 ? "success" : planningHealth >= 82 ? "warning" : "error",
};
