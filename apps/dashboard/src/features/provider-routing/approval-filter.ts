/*
 * approval-filter.ts — deterministic human-approval requirement resolution.
 * Approval is required when the request asks for it, uses a human-first
 * strategy, or targets an approval-gated capability (Human Approval, Desktop,
 * Communication) per the routing table.
 */

import { routingFor } from "@/features/provider-matrix";
import type { MatrixCapability } from "@/features/provider-matrix";
import type {
  ApprovalRequirement,
  RoutingExecutionRequest,
} from "@/features/provider-routing/types";

export function resolveApproval(request: RoutingExecutionRequest): ApprovalRequirement {
  const gatedCapability = request.requiredCapabilities.find(
    (cap: MatrixCapability) => routingFor(cap)?.requiresHumanApproval
  );

  if (request.strategy === "Human First") {
    return { required: true, reason: "Human First strategy escalates before provider selection.", escalationTier: "Human Escalation" };
  }
  if (request.requiresApproval) {
    return { required: true, reason: "Request explicitly requires human approval.", escalationTier: "Human Escalation" };
  }
  if (gatedCapability) {
    return {
      required: true,
      reason: `Capability "${gatedCapability}" is approval-gated by Policy.`,
      escalationTier: "Human Escalation",
    };
  }
  return { required: false, reason: "No human approval required.", escalationTier: "Secondary" };
}
