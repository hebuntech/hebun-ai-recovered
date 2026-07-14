import { orchestrationBlueprints } from "@/features/orchestration/orchestration-pipeline";

export function latestOrchestrationBlueprint() {
  return orchestrationBlueprints[0];
}

export function blueprintById(id: string) {
  return orchestrationBlueprints.find((item) => item.id === id);
}
