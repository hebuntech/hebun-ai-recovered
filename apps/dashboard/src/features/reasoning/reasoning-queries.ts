import { reasoningResults } from "@/features/reasoning/reasoning-pipeline";
import type { RegistryKey } from "@/features/registries/types";

export function latestReasoningResult() {
  return reasoningResults[0];
}

export function reasoningResultsByRegistry(registryId: RegistryKey) {
  return reasoningResults.filter((result) =>
    result.relatedRegistryIds.includes(registryId)
  );
}
