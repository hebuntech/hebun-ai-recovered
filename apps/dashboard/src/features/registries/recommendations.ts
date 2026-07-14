import { registryDefinitions } from "@/features/registries/definitions";
import type { RegistryKey } from "@/features/registries/types";

function registryById(registryId: RegistryKey) {
  return registryDefinitions.find((registry) => registry.id === registryId);
}

export interface RegistryRecommendation {
  id: string;
  title: string;
  detail: string;
  action: string;
  priority: "critical" | "high" | "medium" | "low";
  owner: string;
  registryIds: RegistryKey[];
}

export const registryOverviewRecommendations: RegistryRecommendation[] = [
  {
    id: "rec-ov-1",
    title: "Prioritize assurance hardening for Experience and Learning",
    detail:
      "Those registries are central to the quality of Registry Intelligence outputs and are currently the clearest weak point in the learning-to-governance chain.",
    action: "Raise validation and coverage targets before expanding recommendation volume.",
    priority: "high",
    owner: "Director",
    registryIds: ["experience", "learning"],
  },
  {
    id: "rec-ov-2",
    title: "Add director watch rules for high-growth registries",
    detail:
      "Execution and Event registries are the fastest-moving operational record surfaces and should be monitored for abnormal growth, freshness decay, and consistency drift.",
    action: "Create daily watch thresholds for Executions, Events, and Governance synchronization.",
    priority: "high",
    owner: "Execution Core",
    registryIds: ["executions", "events", "governance"],
  },
  {
    id: "rec-ov-3",
    title: "Reduce legacy record drag in registry detail surfaces",
    detail:
      "Several registries carry a mix of archived and deprecated records that dilute attention and complicate lifecycle clarity.",
    action: "Introduce scheduled record curation passes for registries with legacy concentration.",
    priority: "medium",
    owner: "Director",
    registryIds: ["agents", "experience", "risk"],
  },
];

export function recommendationsForRegistry(
  registryId: RegistryKey
): RegistryRecommendation[] {
  const registry = registryById(registryId);
  if (!registry) return [];

  const recommendations: RegistryRecommendation[] = [];

  if (registry.health < 95) {
    recommendations.push({
      id: `rec-${registryId}-1`,
      title: `Tighten ${registry.title} operating thresholds`,
      detail: `${registry.title} is below the strongest health band and should be treated as an active operating concern rather than a passive registry.`,
      action: `Assign a short-cycle owner review to lift health, consistency, and validation above 95.`,
      priority: registry.health < 90 ? "critical" : "high",
      owner: registry.owner,
      registryIds: [registryId],
    });
  }

  if (registry.dailyGrowth >= 10) {
    recommendations.push({
      id: `rec-${registryId}-2`,
      title: `Install growth watch rules for ${registry.shortLabel}`,
      detail: `${registry.title} is growing quickly enough that record quality and freshness can drift before manual review catches it.`,
      action: `Track daily growth, stale-record counts, and validation lag as director-level alerts.`,
      priority: registry.dailyGrowth >= 100 ? "high" : "medium",
      owner: registry.owner,
      registryIds: [registryId],
    });
  }

  if (registry.coverage < 95 || registry.validation < 95) {
    recommendations.push({
      id: `rec-${registryId}-3`,
      title: `Increase assurance density in ${registry.shortLabel}`,
      detail: `Coverage and validation are not yet keeping up with the registry’s operational importance.`,
      action: `Expand record-level validation and owner review for this registry before adding new consumers.`,
      priority: "high",
      owner: registry.owner,
      registryIds: [registryId],
    });
  }

  if (!recommendations.length) {
    recommendations.push({
      id: `rec-${registryId}-4`,
      title: `${registry.title} can be used as a reference registry`,
      detail: `${registry.title} is currently healthy enough to serve as a stable dependency for new dashboard intelligence and operating workflows.`,
      action: `Keep current thresholds and use this registry as a benchmark for weaker registries.`,
      priority: "low",
      owner: registry.owner,
      registryIds: [registryId],
    });
  }

  return recommendations;
}
