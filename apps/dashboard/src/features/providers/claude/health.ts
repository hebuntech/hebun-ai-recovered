import type { ProviderHealth } from "@/features/provider-framework";

export const claudeProviderHealth: ProviderHealth = {
  status: "Healthy",
  availability: 100,
  latencyMs: 32,
  note: "Offline simulation provider. No external Claude traffic, credentials, or SDK dependencies.",
};
