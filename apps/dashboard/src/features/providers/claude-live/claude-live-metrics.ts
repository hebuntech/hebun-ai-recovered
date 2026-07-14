import type { BadgeVariant } from "@/components/ui/badge";
import { claudeLiveRecord } from "@/features/providers/claude-live/claude-live-adapter";
import type { ClaudeLiveMetrics } from "@/features/providers/claude-live/types";

const healthScore = claudeLiveRecord.eligibility.liveEligible ? 82 : 68;
const healthBadge: BadgeVariant = healthScore >= 85 ? "success" : healthScore >= 65 ? "warning" : "error";

export const claudeLiveMetrics: ClaudeLiveMetrics = {
  mode: claudeLiveRecord.eligibility.mode,
  supportedCapability: claudeLiveRecord.capability,
  liveEligible: claudeLiveRecord.eligibility.liveEligible,
  credentialStatus: claudeLiveRecord.eligibility.credentialStatus,
  dryRunStatus: claudeLiveRecord.dryRun.status,
  simulationFallback: claudeLiveRecord.simulationFallback.prepared,
  healthScore,
  healthBadge,
};
