/*
 * routing-rules.ts — deterministic fixture execution requests plus a default
 * strategy hint per capability. These sample requests exercise the engine so
 * the UI can show real, reproducible routing decisions without any execution.
 */

import type { MatrixCapability } from "@/features/provider-matrix";
import type { RoutingExecutionRequest, RoutingStrategy } from "@/features/provider-routing/types";

/** default strategy hint per capability (deterministic). */
export const defaultStrategyFor: Record<string, RoutingStrategy> = {
  Reasoning: "Highest Confidence",
  "Code Generation": "Best Capability",
  Repository: "Best Capability",
  Browser: "Fastest Provider",
  Desktop: "Approval First",
  Communication: "Approval First",
  "Knowledge Retrieval": "Health First",
  Planning: "Highest Confidence",
  Execution: "Lowest Risk",
  Review: "Best Capability",
  Search: "Fastest Provider",
  "Human Approval": "Human First",
  Simulation: "Simulation Only",
  "Future Live": "Simulation Only",
};

function req(
  id: string,
  description: string,
  requiredCapabilities: MatrixCapability[],
  strategy: RoutingStrategy,
  overrides: Partial<RoutingExecutionRequest> = {}
): RoutingExecutionRequest {
  return {
    id,
    requestId: `req-${id}`,
    description,
    requiredCapabilities,
    executionMode: "Simulation",
    constraints: [],
    policyTags: [],
    requiresApproval: false,
    strategy,
    ...overrides,
  };
}

export const sampleRequests: RoutingExecutionRequest[] = [
  req("reasoning", "Multi-step reasoning over a strategic goal", ["Reasoning"], "Highest Confidence"),
  req("codegen", "Generate an implementation for a feature", ["Code Generation"], "Best Capability"),
  req("repo", "Open a pull request against a repository", ["Repository"], "Best Capability"),
  req("browser", "Extract data from a public web page", ["Browser", "Search"], "Fastest Provider"),
  req("desktop", "Operate a native desktop application", ["Desktop"], "Approval First", { requiresApproval: true }),
  req("comms", "Send a customer notification email", ["Communication"], "Human First", { requiresApproval: true }),
  req("multi", "Generate code and open a repository PR", ["Code Generation", "Repository"], "Multi Provider"),
  req("knowledge", "Retrieve knowledge with no primary owner", ["Knowledge Retrieval"], "Health First"),
];
