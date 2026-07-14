/*
 * runtime-environment.ts — deterministic environment assessment. The runtime
 * environment is intentionally offline: network disabled, secrets disabled. This
 * is a safe, ready environment for simulation — and an intentionally incomplete
 * one for live execution.
 */

import type { EnvironmentAssessment } from "@/features/runtime-boundary/types";

export function assessEnvironment(): EnvironmentAssessment {
  return {
    offline: true,
    networkDisabled: true,
    secretsDisabled: true,
    ready: true,
    note: "Deterministic offline environment: no network, no secret managers, no env access.",
  };
}
