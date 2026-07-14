import type { ProviderHealth } from "@/features/provider-framework";

export const browserProviderHealth: ProviderHealth = {
  status: "Healthy",
  availability: 100,
  latencyMs: 18,
  note: "Offline simulation provider. No browser engine, no Playwright, no Puppeteer, no Selenium, no Browser Use, no JavaScript execution, and no network access.",
};
