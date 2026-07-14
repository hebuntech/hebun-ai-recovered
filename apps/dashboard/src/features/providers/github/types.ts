import type { BadgeVariant } from "@/components/ui/badge";
import type {
  AdapterCapabilityKind,
  AdapterError,
  AdapterEvent,
  ExecutionArtifact,
  ExecutionTelemetry,
} from "@/features/adapters";
import type {
  NormalizedRequest,
  NormalizedResponse,
  ProviderConfig,
} from "@/features/provider-framework";

export const GITHUB_PROVIDER_ID = "github";
export const GITHUB_PROVIDER_NAME = "GitHub";
export const GITHUB_PROVIDER_FAMILY = "GitHub";

export type GitHubCapabilityKind =
  | "repository inspection"
  | "branch analysis"
  | "commit analysis"
  | "pull request analysis"
  | "pull request planning"
  | "issue analysis"
  | "issue triage"
  | "code review context"
  | "workflow status analysis"
  | "release planning"
  | "repository governance"
  | "security alert review";

export interface GitHubCapabilityMapping {
  github: GitHubCapabilityKind;
  framework: AdapterCapabilityKind;
  description: string;
}

export type GitHubCredentialStatus =
  | "not-configured"
  | "placeholder"
  | "runtime-injected";

export interface GitHubConfig extends ProviderConfig {
  defaultRepository: string;
  credentialStatus: GitHubCredentialStatus;
}

export type GitHubOperation =
  | "inspect_repository"
  | "analyze_branch"
  | "analyze_commit"
  | "analyze_pull_request"
  | "plan_pull_request"
  | "analyze_issue"
  | "triage_issue"
  | "analyze_workflow"
  | "plan_release"
  | "review_governance"
  | "review_security_alerts";

export interface GitHubRequest {
  requestId: string;
  repository: string;
  owner: string;
  branch?: string;
  commitSha?: string;
  pullRequestNumber?: number;
  issueNumber?: number;
  workflowName?: string;
  releaseTag?: string;
  operation: GitHubOperation;
  filters: string[];
  constraints: string[];
  metadata: Record<string, string>;
}

export interface GitHubRepositoryContext {
  repository: string;
  owner: string;
  defaultBranch: string;
  visibility: "private" | "internal" | "public";
  governancePosture: string;
}

export interface GitHubBranchRecord {
  name: string;
  status: "active" | "protected" | "stale";
  summary: string;
}

export interface GitHubCommitRecord {
  sha: string;
  title: string;
  riskLevel: "low" | "medium" | "high";
}

export interface GitHubPullRequestRecord {
  number: number;
  title: string;
  status: "open" | "approved" | "changes-requested";
  summary: string;
}

export interface GitHubIssueRecord {
  number: number;
  title: string;
  status: "open" | "triaged" | "blocked";
  summary: string;
}

export interface GitHubWorkflowRunRecord {
  name: string;
  status: "success" | "warning" | "attention";
  summary: string;
}

export interface GitHubReviewRecord {
  reviewer: string;
  status: "approved" | "commented" | "changes-requested";
  summary: string;
}

export interface GitHubSecurityAlertRecord {
  category: string;
  severity: "low" | "medium" | "high";
  summary: string;
}

export interface GitHubArtifactRecord {
  label: string;
  kind: string;
  summary: string;
}

export interface GitHubResponse {
  requestId: string;
  summary: string;
  repositoryContext: GitHubRepositoryContext;
  branches: GitHubBranchRecord[];
  commits: GitHubCommitRecord[];
  pullRequests: GitHubPullRequestRecord[];
  issues: GitHubIssueRecord[];
  workflowRuns: GitHubWorkflowRunRecord[];
  reviews: GitHubReviewRecord[];
  securityAlerts: GitHubSecurityAlertRecord[];
  releaseNotes: string[];
  governanceFindings: string[];
  artifacts: ExecutionArtifact[];
  warnings: string[];
  events: AdapterEvent[];
  telemetry: ExecutionTelemetry;
}

export type GitHubErrorCategory =
  | "validation"
  | "configuration"
  | "permission"
  | "rate_limit"
  | "timeout"
  | "unavailable"
  | "not_found"
  | "merge_conflict"
  | "branch_protection"
  | "execution"
  | "unknown";

export interface GitHubSimulationProfile {
  capability: GitHubCapabilityKind;
  deterministic: boolean;
  sampleRequest: GitHubRequest;
  sampleResponse: GitHubResponse;
  sampleFailure: AdapterError;
  expectedTelemetry: ExecutionTelemetry;
  expectedEvents: AdapterEvent[];
  normalizedRequest: NormalizedRequest;
  normalizedResponse: NormalizedResponse;
}

export interface GitHubMetrics {
  status: "simulation" | "ready" | "disabled";
  simulationMode: boolean;
  capabilityCoverage: number;
  conformanceScore: number;
  credentialStatus: GitHubCredentialStatus;
  healthBadge: BadgeVariant;
}
