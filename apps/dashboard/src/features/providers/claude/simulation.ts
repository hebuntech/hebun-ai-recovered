import { makeAdapterError, makeEvent } from "@/features/adapters";
import type { NormalizedRequest, NormalizedResponse } from "@/features/provider-framework";
import { claudeProviderEvents } from "@/features/providers/claude/events";
import { claudeProviderTelemetry } from "@/features/providers/claude/telemetry";
import type {
  ClaudeRequest,
  ClaudeResponse,
  ClaudeSimulationProfile,
} from "@/features/providers/claude/types";

export const claudeSampleRequest: ClaudeRequest = {
  requestId: "claude-sim-001",
  prompt: "Summarize the latest planning and execution posture for the director dashboard.",
  systemInstructions: "Return deterministic simulation output only.",
  messages: [
    { role: "system", summary: "Simulation only. No network calls." },
    { role: "user", summary: "Summarize planning, orchestration, and execution readiness." },
  ],
  inputDocuments: ["director-dashboard-brief.md", "execution-engine-summary.md"],
  outputFormat: "structured",
  maxTokens: 1200,
  temperature: 0,
  tools: ["registry-summary", "execution-summary"],
  constraints: ["offline-only", "no-credentials", "deterministic"],
  metadata: {
    route: "/director/providers/claude",
    mode: "simulation",
  },
};

export const claudeNormalizedRequest: NormalizedRequest = {
  requestId: claudeSampleRequest.requestId,
  providerType: "LLM Provider",
  executionMode: "simulation",
  payloadSummary: "Director-level planning and execution posture summary request.",
  capabilities: ["Code Generation", "Search", "File System", "Terminal", "Simulation"],
  constraints: claudeSampleRequest.constraints,
  metadata: {
    provider: "claude",
    outputFormat: claudeSampleRequest.outputFormat,
  },
};

export const claudeSampleResponse: ClaudeResponse = {
  requestId: claudeSampleRequest.requestId,
  content:
    "Simulated Claude response: planning is structured, orchestration is assigned, and execution is bounded by deterministic controls.",
  structuredOutput: {
    summary: "Execution readiness is improving under deterministic controls.",
    recommendation: "Keep simulation mode active until a real provider adapter phase is approved.",
    confidence: "high",
  },
  toolPlan: [
    { tool: "registry-summary", intent: "Read local registry context only." },
    { tool: "execution-summary", intent: "Assemble an offline executive summary." },
  ],
  usage: {
    inputTokens: 640,
    outputTokens: 182,
    totalTokens: 822,
  },
  finishReason: "simulated",
  safetySignals: ["offline-only", "credential-free", "no-provider-sdk"],
  warnings: ["This output is simulation-only and does not represent a real Claude API call."],
  events: [
    ...claudeProviderEvents,
    makeEvent(
      "Execution Completed",
      "claude-provider-simulation",
      "Deterministic Claude response simulation completed.",
      "09:15"
    ),
  ],
  telemetry: claudeProviderTelemetry,
};

export const claudeNormalizedResponse: NormalizedResponse = {
  requestId: claudeSampleResponse.requestId,
  status: "simulated",
  resultSummary: claudeSampleResponse.content,
  artifacts: [
    {
      id: "claude-artifact-1",
      kind: "structured-output",
      label: "Director Summary",
      ref: "simulation://claude/director-summary",
    },
  ],
  metrics: {
    steps: 3,
    durationMs: 38,
    retryCount: 0,
  },
  telemetry: claudeProviderTelemetry,
  warnings: claudeSampleResponse.warnings,
  errors: [],
  events: claudeSampleResponse.events,
};

export const claudeSimulationProfile: ClaudeSimulationProfile = {
  capability: "reasoning",
  deterministic: true,
  sampleRequest: claudeSampleRequest,
  sampleResponse: claudeSampleResponse,
  sampleFailure: makeAdapterError(
    "VALIDATION_FAILED",
    "Simulation failure sample: live mode is not allowed for the Claude provider foundation.",
    { adapterId: "claude-provider-simulation" }
  ),
  normalizedRequest: claudeNormalizedRequest,
  normalizedResponse: claudeNormalizedResponse,
};
