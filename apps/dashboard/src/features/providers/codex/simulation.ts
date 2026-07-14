import { makeAdapterError, makeEvent } from "@/features/adapters";
import type { AdapterEvent, ExecutionTelemetry } from "@/features/adapters";
import type { NormalizedRequest, NormalizedResponse } from "@/features/provider-framework";
import { codexProviderEvents } from "@/features/providers/codex/events";
import { codexProviderTelemetry } from "@/features/providers/codex/telemetry";
import type {
  CodexCapabilityKind,
  CodexRequest,
  CodexResponse,
  CodexSimulationProfile,
} from "@/features/providers/codex/types";

const capabilitySamples: Array<{
  capability: CodexCapabilityKind;
  task: string;
  summary: string;
  files: string[];
  commandsSuggested: string[];
}> = [
  { capability: "code generation", task: "Generate an execution widget extension plan for the director dashboard.", summary: "Prepared a deterministic component and feature-file generation plan.", files: ["src/components/execution/execution-widget.tsx", "src/features/execution/index.ts"], commandsSuggested: ["npm run lint", "npm run build"] },
  { capability: "code review", task: "Review planning and orchestration layer changes for architectural regressions.", summary: "Prepared a deterministic code review summary with risk notes and follow-up checks.", files: ["src/features/planning/planning-pipeline.ts", "src/features/orchestration/orchestration-pipeline.ts"], commandsSuggested: ["npm run lint"] },
  { capability: "refactoring", task: "Refactor duplicated provider normalization helpers into a cleaner offline plan.", summary: "Prepared a patch plan that consolidates duplicated provider normalization steps.", files: ["src/features/provider-framework/provider-normalization.ts"], commandsSuggested: ["npm run build"] },
  { capability: "test generation", task: "Design deterministic validation steps for dashboard route coverage.", summary: "Prepared a test-plan artifact for route and console validation without generating runnable tests.", files: ["src/app/(dashboard)/dashboard/page.tsx"], commandsSuggested: ["curl -sI http://localhost:3000/dashboard"] },
  { capability: "build analysis", task: "Analyze potential build impacts of a new provider module.", summary: "Prepared a build impact summary covering imports, route generation, and type-check surfaces.", files: ["src/features/providers/codex/index.ts"], commandsSuggested: ["npm run build"] },
  { capability: "repository analysis", task: "Assess repository touch points for a provider foundation phase.", summary: "Prepared a repository analysis focused on provider directories, dashboard routing, and shared framework contracts.", files: ["src/features/provider-framework/index.ts", "src/config/sidebar.config.ts"], commandsSuggested: ["rg --files src | rg 'providers|provider-framework'"] },
  { capability: "bug diagnosis", task: "Diagnose a hypothetical provider conformance mismatch.", summary: "Prepared a root-cause note tying the mismatch to contract and normalization drift.", files: ["src/features/provider-framework/provider-conformance.ts"], commandsSuggested: ["npm run lint"] },
  { capability: "migration planning", task: "Plan migration from simulation-only provider foundations to real adapters.", summary: "Prepared phased migration notes that preserve provider contracts and safety boundaries.", files: ["src/features/providers/codex/provider.ts"], commandsSuggested: ["npm run build"] },
  { capability: "documentation generation", task: "Generate structured provider documentation for the director surface.", summary: "Prepared a documentation artifact plan covering capabilities, normalization, and safety.", files: ["src/app/(dashboard)/director/providers/codex/page.tsx"], commandsSuggested: ["curl -sI http://localhost:3000/director/providers/codex"] },
  { capability: "developer workflow planning", task: "Plan a deterministic developer workflow for provider validation.", summary: "Prepared an offline workflow for lint, build, route checks, and console validation.", files: ["src/config/sidebar.config.ts", "src/app/(dashboard)/dashboard/page.tsx"], commandsSuggested: ["npm run lint", "npm run build"] },
];

function telemetryFor(capability: CodexCapabilityKind): ExecutionTelemetry {
  const base = codexProviderTelemetry.executions + capabilitySamples.findIndex((item) => item.capability === capability);
  return {
    ...codexProviderTelemetry,
    executions: base,
    lastUpdated: "09:25",
  };
}

