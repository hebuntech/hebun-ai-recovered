/*
 * provider-catalog.ts — registers every existing provider by REFERENCE. Reads
 * each provider's own exported adapter, metrics and health from the providers
 * feature. It does not duplicate or modify any provider definition.
 */

import {
  browserMetrics,
  browserProvider,
  browserProviderHealth,
} from "@/features/providers/browser";
import {
  claudeMetrics,
  claudeProvider,
  claudeProviderHealth,
} from "@/features/providers/claude";
import {
  codexMetrics,
  codexProvider,
  codexProviderHealth,
} from "@/features/providers/codex";
import {
  communicationMetrics,
  communicationProvider,
  communicationProviderHealth,
} from "@/features/providers/communication";
import {
  computerUseMetrics,
  computerUseProvider,
  computerUseProviderHealth,
} from "@/features/providers/computer-use";
import {
  githubMetrics,
  githubProvider,
  githubProviderHealth,
} from "@/features/providers/github";
import {
  capabilitiesBySupport,
  PROVIDER_NAMES,
  PROVIDER_ORDER,
} from "@/features/provider-matrix/capability-matrix";
import { priorityTierFor } from "@/features/provider-matrix/provider-priority";
import type {
  ExecutionModeKind,
  ProviderCatalogEntry,
  ProviderId,
} from "@/features/provider-matrix/types";

/* Reference bundles per provider — adapter + metrics + health, no duplication. */
const sources = {
  claude: { provider: claudeProvider, metrics: claudeMetrics, health: claudeProviderHealth },
  codex: { provider: codexProvider, metrics: codexMetrics, health: codexProviderHealth },
  github: { provider: githubProvider, metrics: githubMetrics, health: githubProviderHealth },
  browser: { provider: browserProvider, metrics: browserMetrics, health: browserProviderHealth },
  "computer-use": {
    provider: computerUseProvider,
    metrics: computerUseMetrics,
    health: computerUseProviderHealth,
  },
  communication: {
    provider: communicationProvider,
    metrics: communicationMetrics,
    health: communicationProviderHealth,
  },
} as const;

/* Primary declared execution mode per provider (all offline / simulation-first). */
const primaryExecutionMode: Record<ProviderId, ExecutionModeKind> = {
  claude: "Planning Only",
  codex: "Dry Run",
  github: "Read Only",
  browser: "Read Only",
  "computer-use": "Approval Required",
  communication: "Approval Required",
};

export const providerCatalog: ProviderCatalogEntry[] = PROVIDER_ORDER.map((id) => {
  const src = sources[id];
  return {
    id,
    name: PROVIDER_NAMES[id],
    family: src.provider.metadata.vendor,
    providerType: src.provider.providerType,
    status: src.metrics.status,
    executionMode: primaryExecutionMode[id],
    simulationSupport: src.provider.simulationSupport,
    liveSupport: false,
    primaryCapabilities: capabilitiesBySupport(id, "primary"),
    secondaryCapabilities: capabilitiesBySupport(id, "secondary"),
    health: src.health,
    conformanceScore: src.metrics.conformanceScore,
    capabilityCoverage: src.metrics.capabilityCoverage,
    credentialStatus: src.metrics.credentialStatus,
    priority: priorityTierFor(id),
  };
});

export function getCatalogEntry(id: ProviderId): ProviderCatalogEntry | undefined {
  return providerCatalog.find((entry) => entry.id === id);
}
