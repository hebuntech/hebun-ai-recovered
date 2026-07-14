import type { BadgeVariant } from "@/components/ui/badge";
import type { ProviderId } from "@/features/provider-matrix";
import type { ProviderTypeKind } from "@/features/provider-framework";
import type { CredentialState, RiskLevel, RuntimeDecision } from "@/features/runtime-boundary";

export type ActivationLevel =
  | "Simulation"
  | "Dry Run"
  | "Read Only"
  | "Ready For Live"
  | "Live Enabled"
  | "Blocked"
  | "Emergency Disabled";

export type ActivationGateKind =
  | "Credential Gate"
  | "Environment Gate"
  | "Approval Gate"
  | "Policy Gate"
  | "Risk Gate"
  | "Readiness Gate"
  | "Simulation Gate"
  | "Emergency Gate";

export type ActivationEnvironmentDescriptor =
  | "Development"
  | "Staging"
  | "Production"
  | "Simulation"
  | "Offline";

export type ActivationApprovalStatus = "Not Required" | "Pending" | "Approved";

export type ActivationPolicyStatus = "Allowed" | "Restricted" | "Blocked";

export interface ActivationContext {
  runtimeDecisionId: string;
  requestId: string;
  providerId: ProviderId | null;
  providerType: ProviderTypeKind | null;
  sourceMode: RuntimeDecision["sourceMode"];
  runtimeMode: RuntimeDecision["runtimeMode"];
  confidence: number;
  simulationFallback: boolean;
}

export interface ActivationEnvironment {
  status: ActivationEnvironmentDescriptor;
  ready: boolean;
  note: string;
}

export interface ActivationCredentialAssessment {
  status: CredentialState;
  required: boolean;
  liveEligible: boolean;
  note: string;
}

export interface ActivationPolicyAssessment {
  status: ActivationPolicyStatus;
  allowsLive: boolean;
  note: string;
}

export interface ActivationApprovalAssessment {
  status: ActivationApprovalStatus;
  required: boolean;
  approved: boolean;
  note: string;
}

export interface ActivationRiskAssessment {
  level: RiskLevel;
  score: number;
  blocked: boolean;
  note: string;
}

export interface ActivationReadinessCheck {
  label: string;
  ready: boolean;
  score: number;
  note: string;
}

export interface ActivationReadinessAssessment {
  checks: ActivationReadinessCheck[];
  score: number;
  ready: boolean;
  summary: string;
}

export interface ActivationGateResult {
  gate: ActivationGateKind;
  passed: boolean;
  blocking: boolean;
  reason: string;
}

export interface ActivationAuditRecord {
  subject:
    | "activation-decision"
    | "runtime-decision"
    | "environment"
    | "credentials"
    | "policy"
    | "approval"
    | "risk"
    | "readiness"
    | "gates";
  detail: string;
}

export type ActivationEventType =
  | "Activation Requested"
  | "Activation Context Resolved"
  | "Activation Gate Passed"
  | "Activation Gate Failed"
  | "Activation Blocked"
  | "Activation Ready"
  | "Simulation Fallback"
  | "Activation Report Generated";

export interface ActivationEvent {
  type: ActivationEventType;
  label: string;
  at: string;
  note: string;
}

export interface ActivationTelemetry {
  gateCount: number;
  passedGates: number;
  failedGates: number;
  readinessScore: number;
  riskScore: number;
  liveEligible: boolean;
  simulationFallback: boolean;
}

export interface ActivationReport {
  decisionId: string;
  runtimeDecisionId: string;
  providerId: ProviderId | null;
  providerType: ProviderTypeKind | null;
  activationLevel: ActivationLevel;
  allowed: boolean;
  blocked: boolean;
  blockReasons: string[];
  readinessScore: number;
  riskLevel: RiskLevel;
  credentialStatus: CredentialState;
  approvalStatus: ActivationApprovalStatus;
  policyStatus: ActivationPolicyStatus;
  environmentStatus: ActivationEnvironmentDescriptor;
  summary: string;
  badge: BadgeVariant;
}

export interface ActivationDecision {
  id: string;
  runtimeDecisionId: string;
  providerId: ProviderId | null;
  providerType: ProviderTypeKind | null;
  activationLevel: ActivationLevel;
  allowed: boolean;
  blocked: boolean;
  blockReasons: string[];
  credentialStatus: CredentialState;
  approvalStatus: ActivationApprovalStatus;
  policyStatus: ActivationPolicyStatus;
  riskLevel: RiskLevel;
  environmentStatus: ActivationEnvironmentDescriptor;
  readinessScore: number;
  simulationFallback: boolean;
  audit: ActivationAuditRecord[];
  telemetry: ActivationTelemetry;
  events: ActivationEvent[];
  report: ActivationReport;
  timestamp: string;
  context: ActivationContext;
  environment: ActivationEnvironment;
  credentials: ActivationCredentialAssessment;
  policy: ActivationPolicyAssessment;
  approval: ActivationApprovalAssessment;
  risk: ActivationRiskAssessment;
  readiness: ActivationReadinessAssessment;
  gates: ActivationGateResult[];
  explanation: string;
  badge: BadgeVariant;
}

export interface ActivationMetrics {
  totalDecisions: number;
  activationHealth: number;
  simulationCount: number;
  liveReadyCount: number;
  blockedCount: number;
  approvalPendingCount: number;
  averageReadiness: number;
  badge: BadgeVariant;
}
