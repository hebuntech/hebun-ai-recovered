import type {
  TransformationGap,
  TransformationPriority,
  TransformationPriorityLevel,
} from "./types";

function severityWeight(severity: TransformationGap["severity"]): number {
  if (severity === "critical") return 4;
  if (severity === "high") return 3;
  if (severity === "medium") return 2;
  return 1;
}

function dependencyWeight(domain: TransformationGap["domain"]): number {
  if (domain === "organization" || domain === "governance" || domain === "workflows") return 4;
  if (domain === "agents" || domain === "policy" || domain === "execution-readiness") return 3;
  return 2;
}

function effortForDomain(domain: TransformationGap["domain"]): "low" | "medium" | "high" {
  if (domain === "organization" || domain === "governance" || domain === "policy") return "high";
  if (domain === "workflows" || domain === "agents" || domain === "execution-readiness") return "medium";
  return "low";
}

function blockedCapabilities(domain: TransformationGap["domain"]): string[] {
  switch (domain) {
    case "organization":
      return ["clear ownership", "organizational scaling"];
    case "agents":
      return ["safe delegation", "agent supervision"];
    case "workflows":
      return ["orchestrated execution", "workflow scaling"];
    case "knowledge":
      return ["knowledge reuse", "context quality"];
    case "memory":
      return ["operational learning", "memory promotion"];
    case "governance":
    case "policy":
      return ["governed AI operations", "safe approval flow"];
    case "learning-readiness":
      return ["continuous improvement", "AI-native maturity"];
    case "execution-readiness":
      return ["dispatch reliability", "operational scale"];
    default:
      return ["executive visibility"];
  }
}

export const TransformationPriorityEngine = {
  scoreFromGap(gap: TransformationGap): TransformationPriority {
    const businessCriticality = severityWeight(gap.severity);
    const architecturalDependency = dependencyWeight(gap.domain);
    const riskReduction = severityWeight(gap.severity);
    const organizationalReadiness = Math.max(1, Math.round(gap.confidence / 25));
    const effort = effortForDomain(gap.domain);
    const effortPenalty = effort === "high" ? 1 : effort === "medium" ? 2 : 3;
    const score = businessCriticality * 20 + architecturalDependency * 15 + riskReduction * 15 + organizationalReadiness * 10 + effortPenalty * 5;
    const level: TransformationPriorityLevel =
      score >= 90 ? "critical" : score >= 70 ? "high" : score >= 50 ? "medium" : "low";

    return {
      level,
      score,
      businessCriticality,
      architecturalDependency,
      riskReduction,
      organizationalReadiness,
      implementationEffort: effort,
      blockedCapabilities: blockedCapabilities(gap.domain),
      confidence: gap.confidence,
      summary: `${level} priority because ${gap.domain} blocks ${blockedCapabilities(gap.domain).join(" and ")}.`,
    };
  },
};
