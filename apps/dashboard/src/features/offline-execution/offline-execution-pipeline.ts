/*
 * offline-execution-pipeline.ts — descriptive end-to-end pipeline definition.
 * The steps mirror what the engine actually runs; execution of each step lives
 * in the dedicated modules.
 */

export interface OfflinePipelineStep {
  order: number;
  label: string;
  description: string;
}

export const offlineExecutionPipeline: OfflinePipelineStep[] = [
  { order: 1, label: "Receive Planning Blueprint", description: "Reference the latest generated plan." },
  { order: 2, label: "Load Orchestration Blueprint", description: "Reference the latest orchestration blueprint." },
  { order: 3, label: "Create Offline Execution Session", description: "Open a deterministic offline session." },
  { order: 4, label: "Select Task", description: "Pick the next plan task." },
  { order: 5, label: "Build Execution Request", description: "Map the task to a routing execution request." },
  { order: 6, label: "Route Provider", description: "Run the Provider Routing Engine." },
  { order: 7, label: "Build Invocation", description: "Run the Provider Invocation Contract." },
  { order: 8, label: "Evaluate Runtime Boundary", description: "Run the Live Provider Runtime Boundary." },
  { order: 9, label: "Enforce Simulation Mode", description: "Confirm the task stays offline; block live crossing." },
  { order: 10, label: "Generate Simulated Provider Result", description: "Produce the deterministic simulated result." },
  { order: 11, label: "Record Audit Trail", description: "Audit every stage." },
  { order: 12, label: "Generate Telemetry", description: "Aggregate session telemetry." },
  { order: 13, label: "Produce Offline Execution Report", description: "Emit the explainable report." },
];

export const offlineSafetyBoundaries: string[] = [
  "No live execution, provider APIs, SDKs, credentials, env, secrets or network.",
  "No shell commands, no file mutation, no repository mutation, no LLM execution.",
  "Future Live remains blocked at the runtime boundary for every task.",
  "Simulation is enforced end-to-end; only deterministic results are produced.",
  "Full traceability: plan → task → routing → invocation → runtime → result.",
];
