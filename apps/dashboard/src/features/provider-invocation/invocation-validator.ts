/*
 * invocation-validator.ts — deterministic contract validation. Confirms every
 * invocation carries a valid provider, routing decision, execution mode,
 * lifecycle state, retry/timeout policies, response and artifacts.
 */

import { lifecycleStates } from "@/features/provider-invocation/invocation-lifecycle";
import type { Invocation, InvocationExecutionMode, InvocationValidation } from "@/features/provider-invocation/types";

const validModes: InvocationExecutionMode[] = [
  "Simulation",
  "Dry Run",
  "Read Only",
  "Planning",
  "Approval Required",
  "Future Live",
];

export function validateInvocation(inv: Invocation): InvocationValidation {
  const issues: string[] = [];
  const ready = inv.status === "Ready";

  if (ready && !inv.providerId) issues.push("Missing provider for a prepared invocation.");
  if (!inv.routingDecisionId) issues.push("Missing routing decision reference.");
  if (!lifecycleStates.includes(inv.status)) issues.push("Invalid lifecycle state.");
  if (!validModes.includes(inv.executionMode)) issues.push("Invalid execution mode.");
  if (inv.retryPolicy.maxAttempts < 1) issues.push("Invalid retry policy (maxAttempts < 1).");
  if (inv.timeoutPolicy.timeoutMs <= 0) issues.push("Invalid timeout (must be positive).");
  if (inv.timeoutPolicy.timeoutMs > inv.timeoutPolicy.hardCapMs) issues.push("Timeout exceeds hard cap.");
  if (ready && inv.expectedResponse.status === "blocked") issues.push("Prepared invocation must not have a blocked response.");
  if (ready && inv.artifacts.length === 0) issues.push("Prepared invocation must declare artifact contracts.");

  return { invocationId: inv.id, valid: issues.length === 0, issues };
}
