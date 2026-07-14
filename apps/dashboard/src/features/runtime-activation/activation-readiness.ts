import { getCatalogEntry } from "@/features/provider-matrix";
import type { RuntimeDecision } from "@/features/runtime-boundary";
import type {
  ActivationApprovalAssessment,
  ActivationPolicyAssessment,
  ActivationReadinessAssessment,
  ActivationRiskAssessment,
} from "@/features/runtime-activation/types";

export function assessActivationReadiness(
  runtimeDecision: RuntimeDecision,
  policy: ActivationPolicyAssessment,
  approval: ActivationApprovalAssessment,
  risk: ActivationRiskAssessment
): ActivationReadinessAssessment {
  const catalogEntry = runtimeDecision.providerId ? getCatalogEntry(runtimeDecision.providerId) : undefined;
  const checks = [
    {
      label: "Provider Readiness",
      ready: (catalogEntry?.health.availability ?? 0) >= 90,
      score: catalogEntry?.health.availability ?? 0,
      note: catalogEntry
        ? `${catalogEntry.name} health availability is ${catalogEntry.health.availability}%.`
        : "No provider selected; activation remains blocked.",
    },
    {
      label: "Runtime Readiness",
      ready: runtimeDecision.runtimeHealth.healthy,
      score: runtimeDecision.runtimeHealth.score,
      note: `Runtime boundary health is ${runtimeDecision.runtimeHealth.score}%.`,
    },
    {
      label: "Configuration Readiness",
      ready: runtimeDecision.credential.state !== "Invalid" && runtimeDecision.credential.state !== "Expired",
      score: runtimeDecision.credential.state === "Injected" ? 100 : runtimeDecision.credential.required ? 40 : 80,
      note: `Credential state is ${runtimeDecision.credential.state}.`,
    },
    {
      label: "Policy Readiness",
      ready: policy.status === "Allowed",
      score: policy.status === "Allowed" ? 100 : policy.status === "Restricted" ? 60 : 20,
      note: policy.note,
    },
    {
      label: "Approval Readiness",
      ready: approval.approved,
      score: approval.approved ? 100 : 35,
      note: approval.note,
    },
    {
      label: "Simulation Readiness",
      ready: runtimeDecision.simulationFallback,
      score: runtimeDecision.simulationFallback ? 100 : 0,
      note: runtimeDecision.simulationFallback
        ? "Simulation fallback is available."
        : "Simulation fallback is missing.",
    },
    {
      label: "Risk Readiness",
      ready: !risk.blocked && risk.level !== "high",
      score: 100 - risk.score,
      note: risk.note,
    },
  ];

  const score = Math.round(checks.reduce((sum, check) => sum + check.score, 0) / checks.length);
  const ready = checks.every((check) => check.ready) || score >= 80;

  return {
    checks,
    score,
    ready,
    summary: ready
      ? "Activation can remain on the deterministic path and is structurally ready for future promotion review."
      : "Activation is not ready for live promotion and remains constrained to offline-safe modes.",
  };
}
