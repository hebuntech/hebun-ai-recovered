import type { BadgeVariant } from "@/components/ui/badge";
import { runConformance } from "@/features/provider-framework/provider-conformance";
import { browserCapabilityMappings } from "@/features/providers/browser/capabilities";
import { browserConfig } from "@/features/providers/browser/config";
import { browserProviderHealth } from "@/features/providers/browser/health";
import { browserProvider } from "@/features/providers/browser/provider";
import type { BrowserMetrics } from "@/features/providers/browser/types";

const conformanceScore = runConformance(browserProvider).score;
const capabilityCoverage = browserCapabilityMappings.length;

const healthBadge: BadgeVariant =
  conformanceScore >= 90 ? "success" : conformanceScore >= 75 ? "warning" : "error";

export const browserMetrics: BrowserMetrics = {
  status: "simulation",
  simulationMode: true,
  capabilityCoverage,
  conformanceScore,
  credentialStatus: browserConfig.credentialStatus,
  healthStatus: browserProviderHealth.status,
  simulationReadiness: "Ready",
  healthBadge,
};
