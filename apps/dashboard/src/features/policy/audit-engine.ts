import type { PolicyAuditRecord } from "@/features/policy/types";
import type { ReasoningResult } from "@/features/reasoning";

export function buildAuditRecord(
  reasoning: ReasoningResult,
  decisionSummary: string,
  approvalRequirements: string[]
): PolicyAuditRecord {
  return {
    id: `audit-${reasoning.id}`,
    summary: decisionSummary,
    owner: "Governance Core",
    trace: [
      `Reasoning source: ${reasoning.id}`,
      `Selected option: ${reasoning.selectedOption.title}`,
      `Confidence: ${reasoning.confidenceScore}`,
      `Required approvals: ${approvalRequirements.join(", ")}`,
    ],
  };
}
