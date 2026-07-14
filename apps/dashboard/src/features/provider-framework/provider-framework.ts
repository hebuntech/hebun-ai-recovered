import { validateProvider } from "@/features/provider-framework/provider-validator";
import { runConformance } from "@/features/provider-framework/provider-conformance";
import { runTestHarness } from "@/features/provider-framework/provider-test-harness";
import { referenceProvider } from "@/features/provider-framework/provider-contract";
import { FRAMEWORK_VERSION, type ProviderAdapter } from "@/features/provider-framework/types";

/*
 * provider-framework.ts — the framework facade.
 *
 * The single seam the Adapter SDK + Execution Engine use to onboard providers:
 * validate the contract, run conformance, and exercise the provider in
 * deterministic simulation. No real provider, no network, no credentials.
 */

export const frameworkVersion = FRAMEWORK_VERSION;

/** Gate a provider before registration: contract + conformance must pass. */
export function registerProvider(provider: ProviderAdapter) {
  const validation = validateProvider(provider);
  const conformance = runConformance(provider);
  return {
    accepted: validation.valid && conformance.verdict !== "fail",
    validation,
    conformance,
  };
}

/** Run a provider through the deterministic test harness. */
export function simulateProvider(provider: ProviderAdapter) {
  return runTestHarness(provider);
}

/* Ready-made results for the reference provider (UI display). */
export const referenceConformance = runConformance(referenceProvider);
export const referenceHarness = runTestHarness(referenceProvider);
