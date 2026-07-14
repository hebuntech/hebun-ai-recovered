/*
 * provider-invocation/types.ts — Provider Invocation Contract.
 *
 * Routing decides WHICH provider is used. The invocation contract defines HOW
 * every provider is invoked. This is the universal invocation model that every
 * provider (Claude, Codex, GitHub, Browser, Computer Use, Communication and
 * future providers) must eventually implement.
 *
 * Deterministic and offline: no real provider execution, no API calls, no SDKs,
 * no credentials, no network, no runtime invocation, no LLM execution. All
 * upstream data is referenced from the Routing Engine and Provider Matrix — not
 * duplicated.
 */

import type { BadgeVariant } from "@/components/ui/badge";
import type { RetryPolicy } from "@/features/adapters";
import type { MatrixCapability, ProviderId } from "@/features/provider-matrix";
import type { ProviderTypeKind } from "@/features/provider-framework";

/* ── Execution modes ───────────────────────────────────── */

export type InvocationExecutionMode =
  | "Simulation"
  | "Dry Run"
  | "Read Only"
  | "Planning"
  | "Approval Required"
  | "Future Live";

/* ── Lifecycle ─────────────────────────────────────────── */

export type InvocationLifecycleState =
  | "Created"
  | "Validated"
  | "Prepared"
  | "Ready"
  | "Invoking"
  | "Completed"
  | "Cancelled"
  | "Timed Out"
  | "Rolled Back"
  | "Failed"
  | "Disposed";

export interface LifecycleTransition {
  from: InvocationLifecycleState;
  to: InvocationLifecycleState[];
}

/* ── Events ────────────────────────────────────────────── */

export type InvocationEventType =
  | "Invocation Created"
  | "Validated"
  | "Prepared"
  | "Started"
  | "Completed"
  | "Failed"
  | "Cancelled"
  | "Retry Scheduled"
  | "Timeout"
  | "Rollback"
  | "Disposed";

export interface InvocationEvent {
  type: InvocationEventType;
  label: string;
  at: string;
  note: string;
}

/* ── Artifacts (contracts only, no real files) ─────────── */

export type InvocationArtifactKind =
  | "Text"
  | "Structured Output"
  | "Plan"
  | "Patch"
  | "Report"
  | "Diff"
  | "Metrics"
  | "Logs"
  | "Evidence"
  | "Attachments";

export interface InvocationArtifact {
  kind: InvocationArtifactKind;
  label: string;
  description: string;
  deterministic: boolean;
}

/* ── Request / response ────────────────────────────────── */

export interface InvocationRequest {
  id: string;
  providerId: ProviderId | null;
  capabilities: MatrixCapability[];
  executionMode: InvocationExecutionMode;
  payloadSummary: string;
  constraints: string[];
  metadata: Record<string, string>;
}

export type ExpectedResponseStatus = "simulated" | "planned" | "blocked";

export interface InvocationResponse {
  requestId: string;
  status: ExpectedResponseStatus;
  summary: string;
  artifactKinds: InvocationArtifactKind[];
  finishReason: string;
  warnings: string[];
}

/* ── Context ───────────────────────────────────────────── */

export interface InvocationContext {
  invocationId: string;
  requestId: string;
  routingDecisionId: string;
  providerId: ProviderId | null;
  providerType: ProviderTypeKind | null;
  executionMode: InvocationExecutionMode;
  simulation: boolean;
  confidence: number;
}

/* ── Policies ──────────────────────────────────────────── */

export interface TimeoutPolicy {
  timeoutMs: number;
  hardCapMs: number;
  mode: InvocationExecutionMode;
}

export interface RollbackPolicy {
  enabled: boolean;
  strategy: "none" | "compensating" | "checkpoint";
  note: string;
}

export interface CancellationPolicy {
  cancellable: boolean;
  cooperative: boolean;
  note: string;
}

/* ── Telemetry ─────────────────────────────────────────── */

export interface InvocationTelemetry {
  prepared: number;
  simulated: number;
  retriesConfigured: number;
  timeoutMs: number;
  rollbackEnabled: boolean;
  estimatedLatencyMs: number;
  estimatedReliability: number;
}

/* ── Audit ─────────────────────────────────────────────── */

export interface InvocationAuditRecord {
  subject:
    | "request"
    | "provider"
    | "routing-decision"
    | "execution-mode"
    | "retry"
    | "timeout"
    | "rollback"
    | "telemetry"
    | "artifacts";
  detail: string;
}

/* ── Invocation ────────────────────────────────────────── */

export interface Invocation {
  id: string;
  requestId: string;
  routingDecisionId: string;
  providerId: ProviderId | null;
  providerType: ProviderTypeKind | null;
  executionMode: InvocationExecutionMode;
  status: InvocationLifecycleState;
  context: InvocationContext;
  request: InvocationRequest;
  expectedResponse: InvocationResponse;
  artifacts: InvocationArtifact[];
  telemetry: InvocationTelemetry;
  events: InvocationEvent[];
  audit: InvocationAuditRecord[];
  retryPolicy: RetryPolicy;
  timeoutPolicy: TimeoutPolicy;
  rollbackPolicy: RollbackPolicy;
  cancellationPolicy: CancellationPolicy;
  confidence: number;
  simulation: boolean;
  explanation: string;
  createdAt: string;
  statusBadge: BadgeVariant;
}

/* ── Validation ────────────────────────────────────────── */

export interface InvocationValidation {
  invocationId: string;
  valid: boolean;
  issues: string[];
}

/* ── Report ────────────────────────────────────────────── */

export interface InvocationReport {
  invocationId: string;
  requestId: string;
  providerId: ProviderId | null;
  executionMode: InvocationExecutionMode;
  status: InvocationLifecycleState;
  simulation: boolean;
  retries: number;
  timeoutMs: number;
  rollback: boolean;
  cancellable: boolean;
  artifactCount: number;
  auditCount: number;
  explanation: string;
  valid: boolean;
  badge: BadgeVariant;
}

/* ── Metrics ───────────────────────────────────────────── */

export interface InvocationMetrics {
  totalInvocations: number;
  preparedInvocations: number;
  simulationInvocations: number;
  failedInvocations: number;
  retryCoverage: number;
  timeoutCoverage: number;
  auditCoverage: number;
  invocationHealth: number;
  badge: BadgeVariant;
}
