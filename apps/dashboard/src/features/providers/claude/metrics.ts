import type { BadgeVariant } from "@/components/ui/badge";
import { runConformance } from "@/features/provider-framework/provider-conformance";
import { claudeCapabilityMappings } from "@/features/providers/claude/capabilities";
import { claudeConfig } from "@/features/providers/claude/config";
import { claudeProvider } from "@/features/providers/claude/provider";
import type { ClaudeMetrics } from "@/features/providers/claude/types";

const conformanceScore = runConformance(claudeProvider).score;
const capabilityCoverage = claudeCapabilityMappings.length;

const healthBadge: BadgeVariant =
  conformanceScore >= 90 ? "success" : conformanceScore >= 75 ? "warning" : "error";

export const claudeMetrics: ClaudeMetrics = {
  status: "simulation",
  simulationMode: true,
  capabilityCoverage,
  conformanceScore,
  credentialStatus: claudeConfig.credentialStatus,
  healthBadge,
};
