/*
 * invocation-retry.ts — deterministic retry policy for invocations. Reuses the
 * Adapter SDK retry policy (exponential backoff, no jitter). Approval-required
 * and future-live modes are not auto-retried.
 */

import { defaultRetryPolicy, retrySchedule } from "@/features/adapters";
import type { RetryPolicy } from "@/features/adapters";
import type { InvocationExecutionMode } from "@/features/provider-invocation/types";

const noRetry: RetryPolicy = { ...defaultRetryPolicy, maxAttempts: 1 };

export function retryPolicyFor(mode: InvocationExecutionMode): RetryPolicy {
  // Approval-gated and future-live invocations are never auto-retried.
  if (mode === "Approval Required" || mode === "Future Live") return noRetry;
  // Retryable modes use the deterministic backoff schedule.
  return { ...defaultRetryPolicy };
}

export function retryScheduleFor(policy: RetryPolicy): number[] {
  return retrySchedule(policy);
}
