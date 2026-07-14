import type { BadgeVariant } from "@/components/ui/badge";
import { activationDecisions } from "@/features/runtime-activation/activation-engine";
import type { ActivationMetrics } from "@/features/runtime-activation/types";

const total = activationDecisions.length;
const blockedCount = activationDecisions.filter((decision) => decision.blocked).length;
const liveReadyCount = activationDecisions.filter((decision) => decision.activationLevel === "Ready For Live").length;
const simulationCount = activationDecisions.filter((decision) => decision.activationLevel === "Simulation").length;
const approvalPendingCount = activationDecisions.filter((decision) => decision.approvalStatus === "Pending").length;
const averageReadiness =
  total === 0 ? 0 : Math.round(activationDecisions.reduce((sum, decision) => sum + decision.readinessScore, 0) / total);
const activationHealth = total === 0 ? 0 : Math.round(((total - blockedCount) / total) * 100);
const badge: BadgeVariant = activationHealth >= 90 ? "success" : activationHealth >= 70 ? "warning" : "error";

export const activationMetrics: ActivationMetrics = {
  totalDecisions: total,
  activationHealth,
  simulationCount,
  liveReadyCount,
  blockedCount,
  approvalPendingCount,
  averageReadiness,
  badge,
};
