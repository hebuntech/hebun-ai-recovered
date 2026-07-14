import { validateProvider } from "@/features/provider-framework/provider-validator";
import type { ProviderAdapter } from "@/features/provider-framework/types";

/*
 * provider-loader.ts — deterministic load sequence for a ProviderAdapter.
 * Models discovery → validation → registration → ready. No dynamic import,
 * no code execution; real providers wire loading in later phases.
 */
export interface ProviderLoadStep {
  stage: "Discovered" | "Validated" | "Registered" | "Ready";
  ok: boolean;
  note: string;
}

export function providerLoadSequence(provider: ProviderAdapter): ProviderLoadStep[] {
  const validation = validateProvider(provider);
  return [
    { stage: "Discovered", ok: true, note: `${provider.metadata.name} discovered` },
    { stage: "Validated", ok: validation.valid, note: validation.summary },
    { stage: "Registered", ok: validation.valid, note: validation.valid ? "Registered with framework" : "Registration blocked" },
    { stage: "Ready", ok: validation.valid, note: validation.valid ? "Ready for simulation" : "Not ready" },
  ];
}
