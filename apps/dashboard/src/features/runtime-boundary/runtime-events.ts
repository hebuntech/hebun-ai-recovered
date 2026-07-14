/*
 * runtime-events.ts — deterministic boundary event stream, fixed timestamps for
 * reproducibility. Reflects gate outcomes, approval, promotion and the final
 * blocked/completed state.
 */

import type { RuntimeContext } from "@/features/runtime-boundary/runtime-context";
import type {
  ApprovalAssessment,
  PromotionAssessment,
  RuntimeEvent,
  RuntimeGateResult,
} from "@/features/runtime-boundary/types";

const EPOCH = "2025-01-01T00:00:00.000Z";

export function buildEvents(
  context: RuntimeContext,
  gates: RuntimeGateResult[],
  approval: ApprovalAssessment,
  promotion: PromotionAssessment,
  allowed: boolean
): RuntimeEvent[] {
  const events: RuntimeEvent[] = [
    { type: "Runtime Created", label: "Created", at: EPOCH, note: `Runtime boundary evaluated for ${context.requestId}.` },
    { type: "Runtime Ready", label: "Ready", at: EPOCH, note: `Mode ${context.runtimeMode}.` },
  ];

  for (const gate of gates) {
    events.push({
      type: gate.passed ? "Gate Passed" : "Gate Failed",
      label: gate.gate,
      at: EPOCH,
      note: gate.reason,
    });
  }

  if (approval.required) {
    events.push({ type: "Approval Required", label: "Approval Required", at: EPOCH, note: approval.reason });
  }

  events.push(
    promotion.eligible
      ? { type: "Promotion Approved", label: "Promotion Approved", at: EPOCH, note: promotion.reason }
      : { type: "Promotion Blocked", label: "Promotion Blocked", at: EPOCH, note: promotion.reason }
  );

  events.push(
    allowed
      ? { type: "Runtime Completed", label: "Runtime Completed", at: EPOCH, note: "Offline runtime evaluation complete." }
      : { type: "Runtime Blocked", label: "Runtime Blocked", at: EPOCH, note: "Held on the offline side of the boundary." }
  );

  return events;
}
