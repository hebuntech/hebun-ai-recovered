import type { BadgeVariant } from "@/components/ui/badge";
import type {
  AdapterCapabilityKind,
  AdapterError,
  AdapterEvent,
  ExecutionArtifact,
  ExecutionTelemetry,
} from "@/features/adapters";
import type { NormalizedRequest, NormalizedResponse, ProviderConfig } from "@/features/provider-framework";

export const CODEX_PROVIDER_ID = "codex";
export const CODEX_PROVIDER_NAME = "Codex";
export const CODEX_PROVIDER_FAMILY = "OpenAI";

export type CodexCapabilityKind =
  | "code generation"
  | "code review"
  | "refactoring"
  | "test generation"
  | "build analysis"
  | "repository analysis"
  | "bug diagnosis"
  | "migration planning"
  | "documentation generation"
  | "developer workflow planning";

export interface CodexCapabilityMapping {
  codex: CodexCapabilityKind;
  framework: AdapterCapabilityKind;
  description: string;
}

export type CodexCredentialStatus = "not-configured" | "placeholder" | "runtime-injected";

export interface CodexConfig extends ProviderConfig {
  defaultModel: string;
  credentialStatus: CodexCredentialStatus;
}

export type CodexOutputFormat = "text" | "json" | "structured" | "patch-plan";

export interface CodexRepositoryContext {
  repository: string;
  branch: string;
  scope: string;
  notes: string[];
}

export interface CodexFileTarget {
  path: string;
  role: "source" | "test" | "config" | "docs";
  summary: string;
}

export interface CodexDiffTarget {
  file: string;
  summary: string;
}

export interface CodexRequest {
  requestId: string;
  task: string;
  repositoryContext: CodexRepositoryContext;
  files: CodexFileTarget[];
  diffs: CodexDiffTarget[];
  instructions: string[];
  constraints: string[];
  testTargets: string[];
  buildTargets: string[];
  outputFormat: CodexOutputFormat;
  metadata: Record<string, string>;
}

export interface CodexProposedChange {
  file: string;
  action: "create" | "update" | "review" | "analyze";
  summary: string;
}

export interface CodexPatchPlanStep {
  step: string;
  detail: string;
}

export interface CodexTestPlanStep {
  target: string;
  purpose: string;
}

export interface CodexResponse {
  requestId: string;
  summary: string;
  proposedChanges: CodexProposedChange[];
  patchPlan: CodexPatchPlanStep[];
  testPlan: CodexTestPlanStep[];
  riskNotes: string[];
  affectedFiles: string[];
  commandsSuggested: string[];
  artifacts: ExecutionArtifact[];
  warnings: string[];
  events: AdapterEvent[];
  telemetry: ExecutionTelemetry;
}

export type CodexErrorCategory =
  | "validation"
  | "configuration"
  | "permission"
  | "rate_limit"
  | "timeout"
  | "unavailable"
  | "execution"
  | "unsafe_code"
  | "repo_conflict"
  | "unknown";

export interface CodexSimulationProfile {
  capability: CodexCapabilityKind;
  deterministic: boolean;
  sampleRequest: CodexRequest;
  sampleResponse: CodexResponse;
  sampleFailure: AdapterError;
  expectedTelemetry: ExecutionTelemetry;
  expectedEvents: AdapterEvent[];
  normalizedRequest: NormalizedRequest;
  normalizedResponse: NormalizedResponse;
}

export interface CodexMetrics {
  status: "simulation" | "ready" | "disabled";
  simulationMode: boolean;
  capabilityCoverage: number;
  conformanceScore: number;
  credentialStatus: CodexCredentialStatus;
  healthBadge: BadgeVariant;
}
