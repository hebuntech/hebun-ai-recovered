import { registryDefinitions } from "@/features/registries/definitions";
import { registryOverviewMetrics } from "@/features/registries/metrics";
import { registryRelationships } from "@/features/registries/relationships";
import type { RegistryDefinition, RegistryKey } from "@/features/registries/types";

export type RegistryAttentionLevel = "healthy" | "watch" | "critical";

export interface RegistryHealthInterpretation {
  id: string;
  registryIds: RegistryKey[];
  title: string;
  summary: string;
  attention: RegistryAttentionLevel;
  owner: string;
  reasons: string[];
}

function attentionFromRegistry(
  registry: RegistryDefinition
): RegistryAttentionLevel {
  if (
    registry.health < 90 ||
    registry.validation < 90 ||
    registry.consistency < 90
  ) {
    return "critical";
  }
  if (
    registry.status !== "healthy" ||
    registry.coverage < 92 ||
    registry.synchronization < 95
  ) {
    return "watch";
  }
  return "healthy";
}

export function interpretRegistryHealth(
  registry: RegistryDefinition
): RegistryHealthInterpretation {
  const attention = attentionFromRegistry(registry);
  const reasons: string[] = [];

  if (registry.health < 95) reasons.push(`Health score at ${registry.health}`);
  if (registry.validation < 95)
    reasons.push(`Validation coverage at ${registry.validation}%`);
  if (registry.consistency < 95)
    reasons.push(`Consistency score at ${registry.consistency}%`);
  if (registry.coverage < 95) reasons.push(`Coverage at ${registry.coverage}%`);
  if (registry.status !== "healthy")
    reasons.push(`Registry flagged as ${registry.status}`);
  if (!reasons.length) reasons.push("No immediate registry attention signals.");

  const summary =
    attention === "healthy"
      ? `${registry.title} is operating within expected thresholds, with fresh synchronized records and stable consumer coverage.`
      : attention === "watch"
        ? `${registry.title} is stable overall, but emerging drift in ${reasons
            .slice(0, 2)
            .join(" and ")
            .toLowerCase()} should be monitored.`
        : `${registry.title} requires intervention because ${reasons
            .slice(0, 2)
            .join(" and ")
            .toLowerCase()} are below the target operating band.`;

  return {
    id: `health-${registry.id}`,
    registryIds: [registry.id],
    title: `${registry.title} Interpretation`,
    summary,
    attention,
    owner: registry.owner,
    reasons,
  };
}

export const registryHealthInterpretations = registryDefinitions.map(
  interpretRegistryHealth
);

export function healthInterpretationForRegistry(
  registryId: RegistryKey
): RegistryHealthInterpretation | undefined {
  const registry = registryDefinitions.find((item) => item.id === registryId);
  return registry ? interpretRegistryHealth(registry) : undefined;
}

export const overallRegistryInterpretation: RegistryHealthInterpretation = {
  id: "health-overview",
  registryIds: registryDefinitions.map((registry) => registry.id),
  title: "Registry Health Interpretation Summary",
  summary:
    registryOverviewMetrics.registryHealth >= 94
      ? "The registry layer is broadly healthy: synchronization is strong, record freshness is high, and attention is concentrated in a few high-growth registries rather than across the system."
      : "The registry layer is functional, but multiple registries are showing drift in validation, consistency, or coverage that should be treated as an operating priority.",
  attention:
    registryOverviewMetrics.registryHealth >= 94
      ? "healthy"
      : registryOverviewMetrics.registryHealth >= 91
        ? "watch"
        : "critical",
  owner: "Director",
  reasons: [
    `${registryOverviewMetrics.totalRegistries} registries tracked`,
    `${registryOverviewMetrics.totalRecords} total records under management`,
    `${registryOverviewMetrics.recentChanges} recent changes across the registry layer`,
    `${registryRelationships.length} mapped cross-registry dependencies`,
  ],
};
