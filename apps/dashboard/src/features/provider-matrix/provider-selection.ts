import { routingFor } from "@/features/provider-matrix/provider-routing";
import type {
  MatrixCapability,
  ProviderSelectionResult,
} from "@/features/provider-matrix/types";

export function selectProvider(
  capability: MatrixCapability
): ProviderSelectionResult {
  const route = routingFor(capability);
  const primary = route?.primary ?? null;
  return {
    capability,
    primary,
    fallbacks: route?.secondary ?? [],
    requiresHumanApproval: route?.requiresHumanApproval ?? false,
    selectedProvider: primary,
    note: route?.note ?? `No provider route is defined for ${capability}.`,
  };
}
