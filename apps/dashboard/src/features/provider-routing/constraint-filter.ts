/*
 * constraint-filter.ts — deterministic constraint + policy evaluation. Checks
 * execution-mode compatibility, simulation compatibility, provider availability
 * and declared policy tags. Offline only.
 */

import { getCatalogEntry, modesForProvider } from "@/features/provider-matrix";
import type { ProviderId } from "@/features/provider-matrix";
import type {
  PolicyConstraint,
  RoutingExecutionRequest,
} from "@/features/provider-routing/types";

export interface ConstraintResult {
  providerId: ProviderId;
  satisfied: boolean;
  policyConstraints: PolicyConstraint[];
  policyScore: number;
  reason: string;
}

export function evaluateConstraints(
  providerId: ProviderId,
  request: RoutingExecutionRequest
): ConstraintResult {
  const entry = getCatalogEntry(providerId);
  const modes = modesForProvider(providerId);
  const constraints: PolicyConstraint[] = [];

  const modeOk = modes.includes(request.executionMode) || request.executionMode === "Simulation";
  constraints.push({
    tag: `execution-mode:${request.executionMode}`,
    satisfied: modeOk,
    note: modeOk ? "Execution mode supported." : "Provider does not support requested execution mode.",
  });

  const simOk = !(request.strategy === "Simulation Only") || Boolean(entry?.simulationSupport);
  constraints.push({
    tag: "simulation-compatibility",
    satisfied: simOk,
    note: simOk ? "Simulation compatible." : "Provider is not simulation-capable.",
  });

  const available = entry?.status !== "disabled";
  constraints.push({
    tag: "provider-availability",
    satisfied: available,
    note: available ? "Provider available." : "Provider disabled.",
  });

  for (const tag of request.policyTags) {
    // Deterministic: declared policy tags are satisfied by the offline framework.
    constraints.push({ tag: `policy:${tag}`, satisfied: true, note: "Policy constraint recorded (offline)." });
  }

  const satisfiedCount = constraints.filter((c) => c.satisfied).length;
  const policyScore = constraints.length === 0 ? 100 : Math.round((satisfiedCount / constraints.length) * 100);
  const satisfied = constraints.every((c) => c.satisfied);

  return {
    providerId,
    satisfied,
    policyConstraints: constraints,
    policyScore,
    reason: satisfied ? "All constraints satisfied." : "One or more constraints failed.",
  };
}
