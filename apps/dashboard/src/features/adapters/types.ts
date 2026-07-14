/*
 * adapters/types.ts — Execution Adapter SDK contracts.
 *
 * Provider-independent. The Execution Engine never knows how a provider works;
 * every provider implements this SDK. Deterministic by design. No external
 * services, no LLMs, no provider-specific logic — only the contract they
 * will implement in later phases (Claude Code, Codex, Browser, LLM Gateway).
 */

import type { BadgeVariant } from "@/components/ui/badge";
import type { AdapterError } from "@/features/adapters/adapter-errors";

/*
 * SDK contract version. Bumped only on breaking changes. Additive, optional
 * fields do NOT bump this — that is the whole point of the hardening pass.
 */
export const SDK_CONTRACT_VERSION = "1.1.0";

/* ── Lifecycle ─────────────────────────────────────────── */

export type AdapterLifecycleStage =
  | "Registered"
  | "Loaded"
  | "Initialized"
  | "Ready"
  | "Executing"
  | "Paused"
  | "Cancelled"
  | "Completed"
  | "Failed"
  | "Unloaded";

/* ── Health ────────────────────────────────────────────── */

export type AdapterHealthStatus =
  | "Healthy"
  | "Degraded"
  | "Unavailable"
  | "Maintenance"
  | "Unknown";

/* ── Capabilities ──────────────────────────────────────── */

export type AdapterCapabilityKind =
  | "File System"
  | "Terminal"
  | "Browser"
  | "Code Generation"
  | "Repository"
  | "Email"
  | "Messaging"
  | "Calendar"
  | "Search"
  | "Simulation"
  | "Human Approval";

export interface ExecutionCapability {
  id: string;
  kind: AdapterCapabilityKind;
  label: string;
  description: string;
  deterministic: boolean;
}

/* ── Events ────────────────────────────────────────────── */

export type AdapterEventType =
  | "Adapter Registered"
  | "Adapter Loaded"
  | "Adapter Initialized"
  | "Adapter Ready"
  | "Execution Started"
  | "Execution Progress"
  | "Execution Completed"
  | "Execution Failed"
  | "Retry"
  | "Rollback"
  | "Execution Cancelled"
  | "Shutdown"
  | "Health Changed"
  | "Configuration Updated"
  | "Telemetry Updated";

export interface AdapterEvent {
  id: string;
  type: AdapterEventType;
  adapterId: string;
  timestamp: string;
  summary: string;
}

/* ── Core contract interfaces ──────────────────────────── */

export interface AdapterMetadata {
  id: string;
  name: string;
  version: string;
  vendor: string;
  description: string;
  category: string;
  deterministic: boolean;
  simulation: boolean;
}

export type ExecutionEnvironmentMode = "simulation" | "sandbox" | "live";

export interface ExecutionEnvironment {
  id: string;
  mode: ExecutionEnvironmentMode;
  deterministic: boolean;
  isolated: boolean;
  note: string;
}

export interface AdapterContext {
  sessionId: string;
  environment: ExecutionEnvironment;
  capabilities: AdapterCapabilityKind[];
  requestedBy: string;
  deterministic: boolean;
}

export interface ExecutionRequest {
  id: string;
  capability: AdapterCapabilityKind;
  action: string;
  payloadSummary: string;
  dryRun: boolean;
  deterministic: boolean;
}

export interface ExecutionResponse {
  accepted: boolean;
  reason: string;
  estimatedSteps: number;
}

export type ExecutionOutcome = "succeeded" | "failed" | "cancelled" | "simulated";

export interface ExecutionArtifact {
  id: string;
  kind: string;
  label: string;
  ref: string;
}

export interface ExecutionResult {
  id: string;
  requestId: string;
  adapterId: string;
  outcome: ExecutionOutcome;
  outputSummary: string;
  steps: number;
  durationMs: number;
  deterministic: boolean;
  /* ── hardened, version-safe optional fields (Phase 32) ── */
  status?: ExecutionOutcome;
  startedAt?: string;
  finishedAt?: string;
  exitReason?: string;
  warnings?: string[];
  errors?: AdapterError[];
  events?: AdapterEvent[];
  telemetry?: ExecutionTelemetry;
  metrics?: ExecutionResultMetrics;
  rollbackAvailable?: boolean;
  retryAvailable?: boolean;
  humanInterventionRequired?: boolean;
  artifacts?: ExecutionArtifact[];
  logs?: string[];
}

export interface ExecutionResultMetrics {
  steps: number;
  durationMs: number;
  queueTimeMs: number;
  retryCount: number;
  rollbackCount: number;
}

export interface ExecutionHealth {
  status: AdapterHealthStatus;
  since: string;
  latencyMs: number;
  successRate: number;
  note: string;
  /* ── hardened optional fields (Phase 32) ── */
  availability?: number;
  reliability?: number;
  errorRate?: number;
  resourceUsage?: number;
  lastSuccessfulExecution?: string;
  lastFailedExecution?: string;
}

export interface ExecutionTelemetry {
  executions: number;
  succeeded: number;
  failed: number;
  cancelled: number;
  averageDurationMs: number;
  lastUpdated: string;
  /* ── hardened optional fields (Phase 32) ── */
  successRate?: number;
  failureRate?: number;
  peakDurationMs?: number;
  queueTimeMs?: number;
  retryCount?: number;
  rollbackCount?: number;
  cancelCount?: number;
}

export interface ExecutionSession {
  id: string;
  adapterId: string;
  stage: AdapterLifecycleStage;
  startedAt: string;
  request: ExecutionRequest;
  result?: ExecutionResult;
  events: AdapterEvent[];
}

export interface AdapterValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

/*
 * ExecutionAdapter — the contract every provider implements.
 * Methods are deterministic in the SDK/simulation; real providers wire them
 * to their systems in later phases. The Execution Engine only sees this shape.
 */
export interface ExecutionAdapter {
  metadata: AdapterMetadata;
  capabilities: ExecutionCapability[];

  supports(capability: AdapterCapabilityKind): boolean;
  initialize(context: AdapterContext): AdapterLifecycleStage;
  validate(request: ExecutionRequest): AdapterValidationResult;
  prepare(request: ExecutionRequest): ExecutionResponse;
  execute(request: ExecutionRequest, context: AdapterContext): ExecutionResult;
  pause(): AdapterLifecycleStage;
  resume(): AdapterLifecycleStage;
  cancel(): AdapterLifecycleStage;
  rollback(): AdapterLifecycleStage;
  shutdown(): AdapterLifecycleStage;
  health(): ExecutionHealth;
  telemetry(): ExecutionTelemetry;
}

/* ── Registry record (UI + discovery) ──────────────────── */

export interface AdapterRecord {
  metadata: AdapterMetadata;
  capabilities: ExecutionCapability[];
  lifecycle: AdapterLifecycleStage;
  health: ExecutionHealth;
  telemetry: ExecutionTelemetry;
  registeredAt: string;
}

export interface AdapterMetrics {
  registered: number;
  healthy: number;
  degraded: number;
  unavailable: number;
  simulationReady: boolean;
  capabilitiesCovered: number;
  capabilitiesTotal: number;
  totalExecutions: number;
  successRate: number;
  healthBadge: BadgeVariant;
}
