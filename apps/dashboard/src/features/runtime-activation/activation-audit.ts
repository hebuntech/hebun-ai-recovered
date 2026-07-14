import type { ActivationDecision, ActivationGateResult } from "@/features/runtime-activation/types";

export function buildActivationAudit(input: {
  decision: Omit<ActivationDecision, "audit" | "events" | "report">;
  gates: ActivationGateResult[];
}) {
  const { decision, gates } = input;
  return [
    { subject: "runtime-decision" as const, detail: `Derived from ${decision.runtimeDecisionId}.` },
    { subject: "environment" as const, detail: `${decision.environment.status}: ${decision.environment.note}` },
    { subject: "credentials" as const, detail: `${decision.credentials.status}: ${decision.credentials.note}` },
    { subject: "policy" as const, detail: `${decision.policy.status}: ${decision.policy.note}` },
    { subject: "approval" as const, detail: `${decision.approval.status}: ${decision.approval.note}` },
    { subject: "risk" as const, detail: `${decision.risk.level}: ${decision.risk.note}` },
    { subject: "readiness" as const, detail: `${decision.readiness.score}%: ${decision.readiness.summary}` },
    {
      subject: "gates" as const,
      detail: `${gates.filter((gate) => gate.passed).length}/${gates.length} gates passed.`,
    },
    {
      subject: "activation-decision" as const,
      detail: `${decision.activationLevel} with simulation fallback ${decision.simulationFallback ? "enabled" : "disabled"}.`,
    },
  ];
}
