import type { BadgeVariant } from "@/components/ui/badge";
import type { ProviderId } from "@/features/provider-matrix";
import type { ProviderTypeKind } from "@/features/provider-framework";
import type { CredentialState } from "@/features/runtime-boundary";
import type { ActivationLevel } from "@/features/runtime-activation";

export const CLAUDE_LIVE_CAPABILITY = "summarization";

export type ClaudeLiveCapability = typeof CLAUDE_LIVE_CAPABILITY;

export type ClaudeLiveMode =
  | "Simulation"
  | "Dry Run"
  | "Read Only"
  | "Live Eligible"
  | "Live Blocked";

export type ClaudeLiveStatus =
  | "dry-run"
  | "live-blocked"
  | "simulation-fallback-prepared";

export type ClaudeLiveErrorCode =
  | "validation"
  | "configuration"
  | "credential_missing"
  | "credential_invalid"
  | "permission"
  | "rate_limit"
  | "timeout"
  | "provider_unavailable"
  | "safety_block"
  | "live_blocked"
  | "unknown";

export interface ClaudeLiveReferenceChain {
  providerId: ProviderId;
  providerType: ProviderTypeKind;
  routingDecisionId: string | null;
  invocationId: string | null;
  runtimeDecisionId: string | null;
  activationDecisionId: string | null;
  requestId: string | null;
}

export interface ClaudeLiveRequest {
  id: string;
  capability: ClaudeLiveCapability;
  mode: ClaudeLiveMode;
  input: string;
  systemInstructions: string;
  constraints: string[];
  outputFormat: "text" | "json";
  maxTokens: number;
  temperature: number;
  metadata: Record<string, string>;
  activationDecisionId: string | null;
  invocationId: string | null;
  runtimeDecisionId: string | null;
}

export interface ClaudeLiveError {
  code: ClaudeLiveErrorCode;
  message: string;
  recoverable: boolean;
}

export interface ClaudeLiveUsageEstimate {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
  estimatedCostUsd: number;
}

export interface ClaudeLiveEvent {
  label: string;
  detail: string;
  at: string;
}

export interface ClaudeLiveAuditRecord {
  step:
    | "request created"
    | "activation checked"
    | "runtime checked"
    | "credential checked"
    | "capability checked"
    | "dry run generated"
    | "live blocked"
    | "simulation fallback prepared"
    | "response produced";
  detail: string;
}

export interface ClaudeLiveTelemetry {
  mode: ClaudeLiveMode;
  capability: ClaudeLiveCapability;
  requestCount: number;
  dryRunCount: number;
  liveEligibleCount: number;
  liveBlockedCount: number;
  simulationFallbackCount: number;
  estimatedLatencyMs: number;
  estimatedTokenUsage: number;
  errorCount: number;
  auditCoverage: number;
}

export interface ClaudeLiveEligibilityCheck {
  label: string;
  passed: boolean;
  blocking: boolean;
  detail: string;
}

export interface ClaudeLiveEligibility {
  mode: ClaudeLiveMode;
  liveEligible: boolean;
  activationLevel: ActivationLevel | null;
  credentialStatus: CredentialState;
  reasons: string[];
  checks: ClaudeLiveEligibilityCheck[];
}

export interface ClaudeLiveDryRunResult {
  status: "ready" | "blocked";
  summary: string;
  estimatedLatencyMs: number;
  usageEstimate: ClaudeLiveUsageEstimate;
  expectedTelemetry: ClaudeLiveTelemetry;
}

export interface ClaudeLiveSimulationFallback {
  prepared: boolean;
  summary: string;
  output: string;
}

export interface ClaudeLiveResponse {
  id: string;
  status: ClaudeLiveStatus;
  mode: ClaudeLiveMode;
  summary: string;
  output: string;
  usageEstimate: ClaudeLiveUsageEstimate;
  latencyEstimate: number;
  warnings: string[];
  errors: ClaudeLiveError[];
  events: ClaudeLiveEvent[];
  telemetry: ClaudeLiveTelemetry;
  audit: ClaudeLiveAuditRecord[];
  simulationFallbackUsed: boolean;
  liveBlockedReasons: string[];
  createdAt: string;
}

export interface ClaudeLiveRecord {
  id: string;
  capability: ClaudeLiveCapability;
  chain: ClaudeLiveReferenceChain;
  request: ClaudeLiveRequest;
  eligibility: ClaudeLiveEligibility;
  dryRun: ClaudeLiveDryRunResult;
  simulationFallback: ClaudeLiveSimulationFallback;
  response: ClaudeLiveResponse;
  warnings: string[];
  badge: BadgeVariant;
}

export interface ClaudeLiveMetrics {
  mode: ClaudeLiveMode;
  supportedCapability: ClaudeLiveCapability;
  liveEligible: boolean;
  credentialStatus: CredentialState;
  dryRunStatus: ClaudeLiveDryRunResult["status"];
  simulationFallback: boolean;
  healthScore: number;
  healthBadge: BadgeVariant;
}
