/*
 * provider-routing/types.ts — Provider Routing Engine contracts.
 *
 * The routing engine sits between the Planning / Execution Engine and the
 * Provider Framework. It selects the most appropriate provider(s) for every
 * execution request and explains why. Everything is deterministic, explainable
 * and offline: no real execution, no API calls, no LLM calls, no runtime
 * provider invocation. All provider data derives from the Provider Capability
 * Matrix — nothing is duplicated here.
 */

import type { BadgeVariant } from "@/components/ui/badge";
import type {
  ExecutionModeKind,
  MatrixCapability,
  ProviderId,
} from "@/features/provider-matrix";

/* ── Strategies ────────────────────────────────────────── */

export type RoutingStrategy =
  | "Best Capability"
  | "Highest Confidence"
  | "Lowest Risk"
  | "Fastest Provider"
  | "Health First"
  | "Policy First"
  | "Approval First"
  | "Single Provider"
  | "Multi Provider"
  | "Human First"
  | "Simulation Only";

/* ── Fallback tiers ────────────────────────────────────── */

export type FallbackTier =
  | "Primary"
  | "Secondary"
  | "Emergency"
  | "Human Escalation"
  | "Simulation Fallback"
  | "No Provider Available";

/* ── Execution request (routing input) ─────────────────── */

export interface RoutingExecutionRequest {
  id: string;
  requestId: string;
  description: string;
  requiredCapabilities: MatrixCapability[];
  executionMode: ExecutionModeKind;
  constraints: string[];
  policyTags: string[];
  requiresApproval: boolean;
  strategy: RoutingStrategy;
}

/* ── Scored candidate ──────────────────────────────────── */

export interface ProviderCandidate {
  providerId: ProviderId;
  name: string;
  tier: FallbackTier;
  matchedCapabilities: MatrixCapability[];
  capabilityScore: number;
  healthScore: number;
  policyScore: number;
  confidence: number;
  latencyMs: number;
  reliability: number;
}

export interface RejectedProvider {
  providerId: ProviderId;
  name: string;
  stage: RoutingStage;
  reason: string;
}

/* ── Pipeline ──────────────────────────────────────────── */

export type RoutingStage =
  | "capability"
  | "health"
  | "constraint"
  | "policy"
  | "approval"
  | "ranking";

export interface RoutingStageResult {
  stage: RoutingStage;
  label: string;
  input: number;
  output: number;
  note: string;
}

/* ── Assessments ───────────────────────────────────────── */

export interface HealthAssessment {
  providerId: ProviderId;
  status: string;
  availability: number;
  latencyMs: number;
  reliability: number;
  simulationReady: boolean;
  healthy: boolean;
}

export interface ApprovalRequirement {
  required: boolean;
  reason: string;
  escalationTier: FallbackTier;
}

export interface PolicyConstraint {
  tag: string;
  satisfied: boolean;
  note: string;
}

/* ── Routing decision ──────────────────────────────────── */

export interface RoutingDecision {
  id: string;
  requestId: string;
  strategy: RoutingStrategy;
  primaryProvider: ProviderId | null;
  fallbackProviders: ProviderId[];
  candidateProviders: ProviderCandidate[];
  matchedCapabilities: MatrixCapability[];
  confidence: number;
  selectionReason: string;
  rejectedProviders: RejectedProvider[];
  healthAssessment: HealthAssessment[];
  approvalRequirement: ApprovalRequirement;
  policyConstraints: PolicyConstraint[];
  estimatedLatencyMs: number;
  estimatedReliability: number;
  simulationMode: boolean;
  blocked: boolean;
  explanation: string;
  stages: RoutingStageResult[];
  timestamp: string;
  confidenceBadge: BadgeVariant;
}

/* ── Report ────────────────────────────────────────────── */

export interface RoutingReport {
  decisionId: string;
  requestId: string;
  description: string;
  strategy: RoutingStrategy;
  whySelected: string;
  whyRejected: string[];
  capabilityScore: number;
  healthScore: number;
  policyScore: number;
  confidenceScore: number;
  fallbackChain: { tier: FallbackTier; providerId: ProviderId | null; name: string }[];
  riskLevel: "low" | "medium" | "high";
  riskBadge: BadgeVariant;
}

/* ── Metrics ───────────────────────────────────────────── */

export interface RoutingMetrics {
  totalRequests: number;
  routedRequests: number;
  blockedRequests: number;
  routingHealth: number;
  activeStrategies: number;
  primaryProviders: number;
  fallbackCoverage: number;
  averageConfidence: number;
  simulationCoverage: number;
  approvalGatedRequests: number;
  badge: BadgeVariant;
}
