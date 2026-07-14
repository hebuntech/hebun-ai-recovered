import type { ProviderHealth } from "@/features/provider-framework";

export const communicationProviderHealth: ProviderHealth = {
  status: "Healthy",
  availability: 100,
  latencyMs: 19,
  note: "Offline simulation provider. No Gmail, Calendar, Outlook, Slack, Teams, OAuth, credentials, or network access.",
};
