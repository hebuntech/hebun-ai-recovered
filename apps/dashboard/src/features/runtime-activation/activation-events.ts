import type {
  ActivationDecision,
  ActivationEvent,
  ActivationGateResult,
} from "@/features/runtime-activation/types";

const EPOCH = "2025-01-01T00:00:00.000Z";

export function buildActivationEvents(input: {
  decision: Omit<ActivationDecision, "audit" | "events" | "report">;
  gates: ActivationGateResult[];
}) {
  const { decision, gates } = input;
  const events: ActivationEvent[] = [
    {
      type: "Activation Requested" as const,
      label: decision.context.requestId,
      at: EPOCH,
      note: "Activation evaluation started from the runtime-boundary decision.",
    },
    {
      type: "Activation Context Resolved" as const,
      label: decision.providerId ?? "unassigned",
      at: EPOCH,
      note: `Resolved ${decision.context.runtimeMode} runtime mode for activation review.`,
    },
    ...gates.map((gate) => ({
      type: gate.passed ? ("Activation Gate Passed" as const) : ("Activation Gate Failed" as const),
      label: gate.gate,
      at: EPOCH,
      note: gate.reason,
    })),
  ];

  if (decision.blocked) {
    events.push({
      type: "Activation Blocked" as const,
      label: decision.activationLevel,
      at: EPOCH,
      note: decision.blockReasons[0] ?? "Activation remained blocked.",
    });
  } else {
    events.push({
      type: "Activation Ready" as const,
      label: decision.activationLevel,
      at: EPOCH,
      note: "Activation remained in an allowed deterministic execution mode.",
    });
  }

  if (decision.simulationFallback) {
    events.push({
      type: "Simulation Fallback" as const,
      label: "Simulation",
      at: EPOCH,
      note: "Simulation fallback remains available.",
    });
  }

  events.push({
    type: "Activation Report Generated" as const,
    label: decision.id,
    at: EPOCH,
    note: "Activation report published.",
  });

  return events;
}
