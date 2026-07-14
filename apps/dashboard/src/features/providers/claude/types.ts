/*
 * providers/claude/types.ts — Claude Provider Adapter foundation types.
 *
 * First concrete provider, but fully deterministic and OFFLINE. No Claude API,
 * no Anthropic SDK, no credentials, no network, no LLM execution. This only
 * defines how a future Claude adapter fits the Provider Framework + Adapter SDK.
 */

import type { BadgeVariant } from "@/components/ui/badge";
import type { AdapterCapabilityKind, AdapterError, AdapterEvent, ExecutionTelemetry } from "@/features/adapters";
import type { NormalizedRequest, NormalizedResponse, ProviderConfig } from "@/features/provider-framework";

export const CLAUDE_PROVIDER_ID = "claude";
export const CLAUDE_PROVIDER_NAME = "Claude";
export const CLAUDE_PROVIDER_FAMILY = "Anthropic";

/* ── Claude domain capabilities (map onto framework capabilities) ── */

export type ClaudeCapabilityKind =
  | "reasoning"
  | "text generation"
  | "summarization"
  | "classification"
  | "planning support"
  | "extraction"
  | "structured output"
  | "tool-call planning"
  | "document analysis";

export interface ClaudeCapabilityMapping {
  claude: ClaudeCapabilityKind;
  framework: AdapterCapabilityKind;
  description: string;
}

/* ── Credential model — placeholders only ──────────────── */

export type CredentialStatus = "not-configured" | "placeholder" | "runtime-injected";

export interface ClaudeConfig extends ProviderConfig {
  defaultModel: string;
  credentialStatus: CredentialStatus;
}

/* ── Request / response shapes (deterministic, no execution) ── */

export type ClaudeOutputFormat = "text" | "json" | "structured";

export interface ClaudeMessage {
  role: "system" | "user" | "assistant";
  summary: string;
}

export interface ClaudeRequest {
  requestId: string;
  prompt: string;
  systemInstructions: string;
  messages: ClaudeMessage[];
  inputDocuments: string[];
  outputFormat: ClaudeOutputFormat;
  maxTokens: number;
  temperature: number;
  tools: string[];
  constraints: string[];
  metadata: Record<string, string>;
}

export type ClaudeFinishReason = "stop" | "max_tokens" | "tool_use" | "safety" | "simulated";

export interface ClaudeUsage {
  inputTokens: number;
  outputTokens: number;
  totalTokens: number;
}

export interface ClaudeToolPlanStep {
  tool: string;
  intent: string;
}

export interface ClaudeResponse {
  requestId: string;
  content: string;
  structuredOutput: Record<string, string> | null;
  toolPlan: ClaudeToolPlanStep[];
  usage: ClaudeUsage;
  finishReason: ClaudeFinishReason;
  safetySignals: string[];
  warnings: string[];
  events: AdapterEvent[];
  telemetry: ExecutionTelemetry;
}

/* ── Claude error taxonomy → framework categories ──────── */

export type ClaudeErrorCategory =
  | "validation"
  | "configuration"
  | "permission"
  | "rate_limit"
  | "timeout"
  | "unavailable"
  | "execution"
  | "safety_block"
  | "unknown";

/* ── Simulation ────────────────────────────────────────── */

export interface ClaudeSimulationProfile {
  capability: ClaudeCapabilityKind;
  deterministic: boolean;
  sampleRequest: ClaudeRequest;
  sampleResponse: ClaudeResponse;
  sampleFailure: AdapterError;
  normalizedRequest: NormalizedRequest;
  normalizedResponse: NormalizedResponse;
}

export interface ClaudeMetrics {
  status: "simulation" | "ready" | "disabled";
  simulationMode: boolean;
  capabilityCoverage: number;
  conformanceScore: number;
  credentialStatus: CredentialStatus;
  healthBadge: BadgeVariant;
}
