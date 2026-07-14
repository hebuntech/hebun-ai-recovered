import type { AdapterCapabilityKind } from "@/features/adapters/types";

/*
 * timeout-policy.ts — deterministic per-capability execution deadlines.
 * The Execution Engine enforces these; adapters never set their own timeouts.
 */

export interface TimeoutPolicy {
  defaultMs: number;
  perCapabilityMs: Partial<Record<AdapterCapabilityKind, number>>;
  hardCapMs: number;
}

export const defaultTimeoutPolicy: TimeoutPolicy = {
  defaultMs: 30_000,
  hardCapMs: 300_000,
  perCapabilityMs: {
    "File System": 15_000,
    Terminal: 60_000,
    Browser: 120_000,
    "Code Generation": 90_000,
    Repository: 60_000,
    Email: 15_000,
    Messaging: 15_000,
    Calendar: 15_000,
    Search: 20_000,
    Simulation: 5_000,
    "Human Approval": 300_000,
  },
};

export function timeoutFor(capability: AdapterCapabilityKind, policy: TimeoutPolicy = defaultTimeoutPolicy): number {
  const value = policy.perCapabilityMs[capability] ?? policy.defaultMs;
  return Math.min(value, policy.hardCapMs);
}
