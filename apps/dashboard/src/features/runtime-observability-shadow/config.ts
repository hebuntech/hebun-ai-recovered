import type { ShadowObservabilityConfig } from "./types";

export function createShadowObservabilityConfig(input: ShadowObservabilityConfig): ShadowObservabilityConfig {
  if (!input.instrumentationVersion.trim() || !["simulation", "dry-run", "live"].includes(input.environment)) {
    throw new TypeError("Invalid shadow observability configuration.");
  }
  return Object.freeze({ ...input });
}
