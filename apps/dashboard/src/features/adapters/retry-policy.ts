import { isRecoverable, type AdapterErrorCode } from "@/features/adapters/error-codes";

/*
 * retry-policy.ts — deterministic retry policy for adapter executions.
 * Exponential backoff with a fixed base and cap; no jitter (deterministic).
 */

export interface RetryPolicy {
  maxAttempts: number;
  baseDelayMs: number;
  maxDelayMs: number;
  multiplier: number;
}

export const defaultRetryPolicy: RetryPolicy = {
  maxAttempts: 3,
  baseDelayMs: 1000,
  maxDelayMs: 8000,
  multiplier: 2,
};

/** deterministic delay for a given attempt (1-based). */
export function retryDelay(attempt: number, policy: RetryPolicy = defaultRetryPolicy): number {
  const raw = policy.baseDelayMs * Math.pow(policy.multiplier, Math.max(0, attempt - 1));
  return Math.min(raw, policy.maxDelayMs);
}

export function shouldRetry(code: AdapterErrorCode, attempt: number, policy: RetryPolicy = defaultRetryPolicy): boolean {
  return isRecoverable(code) && code !== "CANCELLED" && attempt < policy.maxAttempts;
}

/** full deterministic schedule preview for diagnostics UI. */
export function retrySchedule(policy: RetryPolicy = defaultRetryPolicy): number[] {
  return Array.from({ length: policy.maxAttempts }, (_, i) => retryDelay(i + 1, policy));
}
