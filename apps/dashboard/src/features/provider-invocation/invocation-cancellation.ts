/*
 * invocation-cancellation.ts — deterministic cancellation policy. Every offline
 * invocation is cancellable (nothing is running to interrupt). Future live
 * modes declare cooperative cancellation checkpoints.
 */

import type { CancellationPolicy, InvocationExecutionMode } from "@/features/provider-invocation/types";

export function cancellationPolicyFor(mode: InvocationExecutionMode): CancellationPolicy {
  switch (mode) {
    case "Approval Required":
      return { cancellable: true, cooperative: true, note: "Cancellable at the approval gate before any action." };
    case "Future Live":
      return { cancellable: true, cooperative: true, note: "Cooperative cancellation checkpoints for future live mode." };
    default:
      return { cancellable: true, cooperative: false, note: "Offline invocation can be discarded at any time." };
  }
}
