import type { BadgeVariant } from "@/components/ui/badge";
import { runConformance } from "@/features/provider-framework/provider-conformance";
import { githubCapabilityMappings } from "@/features/providers/github/capabilities";
import { githubConfig } from "@/features/providers/github/config";
import { githubProvider } from "@/features/providers/github/provider";
import type { GitHubMetrics } from "@/features/providers/github/types";

const conformanceScore = runConformance(githubProvider).score;
const capabilityCoverage = githubCapabilityMappings.length;

const healthBadge: BadgeVariant =
  conformanceScore >= 90 ? "success" : conformanceScore >= 75 ? "warning" : "error";

export const githubMetrics: GitHubMetrics = {
  status: "simulation",
  simulationMode: true,
  capabilityCoverage,
  conformanceScore,
  credentialStatus: githubConfig.credentialStatus,
  healthBadge,
};
