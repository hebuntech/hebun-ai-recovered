import {
  makeAdapterError,
  makeEvent,
} from "@/features/adapters";
import type {
  AdapterEvent,
  ExecutionTelemetry,
} from "@/features/adapters";
import type {
  NormalizedRequest,
  NormalizedResponse,
} from "@/features/provider-framework";
import { githubProviderEvents } from "@/features/providers/github/events";
import { githubProviderTelemetry } from "@/features/providers/github/telemetry";
import type {
  GitHubCapabilityKind,
  GitHubRequest,
  GitHubResponse,
  GitHubSimulationProfile,
} from "@/features/providers/github/types";

const capabilitySamples: Array<{
  capability: GitHubCapabilityKind;
  operation: GitHubRequest["operation"];
  summary: string;
  repository: string;
  owner: string;
  branch?: string;
  pullRequestNumber?: number;
  issueNumber?: number;
  workflowName?: string;
  releaseTag?: string;
  commitSha?: string;
  governanceFinding: string;
  warning?: string;
}> = [
  {
    capability: "repository inspection",
    operation: "inspect_repository",
    summary: "Prepared a deterministic repository overview including governance posture, active branches, and review signals.",
    repository: "hebun-ai/dashboard",
    owner: "hebun-ai",
    branch: "main",
    governanceFinding: "Repository controls are documented but still simulation-only.",
  },
  {
    capability: "branch analysis",
    operation: "analyze_branch",
    summary: "Prepared a deterministic branch risk summary for protected, active, and stale branches.",
    repository: "hebun-ai/dashboard",
    owner: "hebun-ai",
    branch: "release/q3-governance",
    governanceFinding: "Protected branch coverage is strong but stale branch cleanup is pending.",
  },
  {
    capability: "commit analysis",
    operation: "analyze_commit",
    summary: "Prepared a deterministic commit impact assessment with risk and release notes context.",
    repository: "hebun-ai/dashboard",
    owner: "hebun-ai",
    commitSha: "abc1234",
    governanceFinding: "Commit simulation indicates moderate review depth needed before release.",
  },
  {
    capability: "pull request analysis",
    operation: "analyze_pull_request",
    summary: "Prepared a deterministic pull request readiness summary with review, workflow, and governance posture.",
    repository: "hebun-ai/dashboard",
    owner: "hebun-ai",
    pullRequestNumber: 214,
    governanceFinding: "Approval sequencing is required before merge readiness can be considered healthy.",
  },
  {
    capability: "pull request planning",
    operation: "plan_pull_request",
    summary: "Prepared a deterministic review and approval plan for a future pull request workflow.",
    repository: "hebun-ai/dashboard",
    owner: "hebun-ai",
    pullRequestNumber: 219,
    governanceFinding: "Pull request planning should include a policy checkpoint before final approval.",
  },
  {
    capability: "issue analysis",
    operation: "analyze_issue",
    summary: "Prepared a deterministic issue impact summary and cross-team routing note.",
    repository: "hebun-ai/dashboard",
    owner: "hebun-ai",
    issueNumber: 88,
    governanceFinding: "Issue ownership is clear but escalation timing should be shortened.",
  },
  {
    capability: "issue triage",
    operation: "triage_issue",
    summary: "Prepared a deterministic issue triage recommendation with priority and follow-up ownership.",
    repository: "hebun-ai/dashboard",
    owner: "hebun-ai",
    issueNumber: 92,
    governanceFinding: "Triage severity aligns with current release risk but requires director visibility.",
  },
  {
    capability: "workflow status analysis",
    operation: "analyze_workflow",
    summary: "Prepared a deterministic workflow status assessment using simulated run outcomes and warning states.",
    repository: "hebun-ai/dashboard",
    owner: "hebun-ai",
    workflowName: "director-dashboard-validation",
    governanceFinding: "Workflow attention state is tied to review completeness, not runtime execution.",
  },
  {
    capability: "release planning",
    operation: "plan_release",
    summary: "Prepared a deterministic release planning summary with governance checkpoints and readiness notes.",
    repository: "hebun-ai/dashboard",
    owner: "hebun-ai",
    releaseTag: "v6.0.0-simulation",
    governanceFinding: "Release planning remains blocked on simulated approval gates only.",
  },
  {
    capability: "repository governance",
    operation: "review_governance",
    summary: "Prepared a deterministic governance review for branch protection, review depth, and approval posture.",
    repository: "hebun-ai/dashboard",
    owner: "hebun-ai",
    branch: "main",
    governanceFinding: "Governance posture is healthy, but enforcement remains illustrative only.",
  },
  {
    capability: "security alert review",
    operation: "review_security_alerts",
    summary: "Prepared a deterministic security alert prioritization summary with mitigation notes.",
    repository: "hebun-ai/dashboard",
    owner: "hebun-ai",
    governanceFinding: "Security alert review should remain advisory until real provider integration exists.",
    warning: "Security alert review is simulated and does not reflect live repository scanning.",
  },
];

function telemetryFor(capability: GitHubCapabilityKind): ExecutionTelemetry {
  const base =
    githubProviderTelemetry.executions +
    capabilitySamples.findIndex((item) => item.capability === capability);

  return {
    ...githubProviderTelemetry,
    executions: base,
    lastUpdated: "10:15",
  };
}

function eventsFor(capability: GitHubCapabilityKind): AdapterEvent[] {
  return [
    ...githubProviderEvents,
    makeEvent(
      "Execution Completed",
      "github-provider-simulation",
      `Deterministic GitHub simulation completed for ${capability}.`,
      "10:15"
    ),
  ];
}

