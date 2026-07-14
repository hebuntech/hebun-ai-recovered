import { buildAuditRecord } from "@/features/policy/audit-engine";
import { determineApprovals } from "@/features/policy/approval-engine";
import { evaluateCompliance } from "@/features/policy/compliance-engine";
import { validateGovernanceConstraints } from "@/features/policy/constraint-engine";
import { generateGovernanceDecision } from "@/features/policy/decision-engine";
import { evaluatePermissions } from "@/features/policy/permission-engine";
import { evaluatePolicies } from "@/features/policy/policy-evaluator";
import { evaluateOrganizationalRisk } from "@/features/policy/risk-engine";
import { reasoningInputsForGovernance } from "@/features/policy/policy-engine";
import type { GovernancePipelineStep, GovernanceResult } from "@/features/policy/types";
import type { ReasoningResult } from "@/features/reasoning";

export const governancePipelineSteps: GovernancePipelineStep[] = [
  { id: "receive-reasoning", label: "Receive Reasoning Result", description: "Use deterministic reasoning output as the governance input." },
  { id: "load-policies", label: "Load Applicable Policies", description: "Map active governance policies to the reasoning context." },
  { id: "validate-constraints", label: "Validate Constraints", description: "Check governance and reasoning constraints together." },
  { id: "validate-permissions", label: "Validate Permissions", description: "Confirm actor and role-based authorization." },
  { id: "evaluate-compliance", label: "Evaluate Compliance", description: "Score the decision against deterministic compliance rules." },
  { id: "evaluate-risk", label: "Evaluate Organizational Risk", description: "Translate reasoning and governance risk into a policy posture." },
  { id: "determine-approvals", label: "Determine Required Approvals", description: "Compute the required approval path." },
  { id: "decision", label: "Generate Governance Decision", description: "Allow, block, or route to approval." },
  { id: "audit", label: "Produce Audit Record", description: "Create a persistent audit trail." },
  { id: "explanation", label: "Build Human-readable Explanation", description: "Preserve an explainable governance trace." },
];

function governanceConfidence(
  policyResults: GovernanceResult["policyResults"],
  permissionResults: GovernanceResult["permissionResults"],
  complianceResults: GovernanceResult["complianceResults"],
  reasoning: ReasoningResult
) {
  const failCount =
    policyResults.filter((item) => item.status === "fail").length +
    permissionResults.filter((item) => item.status === "fail").length +
    complianceResults.filter((item) => item.status === "fail").length;
  const watchCount =
    policyResults.filter((item) => item.status === "watch").length +
    permissionResults.filter((item) => item.status === "watch").length +
    complianceResults.filter((item) => item.status === "watch").length;

  return Math.round(
    Math.max(56, Math.min(97, reasoning.confidenceScore - failCount * 10 - watchCount * 4 + 6))
  );
}

export function runGovernancePipeline(reasoning: ReasoningResult): GovernanceResult {
  const policyResults = evaluatePolicies(reasoning);
  const constraintResult = validateGovernanceConstraints(reasoning, policyResults);
  const permissionResults = evaluatePermissions(reasoning);
  const complianceResults = evaluateCompliance();
  const riskAssessment = evaluateOrganizationalRisk(reasoning);
  const approvalRequirements = determineApprovals(reasoning);
  const decisionBundle = generateGovernanceDecision(
    reasoning,
    policyResults,
    permissionResults,
    complianceResults,
    riskAssessment,
    approvalRequirements
  );
  const auditRecord = buildAuditRecord(
    reasoning,
    decisionBundle.governanceDecision.summary,
    decisionBundle.requiredApprovals
  );
  const confidence = governanceConfidence(
    policyResults,
    permissionResults,
    complianceResults,
    reasoning
  );

  return {
    id: `gov-${reasoning.id}`,
    reasoningId: reasoning.id,
    policyResults,
    permissionResults,
    complianceResults,
    riskAssessment,
    approvalRequirements,
    governanceDecision: decisionBundle.governanceDecision,
    allowedActions: decisionBundle.allowedActions,
    blockedActions:
      constraintResult.status === "fail"
        ? Array.from(new Set([...decisionBundle.blockedActions, ...reasoning.selectedOption.actions]))
        : decisionBundle.blockedActions,
    requiredApprovals: decisionBundle.requiredApprovals,
    auditRecord,
    confidence,
    explanation: {
      summary: `${decisionBundle.governanceDecision.summary} ${decisionBundle.governanceDecision.rationale}`,
      policyTrace: policyResults.map(
        (result) => `${result.policyName}: ${result.status} (${result.detail})`
      ),
      permissionTrace: permissionResults.map(
        (result) => `${result.role}: ${result.status} (${result.detail})`
      ),
      complianceTrace: complianceResults.map(
        (result) => `${result.framework}: ${result.status} (${result.score})`
      ),
      approvalTrace: approvalRequirements.map(
        (result) => `${result.mode}: ${result.detail}`
      ),
    },
    relatedRegistryIds: reasoning.relatedRegistryIds,
    relatedGraphNodeIds: reasoning.relatedGraphNodeIds,
    relatedMemoryIds: reasoning.relatedMemoryIds,
    timestamp: reasoning.timestamp,
    reasoning,
  };
}

export const governanceResults = reasoningInputsForGovernance.map(runGovernancePipeline);
