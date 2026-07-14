/*
 * runtime-boundary/types.ts — Live Provider Runtime Boundary contracts.
 *
 * This is the FINAL safety boundary before real provider execution. It does not
 * execute providers. It decides whether an invocation is allowed to cross from
 * the deterministic (offline) world into a future live runtime. In this phase
 * nothing ever crosses: live runtime is disabled. Deterministic, explainable,
 * auditable and offline — no execution, no APIs, no SDKs, no credentials, no env
 * access, no secret managers, no network, no LLM. Upstream data is referenced
 * from the Invocation / Routing / Matrix layers, never duplicated.
 */

import type { BadgeVariant } from "@/components/ui/badge";
import type { ProviderId } from "@/features/provider-matrix";
import type { ProviderTypeKind } from "@/features/provider-framework";
import type { InvocationExecutionMode } from "@/features/provider-invocation";

/* ── Runtime modes ─────────────────────────────────────── */

export type RuntimeMode =
  | "Simulation"
  | "Dry Run"
  | "Read Only"
  | "Approval Required"
  | "Future Live"
  | "Blocked"
  | "Emergency Stop";

/* ── Runtime state ─────────────────────────────────────── */

export type RuntimeState =
  | "Created"
  | "Ready"
  | "Gated"
  | "Approval Pending"
  | "Promotable"
  | "Blocked"
  | "Emergency Stopped";

/* ── Gates ─────────────────────────────────────────────── */

export type RuntimeGateKind =
  | "Credential Gate"
  | "Environment Gate"
  | "Policy Gate"
  | "Approval Gate"
  | "Health Gate"
  | "Provider Gate"
  | "Simulation Gate"
  | "Promotion Gate"
  | "Emergency Stop Gate";

export interface RuntimeGateResult {
  gate: RuntimeGateKind;
  passed: boolean;
  reason: string;
  blocking: boolean;
}

/* ── Credentials (placeholders only) ───────────────────── */

export type CredentialState =
  | "Not Required"
  | "Missing"
  | "Placeholder"
  | "Injected"
  | "Invalid"
  | "Expired";

export interface CredentialAssessment {
  state: CredentialState;
  required: boolean;
  note: string;
}

/* ── Readiness ─────────────────────────────────────────── */

export interface ReadinessCheck {
  label: string;
  ready: boolean;
  note: string;
}

export interface ReadinessAssessment {
  checks: ReadinessCheck[];
  ready: boolean;
  score: number;
}

/* ── Environment ───────────────────────────────────────── */

export interface EnvironmentAssessment {
  offline: boolean;
  networkDisabled: boolean;
  secretsDisabled: boolean;
  ready: boolean;
  note: string;
}

/* ── Health ────────────────────────────────────────────── */

export interface RuntimeHealthAssessment {
  availability: number;
  latencyMs: number;
  reliability: number;
  simulationCoverage: number;
  providerReadiness: number;
  runtimeReadiness: number;
  score: number;
  healthy: boolean;
}

/* ── Promotion ─────────────────────────────────────────── */

export type PromotionStage = "Simulation" | "Dry Run" | "Read Only" | "Future Live" | "Blocked";

export interface PromotionStep {
  from: PromotionStage;
  to: PromotionStage;
  eligible: boolean;
  reason: string;
}

export interface PromotionAssessment {
  currentStage: PromotionStage;
  nextStage: PromotionStage | null;
  eligible: boolean;
  path: PromotionStep[];
  reason: string;
}

/* ── Approval + policy ─────────────────────────────────── */

export interface ApprovalAssessment {
  required: boolean;
  reason: string;
}

export interface PolicyAssessment {
  status: "allowed" | "restricted" | "blocked";
  note: string;
}

/* ── Audit + events + telemetry ────────────────────────── */

export interface RuntimeAuditRecord {
  subject:
    | "runtime-decision"
    | "gates"
    | "promotion"
    | "credentials"
    | "policy"
    | "approval"
    | "environment"
    | "health";
  detail: string;
}

export type RuntimeEventType =
  | "Runtime Created"
  | "Runtime Ready"
  | "Gate Passed"
  | "Gate Failed"
  | "Promotion Approved"
  | "Promotion Blocked"
  | "Approval Required"
  | "Emergency Stop"
  | "Runtime Blocked"
  | "Runtime Completed";

export interface RuntimeEvent {
  type: RuntimeEventType;
  label: string;
  at: string;
  note: string;
}

export interface RuntimeTelemetry {
  gatesEvaluated: number;
  gatesPassed: number;
  gatesFailed: number;
  simulation: boolean;
  promotionEligible: boolean;
  blocked: boolean;
}

/* ── Runtime decision ──────────────────────────────────── */

export type RiskLevel = "low" | "medium" | "high";

export interface RuntimeDecision {
  id: string;
  invocationId: string;
  requestId: string;
  providerId: ProviderId | null;
  providerType: ProviderTypeKind | null;
  sourceMode: InvocationExecutionMode;
  runtimeMode: RuntimeMode;
  runtimeState: RuntimeState;
  allowed: boolean;
  blocked: boolean;
  blockReasons: string[];
  approvalRequired: boolean;
  credential: CredentialAssessment;
  readiness: ReadinessAssessment;
  environment: EnvironmentAssessment;
  runtimeHealth: RuntimeHealthAssessment;
  promotion: PromotionAssessment;
  policy: PolicyAssessment;
  approval: ApprovalAssessment;
  gates: RuntimeGateResult[];
  confidence: number;
  riskLevel: RiskLevel;
  simulationFallback: boolean;
  audit: RuntimeAuditRecord[];
  telemetry: RuntimeTelemetry;
  events: RuntimeEvent[];
  explanation: string;
  createdAt: string;
  modeBadge: BadgeVariant;
  riskBadge: BadgeVariant;
}

/* ── Validation ────────────────────────────────────────── */

export interface RuntimeValidation {
  decisionId: string;
  valid: boolean;
  issues: string[];
}

/* ── Report ────────────────────────────────────────────── */

export interface RuntimeReport {
  decisionId: string;
  invocationId: string;
  providerId: ProviderId | null;
  runtimeMode: RuntimeMode;
  runtimeState: RuntimeState;
  allowed: boolean;
  blocked: boolean;
  blockReasons: string[];
  promotionEligible: boolean;
  credentialState: CredentialState;
  healthScore: number;
  readinessScore: number;
  riskLevel: RiskLevel;
  explanation: string;
  valid: boolean;
  badge: BadgeVariant;
}

/* ── Metrics ───────────────────────────────────────────── */

export interface RuntimeMetrics {
  totalDecisions: number;
  runtimeHealth: number;
  simulationCoverage: number;
  promotionReadiness: number;
  blockedInvocations: number;
  approvalQueue: number;
  credentialPlaceholders: number;
  liveCrossings: number;
  badge: BadgeVariant;
}
