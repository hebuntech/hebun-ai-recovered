import { registryDefinitions } from "@/features/registries/definitions";
import { registryRecords } from "@/features/registries/records";
import { registryRelationships } from "@/features/registries/relationships";
import type { RegistryKey } from "@/features/registries/types";
import type { EventSeverity } from "@/types";

function registryById(registryId: RegistryKey) {
  return registryDefinitions.find((registry) => registry.id === registryId);
}

export interface RegistryRiskSignal {
  id: string;
  title: string;
  detail: string;
  severity: EventSeverity;
  owner: string;
  registryIds: RegistryKey[];
  trigger: string;
}

export const registryOverviewRiskSignals: RegistryRiskSignal[] = [
  {
    id: "risk-ov-1",
    title: "Execution growth can outrun governance traceability",
    detail:
      "Execution and Event registries are expanding fastest. If governance-linked records are not refreshed at the same cadence, director trust in operational history will degrade.",
    severity: "warning",
    owner: "Execution Core",
    registryIds: ["executions", "events", "governance"],
    trigger: "High daily record growth",
  },
  {
    id: "risk-ov-2",
    title: "Learning quality is exposed to experience coverage drift",
    detail:
      "Experience and Learning both sit below the strongest assurance band, creating a risk that recommendations are well-indexed but under-explained.",
    severity: "warning",
    owner: "Learning Engine",
    registryIds: ["experience", "learning"],
    trigger: "Coverage and validation below target band",
  },
  {
    id: "risk-ov-3",
    title: "Cross-registry dependency failure would hit multiple director surfaces",
    detail:
      "The Goal → Plan → Execution → Experience → Learning → Governance chain is tightly coupled. A quality break in the middle of the chain will affect multiple executive views at once.",
    severity: "error",
    owner: "Director",
    registryIds: ["goals", "plans", "executions", "experience", "learning", "governance"],
    trigger: "High-value dependency chain concentration",
  },
];

export function riskSignalsForRegistry(registryId: RegistryKey): RegistryRiskSignal[] {
  const registry = registryById(registryId);
  if (!registry) return [];

  const deprecated = registryRecords[registryId].filter(
    (record) => record.status === "deprecated"
  ).length;
  const archived = registryRecords[registryId].filter(
    (record) => record.status === "archived"
  ).length;
  const related = registryRelationships.filter(
    (edge) => edge.from === registryId || edge.to === registryId
  );

  const signals: RegistryRiskSignal[] = [];

  if (registry.dailyGrowth >= 10) {
    signals.push({
      id: `risk-${registryId}-1`,
      title: `${registry.title} is accumulating records rapidly`,
      detail: `Daily growth is +${registry.dailyGrowth}, so freshness and consistency issues here will compound faster than in lower-growth registries.`,
      severity: registry.dailyGrowth >= 100 ? "error" : "warning",
      owner: registry.owner,
      registryIds: [registryId],
      trigger: "Growth threshold exceeded",
    });
  }

  if (registry.coverage < 95 || registry.validation < 95) {
    signals.push({
      id: `risk-${registryId}-2`,
      title: `${registry.title} has assurance gaps`,
      detail: `Coverage (${registry.coverage}%) and validation (${registry.validation}%) are below the strongest operating band, which increases the chance of silent registry drift.`,
      severity: registry.coverage < 90 || registry.validation < 90 ? "error" : "warning",
      owner: registry.owner,
      registryIds: [registryId],
      trigger: "Coverage / validation threshold",
    });
  }

  if (deprecated > 0 || archived > registry.activeRecords / 2) {
    signals.push({
      id: `risk-${registryId}-3`,
      title: `${registry.title} carries legacy record pressure`,
      detail: `${deprecated} deprecated and ${archived} archived records suggest this registry may need curation, clearer lifecycle policy, or partitioning.`,
      severity: deprecated > 0 ? "warning" : "info",
      owner: registry.owner,
      registryIds: [registryId],
      trigger: "Legacy record concentration",
    });
  }

  if (related.length >= 3) {
    signals.push({
      id: `risk-${registryId}-4`,
      title: `${registry.title} is a dependency concentration point`,
      detail: `${registry.title} participates in ${related.length} mapped relationships, so an upstream quality issue will propagate across multiple registries and director views.`,
      severity: "warning",
      owner: registry.owner,
      registryIds: [registryId],
      trigger: "Relationship concentration",
    });
  }

  return signals;
}
