/*
 * runtime-policies.ts — deterministic policy assessment at the boundary. Policy
 * is recorded offline and never enforced against a live system. Live execution
 * is restricted; blocked invocations are denied.
 */

import type { RuntimeContext } from "@/features/runtime-boundary/runtime-context";
import type { PolicyAssessment } from "@/features/runtime-boundary/types";

export function assessPolicy(context: RuntimeContext): PolicyAssessment {
  if (context.runtimeMode === "Blocked") {
    return { status: "blocked", note: "No provider; policy cannot permit execution." };
  }
  if (context.runtimeMode === "Future Live") {
    return { status: "restricted", note: "Policy restricts live execution in this phase." };
  }
  return { status: "allowed", note: "Offline execution permitted by policy." };
}
