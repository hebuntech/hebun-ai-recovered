import type { GovernanceResult } from "@/features/policy";
import type { PlanningRisk } from "@/features/planning/types";
import { riskSignalsForRegistry } from "@/features/registries";

export function evaluatePlanningRisks(governance: GovernanceResult): PlanningRisk[] {
  const registrySignals = governance.relatedRegistryIds.flatMap((registryId) =>
    riskSignalsForRegistry(registryId).slice(0, 1)
  );

  const risks: PlanningRisk[] = [
    {
      id: `${governance.id}-risk-1`,
      title: "Governance posture may slow sequencing",
      level:
        governance.governanceDecision.status === "approval-required" ? "high" : "medium",
      detail: `${governance.governanceDecision.summary} This can delay milestone commitment unless approvals are front-loaded into the blueprint.`,
      mitigation: "Place approval checkpoints before parallel work expands.",
      source: "Policy & Governance Engine",
    },
    {
      id: `${governance.id}-risk-2`,
      title: "Registry dependencies can create hidden blockers",
      level:
        registrySignals.some((signal) => signal.severity === "error") ? "high" : "medium",
      detail: registrySignals[0]?.detail ?? "Related registries carry normal dependency pressure and should still be sequenced explicitly.",
      mitigation: "Anchor the critical path on the weakest dependency chain rather than the fastest task.",
      source: "Registry Intelligence",
    },
    {
      id: `${governance.id}-risk-3`,
      title: "Memory-backed reuse may be thinner than expected",
      level: governance.relatedMemoryIds.length < 3 ? "medium" : "low",
      detail: `${governance.relatedMemoryIds.length} memories are directly attached to this plan candidate, which affects how confidently reusable the blueprint will be.`,
      mitigation: "Keep rationale and rollback points explicit so future runs remain explainable.",
      source: "Company Memory Layer",
    },
  ];

  if (governance.riskAssessment.level === "critical") {
    risks.unshift({
      id: `${governance.id}-risk-0`,
      title: "Critical governance risk requires constrained planning",
      level: "critical",
      detail: governance.riskAssessment.detail,
      mitigation: "Limit the blueprint to tightly controlled milestones and explicit handoff gates.",
      source: "Policy Risk Engine",
    });
  }

  return risks;
}
