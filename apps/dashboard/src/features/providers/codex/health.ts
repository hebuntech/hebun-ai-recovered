import type { ProviderHealth } from "@/features/provider-framework";

export const codexProviderHealth: ProviderHealth = {
  status: "Healthy",
  availability: 100,
  latencyMs: 29,
  note: "Offline simulation provider. No API calls, SDK usage, repository mutation, shell execution, or credentials.",
};
