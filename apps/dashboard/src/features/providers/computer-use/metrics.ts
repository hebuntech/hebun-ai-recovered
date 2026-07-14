import type { BadgeVariant } from "@/components/ui/badge";
import { runConformance } from "@/features/provider-framework/provider-conformance";
import { computerUseCapabilityMappings } from "@/features/providers/computer-use/capabilities";
import { computerUseConfig } from "@/features/providers/computer-use/config";
import { computerUseProviderHealth } from "@/features/providers/computer-use/health";
import { computerUseProvider } from "@/features/providers/computer-use/provider";
import type { ComputerUseMetrics } from "@/features/providers/computer-use/types";

const conformanceScore = runConformance(computerUseProvider).score;
const capabilityCoverage = computerUseCapabilityMappings.length;

const healthBadge: BadgeVariant =
  conformanceScore >= 90 ? "success" : conformanceScore >= 75 ? "warning" : "error";

export const computerUseMetrics: ComputerUseMetrics = {
  status: "simulation",
  simulationMode: true,
  capabilityCoverage,
  conformanceScore,
  credentialStatus: computerUseConfig.credentialStatus,
  healthStatus: computerUseProviderHealth.status,
  safetyStatus: "Approval Gated",
  simulationReadiness: "Ready",
  healthBadge,
};
