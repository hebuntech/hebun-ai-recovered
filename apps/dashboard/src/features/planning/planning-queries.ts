import { generatedPlans } from "@/features/planning/planning-pipeline";

export function latestGeneratedPlan() {
  return generatedPlans[0];
}

export function planById(id: string) {
  return generatedPlans.find((plan) => plan.id === id);
}
