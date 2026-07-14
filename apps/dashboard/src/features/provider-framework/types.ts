/*
 * provider-framework/types.ts — Provider Adapter Framework contracts.
 *
 * The framework sits between the Execution Adapter SDK and concrete providers.
 * It standardizes how every future provider adapter is implemented: metadata,
 * capability mapping, configuration, request/response/error normalization,
 * simulation, validation and conformance. Provider-independent + deterministic.
 * No real providers, no credentials, no network, no LLMs.
 */

import type { BadgeVariant } from "@/components/ui/badge";
import type {
  AdapterCapabilityKind,
  AdapterError,
  AdapterEvent,
  AdapterErrorCode,
  ExecutionArtifact,
  ExecutionTelemetry,
} from "@/features/adapters";
import type { RetryPolicy } from "@/features/adapters";

export const FRAMEWORK_VERSION = "1.0.0";

/* ── Provider taxonomy ─────────────────────────────────── */

export type ProviderTypeKind =
  | "LLM Provider"
  | "Computer Use Provider"
  | "Browser Provider"
  | "Communication Provider"
  | "Repository Provider"
  | "Email Provider"
  | "Calendar Provider"
  | "Messaging Provider"
  | "Search Provider"
  | "Automation Provider"
  | "Human Approval Provider";

export type ProviderExecutionMode = "simulation" | "sandbox" | "live";

export interface ProviderTypeDefinition {
  id: string;
  type: ProviderTypeKind;
  label: string;
  description: string;
  defaultCapabilities: AdapterCapabilityKind[];
  executionModes: ProviderExecutionMode[];
  status: "framework-only";
}

/* ── Metadata + configuration ──────────────────────────── */

export interface ProviderMetadata {
  id: string;
  name: string;
  version: string;
  providerType: ProviderTypeKind;
  vendor: string;
  description: string;
  simulation: boolean;
}

export interface ProviderRateLimit {
  requestsPerMinute: number;
  burst: number;
}

export interface ProviderConfig {
  providerId: string;
  providerType: ProviderTypeKind;
  version: string;
  enabled: boolean;
  simulation: boolean;
  timeoutMs: number;
  retryPolicy: RetryPolicy;
  rateLimits: ProviderRateLimit;
  capabilities: AdapterCapabilityKind[];
  featureFlags: string[];
  /* Never a real secret — schema placeholder only. */
  credentialsPlaceholder: string;
}

export interface ProviderConfigField {
  key: string;
  type: "string" | "number" | "boolean" | "list" | "secret";
  required: boolean;
  description: string;
}

/* ── Normalization ─────────────────────────────────────── */

export interface NormalizedRequest {
  requestId: string;
  providerType: ProviderTypeKind;
  executionMode: ProviderExecutionMode;
  payloadSummary: string;
  capabilities: AdapterCapabilityKind[];
  constraints: string[];
  metadata: Record<string, string>;
}

export type NormalizedStatus = "succeeded" | "failed" | "cancelled" | "simulated";

export interface NormalizedResponse {
  requestId: string;
  status: NormalizedStatus;
  resultSummary: string;
  artifacts: ExecutionArtifact[];
  metrics: NormalizedMetrics;
  telemetry: ExecutionTelemetry;
  warnings: string[];
  errors: AdapterError[];
  events: AdapterEvent[];
}

export interface NormalizedMetrics {
  steps: number;
  durationMs: number;
  retryCount: number;
}

/* ── Error normalization ───────────────────────────────── */

export type ProviderErrorCategory =
  | "Validation"
  | "Configuration"
  | "Permission"
  | "Execution"
  | "Timeout"
  | "Rate Limit"
  | "Unavailable"
  | "Internal"
  | "Unknown";

export interface ProviderErrorMapping {
  category: ProviderErrorCategory;
  sdkCode: AdapterErrorCode;
  recoverable: boolean;
  description: string;
}

/* ── Simulation ────────────────────────────────────────── */

export interface ProviderSimulationProfile {
  providerType: ProviderTypeKind;
  deterministic: boolean;
  sampleRequest: NormalizedRequest;
  sampleResponse: NormalizedResponse;
  sampleFailure: AdapterError;
}

/* ── Health ────────────────────────────────────────────── */

export interface ProviderHealth {
  status: "Healthy" | "Degraded" | "Unavailable" | "Unknown";
  availability: number;
  latencyMs: number;
  note: string;
}

/* ── Validation + conformance ──────────────────────────── */

export interface ProviderValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  summary: string;
}

export interface ConformanceCheck {
  id: string;
  label: string;
  passed: boolean;
  detail: string;
}

export interface ConformanceResult {
  providerId: string;
  checks: ConformanceCheck[];
  passed: number;
  total: number;
  score: number;
  verdict: "pass" | "attention" | "fail";
  verdictBadge: BadgeVariant;
}

/* ── The provider contract ─────────────────────────────── */

export interface ProviderAdapter {
  metadata: ProviderMetadata;
  version: string;
  providerType: ProviderTypeKind;
  supportedCapabilities: AdapterCapabilityKind[];
  supportedExecutionModes: ProviderExecutionMode[];
  configurationSchema: ProviderConfigField[];
  simulationSupport: boolean;

  health(): ProviderHealth;
  validate(config: ProviderConfig): ProviderValidationResult;
  normalizeRequest(input: NormalizedRequest): NormalizedRequest;
  normalizeResponse(input: NormalizedResponse): NormalizedResponse;
  normalizeError(error: AdapterError): AdapterError;
}

/* ── Registry record + metrics ─────────────────────────── */

export interface ProviderRecord {
  metadata: ProviderMetadata;
  providerType: ProviderTypeKind;
  capabilities: AdapterCapabilityKind[];
  executionModes: ProviderExecutionMode[];
  health: ProviderHealth;
  conformanceScore: number;
  simulationSupport: boolean;
  registeredAt: string;
}

export interface FrameworkMetrics {
  frameworkVersion: string;
  registeredProviderTypes: number;
  registeredProviders: number;
  frameworkHealth: number;
  simulationCoverage: number;
  conformanceScore: number;
  healthBadge: BadgeVariant;
}
