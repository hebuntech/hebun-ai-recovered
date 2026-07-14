/*
 * invocation-lifecycle.ts — the deterministic invocation lifecycle and its
 * allowed transitions. Offline invocations are prepared up to "Ready"; live
 * states (Invoking → Completed / Timed Out …) are defined for future providers
 * but never entered in this phase.
 */

import type { BadgeVariant } from "@/components/ui/badge";
import type { InvocationLifecycleState, LifecycleTransition } from "@/features/provider-invocation/types";

export const lifecycleStates: InvocationLifecycleState[] = [
  "Created",
  "Validated",
  "Prepared",
  "Ready",
  "Invoking",
  "Completed",
  "Cancelled",
  "Timed Out",
  "Rolled Back",
  "Failed",
  "Disposed",
];

export const lifecycleTransitions: LifecycleTransition[] = [
  { from: "Created", to: ["Validated", "Failed"] },
  { from: "Validated", to: ["Prepared", "Failed"] },
  { from: "Prepared", to: ["Ready", "Failed"] },
  { from: "Ready", to: ["Invoking", "Cancelled", "Disposed"] },
  { from: "Invoking", to: ["Completed", "Failed", "Cancelled", "Timed Out", "Rolled Back"] },
  { from: "Completed", to: ["Disposed"] },
  { from: "Cancelled", to: ["Disposed"] },
  { from: "Timed Out", to: ["Rolled Back", "Disposed"] },
  { from: "Rolled Back", to: ["Disposed"] },
  { from: "Failed", to: ["Rolled Back", "Disposed"] },
  { from: "Disposed", to: [] },
];

/** offline phase: valid contracts reach Ready, invalid ones Fail. */
export const OFFLINE_TERMINAL_STATE: InvocationLifecycleState = "Ready";

export function canTransition(from: InvocationLifecycleState, to: InvocationLifecycleState): boolean {
  return lifecycleTransitions.find((t) => t.from === from)?.to.includes(to) ?? false;
}

export function lifecycleBadge(state: InvocationLifecycleState): BadgeVariant {
  if (state === "Ready" || state === "Completed") return "success";
  if (state === "Failed" || state === "Timed Out") return "error";
  if (state === "Cancelled" || state === "Rolled Back") return "warning";
  return "neutral";
}