function eventsFor(capability: CodexCapabilityKind): AdapterEvent[] {
  return [
    ...codexProviderEvents,
    makeEvent(
      "Execution Completed",
      "codex-provider-simulation",
      `Deterministic Codex simulation completed for ${capability}.`,
      "09:25"
    ),
  ];
}

function buildProfile(sample: (typeof capabilitySamples)[number], index: number): CodexSimulationProfile {
  const request: CodexRequest = {
    requestId: `codex-sim-${index + 1}`,
    task: sample.task,
    repositoryContext: {
      repository: "hebun-ai-dashboard",
      branch: "simulation/foundation",
      scope: "provider-foundation",
      notes: ["Offline only", "No repository mutation", "No shell execution from provider"],
    },
    files: sample.files.map((file, fileIndex) => ({
      path: file,
      role: file.includes("page.tsx") ? "docs" : "source",
      summary: `Local context file ${fileIndex + 1} for ${sample.capability}.`,
    })),
    diffs: sample.files.map((file) => ({
      file,
      summary: `Hypothetical diff summary for ${file}.`,
    })),
    instructions: [
      "Remain deterministic and offline.",
      "Return a simulation artifact only.",
      "Do not execute code, tests, builds, or shell commands.",
    ],
    constraints: [
      "offline-only",
      "no-network",
      "no-shell-execution",
      "no-repository-mutation",
      "no-credentials",
    ],
    testTargets: ["unit-validation-plan", "route-validation-plan"],
    buildTargets: ["dashboard-app"],
    outputFormat: "patch-plan",
    metadata: {
      provider: "codex",
      capability: sample.capability,
    },
  };

  const telemetry = telemetryFor(sample.capability);
  const events = eventsFor(sample.capability);
  const response: CodexResponse = {
    requestId: request.requestId,
    summary: sample.summary,
    proposedChanges: sample.files.map((file) => ({
      file,
      action: "analyze",
      summary: `Prepared deterministic analysis for ${file}.`,
    })),
    patchPlan: [
      { step: "Analyze scope", detail: "Review the provided repository context and target files only." },
      { step: "Plan changes", detail: "Produce a deterministic patch plan without modifying any repository content." },
      { step: "Prepare validation", detail: "Suggest lint, build, and route-validation follow-up steps." },
    ],
    testPlan: [
      { target: "lint", purpose: "Confirm the provider foundation remains type-safe and lint-clean." },
      { target: "build", purpose: "Confirm static generation and route stability." },
    ],
    riskNotes: [
      "No real code execution is allowed in this provider phase.",
      "Repository mutation remains prohibited until a later real-integration phase.",
    ],
    affectedFiles: sample.files,
    commandsSuggested: sample.commandsSuggested,
    artifacts: [
      {
        id: `codex-artifact-${index + 1}`,
        kind: "patch-plan",
        label: `${sample.capability} artifact`,
        ref: `simulation://codex/${sample.capability.replace(/\s+/g, "-")}`,
      },
    ],
    warnings: [
      "This output is simulation-only and does not represent a real Codex call.",
    ],
    events,
    telemetry,
  };

  const normalizedRequest: NormalizedRequest = {
    requestId: request.requestId,
    providerType: "Automation Provider",
    executionMode: "simulation",
    payloadSummary: request.task,
    capabilities: ["Code Generation", "Repository", "Terminal", "Search", "File System", "Human Approval", "Simulation"],
    constraints: request.constraints,
    metadata: {
      provider: "codex",
      outputFormat: request.outputFormat,
      capability: sample.capability,
    },
  };

  const normalizedResponse: NormalizedResponse = {
    requestId: response.requestId,
    status: "simulated",
    resultSummary: response.summary,
    artifacts: response.artifacts,
    metrics: {
      steps: response.patchPlan.length,
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
      sample.capability === "code review" ? "UNAVAILABLE" : "VALIDATION_FAILED",
      `Simulation failure sample for ${sample.capability}: live Codex execution is not available in this foundation phase.`,
      { adapterId: "codex-provider-simulation" }
    ),
    expectedTelemetry: telemetry,
    expectedEvents: events,
    normalizedRequest,
    normalizedResponse,
  };
}

export const codexSimulationProfiles: CodexSimulationProfile[] = capabilitySamples.map(buildProfile);

export const codexPrimarySimulationProfile = codexSimulationProfiles[0];
