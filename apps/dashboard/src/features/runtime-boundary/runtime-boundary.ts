/*
 * runtime-boundary.ts — the boundary contract descriptor: the ordered pipeline,
 * supported runtime modes, gate list and the invariant clauses that make this
 * the final safety boundary before real execution. Descriptive + deterministic.
 */

import type { RuntimeGateKind, RuntimeMode } from "@/features/runtime-boundary/types";

export interface RuntimePipelineStep {
  order: number;
  label: string;
  description: string;
}

export const runtimePipeline: RuntimePipelineStep[] = [
  { order: 1, label: "Receive Invocation", description: "Accept a prepared invocation from the Invocation Contract." },
  { order: 2, label: "Build Runtime Context", description: "Snapshot provider metadata and confidence." },
  { order: 3, label: "Resolve Runtime Mode", description: "Map execution mode to a runtime mode." },
  { order: 4, label: "Validate Runtime Environment", description: "Confirm the offline environment (no network / secrets)." },
  { order: 5, label: "Validate Provider Readiness", description: "Check loaded / initialized / healthy / simulation." },
  { order: 6, label: "Validate Credentials Status", description: "Inspect placeholder credential state only." },
  { order: 7, label: "Validate Policy", description: "Evaluate offline policy status." },
  { order: 8, label: "Validate Approval", description: "Resolve human-approval requirement." },
  { order: 9, label: "Evaluate Runtime Health", description: "Blend availability, reliability and readiness." },
  { order: 10, label: "Evaluate Promotion Eligibility", description: "Decide offline promotion; live crossing stays blocked." },
  { order: 11, label: "Produce Runtime Decision", description: "Run all nine gates and assemble the decision." },
  { order: 12, label: "Generate Audit", description: "Emit audit records for every dimension." },
  { order: 13, label: "Generate Runtime Report", description: "Emit the explainable boundary report." },
];

export const runtimeModes: RuntimeMode[] = [
  "Simulation",
  "Dry Run",
  "Read Only",
  "Approval Required",
  "Future Live",
  "Blocked",
  "Emergency Stop",
];

export const runtimeGateKinds: RuntimeGateKind[] = [
  "Credential Gate",
  "Environment Gate",
  "Policy Gate",
  "Approval Gate",
  "Health Gate",
  "Provider Gate",
  "Simulation Gate",
  "Promotion Gate",
  "Emergency Stop Gate",
];

export const runtimeBoundaryClauses: string[] = [
  "The boundary decides whether an invocation may cross into live runtime — it never executes providers.",
  "Live runtime crossing (Future Live) is disabled in this phase and always blocked.",
  "Credentials are placeholders only; no credential, env or secret manager is ever accessed.",
  "Every decision runs all nine deterministic gates and is fully explainable.",
  "Simulation fallback is always available; nothing leaves the offline world.",
];
