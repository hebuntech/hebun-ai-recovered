import type { BadgeVariant } from "@/components/ui/badge";
import { runConformance } from "@/features/provider-framework/provider-conformance";
import { communicationCapabilityMappings } from "@/features/providers/communication/capabilities";
import { communicationConfig } from "@/features/providers/communication/config";
import { communicationProviderHealth } from "@/features/providers/communication/health";
import { communicationProvider } from "@/features/providers/communication/provider";
import type { CommunicationMetrics } from "@/features/providers/communication/types";

const conformanceScore = runConformance(communicationProvider).score;
const capabilityCoverage = communicationCapabilityMappings.length;

const healthBadge: BadgeVariant =
  conformanceScore >= 90 ? "success" : conformanceScore >= 75 ? "warning" : "error";

export const communicationMetrics: CommunicationMetrics = {
  status: "simulation",
  simulationMode: true,
  capabilityCoverage,
  conformanceScore,
  credentialStatus: communicationConfig.credentialStatus,
  healthStatus: communicationProviderHealth.status,
  safetyStatus: "Approval Gated",
  healthBadge,
};
