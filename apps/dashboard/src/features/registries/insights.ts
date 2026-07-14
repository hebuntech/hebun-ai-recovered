import { registryDefinitions } from "@/features/registries/definitions";
import { registryRelationships } from "@/features/registries/relationships";
import type { RegistryKey } from "@/features/registries/types";

function registryById(registryId: RegistryKey) {
  return registryDefinitions.find((registry) => registry.id === registryId);
}

export interface RegistryInsight {
  id: string;
  title: string;
  detail: string;
  category: "growth" | "relationship" | "health" | "coverage";
  priority: "high" | "medium" | "low";
  registryIds: RegistryKey[];
}

const topGrowth = registryDefinitions
  .slice()
  .sort((a, b) => b.dailyGrowth - a.dailyGrowth)
  .slice(0, 2);

export const registryOverviewInsights: RegistryInsight[] = [
  {
    id: "ins-1",
    title: "Execution and Event registries are driving registry expansion",
    detail: `${topGrowth[0]?.title ?? "Execution Registry"} and ${topGrowth[1]?.title ?? "Event Registry"} account for the largest daily growth, which makes them the best early-warning surfaces for operational drift and storage pressure.`,
    category: "growth",
    priority: "high",
    registryIds: topGrowth.map((registry) => registry.id),
  },
  {
    id: "ins-2",
    title: "Learning and Governance are downstream control points",
    detail:
      "The Goal → Plan → Execution → Experience → Learning → Governance path means a change in execution quality propagates directly into governance quality and director trust.",
    category: "relationship",
    priority: "high",
    registryIds: ["goals", "plans", "executions", "experience", "learning", "governance"],
  },
  {
    id: "ins-3",
    title: "Experience and Learning need tighter coverage tracking",
    detail:
      "Both registries sit below the strongest coverage band, which means organizational learning is growing faster than the assurance layer that explains and validates it.",
    category: "coverage",
    priority: "medium",
    registryIds: ["experience", "learning"],
  },
  {
    id: "ins-4",
    title: "Registry attention is concentrated rather than systemic",
    detail:
      "Most registries remain healthy. The current pressure is localized in growth-heavy or governance-adjacent registries, which is a better operational posture than broad registry degradation.",
    category: "health",
    priority: "low",
    registryIds: ["events", "experience", "learning", "risk"],
  },
];

export function insightsForRegistry(registryId: RegistryKey): RegistryInsight[] {
  const registry = registryById(registryId);
  if (!registry) return [];

  const inbound = registryRelationships.filter((edge) => edge.to === registryId);
  const outbound = registryRelationships.filter((edge) => edge.from === registryId);

  const insights: RegistryInsight[] = [
    {
      id: `ins-${registryId}-1`,
      title: `${registry.title} is a ${registry.dailyGrowth >= 10 ? "high-growth" : "stable"} operational surface`,
      detail:
        registry.dailyGrowth >= 10
          ? `Daily growth is +${registry.dailyGrowth}, which makes ${registry.title} a likely source of storage, freshness, and signal-quality issues before other registries show them.`
          : `Daily growth is +${registry.dailyGrowth}, so the main concern is not scale pressure but maintaining clean relationships, coverage, and freshness.`,
      category: "growth",
      priority: registry.dailyGrowth >= 10 ? "high" : "low",
      registryIds: [registryId],
    },
  ];

  if (outbound.length) {
    insights.push({
      id: `ins-${registryId}-2`,
      title: `${registry.title} feeds downstream operational decisions`,
      detail: `${registry.title} has ${outbound.length} downstream relationship${outbound.length > 1 ? "s" : ""}, so data quality problems here can cascade into ${outbound
        .map((edge) => registryById(edge.to)?.shortLabel ?? edge.to)
        .join(", ")}.`,
      category: "relationship",
      priority: "medium",
      registryIds: [registryId, ...outbound.map((edge) => edge.to)],
    });
  }

  if (inbound.length) {
    insights.push({
      id: `ins-${registryId}-3`,
      title: `${registry.title} depends on upstream registry discipline`,
      detail: `${registry.title} is upstream-dependent on ${inbound
        .map((edge) => registryById(edge.from)?.shortLabel ?? edge.from)
        .join(", ")}, so stale or inconsistent upstream objects will degrade the interpretation quality here.`,
      category: "relationship",
      priority: "medium",
      registryIds: [registryId, ...inbound.map((edge) => edge.from)],
    });
  }

  if (registry.coverage < 95 || registry.validation < 95) {
    insights.push({
      id: `ins-${registryId}-4`,
      title: `${registry.title} needs stronger assurance density`,
      detail: `Coverage (${registry.coverage}%) and validation (${registry.validation}%) are below the strongest tier, suggesting that growth is outpacing governance or operational verification.`,
      category: "coverage",
      priority: "high",
      registryIds: [registryId],
    });
  }

  return insights;
}
