/*
 * provider-queries.ts — read-only query helpers over the provider matrix.
 * Deterministic lookups only; no side effects, no runtime routing.
 */

import { getCatalogEntry, providerCatalog } from "@/features/provider-matrix/provider-catalog";
import { capabilityMatrix, providersFor } from "@/features/provider-matrix/capability-matrix";
import { routingFor, routingRules } from "@/features/provider-matrix/provider-routing";
import { selectProvider } from "@/features/provider-matrix/provider-selection";
import { providerMatrix } from "@/features/provider-matrix/provider-matrix";
import type { MatrixCapability, ProviderId } from "@/features/provider-matrix/types";

export function getProviderMatrix() {
  return providerMatrix;
}

export function getProviderCatalog() {
  return providerCatalog;
}

export function getCapabilityMatrix() {
  return capabilityMatrix;
}

export function getProvider(id: ProviderId) {
  return getCatalogEntry(id);
}

export function getRoutingRules() {
  return routingRules;
}

export function getRoutingRule(capability: MatrixCapability) {
  return routingFor(capability);
}

export function primaryProviderFor(capability: MatrixCapability): ProviderId | null {
  return providersFor(capability, "primary")[0] ?? null;
}

export function resolveProvider(capability: MatrixCapability) {
  return selectProvider(capability);
}