function buildProfile(
  sample: (typeof capabilitySamples)[number],
  index: number
): GitHubSimulationProfile {
  const request: GitHubRequest = {
    requestId: `github-sim-${index + 1}`,
    repository: sample.repository,
    owner: sample.owner,
    branch: sample.branch,
    commitSha: sample.commitSha,
    pullRequestNumber: sample.pullRequestNumber,
    issueNumber: sample.issueNumber,
    workflowName: sample.workflowName,
    releaseTag: sample.releaseTag,
    operation: sample.operation,
    filters: ["deterministic", "offline-only", "foundation-phase"],
    constraints: [
      "offline-only",
      "no-network",
      "no-octokit",
      "no-git-commands",
      "no-repository-mutation",
      "no-credentials",
    ],
    metadata: {
      provider: "github",
      capability: sample.capability,
    },
  };

  const telemetry = telemetryFor(sample.capability);
  const events = eventsFor(sample.capability);

  const response: GitHubResponse = {
    requestId: request.requestId,
    summary: sample.summary,
    repositoryContext: {
      repository: sample.repository,
      owner: sample.owner,
      defaultBranch: "main",
      visibility: "private",
      governancePosture: "managed",
    },
    branches: [
      {
        name: sample.branch ?? "main",
        status: "protected",
        summary: "Primary governed branch in simulation mode.",
      },
      {
        name: "feature/registry-intelligence",
        status: "active",
        summary: "Representative active branch used for offline planning context.",
      },
      {
        name: "archive/q1-cleanup",
        status: "stale",
        summary: "Representative stale branch retained for hygiene analysis.",
      },
    ],
    commits: [
      {
        sha: sample.commitSha ?? "def5678",
        title: "Simulated provider foundation checkpoint",
        riskLevel: "medium",
      },
      {
        sha: "fed4321",
        title: "Simulated governance review follow-up",
        riskLevel: "low",
      },
    ],
    pullRequests: [
      {
        number: sample.pullRequestNumber ?? 214,
        title: "Simulation-only provider foundation review",
        status: "approved",
        summary: "Representative pull request posture for deterministic review analysis.",
      },
      {
        number: 219,
        title: "Governance checkpoint planning",
        status: "changes-requested",
        summary: "Representative approval gate requiring an additional governance check.",
      },
    ],
    issues: [
      {
        number: sample.issueNumber ?? 88,
        title: "Simulation issue triage sample",
        status: "triaged",
        summary: "Representative issue routing and ownership context.",
      },
      {
        number: 92,
        title: "Release readiness attention sample",
        status: "blocked",
        summary: "Representative issue blocked on simulated approval readiness.",
      },
    ],
    workflowRuns: [
      {
        name: sample.workflowName ?? "director-dashboard-validation",
        status: "success",
        summary: "Representative workflow run completed within simulation boundaries.",
      },
      {
        name: "provider-conformance-check",
        status: "attention",
        summary: "Representative governance-related workflow attention state.",
      },
    ],
    reviews: [
      {
        reviewer: "Director Review",
        status: "approved",
        summary: "Representative executive approval posture.",
      },
      {
        reviewer: "Governance Review",
        status: "commented",
        summary: "Representative governance note requesting traceability detail.",
      },
    ],
    securityAlerts: [
      {
        category: "dependency policy",
        severity: "medium",
        summary: "Representative alert fixture retained for prioritization only.",
      },
      {
        category: "workflow permissions",
        severity: "low",
        summary: "Representative permissions alert fixture for governance review.",
      },
    ],
    releaseNotes: [
      "Simulation release note: repository readiness assessed offline.",
      "Simulation release note: no repository mutation or live workflow dispatch occurred.",
    ],
    governanceFindings: [
      sample.governanceFinding,
      "All findings are deterministic fixtures intended for provider-framework validation only.",
    ],
    artifacts: [
      {
        id: `github-artifact-${index + 1}`,
        kind: "repository-analysis",
        label: `${sample.capability} artifact`,
        ref: `simulation://github/${sample.capability.replace(/\s+/g, "-")}`,
      },
    ],
    warnings: [
      "This output is simulation-only and does not represent a real GitHub integration.",
      ...(sample.warning ? [sample.warning] : []),
    ],
    events,
    telemetry,
  };

  const normalizedRequest: NormalizedRequest = {
    requestId: request.requestId,
    providerType: "Repository Provider",
    executionMode: "simulation",
    payloadSummary: `${request.operation} for ${request.owner}/${request.repository}`,
    capabilities: ["Repository", "File System", "Search", "Human Approval", "Simulation"],
    constraints: request.constraints,
    metadata: {
      provider: "github",
      operation: request.operation,
      capability: sample.capability,
    },
  };

  const normalizedResponse: NormalizedResponse = {
    requestId: response.requestId,
    status: "simulated",
    resultSummary: response.summary,
    artifacts: response.artifacts,
    metrics: {
      steps: 4,
      durationMs: telemetry.averageDurationMs,
      retryCount: 0,
    },
    telemetry,
    warnings: response.warnings,
    errors: [],
    events,
  };

  return {
    capability: sample.capability,
    deterministic: true,
    sampleRequest: request,
    sampleResponse: response,
    sampleFailure: makeAdapterError(
      sample.capability === "pull request analysis"
        ? "PERMISSION_DENIED"
        : sample.capability === "workflow status analysis"
          ? "UNAVAILABLE"
          : "VALIDATION_FAILED",
      `Simulation failure sample for ${sample.capability}: live GitHub execution is not available in this foundation phase.`,
      { adapterId: "github-provider-simulation" }
    ),
    expectedTelemetry: telemetry,
    expectedEvents: events,
    normalizedRequest,
    normalizedResponse,
  };
}

export const githubSimulationProfiles: GitHubSimulationProfile[] =
  capabilitySamples.map(buildProfile);

export const githubPrimarySimulationProfile = githubSimulationProfiles[0];
