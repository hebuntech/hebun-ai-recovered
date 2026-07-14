import { governancePolicies } from "@/features/governance/policies";
import type { PolicyCategory, PolicyRule } from "@/features/policy/types";
import type { GovernancePolicy } from "@/features/governance/types";
import type { RegistryKey } from "@/features/registries/types";

function mapDomainToCategory(domain: GovernancePolicy["domain"]): PolicyCategory {
  switch (domain) {
    case "business":
      return "business";
    case "ai":
      return "ai";
    case "security":
      return "security";
    case "operational":
      return "workflow";
    case "department":
      return "approval";
  }
}

function appliesTo(name: string): RegistryKey[] {
  if (name.includes("Approval")) return ["governance", "events", "executions"];
  if (name.includes("Explainability")) return ["learning", "governance", "workflows"];
  if (name.includes("Permission")) return ["governance", "tools", "models"];
  if (name.includes("Rollback")) return ["workflows", "executions", "risk"];
  if (name.includes("Legal")) return ["governance", "entities", "risk"];
  return ["governance"];
}

export function buildPolicyRules(): PolicyRule[] {
  return governancePolicies.map((policy) => ({
    id: policy.id,
    name: policy.name,
    category: mapDomainToCategory(policy.domain),
    owner: policy.owner,
    description: policy.impact,
    appliesTo: appliesTo(policy.name),
    minComplianceScore:
      policy.domain === "security" ? 93 : policy.domain === "ai" ? 91 : 90,
    triggerRiskLevel:
      policy.domain === "security" || policy.domain === "ai" ? "medium" : undefined,
    approvalMode:
      policy.name.includes("Approval")
        ? "director"
        : policy.name.includes("Permission")
          ? "human-review"
          : policy.name.includes("Rollback")
            ? "emergency-override"
            : "none",
    reviewRequired: policy.status === "review" || policy.status === "draft",
  }));
}
