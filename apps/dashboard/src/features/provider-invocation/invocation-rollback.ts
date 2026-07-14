/*
 * invocation-rollback.ts — deterministic rollback policy. Read/planning/sim
 * modes have nothing to undo; mutating-capable modes declare a compensating
 * rollback contract (never executed in this phase).
 */

import type { InvocationExecutionMode, RollbackPolicy } from "@/features/provider-invocation/types";

export function rollbackPolicyFor(mode: InvocationExecutionMode): RollbackPolicy {
  switch (mode) {
    case "Approval Required":
    case "Future Live":
      return { enabled: true, strategy: "compensating", note: "Compensating rollback contract for future live mutations." };
    case "Dry Run":
      return { enabled: true, strategy: "checkpoint", note: "Dry-run checkpoints are discarded, no side effects." };
    default:
      return { enabled: false, strategy: "none", note: "Read-only / simulation mode has no state to roll back." };
  }
}
