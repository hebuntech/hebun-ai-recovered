import type { BadgeVariant } from "@/components/ui/badge";
import { runConformance } from "@/features/provider-framework/provider-conformance";
import { codexCapabilityMappings } from "@/features/providers/codex/capabilities";
import { codexConfig } from "@/features/providers/codex/config";
import { codexProvider } from "@/features/providers/codex/provider";
import type { CodexMetrics } from "@/features/providers/codex/types";

const conformanceScore = runConformance(codexProvider).score;
const capabilityCoverage = codexCapabilityMappings.length;

const healthBadge: BadgeVariant =
  conformanceScore >= 90 ? "success" : conformanceScore >= 75 ? "warning" : "error";

export const codexMetrics: CodexMetrics = {
  status: "simulation",
  simulationMode: true,
  capabilityCoverage,
  conformanceScore,
  credentialStatus: codexConfig.credentialStatus,
  healthBadge,
};
