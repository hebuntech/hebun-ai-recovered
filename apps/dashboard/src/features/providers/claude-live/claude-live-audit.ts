import type {
  ClaudeLiveAuditRecord,
  ClaudeLiveEligibility,
  ClaudeLiveRequest,
} from "@/features/providers/claude-live/types";

export function buildClaudeLiveAudit(
  request: ClaudeLiveRequest,
  eligibility: ClaudeLiveEligibility
): ClaudeLiveAuditRecord[] {
  return [
    {
      step: "request created",
      detail: `${request.id} created for ${request.capability}.`,
    },
    {
      step: "activation checked",
      detail: eligibility.activationLevel
        ? `Activation level resolved as ${eligibility.activationLevel}.`
        : "No activation decision resolved.",
    },
    {
      step: "runtime checked",
      detail: request.runtimeDecisionId
        ? `Runtime decision ${request.runtimeDecisionId} linked.`
        : "No runtime decision linked.",
    },
    {
      step: "credential checked",
      detail: `Credential status is ${eligibility.credentialStatus}.`,
    },
    {
      step: "capability checked",
      detail: "Summarization is the only allowlisted capability.",
    },
    {
      step: "dry run generated",
      detail: "Dry run result created without calling Claude.",
    },
    {
      step: "live blocked",
      detail:
        eligibility.reasons[0] ??
        "No live block recorded because all gates are hypothetically satisfied.",
    },
    {
      step: "simulation fallback prepared",
      detail: "Simulation fallback prepared for deterministic continuation.",
    },
    {
      step: "response produced",
      detail: "Normalized Claude live foundation response emitted.",
    },
  ];
}
