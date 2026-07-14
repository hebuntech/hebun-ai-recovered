import type { ProviderHealth } from "@/features/provider-framework";

export const computerUseProviderHealth: ProviderHealth = {
  status: "Healthy",
  availability: 100,
  latencyMs: 22,
  note: "Offline simulation provider. No OS control, no keyboard or mouse input, no app launch, no shell execution, no screenshots, no filesystem access, and no network access.",
};
