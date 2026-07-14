import { getActivePlans, getAgentPlan } from "@/features/task-planning";
import { buildExecutionBridge } from "./execution-bridge";
import type { ExecutionBridgeResult } from "./execution-bridge";

export function getAgentExecutionBridge(agentId: string): ExecutionBridgeResult | null {
  const result = getAgentPlan(agentId);
  return result ? buildExecutionBridge(result.plan) : null;
}

export function getExecutiveExecutionBridges(): ExecutionBridgeResult[] {
  return getActivePlans().map((result) => buildExecutionBridge(result.plan));
}

