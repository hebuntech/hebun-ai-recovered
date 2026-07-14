import {
  capabilityCompliance,
  complianceViolations,
  countryCompliance,
  departmentCompliance,
  workflowCompliance,
} from "@/features/governance/compliance";
import type { ComplianceResult } from "@/features/policy/types";

export function evaluateCompliance(): ComplianceResult[] {
  const avgCountry = Math.round(
    countryCompliance.reduce((sum, item) => sum + item.score, 0) /
      countryCompliance.length
  );
  const hrCompliance = departmentCompliance.find((item) => item.label === "HR")?.score ?? 90;
  const explainability = capabilityCompliance.find(
    (item) => item.label === "Explainability"
  )?.score ?? 90;
  const candidateWorkflow = workflowCompliance.find(
    (item) => item.label === "Candidate Screening"
  )?.score ?? 88;
  const openViolations = complianceViolations.filter((violation) => violation.status === "open").length;

  return [
    {
      framework: "GDPR",
      status: avgCountry >= 93 ? "pass" : "watch",
      score: avgCountry,
      detail: "Regional privacy readiness remains strong enough for deterministic governance decisions.",
    },
    {
      framework: "KVKK",
      status: avgCountry >= 92 ? "pass" : "watch",
      score: 94,
      detail: "KVKK obligations remain within the acceptable compliance band.",
    },
    {
      framework: "ISO 27001",
      status: explainability >= 90 ? "watch" : "fail",
      score: explainability,
      detail: "Evidence handling and permission discipline must stay within documented control standards.",
    },
    {
      framework: "SOC 2",
      status: candidateWorkflow >= 90 ? "pass" : "watch",
      score: candidateWorkflow,
      detail: "Workflow traceability is acceptable but still sensitive in HR-related flows.",
    },
    {
      framework: "Internal Company Policies",
      status: openViolations > 0 || hrCompliance < 90 ? "watch" : "pass",
      score: Math.round((hrCompliance + explainability) / 2),
      detail: "Internal policy compliance remains viable but needs close review where explainability and HR controls intersect.",
    },
  ];
}
