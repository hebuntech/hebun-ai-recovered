/*
 * provider-routing.ts — deterministic routing rules derived from the capability
 * matrix. For each capability the primary owner routes first, secondary owners
 * are fallbacks. Human-approval capabilities are flagged so the Orchestrator
 * pairs them with Policy. No runtime routing happens here — this is a static
 * routing table only.
 */

import {
  MATRIX_CAPABILITIES,
  PROVIDER_NAMES,
  providersFor,
} from "@/features/provider-matrix/capability-matrix";
import type { MatrixCapability, ProviderId, RoutingRule } from "@/features/provider-matrix/types";

/** Capabilities that must be paired with Human Approval + Policy when routed. */
const approvalGated: MatrixCapability[] = ["Human Approval", "Desktop", "Communication"];

function routeNote(capability: MatrixCapability, primary: ProviderId | null, secondary: ProviderId[]): string {
  if (!primary) return `No provider owns ${capability} — future provider required.`;
  const fallback = secondary.length
    ? ` Fallback: ${secondary.map((s) => PROVIDER_NAMES[s]).join(", ")}.`
    : " No fallback provider.";
  return `${capability} → ${PROVIDER_NAMES[primary]} primary.${fallback}`;
}

export const routingRules: RoutingRule[] = MATRIX_CAPABILITIES.map((capability) => {
  const primary = providersFor(capability, "primary")[0] ?? null;
  const secondary = providersFor(capability, "secondary");
  return {
    capability,
    primary,
    secondary,
    requiresHumanApproval: approvalGated.includes(capability),
    note: routeNote(capability, primary, secondary),
  } satisfies RoutingRule;
});

export function routingFor(capability: MatrixCapability): RoutingRule | undefined {
  return routingRules.find((r) => r.capability === capability);
}
