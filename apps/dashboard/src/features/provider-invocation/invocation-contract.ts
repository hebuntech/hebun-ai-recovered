/*
 * invocation-contract.ts — the universal invocation contract every provider
 * must eventually implement, plus the ordered pipeline definition. This is a
 * descriptive, deterministic contract — no method performs real execution.
 */

import type { RoutingDecision } from "@/features/provider-routing";
import type {
  Invocation,
  InvocationContext,
  InvocationExecutionMode,
  InvocationRequest,
  InvocationResponse,
} from "@/features/provider-invocation/types";

/**
 * Contract shape a future provider adapter implements to be invokable. Every
 * method is deterministic and offline in this phase.
 */
export interface ProviderInvocationContract {
  buildContext(decision: RoutingDecision): InvocationContext;
  buildRequest(decision: RoutingDecision, context: InvocationContext): InvocationRequest;
  expectedResponse(decision: RoutingDecision, context: InvocationContext): InvocationResponse;
  prepare(decision: RoutingDecision): Invocation;
}

export interface InvocationPipelineStep {
  order: number;
  label: string;
  description: string;
}

export const invocationPipeline: InvocationPipelineStep[] = [
  { order: 1, label: "Receive Routing Decision", description: "Accept the primary provider selection from the Routing Engine." },
  { order: 2, label: "Validate Invocation Contract", description: "Confirm the decision can be turned into a valid invocation." },
  { order: 3, label: "Build Invocation Context", description: "Snapshot provider metadata and confidence from the matrix." },
  { order: 4, label: "Create Invocation Request", description: "Normalize the request payload and constraints." },
  { order: 5, label: "Resolve Provider Metadata", description: "Reference provider type and family (no duplication)." },
  { order: 6, label: "Resolve Execution Mode", description: "Derive Simulation / Dry Run / Approval / … from the decision." },
  { order: 7, label: "Apply Timeout Policy", description: "Attach the per-mode deterministic timeout budget." },
  { order: 8, label: "Apply Retry Policy", description: "Attach the deterministic retry schedule." },
  { order: 9, label: "Produce Invocation Plan", description: "Assemble rollback + cancellation policies." },
  { order: 10, label: "Generate Expected Response", description: "Produce the contract response shape and artifacts." },
  { order: 11, label: "Generate Telemetry", description: "Project deterministic telemetry." },
  { order: 12, label: "Generate Audit Record", description: "Emit audit records for every dimension." },
  { order: 13, label: "Produce Invocation Report", description: "Emit the explainable invocation report." },
];

export const supportedExecutionModes: InvocationExecutionMode[] = [
  "Simulation",
  "Dry Run",
  "Read Only",
  "Planning",
  "Approval Required",
  "Future Live",
];

/** Contract clauses — invariants every provider invocation must uphold. */
export const invocationContractClauses: string[] = [
  "Every invocation references a routing decision and provider (no duplication).",
  "Execution mode is one of the six deterministic modes.",
  "A prepared invocation declares request, expected response and artifact contracts.",
  "Retry, timeout, rollback and cancellation policies are always attached.",
  "No invocation performs real execution, network, credential or LLM access in this phase.",
];
