/*
 * offline-execution/types.ts — End-to-End Offline Execution Pipeline.
 *
 * Proves the whole Hebun AI execution chain works from plan to simulated
 * provider result WITHOUT any live provider:
 *   Planning → Orchestration → Execution → Routing → Invocation →
 *   Runtime Boundary → Simulated Result → Audit.
 *
 * Deterministic, explainable, auditable, offline. No live execution, no
 * provider APIs, no SDKs, no credentials, no env, no secrets, no network, no
 * shell, no file/repo mutation, no LLM. Future Live stays blocked. All upstream
 * data is referenced from existing engines — never duplicated.
 */

import type { BadgeVariant } from "@/components/ui/badge";
import type { MatrixCapability, ProviderId } from "@/features/provider-matrix";
import type { ProviderTypeKind } from "@/features/provider-framework";
import type { RoutingDecision, RoutingExecutionRequest } from "@/features/provider-routing";
import type { Invocation } from "@/features/provider-invocation";
import type { RuntimeDecision, RuntimeMode } from "@/features/runtime-boundary";

/* ── Simulated provider result ─────────────────────────── */

export type SimulatedResultStatus = "simulated" | "held" | "blocked";

export interface SimulatedArtifact {
  kind: string;
  label: string;
}

export interface SimulatedProviderResult {
  id: string;
  taskId: string;
  providerId: ProviderId | null;
  providerType: ProviderTypeKind | null;
  status: SimulatedResultStatus;
  summary: string;
  output: string;
  artifacts: SimulatedArtifact[];
  warnings: string[];
  errors: string[];
  events: string[];
  telemetry: TaskTelemetry;
  confidence: number;
  createdAt: string;
}

/* ── Per-task run (full traceability) ──────────────────── */

export interface TaskTelemetry {
  routed: boolean;
  invoked: boolean;
  runtimeEvaluated: boolean;
  simulationEnforced: boolean;
  gatesPassed: number;
  gatesEvaluated: number;
}

export interface OfflineTaskRun {
  taskId: string;
  taskTitle: string;
  taskType: string;
  capability: MatrixCapability;
  request: RoutingExecutionRequest;
  routing: RoutingDecision;
  invocation: Invocation;
  runtime: RuntimeDecision;
  result: SimulatedProviderResult;
  traceable: boolean;
  simulationEnforced: boolean;
  runtimeMode: RuntimeMode;
  confidence: number;
}

/* ── Audit + events ────────────────────────────────────── */

export interface OfflineAuditRecord {
  stage:
    | "planning-input"
    | "orchestration-input"
    | "execution-request"
    | "provider-routing"
    | "provider-invocation"
    | "runtime-decision"
    | "simulation-enforcement"
    | "simulated-result"
    | "final-report";
  detail: string;
}

export type OfflineEventType =
  | "Session Created"
  | "Task Selected"
  | "Provider Routed"
  | "Invocation Built"
  | "Runtime Evaluated"
  | "Simulation Enforced"
  | "Result Produced"
  | "Session Completed"
  | "Session Blocked";

export interface OfflineEvent {
  type: OfflineEventType;
  label: string;
  at: string;
  note: string;
}

/* ── Session ───────────────────────────────────────────── */

export type OfflineSessionStatus = "completed" | "partial" | "blocked";

export interface OfflineTelemetry {
  taskCount: number;
  routedCount: number;
  invokedCount: number;
  runtimeEvaluatedCount: number;
  simulatedResultCount: number;
  simulationEnforcedCount: number;
  traceableCount: number;
  averageGatesPassed: number;
}

export interface OfflineExecutionSession {
  id: string;
  planId: string;
  orchestrationId: string;
  status: OfflineSessionStatus;
  tasks: OfflineTaskRun[];
  providerRoutes: RoutingDecision[];
  invocations: Invocation[];
  runtimeDecisions: RuntimeDecision[];
  simulatedResults: SimulatedProviderResult[];
  auditTrail: OfflineAuditRecord[];
  events: OfflineEvent[];
  telemetry: OfflineTelemetry;
  confidence: number;
  riskLevel: "low" | "medium" | "high";
  traceabilityScore: number;
  startedAt: string;
  completedAt: string;
  statusBadge: BadgeVariant;
  riskBadge: BadgeVariant;
}

/* ── Validation ────────────────────────────────────────── */

export interface OfflineValidation {
  sessionId: string;
  valid: boolean;
  issues: string[];
}

/* ── Report ────────────────────────────────────────────── */

export interface OfflineExecutionReport {
  sessionId: string;
  planId: string;
  orchestrationId: string;
  status: OfflineSessionStatus;
  taskCount: number;
  simulatedResults: number;
  traceabilityScore: number;
  auditCoverage: number;
  simulationEnforced: boolean;
  futureLiveBlocked: boolean;
  confidence: number;
  riskLevel: "low" | "medium" | "high";
  valid: boolean;
  explanation: string;
  badge: BadgeVariant;
}

/* ── Metrics ───────────────────────────────────────────── */

export interface OfflineExecutionMetrics {
  offlineSessions: number;
  simulatedResults: number;
  traceabilityScore: number;
  auditCoverage: number;
  simulationEnforcement: number;
  pipelineHealth: number;
  futureLiveBlocked: boolean;
  badge: BadgeVariant;
}
