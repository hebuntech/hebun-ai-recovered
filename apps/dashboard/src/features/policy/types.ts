import type { BadgeVariant } from "@/components/ui/badge";
import type { GovernancePriority } from "@/features/governance/types";
import type { ReasoningResult } from "@/features/reasoning";
import type { RegistryKey } from "@/features/registries/types";
import type { RelatedReferenceIds } from "@/features/shared";

export type PolicyCategory =
  | "business"
  | "security"
  | "compliance"
  | "financial"
  | "hr"
  | "it"
  | "ai"
  | "workflow"
  | "approval"
  | "data-access"
  | "risk";

export type GovernanceDecisionStatus =
  | "allow"
  | "allow-with-review"
  | "blocked"
  | "approval-required";

export type ApprovalMode =
  | "none"
  | "manager"
  | "director"
  | "executive"
  | "multi-stage"
  | "human-review"
  | "emergency-override";

export type PolicyCheckStatus = "pass" | "watch" | "fail";

export interface PolicyRule {
  id: string;
  name: string;
  category: PolicyCategory;
  owner: string;
  description: string;
  appliesTo: RegistryKey[];
  minComplianceScore: number;
  triggerRiskLevel?: ReasoningResult["riskLevel"];
  approvalMode: ApprovalMode;
  reviewRequired: boolean;
}

export interface PolicyResult {
  policyId: string;
  policyName: string;
  category: PolicyCategory;
  status: PolicyCheckStatus;
  detail: string;
}

export interface PermissionResult {
  role: "CEO" | "Director" | "Manager" | "Employee" | "AI Agent" | "External System";
  status: PolicyCheckStatus;
  detail: string;
  allowedActions: string[];
  blockedActions: string[];
}

export interface ComplianceResult {
  framework: "GDPR" | "KVKK" | "ISO 27001" | "SOC 2" | "Internal Company Policies";
  status: PolicyCheckStatus;
  score: number;
  detail: string;
}

export interface PolicyRiskAssessment {
  level: GovernancePriority;
  detail: string;
  drivers: string[];
}

export interface ApprovalRequirement {
  mode: ApprovalMode;
  detail: string;
  owner: string;
}

export interface PolicyAuditRecord {
  id: string;
  summary: string;
  trace: string[];
  owner: string;
}

export interface GovernanceDecision {
  status: GovernanceDecisionStatus;
  summary: string;
  rationale: string;
}

export interface GovernanceExplanation {
  summary: string;
  policyTrace: string[];
  permissionTrace: string[];
  complianceTrace: string[];
  approvalTrace: string[];
}

export interface GovernanceResult extends RelatedReferenceIds {
  id: string;
  reasoningId: string;
  policyResults: PolicyResult[];
  permissionResults: PermissionResult[];
  complianceResults: ComplianceResult[];
  riskAssessment: PolicyRiskAssessment;
  approvalRequirements: ApprovalRequirement[];
  governanceDecision: GovernanceDecision;
  allowedActions: string[];
  blockedActions: string[];
  requiredApprovals: string[];
  auditRecord: PolicyAuditRecord;
  confidence: number;
  explanation: GovernanceExplanation;
  timestamp: string;
  reasoning: ReasoningResult;
}

export interface GovernancePipelineStep {
  id: string;
  label: string;
  description: string;
}

export interface PolicyMetrics {
  policyHealth: number;
  complianceScore: number;
  openApprovals: number;
  blockedDecisions: number;
  highRiskDecisions: number;
  auditStatus: string;
  latestDecision: string;
  averageConfidence: number;
  healthBadge: BadgeVariant;
}
