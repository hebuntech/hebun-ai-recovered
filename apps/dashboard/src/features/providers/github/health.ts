import type { ProviderHealth } from "@/features/provider-framework";

export const githubProviderHealth: ProviderHealth = {
  status: "Healthy",
  availability: 100,
  latencyMs: 24,
  note: "Offline simulation provider. No API calls, Octokit, credentials, env access, Git commands, or repository mutation.",
};
