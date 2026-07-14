/*
 * invocation-timeout.ts — deterministic per-execution-mode timeout policy. No
 * real timers; these are contract budgets only.
 */

import type { InvocationExecutionMode, TimeoutPolicy } from "@/features/provider-invocation/types";

const HARD_CAP_MS = 300_000;

const timeoutByMode: Record<InvocationExecutionMode, number> = {
  Simulation: 5_000,
  "Dry Run": 30_000,
  "Read Only": 20_000,
  Planning: 60_000,
  "Approval Required": 300_000,
  "Future Live": 120_000,
};

export function timeoutPolicyFor(mode: InvocationExecutionMode): TimeoutPolicy {
  return {
    timeoutMs: Math.min(timeoutByMode[mode], HARD_CAP_MS),
    hardCapMs: HARD_CAP_MS,
    mode,
  };
}
