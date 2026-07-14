import { registryById } from "@/features/registries";
import type { ReasoningContext, ReasoningScenario } from "@/features/reasoning/types";

export function buildReasoningContext(scenario: ReasoningScenario): ReasoningContext {
  return {
    scenarioId: scenario.id,
    title: scenario.title,
    objective: scenario.objective,
    focus: scenario.focus,
    registries: scenario.registryIds
      .map((registryId) => registryById(registryId))
      .filter((registry): registry is NonNullable<typeof registry> => Boolean(registry)),
    registryIds: scenario.registryIds,
    query: scenario.query,
    hardConstraints: scenario.hardConstraints,
    softConstraints: scenario.softConstraints,
    goalLabels: scenario.goalLabels,
  };
}
