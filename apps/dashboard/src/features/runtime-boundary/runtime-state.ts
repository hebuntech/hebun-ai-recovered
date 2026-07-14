/*
 * runtime-state.ts — deterministic runtime states + badge mapping. Offline
 * boundary: decisions resolve to Ready / Approval Pending / Blocked and never
 * enter a live running state.
 */

import type { BadgeVariant } from "@/components/ui/badge";
import type { RuntimeMode, RuntimeState } from "@/features/runtime-boundary/types";

export const runtimeStates: RuntimeState[] = [
  "Created",
  "Ready",
  "Gated",
  "Approval Pending",
  "Promotable",
  "Blocked",
  "Emergency Stopped",
];

export function stateBadge(state: RuntimeState): BadgeVariant {
  if (state === "Ready" || state === "Promotable") return "success";
  if (state === "Blocked" || state === "Emergency Stopped") return "error";
  if (state === "Approval Pending" || state === "Gated") return "warning";
  return "neutral";
}

export function modeBadge(mode: RuntimeMode): BadgeVariant {
  switch (mode) {
    case "Simulation":
    case "Read Only":
      return "success";
    case "Dry Run":
      return "info";
    case "Approval Required":
      return "warning";
    case "Future Live":
    case "Blocked":
    case "Emergency Stop":
      return "error";
    default:
      return "neutral";
  }
}
